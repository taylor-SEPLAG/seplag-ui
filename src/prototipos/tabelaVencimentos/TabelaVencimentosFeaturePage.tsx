import { Fragment, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  BotaoLimparFiltroSeplag,
  BotaoIconSeplag,
  BotaoSalvarSeplag,
  BotaoSeplag,
  BotaoVoltarSeplag,
} from "@componentes/Botao";
import { CardSeplag } from "@componentes/Card";
import { BreadcrumbSeplag } from "@componentes/Breadcrumb";
import { DropdownFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { DocumentosLegaisAssociadosSeplag } from "@componentes/DocumentosLegaisAssociados";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import "./tabelaVencimentos.css";
import "./tabelaVencimentosSpacing.css";

type Status = "Vigente" | "Futura" | "Encerrada";
type AbrangenciaTabela =
  | "Aplicada a todos os perfis"
  | "Por perfil profissional"
  | "Sem tabela";
type Cargo = {
  id: number;
  nome: string;
  carreira: string;
  abrangencia: AbrangenciaTabela;
  perfis: string[];
  jornadas: string[];
  vigentes: number;
  tabelas: number;
  alteracao: string;
};
type Versao = {
  ano: number;
  inicio: string;
  fim?: string;
  status: Status;
  alteracao: string;
  usuario: string;
  matrix?: MatrixData;
  baseLegal?: string;
  observacao?: string;
  origem?: "Cadastro inicial" | "Versionamento" | "RGA";
  percentualRga?: string;
};
type MatrixData = { columns: string[]; rows: Array<{ name: string; values: string[] }> };
type TabelaSalva = {
  id?: string;
  cargoId: number;
  jornada: string;
  versao: Versao;
  matrix?: MatrixData;
  baseLegal?: string;
  observacao?: string;
  incideRga?: boolean;
  rga?: { percentual: string; ano: string; vigencia: string; baseLegal: string; observacao: string; responsavel?: string; aplicadaEm?: string };
};
const BASE = "/prototipos/sigep/tabelas-vencimentos";
const STORAGE_KEY = "sigep-tabelas-vencimentos-salvas";
const readSavedTables = (): TabelaSalva[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "[]") as TabelaSalva[];
  } catch {
    return [];
  }
};
const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return value ? day + "/" + month + "/" + year : "";
};
const toInputDate = (value: string) => {
  const [day, month, year] = value.split("/");
  return value ? year + "-" + month + "-" + day : "";
};
const localIsoDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
};
const previousIsoDate = (reference = localIsoDate()) => {
  const [year, month, day] = reference.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return localIsoDate(date);
};
const isVersionCurrent = (version: Versao) => {
  const today = localIsoDate();
  const start = toInputDate(version.inicio);
  const end = version.fim ? toInputDate(version.fim) : "";
  return version.status === "Vigente" && start <= today && (!end || end >= today);
};
const defaultMatrixData = (): MatrixData => ({
  columns: ["A", "B", "C", "D", "E"],
  rows: VALORES.map((row, index) => ({
    name: String(index + 1).padStart(3, "0"),
    values: row.slice(1).map((value) => "R$ " + value),
  })),
});
const CARGOS: Cargo[] = [
  {
    id: 1,
    nome: "Auditor Fiscal",
    carreira: "Administração Tributária",
    abrangencia: "Aplicada a todos os perfis",
    perfis: [
      "Auditoria",
      "Fiscalização",
      "Tecnologia da Informação",
      "Contabilidade",
      "Jurídico",
      "Planejamento",
    ],
    jornadas: ["20 horas", "30 horas", "40 horas"],
    vigentes: 1,
    tabelas: 3,
    alteracao: "10/08/2026",
  },
  {
    id: 2,
    nome: "Analista Administrativo",
    carreira: "Gestão Governamental",
    abrangencia: "Por perfil profissional",
    perfis: [
      "Administração",
      "Contabilidade",
      "Tecnologia da Informação",
      "Planejamento",
    ],
    jornadas: ["20 horas", "30 horas", "40 horas"],
    vigentes: 2,
    tabelas: 2,
    alteracao: "08/08/2026",
  },
  {
    id: 3,
    nome: "Professor da Educação Básica",
    carreira: "Educação Básica",
    abrangencia: "Aplicada a todos os perfis",
    perfis: [
      "Pedagogia",
      "Língua Portuguesa",
      "Matemática",
      "História",
      "Ciências",
    ],
    jornadas: ["20 horas", "40 horas"],
    vigentes: 3,
    tabelas: 3,
    alteracao: "02/08/2026",
  },
  {
    id: 4,
    nome: "Médico",
    carreira: "Saúde Pública",
    abrangencia: "Por perfil profissional",
    perfis: ["Clínica Médica", "Cardiologia", "Medicina do Trabalho"],
    jornadas: ["20 horas", "24 horas", "40 horas"],
    vigentes: 1,
    tabelas: 1,
    alteracao: "28/07/2026",
  },
  {
    id: 5,
    nome: "Assistente Administrativo",
    carreira: "-",
    abrangencia: "Aplicada a todos os perfis",
    perfis: ["Apoio Administrativo", "Atendimento ao Público"],
    jornadas: ["30 horas", "40 horas"],
    vigentes: 1,
    tabelas: 1,
    alteracao: "22/07/2026",
  },
  {
    id: 6,
    nome: "Técnico de Desenvolvimento Econômico e Social",
    carreira: "-",
    abrangencia: "Sem tabela",
    perfis: ["Apoio Técnico", "Gestão de Processos", "Atendimento"],
    jornadas: ["20 horas", "30 horas", "40 horas"],
    vigentes: 0,
    tabelas: 0,
    alteracao: "15/07/2026",
  },
  {
    id: 7,
    nome: "Auxiliar de Serviços Gerais",
    carreira: "-",
    abrangencia: "Por perfil profissional",
    perfis: ["Serviços Gerais"],
    jornadas: ["40 horas"],
    vigentes: 1,
    tabelas: 1,
    alteracao: "08/07/2026",
  },
];
const MATRIZ_HISTORICO_FAKE: MatrixData = {
  columns: ["A", "B", "C", "D", "E"],
  rows: [
    { name: "001", values: ["R$ 4.500,00", "R$ 4.750,00", "R$ 5.000,00", "R$ 5.250,00", "R$ 5.500,00"] },
    { name: "002", values: ["R$ 4.800,00", "R$ 5.050,00", "R$ 5.300,00", "R$ 5.550,00", "R$ 5.800,00"] },
    { name: "003", values: ["R$ 5.100,00", "R$ 5.350,00", "R$ 5.600,00", "R$ 5.850,00", "R$ 6.100,00"] },
    { name: "004", values: ["R$ 5.400,00", "R$ 5.650,00", "R$ 5.900,00", "R$ 6.150,00", "R$ 6.400,00"] },
    { name: "005", values: ["R$ 5.700,00", "R$ 5.950,00", "R$ 6.200,00", "R$ 6.450,00", "R$ 6.700,00"] },
  ],
};
const VERSOES: Versao[] = [
  {
    ano: 2027,
    inicio: "01/01/2027",
    status: "Futura",
    alteracao: "10/08/2026",
    usuario: "Roberto Junior",
    matrix: MATRIZ_HISTORICO_FAKE,
    baseLegal: "Lei_Complementar_600_2017.pdf",
    observacao: "Valores projetados para a próxima vigência da carreira.",
  },
  {
    ano: 2026,
    inicio: "01/01/2026",
    status: "Vigente",
    alteracao: "12/08/2026",
    usuario: "Maria Silva",
    matrix: MATRIZ_HISTORICO_FAKE,
    baseLegal: "Lei_Complementar_600_2017.pdf",
    observacao: "Valores definidos conforme a estrutura vigente da carreira.",
  },
  {
    ano: 2025,
    inicio: "01/01/2025",
    fim: "31/12/2025",
    status: "Encerrada",
    alteracao: "15/12/2025",
    usuario: "Ana Souza",
    matrix: MATRIZ_HISTORICO_FAKE,
    baseLegal: "Lei_Complementar_600_2017.pdf",
    observacao: "Tabela encerrada após a publicação da nova vigência.",
  },
  {
    ano: 2024,
    inicio: "01/01/2024",
    fim: "31/12/2024",
    status: "Encerrada",
    alteracao: "20/12/2024",
    usuario: "Carlos Lima",
    matrix: MATRIZ_HISTORICO_FAKE,
    baseLegal: "Lei_Complementar_600_2017.pdf",
    observacao: "Registro histórico da tabela de vencimentos de 2024.",
  },
];
const VALORES = [
  ["I", "4.500,00", "4.750,00", "5.000,00", "5.250,00", "5.500,00"],
  ["II", "4.800,00", "5.050,00", "5.300,00", "5.550,00", "5.800,00"],
  ["III", "5.100,00", "5.350,00", "5.600,00", "5.850,00", "6.100,00"],
  ["IV", "5.400,00", "5.650,00", "5.900,00", "6.150,00", "6.400,00"],
  ["V", "5.700,00", "5.950,00", "6.200,00", "6.450,00", "6.700,00"],
];
const StatusTag = ({ value }: { value: Status }) => (
  <span className={"tv-status " + value.toLowerCase()}>{value}</span>
);
function Matrix({
  edit = false,
  copy = false,
  data,
  onStructureChange,
}: {
  edit?: boolean;
  copy?: boolean;
  data?: MatrixData;
  onStructureChange?: () => void;
}) {
  const alphabeticalName = (position: number) => {
    let value = position;
    let name = "";
    while (value > 0) {
      value -= 1;
      name = String.fromCharCode(65 + (value % 26)) + name;
      value = Math.floor(value / 26);
    }
    return name;
  };
  const initialColumns = data?.columns || (copy
    ? ["A", "B", "C", "D", "E"]
    : ["A"]);
  const initialRows = data
    ? data.rows.map((row, index) => ({
        id: index + 1,
        name: row.name,
        values: Object.fromEntries(row.values.map((value, columnIndex) => [columnIndex + 1, value])),
      }))
    : copy
      ? VALORES.map((row, index) => ({
        id: index + 1,
        name: String(index + 1).padStart(3, "0"),
        values: Object.fromEntries(
          initialColumns.map((_, columnIndex) => [
            columnIndex + 1,
            "R$ " + row[columnIndex + 1],
          ]),
        ),
      }))
    : [
        { id: 1, name: "001", values: { 1: "" } },
      ];
  const [columns, setColumns] = useState(
    initialColumns.map((name, index) => ({ id: index + 1, name })),
  );
  const [rows, setRows] = useState(initialRows);
  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(digits) / 100);
  };
  const hasValue = (value: string) =>
    value.replace(/\D/g, "").replace(/^0+/, "").length > 0;
  const addColumn = () => {
    onStructureChange?.();
    const id = Math.max(0, ...columns.map((item) => item.id)) + 1;
    setColumns([...columns, { id, name: alphabeticalName(id) }]);
    setRows(rows.map((row) => ({ ...row, values: { ...row.values, [id]: "" } })));
  };
  const removeColumn = (id: number) => {
    const filled = rows.some((row) => hasValue(row.values[id] || ""));
    if (filled && !window.confirm("Esta coluna possui valores preenchidos. Deseja removê-la da tabela?")) return;
    onStructureChange?.();
    setColumns(columns.filter((item) => item.id !== id));
    setRows(rows.map((row) => {
      const values = { ...row.values };
      delete values[id];
      return { ...row, values };
    }));
  };
  const addRow = () => {
    onStructureChange?.();
    const id = Math.max(0, ...rows.map((item) => item.id)) + 1;
    const nextLevel =
      Math.max(
        0,
        ...rows.map((item) =>
          /^\d+$/.test(item.name.trim()) ? Number(item.name) : 0,
        ),
      ) + 1;
    setRows([...rows, {
      id,
      name: String(nextLevel).padStart(3, "0"),
      values: Object.fromEntries(columns.map((column) => [column.id, ""])),
    }]);
  };
  const removeRow = (id: number) => {
    const row = rows.find((item) => item.id === id);
    if (row && Object.values(row.values).some(hasValue) &&
      !window.confirm("Esta linha possui valores preenchidos. Deseja removê-la da tabela?")) return;
    onStructureChange?.();
    setRows(rows.filter((item) => item.id !== id));
  };
  if (edit) {
    return (
      <div className="tv-matrix-editor">
        <input type="hidden" name="matrixRowCount" value={rows.length} />
        <input type="hidden" name="matrixColumnCount" value={columns.length} />
        <div className="tv-scroll tv-matrix-scroll">
          <table className="tv-matrix tv-matrix-editable">
            <thead>
              <tr>
                <th className="tv-matrix-name-column">Nível / Classe</th>
                {columns.map((column) => (
                  <th key={column.id}>
                    <div className="tv-matrix-column-head">
                      <input required name="matrixColumnName" aria-label="Nome da coluna" placeholder="Nome da coluna" value={column.name}
                        onChange={(event) => setColumns(columns.map((item) => item.id === column.id ? { ...item, name: event.target.value } : item))} />
                      <button type="button" className="tv-matrix-delete" title="Remover coluna" aria-label={'Remover coluna ' + column.name} onClick={() => removeColumn(column.id)}>
                        <i className="pi pi-trash" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="tv-matrix-actions-column tv-matrix-new-class-cell">
                  <button
                    type="button"
                    className="tv-matrix-dashed-action"
                    title="Adicionar nova classe"
                    onClick={addColumn}
                  >
                    <i className="pi pi-plus" aria-hidden="true" />
                    <span>Nova classe</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <th>
                    <input required name="matrixRowName" aria-label="Nome da linha" placeholder="Nome da linha" value={row.name}
                      onChange={(event) => setRows(rows.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item))} />
                  </th>
                  {columns.map((column) => (
                    <td key={column.id}>
                      <input name="matrixValue" inputMode="numeric" aria-label={'Valor de ' + row.name + ' / ' + column.name}
                        placeholder="R$ 0,00" value={row.values[column.id] || ""}
                        onChange={(event) => {
                          const value = formatCurrency(event.target.value);
                          setRows(rows.map((item) => item.id === row.id ? { ...item, values: { ...item.values, [column.id]: value } } : item));
                        }} />
                    </td>
                  ))}
                  <td className="tv-matrix-row-action">
                    <button type="button" className="tv-matrix-delete" title="Remover linha" aria-label={'Remover linha ' + row.name} onClick={() => removeRow(row.id)}>
                      <i className="pi pi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tv-matrix-add-row">
          <button
            type="button"
            className="tv-matrix-dashed-action tv-matrix-new-level"
            title="Adicionar novo nível"
            onClick={addRow}
          >
            <i className="pi pi-plus" aria-hidden="true" />
            <span>Novo nível</span>
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="tv-scroll">
      <table className="tv-matrix">
        <thead>
          <tr>
            <th>Nível / Classe</th>
            {initialColumns.map((x) => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {initialRows.map((row) => (
            <tr key={row.id}>
              <th>{row.name}</th>
              {initialColumns.map((_, columnIndex) => (
                <td key={columnIndex}>
                  {row.values[columnIndex + 1] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Modal({
  cargo,
  perfil,
  jornada,
  item,
  close,
}: {
  cargo: Cargo;
  perfil: string;
  jornada?: string;
  item: Versao;
  close: () => void;
}) {
  const [tab, setTab] = useState("valores");
  return (
    <div className="tv-overlay">
      <section className="tv-modal">
        <header>
          <div>
            <h2>Tabela de vencimentos – {item.ano}</h2>
            <p>
              <b>Cargo:</b> {cargo.nome} · <b>Carreira:</b> {cargo.carreira} ·{" "}
              <b>{jornada ? "Jornada" : "Perfil"}:</b> {jornada || perfil}
            </p>
          </div>
          <div>
            <StatusTag value={item.status} />
            <button onClick={close} aria-label="Fechar">
              <i className="pi pi-times" />
            </button>
          </div>
        </header>
        <div className="tv-summary">
          <span>
            <small>Vigência</small>
            <b>
              {item.inicio} – {item.fim || "Atual"}
            </b>
          </span>
          <span>
            <small>Última alteração</small>
            <b>{item.alteracao} às 14:32</b>
          </span>
          <span>
            <small>Alterado por</small>
            <b>{item.usuario}</b>
          </span>
        </div>
        <nav className="tv-tabs">
          <button
            className={tab === "valores" ? "active" : ""}
            onClick={() => setTab("valores")}
          >
            Tabela de valores
          </button>
          <button
            className={tab === "info" ? "active" : ""}
            onClick={() => setTab("info")}
          >
            Informações adicionais
          </button>
        </nav>
        {tab === "valores" ? (
          <Matrix />
        ) : (
          <div className="tv-info">
            <span>
              <small>Fundamento legal</small>
              <b>Lei Complementar nº 600/2017</b>
            </span>
            <span>
              <small>Ato normativo</small>
              <b>Decreto nº 1.245/2026</b>
            </span>
            <span>
              <small>Data de publicação</small>
              <b>05/01/{item.ano}</b>
            </span>
            <span>
              <small>Documento relacionado</small>
              <a href="#documento">Plano de cargos e salários.pdf</a>
            </span>
            <span>
              <small>Observação</small>
              <b>Valores definidos conforme a estrutura vigente da carreira.</b>
            </span>
            <span>
              <small>Usuário responsável pela criação</small>
              <b>Ana Souza</b>
            </span>
            <span>
              <small>Usuário responsável pela última alteração</small>
              <b>{item.usuario}</b>
            </span>
          </div>
        )}
        <footer>
          <BotaoSeplag type="button" label="Fechar" onClick={close} />
        </footer>
      </section>
    </div>
  );
}
function List() {
  const nav = useNavigate();
  const [listParams] = useSearchParams();
  const savedTables = readSavedTables();
  const [, setDataRevision] = useState(0);
  const [expandedCargo, setExpandedCargo] = useState<number | null>(null);
  const [viewTable, setViewTable] = useState<{
    cargo: Cargo;
    item: Versao;
    jornada: string;
  }>();
  const [historyJourney, setHistoryJourney] = useState<{
    cargo: Cargo;
    jornada: string;
    versions: Versao[];
  }>();
  const [journeyActionMenu, setJourneyActionMenu] = useState<string | null>(null);
  const [historyExpandedVersion, setHistoryExpandedVersion] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<"valores" | "info">("valores");
  const [legalPreview, setLegalPreview] = useState(false);
  const { control, reset, watch } = useForm<{ cargo: string }>({
    defaultValues: { cargo: "" },
  });
  const cargoFiltro = watch("cargo");
  const rows = CARGOS.filter(
    (x) => !cargoFiltro || String(x.id) === cargoFiltro,
  );
  const cargoTables = (cargo: Cargo) => {
    const history = [VERSOES[1], VERSOES[2], VERSOES[3]];
    return cargo.jornadas.map((jornada, index) => {
      const savedForJourney = savedTables
        .filter((table) => table.cargoId === cargo.id && table.jornada === jornada)
        .reverse();
      const saved = savedForJourney[0];
      const savedVersions = savedForJourney.map((table) => ({
        ...table.versao,
        matrix: table.matrix,
        baseLegal: table.baseLegal,
        observacao: table.observacao,
      }));
      const hasStaticTable = index < cargo.vigentes;
      const historySize = hasStaticTable
        ? Math.max(1, Math.min(history.length, cargo.tabelas - index))
        : 0;
      const versions = savedVersions.length
        ? savedVersions
        : hasStaticTable ? history.slice(0, historySize) : [];
      return {
        item: versions.find(isVersionCurrent),
        jornada,
        codigo: versions.length
          ? "TV-" +
            String(cargo.id).padStart(2, "0") +
            String(index + 1).padStart(2, "0")
          : undefined,
        versions,
        savedId: saved?.id,
      };
    });
  };
  const endValidity = (cargo: Cargo, jornada: string, item: Versao, savedId?: string) => {
    const today = formatDate(localIsoDate());
    const previousDay = formatDate(previousIsoDate());
    if (!window.confirm(
      "Encerrar vigência da tabela?\n\nA tabela deixará de ser aplicada a partir de " + today +
      ". A versão atualmente vigente será mantida no histórico com vigência até " + previousDay +
      ".\n\nA jornada ficará sem tabela vigente até que uma nova tabela seja cadastrada.",
    )) return;
    const saved = readSavedTables();
    const index = savedId ? saved.findIndex((record) => record.id === savedId) : -1;
    if (index >= 0) {
      saved[index] = { ...saved[index], versao: { ...saved[index].versao, fim: previousDay, status: "Encerrada", alteracao: today } };
    } else {
      saved.push({
        id: Date.now().toString(), cargoId: cargo.id, jornada,
        versao: { ...item, fim: previousDay, status: "Encerrada", alteracao: today },
        matrix: defaultMatrixData(), baseLegal: "Lei_Complementar_600_2017.pdf",
        observacao: "Valores definidos conforme a estrutura vigente da carreira.",
      });
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    setJourneyActionMenu(null);
    setDataRevision((value) => value + 1);
  };
  return (
    <>
      <CardSeplag
        title="Tabela de Vencimentos"
        cols="12"
        cardHeaderClassNames="prototype-regime-card prototype-ingressos-card tv-list-card"
        headerNavigation={
          <BreadcrumbSeplag
            divided
            items={[
              { label: "Cadastro" },
              { label: "Cargo e Concurso" },
              { label: "Tabela de Vencimentos" },
            ]}
          />
        }
      >
      <div className="prototype-ingressos-teste-content">
        <hr className="prototype-ingressos-teste-header-divider" />
        {listParams.get("salvo") === "1" && (
          <div className="tv-save-success" role="status">
            <i className="pi pi-check-circle" aria-hidden="true" />
            <span>{listParams.get("rga") === "1" ? "Tabela de vencimentos finalizada com sucesso." : "Tabela de vencimentos salva com sucesso."}</span>
          </div>
        )}
        <div className="prototype-ingressos-teste-filters grid">
          <DropdownFieldSeplag
            name="cargo"
            control={control}
            label="Código do cargo ou nome do cargo"
            placeholder="Todos"
            cols="12 12 10"
            options={[
              { label: "Todos", value: "" },
              ...CARGOS.map((item) => ({
                label:
                  String(item.id).padStart(4, "0") + " — " + item.nome,
                value: String(item.id),
              })),
            ]}
            optionLabel="label"
            optionValue="value"
            getFormErrorMessage={() => null}
          />
          <div className="prototype-category-clear">
            <BotaoLimparFiltroSeplag
              type="button"
              label="Limpar filtros"
              icon="pi pi-refresh"
              onClick={() => reset({ cargo: "" })}
            />
          </div>
        </div>
        <div className="prototype-ingressos-teste-table-shell">
          <div className="prototype-ingressos-teste-table">
            <table className="tv-cargo-accordion-table">
              <thead>
                <tr>
                  <th>Código do cargo <i className="pi pi-sort-alt" /></th>
                  <th>Cargo <i className="pi pi-sort-alt" /></th>
                  <th>Jornadas</th>
                  <th>Ação</th>
                </tr>
              </thead>
              {rows.map((cargo) => {
                const expanded = expandedCargo === cargo.id;
                const tables = cargoTables(cargo);
                return (
                  <tbody key={cargo.id}>
                    <tr className={expanded ? "tv-cargo-open-row" : undefined}>
                      <td>{String(cargo.id).padStart(4, "0")}</td>
                      <td>{cargo.nome}</td>
                      <td>
                        <span className="tv-profile-count-tag">
                          {cargo.jornadas.length} {cargo.jornadas.length === 1 ? "jornada" : "jornadas"}
                        </span>
                      </td>
                      <td>
                        <div className="tv-cargo-row-actions">
                          <button
                            type="button"
                            className="tv-cargo-expand"
                            aria-label={expanded ? "Recolher cargo" : "Expandir cargo"}
                            onClick={() => setExpandedCargo(expanded ? null : cargo.id)}
                          >
                            <i className={"pi " + (expanded ? "pi-chevron-up" : "pi-chevron-down")} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="tv-cargo-expanded-row">
                        <td colSpan={4}>
                          <div className="tv-cargo-expanded-content">
                            {tables.length ? (
                              <div className="tv-scroll">
                                <table className="tv-cargo-history-table">
                                  <thead>
                                    <tr>
                                      <th>Jornada</th>
                                      <th>Versão</th>
                                      <th>Ano</th>
                                      <th>Vigência</th>
                                      <th>Situação</th>
                                      <th>Ações</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tables.map(({ item, jornada, versions, savedId }, journeyIndex) => (
                                      <tr key={jornada}>
                                        <td>
                                          <span className={"tv-journey-tag tone-" + (journeyIndex % 4)}>
                                            {jornada}
                                          </span>
                                        </td>
                                        <td>{item ? "V" + versions.length : "—"}</td>
                                        <td>{item?.ano || "—"}</td>
                                        <td>{item ? item.inicio + " – " + (item.fim || "Atual") : "—"}</td>
                                        <td>
                                          {item ? (
                                            <StatusTag value={item.status} />
                                          ) : versions.length ? (
                                            <span className="tv-status sem-vigente">Sem tabela vigente</span>
                                          ) : (
                                            <span className="tv-status sem-tabela">Sem tabela cadastrada</span>
                                          )}
                                        </td>
                                        <td>
                                          {item ? (
                                            <div className="tv-journey-actions tv-journey-split-actions">
                                              <button
                                                type="button"
                                                className="tv-journey-view-button"
                                                title="Visualizar tabela"
                                                aria-label="Visualizar tabela"
                                                onClick={() => nav(
                                                  BASE + "/visualizar?cargo=" + cargo.id +
                                                  "&jornada=" + encodeURIComponent(jornada) +
                                                  "&inicio=" + encodeURIComponent(item.inicio) +
                                                  "&fim=" + encodeURIComponent(item.fim || "") +
                                                  (savedId ? "&registro=" + encodeURIComponent(savedId) : "")
                                                )}
                                              >
                                                <i className="pi pi-eye" />
                                              </button>
                                              <button
                                                type="button"
                                                className="tv-journey-history-button"
                                                title="Mais ações"
                                                aria-label="Mais ações"
                                                aria-expanded={journeyActionMenu === cargo.id + "-" + jornada}
                                                onClick={() => {
                                                  const key = cargo.id + "-" + jornada;
                                                  setJourneyActionMenu(journeyActionMenu === key ? null : key);
                                                }}
                                              >
                                                <i className="pi pi-chevron-down" />
                                              </button>
                                              {journeyActionMenu === cargo.id + "-" + jornada && (
                                                <div className="tv-journey-action-menu">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setJourneyActionMenu(null);
                                                      nav(
                                                        BASE + "/editar/" + (savedId || cargo.id + "-" + encodeURIComponent(jornada)) +
                                                        "?cargo=" + cargo.id +
                                                        "&jornada=" + encodeURIComponent(jornada) +
                                                        "&inicio=" + encodeURIComponent(item.inicio) +
                                                        "&fim=" + encodeURIComponent(item.fim || "") +
                                                        (savedId ? "&registro=" + encodeURIComponent(savedId) : "")
                                                      );
                                                    }}
                                                  >
                                                    <i className="pi pi-copy" /> Versionar
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setJourneyActionMenu(null);
                                                      setHistoryExpandedVersion(null);
                                                      setHistoryTab("valores");
                                                      setHistoryJourney({ cargo, jornada, versions });
                                                    }}
                                                  >
                                                    <i className="pi pi-history" /> Histórico
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          ) : versions.length ? (
                                            <div className="tv-journey-actions">
                                              <button type="button" title="Consultar histórico" aria-label="Consultar histórico" onClick={() => {
                                                setHistoryExpandedVersion(null);
                                                setHistoryTab("valores");
                                                setHistoryJourney({ cargo, jornada, versions });
                                              }}><i className="pi pi-history" /></button>
                                              <button type="button" title="Cadastrar nova tabela" aria-label="Cadastrar nova tabela" onClick={() => nav(BASE + "/novo?cargo=" + cargo.id + "&jornada=" + encodeURIComponent(jornada))}><i className="pi pi-plus" /></button>
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              className="tv-journey-create-button"
                                              title="Cadastrar tabela"
                                              aria-label="Cadastrar tabela"
                                              onClick={() =>
                                                nav(
                                                  BASE +
                                                    "/novo?cargo=" +
                                                    cargo.id +
                                                    "&jornada=" +
                                                    encodeURIComponent(jornada),
                                                )
                                              }
                                            >
                                              <i className="pi pi-plus" />
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="tv-cargo-table-empty">
                                Nenhuma tabela de vencimentos cadastrada para este cargo.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </table>
            <div className="tv-cargo-main-pager">
              <button type="button" disabled><i className="pi pi-angle-double-left" /></button>
              <button type="button" disabled><i className="pi pi-angle-left" /></button>
              <span>1</span>
              <button type="button" disabled><i className="pi pi-angle-right" /></button>
              <button type="button" disabled><i className="pi pi-angle-double-right" /></button>
              <select aria-label="Itens por página" defaultValue="10"><option>10</option></select>
            </div>
          </div>
        </div>
      </div>
      </CardSeplag>
      {viewTable && (
        <Modal
          cargo={viewTable.cargo}
          perfil=""
          jornada={viewTable.jornada}
          item={viewTable.item}
          close={() => setViewTable(undefined)}
        />
      )}
      {historyJourney && (
        <div className="tv-profile-list-overlay" role="presentation">
          <section className="tv-journey-history-modal" role="dialog" aria-modal="true">
            <header>
              <div>
                <h2>Histórico da jornada</h2>
                <p>
                  <strong>{historyJourney.cargo.nome}</strong> · Jornada: {historyJourney.jornada}
                </p>
              </div>
              <button type="button" aria-label="Fechar" onClick={() => setHistoryJourney(undefined)}>
                <i className="pi pi-times" />
              </button>
            </header>
            <div className="tv-journey-history-divider" />
            <div className="tv-scroll tv-journey-history-grid-wrap">
              <table className="tv-journey-history-grid">
                <thead>
                  <tr>
                    <th>Versão</th>
                    <th>Ano</th>
                    <th>Início da vigência</th>
                    <th>Fim da vigência</th>
                    <th>Situação</th>
                    <th>Alterado por</th>
                    <th>Última alteração</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {historyJourney.versions.map((version, versionIndex) => {
                    const versionKey = version.ano + "-" + versionIndex;
                    const expanded = historyExpandedVersion === versionKey;
                    return (
                      <Fragment key={versionKey}>
                        <tr className={expanded ? "tv-history-version-open" : undefined}>
                          <td>
                            <span className="tv-history-version-label">{"V" + (historyJourney.versions.length - versionIndex)}</span>
                            {version.origem && <small className="tv-history-version-origin">{version.origem}{version.percentualRga ? " · " + version.percentualRga : ""}</small>}
                          </td>
                          <td>{version.ano}</td>
                          <td>{version.inicio}</td>
                          <td>{version.fim || "—"}</td>
                          <td><StatusTag value={version.status} /></td>
                          <td>{version.usuario}</td>
                          <td>{version.alteracao} às 14:32</td>
                          <td>
                            <button
                              type="button"
                              className="tv-history-expand-button"
                              title={expanded ? "Recolher tabela" : "Expandir tabela"}
                              aria-label={expanded ? "Recolher tabela" : "Expandir tabela"}
                              aria-expanded={expanded}
                              onClick={() => {
                                setHistoryExpandedVersion(expanded ? null : versionKey);
                                setHistoryTab("valores");
                              }}
                            >
                              <i className={"pi " + (expanded ? "pi-chevron-up" : "pi-chevron-down")} />
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="tv-history-version-detail-row">
                            <td colSpan={8}>
                              <section className="tv-history-version-detail">
                                <header>
                                  <h3>Tabela de vencimentos — {version.ano}</h3>
                                  <StatusTag value={version.status} />
                                </header>
                                <nav className="tv-tabs">
                                  <button type="button" className={historyTab === "valores" ? "active" : ""} onClick={() => setHistoryTab("valores")}>Tabela de valores</button>
                                  <button type="button" className={historyTab === "info" ? "active" : ""} onClick={() => setHistoryTab("info")}>Informações adicionais</button>
                                </nav>
                                {historyTab === "valores" ? (
                                  <div className="tv-history-matrix"><Matrix data={version.matrix} /></div>
                                ) : (
                                  <div className="tv-history-additional-info">
                                    <div className="tv-history-info-pair">
                                      <span><small>Data início da vigência</small><strong>{version.inicio}</strong></span>
                                      <span><small>Data fim da vigência</small><strong>{version.fim || "—"}</strong></span>
                                    </div>
                                    <div className="tv-history-info-pair">
                                      <span><small>Responsável pela última alteração</small><strong>{version.usuario}</strong></span>
                                      <span><small>Data e hora da última alteração</small><strong>{version.alteracao} às 14:32</strong></span>
                                    </div>
                                    <div className="tv-history-info-full">
                                      <small>Base legal</small>
                                      <div className="tv-legal-file">
                                        <i className="pi pi-file-pdf" aria-hidden="true" />
                                        <span>{version.baseLegal || "Lei_Complementar_600_2017.pdf"}</span>
                                        <button type="button" title="Visualizar arquivo" aria-label="Visualizar arquivo" onClick={() => setLegalPreview(true)}>
                                          <i className="pi pi-eye" />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="tv-history-info-full">
                                      <small>Observação</small>
                                      <p>{version.observacao || "Valores definidos conforme a estrutura vigente da carreira."}</p>
                                    </div>
                                  </div>
                                )}
                              </section>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              <div className="tv-journey-history-pager" aria-label="Paginação do histórico">
                <button type="button" disabled aria-label="Primeira página"><i className="pi pi-angle-double-left" /></button>
                <button type="button" disabled aria-label="Página anterior"><i className="pi pi-angle-left" /></button>
                <span aria-current="page">1</span>
                <button type="button" disabled aria-label="Próxima página"><i className="pi pi-angle-right" /></button>
                <button type="button" disabled aria-label="Última página"><i className="pi pi-angle-double-right" /></button>
                <select aria-label="Itens por página" defaultValue="10">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
            <footer className="tv-journey-history-footer">
              <BotaoSeplag type="button" label="Fechar" onClick={() => setHistoryJourney(undefined)} />
            </footer>
            {legalPreview && (
              <div className="tv-legal-preview-overlay" role="presentation">
                <section className="tv-legal-preview" role="dialog" aria-modal="true" aria-label="Visualização da Base legal">
                  <header>
                    <div><h3>Base legal</h3><p>Lei_Complementar_600_2017.pdf</p></div>
                    <button type="button" aria-label="Fechar visualização" onClick={() => setLegalPreview(false)}><i className="pi pi-times" /></button>
                  </header>
                  <div className="tv-legal-preview-content">
                    <i className="pi pi-file-pdf" aria-hidden="true" />
                    <strong>Lei Complementar nº 600/2017</strong>
                    <span>Pré-visualização do documento de Base legal.</span>
                  </div>
                  <footer><BotaoSeplag type="button" label="Fechar" onClick={() => setLegalPreview(false)} /></footer>
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
function Detail({ cargo }: { cargo: Cargo }) {
  const nav = useNavigate();
  const {
    control: filterControl,
    reset: resetProfileFilters,
    watch: watchProfileFilters,
  } = useForm<{ perfil: string; situacao: string }>({
    defaultValues: { perfil: "", situacao: "" },
  });
  const buscaPerfil = watchProfileFilters("perfil");
  const situacaoPerfil = watchProfileFilters("situacao");
  const [open, setOpen] = useState<Versao>();
  const [openPerfil, setOpenPerfil] = useState(cargo.perfis[0]);
  const [perfilExpandido, setPerfilExpandido] = useState<string | null>(
    cargo.perfis[0],
  );
  const perfilRows = cargo.perfis
    .map((nome, index) => {
      const versao =
        index === 2
          ? VERSOES[2]
          : index === 3
            ? undefined
            : index === 4
              ? VERSOES[0]
              : VERSOES[1];
      return { nome, versao };
    })
    .filter(
      ({ nome, versao }) =>
        (!buscaPerfil ||
          nome.toLowerCase().includes(buscaPerfil.toLowerCase())) &&
        (!situacaoPerfil ||
          (versao?.status || "Sem tabela") === situacaoPerfil),
    );
  const novaTabela = (nome?: string) =>
    nav(
      BASE +
        "/novo?cargo=" +
        cargo.id +
        (nome ? "&perfil=" + encodeURIComponent(nome) : ""),
    );
  return (
    <>
      <CardSeplag
        title="Tabela de Vencimentos"
        cols="12"
        cardHeaderClassNames="prototype-regime-card prototype-ingressos-card tv-detail-card"
        headerNavigation={
          <nav className="prototype-ingressos-page-navigation">
            <button type="button" onClick={() => nav(BASE)}>
              <i className="pi pi-arrow-left" /> Voltar para lista de cargos
            </button>
          </nav>
        }
      >
        <div className="prototype-ingressos-teste-content">
          <p className="prototype-ingressos-teste-support">
            Gerencie as tabelas de vencimentos por cargo e perfil profissional.
          </p>
          <hr className="prototype-ingressos-teste-header-divider" />
          <section className="tv-cargo-summary">
            <div>
              <h2>{cargo.nome}</h2>
              <p>
                <strong>Carreira:</strong> {cargo.carreira}
              </p>
            </div>
            <div className="tv-cargo-summary-actions">
              <div className="tv-metric tv-metric--profiles">
                <i className="pi pi-users" />
                <strong>
                  {cargo.perfis.length}
                  <small>perfis profissionais</small>
                </strong>
              </div>
              <div className="tv-metric tv-metric--current">
                <i className="pi pi-file" />
                <strong>
                  {cargo.vigentes}
                  <small>
                    {cargo.vigentes === 1
                      ? "tabela vigente"
                      : "tabelas vigentes"}
                  </small>
                </strong>
              </div>
              <BotaoSeplag
                type="button"
                label="Nova tabela de vencimentos"
                icon="pi pi-plus"
                onClick={() => novaTabela()}
              />
            </div>
          </section>
          <section className="tv-profiles-card">
            <h2>Perfis profissionais do cargo</h2>
            <div className="prototype-ingressos-teste-filters grid tv-detail-official-filters">
              <TextFieldSeplag
                name="perfil"
                control={filterControl}
                label="Perfil profissional"
                placeholder="Buscar perfil profissional"
                cols="12 12 5"
                getFormErrorMessage={() => null}
              />
              <DropdownFieldSeplag
                name="situacao"
                control={filterControl}
                label="Situação da tabela"
                placeholder="Todas"
                cols="12 12 5"
                options={[
                  { label: "Todas", value: "" },
                  { label: "Vigente", value: "Vigente" },
                  { label: "Futura", value: "Futura" },
                  { label: "Encerrada", value: "Encerrada" },
                  { label: "Sem tabela", value: "Sem tabela" },
                ]}
                optionLabel="label"
                optionValue="value"
                getFormErrorMessage={() => null}
              />
              <div className="prototype-category-clear">
                <BotaoLimparFiltroSeplag
                  type="button"
                  label="Limpar filtros"
                  icon="pi pi-refresh"
                  onClick={() =>
                    resetProfileFilters({ perfil: "", situacao: "" })
                  }
                />
              </div>
            </div>
            <div className="tv-profile-accordions">
              <div className="tv-profile-columns-header">
                <span>Perfil</span>
                <span>Tabelas</span>
                <span>Ação</span>
              </div>
              {perfilRows.map(({ nome, versao }, perfilIndex) => {
                const expandido = perfilExpandido === nome;
                const tabelas = !versao
                  ? []
                  : versao.status === "Vigente"
                    ? [versao, VERSOES[2], VERSOES[3]]
                    : versao.status === "Encerrada"
                      ? [versao, VERSOES[3]]
                      : [versao];
                return (
                  <article
                    className={
                      "tv-profile-accordion " + (expandido ? "open" : "")
                    }
                    key={nome}
                  >
                    <header>
                      <button
                        type="button"
                        className="tv-profile-name"
                        onClick={() =>
                          setPerfilExpandido(expandido ? null : nome)
                        }
                        aria-expanded={expandido}
                      >
                        <strong>{nome}</strong>
                      </button>
                      <span className="tv-profile-count">
                        <span className="tv-profile-count-tag">
                          {tabelas.length}{" "}
                          {tabelas.length === 1 ? "tabela" : "tabelas"}
                        </span>
                      </span>
                      <div className="tv-profile-row-actions">
                        <BotaoSeplag
                          type="button"
                          label="Adicionar"
                          icon="pi pi-plus"
                          onClick={() => novaTabela(nome)}
                        />
                        <button
                          type="button"
                          className="tv-profile-chevron"
                          onClick={() =>
                            setPerfilExpandido(expandido ? null : nome)
                          }
                          aria-label={
                            expandido ? "Recolher perfil" : "Expandir perfil"
                          }
                        >
                          <i
                            className={
                              "pi " +
                              (expandido ? "pi-chevron-up" : "pi-chevron-down")
                            }
                          />
                        </button>
                      </div>
                    </header>
                    {expandido && (
                      <div className="tv-profile-accordion-content">
                        {tabelas.length ? (
                          <div className="tv-scroll">
                            <table className="tv-grid tv-profile-history-grid">
                              <thead>
                                <tr>
                                  <th>Número da tabela</th>
                                  <th>Ano</th>
                                  <th>Vigência</th>
                                  <th>Situação</th>
                                  <th>Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tabelas.map((tabela, tabelaIndex) => (
                                  <tr key={tabela.ano}>
                                    <td>
                                      {"TV-" +
                                        String(perfilIndex + 1).padStart(
                                          2,
                                          "0",
                                        ) +
                                        String(tabelaIndex + 1).padStart(
                                          2,
                                          "0",
                                        )}
                                    </td>
                                    <td>{tabela.ano}</td>
                                    <td>
                                      {tabela.inicio} – {tabela.fim || "Atual"}
                                    </td>
                                    <td>
                                      <StatusTag value={tabela.status} />
                                    </td>
                                    <td>
                                      <div className="tv-profile-actions">
                                        <button
                                          type="button"
                                          className="tv-table-view"
                                          title="Visualizar tabela"
                                          aria-label="Visualizar tabela"
                                          onClick={() => {
                                            setOpenPerfil(nome);
                                            setOpen(tabela);
                                          }}
                                        >
                                          <i className="pi pi-eye" />
                                        </button>
                                        <button
                                          type="button"
                                          className="tv-table-history"
                                          title="Ver histórico"
                                          aria-label="Ver histórico"
                                          onClick={() => {
                                            setOpenPerfil(nome);
                                            setOpen(tabela);
                                          }}
                                        >
                                          <i className="pi pi-history" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="tv-inner-pager">
                              <button disabled>
                                <i className="pi pi-angle-double-left" />
                              </button>
                              <button disabled>
                                <i className="pi pi-angle-left" />
                              </button>
                              <span>1</span>
                              <button disabled>
                                <i className="pi pi-angle-right" />
                              </button>
                              <button disabled>
                                <i className="pi pi-angle-double-right" />
                              </button>
                              <select aria-label="Itens por página">
                                <option>10</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="tv-profile-empty">
                            Nenhuma tabela de vencimentos cadastrada para este
                            perfil.
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="tv-profile-footer">
              <span>
                Exibindo 1 a {perfilRows.length} de {cargo.perfis.length} perfis
              </span>
              <div>
                <button type="button" disabled aria-label="Primeira página">
                  <i className="pi pi-angle-double-left" />
                </button>
                <button type="button" disabled aria-label="Página anterior">
                  <i className="pi pi-angle-left" />
                </button>
                <b>1</b>
                <button type="button" disabled aria-label="Próxima página">
                  <i className="pi pi-angle-right" />
                </button>
                <button type="button" disabled aria-label="Última página">
                  <i className="pi pi-angle-double-right" />
                </button>
                <select aria-label="Itens por página" defaultValue="10">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </CardSeplag>
      {open && (
        <Modal
          cargo={cargo}
          perfil={openPerfil}
          item={open}
          close={() => setOpen(undefined)}
        />
      )}
    </>
  );
}
function Form({ edit, view = false }: { edit: boolean; view?: boolean }) {
  const nav = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const versionConfirmed = useRef(false);
  const [versionConfirmationOpen, setVersionConfirmationOpen] = useState(false);
  const [params] = useSearchParams();
  const initial = params.get("cargo") || "";
  const initialCargo = CARGOS.find((x) => String(x.id) === initial);
  const initialJornada = params.get("jornada") || "";
  const savedRecord = readSavedTables().find((table) => table.id === params.get("registro"));
  const initialInicio = toInputDate(savedRecord?.versao.inicio || params.get("inicio") || "");
  const initialFim = toInputDate(savedRecord?.versao.fim || params.get("fim") || "");
  const [vigenciaInicio, setVigenciaInicio] = useState(view || edit ? initialInicio || "2026-01-01" : "");
  const [vigenciaFim, setVigenciaFim] = useState(view || edit ? initialFim : "");
  const [carreira, setCarreira] = useState(initialCargo?.carreira || "");
  const [cargoId, setCargoId] = useState(initial);
  const [jornada, setJornada] = useState(initialJornada);
  const [copy, setCopy] = useState(edit);
  const [error, setError] = useState("");
  const [documentosLegais, setDocumentosLegais] = useState<string[]>(
    savedRecord?.baseLegal ? savedRecord.baseLegal.split(", ") : [],
  );
  const [incideRga, setIncideRga] = useState(savedRecord?.incideRga ?? false);
  const [observacao, setObservacao] = useState(
    view || edit ? savedRecord?.observacao || "Valores definidos conforme a estrutura vigente da carreira." : "",
  );
  const [activeTab, setActiveTab] = useState<"identificacao" | "valores" | "rga">("identificacao");
  const [rgaPercentual, setRgaPercentual] = useState(savedRecord?.rga?.percentual || "");
  const [rgaAno, setRgaAno] = useState(savedRecord?.rga?.ano || String(new Date().getFullYear()));
  const [rgaBaseLegal, setRgaBaseLegal] = useState<string[]>(savedRecord?.rga?.baseLegal ? [savedRecord.rga.baseLegal] : []);
  const [rgaObservacao, setRgaObservacao] = useState(savedRecord?.rga?.observacao || "");
  const [rgaSimulation, setRgaSimulation] = useState<MatrixData>();
  const [rgaBaseMatrix, setRgaBaseMatrix] = useState<MatrixData>();
  const [rgaAppliedMatrix, setRgaAppliedMatrix] = useState<MatrixData>();
  const [rgaApplyConfirmation, setRgaApplyConfirmation] = useState(false);
  const [rgaApplied, setRgaApplied] = useState(false);
  const [rgaSimulationStale, setRgaSimulationStale] = useState(false);
  const [rgaError, setRgaError] = useState("");
  const opcoesDocumentosLegais = useDocumentosLegaisAssociaveis();
  const cargo = CARGOS.find((x) => String(x.id) === cargoId);
  const jornadaIndex = cargo?.jornadas.indexOf(jornada) ?? -1;
  const hasPreviousTable = Boolean(
    cargo &&
      jornada &&
      (savedRecord ||
        readSavedTables().some(
          (table) => table.cargoId === cargo.id && table.jornada === jornada,
        ) ||
        (jornadaIndex >= 0 && jornadaIndex < cargo.vigentes)),
  );
  const previousSavedTable = cargo && jornada
    ? readSavedTables().filter((table) => table.cargoId === cargo.id && table.jornada === jornada).slice(-1)[0]
    : undefined;
  const savedVersionsForJourney = cargo && jornada
    ? readSavedTables().filter((table) => table.cargoId === cargo.id && table.jornada === jornada)
    : [];
  const originVersionNumber = hasPreviousTable ? Math.max(1, savedVersionsForJourney.length) : 0;
  const editingVersionNumber = originVersionNumber + 1;
  const invalidateRgaSimulation = () => {
    if (!rgaSimulation && !rgaApplied) return;
    setRgaSimulation(undefined);
    setRgaApplied(false);
    setRgaSimulationStale(true);
  };
  const formatRgaPercentage = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 5);
    if (!digits) return "";
    return (Number(digits) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%";
  };
  const simulateRga = () => {
    setRgaError("");
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    const matrixColumns = formData.getAll("matrixColumnName").map(String);
    const matrixRowNames = formData.getAll("matrixRowName").map(String);
    const matrixValues = formData.getAll("matrixValue").map(String);
    if (!matrixColumns.length || !matrixRowNames.length) {
      setRgaError("Informe os níveis, classes e valores da nova versão antes de simular a RGA.");
      return;
    }
    const matrixBase: MatrixData = {
      columns: matrixColumns,
      rows: matrixRowNames.map((name, rowIndex) => ({
        name,
        values: matrixColumns.map((_, columnIndex) => matrixValues[rowIndex * matrixColumns.length + columnIndex] || ""),
      })),
    };
    const percentual = Number(rgaPercentual.replace("%", "").replace(",", "."));
    if (!percentual || percentual <= 0 || !rgaAno || !rgaBaseLegal.length) {
      setRgaError("Preencha os campos obrigatórios da parametrização antes de simular a aplicação.");
      return;
    }
    const parseMoney = (value: string) => Number(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    const formatMoney = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    setRgaSimulation({
      columns: [...matrixBase.columns],
      rows: matrixBase.rows.map((row) => ({
        name: row.name,
        values: row.values.map((value) => formatMoney(Math.round(parseMoney(value) * (1 + percentual / 100) * 100) / 100)),
      })),
    });
    setRgaBaseMatrix(matrixBase);
    setRgaApplied(false);
    setRgaSimulationStale(false);
  };
  const back = () => nav(BASE);
  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (activeTab === "identificacao") {
      if (!cargo || !jornada || !d.get("inicio") || !documentosLegais.length) {
        setError("Preencha todos os campos obrigatórios de Identificação e vigência para continuar.");
        return;
      }
      if (d.get("fim") && String(d.get("fim")) < String(d.get("inicio"))) {
        setError("A data final da vigência deve ser posterior à data inicial.");
        return;
      }
      setError("");
      setActiveTab("valores");
      return;
    }
    if (Number(d.get("matrixRowCount")) < 1) {
      setError("Adicione pelo menos uma linha à matriz de valores.");
      return;
    }
    if (Number(d.get("matrixColumnCount")) < 1) {
      setError("Adicione pelo menos uma coluna à matriz de valores.");
      return;
    }
    const hasDuplicates = (values: FormDataEntryValue[]) => {
      const normalized = values.map((value) => String(value).trim().toLocaleLowerCase("pt-BR"));
      return new Set(normalized).size !== normalized.length;
    };
    if (hasDuplicates(d.getAll("matrixRowName"))) {
      setError("Não é permitido repetir o nome de uma linha na mesma tabela.");
      return;
    }
    if (hasDuplicates(d.getAll("matrixColumnName"))) {
      setError("Não é permitido repetir o nome de uma coluna na mesma tabela.");
      return;
    }
    const hasMatrixValue = d
      .getAll("matrixValue")
      .some((value) => String(value).replace(/\D/g, "").replace(/^0+/, "").length > 0);
    if (!hasMatrixValue) {
      setError(
        "Informe ao menos um valor para uma combinação de nível e classe antes de salvar a tabela.",
      );
      return;
    }
    if (d.get("fim") && String(d.get("fim")) < String(d.get("inicio"))) {
      setError("A data final da vigência deve ser posterior à data inicial.");
      return;
    }
    if (!edit && cargo && jornada) {
      const inicio = String(d.get("inicio") || "");
      const fim = String(d.get("fim") || "");
      const today = localIsoDate();
      const novaTabelaVigente = inicio <= today && (!fim || fim >= today);
      const salvasDaJornada = readSavedTables().filter(
        (table) => table.cargoId === cargo.id && table.jornada === jornada,
      );
      const existeVigenteSalva = salvasDaJornada.some((table) => isVersionCurrent(table.versao));
      const existeVigenteInicial = salvasDaJornada.length === 0 && jornadaIndex >= 0 && jornadaIndex < cargo.vigentes;
      if (novaTabelaVigente && (existeVigenteSalva || existeVigenteInicial)) {
        setError("Já existe uma tabela de vencimentos vigente para esta jornada. Utilize a opção Versionar para criar uma nova versão.");
        return;
      }
    }
    if (!edit && d.get("inicio") === "2026-01-01") {
      setError("Já existe uma tabela de vencimentos para esta jornada no período informado. Revise as datas de vigência para continuar.");
      return;
    }
    if (activeTab === "valores" && incideRga) {
      setError("");
      setActiveTab("rga");
      return;
    }
    if (activeTab === "rga" && !rgaApplied) {
      setError("Simule e confirme a aplicação da RGA antes de salvar a tabela.");
      return;
    }
    if (cargo && jornada) {
      const todayIso = localIsoDate();
      const today = formatDate(todayIso);
      const previousDay = formatDate(previousIsoDate(String(d.get("inicio") || todayIso)));
      if (edit && !versionConfirmed.current) {
        setVersionConfirmationOpen(true);
        return;
      }
      versionConfirmed.current = false;
      const inicioInformado = String(d.get("inicio") || "");
      const fim = String(d.get("fim") || "");
      const matrixColumns = d.getAll("matrixColumnName").map(String);
      const matrixRowNames = d.getAll("matrixRowName").map(String);
      const matrixValues = d.getAll("matrixValue").map(String);
      const saved = readSavedTables();
      const inicio = inicioInformado;
      const record: TabelaSalva = {
        id: Date.now().toString(),
        cargoId: cargo.id,
        jornada,
        versao: {
          ano: Number(inicio.slice(0, 4)) || new Date().getFullYear(),
          inicio: formatDate(inicio),
          fim: edit ? undefined : fim ? formatDate(fim) : undefined,
          status: inicio > todayIso ? "Futura" : "Vigente",
          alteracao: new Date().toLocaleDateString("pt-BR"),
          usuario: "Roberto Junior",
          origem: rgaApplied ? "RGA" : edit ? "Versionamento" : "Cadastro inicial",
          percentualRga: rgaApplied ? rgaPercentual : undefined,
        },
        matrix: {
          columns: matrixColumns,
          rows: matrixRowNames.map((name, rowIndex) => ({
            name,
            values: matrixColumns.map((_, columnIndex) =>
              matrixValues[rowIndex * matrixColumns.length + columnIndex] || "",
            ),
          })),
        },
        baseLegal: documentosLegais.join(", ") || "Lei Complementar nº 600/2017",
        observacao,
        incideRga,
        rga: incideRga ? {
          percentual: rgaPercentual,
          ano: rgaAno,
          vigencia: inicio,
          baseLegal: rgaBaseLegal.join(", "),
          observacao: rgaObservacao,
          responsavel: "Roberto Junior",
          aplicadaEm: new Date().toLocaleString("pt-BR"),
        } : undefined,
      };
      const savedIndex = savedRecord?.id
        ? saved.findIndex((item) => item.id === savedRecord.id)
        : -1;
      if (edit) {
        if (savedIndex >= 0) {
          saved[savedIndex] = {
            ...saved[savedIndex],
            versao: { ...saved[savedIndex].versao, fim: previousDay, status: "Encerrada" },
          };
        } else {
          saved.push({
            id: Date.now().toString() + "-anterior",
            cargoId: cargo.id,
            jornada,
            versao: {
              ano: Number(initialInicio.slice(0, 4)) || new Date().getFullYear(),
              inicio: formatDate(initialInicio || "2026-01-01"),
              fim: previousDay,
              status: "Encerrada",
              alteracao: previousDay,
              usuario: "Maria Silva",
            },
            matrix: defaultMatrixData(),
            baseLegal: "Lei_Complementar_600_2017.pdf",
            observacao: "Valores definidos conforme a estrutura vigente da carreira.",
          });
        }
        saved.push(record);
      } else {
        saved.push(record);
      }
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
    nav(BASE + "?salvo=1" + (activeTab === "rga" ? "&rga=1" : ""));
  };
  return (
    <CardSeplag
      title={
        view
          ? "Visualizar tabela de vencimentos"
          : edit
          ? "Alterar tabela de vencimentos – " + (savedRecord?.versao.ano || initialInicio.slice(0, 4) || "2026")
          : "Nova tabela de vencimentos"
      }
      cols="12"
      cardHeaderClassNames="prototype-regime-card prototype-ingressos-card tv-form-card"
      headerNavigation={
        <BreadcrumbSeplag
          divided
          items={[
            { label: "Cadastro" },
            { label: "Cargo e Concurso" },
            { label: "Tabela de Vencimentos", to: BASE },
            { label: view ? "Visualizar" : edit ? "Versionar" : "Cadastrar" },
          ]}
        />
      }
    >
      <form ref={formRef} className="tv-form col-12" onSubmit={save} onInputCapture={(event) => {
        const target = event.target as HTMLInputElement;
        if (!target.name?.startsWith("matrix") || (!rgaSimulation && !rgaApplied)) return;
        invalidateRgaSimulation();
      }}>
        <nav className="tv-form-tabs" aria-label="Etapas da tabela de vencimentos">
          <button type="button" className={activeTab === "identificacao" ? "active" : ""} onClick={() => setActiveTab("identificacao")}>Identificação e vigência</button>
          <button type="button" className={activeTab === "valores" ? "active" : ""} onClick={() => setActiveTab("valores")}>Valores por Nível e Classe</button>
          <button type="button" disabled={!incideRga} className={activeTab === "rga" ? "active" : ""} onClick={() => setActiveTab("rga")}>Aplicação de RGA</button>
        </nav>
        <section className={"prototype-novo-ingresso-panel tv-tab-panel " + (activeTab === "identificacao" ? "active" : "")}>
          <h3>
            <span className="prototype-novo-ingresso-panel-icon">
              <i className="pi pi-calendar" aria-hidden="true" />
            </span>
            <span>Identificação e vigência</span>
          </h3>
          <div className="prototype-ingresso-import-grid tv-form-grid">
            <label className="prototype-ingresso-field">
              <span>Carreira</span>
              <select
                disabled={view || edit || !!initial}
                value={carreira}
                onChange={(e) => {
                  setCarreira(e.target.value);
                  setCargoId("");
                  setJornada("");
                }}
              >
                <option value="">Selecione</option>
                {Array.from(new Set(CARGOS.map((x) => x.carreira))).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="prototype-ingresso-field">
              <span>
                Cargo<em>*</em>
              </span>
              <select
                required
                disabled={view || edit || !!initial}
                value={cargoId}
                onChange={(e) => {
                  setCargoId(e.target.value);
                  setJornada("");
                }}
              >
                <option value="">Selecione</option>
                {CARGOS.filter((x) => !carreira || x.carreira === carreira).map(
                  (x) => (
                    <option key={x.id} value={x.id}>
                      {x.nome}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="prototype-ingresso-field">
              <span>
                Jornada<em>*</em>
              </span>
              <select
                required
                name="jornada"
                disabled={view || edit || !!initialJornada}
                value={jornada}
                onChange={(e) => setJornada(e.target.value)}
              >
                <option value="">Selecione</option>
                {(cargo?.jornadas || []).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="prototype-ingresso-field">
              <span>
                Data início da vigência<em>*</em>
              </span>
              <input
                required
                name="inicio"
                type="date"
                disabled={view}
                value={vigenciaInicio}
                onChange={(event) => setVigenciaInicio(event.target.value)}
              />
            </label>
            <label className="prototype-ingresso-field">
              <span>Data fim da vigência</span>
              <input name="fim" type="date" disabled={view} value={vigenciaFim} onChange={(event) => setVigenciaFim(event.target.value)} />
            </label>
            <div className="prototype-ingresso-field tv-base-legal-field">
              {view ? (
                <label className="prototype-ingresso-field">
                  <span>Base legal</span>
                  <input type="text" disabled value={savedRecord?.baseLegal || "Lei Complementar nº 600/2017"} readOnly />
                </label>
              ) : <DocumentosLegaisAssociadosSeplag
                label="Base legal"
                required
                options={opcoesDocumentosLegais}
                value={documentosLegais}
                onChange={setDocumentosLegais}
                onVisualizar={(documento) =>
                  nav("/prototipos/sigep/documentos-legais/" + documento.id)
                }
                placeholder="Buscar documentos legais..."
                exibirNovoCadastro={false}
                compact
                expandirAoAbrir
              />}
            </div>
            <div className="tv-rga-field" role="group" aria-labelledby="tv-rga-label">
              <span id="tv-rga-label" className="tv-rga-label">Incide RGA?</span>
              <div className="tv-rga-options">
                <label><input type="radio" name="incideRga" checked={incideRga} disabled={view} onChange={() => setIncideRga(true)} /><span>Sim</span></label>
                <label><input type="radio" name="incideRga" checked={!incideRga} disabled={view} onChange={() => { setIncideRga(false); if (activeTab === "rga") setActiveTab("identificacao"); }} /><span>Não</span></label>
              </div>
            </div>
          </div>
        </section>
        <section className={"prototype-novo-ingresso-panel tv-observation-card tv-tab-panel " + (activeTab === "identificacao" ? "active" : "")}>
          <h3>
            <span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-comment" aria-hidden="true" /></span>
            <div><strong>Observação</strong><small>Registre informações complementares sobre a tabela de vencimentos.</small></div>
          </h3>
          <div className="tv-observation-content">
            <label htmlFor="tv-observacao">Observação</label>
            <textarea id="tv-observacao" name="observacao" rows={5} maxLength={2000} disabled={view} value={observacao} onChange={(event) => setObservacao(event.target.value)} />
            <small>{observacao.length}/2000</small>
          </div>
        </section>
        <section className={"prototype-novo-ingresso-panel tv-values-panel tv-tab-panel " + (activeTab === "valores" ? "active" : "")}>
          <h3>
            <span className="prototype-novo-ingresso-panel-icon">
              <i className="pi pi-dollar" aria-hidden="true" />
            </span>
            <span>Valores por Nível e Classe</span>
          </h3>
          <div className="tv-values-content">
            <div className="tv-section-head">
              <p>Matriz gerada conforme a estrutura do cargo e da carreira.</p>
            {!view && <BotaoSeplag
              type="button"
              label="Copiar valores da tabela anterior"
              icon="pi pi-copy"
              disabled={!hasPreviousTable}
              onClick={() => setCopy(true)}
            />}
            </div>
            <Matrix key={String(copy) + String(Boolean(rgaAppliedMatrix))} edit={!view} copy={view || copy || Boolean(rgaAppliedMatrix)} data={rgaAppliedMatrix || (view || edit ? savedRecord?.matrix : undefined)} onStructureChange={invalidateRgaSimulation} />
          </div>
        </section>
        {incideRga && (
          <section className={"prototype-novo-ingresso-panel tv-rga-panel tv-tab-panel " + (activeTab === "rga" ? "active" : "")}>
            <div className="tv-rga-heading">
              <div><h3><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-percentage" /></span><span>Aplicação de RGA</span></h3></div>
              <div className="tv-rga-actions">
                <BotaoSeplag type="button" label="Simular aplicação" icon="pi pi-calculator" onClick={simulateRga} />
                <BotaoSalvarSeplag type="button" label="Aplicar RGA" disabled={!rgaSimulation || rgaApplied} onClick={() => setRgaApplyConfirmation(true)} />
              </div>
            </div>
            <div className="tv-rga-info"><i className="pi pi-info-circle" /><span>A RGA será calculada sobre os valores atualmente informados na seção Valores por Nível e Classe desta versão.</span></div>
            <div className="tv-rga-main-grid">
              <div className="tv-rga-parameters">
                <h4>Parametrização da RGA</h4>
                <div className="tv-rga-fields">
                  <label><span>Ano da RGA<em>*</em></span><input value={rgaAno} disabled={view} inputMode="numeric" onChange={(e) => { invalidateRgaSimulation(); setRgaAno(e.target.value.replace(/\D/g, "").slice(0, 4)); }} /></label>
                  <label><span>Percentual da RGA<em>*</em></span><input value={rgaPercentual} disabled={view} inputMode="numeric" placeholder="0,00%" onChange={(e) => { invalidateRgaSimulation(); setRgaPercentual(formatRgaPercentage(e.target.value)); }} /></label>
                  <div className="prototype-ingresso-field tv-base-legal-field tv-rga-legal"><DocumentosLegaisAssociadosSeplag label="Base legal da RGA" required options={opcoesDocumentosLegais} value={rgaBaseLegal} onChange={(value) => { invalidateRgaSimulation(); setRgaBaseLegal(value); }} onVisualizar={(documento) => nav("/prototipos/sigep/documentos-legais/" + documento.id)} placeholder="Buscar documentos legais..." exibirNovoCadastro={false} compact expandirAoAbrir /></div>
                  <label className="wide"><span>Observação</span><textarea rows={3} value={rgaObservacao} disabled={view} onChange={(e) => setRgaObservacao(e.target.value)} /></label>
                </div>
              </div>
              <aside className="tv-rga-summary">
                <h4>Resumo da aplicação</h4>
                <dl>
                  <div><dt>Cargo</dt><dd>{cargo?.nome || "—"}</dd></div>
                  <div><dt>Jornada</dt><dd>{jornada || "—"}</dd></div>
                  <div><dt>Versão de origem</dt><dd>{originVersionNumber ? "V" + originVersionNumber : "—"}</dd></div>
                  <div><dt>Versão em edição</dt><dd>{"V" + editingVersionNumber}</dd></div>
                  <div><dt>Vigência da nova versão</dt><dd>{vigenciaInicio ? formatDate(vigenciaInicio) + (vigenciaFim ? " – " + formatDate(vigenciaFim) : " – Atual") : "—"}</dd></div>
                  <div><dt>Quantidade de valores da matriz</dt><dd>{rgaSimulation ? rgaSimulation.rows.length * rgaSimulation.columns.length : "—"}</dd></div>
                  <div><dt>Percentual da RGA</dt><dd>{rgaPercentual || "—"}</dd></div>
                  <div><dt>Reflexo nos servidores</dt><dd><span className="tv-status vigente">Automático</span></dd></div>
                  <div><dt>Status da RGA</dt><dd><span className={"tv-status " + (rgaApplied ? "vigente" : rgaSimulation ? "futura" : "sem-tabela")}>{rgaApplied ? "Aplicada" : rgaSimulationStale ? "Simulação desatualizada" : rgaSimulation ? "Simulação realizada" : "Não simulada"}</span></dd></div>
                </dl>
              </aside>
            </div>
            {rgaSimulationStale && <div className="tv-error">Os valores desta versão foram alterados após a última simulação. Realize uma nova simulação da RGA para atualizar os resultados.</div>}
            {rgaError && <div className="tv-error">{rgaError}</div>}
            <div className="tv-rga-preview">
              <h4>Pré-visualização dos novos valores</h4>
              <div className="tv-scroll"><table><thead><tr><th>Nível</th><th>Classe</th><th>Valor base</th><th>Percentual RGA</th><th>Valor com RGA</th><th>Diferença</th></tr></thead><tbody>
                {rgaSimulation ? rgaSimulation.rows.flatMap((row, rowIndex) => rgaSimulation.columns.map((column, columnIndex) => {
                  const current = rgaBaseMatrix?.rows[rowIndex]?.values[columnIndex] || "R$ 0,00";
                  const updated = row.values[columnIndex];
                  const money = (value: string) => Number(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
                  const difference = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(money(updated) - money(current));
                  return <tr key={row.name + column}><td>{row.name}</td><td>{column}</td><td>{current}</td><td>{rgaPercentual}</td><td>{updated}</td><td>+ {difference}</td></tr>;
                })) : <tr><td colSpan={6} className="tv-rga-empty">Execute a simulação para visualizar os novos valores.</td></tr>}
              </tbody></table></div>
            </div>
            <div className="tv-rga-rules"><h4>Regras do reflexo automático</h4><div><p><i className="pi pi-calendar" aria-hidden="true" /><span>A nova versão da tabela de vencimentos passa a vigorar a partir da data de início informada.</span></p><p><i className="pi pi-users" aria-hidden="true" /><span>Todos os servidores vinculados a esta tabela terão o reflexo automático em sua remuneração-base conforme o respectivo Nível e Classe.</span></p><p><i className="pi pi-file" aria-hidden="true" /><span>Rubricas adicionais que possuam regra própria de incidência de RGA deverão ser tratadas separadamente.</span></p></div></div>
          </section>
        )}
        {error && <div className="tv-error">{error}</div>}
        <div className="tv-form-actions">
          <BotaoVoltarSeplag type="button" label="Voltar" onClick={back} />
          {!view && <div className="tv-form-actions-primary">
            <BotaoSalvarSeplag
              type="submit"
              label={activeTab === "identificacao" ? "Salvar Identificação" : activeTab === "rga" ? "Finalizar" : "Salvar tabela"}
              disabled={activeTab === "rga" && !rgaApplied}
            />
          </div>}
        </div>
      </form>
      {versionConfirmationOpen && (
        <div className="tv-profile-list-overlay" role="presentation">
          <section className="tv-version-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="tv-version-confirm-title">
            <header>
              <div className="tv-version-confirm-icon" aria-hidden="true"><i className="pi pi-copy" /></div>
              <div>
                <h2 id="tv-version-confirm-title">Confirmar versionamento da tabela?</h2>
                <p>Revise as informações antes de criar a nova versão.</p>
              </div>
              <button type="button" className="tv-version-confirm-close" aria-label="Fechar" onClick={() => setVersionConfirmationOpen(false)}><i className="pi pi-times" /></button>
            </header>
            <div className="tv-version-confirm-content">
              <p>As alterações entrarão em vigor em <strong>{formatDate(localIsoDate())}</strong>.</p>
              <p>A versão atualmente vigente será encerrada em <strong>{formatDate(previousIsoDate())}</strong> e permanecerá disponível no histórico.</p>
              <p>Uma nova versão será criada com os valores informados.</p>
            </div>
            <footer>
              <BotaoVoltarSeplag type="button" label="Cancelar" onClick={() => setVersionConfirmationOpen(false)} />
              <BotaoSalvarSeplag type="button" label="Confirmar versionamento" onClick={() => {
                setVersionConfirmationOpen(false);
                versionConfirmed.current = true;
                formRef.current?.requestSubmit();
              }} />
            </footer>
          </section>
        </div>
      )}
      {rgaApplyConfirmation && rgaSimulation && (
        <div className="tv-profile-list-overlay" role="presentation">
          <section className="tv-version-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="tv-rga-confirm-title">
            <header>
              <div className="tv-version-confirm-icon" aria-hidden="true"><i className="pi pi-percentage" /></div>
              <div><h2 id="tv-rga-confirm-title">Aplicar RGA</h2><p>Confirme a geração da nova versão da tabela.</p></div>
              <button type="button" className="tv-version-confirm-close" aria-label="Fechar" onClick={() => setRgaApplyConfirmation(false)}><i className="pi pi-times" /></button>
            </header>
            <div className="tv-version-confirm-content"><p>A RGA será aplicada aos valores desta versão da tabela de vencimentos. Os valores calculados substituirão os valores atualmente informados na matriz desta nova versão. A versão anterior permanecerá inalterada. Deseja continuar?</p></div>
            <footer>
              <BotaoVoltarSeplag type="button" label="Cancelar" onClick={() => setRgaApplyConfirmation(false)} />
              <BotaoSalvarSeplag type="button" label="Confirmar aplicação" onClick={() => {
                setRgaAppliedMatrix(rgaSimulation);
                setRgaApplied(true);
                setRgaApplyConfirmation(false);
              }} />
            </footer>
          </section>
        </div>
      )}
    </CardSeplag>
  );
}
export function TabelaVencimentosFeaturePage() {
  const loc = useLocation();
  const id = loc.pathname.match(/cargo\/(\d+)/)?.[1];
  const cargo = CARGOS.find((x) => String(x.id) === id);
  let content = <List />;
  if (loc.pathname.endsWith("/novo")) content = <Form edit={false} />;
  else if (loc.pathname.endsWith("/visualizar")) content = <Form edit={false} view />;
  else if (loc.pathname.includes("/editar/")) content = <Form edit />;
  else if (cargo) content = <Detail cargo={cargo} />;
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-ingressos-teste-list-page tv-page">
        {content}
      </div>
    </PrototypeSystemPage>
  );
}
