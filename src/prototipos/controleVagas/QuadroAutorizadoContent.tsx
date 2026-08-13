import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { useForm } from "react-hook-form";
import type { DataTableExpandedRows } from "primereact/datatable";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import "./quadroAutorizado.css";

import type { QuadroAutorizadoRow, SituacaoQuadro } from "./types";
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
  orgaosBaseTemporaria,
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
  DropdownFieldSeplag,
  MultiSelectFieldSeplag,
  NumberFieldSeplag,
  RadioButtonFieldSeplag,
  TextFieldSeplag,
} from "../../componentes/Fields";
import type { ResultsSeplag } from "../../interfaces/Results";
import { BaseLegalVinculada } from "./BaseLegalVinculada";
import {
  useDocumentosLegais,
  useDocumentosLegaisAssociaveis,
} from "../documentosLegais/documentosLegaisStore";
import {
  SituacaoVigenciaSeplag,
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
    return "Pendente de ato de distribuição";
  const orgaos = orgaosDoQuadro(item).filter(
    (orgao) => orgao !== "ESTADO DE MATO GROSSO",
  );
  if (!orgaos.length) return "Pendente de ato de distribuição";
  if (orgaos.length === 1) return orgaos[0];
  return `${orgaos.length} órgãos definidos pela lei`;
};

export function QuadroAutorizadoContent() {
  const { quadros } = useControleVagasStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isNovo = location.pathname.endsWith("/novo");
  const isEditar = location.pathname.endsWith("/editar");
  const isNovaVersao = location.pathname.endsWith("/nova-versao");
  const isDetalhe = Boolean(id) && !isEditar && !isNovaVersao;

  if (isNovaVersao) {
    const registro = id
      ? quadros.find((item) => item.id === Number(id))
      : undefined;
    return registro?.situacao === "Vigente" ? (
      <QuadroAutorizadoNovaVersao
        registro={registro}
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
  AGENDADO_ENCERRAMENTO: {
    label: "Agendado para Encerramento",
    color: "#6b7280",
    bg: "#f1f5f9",
  },
  AGENDADO_EXTINCAO: {
    label: "Agendado para Extinção",
    color: "#b42318",
    bg: "#fee4e2",
  },
  ATIVO: { label: "Ativo", color: "#00843d", bg: "#dff3e8" },
  ENCERRADO: { label: "Encerrado", color: "#6b7280", bg: "#f1f5f9" },
  EXTINTO: { label: "Extinto", color: "#b42318", bg: "#fee4e2" },
};

const tipoQuadroPorVinculo = (
  vinculo: string,
): QuadroAutorizadoRow["tipoQuadro"] =>
  vinculo === "Exclusivamente comissionado" ? "Comissionado" : "Efetivo";

const statusVigenciaDoQuadro = (item: QuadroAutorizadoRow) =>
  calcularStatusOperacionalVigenciaSeplag({
    situacao:
      item.situacaoVigencia ??
      (item.situacao === "Encerrada" ? "ENCERRADO" : "ATIVO"),
    dataAtivacao: item.dataAtivacao || item.inicioVigencia,
    dataEncerramento: item.dataEncerramento || item.fimVigencia || undefined,
    motivoEncerramento: item.motivoEncerramento,
    dataExtincao: item.dataExtincao,
    motivoExtincao: item.motivoExtincao,
  });
const statusVigenciaVisualDoQuadro = (item: QuadroAutorizadoRow) => {
  const status = statusVigenciaDoQuadro(item);
  if (item.extincaoProgressivaEmAndamento && status === "ATIVO") {
    return {
      label: "Em extinção progressiva",
      color: "#9a6700",
      bg: "#fff4ce",
    };
  }
  return statusVigenciaMeta[status];
};
type VersaoAnteriorQuadro = {
  versao: number;
  cargo: string;
  orgao: string;
  autorizadas: number;
  vigencia: string;
  encerradaEm: string;
  evolucao:
    | "Ampliação legal"
    | "Redução legal"
    | "Transformação"
    | "Extinção progressiva";
  ato: string;
};

const versoesAnterioresPorQuadro: Record<string, VersaoAnteriorQuadro[]> = {
  "QA-0001": [
    {
      versao: 2,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 110,
      vigencia: "01/01/2023 a 31/12/2024",
      encerradaEm: "31/12/2024",
      evolucao: "Ampliação legal",
      ato: "Lei Complementar nº 550/2014",
    },
    {
      versao: 1,
      cargo: "Analista Administrativo",
      orgao: "SEPLAG",
      autorizadas: 90,
      vigencia: "01/01/2020 a 31/12/2022",
      encerradaEm: "31/12/2022",
      evolucao: "Ampliação legal",
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
      evolucao: "Redução legal",
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
      evolucao: "Transformação",
      ato: "Lei Complementar nº 740/2024",
    },
    {
      versao: 2,
      cargo: "Escrivão de Polícia",
      orgao: "PJC",
      autorizadas: 800,
      vigencia: "01/01/2022 a 31/12/2023",
      encerradaEm: "31/12/2023",
      evolucao: "Ampliação legal",
      ato: "Lei Complementar nº 690/2021",
    },
    {
      versao: 1,
      cargo: "Escrivão de Polícia",
      orgao: "PJC",
      autorizadas: 760,
      vigencia: "01/01/2019 a 31/12/2021",
      encerradaEm: "31/12/2021",
      evolucao: "Ampliação legal",
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
  ["ATIVO", "AGENDADO_ENCERRAMENTO", "AGENDADO_EXTINCAO"].includes(
    statusVigenciaDoQuadro(item),
  );
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
  const { control, reset, watch } = useForm<QuadroFiltrosForm>({
    defaultValues: filtrosIniciais,
  });
  const filtros = watch();
  const [visualizado, setVisualizado] = useState<QuadroAutorizadoRow | null>(
    null,
  );
  const [exclusao, setExclusao] = useState<QuadroAutorizadoRow | null>(null);
  const [versaoVisualizada, setVersaoVisualizada] = useState<{
    quadro: QuadroListaRow;
    versao: VersaoAnteriorQuadro;
  } | null>(null);
  const [linhasExpandidas, setLinhasExpandidas] =
    useState<DataTableExpandedRows>({});

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
  const filtrados = useMemo(() => {
    const termo = filtros.busca.trim().toLocaleLowerCase("pt-BR");
    return quadrosOperacionais
      .filter(
        (item) =>
          (!termo || item.codigo.toLocaleLowerCase("pt-BR").includes(termo)) &&
          (!filtros.cargo || item.cargo === filtros.cargo) &&
          (!filtros.orgao || orgaosDoQuadro(item).includes(filtros.orgao)) &&
          (!filtros.tipo || item.tipoQuadro === filtros.tipo) &&
          (!filtros.situacao ||
            statusVigenciaDoQuadro(item) === filtros.situacao),
      )
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
          item.situacao === "Vigente" &&
          item.situacaoVigencia !== "ENCERRADO" &&
          item.situacaoVigencia !== "EXTINTO";
        const movimentaveisCalculadas = quadroPermiteMovimentacao
          ? vagasDoQuadro.filter(
              (vaga) =>
                vaga.estado === "DISPONIVEL" &&
                vaga.situacaoLegal === "REGULAR" &&
                !idsVagasComprometidas.has(vaga.id),
            ).length
          : 0;
        const pendentesAto = vagasDoQuadro.filter((vaga) => {
          const posicao = calcularPosicaoVaga(vaga, movimentos, dataReferenciaDistribuicao);
          return (
            vaga.estado === "DISPONIVEL" &&
            vaga.situacaoLegal === "REGULAR" &&
            posicao.situacaoDistribuicao === "PENDENTE_ATO"
          );
        }).length;
        return {
          ...item,
          orgaoResumo: resumoOrgaos(item),
          comprometidas: comprometidasCalculadas,
          movimentaveisCalculadas,
          pendentesAto,
          disponiveisCalculadas: Math.max(0, saldo(item) - pendentesAto),
          statusVigencia: statusVigenciaDoQuadro(item),
        };
      });
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
  ]);

  const totais = filtrados.reduce(
    (acc, item) => ({
      autorizadas: acc.autorizadas + item.autorizadas,
      ocupadas: acc.ocupadas + item.ocupadas,
      comprometidas: acc.comprometidas + item.comprometidas,
      disponiveis: acc.disponiveis + item.disponiveisCalculadas,
    }),
    { autorizadas: 0, ocupadas: 0, comprometidas: 0, disponiveis: 0 },
  );

  const confirmarExclusao = () => {
    if (!exclusao || !quadroPermiteEdicaoDireta(exclusao)) return;
    controleVagasStore.set("quadros", (itens) =>
      itens.filter((quadro) => quadro.id !== exclusao.id),
    );
    controleVagasStore.set("vagas", (itens) =>
      itens.filter((vaga) => vaga.quadroAutorizadoId !== exclusao.id),
    );
    setExclusao(null);
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
            <span>{item.orgaoResumo}</span>
            {orgaosDoQuadro(item).length > 1 && (
              <small>{orgaosDoQuadro(item).join(" • ")}</small>
            )}
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
        <SpecArea metadata={quadroColumnSpecifications["Pendentes de ato"]}>
          <span>Pendentes de ato</span>
        </SpecArea>
      ),
      sortable: true,
      body: (item) =>
        celulaComEspecificacao(
          item,
          quadroColumnSpecifications["Pendentes de ato"],
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
        const rotuloQuebrado = meta.label.startsWith("Agendado para ")
          ? meta.label.replace("Agendado para ", "Agendado para\n")
          : meta.label;
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
    const versoes = versoesAnterioresPorQuadro[item.codigo] ?? [];
    return (
      <SpecArea metadata={quadroColumnSpecifications["Histórico de versões"]}>
        <section className="prototype-quadro-version-history">
          {versoes.length ? (
            <div className="prototype-quadro-version-table-wrap">
              <table className="prototype-quadro-version-table">
                <thead>
                  <tr>
                    <th>Versão</th>
                    <th>Cargo/Função</th>
                    <th>Órgão</th>
                    <th>Vigência</th>
                    <th>Autorizadas</th>
                    <th>Evolução</th>
                    <th>Situação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {versoes.map((versao) => (
                    <tr key={`${item.codigo}-${versao.versao}`}>
                      <td>
                        <strong>Versão {versao.versao}</strong>
                      </td>
                      <td>{versao.cargo}</td>
                      <td>{versao.orgao}</td>
                      <td>
                        <span>{versao.vigencia}</span>
                        <small>Encerrada em {versao.encerradaEm}</small>
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
                          label="Encerrada"
                          color="#66788a"
                          bg="#edf1f4"
                          size="xs"
                          fontWeight
                        />
                      </td>
                      <td>
                        <BotaoIconSeplag
                          type="button"
                          tooltip={`Visualizar versão ${versao.versao}`}
                          aria-label={`Visualizar versão ${versao.versao}`}
                          icon="pi pi-eye"
                          onClick={() =>
                            setVersaoVisualizada({ quadro: item, versao })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  const renderAcoes = (item: QuadroListaRow) => (
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
      <SpecArea metadata={quadroActionSpecifications.Editar}>
        <BotaoIconSeplag
          type="button"
          tooltip={
            quadroPermiteEdicaoDireta(item)
              ? "Editar antes da vigência"
              : "Edição indisponível após a vigência"
          }
          aria-label="Editar"
          icon="pi pi-pencil"
          severity="warning"
          disabled={!quadroPermiteEdicaoDireta(item)}
          onClick={() => navigate(`${BASE_PATH}/${item.id}/editar`)}
        />
      </SpecArea>
      {quadroPermiteEdicaoDireta(item) && (
        <SpecArea metadata={quadroActionSpecifications.Excluir}>
          <BotaoIconSeplag
            type="button"
            tooltip="Excluir antes da vigência"
            aria-label="Excluir"
            icon="pi pi-trash"
            severity="danger"
            onClick={() => setExclusao(item)}
          />
        </SpecArea>
      )}
      {item.movimentaveisCalculadas > 0 && (
        <SpecArea metadata={quadroActionSpecifications.Distribuir}>
          <BotaoIconSeplag
            type="button"
            tooltip="Distribuir vagas deste quadro"
            aria-label="Distribuir vagas"
            icon="pi pi-sitemap"
            onClick={() =>
              navigate(
                `${CONTROLE_VAGAS_BASE_PATH}/distribuicao?quadro=${item.id}`,
              )
            }
          />
        </SpecArea>
      )}
      {quadroProduzEfeitos(item) && (
        <SpecArea metadata={quadroActionSpecifications["Criar nova versão"]}>
          <BotaoIconSeplag
            type="button"
            tooltip="Criar nova versão"
            aria-label="Criar nova versão"
            icon="pi pi-plus"
            onClick={() => navigate(`${BASE_PATH}/${item.id}/nova-versao`)}
          />
        </SpecArea>
      )}
    </div>
  );
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
              ? "Fechar histórico de versões"
              : "Abrir histórico de versões"
          }
          title={
            aberto
              ? "Fechar histórico de versões"
              : "Abrir histórico de versões"
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
      <div className="prototype-quadro-page">
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
                  options={[...new Set(quadros.flatMap(orgaosDoQuadro))].map(
                    (value) => ({ label: value, value }),
                  )}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todos"
                  getFormErrorMessage={() => null}
                />
              </div>
            </SpecArea>
            <SpecArea metadata={quadroFilterSpecifications["Tipo de quadro"]}>
              <div className="prototype-quadro-spec-control">
                <DropdownFieldSeplag
                  name="tipo"
                  control={control}
                  label="Tipo de quadro"
                  cols="12"
                  options={[
                    ...new Set(quadros.map((item) => item.tipoQuadro)),
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
          onCancel={() => setExclusao(null)}
          onConfirm={confirmarExclusao}
        />
        {visualizado && (
          <QuadroAutorizadoModal
            registro={visualizado}
            onClose={() => setVisualizado(null)}
            onNovaVersao={() =>
              navigate(`${BASE_PATH}/${visualizado.id}/nova-versao`)
            }
          />
        )}
        {versaoVisualizada && (
          <HistoricoVersaoModal
            quadro={versaoVisualizada.quadro}
            versao={versaoVisualizada.versao}
            onClose={() => setVersaoVisualizada(null)}
          />
        )}
      </div>
    </SpecificationMode>
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
            label="Encerrada"
            color="#66788a"
            bg="#edf1f4"
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
          <div>
            <dt>Encerrada em</dt>
            <dd>{versao.encerradaEm}</dd>
          </div>
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
}: {
  registro: QuadroAutorizadoRow;
  onClose: () => void;
  onNovaVersao: () => void;
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
      {quadroProduzEfeitos(registro) && (
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
          <h3>Abrangência e quantitativo</h3>
          <dl>
            <div>
              <dt>Destinação legal</dt>
              <dd>{resumoOrgaos(registro)}</dd>
            </div>
            <div>
              <dt>Abrangência</dt>
              <dd>{registro.abrangencia}</dd>
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
      modoAbrangencia: registro
        ? registro.formaDestinacaoLegal === "DISTRIBUICAO_POSTERIOR"
          ? "SEM_ORGAOS"
          : registro.quantitativosLegaisPorOrgao?.length
            ? "ORGAOS_COM_QUANTITATIVO"
            : "ORGAOS_SEM_QUANTITATIVO"
        : "",
      orgaosDefinidos: registro?.orgaosDefinidosLei
        ? [...registro.orgaosDefinidosLei]
        : registro?.orgao && registro.orgao !== "ESTADO DE MATO GROSSO"
          ? [registro.orgao]
          : [],
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
      motivoIndisponibilidade: quadroExistente
        ? `Já existe o quadro ${quadroExistente.codigo} para este cargo.`
        : "",
    };
  });
  const [avisoCargo, setAvisoCargo] = useState<string | null>(null);
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

  const modoAbrangencia = form.modoAbrangencia;
  const formaDestinacao =
    modoAbrangencia === "SEM_ORGAOS"
      ? "DISTRIBUICAO_POSTERIOR"
      : "DEFINIDA_NA_LEI";
  const defineQuantidadePorOrgao =
    modoAbrangencia === "ORGAOS_COM_QUANTITATIVO";
  const orgaosDefinidos = form.orgaosDefinidos;
  const [quantidadesPorOrgao, setQuantidadesPorOrgao] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      (registro?.quantitativosLegaisPorOrgao ?? []).map((item) => [
        item.orgao,
        String(item.quantidade),
      ]),
    ),
  );
  useEffect(() => {
    if (modoAbrangencia === "SEM_ORGAOS") {
      setValue("orgaosDefinidos", []);
      setQuantidadesPorOrgao({});
    } else if (modoAbrangencia === "ORGAOS_SEM_QUANTITATIVO") {
      setQuantidadesPorOrgao({});
    }
  }, [modoAbrangencia]);
  const alterarOrgaosSelecionados = (orgaos: string[]) => {
    setValue("orgaosDefinidos", orgaos, { shouldDirty: true });
    setQuantidadesPorOrgao((atuais) =>
      Object.fromEntries(orgaos.map((orgao) => [orgao, atuais[orgao] ?? ""])),
    );
  };
  const totalPorOrgao = orgaosDefinidos.reduce(
    (total, orgao) => total + Number(quantidadesPorOrgao[orgao] || 0),
    0,
  );
  const quantidadeAutorizada = Number(form.quantidade || 0);
  const saldoAlocacaoLegal = Math.max(0, quantidadeAutorizada - totalPorOrgao);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const valores = getValues();
    const vigencia: VigenciaQuadroForm = {
      situacao: valores.situacao,
      dataAtivacao: valores.dataAtivacao,
      dataEncerramento: valores.dataEncerramento,
      motivoEncerramento: valores.motivoEncerramento,
      dataExtincao: valores.dataExtincao,
      motivoExtincao: valores.motivoExtincao,
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
      !modoAbrangencia &&
        "Informe como a lei definiu a alocação das vagas.",
      formaDestinacao === "DEFINIDA_NA_LEI" &&
        Boolean(modoAbrangencia) &&
        !orgaosDefinidos.length &&
        "Selecione ao menos um órgão definido pela lei.",
      (!form.quantidade || Number(form.quantidade) <= 0) &&
        "Informe uma quantidade maior que zero.",
      formaDestinacao === "DEFINIDA_NA_LEI" &&
        defineQuantidadePorOrgao &&
        totalPorOrgao !== Number(form.quantidade) &&
        "A soma das quantidades por órgão deve ser igual à quantidade autorizada.",
      formaDestinacao === "DEFINIDA_NA_LEI" &&
        defineQuantidadePorOrgao &&
        orgaosDefinidos.some(
          (orgao) => Number(quantidadesPorOrgao[orgao] || 0) <= 0,
        ) &&
        "Informe uma quantidade maior que zero para cada órgão.",
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
    const orgaoCompatibilidade =
      formaDestinacao === "DEFINIDA_NA_LEI" && orgaosDefinidos.length === 1
        ? orgaosDefinidos[0]
        : "ESTADO DE MATO GROSSO";
    const quadro: QuadroAutorizadoRow = {
      id: novoId,
      codigo,
      tipoQuadro: tipoQuadroPorVinculo(form.vinculo),
      vinculo: form.vinculo,
      regime: form.regime,
      carreira: form.carreira,
      cargo: form.cargo,
      perfilProfissional: form.perfilProfissional,
      orgao: orgaoCompatibilidade,
      abrangencia:
        formaDestinacao === "DISTRIBUICAO_POSTERIOR"
          ? "Distribuição posterior pelo Estado"
          : "Destinação definida na lei",
      formaDestinacaoLegal: formaDestinacao,
      orgaosDefinidosLei:
        formaDestinacao === "DEFINIDA_NA_LEI" ? orgaosDefinidos : [],
      quantitativosLegaisPorOrgao:
        formaDestinacao === "DEFINIDA_NA_LEI" && defineQuantidadePorOrgao
          ? orgaosDefinidos.map((orgao) => ({
              orgao,
              quantidade: Number(quantidadesPorOrgao[orgao]),
            }))
          : [],
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
      <ModalSeplag
        visible={Boolean(avisoCargo)}
        titulo="Cargo indisponível"
        fechar={() => setAvisoCargo(null)}
        tamanho="min(32rem, 92vw)"
        ariaLabel="Motivo de indisponibilidade do cargo"
        customFooter={
          <div className="prototype-quadro-modal-library-actions">
            <BotaoVoltarSeplag
              label="Fechar"
              icon="pi pi-times"
              onClick={() => setAvisoCargo(null)}
            />
          </div>
        }
      >
        <div className="col-12 prototype-quadro-cargo-modal-message">
          <i className="pi pi-info-circle" aria-hidden="true" />
          <div>
            <strong>Este cargo não pode ser selecionado.</strong>
            <p>{avisoCargo}</p>
          </div>
        </div>
      </ModalSeplag>
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
                  onClick={(event) => {
                    if (!option.indisponivel) return;
                    event.preventDefault();
                    event.stopPropagation();
                    setAvisoCargo(option.motivoIndisponibilidade);
                  }}
                >
                  {option.label}
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
                  : "Abrangência e quantitativo"}
              </h2>
              <p>
                {novaVersao
                  ? "Informe somente o quantitativo e a alocação que passarão a valer."
                  : "Defina o total autorizado e como a legislação alocou as vagas."}
              </p>
            </div>
          </header>
          <div className="prototype-quadro-scope">
            <div className="prototype-quadro-scope-summary">
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
              <article className="prototype-quadro-summary-inline">
                <span>Alocado pela lei</span>
                <strong>
                  {totalPorOrgao.toLocaleString("pt-BR")} <small>vagas</small>
                </strong>
              </article>
              <article className="prototype-quadro-summary-inline">
                <span>Saldo sem alocação legal</span>
                <div>
                  <strong
                    className={
                      saldoAlocacaoLegal === 0 && quantidadeAutorizada > 0
                        ? "is-complete"
                        : ""
                    }
                  >
                    {saldoAlocacaoLegal.toLocaleString("pt-BR")}{" "}
                    <small>vagas</small>
                  </strong>
                  {modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" &&
                    saldoAlocacaoLegal === 0 &&
                    quantidadeAutorizada > 0 && (
                      <em>
                        <i className="pi pi-check-circle" /> Alocação concluída
                      </em>
                    )}
                </div>
              </article>
            </div>
            <div className="prototype-quadro-scope-question prototype-quadro-library-radio">
              <RadioButtonFieldSeplag
                name="modoAbrangencia"
                control={control}
                label="Como a lei definiu a alocação das vagas?"
                required
                cols="12"
                variant="cards"
                options={[
                  {
                    value: "SEM_ORGAOS",
                    label: "Não indicou órgãos específicos",
                    description:
                      "As vagas poderão ser distribuídas posteriormente pelo Estado.",
                    icon: "pi pi-file",
                  },
                  {
                    value: "ORGAOS_SEM_QUANTITATIVO",
                    label: "Indicou os órgãos, mas não definiu quantitativos",
                    description:
                      "A lei restringiu os órgãos que poderão receber as vagas.",
                    icon: "pi pi-users",
                  },
                  {
                    value: "ORGAOS_COM_QUANTITATIVO",
                    label: "Indicou os órgãos e o quantitativo de cada um",
                    description:
                      "A lei definiu os órgãos e a quantidade destinada a cada um.",
                    icon: "pi pi-building",
                  },
                ]}
                getFormErrorMessage={() => null}
              />
            </div>
            {modoAbrangencia === "SEM_ORGAOS" && (
              <div className="prototype-quadro-library-message">
                <MensagemSeplag
                  severity="info"
                  message="As vagas serão criadas como <strong>pendentes de ato de distribuição</strong>. A destinação será registrada posteriormente no menu Distribuição."
                />
              </div>
            )}
            {(modoAbrangencia === "ORGAOS_SEM_QUANTITATIVO" ||
              modoAbrangencia === "ORGAOS_COM_QUANTITATIVO") && (
              <div className="prototype-quadro-legal-allocation">
                <h3>
                  {modoAbrangencia === "ORGAOS_COM_QUANTITATIVO"
                    ? "Alocação definida pela lei"
                    : "Órgãos permitidos pela lei"}
                </h3>
                <MultiSelectFieldSeplag
                  name="orgaosDefinidos"
                  control={control}
                  label="Órgãos"
                  required
                  cols="12"
                  options={orgaosBaseTemporaria.map((item) => ({
                    label: item.nome,
                    value: item.nome,
                  }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecione um ou mais órgãos"
                  display="chip"
                  maxSelectedLabels={4}
                  onChange={alterarOrgaosSelecionados}
                  getFormErrorMessage={() => null}
                />

                {orgaosDefinidos.length === 0 ? (
                  <div className="prototype-quadro-empty-orgao">
                    <i className="pi pi-building" /> Nenhum órgão adicionado.
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Órgão</th>
                        {modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" && (
                          <>
                            <th>Quantidade de vagas</th>
                            <th>%</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {orgaosDefinidos.map((orgao) => (
                        <tr key={orgao}>
                          <td>
                            <strong>{orgao}</strong>
                          </td>
                          {modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" && (
                            <>
                              <td>
                                <NumberInputPadrao
                                  value={quantidadesPorOrgao[orgao] ?? ""}
                                  onChange={(value) =>
                                    setQuantidadesPorOrgao((atuais) => ({
                                      ...atuais,
                                      [orgao]: value,
                                    }))
                                  }
                                />
                              </td>
                              <td>
                                {quantidadeAutorizada > 0
                                  ? (
                                      (Number(quantidadesPorOrgao[orgao] || 0) /
                                        quantidadeAutorizada) *
                                      100
                                    ).toLocaleString("pt-BR", {
                                      maximumFractionDigits: 2,
                                    })
                                  : "0"}
                                %
                              </td>
                            </>
                          )}

                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {modoAbrangencia === "ORGAOS_COM_QUANTITATIVO" &&
                  orgaosDefinidos.length > 0 && (
                    <div
                      className={
                        "prototype-quadro-allocation-total " +
                        (totalPorOrgao === quantidadeAutorizada &&
                        quantidadeAutorizada > 0
                          ? "is-valid"
                          : totalPorOrgao > quantidadeAutorizada
                            ? "is-over"
                            : "")
                      }
                    >
                      <div>
                        <strong>Total alocado</strong>
                        <span>
                          {totalPorOrgao.toLocaleString("pt-BR")} de{" "}
                          {quantidadeAutorizada.toLocaleString("pt-BR")} vagas
                        </span>
                      </div>
                      <progress
                        max={Math.max(1, quantidadeAutorizada)}
                        value={Math.min(
                          totalPorOrgao,
                          Math.max(1, quantidadeAutorizada),
                        )}
                      />
                      <small>
                        <i
                          className={
                            "pi " +
                            (totalPorOrgao === quantidadeAutorizada &&
                            quantidadeAutorizada > 0
                              ? "pi-check-circle"
                              : "pi-info-circle")
                          }
                        />{" "}
                        {totalPorOrgao === quantidadeAutorizada &&
                        quantidadeAutorizada > 0
                          ? "O total alocado corresponde ao autorizado."
                          : totalPorOrgao > quantidadeAutorizada
                            ? "O total alocado ultrapassa o autorizado."
                            : "Ainda faltam " +
                              Math.max(
                                0,
                                quantidadeAutorizada - totalPorOrgao,
                              ).toLocaleString("pt-BR") +
                              " vagas para alocar."}
                      </small>
                    </div>
                  )}
              </div>
            )}
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
          <div className="prototype-quadro-library-section">
            <SituacaoVigenciaSeplag
              control={control}
              setValue={setValue}
              situacoesDisponiveis={
                !registro && !novaVersao ? ["ATIVO"] : undefined
              }
              rotuloDataAtivacao="Data de início"
              cols={{
                situacao: "12 12 3",
                dataAtivacao: "12 12 3",
                statusOperacional: "col-12 md:col-12 lg:col-5",
                dataEncerramento: "12 12 3",
                motivoEncerramento: "12",
                dataExtincao: "12 12 3",
                motivoExtincao: "12",
              }}
              getFormErrorMessage={() => null}
            />
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

function NumberInputPadrao({
  value,
  onChange,
  min = 1,
  max,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}) {
  const parsed = value === "" ? null : Number(value);
  const { control, setValue, watch } = useForm<{ number: number | null }>({
    defaultValues: { number: parsed },
  });
  const current = watch("number");
  useEffect(() => setValue("number", parsed), [parsed, setValue]);
  useEffect(() => {
    const normalized = current == null ? "" : String(current);
    if (normalized !== value) onChange(normalized);
  }, [current, onChange, value]);
  return (
    <NumberFieldSeplag
      name="number"
      control={control}
      label=""
      cols="12"
      min={min}
      max={max}
      getFormErrorMessage={() => null}
    />
  );
}
function QuadroAutorizadoNovaVersao({
  registro,
  onBack,
}: {
  registro: QuadroAutorizadoRow;
  onBack: () => void;
}) {
  return (
    <div className="prototype-quadro-page">
      <header className="prototype-quadro-header">
        <div>
          <h1>Nova versão do quadro</h1>
</div>
      </header>
<QuadroLegalOperacoes registro={registro} onSaved={onBack} />
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








