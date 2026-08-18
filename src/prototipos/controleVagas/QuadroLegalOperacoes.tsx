import { useMemo, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Paginator } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import {
  controleVagasStore,
  useControleVagasStore,
} from "./controleVagasStore";
import type { EvolucaoQuadroLegal, QuadroAutorizadoRow } from "./types";
import {
  aplicarAlteracaoQuadroLegal,
  type TipoAlteracaoQuadroLegal,
} from "./quadroLegalUtils";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { BaseLegalVinculada } from "./BaseLegalVinculada";
import {
  BotaoAdicionarSeplag,
  BotaoIconSeplag,
  BotaoSalvarSeplag,
  BotaoSeplag,
} from "../../componentes/Botao";
import {
  DateFieldSeplag,
  DropdownFieldSeplag,
  NumberFieldSeplag,
  TextAreaFieldSeplag,
  TextFieldSeplag,
} from "../../componentes/Fields";
import { MensagemSeplag } from "../../componentes/Mensagem";
import {
  calcularPosicaoVaga,
  registrarMovimentoVaga,
} from "./distribuicaoIndividual";
import { orgaosBaseTemporaria } from "./baseTemporaria";
import "./quadroLegalOperacoes.css";

const rotulos: Record<TipoAlteracaoQuadroLegal, string> = {
  AMPLIACAO: "Ampliação legal",
  REDUCAO: "Redução legal",
  TRANSFORMACAO: "Transformação",
  EXTINCAO_PROGRESSIVA: "Extinção progressiva",
  DISTRIBUICAO: "Distribuição",
  REDISTRIBUICAO: "Redistribuição",
  INCLUSAO_ORGAO: "Inclusão de órgão",
  EXCLUSAO_ORGAO: "Exclusão de órgão",
};
const descricoes: Record<TipoAlteracaoQuadroLegal, string> = {
  AMPLIACAO:
    "Cria novos identificadores após o último sequencial, sem reutilizar códigos.",
  REDUCAO:
    "Reduz somente vagas disponíveis, regulares e sem comprometimento ativo.",
  TRANSFORMACAO:
    "Preserva a origem no histórico e gera vagas numeradas para o cargo de destino.",
  EXTINCAO_PROGRESSIVA:
    "Bloqueia novas ocupações; vagas ocupadas desaparecem do limite somente após vagarem.",
  DISTRIBUICAO:
    "Versiona o quadro registrando a distribuição formal das vagas por órgão.",
  REDISTRIBUICAO:
    "Versiona o quadro registrando a movimentação de vagas entre órgãos.",
  INCLUSAO_ORGAO:
    "Inclui um órgão na destinação legal do quadro, sem distribuir vagas automaticamente.",
  EXCLUSAO_ORGAO:
    "Exclui um órgão da destinação legal somente quando ele não possui vagas atribuídas.",
};
const tiposAlteracaoDisponiveis: TipoAlteracaoQuadroLegal[] = [
  "AMPLIACAO",
  "REDUCAO",
  "TRANSFORMACAO",
  "EXTINCAO_PROGRESSIVA",
  "DISTRIBUICAO",
  "REDISTRIBUICAO",
];
const evolucaoDoVersionamento = (
  tipo: TipoAlteracaoQuadroLegal,
): EvolucaoQuadroLegal | undefined => {
  if (tipo === "AMPLIACAO") return "Ampliação";
  if (tipo === "REDUCAO") return "Redução";
  if (tipo === "EXTINCAO_PROGRESSIVA") return "Extinção progressiva";
  if (tipo === "DISTRIBUICAO") return "Distribuição";
  return undefined;
};
interface DestinacaoVersionamento {
  id: number;
  orgao: string;
  quantidade: number;
}
const ORGAOS_DISTRIBUICAO_GERAIS = ["AGER", "CASA CIVIL", "CGE", "PGE", "PJC", "SEDUC", "SEFAZ", "SEMA", "SEPLAG", "SES", "SINFRA"];
const obterOrgaosPermitidosDistribuicao = (quadro: QuadroAutorizadoRow) => {
  if (quadro.orgaosDefinidosLei?.length) return [...new Set(quadro.orgaosDefinidosLei)];
  if (quadro.formaDestinacaoLegal === "DISTRIBUICAO_POSTERIOR") return ORGAOS_DISTRIBUICAO_GERAIS;
  if (quadro.orgao && quadro.orgao !== "ESTADO DE MATO GROSSO") return [quadro.orgao];
  return [];
};
const dataAtualIso = () => {
  const agora = new Date();
  return [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
  ].join("-");
};

export function QuadroLegalOperacoes({
  registro,
  onSaved,
}: {
  registro: QuadroAutorizadoRow;
  onSaved?: () => void;
}) {
  const { vagas, movimentos, comprometimentos, quadros } = useControleVagasStore();
  const hoje = useMemo(() => dataAtualIso(), []);
  const documentosLegaisDisponiveis = useDocumentosLegaisAssociaveis();
  const vagasOriginais = useMemo(
    () => vagas.filter((vaga) => vaga.quadroAutorizadoId === registro.id),
    [registro.id, vagas],
  );
  const quadrosDestino = useMemo(() => {
    const atuais = new Map<string, QuadroAutorizadoRow>();
    quadros
      .filter((quadro) => quadro.codigo !== registro.codigo)
      .forEach((quadro) => {
        const anterior = atuais.get(quadro.codigo);
        if (!anterior || quadro.versao > anterior.versao) atuais.set(quadro.codigo, quadro);
      });
    return [...atuais.values()]
      .filter(
        (quadro) =>
          quadro.situacao !== "Encerrada" &&
          quadro.situacaoVigencia !== "EXTINTO" &&
          !quadro.dataExtincao,
      )
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [quadros, registro.codigo]);
  const opcoesQuadroDestino = useMemo(
    () => quadrosDestino.map((quadro) => ({
      label: `${quadro.codigo} — ${quadro.cargo} — versão ${quadro.versao}`,
      value: quadro.id,
    })),
    [quadrosDestino],
  );
  const [tipo, setTipo] = useState<TipoAlteracaoQuadroLegal>("AMPLIACAO");
  const {
    control: operacaoControl,
    watch: watchOperacao,
    setValue: setOperacaoValue,
  } = useForm<{
    dataEfeito: string;
    quantidade: number;
    quadroDestinoId: number | null;
    orgaoAlteracao: string;
    orgaoOrigemRedistribuicao: string;
    orgaoDestinoRedistribuicao: string;
    quantidadeRedistribuicao: number;
    observacao: string;
  }>({
    defaultValues: {
      dataEfeito: hoje,
      quantidade: 1,
      quadroDestinoId: null,
      orgaoAlteracao: "",
      orgaoOrigemRedistribuicao: "",
      orgaoDestinoRedistribuicao: "",
      quantidadeRedistribuicao: 1,
      observacao: "",
    },
  });
  const dataEfeito = watchOperacao("dataEfeito");
  const quantidade = watchOperacao("quantidade");
  const quadroDestinoId = watchOperacao("quadroDestinoId");
  const orgaoAlteracao = watchOperacao("orgaoAlteracao");
  const orgaoOrigemRedistribuicao = watchOperacao("orgaoOrigemRedistribuicao");
  const orgaoDestinoRedistribuicao = watchOperacao("orgaoDestinoRedistribuicao");
  const quantidadeRedistribuicao = watchOperacao("quantidadeRedistribuicao");
  const observacao = watchOperacao("observacao");
  const quadroDestino = quadrosDestino.find((quadro) => quadro.id === Number(quadroDestinoId));
  const vagasDestino = useMemo(() => vagas.filter((vaga) => vaga.quadroAutorizadoId === quadroDestino?.id), [quadroDestino?.id, vagas]);
  const [documentosLegaisIds, setDocumentosLegaisIds] = useState<string[]>([]);
  const normasSelecionadas = documentosLegaisDisponiveis.filter((item) =>
    documentosLegaisIds.includes(item.id),
  );
  const lei = normasSelecionadas.map((item) => item.titulo).join("; ");
  const [processo, setProcesso] = useState(registro.processo);
  const [resultado, setResultado] = useState<ReturnType<
    typeof aplicarAlteracaoQuadroLegal
  > | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [primeiraVagaImpactada, setPrimeiraVagaImpactada] = useState(0);
  const [reducaoPorOrgao, setReducaoPorOrgao] = useState<Record<string, number>>({});
  const [transformacaoPorOrgao, setTransformacaoPorOrgao] = useState<Record<string, number>>({});
  const [destinacoesDistribuicao, setDestinacoesDistribuicao] = useState<DestinacaoVersionamento[]>([
    { id: 1, orgao: "", quantidade: 1 },
  ]);
  const [distribuicaoSimulada, setDistribuicaoSimulada] = useState(false);
  const [erroDistribuicao, setErroDistribuicao] = useState("");
  const [redistribuicaoSimulada, setRedistribuicaoSimulada] = useState(false);
  const [erroRedistribuicao, setErroRedistribuicao] = useState("");

  const versaoAgendada = useMemo(
    () =>
      quadros
        .filter(
          (quadro) =>
            quadro.codigo === registro.codigo &&
            quadro.id !== registro.id &&
            quadro.situacao === "Vigência futura",
        )
        .sort((a, b) => b.versao - a.versao)[0],
    [quadros, registro.codigo, registro.id],
  );
  const proximaVersao = Math.max(
    registro.versao,
    ...quadros
      .filter((quadro) => quadro.codigo === registro.codigo)
      .map((quadro) => quadro.versao),
  ) + 1;
  const substituirVersaoAgendada = (itens: QuadroAutorizadoRow[]) =>
    versaoAgendada
      ? itens.map((item) =>
          item.id === versaoAgendada.id
            ? { ...item, situacao: "Encerrada" as const }
            : item,
        )
      : itens;

  const orgaosAtuais = useMemo(() => {
    if (registro.orgaosDefinidosLei?.length) return [...registro.orgaosDefinidosLei];
    return registro.orgao && registro.orgao !== "ESTADO DE MATO GROSSO" ? [registro.orgao] : [];
  }, [registro.orgao, registro.orgaosDefinidosLei]);
  const opcoesInclusaoOrgao = useMemo(
    () => orgaosBaseTemporaria
      .map((item) => item.nome)
      .filter((orgao) => !orgaosAtuais.includes(orgao))
      .map((orgao) => ({ label: orgao, value: orgao })),
    [orgaosAtuais],
  );
  const opcoesExclusaoOrgao = useMemo(
    () => orgaosAtuais.map((orgao) => ({ label: orgao, value: orgao })),
    [orgaosAtuais],
  );

  const idsVagasComprometidas = useMemo(
    () =>
      new Set(
        comprometimentos
          .filter((item) => item.situacao === "ATIVO")
          .map((item) => item.vagaId),
      ),
    [comprometimentos],
  );

  const resumoQuadro = useMemo(() => {
    const ativas = vagasOriginais.filter((vaga) => vaga.situacaoLegal !== "EXTINTA");
    const pendentes = ativas.filter((vaga) => calcularPosicaoVaga(vaga, movimentos, dataEfeito || hoje).situacaoDistribuicao === "PENDENTE_ATO").length;
    const ocupadas = ativas.filter((vaga) => vaga.estado === "OCUPADA").length;
    const comprometidas = ativas.filter((vaga) => idsVagasComprometidas.has(vaga.id)).length;
    const disponiveis = ativas.filter((vaga) => vaga.estado === "DISPONIVEL").length - pendentes;
    return { autorizadas: ativas.length, ocupadas, comprometidas, disponiveis: Math.max(0, disponiveis), pendentes };
  }, [dataEfeito, hoje, idsVagasComprometidas, movimentos, vagasOriginais]);
  const vagasPorOrgao = useMemo(() => {
    const grupos = new Map<string, typeof vagasOriginais>();
    vagasOriginais.filter((vaga) => vaga.situacaoLegal !== "EXTINTA").forEach((vaga) => {
      const posicao = calcularPosicaoVaga(vaga, movimentos, dataEfeito || hoje);
      const orgao = posicao.orgaoDistribuicao ?? "Pendente de distribuição";
      grupos.set(orgao, [...(grupos.get(orgao) ?? []), vaga]);
    });
    return [...grupos.entries()].map(([orgao, itens]) => {
      const elegiveis = itens.filter(
        (vaga) =>
          vaga.estado === "DISPONIVEL" &&
          vaga.situacaoLegal === "REGULAR" &&
          !idsVagasComprometidas.has(vaga.id),
      );
      return {
        orgao,
        vagas: itens,
        ocupadas: itens.filter((vaga) => vaga.estado === "OCUPADA").length,
        disponiveis: itens.filter((vaga) => vaga.estado === "DISPONIVEL").length,
        comprometidas: itens.filter((vaga) => idsVagasComprometidas.has(vaga.id)).length,
        elegiveis,
      };
    });
  }, [dataEfeito, hoje, idsVagasComprometidas, movimentos, vagasOriginais]);

  const vagasSelecionadasReducao = useMemo(() => vagasPorOrgao.flatMap((grupo) => {
    const quantidadeGrupo = Math.min(reducaoPorOrgao[grupo.orgao] ?? 0, grupo.elegiveis.length);
    return [...grupo.elegiveis].sort((a, b) => b.sequencial - a.sequencial).slice(0, quantidadeGrupo);
  }), [reducaoPorOrgao, vagasPorOrgao]);
  const vagasSelecionadasTransformacao = useMemo(() => vagasPorOrgao.flatMap((grupo) => {
    const elegiveisTransformacao = grupo.vagas
      .filter(
        (vaga) =>
          vaga.situacaoLegal === "REGULAR" &&
          (vaga.estado === "DISPONIVEL" || vaga.estado === "OCUPADA") &&
          !idsVagasComprometidas.has(vaga.id),
      )
      .sort((a, b) => b.sequencial - a.sequencial);
    const quantidadeGrupo = Math.min(
      transformacaoPorOrgao[grupo.orgao] ?? 0,
      elegiveisTransformacao.length,
    );
    return elegiveisTransformacao.slice(0, quantidadeGrupo);
  }), [idsVagasComprometidas, transformacaoPorOrgao, vagasPorOrgao]);
  const totalSolicitadoReducao = useMemo(
    () => Object.values(reducaoPorOrgao).reduce((total, item) => total + item, 0),
    [reducaoPorOrgao],
  );
  const totalSolicitadoTransformacao = useMemo(
    () => Object.values(transformacaoPorOrgao).reduce((total, item) => total + item, 0),
    [transformacaoPorOrgao],
  );

  const reducaoInvalida = tipo === "REDUCAO" && vagasPorOrgao.some(
    (grupo) => (reducaoPorOrgao[grupo.orgao] ?? 0) > grupo.elegiveis.length,
  );
  const transformacaoInvalida = tipo === "TRANSFORMACAO" && (
    !quadroDestino ||
    totalSolicitadoTransformacao < 1 ||
    vagasPorOrgao.some((grupo) => {
      const elegiveisTransformacao = grupo.vagas.filter(
        (vaga) =>
          vaga.situacaoLegal === "REGULAR" &&
          (vaga.estado === "DISPONIVEL" || vaga.estado === "OCUPADA") &&
          !idsVagasComprometidas.has(vaga.id),
      ).length;
      return (transformacaoPorOrgao[grupo.orgao] ?? 0) > elegiveisTransformacao;
    })
  );
  const vagasComprometidasAtivas = useMemo(
    () => vagasOriginais.filter(
      (vaga) => vaga.situacaoLegal !== "EXTINTA" && idsVagasComprometidas.has(vaga.id),
    ),
    [idsVagasComprometidas, vagasOriginais],
  );
  const extincaoJaIniciada = tipo === "EXTINCAO_PROGRESSIVA" && Boolean(registro.extincaoProgressivaEmAndamento);
  const extincaoInvalida = tipo === "EXTINCAO_PROGRESSIVA" && extincaoJaIniciada;
  const alteracaoSomenteOrgao = tipo === "INCLUSAO_ORGAO" || tipo === "EXCLUSAO_ORGAO";
  const resumoOrgaoExclusao = useMemo(() => {
    const grupo = vagasPorOrgao.find((item) => item.orgao === orgaoAlteracao);
    return {
      atribuidas: grupo?.vagas.length ?? 0,
      ocupadas: grupo?.ocupadas ?? 0,
      disponiveis: grupo?.disponiveis ?? 0,
      comprometidas: grupo?.comprometidas ?? 0,
    };
  }, [orgaoAlteracao, vagasPorOrgao]);
  const exclusaoOrgaoBloqueada = tipo === "EXCLUSAO_ORGAO" && resumoOrgaoExclusao.atribuidas > 0;
  const alteracaoOrgaoInvalida = alteracaoSomenteOrgao && !orgaoAlteracao;
  const orgaosPermitidosDistribuicao = useMemo(
    () => obterOrgaosPermitidosDistribuicao(registro),
    [registro],
  );
  const vagasElegiveisDistribuicao = useMemo(
    () =>
      vagasOriginais
        .filter((vaga) => {
          const posicao = calcularPosicaoVaga(vaga, movimentos, dataEfeito || hoje);
          return (
            vaga.estado === "DISPONIVEL" &&
            vaga.situacaoLegal === "REGULAR" &&
            !idsVagasComprometidas.has(vaga.id) &&
            posicao.situacaoDistribuicao === "PENDENTE_ATO"
          );
        })
        .sort((a, b) => a.sequencial - b.sequencial),
    [dataEfeito, hoje, idsVagasComprometidas, movimentos, vagasOriginais],
  );
  const distribuicaoAtualOrgaos = useMemo(() => {
    const grupos = new Map<string, number>();
    let pendentes = 0;
    vagasOriginais
      .filter((vaga) => vaga.situacaoLegal !== "EXTINTA")
      .forEach((vaga) => {
        const posicao = calcularPosicaoVaga(vaga, movimentos, dataEfeito || hoje);
        if (posicao.orgaoDistribuicao) {
          grupos.set(posicao.orgaoDistribuicao, (grupos.get(posicao.orgaoDistribuicao) ?? 0) + 1);
        } else {
          pendentes += 1;
        }
      });
    const orgaos = [...grupos.entries()]
      .map(([orgao, quantidade]) => ({ orgao, quantidade }))
      .sort((a, b) => a.orgao.localeCompare(b.orgao));
    return {
      orgaos,
      pendentes,
      distribuidas: orgaos.reduce((total, item) => total + item.quantidade, 0),
    };
  }, [dataEfeito, hoje, movimentos, vagasOriginais]);
  const orgaosComDistribuicaoAtual = useMemo(
    () => new Set(distribuicaoAtualOrgaos.orgaos.map((item) => item.orgao)),
    [distribuicaoAtualOrgaos.orgaos],
  );
  const destinacoesDistribuicaoInformadas = useMemo(
    () =>
      destinacoesDistribuicao.filter(
        (item) => item.orgao && Math.max(0, Math.floor(item.quantidade || 0)) > 0,
      ),
    [destinacoesDistribuicao],
  );
  const totalDistribuicaoInformado = destinacoesDistribuicaoInformadas.reduce(
    (total, item) => total + Math.max(0, Math.floor(item.quantidade || 0)),
    0,
  );
  const vagasSelecionadasDistribuicao = vagasElegiveisDistribuicao.slice(0, totalDistribuicaoInformado);
  const linhasDistribuicao = useMemo(() => {
    const adicionaisPorOrgao = new Map(
      destinacoesDistribuicao
        .filter((item) => item.orgao)
        .map((item) => [item.orgao, item]),
    );
    const atuais = distribuicaoAtualOrgaos.orgaos.map((item, indice) => ({
      id: -(indice + 1),
      orgao: item.orgao,
      quantidadeAtual: item.quantidade,
      quantidade: adicionaisPorOrgao.get(item.orgao)?.quantidade ?? 0,
      fixa: true,
    }));
    const novas = destinacoesDistribuicao
      .filter((item) => !item.orgao || !orgaosComDistribuicaoAtual.has(item.orgao))
      .map((item) => ({
        ...item,
        quantidadeAtual: 0,
        fixa: false,
      }));
    return [...atuais, ...novas];
  }, [destinacoesDistribuicao, distribuicaoAtualOrgaos.orgaos, orgaosComDistribuicaoAtual]);
  const saldoPendenteCalculadoDistribuicao = distribuicaoAtualOrgaos.pendentes - totalDistribuicaoInformado;
  const excedenteDistribuicao = Math.max(0, totalDistribuicaoInformado - distribuicaoAtualOrgaos.pendentes);
  const saldoPendenteAposDistribuicao = Math.max(0, saldoPendenteCalculadoDistribuicao);
  const quantidadeRedistribuicaoInformada = Math.max(0, Math.floor(Number(quantidadeRedistribuicao) || 0));
  const vagasElegiveisRedistribuicaoPorOrgao = useMemo(() => {
    const grupos = new Map<string, typeof vagasOriginais>();
    vagasOriginais.forEach((vaga) => {
      const posicao = calcularPosicaoVaga(vaga, movimentos, dataEfeito || hoje);
      const orgao = posicao.orgaoDistribuicao;
      if (
        orgao &&
        vaga.estado === "DISPONIVEL" &&
        vaga.situacaoLegal === "REGULAR" &&
        !idsVagasComprometidas.has(vaga.id)
      ) {
        grupos.set(orgao, [...(grupos.get(orgao) ?? []), vaga]);
      }
    });
    return [...grupos.entries()].map(([orgao, itens]) => ({
      orgao,
      vagas: [...itens].sort((a, b) => b.sequencial - a.sequencial),
    }));
  }, [dataEfeito, hoje, idsVagasComprometidas, movimentos, vagasOriginais]);
  const opcoesOrigemRedistribuicao = useMemo(
    () =>
      vagasElegiveisRedistribuicaoPorOrgao
        .filter((grupo) => grupo.vagas.length > 0)
        .map((grupo) => ({
          label: `${grupo.orgao} (${grupo.vagas.length} ${grupo.vagas.length === 1 ? "vaga" : "vagas"})`,
          value: grupo.orgao,
        })),
    [vagasElegiveisRedistribuicaoPorOrgao],
  );
  const opcoesDestinoRedistribuicao = useMemo(
    () =>
      orgaosPermitidosDistribuicao
        .filter((orgao) => orgao !== orgaoOrigemRedistribuicao)
        .map((orgao) => ({
          label: orgao,
          value: orgao,
        })),
    [orgaoOrigemRedistribuicao, orgaosPermitidosDistribuicao],
  );
  const vagasElegiveisRedistribuicao =
    vagasElegiveisRedistribuicaoPorOrgao.find((grupo) => grupo.orgao === orgaoOrigemRedistribuicao)?.vagas ?? [];
  const vagasSelecionadasRedistribuicao = vagasElegiveisRedistribuicao.slice(0, quantidadeRedistribuicaoInformada);
  const saldoRedistribuicao = Math.max(0, vagasElegiveisRedistribuicao.length - quantidadeRedistribuicaoInformada);
  const saldoDestinoRedistribuicaoAtual = vagasOriginais.filter((vaga) => {
    if (vaga.situacaoLegal === "EXTINTA") return false;
    return calcularPosicaoVaga(vaga, movimentos, dataEfeito || hoje).orgaoDistribuicao === orgaoDestinoRedistribuicao;
  }).length;
  const operacaoDistribuicaoInvalida =
    tipo === "DISTRIBUICAO" &&
    (!distribuicaoSimulada ||
      totalDistribuicaoInformado < 1 ||
      excedenteDistribuicao > 0 ||
      Boolean(erroDistribuicao));
  const operacaoRedistribuicaoInvalida =
    tipo === "REDISTRIBUICAO" &&
    (!redistribuicaoSimulada || quantidadeRedistribuicaoInformada < 1 || Boolean(erroRedistribuicao));
  const operacaoInvalida =
    reducaoInvalida ||
    transformacaoInvalida ||
    extincaoInvalida ||
    alteracaoOrgaoInvalida ||
    exclusaoOrgaoBloqueada ||
    operacaoDistribuicaoInvalida ||
    operacaoRedistribuicaoInvalida;
  const camposComunsIncompletos =
    documentosLegaisIds.length === 0 ||
    !processo.trim() ||
    !dataEfeito;
  const camposObrigatoriosIncompletos =
    camposComunsIncompletos ||
    (tipo === "AMPLIACAO" &&
      (!Number.isInteger(Number(quantidade)) || Number(quantidade) < 1)) ||
    (tipo === "REDUCAO" &&
      (totalSolicitadoReducao < 1 || reducaoInvalida)) ||
    (tipo === "TRANSFORMACAO" && transformacaoInvalida) ||
    (tipo === "EXTINCAO_PROGRESSIVA" && extincaoInvalida) ||
    (tipo === "DISTRIBUICAO" &&
      (destinacoesDistribuicaoInformadas.length === 0 ||
        destinacoesDistribuicaoInformadas.length !== destinacoesDistribuicao.length ||
        totalDistribuicaoInformado < 1 ||
        excedenteDistribuicao > 0)) ||
    (tipo === "REDISTRIBUICAO" &&
      (!orgaoOrigemRedistribuicao ||
        !orgaoDestinoRedistribuicao ||
        orgaoOrigemRedistribuicao === orgaoDestinoRedistribuicao ||
        quantidadeRedistribuicaoInformada < 1 ||
        quantidadeRedistribuicaoInformada > vagasElegiveisRedistribuicao.length));

  const resetarDistribuicao = () => {
    setDistribuicaoSimulada(false);
    setErroDistribuicao("");
  };
  const resetarRedistribuicao = () => {
    setRedistribuicaoSimulada(false);
    setErroRedistribuicao("");
  };
  const resetarOperacoesDistributivas = () => {
    resetarDistribuicao();
    resetarRedistribuicao();
  };
  const atualizarDestinacaoDistribuicao = (
    id: number,
    campo: "orgao" | "quantidade",
    valor: string | number,
  ) => {
    setDestinacoesDistribuicao((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? {
              ...item,
              [campo]: valor,
            }
          : item,
      ),
    );
    resetarDistribuicao();
  };
  const atualizarAcrecimoDistribuicaoAtual = (orgao: string, valor: number) => {
    const quantidade = Math.max(0, Math.floor(valor || 0));
    setDestinacoesDistribuicao((atuais) => {
      const existente = atuais.find((item) => item.orgao === orgao);
      if (existente) {
        return atuais.map((item) =>
          item.id === existente.id ? { ...item, quantidade } : item,
        );
      }
      return [
        ...atuais,
        {
          id: Math.max(0, ...atuais.map((item) => item.id)) + 1,
          orgao,
          quantidade,
        },
      ];
    });
    resetarDistribuicao();
  };
  const adicionarDestinacaoDistribuicao = () => {
    setDestinacoesDistribuicao((atuais) => [
      ...atuais,
      { id: Math.max(0, ...atuais.map((item) => item.id)) + 1, orgao: "", quantidade: 1 },
    ]);
    resetarDistribuicao();
  };
  const removerDestinacaoDistribuicao = (id: number) => {
    setDestinacoesDistribuicao((atuais) =>
      atuais.length === 1 ? atuais : atuais.filter((item) => item.id !== id),
    );
    resetarDistribuicao();
  };
  const opcoesOrgaoDistribuicao = (destinacaoAtual: DestinacaoVersionamento) => {
    const selecionadosEmOutrasLinhas = new Set(
      destinacoesDistribuicao
        .filter((item) => item.id !== destinacaoAtual.id)
        .map((item) => item.orgao)
        .filter(Boolean),
    );
    return orgaosPermitidosDistribuicao
      .filter(
        (orgao) =>
          orgao === destinacaoAtual.orgao ||
          (!selecionadosEmOutrasLinhas.has(orgao) && !orgaosComDistribuicaoAtual.has(orgao)),
      )
      .map((orgao) => ({
        label: orgao,
        value: orgao,
      }));
  };

  const validarDistribuicao = () => {
    if (!lei || !processo.trim() || !dataEfeito) {
      return "Preencha base legal, data de efeito e Processo SIGADOC.";
    }
    if (totalDistribuicaoInformado < 1) {
      return "Informe ao menos uma vaga a distribuir nesta versão.";
    }
    if (excedenteDistribuicao > 0) {
      return `A quantidade informada excede o saldo pendente de distribuição em ${excedenteDistribuicao} ${excedenteDistribuicao === 1 ? "vaga" : "vagas"}.`;
    }
    if (
      destinacoesDistribuicaoInformadas.some(
        (item) => !item.orgao || !Number.isInteger(Number(item.quantidade)) || Number(item.quantidade) < 1,
      )
    ) {
      return "Informe órgão e quantidade maior que zero em todas as destinações.";
    }
    if (destinacoesDistribuicaoInformadas.some((item) => !orgaosPermitidosDistribuicao.includes(item.orgao))) {
      return "Há órgão de destino não permitido pela autorização legal do quadro.";
    }
    const chaves = destinacoesDistribuicaoInformadas.map((item) => item.orgao);
    if (new Set(chaves).size !== chaves.length) return "Não repita o mesmo órgão de destino.";
    if (vagasSelecionadasDistribuicao.length < totalDistribuicaoInformado) {
      return `Existem apenas ${vagasSelecionadasDistribuicao.length} vagas livres elegíveis para ${totalDistribuicaoInformado} vagas informadas.`;
    }
    return "";
  };
  const validarRedistribuicao = () => {
    if (!lei || !processo.trim() || !dataEfeito) {
      return "Preencha base legal, data de efeito e Processo SIGADOC.";
    }
    if (!orgaoOrigemRedistribuicao || !orgaoDestinoRedistribuicao) {
      return "Informe órgão de origem e órgão de destino.";
    }
    if (orgaoOrigemRedistribuicao === orgaoDestinoRedistribuicao) {
      return "O órgão de destino deve ser diferente do órgão de origem.";
    }
    if (!orgaosPermitidosDistribuicao.includes(orgaoDestinoRedistribuicao)) {
      return "O órgão de destino não é permitido pela autorização legal do quadro.";
    }
    if (!Number.isInteger(Number(quantidadeRedistribuicao)) || quantidadeRedistribuicaoInformada < 1) {
      return "Informe uma quantidade de vagas maior que zero.";
    }
    if (vagasSelecionadasRedistribuicao.length < quantidadeRedistribuicaoInformada) {
      return `Existem apenas ${vagasElegiveisRedistribuicao.length} vagas livres elegíveis em ${orgaoOrigemRedistribuicao}.`;
    }
    return "";
  };

  const simular = (event: FormEvent) => {
    event.preventDefault();
    setSalvo(false);
    setPrimeiraVagaImpactada(0);
    if (camposObrigatoriosIncompletos) {
      setResultado(null);
      setDistribuicaoSimulada(false);
      setRedistribuicaoSimulada(false);
      setErroDistribuicao("");
      setErroRedistribuicao("");
      return;
    }
    if (tipo === "DISTRIBUICAO") {
      const erro = validarDistribuicao();
      setErroDistribuicao(erro);
      setResultado(null);
      setDistribuicaoSimulada(!erro);
      return;
    }
    if (tipo === "REDISTRIBUICAO") {
      const erro = validarRedistribuicao();
      setErroRedistribuicao(erro);
      setResultado(null);
      setRedistribuicaoSimulada(!erro);
      return;
    }
    if (operacaoInvalida) {
      setResultado(null);
      return;
    }
    const quantidadeEfetiva =
      tipo === "REDUCAO"
        ? vagasSelecionadasReducao.length
        : tipo === "TRANSFORMACAO"
          ? vagasSelecionadasTransformacao.length
          : quantidade;
    const distribuicaoAtualPorVagaId = tipo === "TRANSFORMACAO"
      ? Object.fromEntries(vagasOriginais.map((vaga) => {
          const posicao = calcularPosicaoVaga(vaga, movimentos, dataEfeito || hoje);
          return [vaga.id, {
            orgao: posicao.orgaoDistribuicao,
            ato: posicao.atoDistribuicao,
            inicioVigencia: posicao.inicioVigenciaDistribuicao,
          }];
        }))
      : undefined;
    setResultado(
      aplicarAlteracaoQuadroLegal(vagasOriginais, {
        tipo,
        quantidade: tipo === "EXTINCAO_PROGRESSIVA" || alteracaoSomenteOrgao ? undefined : quantidadeEfetiva,
        lei,
        processo,
        dataEfeito,
        novoCargo: quadroDestino?.cargo,
        novaCarreira: quadroDestino?.carreira,
        quadroDestinoId: quadroDestino?.id,
        quadroDestinoCodigo: quadroDestino?.codigo,
        maiorSequencialDestino: Math.max(0, ...vagasDestino.map((vaga) => vaga.sequencial)),
        distribuicaoAtualPorVagaId,
        vagaIds: tipo === "REDUCAO"
          ? vagasSelecionadasReducao.map((vaga) => vaga.id)
          : tipo === "TRANSFORMACAO"
            ? vagasSelecionadasTransformacao.map((vaga) => vaga.id)
            : undefined,
        vagaIdsBloqueados: tipo === "REDUCAO" || tipo === "EXTINCAO_PROGRESSIVA" || tipo === "TRANSFORMACAO" ? [...idsVagasComprometidas] : undefined,
      }),
    );
  };

  const registrarNovaVersao = () => {
    if (tipo === "DISTRIBUICAO") {
      const erro = validarDistribuicao();
      if (erro || !distribuicaoSimulada) {
        setErroDistribuicao(erro || "Simule a distribuição antes de registrar.");
        return;
      }
      const atual = controleVagasStore.getState();
      const dataHoje = dataAtualIso();
      const vigenciaFutura = dataEfeito > dataHoje;
      const dataBr = dataEfeito.split("-").reverse().join("/");
      const novoId = Math.max(0, ...atual.quadros.map((item) => item.id)) + 1;
      const loteId = `DIST-${registro.codigo}-${dataEfeito.replaceAll("-", "")}-${String(atual.movimentos.length + 1).padStart(5, "0")}`;
      const atribuicoes: Array<{ vagaId: string; orgao: string }> = [];
      let cursor = 0;
      for (const destino of destinacoesDistribuicaoInformadas) {
        const quantidadeDestino = Math.max(0, Math.floor(destino.quantidade || 0));
        for (const vaga of vagasSelecionadasDistribuicao.slice(cursor, cursor + quantidadeDestino)) {
          atribuicoes.push({ vagaId: vaga.id, orgao: destino.orgao });
        }
        cursor += quantidadeDestino;
      }
      const lote = [];
      for (const [indice, atribuicao] of atribuicoes.entries()) {
        const vaga = vagasSelecionadasDistribuicao.find((item) => item.id === atribuicao.vagaId)!;
        const resultadoMovimento = registrarMovimentoVaga(
          vaga,
          calcularPosicaoVaga(vaga, atual.movimentos, dataEfeito || dataHoje),
          {
            tipo: "DISTRIBUICAO",
            dataEfeito,
            orgao: atribuicao.orgao,
            ato: lei,
            processo,
            justificativa: observacao.trim() || "Distribuição registrada no versionamento do quadro.",
          },
        );
        if (resultadoMovimento.erro || !resultadoMovimento.movimento) {
          setErroDistribuicao(resultadoMovimento.erro || "Não foi possível registrar a distribuição.");
          setConfirmacaoAberta(false);
          return;
        }
        lote.push({
          ...resultadoMovimento.movimento,
          id: `${loteId}-${String(indice + 1).padStart(3, "0")}`,
          loteId,
          quadroAutorizadoId: novoId,
          quadroCodigo: registro.codigo,
          quadroVersao: proximaVersao,
        });
      }
      const novaVersao: QuadroAutorizadoRow = {
        ...registro,
        id: novoId,
        evolucaoLegal: "Distribuição",
        ato: lei,
        processo,
        inicioVigencia: dataBr,
        dataAtivacao: dataEfeito,
        situacao: vigenciaFutura ? "Vigência futura" : "Vigente",
        versao: proximaVersao,
        atualizadoEm: dataBr,
      };
      controleVagasStore.update((estado) => ({
        ...estado,
        quadros: [
          ...substituirVersaoAgendada(estado.quadros).map((item) =>
            item.id === registro.id && !vigenciaFutura
              ? { ...item, situacao: "Encerrada" as const }
              : item,
          ),
          novaVersao,
        ],
        vagas: vigenciaFutura
          ? estado.vagas
          : estado.vagas.map((vaga) =>
              vaga.quadroAutorizadoId === registro.id
                ? { ...vaga, quadroAutorizadoId: novoId, quadroCodigo: registro.codigo }
                : vaga,
            ),
        movimentos: [...estado.movimentos, ...lote],
      }));
      setConfirmacaoAberta(false);
      setSalvo(true);
      window.setTimeout(() => onSaved?.(), 700);
      return;
    }
    if (tipo === "REDISTRIBUICAO") {
      const erro = validarRedistribuicao();
      if (erro || !redistribuicaoSimulada) {
        setErroRedistribuicao(erro || "Simule a redistribuição antes de registrar.");
        return;
      }
      const atual = controleVagasStore.getState();
      const dataHoje = dataAtualIso();
      const vigenciaFutura = dataEfeito > dataHoje;
      const dataBr = dataEfeito.split("-").reverse().join("/");
      const novoId = Math.max(0, ...atual.quadros.map((item) => item.id)) + 1;
      const loteId = `REDIST-${registro.codigo}-${dataEfeito.replaceAll("-", "")}-${String(atual.movimentos.length + 1).padStart(5, "0")}`;
      const lote = [];
      for (const [indice, vaga] of vagasSelecionadasRedistribuicao.entries()) {
        const resultadoMovimento = registrarMovimentoVaga(
          vaga,
          calcularPosicaoVaga(vaga, atual.movimentos, dataEfeito || dataHoje),
          {
            tipo: "REDISTRIBUICAO",
            dataEfeito,
            orgao: orgaoDestinoRedistribuicao,
            ato: lei,
            processo,
            justificativa: observacao.trim() || "Redistribuição registrada no versionamento do quadro.",
          },
        );
        if (resultadoMovimento.erro || !resultadoMovimento.movimento) {
          setErroRedistribuicao(resultadoMovimento.erro || "Não foi possível registrar a redistribuição.");
          setConfirmacaoAberta(false);
          return;
        }
        lote.push({
          ...resultadoMovimento.movimento,
          id: `${loteId}-${String(indice + 1).padStart(3, "0")}`,
          loteId,
          quadroAutorizadoId: novoId,
          quadroCodigo: registro.codigo,
          quadroVersao: proximaVersao,
        });
      }
      const novaVersao: QuadroAutorizadoRow = {
        ...registro,
        id: novoId,
        evolucaoLegal: "Redistribuição - Destino",
        ato: lei,
        processo,
        inicioVigencia: dataBr,
        dataAtivacao: dataEfeito,
        situacao: vigenciaFutura ? "Vigência futura" : "Vigente",
        versao: proximaVersao,
        atualizadoEm: dataBr,
      };
      controleVagasStore.update((estado) => ({
        ...estado,
        quadros: [
          ...substituirVersaoAgendada(estado.quadros).map((item) =>
            item.id === registro.id && !vigenciaFutura
              ? {
                  ...item,
                  situacao: "Encerrada" as const,
                  evolucaoLegal: "Redistribuição - Origem" as const,
                }
              : item,
          ),
          novaVersao,
        ],
        vagas: vigenciaFutura
          ? estado.vagas
          : estado.vagas.map((vaga) =>
              vaga.quadroAutorizadoId === registro.id
                ? { ...vaga, quadroAutorizadoId: novoId, quadroCodigo: registro.codigo }
                : vaga,
            ),
        movimentos: [...estado.movimentos, ...lote],
      }));
      setConfirmacaoAberta(false);
      setSalvo(true);
      window.setTimeout(() => onSaved?.(), 700);
      return;
    }
    if (operacaoInvalida || !resultado || (!alteracaoSomenteOrgao && resultado.criadas.length + resultado.alteradas.length === 0)) return;
    const atual = controleVagasStore.getState();
    const dataHoje = dataAtualIso();
    const vigenciaFutura = dataEfeito > dataHoje;
    const dataBr = dataEfeito.split("-").reverse().join("/");
    const primeiroNovoId = Math.max(0, ...atual.quadros.map((item) => item.id)) + 1;

    if (tipo === "TRANSFORMACAO" && quadroDestino) {
      const idOrigemNovaVersao = primeiroNovoId;
      const idDestinoNovaVersao = primeiroNovoId + 1;
      const paresTransformacao = new Map(
        resultado.alteradas.map((vagaOrigem, indice) => [vagaOrigem.id, resultado.criadas[indice]]),
      );
      const vagasOrigemRestantes = resultado.vagas
        .filter((vaga) => vaga.quadroAutorizadoId === registro.id)
        .map((vaga, indice) => ({ ...vaga, quadroAutorizadoId: idOrigemNovaVersao, quadroCodigo: registro.codigo }));
      const vagasTransformadas = resultado.criadas.map((vaga, indice) => ({
        ...vaga,
        quadroAutorizadoId: idDestinoNovaVersao,
        quadroCodigo: quadroDestino.codigo,
      }));
      const vagasDestinoAnteriores = atual.vagas
        .filter((vaga) => vaga.quadroAutorizadoId === quadroDestino.id)
        .map((vaga, indice) => ({ ...vaga, quadroAutorizadoId: idDestinoNovaVersao, quadroCodigo: quadroDestino.codigo }));
      const ocupadasTransformadas = vagasTransformadas.filter((vaga) => vaga.estado === "OCUPADA").length;
      const comprometidasTransformadas = resultado.alteradas.filter((vaga) => idsVagasComprometidas.has(vaga.id)).length;
      const origemNovaVersao: QuadroAutorizadoRow = {
        ...registro,
        id: idOrigemNovaVersao,
        autorizadas: resultado.quantitativoPosterior,
        ocupadas: Math.max(0, registro.ocupadas - ocupadasTransformadas),
        comprometidas: Math.max(0, registro.comprometidas - comprometidasTransformadas),
        ato: lei,
        processo,
        inicioVigencia: dataBr,
        dataAtivacao: dataEfeito,
        situacao: vigenciaFutura ? "Vigência futura" : "Vigente",
        versao: proximaVersao,
        atualizadoEm: dataBr,
        evolucaoLegal: "Transformação - Origem",
      };
      const destinoNovaVersao: QuadroAutorizadoRow = {
        ...quadroDestino,
        id: idDestinoNovaVersao,
        autorizadas: quadroDestino.autorizadas + vagasTransformadas.length,
        ocupadas: quadroDestino.ocupadas + ocupadasTransformadas,
        comprometidas: quadroDestino.comprometidas + comprometidasTransformadas,
        ato: lei,
        processo,
        inicioVigencia: dataBr,
        dataAtivacao: dataEfeito,
        situacao: vigenciaFutura ? "Vigência futura" : "Vigente",
        versao: quadroDestino.versao + 1,
        atualizadoEm: dataBr,
        evolucaoLegal: "Transformação - Destino",
      };

      controleVagasStore.update((estado) => ({
        ...estado,
        quadros: [
          ...substituirVersaoAgendada(estado.quadros).map((item) =>
            !vigenciaFutura && item.id === registro.id
              ? { ...item, situacao: "Encerrada" as const, evolucaoLegal: "Transformação - Origem" as const }
              : !vigenciaFutura && item.id === quadroDestino.id
                ? { ...item, situacao: "Encerrada" as const, evolucaoLegal: "Transformação - Destino" as const }
              : item,
          ),
          origemNovaVersao,
          destinoNovaVersao,
        ],
        vagas: vigenciaFutura
          ? estado.vagas
          : [
              ...estado.vagas.filter((vaga) => vaga.quadroAutorizadoId !== registro.id && vaga.quadroAutorizadoId !== quadroDestino.id),
              ...vagasOrigemRestantes,
              ...vagasDestinoAnteriores,
              ...vagasTransformadas,
            ],
        ocupacoes: vigenciaFutura
          ? estado.ocupacoes
          : estado.ocupacoes.map((ocupacao) => {
              const destino = paresTransformacao.get(ocupacao.vagaId);
              return destino ? { ...ocupacao, vagaId: destino.id, cargo: quadroDestino.cargo } : ocupacao;
            }),
        comprometimentos: vigenciaFutura
          ? estado.comprometimentos
          : estado.comprometimentos.map((comprometimento) => {
              const destino = paresTransformacao.get(comprometimento.vagaId);
              return destino ? { ...comprometimento, vagaId: destino.id } : comprometimento;
            }),
      }));
    } else {
      const novoId = primeiroNovoId;
      const vagasDaNovaVersao = resultado.vagas.map((vaga, indice) => ({ ...vaga, quadroAutorizadoId: novoId, quadroCodigo: registro.codigo }));
      const ocupadasNovaVersao = vagasDaNovaVersao.filter((vaga) => vaga.estado === "OCUPADA" && vaga.situacaoLegal !== "EXTINTA").length;
      const extincaoProgressiva = tipo === "EXTINCAO_PROGRESSIVA";
      const extincaoImediata = extincaoProgressiva && resultado.quantitativoPosterior === 0;
      const novaVersao: QuadroAutorizadoRow = {
        ...registro,
        id: novoId,
        evolucaoLegal: evolucaoDoVersionamento(tipo),
        autorizadas: resultado.quantitativoPosterior,
        ocupadas: ocupadasNovaVersao,
        comprometidas: extincaoProgressiva
          ? vagasDaNovaVersao.filter(
              (vaga) =>
                vaga.situacaoLegal !== "EXTINTA" &&
                idsVagasComprometidas.has(vaga.id),
            ).length
          : registro.comprometidas,

        bloqueadas: extincaoProgressiva ? 0 : registro.bloqueadas,
        ato: lei,
        processo,
        inicioVigencia: dataBr,
        dataAtivacao: dataEfeito,
        dataEncerramento: extincaoProgressiva && !extincaoImediata && !vigenciaFutura ? dataEfeito : undefined,
        motivoEncerramento: extincaoProgressiva && !extincaoImediata ? "Extinção progressiva em andamento." : undefined,
        situacaoVigencia: extincaoImediata
          ? "EXTINTO"
          : extincaoProgressiva && !vigenciaFutura
            ? "ENCERRADO"
            : "ATIVO",
        dataExtincao: extincaoImediata ? dataEfeito : undefined,
        motivoExtincao: extincaoImediata ? "Extinção progressiva concluída sem vagas ocupadas." : undefined,
        extincaoProgressivaEmAndamento: extincaoProgressiva && !extincaoImediata,
        dataInicioExtincaoProgressiva: extincaoProgressiva ? dataEfeito : undefined,
        fimVigencia: extincaoImediata ? dataBr : "",
        situacao: vigenciaFutura ? "Vigência futura" : extincaoProgressiva ? "Encerrada" : "Vigente",
        versao: proximaVersao,
        atualizadoEm: dataBr,
      };
      if (alteracaoSomenteOrgao) {
        const orgaosResultantes = tipo === "INCLUSAO_ORGAO"
          ? [...new Set([...orgaosAtuais, orgaoAlteracao])]
          : orgaosAtuais.filter((orgao) => orgao !== orgaoAlteracao);
        novaVersao.orgaosDefinidosLei = orgaosResultantes;
        novaVersao.quantitativosLegaisPorOrgao = tipo === "EXCLUSAO_ORGAO"
          ? (registro.quantitativosLegaisPorOrgao ?? []).filter((item) => item.orgao !== orgaoAlteracao)
          : registro.quantitativosLegaisPorOrgao;
        novaVersao.formaDestinacaoLegal = orgaosResultantes.length ? "DEFINIDA_NA_LEI" : "DISTRIBUICAO_POSTERIOR";
        novaVersao.orgao = orgaosResultantes.length === 1 ? orgaosResultantes[0] : "ESTADO DE MATO GROSSO";
        novaVersao.abrangencia = orgaosResultantes.length ? "Destinação definida na lei" : "Distribuição posterior pelo Estado";
      }
      controleVagasStore.update((estado) => ({
        ...estado,
        quadros: [...substituirVersaoAgendada(estado.quadros).map((item) => item.id === registro.id && !vigenciaFutura ? { ...item, situacao: "Encerrada" as const } : item), novaVersao],
        vagas: vigenciaFutura ? estado.vagas : [...estado.vagas.filter((vaga) => vaga.quadroAutorizadoId !== registro.id), ...vagasDaNovaVersao],
      }));
    }
    setConfirmacaoAberta(false);
    setSalvo(true);
    window.setTimeout(() => onSaved?.(), 700);
  };
  const quantidadeImpactada = alteracaoSomenteOrgao
    ? 0
    : tipo === "TRANSFORMACAO"
      ? resultado?.alteradas.length ?? 0
      : (resultado?.criadas.length ?? 0) + (resultado?.alteradas.length ?? 0);
  const vagasImpactadas = resultado
    ? tipo === "TRANSFORMACAO"
      ? resultado.criadas
      : [...resultado.criadas, ...resultado.alteradas]
    : [];
  const vagasImpactadasExibidas =
    tipo === "AMPLIACAO" || tipo === "REDUCAO" || tipo === "TRANSFORMACAO"
      ? vagasImpactadas.slice(primeiraVagaImpactada, primeiraVagaImpactada + 10)
      : vagasImpactadas.slice(0, 8);
  const orgaosResultantes = tipo === "INCLUSAO_ORGAO"
    ? [...new Set([...orgaosAtuais, orgaoAlteracao].filter(Boolean))]
    : tipo === "EXCLUSAO_ORGAO"
      ? orgaosAtuais.filter((orgao) => orgao !== orgaoAlteracao)
      : orgaosAtuais;

  return (
    <section className="prototype-legal-card">
      {versaoAgendada && (
        <MensagemSeplag
          severity="warning"
          message={`Existe uma versão ${versaoAgendada.versao} agendada para ${versaoAgendada.dataAtivacao?.split("-").reverse().join("/") || versaoAgendada.inicioVigencia}. Se você continuar, ela será substituída pela nova versão.`}
        />
      )}
<form onSubmit={simular}>
        <section className="prototype-legal-version-context">
          <span>Quadro que será versionado</span>
          <div>
            <strong>{registro.codigo}</strong>
            <h3>{registro.cargo}</h3>
            <em>Versão vigente {registro.versao}</em>
          </div>
          <dl className="prototype-legal-version-summary">
            <div><dt>Autorizadas</dt><dd>{resumoQuadro.autorizadas}</dd></div>
            <div><dt>Ocupadas</dt><dd>{resumoQuadro.ocupadas}</dd></div>
            <div><dt>Comprometidas</dt><dd>{resumoQuadro.comprometidas}</dd></div>
            <div><dt>Disponíveis</dt><dd>{resumoQuadro.disponiveis}</dd></div>
            <div><dt>Pendentes de ato</dt><dd>{resumoQuadro.pendentes}</dd></div>
          </dl>          <p><i className="pi pi-info-circle" /> A versão vigente será preservada. Selecione a lei ou o ato legal que fundamenta a alteração e simule seu impacto antes de registrar a nova versão.</p>
        </section>
        <BaseLegalVinculada
          className="prototype-legal-documents"
          value={documentosLegaisIds}
          onChange={(ids) => {
            setDocumentosLegaisIds(ids);
            setResultado(null);
            resetarOperacoesDistributivas();
            setSalvo(false);
          }}
        />
        <div className="prototype-legal-types">
          {tiposAlteracaoDisponiveis.map((item) => (
            <button
              key={item}
              type="button"
              className={tipo === item ? "active" : ""}
              disabled={item === "EXTINCAO_PROGRESSIVA" && Boolean(registro.extincaoProgressivaEmAndamento)}
              title={item === "EXTINCAO_PROGRESSIVA" && registro.extincaoProgressivaEmAndamento ? "A extinção progressiva deste quadro já está em andamento." : undefined}
              onClick={() => {
                setTipo(item);
                if (item !== "TRANSFORMACAO") {
                  setOperacaoValue("quadroDestinoId", null);
                }
                setResultado(null);
                setSalvo(false);
                setReducaoPorOrgao({});
                setTransformacaoPorOrgao({});
                setOperacaoValue("orgaoAlteracao", "");
                setOperacaoValue("orgaoOrigemRedistribuicao", "");
                setOperacaoValue("orgaoDestinoRedistribuicao", "");
                setOperacaoValue("quantidadeRedistribuicao", 1);
                resetarOperacoesDistributivas();
              }}
            >
              <i
                className={
                  item === "AMPLIACAO" || item === "INCLUSAO_ORGAO"
                    ? "pi pi-plus-circle"
                    : item === "REDUCAO" || item === "EXCLUSAO_ORGAO"
                      ? "pi pi-minus-circle"
                      : item === "TRANSFORMACAO"
                        ? "pi pi-sync"
                        : item === "DISTRIBUICAO"
                          ? "pi pi-sitemap"
                          : item === "REDISTRIBUICAO"
                            ? "pi pi-arrow-right-arrow-left"
                            : "pi pi-ban"
                }
              />
              <strong>{rotulos[item]}</strong>
              <small>{descricoes[item]}</small>
            </button>
          ))}
        </div>
        {alteracaoSomenteOrgao && (
          <section className="prototype-legal-organization-change">
            <DropdownFieldSeplag
              name="orgaoAlteracao"
              control={operacaoControl}
              label={tipo === "INCLUSAO_ORGAO" ? "Órgão a incluir" : "Órgão a excluir"}
              required
              options={tipo === "INCLUSAO_ORGAO" ? opcoesInclusaoOrgao : opcoesExclusaoOrgao}
              optionLabel="label"
              optionValue="value"
              placeholder={tipo === "INCLUSAO_ORGAO" ? "Selecione um órgão ainda não permitido" : "Selecione um órgão permitido pelo quadro"}
              cols="12"
              filter
              showClear
              onChange={() => {
                setResultado(null);
                setSalvo(false);
              }}
              getFormErrorMessage={() => null}
            />
            {tipo === "INCLUSAO_ORGAO" && orgaoAlteracao && (
              <MensagemSeplag severity="info" message="O órgão será incluído entre os destinos permitidos pela lei. Nenhuma vaga será distribuída automaticamente." />
            )}
            {tipo === "EXCLUSAO_ORGAO" && orgaoAlteracao && (
              <>
                <dl>
                  <div><dt>Vagas atribuídas</dt><dd>{resumoOrgaoExclusao.atribuidas}</dd></div>
                  <div><dt>Ocupadas</dt><dd>{resumoOrgaoExclusao.ocupadas}</dd></div>
                  <div><dt>Disponíveis</dt><dd>{resumoOrgaoExclusao.disponiveis}</dd></div>
                  <div><dt>Comprometidas</dt><dd>{resumoOrgaoExclusao.comprometidas}</dd></div>
                </dl>
                <MensagemSeplag
                  severity={exclusaoOrgaoBloqueada ? "error" : "success"}
                  message={exclusaoOrgaoBloqueada
                    ? "O órgão ainda possui vagas atribuídas. Redistribua todas as vagas antes de excluí-lo do quadro."
                    : "O órgão não possui vagas atribuídas e está elegível para exclusão do quadro."}
                />
              </>
            )}
          </section>
        )}
        {tipo === "DISTRIBUICAO" && (
          <section className="prototype-legal-distribution-version">
            <header>
              <div>
                <h3>Destinações da distribuição</h3>
                <p>Consulte o que já está distribuído e acrescente apenas vagas pendentes.</p>
              </div>
              <BotaoAdicionarSeplag
                type="button"
                label="Adicionar destinação"
                onClick={adicionarDestinacaoDistribuicao}
              />
            </header>
            {erroDistribuicao && (
              <MensagemSeplag severity="error" message={erroDistribuicao} />
            )}
            <div className="prototype-legal-distribution-summary-inline">
              <span>Já distribuídas</span>
              <strong>{distribuicaoAtualOrgaos.distribuidas.toLocaleString("pt-BR")} vagas</strong>
              <span>Pendente de distribuição</span>
              <strong>{distribuicaoAtualOrgaos.pendentes.toLocaleString("pt-BR")} vagas</strong>
            </div>
            <div className="prototype-legal-distribution-head">
              <span>Órgão *</span>
              <span>Quantidade atual</span>
              <span>A adicionar *</span>
              <span>Ações</span>
            </div>
            {linhasDistribuicao.map((item) => (
              <div
                className={`prototype-legal-distribution-row${item.fixa ? " is-locked" : ""}`}
                key={`${item.fixa ? "atual" : "nova"}-${item.id}-${item.orgao || "vazio"}`}
              >
                <label>
                  <span>Órgão *</span>
                  {item.fixa ? (
                    <div className="prototype-legal-distribution-locked-orgao">
                      <strong>{item.orgao}</strong>
                      <i className="pi pi-lock" aria-hidden="true" />
                    </div>
                  ) : (
                    <Dropdown
                      aria-label="Órgão"
                      value={item.orgao}
                      options={opcoesOrgaoDistribuicao(item)}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Selecione"
                      showClear
                      filter
                      className="prototype-legal-distribution-dropdown"
                      onChange={(event) =>
                        atualizarDestinacaoDistribuicao(item.id, "orgao", event.value ?? "")
                      }
                    />
                  )}
                </label>
                <label>
                  <span>Quantidade atual</span>
                  <input
                    aria-label={`Quantidade atual de ${item.orgao || "nova destinação"}`}
                    type="number"
                    value={item.quantidadeAtual}
                    readOnly
                  />
                </label>
                <label>
                  <span>A adicionar *</span>
                  <input
                    aria-label={`Adicionar vagas para ${item.orgao || "nova destinação"}`}
                    aria-invalid={excedenteDistribuicao > 0}
                    className={excedenteDistribuicao > 0 ? "is-invalid" : undefined}
                    type="number"
                    min={item.fixa ? 0 : 1}
                    step={1}
                    value={item.quantidade}
                    onChange={(event) =>
                      item.fixa
                        ? atualizarAcrecimoDistribuicaoAtual(
                            item.orgao,
                            Math.max(0, Math.floor(Number(event.target.value) || 0)),
                          )
                        : atualizarDestinacaoDistribuicao(
                            item.id,
                            "quantidade",
                            Math.max(1, Math.floor(Number(event.target.value) || 1)),
                          )
                    }
                  />
                </label>
                <div>
                  <span>Ações</span>
                  {item.fixa ? (
                    <span className="prototype-legal-distribution-locked-action">Fixo</span>
                  ) : (
                    <BotaoIconSeplag
                      type="button"
                      tooltip="Remover destinação"
                      aria-label="Remover destinação"
                      icon="pi pi-trash"
                      severity="danger"
                      disabled={destinacoesDistribuicao.length === 1}
                      onClick={() => removerDestinacaoDistribuicao(item.id)}
                    />
                  )}
                </div>
              </div>
            ))}
            {excedenteDistribuicao > 0 && (
              <MensagemSeplag
                severity="error"
                message={`A quantidade informada excede o saldo pendente de distribuição em ${excedenteDistribuicao} ${excedenteDistribuicao === 1 ? "vaga" : "vagas"}.`}
              />
            )}
            <footer>
              <span>A distribuir nesta versão</span>
              <strong className={excedenteDistribuicao > 0 ? "is-invalid" : undefined}>
                {totalDistribuicaoInformado}{" "}
                {totalDistribuicaoInformado === 1 ? "vaga" : "vagas"}
              </strong>
              {excedenteDistribuicao > 0 ? (
                <>
                  <span>Excedente</span>
                  <strong className="is-invalid">
                    {excedenteDistribuicao}{" "}
                    {excedenteDistribuicao === 1 ? "vaga" : "vagas"}
                  </strong>
                </>
              ) : (
                <>
                  <span>Saldo pendente após operação</span>
                  <strong>
                    {saldoPendenteAposDistribuicao}{" "}
                    {saldoPendenteAposDistribuicao === 1 ? "vaga" : "vagas"}
                  </strong>
                </>
              )}
            </footer>
          </section>
        )}
        {tipo === "REDISTRIBUICAO" && (
          <section className="prototype-legal-redistribution-version">
            {erroRedistribuicao && (
              <MensagemSeplag severity="error" message={erroRedistribuicao} />
            )}
            <div className="prototype-legal-redistribution-route">
              <article>
                <header>
                  <span className="prototype-legal-redistribution-icon is-origin">
                    <i className="pi pi-building" />
                  </span>
                  <div>
                    <span>Origem</span>
                    <strong>Órgão atual das vagas</strong>
                  </div>
                </header>
                <label>
                  <span>Órgão de origem *</span>
                  <Dropdown
                    aria-label="Órgão de origem"
                    value={orgaoOrigemRedistribuicao}
                    options={opcoesOrigemRedistribuicao}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecione o órgão de origem"
                    showClear
                    filter
                    className="prototype-legal-distribution-dropdown"
                    onChange={(event) => {
                      const valor = event.value ?? "";
                      setOperacaoValue("orgaoOrigemRedistribuicao", valor);
                      if (valor === orgaoDestinoRedistribuicao) {
                        setOperacaoValue("orgaoDestinoRedistribuicao", "");
                      }
                      setResultado(null);
                      resetarRedistribuicao();
                    }}
                  />
                </label>
              </article>
              <div className="prototype-legal-redistribution-arrow" aria-hidden="true">
                <i className="pi pi-arrow-right" />
              </div>
              <article>
                <header>
                  <span className="prototype-legal-redistribution-icon is-destination">
                    <i className="pi pi-map-marker" />
                  </span>
                  <div>
                    <span>Destino</span>
                    <strong>Novo órgão das vagas</strong>
                  </div>
                </header>
                <label>
                  <span>Órgão de destino *</span>
                  <Dropdown
                    aria-label="Órgão de destino"
                    value={orgaoDestinoRedistribuicao}
                    options={opcoesDestinoRedistribuicao}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecione o órgão de destino"
                    showClear
                    filter
                    className="prototype-legal-distribution-dropdown"
                    onChange={(event) => {
                      setOperacaoValue("orgaoDestinoRedistribuicao", event.value ?? "");
                      setResultado(null);
                      resetarRedistribuicao();
                    }}
                  />
                </label>
              </article>
            </div>
            <div className="prototype-legal-redistribution-quantity">
              <NumberFieldSeplag
                name="quantidadeRedistribuicao"
                control={operacaoControl}
                label="Quantidade de vagas"
                required
                cols="12"
                min={1}
                max={Math.max(1, vagasElegiveisRedistribuicao.length)}
                onChange={() => {
                  setResultado(null);
                  resetarRedistribuicao();
                }}
                getFormErrorMessage={() => null}
              />
              <small>O sistema selecionará automaticamente as vagas elegíveis de maior sequencial.</small>
            </div>
          </section>
        )}
        {tipo === "REDUCAO" && (
          <section className="prototype-legal-reduction-allocation">
            <header>
              <div>
                <h3>Redução por órgão de distribuição</h3>
                <p>Somente vagas disponíveis, regulares e sem comprometimento ativo podem ser reduzidas.</p>
              </div>
              <strong>{totalSolicitadoReducao} vaga(s) selecionada(s)</strong>
            </header>
            <table>
              <thead><tr><th>Órgão</th><th>Distribuídas</th><th>Ocupadas</th><th>Comprometidas</th><th>Disponíveis</th><th>Quantidade a reduzir</th><th>Efeito previsto</th></tr></thead>
              <tbody>{vagasPorOrgao.map((grupo) => {
                const reduzir = reducaoPorOrgao[grupo.orgao] ?? 0;
                const excedeuDisponiveis = reduzir > grupo.elegiveis.length;
                return <tr key={grupo.orgao}>
                  <td><strong>{grupo.orgao}</strong></td><td>{grupo.vagas.length}</td><td>{grupo.ocupadas}</td><td>{grupo.comprometidas}</td><td>{grupo.elegiveis.length}</td>
                  <td><input aria-label={`Reduzir vagas de ${grupo.orgao}`} aria-invalid={excedeuDisponiveis} className={excedeuDisponiveis ? "is-invalid" : undefined} type="number" min={0} value={reducaoPorOrgao[grupo.orgao] ?? 0} onChange={(event) => {
                    const valor = Math.max(0, Math.floor(Number(event.target.value) || 0));
                    const proximo = {...reducaoPorOrgao, [grupo.orgao]: valor};
                    setReducaoPorOrgao(proximo);
                    setOperacaoValue("quantidade", Object.values(proximo).reduce((total, item) => total + item, 0));
                    setResultado(null);
                  }} /></td>
                  <td>{excedeuDisponiveis
                    ? <span className="is-invalid-effect">Quantidade superior às {grupo.elegiveis.length} vaga(s) disponíveis.</span>
                    : <span className="is-immediate">{reduzir} extinta(s) imediatamente</span>}
                  </td>
                </tr>;
              })}</tbody>
            </table>
          </section>
        )}
        {tipo === "TRANSFORMACAO" && (
          <section className="prototype-legal-reduction-allocation prototype-legal-transformation-allocation">
            <header>
              <div>
                <h3>Transformação por órgão de distribuição</h3>
                <p>Somente vagas disponíveis ou ocupadas, regulares e sem comprometimento ativo podem ser transformadas.</p>
              </div>
              <strong>{totalSolicitadoTransformacao} vaga(s) selecionada(s)</strong>
            </header>
            <div className="prototype-legal-transformation-destination-field">
              <DropdownFieldSeplag
                name="quadroDestinoId"
                control={operacaoControl}
                label="Quadro Autorizado de destino"
                required
                options={opcoesQuadroDestino}
                optionLabel="label"
                optionValue="value"
                onChange={() => {
                  setResultado(null);
                  setSalvo(false);
                  setReducaoPorOrgao({});
                  setTransformacaoPorOrgao({});
                  setOperacaoValue("orgaoAlteracao", "");
                }}
                placeholder="Selecione o quadro de destino"
                cols="12"
                getFormErrorMessage={() => null}
              />
            </div>
            {quadroDestino ? (
              <div className="prototype-legal-transformation-target">
                <span>Origem das vagas</span>
                <strong>{registro.codigo} · {registro.cargo}</strong>
              </div>
            ) : (
              <MensagemSeplag severity="info" message="Selecione o Quadro Autorizado de destino para informar as quantidades por órgão." />
            )}
            <table>
              <thead><tr><th>Órgão</th><th>Distribuídas</th><th>Disponíveis</th><th>Ocupadas</th><th>Comprometidas</th><th>Elegíveis</th><th>Quantidade a transformar</th><th>Destino</th></tr></thead>
              <tbody>{vagasPorOrgao.map((grupo) => {
                const elegiveisTransformacao = grupo.vagas.filter(
                  (vaga) =>
                    vaga.situacaoLegal === "REGULAR" &&
                    (vaga.estado === "DISPONIVEL" || vaga.estado === "OCUPADA") &&
                    !idsVagasComprometidas.has(vaga.id),
                ).length;
                const transformar = transformacaoPorOrgao[grupo.orgao] ?? 0;
                const excedeuElegiveis = transformar > elegiveisTransformacao;
                return <tr key={grupo.orgao}>
                  <td><strong>{grupo.orgao}</strong></td><td>{grupo.vagas.length}</td><td>{grupo.disponiveis}</td><td>{grupo.ocupadas}</td><td>{grupo.comprometidas}</td><td>{elegiveisTransformacao}</td>
                  <td><input aria-label={`Transformar vagas de ${grupo.orgao}`} aria-invalid={excedeuElegiveis} className={excedeuElegiveis ? "is-invalid" : undefined} type="number" min={0} value={transformar} disabled={!quadroDestino} onChange={(event) => {
                    const valor = Math.max(0, Math.floor(Number(event.target.value) || 0));
                    const proximo = {...transformacaoPorOrgao, [grupo.orgao]: valor};
                    setTransformacaoPorOrgao(proximo);
                    setOperacaoValue("quantidade", Object.values(proximo).reduce((total, item) => total + item, 0));
                    setResultado(null);
                  }} /></td>
                  <td>{excedeuElegiveis
                    ? <span className="is-invalid-effect">Quantidade superior às {elegiveisTransformacao} vaga(s) elegíveis.</span>
                    : <span className="is-immediate">{quadroDestino ? `${transformar} para ${quadroDestino.codigo}` : "Selecione o destino"}</span>}
                  </td>
                </tr>;
              })}</tbody>
            </table>
          </section>
        )}
        {tipo === "EXTINCAO_PROGRESSIVA" && (
          <section className="prototype-legal-extinction-guidance">
            <MensagemSeplag
              severity="info"
              message={`A operação alcançará o quadro inteiro: ${resumoQuadro.disponiveis + resumoQuadro.pendentes} vaga(s) disponível(is) serão extintas e ${resumoQuadro.ocupadas} ocupada(s) permanecerão até a vacância.`}
            />
            {vagasComprometidasAtivas.length > 0 && (
              <MensagemSeplag
                severity="warning"
                message={`${vagasComprometidasAtivas.length} vaga(s) possui(em) comprometimento ativo e permanecerá(ão) controlada(s) até a conclusão dos respectivos processos.`}
              />
            )}
            {extincaoJaIniciada && (
              <MensagemSeplag severity="warning" message="A extinção progressiva deste quadro já está em andamento e não pode ser iniciada novamente." />
            )}
          </section>
        )}        <div className="prototype-legal-fields prototype-legal-library-fields">
          <DateFieldSeplag
            name="dataEfeito"
            control={operacaoControl}
            label="Data de efeito"
            required
            cols="12 12 3"
            onChange={() => {
              setResultado(null);
              resetarOperacoesDistributivas();
            }}
            getFormErrorMessage={() => null}
          />
          <TextFieldSeplag
            name="processo"
            label="Processo SIGADOC"
            required
            value={processo}
            onChange={(value) => {
              setProcesso(value);
              setResultado(null);
              resetarOperacoesDistributivas();
            }}
            cols="12 12 4"
          />
          {tipo !== "EXTINCAO_PROGRESSIVA" && tipo !== "REDUCAO" && tipo !== "TRANSFORMACAO" && tipo !== "DISTRIBUICAO" && tipo !== "REDISTRIBUICAO" && !alteracaoSomenteOrgao && (
            <NumberFieldSeplag
              name="quantidade"
              control={operacaoControl}
              label="Quantidade"
              required
              cols="12 12 2"
              min={1}
              max={tipo === "AMPLIACAO" ? 9999 : vagasOriginais.length}
              getFormErrorMessage={() => null}
            />
          )}
        </div>
        <TextAreaFieldSeplag
          name="observacao"
          control={operacaoControl}
          label="Observação"
          cols="12"
          rows={3}
          maxLength={1000}
          placeholder="Informe uma observação, se necessário"
          onChange={() => {
            setResultado(null);
            resetarOperacoesDistributivas();
          }}
          getFormErrorMessage={() => null}
        />
        {tipo === "DISTRIBUICAO" && (
          <section className="prototype-legal-distribution-availability">
            <article>
              <span>Já distribuídas</span>
              <strong>{distribuicaoAtualOrgaos.distribuidas}</strong>
            </article>
            <article>
              <span>Pendentes de distribuição</span>
              <strong>{distribuicaoAtualOrgaos.pendentes}</strong>
            </article>
            <article>
              <span>A distribuir nesta versão</span>
              <strong className={excedenteDistribuicao > 0 ? "is-invalid" : undefined}>
                {totalDistribuicaoInformado}
              </strong>
            </article>
            {excedenteDistribuicao > 0 ? (
              <article className="is-invalid">
                <span>Excedente</span>
                <strong>{excedenteDistribuicao}</strong>
              </article>
            ) : (
              <article>
                <span>Saldo pendente após operação</span>
                <strong>{saldoPendenteAposDistribuicao}</strong>
              </article>
            )}
            <small>
              A distribuição só acrescenta vagas pendentes elegíveis. Para mover vagas entre órgãos, use Redistribuição.
            </small>
          </section>
        )}
        {tipo === "TRANSFORMACAO" && (
          <section className="prototype-legal-distribution-availability">
            <article>
              <span>Vagas elegíveis na origem</span>
              <strong>{vagasPorOrgao.reduce((total, grupo) => total + grupo.vagas.filter(
                (vaga) =>
                  vaga.situacaoLegal === "REGULAR" &&
                  (vaga.estado === "DISPONIVEL" || vaga.estado === "OCUPADA") &&
                  !idsVagasComprometidas.has(vaga.id),
              ).length, 0)}</strong>
            </article>
            <article>
              <span>Quantidade informada</span>
              <strong className={transformacaoInvalida && totalSolicitadoTransformacao > 0 ? "is-invalid" : undefined}>
                {totalSolicitadoTransformacao}
              </strong>
            </article>
            <article>
              <span>Destino</span>
              <strong>{quadroDestino?.codigo ?? "Não selecionado"}</strong>
            </article>
            <article>
              <span>Destino após transformação</span>
              <strong>{quadroDestino ? quadroDestino.autorizadas + totalSolicitadoTransformacao : 0}</strong>
            </article>
            <small>
              Vagas comprometidas não são elegíveis para transformação.
            </small>
          </section>
        )}
        {tipo === "REDISTRIBUICAO" && (
          <section className="prototype-legal-distribution-availability">
            <article>
              <span>Vagas elegíveis</span>
              <strong>{vagasElegiveisRedistribuicao.length}</strong>
            </article>
            <article>
              <span>Quantidade informada</span>
              <strong>{quantidadeRedistribuicaoInformada}</strong>
            </article>
            <article>
              <span>Saldo restante</span>
              <strong>{saldoRedistribuicao}</strong>
            </article>
            <small>
              Ocupadas, comprometidas ou com situação legal especial foram excluídas.
            </small>
          </section>
        )}
        <div className="prototype-legal-simulate-action">
          <BotaoSeplag
            type="submit"
            label={tipo === "DISTRIBUICAO" ? "Simular distribuição" : tipo === "REDISTRIBUICAO" ? "Simular redistribuição" : "Simular impacto legal"}
            icon={tipo === "DISTRIBUICAO" || tipo === "REDISTRIBUICAO" ? "pi pi-check" : "pi pi-calculator"}
            disabled={camposObrigatoriosIncompletos}
          />
        </div>
      </form>
      <MensagemSeplag
        visible={salvo}
        severity="success"
        message="Nova versão registrada com sucesso."
      />
      {tipo === "DISTRIBUICAO" && distribuicaoSimulada && (
        <div className="prototype-legal-result">
          <header>
            <div>
              <span>Resultado da simulação</span>
              <h3>Distribuição</h3>
            </div>
            <span className="ok">Consistente</span>
          </header>
          <section className="prototype-legal-transformation-balance">
            <article><span>Quadro vigente</span><strong>{registro.codigo} · versão {registro.versao}</strong></article>
            <article><span>Quadro resultante</span><strong>{registro.codigo} · versão {proximaVersao}</strong></article>
            <article><span>Data de efeito</span><strong>{dataEfeito.split("-").reverse().join("/")}</strong></article>
            <article><span>Situação resultante</span><strong>{dataEfeito > hoje ? "Agendado" : "Ativo"}</strong></article>
            <article><span>Evolução registrada</span><strong>Distribuição</strong></article>
          </section>
          <div className="prototype-legal-result-kpis">
            <article>
              <span>Vagas elegíveis</span>
              <strong>{vagasElegiveisDistribuicao.length}</strong>
            </article>
            <article>
              <span>Total a distribuir</span>
              <strong>{totalDistribuicaoInformado}</strong>
            </article>
            <article>
              <span>Destinações</span>
              <strong>{destinacoesDistribuicaoInformadas.length}</strong>
            </article>
            <article>
              <span>Saldo restante</span>
              <strong>
                {Math.max(0, vagasElegiveisDistribuicao.length - totalDistribuicaoInformado)}
              </strong>
            </article>
          </div>
          <section className="prototype-legal-distribution-simulation">
            <div>
              {destinacoesDistribuicaoInformadas.map((item) => (
                <article key={item.id}>
                  <span>{item.orgao}</span>
                  <strong>
                    {item.quantidade} {item.quantidade === 1 ? "vaga" : "vagas"}
                  </strong>
                </article>
              ))}
            </div>
            <ul>
              {vagasSelecionadasDistribuicao.slice(0, 10).map((vaga) => (
                <li key={vaga.id}>{vaga.id}</li>
              ))}
            </ul>
            {vagasSelecionadasDistribuicao.length > 10 && (
              <small>
                e mais {vagasSelecionadasDistribuicao.length - 10} vagas numeradas.
              </small>
            )}
          </section>
          <footer>
            <BotaoSalvarSeplag
              type="button"
              label="Registrar nova versão"
              disabled={operacaoInvalida || salvo}
              onClick={() => setConfirmacaoAberta(true)}
            />
          </footer>
        </div>
      )}
      {tipo === "REDISTRIBUICAO" && redistribuicaoSimulada && (
        <div className="prototype-legal-result">
          <header>
            <div>
              <span>Resultado da simulação</span>
              <h3>Redistribuição</h3>
            </div>
            <span className="ok">Consistente</span>
          </header>
          <section className="prototype-legal-transformation-balance">
            <article><span>Quadro vigente</span><strong>{registro.codigo} · versão {registro.versao}</strong></article>
            <article><span>Quadro resultante</span><strong>{registro.codigo} · versão {proximaVersao}</strong></article>
            <article><span>Data de efeito</span><strong>{dataEfeito.split("-").reverse().join("/")}</strong></article>
            <article><span>Situação resultante</span><strong>{dataEfeito > hoje ? "Agendado" : "Ativo"}</strong></article>
          </section>
          <div className="prototype-legal-result-kpis">
            <article>
              <span>Vagas elegíveis</span>
              <strong>{vagasElegiveisRedistribuicao.length}</strong>
            </article>
            <article>
              <span>Total a redistribuir</span>
              <strong>{quantidadeRedistribuicaoInformada}</strong>
            </article>
            <article>
              <span>Origem</span>
              <strong>{orgaoOrigemRedistribuicao}</strong>
            </article>
            <article>
              <span>Destino</span>
              <strong>{orgaoDestinoRedistribuicao}</strong>
            </article>
          </div>
          <section className="prototype-legal-distribution-simulation">
            <div>
              <article>
                <span>Movimentação</span>
                <strong>
                  {orgaoOrigemRedistribuicao} para {orgaoDestinoRedistribuicao}
                </strong>
              </article>
              <article>
                <span>Quantidade</span>
                <strong>
                  {quantidadeRedistribuicaoInformada}{" "}
                  {quantidadeRedistribuicaoInformada === 1 ? "vaga" : "vagas"}
                </strong>
              </article>
              <article>
                <span>Saldo na origem</span>
                <strong>{saldoRedistribuicao}</strong>
              </article>
              <article>
                <span>Saldo anterior no destino</span>
                <strong>{saldoDestinoRedistribuicaoAtual}</strong>
              </article>
              <article>
                <span>Saldo resultante no destino</span>
                <strong>{saldoDestinoRedistribuicaoAtual + quantidadeRedistribuicaoInformada}</strong>
              </article>
              <article>
                <span>Evoluções registradas</span>
                <strong>Redistribuição - Origem · Redistribuição - Destino</strong>
              </article>
            </div>
            <ul>
              {vagasSelecionadasRedistribuicao.slice(0, 10).map((vaga) => (
                <li key={vaga.id}>{vaga.id}</li>
              ))}
            </ul>
            {vagasSelecionadasRedistribuicao.length > 10 && (
              <small>
                e mais {vagasSelecionadasRedistribuicao.length - 10} vagas numeradas.
              </small>
            )}
          </section>
          <footer>
            <BotaoSalvarSeplag
              type="button"
              label="Registrar nova versão"
              disabled={operacaoInvalida || salvo}
              onClick={() => setConfirmacaoAberta(true)}
            />
          </footer>
        </div>
      )}
      {resultado && (
        <div className="prototype-legal-result">
          <header>
            <div>
              <span>Resultado da simulação</span>
              <h3>{rotulos[tipo]}</h3>
            </div>
            <span className={resultado.alertas.length ? "warning" : "ok"}>
              {resultado.alertas.length ? "Requer atenção" : "Consistente"}
            </span>
          </header>
          <section className="prototype-legal-transformation-balance">
            {tipo === "AMPLIACAO" || tipo === "REDUCAO" ? (
              <article><span>Versionamento do quadro</span><strong>{registro.codigo} · versão {registro.versao} → versão {proximaVersao}</strong></article>
            ) : tipo !== "TRANSFORMACAO" ? (
              <>
                <article><span>Quadro vigente</span><strong>{registro.codigo} · versão {registro.versao}</strong></article>
                <article><span>Quadro resultante</span><strong>{registro.codigo} · versão {proximaVersao}</strong></article>
              </>
            ) : null}
            <article><span>Data de efeito</span><strong>{dataEfeito.split("-").reverse().join("/")}</strong></article>
            <article><span>Situação resultante</span><strong>{dataEfeito > hoje ? "Agendado" : tipo === "EXTINCAO_PROGRESSIVA" && resultado.quantitativoPosterior > 0 ? "Encerrado" : tipo === "EXTINCAO_PROGRESSIVA" ? "Extinto" : "Ativo"}</strong></article>
            {tipo !== "AMPLIACAO" && tipo !== "REDUCAO" && tipo !== "TRANSFORMACAO" && <article><span>Evolução registrada</span><strong>{rotulos[tipo]}</strong></article>}
          </section>
          {tipo !== "TRANSFORMACAO" && <div className="prototype-legal-result-kpis">
            {tipo === "AMPLIACAO" ? (
              <>
                <article><span>Quantidade atual</span><strong>{resultado.quantitativoAnterior}</strong></article>
                <article><span>Ampliação</span><strong>+{resultado.criadas.length}</strong></article>
                <article><span>Quantidade resultante</span><strong>{resultado.quantitativoPosterior}</strong></article>
              </>
            ) : tipo === "REDUCAO" ? (
              <>
                <article><span>Quantidade atual</span><strong>{resultado.quantitativoAnterior}</strong></article>
                <article><span>Redução</span><strong>-{resultado.alteradas.length}</strong></article>
                <article><span>Quantidade resultante</span><strong>{resultado.quantitativoPosterior}</strong></article>
              </>
            ) : (
              <>
                <article><span>Quadro anterior</span><strong>{resultado.quantitativoAnterior}</strong></article>
                <article><span>{tipo === "TRANSFORMACAO" ? "Origem resultante" : "Quadro resultante"}</span><strong>{resultado.quantitativoPosterior}</strong></article>
                <article><span>Vagas geradas</span><strong>{resultado.criadas.length}</strong></article>
                <article><span>Vagas afetadas</span><strong>{resultado.alteradas.length}</strong></article>
              </>
            )}
          </div>}
          {tipo === "REDUCAO" && (
            <section className="prototype-legal-transformation-balance">
              <article><span>Vagas elegíveis para redução</span><strong>{vagasPorOrgao.reduce((total, grupo) => total + grupo.elegiveis.length, 0)}</strong></article>
              <article><span>Vagas selecionadas</span><strong>{resultado.alteradas.length}</strong></article>
              <article><span>Ocupadas</span><strong>{resumoQuadro.ocupadas}</strong></article>
              <article><span>Comprometidas (podem incluir ocupadas)</span><strong>{resumoQuadro.comprometidas}</strong></article>
            </section>
          )}
          {alteracaoSomenteOrgao && orgaoAlteracao && (
            <section className="prototype-legal-transformation-balance">
              <article><span>Órgão</span><strong>{orgaoAlteracao}</strong></article>
              <article><span>Operação</span><strong>{tipo === "INCLUSAO_ORGAO" ? "Será incluído" : "Será excluído"}</strong></article>
              <article><span>Órgãos antes</span><strong>{orgaosAtuais.length}</strong></article>
              <article><span>Órgãos após</span><strong>{orgaosResultantes.length}</strong></article>
            </section>
          )}
          {tipo === "EXTINCAO_PROGRESSIVA" && (
            <section className="prototype-legal-transformation-balance">
              <article><span>Extintas imediatamente</span><strong>{resultado.alteradas.filter((vaga) => vaga.situacaoLegal === "EXTINTA").length}</strong></article>
              <article><span>Ocupadas mantidas até a vacância</span><strong>{resultado.alteradas.filter((vaga) => vaga.situacaoLegal === "EM_EXTINCAO" && vaga.estado === "OCUPADA" && !idsVagasComprometidas.has(vaga.id)).length}</strong></article>
              <article><span>Comprometidas mantidas até a conclusão</span><strong>{resultado.alteradas.filter((vaga) => vaga.situacaoLegal === "EM_EXTINCAO" && idsVagasComprometidas.has(vaga.id)).length}</strong></article>
              <article><span>Total remanescente</span><strong>{resultado.quantitativoPosterior}</strong></article>
              <article><span>Situação resultante</span><strong>{resultado.quantitativoPosterior > 0 ? "Encerrado" : "Extinto"}</strong></article>
              <article><span>Novos ingressos</span><strong>Bloqueados</strong></article>
              <article><span>Encerramento do quadro</span><strong>Após a última vacância</strong></article>
            </section>
          )}          {tipo === "TRANSFORMACAO" && quadroDestino && (
            <section className="prototype-legal-transformation-balance">
              <article><span>Origem</span><strong>{registro.codigo} · versão {registro.versao} → {proximaVersao}</strong><small>{resultado.quantitativoAnterior} − {resultado.alteradas.length} = {resultado.quantitativoPosterior}</small></article>
              <article><span>Destino</span><strong>{quadroDestino.codigo} · versão {quadroDestino.versao} → {quadroDestino.versao + 1}</strong><small>{quadroDestino.autorizadas} + {resultado.criadas.length} = {quadroDestino.autorizadas + resultado.criadas.length}</small></article>
              <article><span>Vagas transformadas</span><strong>{resultado.alteradas.length}</strong></article>
              <article><span>Livres / Ocupadas</span><strong>{resultado.alteradas.filter((vaga) => vaga.estado === "DISPONIVEL").length} / {resultado.alteradas.filter((vaga) => vaga.estado === "OCUPADA").length}</strong></article>
              <article><span>Evolução da origem</span><strong>Transformação - Origem</strong></article>
              <article><span>Evolução do destino</span><strong>Transformação - Destino</strong></article>
            </section>
          )}          {resultado.alertas.map((alerta) => (
            <MensagemSeplag key={alerta} severity="warning" message={alerta} />
          ))}
          {tipo === "AMPLIACAO" && resultado.criadas.length > 0 && (
            <MensagemSeplag
              severity="info"
              message={`${resultado.criadas.length} vaga(s) será(ão) criada(s) como Pendente(s) de distribuição.`}
            />
          )}
          {tipo === "REDUCAO" && resultado.alteradas.length > 0 && (
            <MensagemSeplag
              severity="info"
              message={`Serão extintas ${resultado.alteradas.length} vaga(s) disponível(is), regular(es) e sem comprometimento, priorizando os maiores sequenciais.`}
            />
          )}
          {quantidadeImpactada > 0 && (
            <div className="prototype-legal-impact-list">
              <h4>{tipo === "REDUCAO" ? "Vagas que serão extintas" : tipo === "AMPLIACAO" ? "Vagas que serão criadas" : tipo === "TRANSFORMACAO" ? "Vagas que serão transformadas" : "Amostra das vagas impactadas"}</h4>
              <table>
                <thead>
                  <tr>
                    <th>Sequencial</th>
                    {tipo === "TRANSFORMACAO" ? <><th>Nome atual</th><th>Nome resultante</th><th>Condição</th></> : <th>Nome da vaga</th>}
                    {tipo !== "AMPLIACAO" && tipo !== "REDUCAO" && tipo !== "TRANSFORMACAO" && <th>Efeito</th>}
                    {tipo !== "AMPLIACAO" && tipo !== "REDUCAO" && tipo !== "TRANSFORMACAO" && <th>Estado</th>}
                    {tipo !== "AMPLIACAO" && tipo !== "REDUCAO" && tipo !== "TRANSFORMACAO" && <th>Situação legal</th>}
                  </tr>
                </thead>
                <tbody>
                  {vagasImpactadasExibidas.map((vaga) => (
                      <tr key={vaga.id + "-" + vaga.situacaoLegal}>
                        <td><strong>{vaga.sequencial}</strong></td>
                        {tipo === "TRANSFORMACAO" ? (
                          <>
                            <td><strong>{resultado.alteradas.find((origem) => origem.id === vaga.id)?.nome ?? resultado.alteradas.find((origem) => origem.id === vaga.id)?.id.replace(/^VAG-/, "")}</strong></td>
                            <td><strong>{vaga.nome ?? "Ainda não atribuído"}</strong></td>
                            <td>{vaga.estado === "OCUPADA" ? "Ocupada" : "Disponível"}</td>
                          </>
                        ) : <td><strong>{vaga.nome ?? "Ainda não atribuído"}</strong></td>}
                        {tipo !== "AMPLIACAO" && tipo !== "REDUCAO" && tipo !== "TRANSFORMACAO" && <td>
                          {tipo === "TRANSFORMACAO"
                            ? vaga.estado === "OCUPADA" ? "Ocupada transformada para o quadro de destino" : "Disponível transformada para o quadro de destino"
                            : resultado.criadas.some((item) => item.id === vaga.id)
                              ? "Nova vaga numerada"
                              : "Atualização preservando o código"}
                        </td>}
                        {tipo !== "AMPLIACAO" && tipo !== "REDUCAO" && tipo !== "TRANSFORMACAO" && <td>
                          {vaga.estado === "DISPONIVEL"
                            ? "Disponível"
                            : "Ocupada"}
                        </td>}
                        {tipo !== "AMPLIACAO" && tipo !== "REDUCAO" && tipo !== "TRANSFORMACAO" && <td>{vaga.situacaoLegal.replaceAll("_", " ")}</td>}
                      </tr>
                    ))}
                </tbody>
              </table>
              {(tipo === "AMPLIACAO" || tipo === "REDUCAO" || tipo === "TRANSFORMACAO") && (
                <small>{quantidadeImpactada} {quantidadeImpactada === 1 ? "vaga encontrada" : "vagas encontradas"}.</small>
              )}
              {(tipo === "AMPLIACAO" || tipo === "REDUCAO" || tipo === "TRANSFORMACAO") && quantidadeImpactada > 10 && (
                <footer className="prototype-quadro-version-pagination">
                  <Paginator
                    first={primeiraVagaImpactada}
                    rows={10}
                    totalRecords={quantidadeImpactada}
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    onPageChange={(event) => setPrimeiraVagaImpactada(event.first)}
                  />
                </footer>
              )}
              {tipo !== "AMPLIACAO" && tipo !== "REDUCAO" && tipo !== "TRANSFORMACAO" && quantidadeImpactada > 8 && (
                <small>
                  Mais {quantidadeImpactada - 8} vaga(s) receberiam o mesmo
                  tratamento.
                </small>
              )}
            </div>
          )}
          <footer>
            <BotaoSalvarSeplag
              type="button"
              label="Registrar nova versão"
              disabled={operacaoInvalida || salvo || (!alteracaoSomenteOrgao && quantidadeImpactada === 0)}
              onClick={() => setConfirmacaoAberta(true)}
            />
          </footer>
        </div>
      )}
      {confirmacaoAberta && (resultado || distribuicaoSimulada || redistribuicaoSimulada) && (
        <div
          className="prototype-legal-confirm-backdrop"
          role="presentation"
          onMouseDown={() => setConfirmacaoAberta(false)}
        >
          <section
            className="prototype-legal-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-nova-versao"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>Confirmação</span>
                <h3 id="confirmar-nova-versao">Registrar nova versão?</h3>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setConfirmacaoAberta(false)}
              >
                <i className="pi pi-times" />
              </button>
            </header>
            <p>
              Confira os dados da evolução legal antes de concluir. A versão
              vigente será preservada no histórico.
            </p>
            <dl>
              <div>
                <dt>Nova versão</dt>
                <dd>Versão {proximaVersao}</dd>
              </div>
              <div>
                <dt>Operação</dt>
                <dd>{rotulos[tipo]}</dd>
              </div>
              {alteracaoSomenteOrgao && (
                <div>
                  <dt>Órgão</dt>
                  <dd>{orgaoAlteracao}</dd>
                </div>
              )}
              <div className="is-full">
                <dt>Base legal</dt>
                <dd>{lei}</dd>
              </div>
              <div>
                <dt>Data de efeito</dt>
                <dd>{dataEfeito.split("-").reverse().join("/")}</dd>
              </div>
              <div>
                <dt>Processo</dt>
                <dd>{processo || "Não informado"}</dd>
              </div>
              <div>
                <dt>Quadro anterior</dt>
                <dd>
                  {tipo === "DISTRIBUICAO"
                    ? resumoQuadro.autorizadas
                    : tipo === "REDISTRIBUICAO"
                      ? resumoQuadro.autorizadas
                    : resultado?.quantitativoAnterior}
                </dd>
              </div>
              <div>
                <dt>Quadro resultante</dt>
                <dd>
                  {tipo === "DISTRIBUICAO"
                    ? resumoQuadro.autorizadas
                    : tipo === "REDISTRIBUICAO"
                      ? resumoQuadro.autorizadas
                    : resultado?.quantitativoPosterior}
                </dd>
              </div>
              <div>
                <dt>{tipo === "DISTRIBUICAO" ? "Vagas distribuídas" : tipo === "REDISTRIBUICAO" ? "Vagas redistribuídas" : "Vagas geradas"}</dt>
                <dd>
                  {tipo === "DISTRIBUICAO"
                    ? totalDistribuicaoInformado
                    : tipo === "REDISTRIBUICAO"
                      ? quantidadeRedistribuicaoInformada
                    : resultado?.criadas.length}
                </dd>
              </div>
              <div>
                <dt>{tipo === "DISTRIBUICAO" ? "Destinações" : tipo === "REDISTRIBUICAO" ? "Destino" : "Vagas afetadas"}</dt>
                <dd>
                  {tipo === "DISTRIBUICAO"
                    ? destinacoesDistribuicaoInformadas.length
                    : tipo === "REDISTRIBUICAO"
                      ? orgaoDestinoRedistribuicao
                    : resultado?.alteradas.length}
                </dd>
              </div>
            </dl>
            {versaoAgendada && (
              <MensagemSeplag
                severity="warning"
                message={`A versão ${versaoAgendada.versao}, agendada para ${versaoAgendada.dataAtivacao?.split("-").reverse().join("/") || versaoAgendada.inicioVigencia}, será substituída. A nova versão ficará ${dataEfeito > hoje ? "Agendada" : "Ativa"}.`}
              />
            )}
            <footer>
              <button type="button" onClick={() => setConfirmacaoAberta(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="is-primary"
                onClick={registrarNovaVersao}
              >
                <i className="pi pi-check" /> {versaoAgendada ? "Substituir e registrar" : "Confirmar e registrar"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
