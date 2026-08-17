import { calcularSaldo } from "./saldosControleVagas";
import { recalcularPosicoes } from "./distribuicaoIndividual";
import type { ControleVagasState } from "./controleVagasStore";
import type {
  OcupacaoVaga,
  SaldoControleVagasGrupo,
  SituacaoLegalVaga,
  Vaga,
} from "./types";

export interface DashboardFiltros {
  dataReferencia: string;
  orgao: string[];
  tipo: string[];
  carreira: string[];
  cargo: string[];
  situacaoLegal: string[];
}

export interface DashboardGrupo {
  chave: string;
  quadroCodigo: string;
  carreira: string;
  cargo: string;
  orgao: string;
  distribuicao: string;
  tipo: string;
  lei: string;
  vagasLegais: number;
  ocupadas: number;
  disponiveis: number;
  disponiveisLivres: number;
  disponiveisComprometidas: number;
  ocupadasEmDisponibilizacao: number;
  emExtincao: number;
  judiciais: number;
  divergentes: number;
  percentualOcupacao: number;
  ocupacoes: OcupacaoVaga[];
}

const iso = (valor: string) =>
  /^\d{4}-\d{2}-\d{2}/.test(valor)
    ? valor.slice(0, 10)
    : valor.slice(0, 10).split("/").reverse().join("-");

function vagaNaData(vaga: Vaga, data: string): Vaga | null {
  if (iso(vaga.criadaEm) > data && iso(vaga.inicioVigencia) > data) return null;

  const eventos = [...vaga.historico]
    .filter((item) => iso(item.dataEfeito) <= data)
    .sort((a, b) => iso(a.dataEfeito).localeCompare(iso(b.dataEfeito)));

  let estado = vaga.estado;
  let situacaoLegal = vaga.situacaoLegal;
  if (data < "2026-07-16") {
    estado = "DISPONIVEL";
    situacaoLegal = "REGULAR";
    eventos.forEach((item) => {
      if (item.estadoPosterior) estado = item.estadoPosterior;
      if (item.situacaoLegalPosterior) situacaoLegal = item.situacaoLegalPosterior;
    });
  }

  return { ...vaga, estado, situacaoLegal };
}

export function construirDashboard(
  state: ControleVagasState,
  filtros: DashboardFiltros,
) {
  const posicoes = recalcularPosicoes(
    state.vagas,
    state.movimentos,
    filtros.dataReferencia,
  );
  const distribuicoes = new Map(
    posicoes.map((item) => [
      item.vagaId,
      item.orgaoDistribuicao ?? "Pendente de ato de distribuicao",
    ]),
  );
  const ocupacoes = state.ocupacoes
    .filter(
      (item) =>
        iso(item.efetivoExercicioEm) <= filtros.dataReferencia &&
        (!item.encerradaEm || iso(item.encerradaEm) > filtros.dataReferencia),
    )
    .map((item) => ({ ...item, situacao: "ATIVA" as const }));
  const comprometimentos = state.comprometimentos
    .filter(
      (item) =>
        iso(item.criadoEm) <= filtros.dataReferencia &&
        (!item.concluidoEm || iso(item.concluidoEm) > filtros.dataReferencia) &&
        item.situacao !== "CANCELADO",
    )
    .map((item) => ({ ...item, situacao: "ATIVO" as const }));

  const vagas = state.vagas
    .map((item) => vagaNaData(item, filtros.dataReferencia))
    .filter((item): item is Vaga => Boolean(item))
    .filter(
      (vaga) =>
        (!filtros.orgao.length || filtros.orgao.includes(distribuicoes.get(vaga.id) ?? "")) &&
        (!filtros.tipo.length || filtros.tipo.includes(vaga.tipo)) &&
        (!filtros.carreira.length || filtros.carreira.includes(vaga.carreira)) &&
        (!filtros.cargo.length || filtros.cargo.includes(vaga.cargo)) &&
        (!filtros.situacaoLegal.length || filtros.situacaoLegal.includes(vaga.situacaoLegal)),
    );
  const excecoes = state.excecoesJudiciais.filter(
    (item) =>
      item.situacao === "ATIVA" &&
      iso(item.inicio) <= filtros.dataReferencia &&
      (!filtros.orgao.length || filtros.orgao.includes(item.orgao)) &&
      (!filtros.cargo.length || filtros.cargo.includes(item.cargo)),
  );

  const vagasPorQuadro = new Map<string, Vaga[]>();
  vagas.forEach((vaga) => {
    const orgaoAtual = distribuicoes.get(vaga.id) ?? "Pendente de ato de distribuicao";
    const chave = `${vaga.quadroCodigo}|${orgaoAtual}|${vaga.tipo}`;
    vagasPorQuadro.set(chave, [...(vagasPorQuadro.get(chave) ?? []), vaga]);
  });

  const saldos: SaldoControleVagasGrupo[] = [...vagasPorQuadro.entries()].map(
    ([chave, itens]) => ({
      chave,
      cargo: itens[0].cargo,
      orgaoTitular:
        distribuicoes.get(itens[0].id) ?? "Pendente de ato de distribuicao",
      tipo: itens[0].tipo,
      totalFisico: itens.length,
      ...calcularSaldo(itens, comprometimentos, ocupacoes, excecoes),
    }),
  );

  const grupos: DashboardGrupo[] = saldos.map((saldo) => {
    const itens = vagasPorQuadro.get(saldo.chave) ?? [];
    const quadro = state.quadros.find((item) => item.codigo === itens[0]?.quadroCodigo);
    const ocupacoesGrupo = ocupacoes.filter((item) =>
      itens.some((vaga) => vaga.id === item.vagaId),
    );
    const percentualOcupacao = saldo.vagasLegais
      ? Math.round((saldo.ocupadas / saldo.vagasLegais) * 100)
      : 0;
    const destinos = [
      ...new Set(
        itens.map(
          (vaga) => distribuicoes.get(vaga.id) ?? "Pendente de ato de distribuicao",
        ),
      ),
    ];
    const distribuicao =
      destinos.length <= 2 ? destinos.join(" | ") : `${destinos.length} destinos`;

    return {
      chave: saldo.chave,
      quadroCodigo: itens[0]?.quadroCodigo ?? "-",
      carreira: itens[0]?.carreira ?? quadro?.carreira ?? "-",
      cargo: saldo.cargo,
      orgao: saldo.orgaoTitular,
      distribuicao,
      tipo: saldo.tipo,
      lei: itens[0]?.lei ?? quadro?.ato ?? "-",
      vagasLegais: saldo.vagasLegais,
      ocupadas: saldo.ocupadas,
      disponiveis: saldo.disponiveis,
      disponiveisLivres: saldo.disponiveisLivres,
      disponiveisComprometidas: saldo.disponiveisComprometidas,
      ocupadasEmDisponibilizacao: saldo.ocupadasEmDisponibilizacao,
      emExtincao: saldo.emExtincao,
      judiciais: saldo.excedentesJudiciais,
      divergentes: saldo.divergentes,
      percentualOcupacao,
      ocupacoes: ocupacoesGrupo,
    };
  });

  grupos.sort(
    (a, b) =>
      Number(a.disponiveisLivres > 0) - Number(b.disponiveisLivres > 0) ||
      a.disponiveisLivres - b.disponiveisLivres ||
      b.percentualOcupacao - a.percentualOcupacao ||
      a.cargo.localeCompare(b.cargo),
  );

  const total = (campo: keyof DashboardGrupo) =>
    grupos.reduce(
      (soma, item) =>
        soma + (typeof item[campo] === "number" ? (item[campo] as number) : 0),
      0,
    );
  const vagasLegais = vagas.filter((vaga) => vaga.situacaoLegal !== "EXTINTA");
  const vagasNaoDistribuidas = vagas.filter(
    (vaga) =>
      (distribuicoes.get(vaga.id) ?? "Pendente de ato de distribuicao") ===
      "Pendente de ato de distribuicao",
  );

  return {
    grupos,
    vagas,
    ocupacoes,
    excecoes,
    resumo: {
      cargos: new Set(vagasLegais.map((vaga) => vaga.cargo)).size,
      quadros: new Set(vagasLegais.map((vaga) => vaga.quadroCodigo)).size,
      distribuidas: vagas.length - vagasNaoDistribuidas.length,
      naoDistribuidas: vagasNaoDistribuidas.length,
      disponiveisNaoDistribuidas: vagasNaoDistribuidas.filter(
        (vaga) => vaga.estado === "DISPONIVEL",
      ).length,
      situacoesLegaisEspeciais: vagas.filter(
        (vaga) => vaga.situacaoLegal !== "REGULAR",
      ).length,
      vagasLegais: total("vagasLegais"),
      ocupadas: total("ocupadas"),
      disponiveis: total("disponiveis"),
      livres: total("disponiveisLivres"),
      comprometidas: total("disponiveisComprometidas"),
      emDisponibilizacao: total("ocupadasEmDisponibilizacao"),
      emExtincao: total("emExtincao"),
      judiciais: total("judiciais"),
      divergentes: total("divergentes"),
    },
  };
}

export const situacoesLegais: SituacaoLegalVaga[] = [
  "REGULAR",
  "EM_EXTINCAO",
  "EXTINTA",
  "EM_TRANSFORMACAO",
];
