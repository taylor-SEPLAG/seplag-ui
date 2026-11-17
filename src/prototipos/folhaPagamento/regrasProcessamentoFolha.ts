import { normalizarCriteriosDaFolha } from "./abrangenciaFolhaPagamento";
import {
  normalizarChaveAbrangencia,
  type CatalogoAbrangencia,
  type CriteriosAbrangencia,
  type OpcaoAbrangencia,
} from "./abrangenciaGrupoCalculo";
import type {
  ExecutarFolhaPagamentoRequest,
  FolhaPagamentoForm,
  ProcessamentoFolhaForm,
} from "./types";

export const camposProcessamento = {
  regimes: "regimesJuridicos",
  tipos: "tiposVinculo",
  orgaos: "orgaos",
  unidades: "unidades",
  carreiras: "carreiras",
  cargos: "cargos",
} as const;
export const criteriosProcessamento = Object.keys(
  camposProcessamento,
) as (keyof CriteriosAbrangencia)[];
export type TipoProcessamento = "TOTAL" | "PARCIAL";
export const valoresProcessamento = (
  criterios: CriteriosAbrangencia,
): Partial<ProcessamentoFolhaForm> =>
  Object.fromEntries(
    criteriosProcessamento.map((c) => [
      camposProcessamento[c],
      [...criterios[c]],
    ]),
  );
export const criteriosDoProcessamento = (
  dados: ProcessamentoFolhaForm,
  catalogo: CatalogoAbrangencia,
) =>
  normalizarCriteriosDaFolha(
    {
      abrangenciaRegimeJuridico: dados.regimesJuridicos,
      abrangenciaTipoVinculo: dados.tiposVinculo,
      orgaos: dados.orgaos,
      abrangenciaUnidades: dados.unidades,
      abrangenciaCarreiras: dados.carreiras,
      abrangenciaCargos: dados.cargos,
    },
    catalogo,
  );
const iguais = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v) => b.includes(v));
const corresponde = (selecionados: string[], valor: string | null) =>
  !selecionados.length || (valor !== null && selecionados.includes(valor));
const mesmo = (a: string, b: string) =>
  normalizarChaveAbrangencia(a) === normalizarChaveAbrangencia(b);

// Tuplas mantêm a associação regime/tipo/cargo/carreira do cadastro. Órgãos e unidades
// são consultados pelas suas relações, sem gerar um produto cartesiano do catálogo.
function consultaCompatibilidade(catalogo: CatalogoAbrangencia) {
  type Tupla = {
    regime: string | null;
    tipo: string | null;
    carreira: string | null;
    cargo: string | null;
  };
  const tuplas: Tupla[] = [];
  for (const tipo of catalogo.tipos) {
    const cargos = catalogo.cargos.filter(
      (c) => !c.tipos.length || c.tipos.includes(tipo.value),
    );
    for (const regime of tipo.regimes.length ? tipo.regimes : [null]) {
      for (const cargo of cargos.length ? cargos : [null]) {
        tuplas.push({
          regime:
            regime === null
              ? null
              : (catalogo.regimes.find(
                  (r) => mesmo(r.value, regime) || mesmo(r.label, regime),
                )?.value ?? regime),
          tipo: tipo.value,
          cargo: cargo?.value ?? null,
          carreira: cargo?.carreirasPorTipo[tipo.value] ?? null,
        });
      }
    }
  }
  for (const cargo of catalogo.cargos.filter((c) => !c.tipos.length))
    tuplas.push({
      regime: null,
      tipo: null,
      carreira: null,
      cargo: cargo.value,
    });
  for (const carreira of catalogo.carreiras.filter(
    (c) => !tuplas.some((t) => t.carreira === c.value),
  ))
    tuplas.push({
      regime: null,
      tipo: null,
      carreira: carreira.value,
      cargo: null,
    });
  for (const regime of catalogo.regimes.filter(
    (r) => !tuplas.some((t) => t.regime === r.value),
  ))
    tuplas.push({
      regime: regime.value,
      tipo: null,
      carreira: null,
      cargo: null,
    });
  tuplas.push({ regime: null, tipo: null, carreira: null, cargo: null });
  return (filtros: CriteriosAbrangencia) =>
    tuplas.some((t) => {
      if (
        !corresponde(filtros.regimes, t.regime) ||
        !corresponde(filtros.tipos, t.tipo) ||
        !corresponde(filtros.carreiras, t.carreira) ||
        !corresponde(filtros.cargos, t.cargo)
      )
        return false;
      const carreira = t.carreira
        ? catalogo.carreiras.find((c) => c.value === t.carreira)
        : undefined;
      if (!catalogo.orgaos.length)
        return !carreira && !filtros.orgaos.length && !filtros.unidades.length;
      return catalogo.orgaos.some(
        (orgao) =>
          corresponde(filtros.orgaos, orgao.value) &&
          (!carreira ||
            carreira.orgaos.some(
              (o) => mesmo(o, orgao.value) || mesmo(o, orgao.label),
            )) &&
          (!filtros.unidades.length ||
            catalogo.unidades.some(
              (u) =>
                filtros.unidades.includes(u.value) &&
                (mesmo(u.orgao, orgao.value) || mesmo(u.orgao, orgao.label)),
            )),
      );
    });
}

export function campoProcessamentoBloqueado(
  campo: keyof CriteriosAbrangencia,
  atual: CriteriosAbrangencia,
  original: CriteriosAbrangencia,
  tipo: TipoProcessamento,
) {
  return (
    (tipo === "TOTAL"
      ? original[campo].length > 0
      : original[campo].length === 0) ||
    (campo === "unidades" && !atual.orgaos.length)
  );
}

export function opcoesProcessamento(
  atual: CriteriosAbrangencia,
  original: CriteriosAbrangencia,
  tipo: TipoProcessamento,
  catalogo: CatalogoAbrangencia,
) {
  const compativel = consultaCompatibilidade(catalogo);
  return Object.fromEntries(
    criteriosProcessamento.map((campo) => {
      const dominio =
        tipo === "PARCIAL" || original[campo].length
          ? catalogo[campo].filter((o) => original[campo].includes(o.value))
          : catalogo[campo];
      const opcoes: OpcaoAbrangencia[] = dominio.filter(
        (o) =>
          (tipo === "TOTAL" && original[campo].length) ||
          atual[campo].includes(o.value) ||
          compativel({ ...atual, [campo]: [o.value] }),
      );
      for (const valor of original[campo])
        if (!catalogo[campo].some((o) => o.value === valor))
          opcoes.push({ value: valor, label: valor });
      return [campo, opcoes];
    }),
  ) as Record<keyof CriteriosAbrangencia, OpcaoAbrangencia[]>;
}

export function ajustarProcessamento(
  atual: CriteriosAbrangencia,
  original: CriteriosAbrangencia,
  tipo: TipoProcessamento,
  catalogo: CatalogoAbrangencia,
  alterado?: keyof CriteriosAbrangencia,
): CriteriosAbrangencia {
  const novos = Object.fromEntries(
    criteriosProcessamento.map((campo) => [
      campo,
      tipo === "TOTAL" && original[campo].length
        ? [...original[campo]]
        : [...new Set(atual[campo])].filter(
            (v) =>
              (tipo !== "PARCIAL" || original[campo].includes(v)) &&
              catalogo[campo].some((o) => o.value === v),
          ),
    ]),
  ) as CriteriosAbrangencia;
  if (!novos.orgaos.length) novos.unidades = [];
  const compativel = consultaCompatibilidade(catalogo);
  for (let passagem = 0; passagem < criteriosProcessamento.length; passagem++) {
    let mudou = false;
    for (const campo of criteriosProcessamento) {
      if (campo === alterado || (tipo === "TOTAL" && original[campo].length))
        continue;
      const mantidos = novos[campo].filter((v) =>
        compativel({ ...novos, [campo]: [v] }),
      );
      if (!iguais(mantidos, novos[campo])) {
        novos[campo] = mantidos;
        mudou = true;
      }
    }
    if (!novos.orgaos.length && novos.unidades.length) {
      novos.unidades = [];
      mudou = true;
    }
    if (!mudou) break;
  }
  return novos;
}

export function validarAbrangenciaProcessamento(
  dados: ProcessamentoFolhaForm,
  folha: FolhaPagamentoForm,
  catalogo: CatalogoAbrangencia,
  gruposEleitosDisponiveis?: OpcaoAbrangencia[],
) {
  const original = normalizarCriteriosDaFolha(folha, catalogo);
  const atual = criteriosDoProcessamento(dados, catalogo);
  const erros: Partial<Record<keyof ProcessamentoFolhaForm, string>> = {};
  if (dados.tipoExecucao !== "TOTAL" && dados.tipoExecucao !== "PARCIAL")
    erros.tipoExecucao = "Selecione o tipo de execução.";
  if (
    dados.grupoEleitos &&
    gruposEleitosDisponiveis &&
    !gruposEleitosDisponiveis.some(
      (grupo) => grupo.value === dados.grupoEleitos,
    )
  )
    erros.grupoEleitos = "Selecione um grupo de eleitos disponível no SIGEP.";
  for (const campo of criteriosProcessamento) {
    const nome = camposProcessamento[campo];
    if (atual[campo].some((v) => !catalogo[campo].some((o) => o.value === v)))
      erros[nome] = "Critério não encontrado no cadastro do SIGEP.";
    else if (
      dados.tipoExecucao === "TOTAL" &&
      original[campo].length &&
      !iguais(original[campo], atual[campo])
    )
      erros[nome] =
        "Mantenha os critérios originais da folha no processamento Total.";
    else if (
      dados.tipoExecucao === "PARCIAL" &&
      atual[campo].some((v) => !original[campo].includes(v))
    )
      erros[nome] =
        "Selecione apenas opções da parametrização original da folha.";
    else if (
      dados.tipoExecucao === "PARCIAL" &&
      original[campo].length &&
      !atual[campo].length
    )
      erros[nome] = "Mantenha ao menos uma opção da parametrização original.";
  }
  if (atual.unidades.length && !atual.orgaos.length)
    erros.unidades =
      "Selecione um órgão/entidade para informar unidades de lotação.";
  if (!Object.keys(erros).length && !consultaCompatibilidade(catalogo)(atual)) {
    for (const campo of criteriosProcessamento)
      if (atual[campo].length)
        erros[camposProcessamento[campo]] =
          "Os critérios selecionados não possuem uma combinação compatível.";
  }
  return erros;
}

export function parametrosExecucao(
  folhaPagamentoId: number,
  dados: ProcessamentoFolhaForm,
  catalogo: CatalogoAbrangencia,
): ExecutarFolhaPagamentoRequest {
  const competencia = dados.competencia ?? "";
  const inicial = /^(\d{2})\/(\d{4})$/.exec(competencia);
  return {
    folhaPagamentoId,
    tipoExecucao: dados.tipoExecucao ?? "TOTAL",
    competenciaInicial: inicial ? `${inicial[2]}-${inicial[1]}` : competencia,
    criterios: criteriosDoProcessamento(dados, catalogo),
    grupoEleitos: dados.grupoEleitos ?? "",
  };
}
