import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { useForm } from "react-hook-form";
import type { DataTableExpandedRows } from "primereact/datatable";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import "./quadroAutorizado.css";

import type {
  EvolucaoQuadroLegal,
  QuadroAutorizadoRow,
  SituacaoQuadro,
} from "./types";
import {
  controleVagasStore,
  useControleVagasStore,
} from "./controleVagasStore";
import { CONTROLE_VAGAS_BASE_PATH } from "./constants";
import { QuadroLegalOperacoes } from "./QuadroLegalOperacoes";
import { gerarVagasDoQuadro } from "./vagaUtils";
import { calcularPosicaoVaga } from "./distribuicaoIndividual";
import {
  carreirasBaseTemporaria,
  cargosBaseTemporaria,
  perfisProfissionaisBaseTemporaria,
} from "./baseTemporaria";
import {
  BotaoAdicionarSeplag,
  BotaoIconSeplag,
  BotaoLimparFiltroSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
} from "../../componentes/Botao";
import { BadgeSeplag } from "../../componentes/Badge";
import { ModalDeleteSeplag } from "../../componentes/ModalDelete";
import { ModalSeplag } from "../../componentes/Modal";
import { MensagemSeplag } from "../../componentes/Mensagem";
import {
  TablePaginadoSeplag,
  type ColumnMetaSeplag,
} from "../../componentes/TablePaginado";
import {
  DateFieldSeplag,
  DropdownFieldSeplag,
  NumberFieldSeplag,
  TextFieldSeplag,
} from "../../componentes/Fields";
import type { ResultsSeplag } from "../../interfaces/Results";
import { BaseLegalVinculada } from "./BaseLegalVinculada";
import {
  useDocumentosLegais,
  useDocumentosLegaisAssociaveis,
} from "../documentosLegais/documentosLegaisStore";
import {
  calcularStatusOperacionalVigenciaSeplag,
  validarSituacaoVigenciaSeplag,
  type StatusOperacionalVigenciaSeplag,
  type SituacaoVigenciaValueSeplag,
} from "../../componentes/SituacaoVigencia";
import {
  SpecArea,
  SpecificationMode,
  type SpecificationMetadata,
} from "../shared/visualizationModes";
import {
  quadroActionSpecifications,
  quadroBusinessItems,
  quadroColumnSpecifications,
  quadroFilterSpecifications,
  quadroKpiSpecifications,
  quadroScreenSpecification,
  quadroTableSpecification,
} from "./QuadroAutorizadoSpecifications";

const BASE_PATH = `${CONTROLE_VAGAS_BASE_PATH}/quadro-autorizado`;
const dataReferenciaDistribuicao = (() => {
  const data = new Date();
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
})();

type VigenciaQuadroForm = SituacaoVigenciaValueSeplag;
type ModoAbrangencia =
  | ""
  | "SEM_ORGAOS"
  | "ORGAOS_SEM_QUANTITATIVO"
  | "ORGAOS_COM_QUANTITATIVO";
type QuadroFormValues = VigenciaQuadroForm & {
  vinculo: string;
  regime: string;
  carreira: string;
  cargo: string;
  perfilProfissional: string;
  orgao: string;
  abrangencia: string;
  quantidade: number | null;
  inicioVigencia: string;
  fimVigencia: string;
  tipoAto: string;
  numeroAto: string;
  dataAto: string;
  processo: string;
  fundamentacao: string;
  motivoAlteracao: string;
  modoAbrangencia: ModoAbrangencia;
  orgaosDefinidos: string[];
};

const situacaoClass: Record<SituacaoQuadro, string> = {
  Vigente: "is-active",
  "Vigência futura": "is-future",
  Encerrada: "is-closed",
};

const saldo = (item: QuadroAutorizadoRow) =>
  item.autorizadas - item.ocupadas - item.bloqueadas;

const orgaosDoQuadro = (item: QuadroAutorizadoRow) =>
  item.orgaosDefinidosLei?.length
    ? [...item.orgaosDefinidosLei]
    : item.orgao
      ? [item.orgao]
      : [];

const resumoOrgaos = (item: QuadroAutorizadoRow) => {
  if (item.formaDestinacaoLegal === "DISTRIBUICAO_POSTERIOR")
    return "Pendente de distribuição";
  const orgaos = orgaosDoQuadro(item).filter(
    (orgao) => orgao !== "ESTADO DE MATO GROSSO",
  );
  if (!orgaos.length) return "Pendente de distribuição";
  if (orgaos.length === 1) return orgaos[0];
  return `${orgaos.length} órgãos definidos pela lei`;
};

export function QuadroAutorizadoContent() {
  const { quadros } = useControleVagasStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [routeSearchParams] = useSearchParams();
  const { id } = useParams();
  const isNovo = location.pathname.endsWith("/novo");
  const isEditar = location.pathname.endsWith("/editar");
  const isNovaVersao = location.pathname.endsWith("/nova-versao");
  const isDetalhe = Boolean(id) && !isEditar && !isNovaVersao;

  if (isNovaVersao) {
    const registro = id
      ? quadros.find((item) => item.id === Number(id))
      : undefined;
    const versaoEmEdicaoId = Number(routeSearchParams.get("editarAgendada"));
    const versaoEmEdicao = versaoEmEdicaoId
      ? quadros.find((item) => item.id === versaoEmEdicaoId)
      : undefined;
    return registro?.situacao === "Vigente" ? (
      <QuadroAutorizadoNovaVersao
        registro={registro}
        versaoEmEdicao={versaoEmEdicao}
        onBack={() => navigate(BASE_PATH)}
      />
    ) : (
      <QuadroAutorizadoLista />
    );
  }

  if (isNovo || isEditar) {
    const registro = id
      ? quadros.find((item) => item.id === Number(id))
      : undefined;
    if (isEditar && registro?.situacao !== "Vigência futura")
      return <QuadroAutorizadoLista />;
    return (
      <QuadroAutorizadoForm
        registro={registro}
        novaVersao={false}
        onBack={() => navigate(BASE_PATH)}
      />
    );
  }
  if (isDetalhe) {
    const registro =
      quadros.find((item) => item.id === Number(id)) ?? quadros[0];
    return (
      <QuadroAutorizadoDetalhe
        registro={registro}
        onBack={() => navigate(BASE_PATH)}
      />
    );
  }

  return <QuadroAutorizadoLista />;
}

type QuadroFiltrosForm = {
  busca: string;
  cargo: string;
  orgao: string;
  tipo: string;
  situacao: string;
};

type QuadroListaRow = QuadroAutorizadoRow & {
  orgaoResumo: string;
  distribuicaoOrgaos: Array<{
    orgao: string;
    quantidade: number;
    pendente: boolean;
  }>;
  disponiveisCalculadas: number;
  movimentaveisCalculadas: number;
  pendentesAto: number;
  statusVigencia: StatusOperacionalVigenciaSeplag;
};

const statusVigenciaMeta: Record<
  StatusOperacionalVigenciaSeplag,
  { label: string; color: string; bg: string }
> = {
  AGENDADO: { label: "Agendado", color: "#8a5a00", bg: "#fff4d6" },
  ATIVO: { label: "Ativo", color: "#00843d", bg: "#dff3e8" },
  ENCERRADO: { label: "Encerrado", color: "#6b7280", bg: "#f1f5f9" },
  EXTINTO: { label: "Extinto", color: "#b42318", bg: "#fee4e2" },
};

const tipoQuadroPorVinculo = (
  vinculo: string,
): QuadroAutorizadoRow["tipoQuadro"] =>
  vinculo === "Exclusivamente comissionado" ? "Comissionado" : "Efetivo";

const statusVigenciaDoQuadro = (item: QuadroAutorizadoRow) => {
  const status = calcularStatusOperacionalVigenciaSeplag({
    situacao:
      item.situacaoVigencia ??
      (item.situacao === "Encerrada" ? "ENCERRADO" : "ATIVO"),
    dataAtivacao: item.dataAtivacao || item.inicioVigencia,
    dataEncerramento: item.dataEncerramento || item.fimVigencia || undefined,
    motivoEncerramento: item.motivoEncerramento,
    dataExtincao: item.dataExtincao,
    motivoExtincao: item.motivoExtincao,
  });
  return item.extincaoProgressivaEmAndamento && status === "ATIVO"
    ? "ENCERRADO"
    : status;
};
const resumoDistribuicaoOrgaos = (
  distribuicao: QuadroListaRow["distribuicaoOrgaos"],
) => {
  const orgaosDistribuidos = distribuicao.filter((item) => !item.pendente);
  const pendentes = distribuicao.find((item) => item.pendente)?.quantidade ?? 0;
  if (!orgaosDistribuidos.length) return "Pendente de distribuição";
  const sufixoPendente = pendentes > 0 ? " + Pendente" : "";
  if (orgaosDistribuidos.length === 1)
    return `${orgaosDistribuidos[0].orgao}${sufixoPendente}`;
  return `Órgãos${sufixoPendente}`;
};
const statusVigenciaVisualDoQuadro = (item: QuadroAutorizadoRow) =>
  statusVigenciaMeta[statusVigenciaDoQuadro(item)];
type VersaoAnteriorQuadro = {
  id?: number;
  versao: number;
  cargo: string;
  orgao: string;
  autorizadas: number;
  vigencia: string;
  encerradaEm?: string;
  statusVigencia?: StatusOperacionalVigenciaSeplag;
  evolucao: EvolucaoQuadroLegal;
  ato: string;
};

const evolucaoPadraoPorTipo = (
  item: QuadroAutorizadoRow,
): EvolucaoQuadroLegal => {
  if (item.evolucaoLegal) return item.evolucaoLegal;
  if (item.extincaoProgressivaEmAndamento || item.situacaoVigencia === "EXTINTO") {
    return "Extinção progressiva";
  }
  return item.autorizadas >= 0 ? "Ampliação" : "Redução";
};

const formatarVigenciaVersao = (item: QuadroAutorizadoRow) =>
  `${item.inicioVigencia || "-"} a ${item.fimVigencia || "vigente"}`;

const versaoAnteriorDoQuadro = (
  item: QuadroAutorizadoRow,
): VersaoAnteriorQuadro => ({
  id: item.id,
  versao: item.versao,
  cargo: item.cargo,
  orgao: item.orgao,
  autorizadas: item.autorizadas,
  vigencia: formatarVigenciaVersao(item),
  encerradaEm:
    statusVigenciaDoQuadro(item) === "ENCERRADO" ||
    statusVigenciaDoQuadro(item) === "EXTINTO"
      ? item.dataEncerramento || item.atualizadoEm
      : undefined,
  statusVigencia: statusVigenciaDoQuadro(item),
  evolucao: evolucaoPadraoPorTipo(item),
  ato: item.ato,
});

const versoesAnterioresPorQuadro: Record<string, VersaoAnteriorQuadro[]> = {
  "QA-0001": [
    {
      versao: 9,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 120,
      vigencia: "01/01/2025 a 31/03/2025",
      encerradaEm: "31/03/2025",
      evolucao: "Redistribuição - Destino",
      ato: "Lei Complementar nº 550/2014",
    },
    {
      versao: 8,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 120,
      vigencia: "01/10/2024 a 31/12/2024",
      encerradaEm: "31/12/2024",
      evolucao: "Redistribuição - Origem",
      ato: "Lei Complementar nº 550/2014",
    },
    {
      versao: 7,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 120,
      vigencia: "01/07/2024 a 30/09/2024",
      encerradaEm: "30/09/2024",
      evolucao: "Distribuição",
      ato: "Lei Complementar nº 550/2014",
    },
    {
      versao: 6,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 120,
      vigencia: "01/01/2024 a 30/06/2024",
      encerradaEm: "30/06/2024",
      evolucao: "Extinção progressiva",
      ato: "Lei Complementar nº 550/2014",
    },
    {
      versao: 5,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 120,
      vigencia: "01/07/2023 a 31/12/2023",
      encerradaEm: "31/12/2023",
      evolucao: "Transformação - Destino",
      ato: "Lei Complementar nº 550/2014",
    },
    {
      versao: 4,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 110,
      vigencia: "01/01/2023 a 30/06/2023",
      encerradaEm: "30/06/2023",
      evolucao: "Transformação - Origem",
      ato: "Lei Complementar nº 550/2014",
    },
    {
      versao: 3,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 110,
      vigencia: "01/01/2022 a 31/12/2022",
      encerradaEm: "31/12/2022",
      evolucao: "Redução",
      ato: "Lei Complementar nº 550/2014",
    },
    {
      versao: 2,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 120,
      vigencia: "01/01/2021 a 31/12/2021",
      encerradaEm: "31/12/2021",
      evolucao: "Ampliação",
      ato: "Lei Complementar nº 550/2014",
    },
    {
      versao: 1,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 90,
      vigencia: "01/01/2020 a 31/12/2020",
      encerradaEm: "31/12/2020",
      evolucao: "Criação",
      ato: "Lei Complementar nº 480/2013",
    },
  ],
  "QA-0002": [
    {
      versao: 1,
      cargo: "Técnico em Enfermagem",
      orgao: "SES",
      autorizadas: 540,
      vigencia: "01/03/2023 a 28/02/2025",
      encerradaEm: "28/02/2025",
      evolucao: "Redução",
      ato: "Lei nº 12.104/2023",
    },
  ],
  "QA-0006": [
    {
      versao: 3,
      cargo: "Escrivão de Polícia",
      orgao: "PJC",
      autorizadas: 820,
      vigencia: "01/01/2024 a 31/12/2025",
      encerradaEm: "31/12/2025",
      evolucao: "Transformação - Origem",
      ato: "Lei Complementar nº 740/2024",
    },
    {
      versao: 2,
      cargo: "Escrivão de Polícia",
      orgao: "PJC",
      autorizadas: 800,
      vigencia: "01/01/2022 a 31/12/2023",
      encerradaEm: "31/12/2023",
      evolucao: "Ampliação",
      ato: "Lei Complementar nº 690/2021",
    },
    {
      versao: 1,
      cargo: "Escrivão de Polícia",
      orgao: "PJC",
      autorizadas: 760,
      vigencia: "01/01/2019 a 31/12/2021",
      encerradaEm: "31/12/2021",
      evolucao: "Ampliação",
      ato: "Lei Complementar nº 407/2010",
    },
  ],
  "QA-0009": [
    {
      versao: 1,
      cargo: "Coronel",
      orgao: "PM",
      autorizadas: 28,
      vigencia: "01/01/2020 a 31/12/2023",
      encerradaEm: "31/12/2023",
      evolucao: "Extinção progressiva",
      ato: "Lei Complementar estadual nº 700/2023",
    },
  ],
};
const quadroPermiteEdicaoDireta = (item: QuadroAutorizadoRow) =>
  statusVigenciaDoQuadro(item) === "AGENDADO";

const quadroProduzEfeitos = (item: QuadroAutorizadoRow) =>
  statusVigenciaDoQuadro(item) === "ATIVO";
const filtrosIniciais: QuadroFiltrosForm = {
  busca: "",
  cargo: "",
  orgao: "",
  tipo: "",
  situacao: "",
};

const resultadosQuadro = (
  content: QuadroListaRow[],
): ResultsSeplag<QuadroListaRow> => ({
  content,
  last: true,
  totalPages: Math.max(1, Math.ceil(content.length / 10)),
  pageActual: 0,
  sizePage: 10,
  totalRecords: content.length,
  size: content.length,
  number: 0,
  first: true,
  numberOfElements: content.length,
  empty: content.length === 0,
});

function QuadroAutorizadoLista() {
  const { quadros, vagas, movimentos, comprometimentos } =
    useControleVagasStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const situacaoInicial = searchParams.get("situacao") ?? "";
  const saldoInicial = searchParams.get("saldo") ?? "";
  const { control, reset, watch } = useForm<QuadroFiltrosForm>({
    defaultValues: { ...filtrosIniciais, situacao: situacaoInicial },
  });
  const filtros = watch();
  const [visualizado, setVisualizado] = useState<QuadroAutorizadoRow | null>(
    null,
  );
  const [exclusao, setExclusao] = useState<QuadroAutorizadoRow | null>(null);
  const [motivoExclusao, setMotivoExclusao] = useState("");

  const [versaoVisualizada, setVersaoVisualizada] = useState<{
    quadro: QuadroListaRow;
    versao: VersaoAnteriorQuadro;
  } | null>(null);
  const [distribuicaoVisualizada, setDistribuicaoVisualizada] =
    useState<QuadroListaRow | null>(null);
  const [linhasExpandidas, setLinhasExpandidas] =
    useState<DataTableExpandedRows>({});
  const [paginasHistorico, setPaginasHistorico] = useState<
    Record<string, { first: number; rows: number }>
  >({});

  const versoesAgendadasDoQuadro = (registro: QuadroAutorizadoRow) =>
    quadros
      .filter(
        (item) =>
          item.codigo === registro.codigo &&
          item.id !== registro.id &&
          statusVigenciaDoQuadro(item) === "AGENDADO",
      )
      .sort((a, b) => b.versao - a.versao);
  const abrirHistoricoAgendado = (registro: QuadroAutorizadoRow) => {
    setVisualizado(null);
    setLinhasExpandidas((atuais) => ({
      ...(atuais as Record<string, boolean>),
      [String(registro.id)]: true,
    }));
  };
  const solicitarNovaVersao = (registro: QuadroAutorizadoRow) => {
    if (versoesAgendadasDoQuadro(registro).length) {
      abrirHistoricoAgendado(registro);
      return;
    }
    navigate(`${BASE_PATH}/${registro.id}/nova-versao`);
  };
  const quadrosOperacionais = useMemo(() => {
    const idsComVagas = new Set(vagas.map((vaga) => vaga.quadroAutorizadoId));
    const porCodigo = new Map<string, QuadroAutorizadoRow[]>();
    quadros.forEach((quadro) => {
      porCodigo.set(quadro.codigo, [...(porCodigo.get(quadro.codigo) ?? []), quadro]);
    });
    return [...porCodigo.values()].map((versoes) => {
      const comVagas = versoes.filter((quadro) => idsComVagas.has(quadro.id));
      return [...(comVagas.length ? comVagas : versoes)].sort(
        (a, b) => b.versao - a.versao || b.id - a.id,
      )[0];
    });
  }, [quadros, vagas]);
  const historicoVersoesPorQuadro = useMemo(() => {
    const porCodigo = new Map<string, QuadroAutorizadoRow[]>();
    quadros.forEach((quadro) => {
      porCodigo.set(quadro.codigo, [...(porCodigo.get(quadro.codigo) ?? []), quadro]);
    });
    const historico = new Map<string, VersaoAnteriorQuadro[]>();
    porCodigo.forEach((versoes, codigo) => {
      const ordenadas = [...versoes].sort(
        (a, b) => b.versao - a.versao || b.id - a.id,
      );
      if (ordenadas.length <= 1) return;
      ordenadas.forEach((quadroAtual) => {
        historico.set(
          String(quadroAtual.id),
          ordenadas
            .filter((item) => item.id !== quadroAtual.id)
            .map(versaoAnteriorDoQuadro),
        );
      });
      historico.set(
        codigo,
        ordenadas.slice(1).map(versaoAnteriorDoQuadro),
      );
    });
    return historico;
  }, [quadros]);
  const filtrados = useMemo(() => {
    const termo = filtros.busca.trim().toLocaleLowerCase("pt-BR");
    return quadrosOperacionais
      .filter((item) => {
        const vagasDoQuadro = vagas.filter(
          (vaga) => vaga.quadroAutorizadoId === item.id,
        );
        const orgaosDistribuidos = new Set(
          vagasDoQuadro
            .map((vaga) =>
              calcularPosicaoVaga(vaga, movimentos, dataReferenciaDistribuicao)
                .orgaoDistribuicao,
            )
            .filter(Boolean) as string[],
        );
        return (
          (!termo || item.codigo.toLocaleLowerCase("pt-BR").includes(termo)) &&
          (!filtros.cargo || item.cargo === filtros.cargo) &&
          (!filtros.orgao ||
            orgaosDoQuadro(item).includes(filtros.orgao) ||
            orgaosDistribuidos.has(filtros.orgao)) &&
          (!filtros.tipo || item.vinculo === filtros.tipo) &&
          (!filtros.situacao ||
            statusVigenciaDoQuadro(item) === filtros.situacao)
        );
      })
      .sort((a, b) => b.id - a.id)
      .map((item) => {
        const vagasDoQuadro = vagas.filter(
          (vaga) => vaga.quadroAutorizadoId === item.id,
        );
        const idsVagasDoQuadro = new Set(vagasDoQuadro.map((vaga) => vaga.id));
        const idsVagasComprometidas = new Set(
          comprometimentos
            .filter(
              (item) => item.situacao === "ATIVO" && idsVagasDoQuadro.has(item.vagaId),
            )
            .map((item) => item.vagaId),
        );
        const comprometidasCalculadas = idsVagasComprometidas.size;
        const quadroPermiteMovimentacao =
          statusVigenciaDoQuadro(item) === "ATIVO";
        const movimentaveisCalculadas = quadroPermiteMovimentacao
          ? vagasDoQuadro.filter(
              (vaga) =>
                vaga.estado === "DISPONIVEL" &&
                vaga.situacaoLegal === "REGULAR" &&
                !idsVagasComprometidas.has(vaga.id),
            ).length
          : 0;
        const distribuicaoPorOrgao = new Map<string, number>();
        let pendentesAto = 0;
        vagasDoQuadro.forEach((vaga) => {
          const posicao = calcularPosicaoVaga(vaga, movimentos, dataReferenciaDistribuicao);
          if (posicao.orgaoDistribuicao) {
            distribuicaoPorOrgao.set(
              posicao.orgaoDistribuicao,
              (distribuicaoPorOrgao.get(posicao.orgaoDistribuicao) ?? 0) + 1,
            );
          } else if (vaga.situacaoLegal !== "EXTINTA") {
            pendentesAto += 1;
          }
        });
        const distribuicaoOrgaos = [
          ...[...distribuicaoPorOrgao.entries()]
            .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
            .map(([orgao, quantidade]) => ({
              orgao,
              quantidade,
              pendente: false,
            })),
          ...(pendentesAto > 0
            ? [
                {
                  orgao: "Pendente de distribuição",
                  quantidade: pendentesAto,
                  pendente: true,
                },
              ]
            : []),
        ];
        return {
          ...item,
          orgaoResumo: resumoDistribuicaoOrgaos(distribuicaoOrgaos),
          distribuicaoOrgaos,
          comprometidas: comprometidasCalculadas,
          movimentaveisCalculadas,
          pendentesAto,
          disponiveisCalculadas: Math.max(0, saldo(item) - pendentesAto),
          statusVigencia: statusVigenciaDoQuadro(item),
        };
      })
      .filter(
        (item) =>
          saldoInicial !== "SEM_VAGAS_LIVRES" ||
          item.disponiveisCalculadas === 0,
      );
  }, [
    filtros.busca,
    filtros.cargo,
    filtros.orgao,
    filtros.tipo,
    filtros.situacao,
    quadrosOperacionais,
    vagas,
    movimentos,
    comprometimentos,
    saldoInicial,
  ]);

  const totais = filtrados.reduce(
    (acc, item) => ({
      autorizadas: acc.autorizadas + item.autorizadas,
      ocupadas: acc.ocupadas + item.ocupadas,
      comprometidas: acc.comprometidas + item.comprometidas,
      disponiveis: acc.disponiveis + item.disponiveisCalculadas,
      pendentesDistribuicao: acc.pendentesDistribuicao + item.pendentesAto,
    }),
    {
      autorizadas: 0,
      ocupadas: 0,
      comprometidas: 0,
      disponiveis: 0,
      pendentesDistribuicao: 0,
    },
  );

  const confirmarExclusao = () => {
    if (
      !exclusao ||
      !quadroPermiteEdicaoDireta(exclusao) ||
      !motivoExclusao.trim()
    )
      return;
    controleVagasStore.set("quadros", (itens) =>
      itens.filter((quadro) => quadro.id !== exclusao.id),
    );
    controleVagasStore.set("vagas", (itens) =>
      itens.filter((vaga) => vaga.quadroAutorizadoId !== exclusao.id),
    );
    setExclusao(null);
    setMotivoExclusao("");
    setVisualizado(null);
  };

  const celulaComEspecificacao = (
    item: QuadroListaRow,
    metadata: SpecificationMetadata,
    content: ReactElement,
  ) =>
    item.id === filtrados[0]?.id ? (
      <SpecArea metadata={metadata}>
        <div className="prototype-quadro-spec-cell">{content}</div>
      </SpecArea>
    ) : (
      content
    );

  const columns: ColumnMetaSeplag<QuadroListaRow>[] = [
    {
      field: "codigo",
      header: (
        <SpecArea metadata={quadroColumnSpecifications.Quadro}>
          <span>Quadro</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) =>
        celulaComEspecificacao(
          item,
          quadroColumnSpecifications.Quadro,
          <div className="prototype-quadro-table-main">
            <button
              className="prototype-quadro-link"
              onClick={() => setVisualizado(item)}
            >
              {item.codigo}
            </button>
            <small>Versão {item.versao}</small>
          </div>,
        ),
    },
    {
      field: "cargo",
      header: (
        <SpecArea metadata={quadroColumnSpecifications.Cargo}>
          <span>Cargo</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) =>
        celulaComEspecificacao(
          item,
          quadroColumnSpecifications.Cargo,
          <div className="prototype-quadro-table-main">
            <strong>{item.cargo}</strong>
            <small>{item.perfilProfissional || item.vinculo}</small>
          </div>,
        ),
    },
    {
      field: "orgaoResumo",
      header: (
        <SpecArea metadata={quadroColumnSpecifications.Órgão}>
          <span>Órgão</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) =>
        celulaComEspecificacao(
          item,
          quadroColumnSpecifications.Órgão,
          <div className="prototype-quadro-table-main">
            <button
              type="button"
              className="prototype-quadro-orgao-summary-button"
              onClick={() => setDistribuicaoVisualizada(item)}
            >
              {item.orgaoResumo}
            </button>
          </div>,
        ),
    },
    {
      field: "autorizadas",
      header: (
        <SpecArea metadata={quadroColumnSpecifications.Autorizadas}>
          <span>Autorizadas</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) =>
        celulaComEspecificacao(
          item,
          quadroColumnSpecifications.Autorizadas,
          <span>{item.autorizadas}</span>,
        ),
    },
    {
      field: "ocupadas",
      header: (
        <SpecArea metadata={quadroColumnSpecifications.Ocupadas}>
          <span>Ocupadas</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) =>
        celulaComEspecificacao(
          item,
          quadroColumnSpecifications.Ocupadas,
          <span>{item.ocupadas}</span>,
        ),
    },
    {
      field: "comprometidas",
      header: (
        <SpecArea metadata={quadroColumnSpecifications.Comprometidas}>
          <span>Comprometidas</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) =>
        celulaComEspecificacao(
          item,
          quadroColumnSpecifications.Comprometidas,
          <strong className={item.comprometidas > 0 ? "is-warning" : ""}>
            {item.comprometidas}
          </strong>,
        ),
    },
    {
      field: "disponiveisCalculadas",
      header: (
        <SpecArea metadata={quadroColumnSpecifications.Disponíveis}>
          <span>Disponíveis</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) =>
        celulaComEspecificacao(
          item,
          quadroColumnSpecifications.Disponíveis,
          <strong
            className={
              item.disponiveisCalculadas <= 0 ? "is-danger" : "is-positive"
            }
          >
            {item.disponiveisCalculadas}
          </strong>,
        ),
    },
    {
      field: "pendentesAto",
      header: (
        <SpecArea metadata={quadroColumnSpecifications["Pendente de distribuição"]}>
          <span>Pendente de distribuição</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) =>
        celulaComEspecificacao(
          item,
          quadroColumnSpecifications["Pendente de distribuição"],
          <strong className={item.pendentesAto > 0 ? "is-warning" : ""}>
            {item.pendentesAto}
          </strong>,
        ),
    },    {
      field: "statusVigencia",
      header: (
        <SpecArea metadata={quadroColumnSpecifications.Situação}>
          <span>Situação</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) => {
        const meta = statusVigenciaVisualDoQuadro(item);
        const rotuloQuebrado = meta.label;

        return (
          <SpecArea metadata={quadroColumnSpecifications.Situação}>
            <div className="prototype-quadro-spec-status">
              <BadgeSeplag
                label={rotuloQuebrado}
                color={meta.color}
                bg={meta.bg}
                size="xs"
                fontWeight
                textAlign="center"
                customStyle={{ whiteSpace: "pre-line", lineHeight: 1.15 }}
              />
            </div>
          </SpecArea>
        );
      },
    },
  ];
  const renderHistoricoVersoes = (item: QuadroListaRow) => {
    const versoes =
      historicoVersoesPorQuadro.get(String(item.id)) ??
      historicoVersoesPorQuadro.get(item.codigo) ??
      versoesAnterioresPorQuadro[item.codigo] ??
      [];
    const chavePaginacao = String(item.id);
    const paginacao = paginasHistorico[chavePaginacao] ?? {
      first: 0,
      rows: 5,
    };
    const firstHistorico =
      paginacao.first >= versoes.length
        ? Math.max(0, Math.floor(Math.max(versoes.length - 1, 0) / paginacao.rows) * paginacao.rows)
        : paginacao.first;
    const versoesPaginadas = versoes.slice(
      firstHistorico,
      firstHistorico + paginacao.rows,
    );
    const onHistoricoPageChange = (event: PaginatorPageChangeEvent) => {
      setPaginasHistorico((atuais) => ({
        ...atuais,
        [chavePaginacao]: { first: event.first, rows: event.rows },
      }));
    };

    return (
      <SpecArea metadata={quadroColumnSpecifications["Histórico de versões"]}>
        <section className="prototype-quadro-version-history">
          {versoes.length ? (
            <>
              <div className="prototype-quadro-version-table-container">
                <table className="prototype-quadro-version-table">
                  <colgroup>
                    <col className="is-versao" />
                    <col className="is-cargo" />
                    <col className="is-orgao" />
                    <col className="is-vigencia" />
                    <col className="is-autorizadas" />
                    <col className="is-evolucao" />
                    <col className="is-situacao" />
                    <col className="is-acoes" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Versão</th>
                      <th>Cargo</th>
                      <th>Órgão</th>
                      <th>Vigência</th>
                      <th>Autorizadas</th>
                      <th>Evolução</th>
                      <th>Situação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versoesPaginadas.map((versao) => {
                      const statusVersao =
                        versao.statusVigencia ?? "ENCERRADO";
                      const metaStatus = statusVigenciaMeta[statusVersao];
                      const registroAgendado =
                        statusVersao === "AGENDADO" && versao.id
                          ? quadros.find((quadro) => quadro.id === versao.id)
                          : undefined;
                      return (
                        <tr key={`${item.codigo}-${versao.versao}`}>
                          <td>
                            <strong>Versão {versao.versao}</strong>
                          </td>
                          <td>{versao.cargo}</td>
                          <td>{versao.orgao}</td>
                          <td>
                            <span>{versao.vigencia}</span>
                            {versao.encerradaEm && (
                              <small>Encerrada em {versao.encerradaEm}</small>
                            )}
                          </td>
                          <td>{versao.autorizadas.toLocaleString("pt-BR")}</td>
                          <td>
                            <BadgeSeplag
                              label={versao.evolucao}
                              color="#075f99"
                              bg="#e8f5ff"
                              size="xs"
                              fontWeight
                            />
                          </td>
                          <td>
                            <BadgeSeplag
                              label={metaStatus.label}
                              color={metaStatus.color}
                              bg={metaStatus.bg}
                              size="xs"
                              fontWeight
                            />
                          </td>
                          <td>
                            <div className="prototype-quadro-actions">
                              <BotaoIconSeplag
                                type="button"
                                tooltip={`Visualizar versão ${versao.versao}`}
                                aria-label={`Visualizar versão ${versao.versao}`}
                                icon="pi pi-eye"
                                onClick={() =>
                                  setVersaoVisualizada({ quadro: item, versao })
                                }
                              />
                              {registroAgendado && (
                                <>
                                  <BotaoIconSeplag
                                    type="button"
                                    tooltip={`Editar versão ${versao.versao} agendada`}
                                    aria-label="Editar"
                                    icon="pi pi-pencil"
                                    severity="warning"
                                    onClick={() =>
                                      navigate(`${BASE_PATH}/${item.id}/nova-versao?editarAgendada=${registroAgendado.id}`)
                                    }
                                  />
                                  <BotaoIconSeplag
                                    type="button"
                                    tooltip={`Excluir versão ${versao.versao} agendada`}
                                    aria-label="Excluir"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    onClick={() => {
                                      setMotivoExclusao("");
                                      setExclusao(registroAgendado);
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <footer className="prototype-quadro-version-pagination">
                <Paginator
                  first={firstHistorico}
                  rows={paginacao.rows}
                  totalRecords={versoes.length}
                  rowsPerPageOptions={[5, 10, 20]}
                  onPageChange={onHistoricoPageChange}
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                />
              </footer>
            </>
          ) : (
            <p className="prototype-quadro-version-empty">
              Este quadro está na primeira versão e ainda não possui versões
              anteriores.
            </p>
          )}
        </section>
      </SpecArea>
    );
  };
  const renderAcoes = (item: QuadroListaRow) => {
    const agendadas = versoesAgendadasDoQuadro(item);
    return (
      <div className="prototype-quadro-actions">
        <SpecArea metadata={quadroActionSpecifications.Visualizar}>
          <BotaoIconSeplag
            type="button"
            tooltip="Visualizar"
            aria-label="Visualizar"
            icon="pi pi-eye"
            onClick={() => setVisualizado(item)}
          />
        </SpecArea>
        {quadroPermiteEdicaoDireta(item) && (
          <SpecArea metadata={quadroActionSpecifications.Editar}>
            <BotaoIconSeplag
              type="button"
              tooltip="Editar antes da vigência"
              aria-label="Editar"
              icon="pi pi-pencil"
              severity="warning"
              onClick={() => navigate(`${BASE_PATH}/${item.id}/editar`)}
            />
          </SpecArea>
        )}
        {quadroPermiteEdicaoDireta(item) && (
          <SpecArea metadata={quadroActionSpecifications.Excluir}>
            <BotaoIconSeplag
              type="button"
              tooltip="Excluir antes da vigência"
              aria-label="Excluir"
              icon="pi pi-trash"
              severity="danger"
              onClick={() => {
                setMotivoExclusao("");
                setExclusao(item);
              }}
            />
          </SpecArea>
        )}
        {quadroProduzEfeitos(item) && !agendadas.length && (
          <SpecArea metadata={quadroActionSpecifications["Criar nova versão"]}>
            <BotaoIconSeplag
              type="button"
              tooltip="Criar nova versão"
              aria-label="Criar nova versão"
              icon="pi pi-plus"
              onClick={() => solicitarNovaVersao(item)}
            />
          </SpecArea>
        )}
        {quadroProduzEfeitos(item) && agendadas.length > 0 && (
          <SpecArea metadata={quadroActionSpecifications["Versão agendada existente"]}>
            <BotaoIconSeplag
              type="button"
              tooltip={`Já existe a versão ${agendadas[0].versao} agendada para ${agendadas[0].dataAtivacao?.split("-").reverse().join("/") || agendadas[0].inicioVigencia}. Clique para abrir o histórico.`}
              aria-label="Versão agendada existente"
              icon="pi pi-exclamation-triangle"
              severity="warning"
              onClick={() => abrirHistoricoAgendado(item)}
            />
          </SpecArea>
        )}
      </div>
    );
  };
  const renderControleHistorico = (item: QuadroListaRow) => {
    const chave = String(item.id);
    const expandidas = linhasExpandidas as Record<string, boolean>;
    const aberto = Boolean(expandidas[chave]);
    const alternar = () =>
      setLinhasExpandidas((atuais) => {
        const proximas = {
          ...(atuais as Record<string, boolean>),
        };
        if (aberto) delete proximas[chave];
        else proximas[chave] = true;
        return proximas as DataTableExpandedRows;
      });

    return (
      <SpecArea metadata={quadroColumnSpecifications["Histórico de versões"]}>
        <button
          type="button"
          className="prototype-quadro-expander"
          aria-label={
            aberto
              ? "Fechar detalhes do quadro"
              : "Abrir detalhes do quadro"
          }
          title={
            aberto
              ? "Fechar detalhes do quadro"
              : "Abrir detalhes do quadro"
          }
          onClick={alternar}
        >
          <i className={aberto ? "pi pi-chevron-up" : "pi pi-chevron-down"} />
        </button>
      </SpecArea>
    );
  };

  return (
    <SpecificationMode
      screen={quadroScreenSpecification}
      businessItems={quadroBusinessItems}
      showViewToggles
    >
      <div className="prototype-quadro-page prototype-quadro-page-current">
        <header className="prototype-quadro-header">
          <SpecArea metadata={quadroScreenSpecification}>
            <div>
              <h1>Quadro Autorizado</h1>
              <p>Quantitativos autorizados por cargo, vínculo e órgão.</p>
            </div>
          </SpecArea>
        </header>

        <section className="prototype-quadro-kpis">
          <SpecArea metadata={quadroKpiSpecifications.Autorizadas}>
            <article>
              <i className="pi pi-file-check" />
              <div>
                <span>Autorizadas</span>
                <strong>{totais.autorizadas.toLocaleString("pt-BR")}</strong>
              </div>
            </article>
          </SpecArea>
          <SpecArea metadata={quadroKpiSpecifications.Ocupadas}>
            <article>
              <i className="pi pi-users" />
              <div>
                <span>Ocupadas</span>
                <strong>{totais.ocupadas.toLocaleString("pt-BR")}</strong>
              </div>
            </article>
          </SpecArea>
          <SpecArea metadata={quadroKpiSpecifications.Comprometidas}>
            <article>
              <i className="pi pi-clock" />
              <div>
                <span>Comprometidas</span>
                <strong>{totais.comprometidas.toLocaleString("pt-BR")}</strong>
              </div>
            </article>
          </SpecArea>
          <SpecArea metadata={quadroKpiSpecifications.Disponíveis}>
            <article className="is-available">
              <i className="pi pi-check-circle" />
              <div>
                <span>Disponíveis</span>
                <strong>{totais.disponiveis.toLocaleString("pt-BR")}</strong>
              </div>
            </article>
          </SpecArea>
          <SpecArea metadata={quadroKpiSpecifications["Pendente de distribuição"]}>
            <article className="is-pending-distribution">
              <i className="pi pi-clock" />
              <div>
                <span>Pendente de distribuição</span>
                <strong>
                  {totais.pendentesDistribuicao.toLocaleString("pt-BR")}
                </strong>
              </div>
            </article>
          </SpecArea>
        </section>

        <section className="prototype-quadro-card">
          <div className="prototype-quadro-filters prototype-quadro-library-filters">
            <SpecArea metadata={quadroFilterSpecifications.Quadro}>
              <div className="prototype-quadro-spec-control">
                <TextFieldSeplag
                  name="busca"
                  control={control}
                  label="Quadro"
                  cols="12"
                  icon="pi pi-search"
                  placeholder="Ex: QA-xxxx"
                />
              </div>
            </SpecArea>
            <SpecArea metadata={quadroFilterSpecifications.Cargo}>
              <div className="prototype-quadro-spec-control">
                <DropdownFieldSeplag
                  name="cargo"
                  control={control}
                  label="Cargo"
                  cols="12"
                  options={[...new Set(quadros.map((item) => item.cargo))]
                    .filter(Boolean)
                    .sort((a, b) => a.localeCompare(b, "pt-BR"))
                    .map((value) => ({ label: value, value }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todos"
                  getFormErrorMessage={() => null}
                />
              </div>
            </SpecArea>
            <SpecArea metadata={quadroFilterSpecifications.Órgão}>
              <div className="prototype-quadro-spec-control">
                <DropdownFieldSeplag
                  name="orgao"
                  control={control}
                  label="Órgão"
                  cols="12"
                  options={[
                    ...new Set([
                      ...quadros.flatMap(orgaosDoQuadro),
                      ...vagas
                        .map((vaga) =>
                          calcularPosicaoVaga(
                            vaga,
                            movimentos,
                            dataReferenciaDistribuicao,
                          ).orgaoDistribuicao,
                        )
                        .filter(Boolean),
                    ]),
                  ]
                    .sort((a, b) => String(a).localeCompare(String(b), "pt-BR"))
                    .map((value) => ({ label: value, value }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todos"
                  getFormErrorMessage={() => null}
                />
              </div>
            </SpecArea>
            <SpecArea metadata={quadroFilterSpecifications["Tipo de vínculo"]}>
              <div className="prototype-quadro-spec-control">
                <DropdownFieldSeplag
                  name="tipo"
                  control={control}
                  label="Tipo de vínculo"
                  cols="12"
                  options={[
                    ...new Set(quadros.map((item) => item.vinculo)),
                  ].map((value) => ({ label: value, value }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todos"
                  getFormErrorMessage={() => null}
                />
              </div>
            </SpecArea>
            <SpecArea metadata={quadroFilterSpecifications.Situação}>
              <div className="prototype-quadro-spec-control">
                <DropdownFieldSeplag
                  name="situacao"
                  control={control}
                  label="Situação"
                  cols="12"
                  options={Object.entries(statusVigenciaMeta).map(
                    ([value, meta]) => ({ label: meta.label, value }),
                  )}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todas"
                  getFormErrorMessage={() => null}
                />
              </div>
            </SpecArea>
            <SpecArea metadata={quadroFilterSpecifications.Limpar}>
              <div className="prototype-quadro-spec-control">
                <BotaoLimparFiltroSeplag
                  onClick={() => reset(filtrosIniciais)}
                />
              </div>
            </SpecArea>
          </div>
          <div className="prototype-quadro-table-toolbar">
            <SpecArea metadata={quadroActionSpecifications["Novo Quadro"]}>
              <BotaoAdicionarSeplag
                label="Novo Quadro"
                onClick={() => navigate(`${BASE_PATH}/novo`)}
              />
            </SpecArea>
          </div>
          <SpecArea metadata={quadroTableSpecification}>
            <div className="prototype-quadro-table prototype-quadro-library-table">
            <TablePaginadoSeplag<QuadroListaRow>
              dataKey="id"
              data={resultadosQuadro(filtrados)}
              rows={10}
              rowsPerPage={[10, 20, 50]}
              lazy={false}
              selectionMode={null}
              columns={columns}
              expandedRows={linhasExpandidas}
              rowExpansionTemplate={renderHistoricoVersoes}
              hasEventoAcao
              actionHeader={
                <SpecArea metadata={quadroColumnSpecifications.Ações}>
                  <span>Ações</span>
                </SpecArea>
              }
              renderBotoes={renderAcoes}
              renderExpander={renderControleHistorico}
              handleOnPageChange={() => undefined}
            />
            </div>
          </SpecArea>
        </section>

        <ModalDeleteSeplag
          visible={Boolean(exclusao)}
          message={
            exclusao
              ? `Deseja realmente excluir ${exclusao.codigo}? Esta autorização ainda não entrou em vigência.`
              : undefined
          }
          onCancel={() => {
            setExclusao(null);
            setMotivoExclusao("");
          }}
          onConfirm={confirmarExclusao}
          confirmDisabled={!motivoExclusao.trim()}
        >
          <label className="prototype-quadro-delete-reason">
            <span>
              Motivo da exclusão <em>*</em>
            </span>
            <textarea
              value={motivoExclusao}
              onChange={(event) => setMotivoExclusao(event.target.value)}
              rows={3}
              maxLength={500}
              required
              autoFocus
              placeholder="Informe o motivo da exclusão"
            />
            <small>{motivoExclusao.length}/500 caracteres</small>
          </label>
        </ModalDeleteSeplag>
        {visualizado && (
          <QuadroAutorizadoModal
            registro={visualizado}
            onClose={() => setVisualizado(null)}
            onNovaVersao={() => solicitarNovaVersao(visualizado)}
            temVersaoAgendada={versoesAgendadasDoQuadro(visualizado).length > 0}
          />
        )}
        {versaoVisualizada && (
          <HistoricoVersaoModal
            quadro={versaoVisualizada.quadro}
            versao={versaoVisualizada.versao}
            onClose={() => setVersaoVisualizada(null)}
          />
        )}
        {distribuicaoVisualizada && (
          <DistribuicaoOrgaosModal
            quadro={distribuicaoVisualizada}
            onClose={() => setDistribuicaoVisualizada(null)}
          />
        )}
      </div>
    </SpecificationMode>
  );
}

function DistribuicaoOrgaosModal({
  quadro,
  onClose,
}: {
  quadro: QuadroListaRow;
  onClose: () => void;
}) {
  const totalDistribuido = quadro.distribuicaoOrgaos.reduce(
    (total, distribuicao) => total + distribuicao.quantidade,
    0,
  );

  return (
    <ModalSeplag
      visible
      titulo={`Órgãos do quadro ${quadro.codigo}`}
      fechar={onClose}
      tamanho="min(46rem, 94vw)"
      ariaLabel={`Órgãos do quadro ${quadro.codigo}`}
      customFooter={
        <div className="prototype-quadro-modal-library-actions">
          <BotaoVoltarSeplag
            label="Fechar"
            icon="pi pi-times"
            onClick={onClose}
          />
        </div>
      }
    >
      <div className="col-12 prototype-quadro-distribution-modal">
        <header>
          <div>
            <span>{quadro.cargo}</span>
            <strong>{quadro.orgaoResumo}</strong>
          </div>
          <strong>{totalDistribuido.toLocaleString("pt-BR")} vagas</strong>
        </header>
        {quadro.distribuicaoOrgaos.length ? (
          <div className="prototype-quadro-distribution-modal-list">
            {quadro.distribuicaoOrgaos.map((distribuicao) => (
              <article
                key={distribuicao.orgao}
                className={distribuicao.pendente ? "is-pending" : undefined}
              >
                <span>{distribuicao.orgao}</span>
                <strong>{distribuicao.quantidade.toLocaleString("pt-BR")}</strong>
                <small>
                  {totalDistribuido > 0
                    ? `${((distribuicao.quantidade / totalDistribuido) * 100).toLocaleString("pt-BR", {
                        maximumFractionDigits: 1,
                      })}%`
                    : "0%"}
                </small>
              </article>
            ))}
          </div>
        ) : (
          <p className="prototype-quadro-version-empty">
            Ainda não há vagas individualizadas para detalhar.
          </p>
        )}
      </div>
    </ModalSeplag>
  );
}

function HistoricoVersaoModal({
  quadro,
  versao,
  onClose,
}: {
  quadro: QuadroListaRow;
  versao: VersaoAnteriorQuadro;
  onClose: () => void;
}) {
  const statusVersao = versao.statusVigencia ?? "ENCERRADO";
  const metaStatus = statusVigenciaMeta[statusVersao];
  return (
    <ModalSeplag
      visible
      titulo={`${quadro.codigo} • Versão ${versao.versao}`}
      fechar={onClose}
      tamanho="min(52rem, 94vw)"
      ariaLabel={`Versão ${versao.versao} do quadro ${quadro.codigo}`}
      customFooter={
        <div className="prototype-quadro-modal-library-actions">
          <BotaoVoltarSeplag
            label="Fechar"
            icon="pi pi-times"
            onClick={onClose}
          />
        </div>
      }
    >
      <div className="col-12 prototype-quadro-version-modal">
        <div className="prototype-quadro-version-modal-status">
          <BadgeSeplag
            label={metaStatus.label}
            color={metaStatus.color}
            bg={metaStatus.bg}
            fontWeight
          />
          <strong>
            {versao.autorizadas.toLocaleString("pt-BR")} vagas autorizadas
          </strong>
        </div>
        <dl>
          <div>
            <dt>Cargo/Função</dt>
            <dd>{versao.cargo}</dd>
          </div>
          <div>
            <dt>Órgão</dt>
            <dd>{versao.orgao}</dd>
          </div>
          <div>
            <dt>Vigência</dt>
            <dd>{versao.vigencia}</dd>
          </div>
          {versao.encerradaEm && (
            <div>
              <dt>Encerrada em</dt>
              <dd>{versao.encerradaEm}</dd>
            </div>
          )}
          <div>
            <dt>Evolução</dt>
            <dd>{versao.evolucao}</dd>
          </div>
          <div className="is-wide">
            <dt>Ato legal</dt>
            <dd>{versao.ato}</dd>
          </div>
        </dl>
      </div>
    </ModalSeplag>
  );
}

function QuadroAutorizadoModal({
  registro,
  onClose,
  onNovaVersao,
  temVersaoAgendada,
}: {
  registro: QuadroAutorizadoRow;
  onClose: () => void;
  onNovaVersao: () => void;
  temVersaoAgendada: boolean;
}) {
  const documentosLegaisDisponiveis = useDocumentosLegais();
  const normas = documentosLegaisDisponiveis.filter((documento) =>
    registro.documentosLegaisIds?.includes(documento.id),
  );
  const quantitativos = registro.quantitativosLegaisPorOrgao ?? [];
  const status = statusVigenciaVisualDoQuadro(registro);
  const footer = (
    <div className="prototype-quadro-modal-library-actions">
      <SpecArea metadata={quadroActionSpecifications["Fechar visualização"]}>
        <BotaoVoltarSeplag
          label="Fechar"
          icon="pi pi-times"
          onClick={onClose}
        />
      </SpecArea>
      {quadroProduzEfeitos(registro) && !temVersaoAgendada && (
        <SpecArea metadata={quadroActionSpecifications["Criar nova versão"]}>
          <BotaoAdicionarSeplag
            label="Criar nova versão"
            onClick={onNovaVersao}
          />
        </SpecArea>
      )}
    </div>
  );
  return (
    <ModalSeplag
      visible
      titulo={
        <div>
          <strong>{registro.codigo}</strong>
          <small className="prototype-quadro-modal-library-subtitle">
            {registro.cargo} • Versão {registro.versao}
          </small>
        </div>
      }
      fechar={onClose}
      tamanho="min(72rem, 94vw)"
      customFooter={footer}
      ariaLabel={"Quadro autorizado " + registro.codigo}
    >
      <div className="col-12 prototype-quadro-modal-status">
        <SpecArea metadata={quadroColumnSpecifications.Situação}>
          <BadgeSeplag
            label={status.label}
            color={status.color}
            bg={status.bg}
            fontWeight
          />
        </SpecArea>
        <strong>
          {registro.autorizadas.toLocaleString("pt-BR")} vagas autorizadas
        </strong>
      </div>
      <div className="col-12 prototype-quadro-modal-body">
        <section>
          <h3>Identificação</h3>
          <dl>
            <div>
              <dt>Tipo de vínculo</dt>
              <dd>{registro.vinculo}</dd>
            </div>
            <div>
              <dt>Regime jurídico</dt>
              <dd>{registro.regime || "Não informado"}</dd>
            </div>
            <div>
              <dt>Carreira</dt>
              <dd>{registro.carreira || "Não informada"}</dd>
            </div>
            <div>
              <dt>Cargo</dt>
              <dd>{registro.cargo}</dd>
            </div>
            <div>
              <dt>Perfil profissional</dt>
              <dd>{registro.perfilProfissional || "Não se aplica"}</dd>
            </div>
          </dl>
        </section>
        <section>
          <h3>Destinação e quantitativos</h3>
          <dl>
            <div>
              <dt>Destinação legal</dt>
              <dd>{resumoOrgaos(registro)}</dd>
            </div>
            <div>
              <dt>Autorizadas</dt>
              <dd>{registro.autorizadas}</dd>
            </div>
            <div>
              <dt>Ocupadas</dt>
              <dd>{registro.ocupadas}</dd>
            </div>
            <div>
              <dt>Comprometidas</dt>
              <dd>{registro.comprometidas}</dd>
            </div>
            <div>
              <dt>Disponíveis</dt>
              <dd>{Math.max(0, saldo(registro))}</dd>
            </div>
          </dl>
          {quantitativos.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Órgão definido pela lei</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {quantitativos.map((item) => (
                  <tr key={item.orgao}>
                    <td>{item.orgao}</td>
                    <td>{item.quantidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!quantitativos.length && orgaosDoQuadro(registro).length > 1 && (
            <p className="prototype-quadro-modal-orgs">
              {orgaosDoQuadro(registro).join(" • ")}
            </p>
          )}
        </section>
        <section>
          <h3>Base legal</h3>
          {normas.length ? (
            <ul>
              {normas.map((norma) => (
                <li key={norma.id}>
                  <strong>{norma.titulo}</strong>
                  <span>{norma.descricao}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{registro.ato || "Não informada"}</p>
          )}
          <dl>
            <div>
              <dt>Processo administrativo</dt>
              <dd>{registro.processo || "Não informado"}</dd>
            </div>
          </dl>
        </section>
        <section>
          <h3>Vigência e controle</h3>
          <dl>
            <div>
              <dt>Situação da vigência</dt>
              <dd>{status.label}</dd>
            </div>
            {registro.extincaoProgressivaEmAndamento && (
              <div>
                <dt>Início da extinção progressiva</dt>
                <dd>{registro.dataInicioExtincaoProgressiva}</dd>
              </div>
            )}
            <div>
              <dt>Data de início</dt>
              <dd>
                {registro.dataAtivacao ||
                  registro.inicioVigencia ||
                  "Não informada"}
              </dd>
            </div>
            <div>
              <dt>Encerramento</dt>
              <dd>{registro.dataEncerramento || "Sem encerramento"}</dd>
            </div>
            <div>
              <dt>Extinção</dt>
              <dd>{registro.dataExtincao || "Sem extinção"}</dd>
            </div>
            <div>
              <dt>Última atualização</dt>
              <dd>{registro.atualizadoEm}</dd>
            </div>
            <div>
              <dt>Versão</dt>
              <dd>{registro.versao}</dd>
            </div>
          </dl>
        </section>
      </div>
    </ModalSeplag>
  );
}
function QuadroAutorizadoForm({
  registro,
  novaVersao,
  onBack,
}: {
  registro?: QuadroAutorizadoRow;
  novaVersao: boolean;
  onBack: () => void;
}) {
  const { quadros } = useControleVagasStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const documentosLegaisDisponiveis = useDocumentosLegaisAssociaveis();
  const [salvo, setSalvo] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [documentosLegaisIds, setDocumentosLegaisIds] = useState<string[]>(
    registro?.documentosLegaisIds ? [...registro.documentosLegaisIds] : [],
  );


  const { control, setValue, getValues, watch } = useForm<QuadroFormValues>({
    defaultValues: {
      vinculo: registro?.vinculo ?? "",
      regime: registro?.regime ?? "",
      carreira: registro?.carreira ?? "",
      cargo: registro?.cargo ?? "",
      perfilProfissional: registro?.perfilProfissional ?? "",
      orgao: registro?.orgao ?? "",
      abrangencia: registro?.abrangencia ?? "Órgão específico",
      quantidade: registro?.autorizadas ?? null,
      inicioVigencia: "",
      fimVigencia: registro?.fimVigencia ?? "",
      tipoAto: "",
      numeroAto: registro?.ato ?? "",
      dataAto: "",
      processo: registro?.processo ?? "",
      fundamentacao: "",
      motivoAlteracao: "",
      modoAbrangencia: "SEM_ORGAOS",
      orgaosDefinidos: [],
      situacao: novaVersao ? "ATIVO" : (registro?.situacaoVigencia ?? "ATIVO"),
      dataAtivacao: novaVersao
        ? ""
        : (registro?.dataAtivacao ?? registro?.inicioVigencia ?? ""),
      dataEncerramento: novaVersao ? undefined : registro?.dataEncerramento,
      motivoEncerramento: novaVersao ? undefined : registro?.motivoEncerramento,
      dataExtincao: novaVersao ? undefined : registro?.dataExtincao,
      motivoExtincao: novaVersao ? undefined : registro?.motivoExtincao,
    },
  });
  const form = watch();
  const normalizarCargo = (cargo: string) =>
    cargo.trim().toLocaleLowerCase("pt-BR");
  const quadroExistenteDoCargo = (cargo: string) =>
    quadros.find(
      (quadro) =>
        normalizarCargo(quadro.cargo) === normalizarCargo(cargo) &&
        (!registro || quadro.codigo !== registro.codigo),
    );
  const opcoesCargo = cargosBaseTemporaria.map((item) => {
    const quadroExistente = quadroExistenteDoCargo(item.nome);
    return {
      label:
        item.situacaoLegal === "EM_EXTINCAO"
          ? item.nome + " — Em extinção"
          : item.nome,
      value: item.nome,
      indisponivel: Boolean(quadroExistente),
      quadroCodigo: quadroExistente?.codigo,
      motivoIndisponibilidade: quadroExistente
        ? `Já existe o quadro ${quadroExistente.codigo} para este cargo.`
        : "",
    };
  });
  const cargoSelecionadoJaPossuiQuadro = Boolean(
    form.cargo && quadroExistenteDoCargo(form.cargo),
  );

  useEffect(() => {
    if (!cargoSelecionadoJaPossuiQuadro) return;

    setValue("cargo", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [cargoSelecionadoJaPossuiQuadro, form.cargo, setValue]);

  const formaDestinacao = "DISTRIBUICAO_POSTERIOR" as const;
  const vigenciaPrevia: VigenciaQuadroForm = {
    situacao: "ATIVO",
    dataAtivacao: form.dataAtivacao,
  };
  const statusVigenciaPrevia = calcularStatusOperacionalVigenciaSeplag(vigenciaPrevia);
  const situacaoPrevia = statusVigenciaPrevia.startsWith("AGENDADO")
    ? "Agendado"
    : "Ativo";
  const descricaoSituacaoPrevia =
    situacaoPrevia === "Agendado"
      ? "A autorização ficará programada para a data informada."
      : "A autorização passa a valer a partir da data informada.";
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const valores = getValues();
    const vigencia: VigenciaQuadroForm = {
      situacao: "ATIVO",
      dataAtivacao: valores.dataAtivacao,
    };
    const errosVigencia = validarSituacaoVigenciaSeplag(vigencia);
    const novosErros = [
      !form.vinculo && "Informe o tipo de vínculo.",
      !form.regime && "Informe o regime jurídico.",
      !form.carreira && "Informe a carreira.",
      !form.cargo && "Informe o cargo.",
      form.cargo &&
        quadroExistenteDoCargo(form.cargo) &&
        `Já existe um Quadro Autorizado para o cargo ${form.cargo}.`,
      !documentosLegaisIds.length &&
        "Vincule ao menos uma norma à autorização.",
      ...errosVigencia,
      (!form.quantidade || Number(form.quantidade) <= 0) &&
        "Informe uma quantidade maior que zero.",
      novaVersao && !form.motivoAlteracao && "Informe o motivo da nova versão.",
    ].filter(Boolean) as string[];
    setErros(novosErros);
    if (novosErros.length) return;
    const atual = controleVagasStore.getState();
    const novoId =
      novaVersao || !registro
        ? Math.max(0, ...atual.quadros.map((item) => item.id)) + 1
        : registro.id;
    const codigo = novaVersao
      ? registro!.codigo
      : (registro?.codigo ?? `QA-${String(novoId).padStart(4, "0")}`);
    const statusVigencia = calcularStatusOperacionalVigenciaSeplag(vigencia);
    const situacao = statusVigencia.startsWith("AGENDADO")
      ? ("Vigência futura" as const)
      : statusVigencia === "ATIVO"
        ? ("Vigente" as const)
        : ("Encerrada" as const);
    const normasSelecionadas = documentosLegaisDisponiveis.filter((item) =>
      documentosLegaisIds.includes(item.id),
    );
    const quadro: QuadroAutorizadoRow = {
      id: novoId,
      codigo,
      tipoQuadro: tipoQuadroPorVinculo(form.vinculo),
      vinculo: form.vinculo,
      regime: form.regime,
      carreira: form.carreira,
      cargo: form.cargo,
      perfilProfissional: form.perfilProfissional,
      orgao: "ESTADO DE MATO GROSSO",
      abrangencia: "Distribuição posterior pelo Estado",
      formaDestinacaoLegal: formaDestinacao,
      orgaosDefinidosLei: [],
      quantitativosLegaisPorOrgao: [],
      autorizadas: Number(form.quantidade),
      ocupadas: novaVersao ? (registro?.ocupadas ?? 0) : 0,
      comprometidas: novaVersao ? (registro?.comprometidas ?? 0) : 0,
      bloqueadas: novaVersao ? (registro?.bloqueadas ?? 0) : 0,
      inicioVigencia: vigencia.dataAtivacao ?? "",
      fimVigencia: vigencia.dataExtincao ?? vigencia.dataEncerramento ?? "",
      ato: normasSelecionadas.map((item) => item.titulo).join("; "),
      processo: form.processo,
      documentosLegaisIds,
      situacaoVigencia: vigencia.situacao,
      dataAtivacao: vigencia.dataAtivacao,
      dataEncerramento: vigencia.dataEncerramento,
      motivoEncerramento: vigencia.motivoEncerramento,
      dataExtincao: vigencia.dataExtincao,
      motivoExtincao: vigencia.motivoExtincao,
      situacao,
      versao: novaVersao
        ? (registro?.versao ?? 0) + 1
        : (registro?.versao ?? 1),
      atualizadoEm: "17/07/2026",
    };
    controleVagasStore.set("quadros", (itens) =>
      novaVersao
        ? [
            ...itens.map((item) =>
              item.id === registro?.id && situacao === "Vigente"
                ? { ...item, situacao: "Encerrada" as const }
                : item,
            ),
            quadro,
          ]
        : !registro
          ? [...itens, quadro]
          : itens.map((item) => (item.id === registro.id ? quadro : item)),
    );
    if (
      !novaVersao &&
      situacao === "Vigente" &&
      !atual.vagas.some((vaga) => vaga.quadroAutorizadoId === quadro.id)
    )
      controleVagasStore.set("vagas", (itens) => [
        ...itens,
        ...gerarVagasDoQuadro(quadro),
      ]);
    setSalvo(true);
    window.setTimeout(() => navigate(BASE_PATH), 700);
  };
  const titulo = novaVersao
    ? "Nova versão do quadro"
    : registro
      ? "Editar autorização"
      : "Novo Quadro";
  return (
    <div className="prototype-quadro-page">
      <header className="prototype-quadro-header">
        <div>
         <h1>{titulo}</h1>
          <p>
            {novaVersao
              ? `${registro?.codigo} • versão atual ${registro?.versao}`
              : "Preencha os dados que fundamentam o quantitativo autorizado."}
          </p>
        </div>
      </header>
      <MensagemSeplag
        visible={salvo}
        severity="success"
        message="Registro salvo com sucesso. Retornando à consulta..."
      />
      <MensagemSeplag
        visible={erros.length > 0}
        severity="error"
        message={
          "<strong>Revise os campos obrigatórios:</strong><ul>" +
          erros.map((erro) => `<li>${erro}</li>`).join("") +
          "</ul>"
        }
      />
      <form onSubmit={submit} className="prototype-quadro-form">
        <BaseLegalVinculada
          value={documentosLegaisIds}
          onChange={setDocumentosLegaisIds}
        />
        <section>
          <header>
            <i className="pi pi-briefcase" />
            <div>
              <h2>Identificação do quadro</h2>
              <p>Combinação utilizada para controlar o quantitativo.</p>
            </div>
          </header>
          <div className="prototype-quadro-fields">
            <DropdownFieldSeplag
              name="vinculo"
              control={control}
              label="Tipo de vínculo"
              required
              cols="12"
              options={[
                { label: "Servidor efetivo", value: "Servidor efetivo" },
                {
                  label: "Exclusivamente comissionado",
                  value: "Exclusivamente comissionado",
                },
              ]}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="regime"
              control={control}
              label="Regime jurídico"
              required
              cols="12"
              options={["Estatutário", "Administrativo", "Celetista"].map(
                (value) => ({ label: value, value }),
              )}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="carreira"
              control={control}
              label="Carreira"
              required
              cols="12"
              options={carreirasBaseTemporaria.map((item) => ({
                label:
                  item.situacaoLegal === "EM_EXTINCAO"
                    ? item.nome + " — Em extinção"
                    : item.nome,
                value: item.nome,
              }))}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="cargo"
              control={control}
              label="Cargo"
              required
              cols="12"
              options={opcoesCargo}
              optionLabel="label"
              optionValue="value"
              onChange={(cargoSelecionado) => {
                if (
                  cargoSelecionado &&
                  quadroExistenteDoCargo(String(cargoSelecionado))
                ) {
                  setValue("cargo", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
              itemTemplate={(option) => (
                <span
                  className={
                    option.indisponivel
                      ? "prototype-quadro-cargo-indisponivel"
                      : undefined
                  }
                  aria-label={option.motivoIndisponibilidade || undefined}
                >
                  <span className="prototype-quadro-cargo-indisponivel-label">
                    {option.label}
                  </span>
                  {option.quadroCodigo && (
                    <span className="prototype-quadro-cargo-indisponivel-badge">
                      {option.quadroCodigo}
                    </span>
                  )}
                </span>
              )}
              placeholder="Selecione"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="perfilProfissional"
              control={control}
              label="Perfil profissional"
              cols="12"
              options={perfisProfissionaisBaseTemporaria.map((item) => ({
                label: item.nome,
                value: item.nome,
              }))}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione um perfil"
              getFormErrorMessage={() => null}
            />
          </div>{" "}
        </section>{" "}
        <section>
          <header>
            <i className="pi pi-building" />
            <div>
              <h2>
                {novaVersao
                  ? "Nova configuração legal"
                  : "Quantitativo"}
              </h2>
              <p>
                {novaVersao
                  ? "Informe o quantitativo que passará a valer."
                  : "Defina o total de vagas autorizado."}
              </p>
            </div>
          </header>
          <div className="prototype-quadro-scope">
            <NumberFieldSeplag
              name="quantidade"
              control={control}
              label={
                novaVersao
                  ? "Nova quantidade autorizada"
                  : "Quantidade autorizada"
              }
              required
              cols="12"
              min={1}
              getFormErrorMessage={() => null}
            />
            {novaVersao && (
              <div className="prototype-quadro-comparison">
                <span>Quantidade vigente</span>
                <strong>{registro?.autorizadas}</strong>
                <i className="pi pi-arrow-right" />
                <span>Nova quantidade</span>
                <strong>{form.quantidade || "—"}</strong>
              </div>
            )}
          </div>
        </section>
        <section>
          <header>
            <i className="pi pi-calendar" />
            <div>
              <h2>{novaVersao ? "Início da nova versão" : "Vigência"}</h2>
              <p>
                {novaVersao
                  ? "Defina quando a nova versão passará a produzir efeitos."
                  : "Informe a situação temporal da autorização utilizando o padrão do sistema."}
              </p>
            </div>
          </header>
          <div className="prototype-quadro-library-section prototype-quadro-simple-vigencia">
            <div className="prototype-quadro-vigencia-date">
              <DateFieldSeplag
                name="dataAtivacao"
                control={control}
                label="Data de início"
                required
                cols="12"
                getFormErrorMessage={() => null}
              />
            </div>
            <div className="prototype-quadro-simple-status" aria-live="polite">
              <i
                className={
                  "pi " +
                  (situacaoPrevia === "Agendado"
                    ? "pi-clock"
                    : "pi-check-circle")
                }
              />
              <div>
                <span>
                  Situação <strong>*</strong>
                </span>
                <div>
                  <BadgeSeplag
                    label={situacaoPrevia}
                    color={
                      situacaoPrevia === "Agendado" ? "#8a5a00" : "#00843d"
                    }
                    bg={situacaoPrevia === "Agendado" ? "#fff3d6" : "#dff3e8"}
                    size="sm"
                    fontWeight
                  />
                </div>
                <small>{descricaoSituacaoPrevia}</small>
              </div>
            </div>
          </div>
        </section>{" "}
        <footer className="prototype-quadro-form-actions prototype-quadro-form-actions--flow">
          <BotaoVoltarSeplag
            label="Cancelar"
            icon="pi pi-times"
            onClick={onBack}
          />
          <BotaoSalvarSeplag
            type="submit"
            label={novaVersao ? "Criar nova versão" : "Salvar"}
          />
        </footer>
      </form>
    </div>
  );
}
function QuadroAutorizadoNovaVersao({
  registro,
  versaoEmEdicao,
  onBack,
}: {
  registro: QuadroAutorizadoRow;
  versaoEmEdicao?: QuadroAutorizadoRow;
  onBack: () => void;
}) {
  return (
    <div className="prototype-quadro-page">
      <header className="prototype-quadro-header">
        <div>
          <h1>{versaoEmEdicao ? "Editar versão agendada" : "Nova versão do quadro"}</h1>
</div>
      </header>
<QuadroLegalOperacoes registro={registro} versaoEmEdicao={versaoEmEdicao} onSaved={onBack} />
    </div>
  );
}
function QuadroAutorizadoDetalhe({
  registro,
  onBack,
}: {
  registro: QuadroAutorizadoRow;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const situacao = registro.situacao;
  const disponivel = Math.max(0, saldo(registro));
  return (
    <div className="prototype-quadro-page">
      <header className="prototype-quadro-header">
        <div>
          <BotaoVoltarSeplag label="Quadro Autorizado" onClick={onBack} />
          <div className="prototype-quadro-title-line">
            <h1>{registro.codigo}</h1>
            <span
              className={`prototype-quadro-status ${situacaoClass[situacao]}`}
            >
              {situacao}
            </span>
          </div>
          <p>
            {registro.cargo} • {resumoOrgaos(registro)} • Versão{" "}
            {registro.versao}
          </p>
        </div>
        <div className="prototype-quadro-header-actions">
          {situacao === "Vigência futura" && (
            <button
              onClick={() => navigate(`${BASE_PATH}/${registro.id}/editar`)}
            >
              <i className="pi pi-pencil" /> Editar antes da vigência
            </button>
          )}
          {situacao === "Vigente" && (
            <button
              className="prototype-quadro-primary"
              onClick={() =>
                navigate(`${BASE_PATH}/${registro.id}/nova-versao`)
              }
            >
              <i className="pi pi-plus" /> Nova versão
            </button>
          )}
        </div>
      </header>
      <section className="prototype-quadro-detail-kpis">
        <article>
          <span>Autorizadas</span>
          <strong>{registro.autorizadas}</strong>
        </article>
        <article>
          <span>
            Ocupadas <small>simulado</small>
          </span>
          <strong>{registro.ocupadas}</strong>
        </article>
        <article>
          <span>
            Comprometidas <small>simulado</small>
          </span>
          <strong>{registro.comprometidas}</strong>
        </article>
        <article className="is-available">
          <span>
            Disponíveis <small>simulado</small>
          </span>
          <strong>{disponivel}</strong>
        </article>
      </section>
      <div className="prototype-quadro-detail-grid">
        <section className="prototype-quadro-detail-card">
          <header>
            <h2>Identificação e abrangência</h2>
          </header>
          <dl>
            <div>
              <dt>Tipo de vínculo</dt>
              <dd>{registro.vinculo}</dd>
            </div>
            <div>
              <dt>Regime jurídico</dt>
              <dd>{registro.regime}</dd>
            </div>
            <div>
              <dt>Carreira</dt>
              <dd>{registro.carreira}</dd>
            </div>
            <div>
              <dt>Cargo</dt>
              <dd>{registro.cargo}</dd>
            </div>
            <div>
              <dt>Perfil profissional</dt>
              <dd>{registro.perfilProfissional || "Não se aplica"}</dd>
            </div>
            <div>
              <dt>Destinação</dt>
              <dd>{resumoOrgaos(registro)}</dd>
            </div>
            <div>
              <dt>Abrangência</dt>
              <dd>{registro.abrangencia}</dd>
            </div>
            {orgaosDoQuadro(registro).length > 1 && (
              <div className="is-full">
                <dt>Órgãos definidos pela lei</dt>
                <dd>{orgaosDoQuadro(registro).join(" • ")}</dd>
              </div>
            )}
          </dl>
        </section>
        <section className="prototype-quadro-detail-card">
          <header>
            <h2>Vigência e fundamentação</h2>
          </header>
          <dl>
            <div>
              <dt>Início da vigência</dt>
              <dd>{registro.inicioVigencia || "Não informado"}</dd>
            </div>
            <div>
              <dt>Fim da vigência</dt>
              <dd>{registro.fimVigencia || "Sem término"}</dd>
            </div>
            <div className="is-full">
              <dt>Ato autorizativo</dt>
              <dd>{registro.ato || "Ainda não informado"}</dd>
            </div>
            <div className="is-full">
              <dt>Processo administrativo</dt>
              <dd>{registro.processo}</dd>
            </div>
            <div>
              <dt>Versão</dt>
              <dd>{registro.versao}</dd>
            </div>
            <div>
              <dt>Última atualização</dt>
              <dd>{registro.atualizadoEm}</dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="prototype-quadro-detail-card prototype-quadro-history">
        <header>
          <div>
            <h2>Histórico de versões</h2>
            <p>Alterações preservadas para rastreabilidade.</p>
          </div>
        </header>
        <table>
          <thead>
            <tr>
              <th>Versão</th>
              <th>Vigência</th>
              <th>Quantidade</th>
              <th>Motivo</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>v{registro.versao}</strong>
              </td>
              <td>{registro.inicioVigencia || "Em definição"}</td>
              <td>{registro.autorizadas}</td>
              <td>
                {registro.versao > 1
                  ? "Atualização do quantitativo autorizado"
                  : "Cadastro inicial do quadro"}
              </td>
              <td>
                <span
                  className={`prototype-quadro-status ${situacaoClass[situacao]}`}
                >
                  {situacao}
                </span>
              </td>
            </tr>
            {registro.versao > 1 && (
              <tr>
                <td>v{registro.versao - 1}</td>
                <td>01/01/2024 a 31/12/2024</td>
                <td>{Math.max(1, registro.autorizadas - 10)}</td>
                <td>Versão anterior substituída</td>
                <td>
                  <span className="prototype-quadro-status is-closed">
                    Substituída
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
