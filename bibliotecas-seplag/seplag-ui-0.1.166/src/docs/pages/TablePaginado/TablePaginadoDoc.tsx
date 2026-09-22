import { BadgeSeplag } from "@componentes/Badge";
import { BotaoIconSeplag } from "@componentes/Botao";
import { TableGroupFooterSeplag, TableGroupHeaderSeplag } from "@componentes/TableGroup";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { DataTableExpandedRows, DataTableValueArray } from "primereact/datatable";
import "primereact/resources/themes/saga-blue/theme.css";
import { useState } from "react";
import type { ResultsSeplag } from "../../../interfaces/Results";
import {
  formatarParaCNPJComPaddingSeplag,
  formatCNPJSeplag,
} from "../../../uteis/cpfCnpj/manipulaCNPJAndCPF";
import { formatCPFSeplag } from "../../../uteis/formatCpf";
import { formatAnyDateSeplag } from "../../../uteis/manipulaData";
import { DocPage, PlaygroundCode, type DocProp, type DocSection } from "../../components/DocPage";

// ---------------------------------------------------------------------------
// Tipos de exemplo
// ---------------------------------------------------------------------------

interface PessoaExemplo {
  id: number;
  nome: string;
  cpf: string;
  cargo: string;
}

interface ColaboradorExemplo {
  id: number;
  nome: string;
  cpf: string;
  cnpj: string;
  salario: number;
  dataAdmissao: string;
  situacao: "ativo" | "inativo" | "ferias";
}

interface EventoExemplo {
  id: number;
  grupo: string;
  codigo: string;
  descricao: string;
  importacao?: number;
  validacao?: number;
  pendencias?: number;
}

// ---------------------------------------------------------------------------
// Dados fictícios
// ---------------------------------------------------------------------------

const mockData: ResultsSeplag<PessoaExemplo> = {
  content: [
    { id: 1, nome: "Ana Silva", cpf: "12345678900", cargo: "Analista" },
    {
      id: 2,
      nome: "Bruno Costa",
      cpf: "98765432100",
      cargo: "Coordenador",
    },
    { id: 3, nome: "Carla Souza", cpf: "11122233344", cargo: "Gerente" },
  ],
  totalRecords: 3,
  totalPages: 1,
  pageActual: 0,
  sizePage: 10,
  size: 10,
  number: 0,
  numberOfElements: 3,
  last: true,
  first: true,
  empty: false,
};

const mockDataVazia: ResultsSeplag<PessoaExemplo> = {
  content: [],
  totalRecords: 0,
  totalPages: 0,
  pageActual: 0,
  sizePage: 10,
  size: 10,
  number: 0,
  numberOfElements: 0,
  last: true,
  first: true,
  empty: true,
};

const columns: ColumnMetaSeplag<PessoaExemplo>[] = [
  { header: "Nome", field: "nome" },
  {
    header: "CPF",
    body: (row) => formatCPFSeplag(row.cpf),
  },
  { header: "Cargo", field: "cargo" },
];

// ---------------------------------------------------------------------------
// Dados e colunas para exemplos avançados
// ---------------------------------------------------------------------------

const mockColaboradores: ResultsSeplag<ColaboradorExemplo> = {
  content: [
    {
      id: 1,
      nome: "Ana Silva",
      cpf: "12345678900",
      cnpj: "12345678000195",
      salario: 4500,
      dataAdmissao: "2021-03-15",
      situacao: "ativo",
    },
    {
      id: 2,
      nome: "Bruno Costa",
      cpf: "98765432100",
      cnpj: "98765432000100",
      salario: 7200.5,
      dataAdmissao: "2019-07-01",
      situacao: "ferias",
    },
    {
      id: 3,
      nome: "Carla Souza",
      cpf: "11122233344",
      cnpj: "11122233000144",
      salario: 3100,
      dataAdmissao: "2023-01-10",
      situacao: "inativo",
    },
  ],
  totalRecords: 3,
  totalPages: 1,
  pageActual: 0,
  sizePage: 10,
  size: 10,
  number: 0,
  numberOfElements: 3,
  last: true,
  first: true,
  empty: false,
};

const mockEventosAgrupados: ResultsSeplag<EventoExemplo> = {
  content: [
    {
      id: 1,
      grupo: "EVENTO DE TABELAS",
      codigo: "S-1000",
      descricao: "Informacoes do Empregador",
      validacao: 1,
      pendencias: 2,
    },
    {
      id: 2,
      grupo: "EVENTO DE TABELAS",
      codigo: "S-1005",
      descricao: "Tabela Estab. e Orgaos Publicos",
    },
    {
      id: 3,
      grupo: "EVENTO DE TABELAS",
      codigo: "S-1020",
      descricao: "Tabela de Lotacoes Tributarias",
    },
    {
      id: 4,
      grupo: "EVENTO DE TABELAS",
      codigo: "S-1070",
      descricao: "Tabela de Processos Administrativos/Judiciais",
    },
    {
      id: 5,
      grupo: "EVENTO NAO PERIODICO",
      codigo: "S-2200",
      descricao: "Admissao de empregado",
    },
    {
      id: 6,
      grupo: "EVENTO PERIODICO",
      codigo: "S-1200",
      descricao: "Remuneracao de Trabalhador RGPS",
    },
  ],
  totalRecords: 6,
  totalPages: 1,
  pageActual: 0,
  sizePage: 10,
  size: 10,
  number: 0,
  numberOfElements: 6,
  last: true,
  first: true,
  empty: false,
};

const situacaoStyles: Record<
  ColaboradorExemplo["situacao"],
  { label: string; variant: "success" | "error" | "warning" }
> = {
  ativo: { label: "Ativo", variant: "success" },
  inativo: { label: "Inativo", variant: "error" },
  ferias: { label: "Férias", variant: "warning" },
};

const columnsColaboradores: ColumnMetaSeplag<ColaboradorExemplo>[] = [
  { header: "Nome", field: "nome" },
  {
    header: "CPF",
    body: (row) => formatCPFSeplag(row.cpf),
  },
  {
    header: "CNPJ",
    body: (row) => formatCNPJSeplag(row.cnpj),
  },
  {
    header: "Salário",
    body: (row) =>
      row.salario.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
  },
  {
    header: "Admissão",
    body: (row) => formatAnyDateSeplag(row.dataAdmissao),
  },
  {
    header: "Situação",
    body: (row) => {
      const s = situacaoStyles[row.situacao];
      return <BadgeSeplag label={s.label} variant={s.variant} size="xs" minWidth={88} />;
    },
  },
];

const columnsMascaras: ColumnMetaSeplag<ColaboradorExemplo>[] = [
  { header: "Nome", field: "nome" },
  {
    header: "CPF (formatCPFSeplag)",
    body: (row) => formatCPFSeplag(row.cpf),
  },
  {
    header: "CNPJ (formatCNPJSeplag)",
    body: (row) => formatCNPJSeplag(row.cnpj),
  },
  {
    header: "CNPJ com padding",
    body: (row) => formatarParaCNPJComPaddingSeplag(row.cnpj),
  },
  {
    header: "Data ISO → dd/MM/yyyy",
    body: (row) => formatAnyDateSeplag(row.dataAdmissao),
  },
];

const renderContador = (valor: number | undefined, tipo: "sucesso" | "erro") => {
  if (!valor) return <BadgeSeplag label="-" variant="neutral" size="xs" minWidth={42} />;

  const isSucesso = tipo === "sucesso";
  return (
    <BadgeSeplag
      label={String(valor)}
      icon={isSucesso ? "pi pi-check" : "pi pi-times"}
      variant={isSucesso ? "success" : "error"}
      size="xs"
      minWidth={52}
    />
  );
};

const columnsEventosAgrupados: ColumnMetaSeplag<EventoExemplo>[] = [
  {
    header: "EVENTO",
    body: (row) => (
      <span>
        <strong>{row.codigo}</strong>
        {" - "}
        {row.descricao}
      </span>
    ),
  },
  {
    header: "IMPORTACAO",
    body: (row) =>
      row.importacao ?? <BadgeSeplag label="-" variant="neutral" size="xs" minWidth={42} />,
  },
  {
    header: "VALIDACAO",
    body: (row) => renderContador(row.validacao, "sucesso"),
  },
  {
    header: "PENDENCIAS",
    body: (row) => renderContador(row.pendencias, "erro"),
  },
];

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

interface ToggleRowProps {
  readonly propKey: string;
  readonly label: string;
  readonly value: boolean;
  readonly setter: (v: boolean) => void;
}

function ToggleRow({ propKey, label, value, setter }: ToggleRowProps) {
  return (
    <div className="pg-field">
      <span className="pg-label">{propKey}</span>
      <div className="pg-radio-group">
        {([true, false] as boolean[]).map((v) => (
          <label key={String(v)} className={`pg-radio-btn${value === v ? " selected" : ""}`}>
            <input type="radio" name={propKey} checked={value === v} onChange={() => setter(v)} />
            {v ? label : "false"}
          </label>
        ))}
      </div>
    </div>
  );
}

interface PlaygroundState {
  readonly hasView: boolean;
  readonly hasEdit: boolean;
  readonly hasDuplicar: boolean;
  readonly hasDelete: boolean;
  readonly hasGerarOficio: boolean;
  readonly hasAdicionar: boolean;
  readonly paginator: boolean;
  readonly semInformacoes: boolean;
}

interface PlaygroundActionHandlers {
  handleView: ((row: PessoaExemplo) => void) | null;
  handleEdit: ((row: PessoaExemplo) => void) | null;
  handleDuplicar: ((row: PessoaExemplo) => void) | null;
  handleDelete: ((row: PessoaExemplo) => void) | null;
  handleGerarOficio: ((row: PessoaExemplo) => void) | null;
  handleAdicionar: (() => void) | null;
}

function buildPlaygroundActionHandlers(s: PlaygroundState): PlaygroundActionHandlers {
  return {
    handleView: s.hasView ? (row) => alert(`Visualizar: ${row.nome}`) : null,
    handleEdit: s.hasEdit ? (row) => alert(`Editar: ${row.nome}`) : null,
    handleDuplicar: s.hasDuplicar ? (row) => alert(`Duplicar: ${row.nome}`) : null,
    handleDelete: s.hasDelete ? (row) => alert(`Excluir: ${row.nome}`) : null,
    handleGerarOficio: s.hasGerarOficio ? (row) => alert(`Gerar Ofício: ${row.nome}`) : null,
    handleAdicionar: s.hasAdicionar ? () => alert("Adicionar novo") : null,
  };
}

function buildGeneratedCode(s: PlaygroundState): string {
  const acoes = s.hasView || s.hasEdit || s.hasDuplicar || s.hasDelete || s.hasGerarOficio;
  const lines: string[] = [
    'import { TablePaginadoSeplag } from "@seplag/ui-lib-react-18";',
    'import type { ColumnMetaSeplag } from "@seplag/ui-lib-react-18";',
    "",
    "const columns: ColumnMetaSeplag<Pessoa>[] = [",
    '  { header: "Nome", field: "nome" },',
    '  { header: "CPF", field: "cpf" },',
    '  { header: "Cargo", field: "cargo" },',
    "];",
    "",
    "<TablePaginadoSeplag",
    `  data={${s.semInformacoes ? "dataVazia" : "data"}}`,
    "  rows={10}",
    "  columns={columns}",
  ];
  if (acoes) lines.push("  hasEventoAcao");
  if (s.hasView) lines.push('  handleView={(row) => console.log("ver", row)}');
  if (s.hasEdit) lines.push('  handleEdit={(row) => console.log("editar", row)}');
  if (s.hasDuplicar) lines.push('  handleDuplicar={(row) => console.log("duplicar", row)}');
  if (s.hasGerarOficio)
    lines.push('  handleGerarOficio={(row) => console.log("gerar ofício", row)}');
  if (s.hasDelete) lines.push('  handleDelete={(row) => console.log("excluir", row)}');
  if (s.hasAdicionar) lines.push('  handleAdicionar={() => console.log("adicionar")}');
  lines.push(
    '  // quando não houver registros, exibe: "Nenhum registro encontrado"',
    `  paginator={${s.paginator}}`,
    "  handleOnPageChange={(e) => console.log(e)}",
    "/>",
  );
  return lines.join("\n");
}

function TablePlayground() {
  const [hasView, setHasView] = useState(true);
  const [hasEdit, setHasEdit] = useState(true);
  const [hasDuplicar, setHasDuplicar] = useState(false);
  const [hasDelete, setHasDelete] = useState(true);
  const [hasGerarOficio, setHasGerarOficio] = useState(false);
  const [hasAdicionar, setHasAdicionar] = useState(true);
  const [paginator, setPaginator] = useState(true);
  const [semInformacoes, setSemInformacoes] = useState(false);

  const acoes = hasView || hasEdit || hasDuplicar || hasDelete || hasGerarOficio;
  const generatedCode = buildGeneratedCode({
    hasView,
    hasEdit,
    hasDuplicar,
    hasDelete,
    hasGerarOficio,
    hasAdicionar,
    paginator,
    semInformacoes,
  });
  const actionHandlers = buildPlaygroundActionHandlers({
    hasView,
    hasEdit,
    hasDuplicar,
    hasDelete,
    hasGerarOficio,
    hasAdicionar,
    paginator,
    semInformacoes,
  });

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview" style={{ padding: "0.5rem", borderRadius: 8 }}>
        <TablePaginadoSeplag
          key={`${hasView}-${hasEdit}-${hasDuplicar}-${hasDelete}-${hasGerarOficio}-${hasAdicionar}-${paginator}-${semInformacoes}`}
          data={semInformacoes ? mockDataVazia : mockData}
          rows={10}
          columns={columns}
          hasEventoAcao={acoes}
          handleView={actionHandlers.handleView}
          handleEdit={actionHandlers.handleEdit}
          handleDuplicar={actionHandlers.handleDuplicar}
          handleDelete={actionHandlers.handleDelete}
          handleGerarOficio={actionHandlers.handleGerarOficio}
          handleAdicionar={actionHandlers.handleAdicionar}
          paginator={paginator}
          lazy={false}
          handleOnPageChange={() => {}}
        />
      </div>

      <div className="botao-playground-controls">
        <ToggleRow propKey="handleView" label="Visualizar" value={hasView} setter={setHasView} />
        <ToggleRow propKey="handleEdit" label="Editar" value={hasEdit} setter={setHasEdit} />
        <ToggleRow
          propKey="handleDuplicar"
          label="Duplicar"
          value={hasDuplicar}
          setter={setHasDuplicar}
        />
        <ToggleRow propKey="handleDelete" label="Excluir" value={hasDelete} setter={setHasDelete} />
        <ToggleRow
          propKey="handleGerarOficio"
          label="Gerar Ofício"
          value={hasGerarOficio}
          setter={setHasGerarOficio}
        />
        <ToggleRow
          propKey="handleAdicionar"
          label="Botão Adicionar (header)"
          value={hasAdicionar}
          setter={setHasAdicionar}
        />
        <ToggleRow propKey="paginator" label="Paginador" value={paginator} setter={setPaginator} />
        <ToggleRow
          propKey="semInformacoes"
          label="Sem informações"
          value={semInformacoes}
          setter={setSemInformacoes}
        />
      </div>

      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

function TableSemInformacoesExample() {
  return (
    <TablePaginadoSeplag
      data={mockDataVazia}
      rows={10}
      columns={columns}
      lazy={false}
      paginator={false}
      handleOnPageChange={() => {}}
    />
  );
}

function TableComErroExample() {
  const [temErro, setTemErro] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <TablePaginadoSeplag
        data={temErro ? undefined : mockData}
        rows={10}
        columns={columns}
        isError={temErro}
        errorMessage="Não foi possível carregar os registros. Tente novamente."
        onRetry={() => setTemErro(false)}
        lazy={false}
        paginator={false}
        handleOnPageChange={() => {}}
      />
      {!temErro && (
        <button
          type="button"
          style={{
            alignSelf: "flex-start",
            background: "none",
            border: "none",
            color: "var(--primary-color, #2563eb)",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
          }}
          onClick={() => setTemErro(true)}
        >
          Reiniciar exemplo
        </button>
      )}
    </div>
  );
}

function TableComLarguraGlobalExample() {
  return (
    <TablePaginadoSeplag
      data={mockData}
      rows={10}
      columns={columns}
      columnWidth="250px"
      columnHeaderWidth="250px"
      lazy={false}
      paginator={false}
      handleOnPageChange={() => {}}
    />
  );
}

function TableComLarguraIndividualExample() {
  const columnsComLargura: ColumnMetaSeplag<PessoaExemplo>[] = [
    { header: "Nome", field: "nome", width: "350px", headerWidth: "350px" },
    {
      header: "CPF",
      body: (row) => formatCPFSeplag(row.cpf),
      width: "200px",
      headerWidth: "200px",
    },
    { header: "Cargo", field: "cargo", width: "250px" },
  ];

  return (
    <TablePaginadoSeplag
      data={mockData}
      rows={10}
      columns={columnsComLargura}
      lazy={false}
      paginator={false}
      handleOnPageChange={() => {}}
    />
  );
}

function TableComExtraAcoesExample() {
  return (
    <TablePaginadoSeplag
      data={mockData}
      rows={10}
      columns={columns}
      hasEventoAcao
      handleView={(row) => alert(`Visualizar: ${row.nome}`)}
      handleEdit={(row) => alert(`Editar: ${row.nome}`)}
      extraAcoes={(row) => [
        {
          label: "Imprimir",
          icon: "pi pi-print",
          command: () => alert(`Imprimir: ${row.nome}`),
        },
      ]}
      lazy={false}
      paginator={false}
      handleOnPageChange={() => {}}
    />
  );
}

function TableComGruposCompostosExample() {
  const [selected, setSelected] = useState<EventoExemplo[]>([]);
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | DataTableValueArray>(
    mockEventosAgrupados.content,
  );

  function itemsDoGrupo(grupo: string) {
    return mockEventosAgrupados.content.filter((item) => item.grupo === grupo);
  }

  function alterarSelecaoDoGrupo(grupo: string, checked: boolean) {
    const groupItems = itemsDoGrupo(grupo);
    const groupIds = new Set(groupItems.map((item) => item.id));

    setSelected((current) => {
      const outsideGroup = current.filter((item) => !groupIds.has(item.id));
      return checked ? [...outsideGroup, ...groupItems] : outsideGroup;
    });
  }

  function alternarGrupo(grupo: string) {
    const currentRows = Array.isArray(expandedRows) ? (expandedRows as EventoExemplo[]) : [];
    const expanded = currentRows.some((item) => item.grupo === grupo);

    if (expanded) {
      setExpandedRows(currentRows.filter((item) => item.grupo !== grupo));
      return;
    }

    const firstGroupItem = itemsDoGrupo(grupo)[0];
    if (firstGroupItem) setExpandedRows([...currentRows, firstGroupItem]);
  }

  function renderGroupHeader(row: EventoExemplo) {
    const groupItems = itemsDoGrupo(row.grupo);
    const selectedIds = new Set(selected.map((item) => item.id));
    const selectedCount = groupItems.filter((item) => selectedIds.has(item.id)).length;

    return (
      <TableGroupHeaderSeplag
        selected={groupItems.length > 0 && selectedCount === groupItems.length}
        indeterminate={selectedCount > 0 && selectedCount < groupItems.length}
        onSelectionChange={(checked) => alterarSelecaoDoGrupo(row.grupo, checked)}
        selectionAriaLabel={`Selecionar registros de ${row.grupo}`}
        onToggle={() => alternarGrupo(row.grupo)}
      >
        <span className="seplag-table-group-title">{row.grupo}</span>
      </TableGroupHeaderSeplag>
    );
  }

  function renderGroupFooter(row: EventoExemplo, options: { colSpan: number }) {
    const shownRecords = itemsDoGrupo(row.grupo).length;
    return (
      <TableGroupFooterSeplag
        shownRecords={shownRecords}
        totalRecords={shownRecords + 2}
        onShowAll={() => undefined}
        colSpan={options.colSpan}
      />
    );
  }

  return (
    <TablePaginadoSeplag
      data={mockEventosAgrupados}
      rows={10}
      columns={columnsEventosAgrupados}
      dataKey="id"
      selectionMode="multiple"
      selected={selected}
      handleSelectionChange={(event) => setSelected(event.value ?? [])}
      showSelectAll
      expandedRows={expandedRows}
      onRowToggle={(event) => setExpandedRows(event.data)}
      lazy={false}
      paginator={false}
      handleOnPageChange={() => {}}
      grouping={{
        field: "grupo",
        mode: "subheader",
        expandable: true,
        headerTemplate: renderGroupHeader,
        footerTemplate: renderGroupFooter,
      }}
      header={<strong>REGISTROS AGRUPADOS</strong>}
    />
  );
}

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Tabela paginada interativa. Ative ou desative as opções abaixo para ver o resultado.",
    example: <TablePlayground />,
    code: "",
  },
  {
    title: "Com seleção múltipla",
    description: 'Passe `selectionMode="multiple"` para exibir checkboxes de seleção.',
    example: (
      <TablePaginadoSeplag
        data={mockData}
        rows={10}
        columns={columns}
        selectionMode="multiple"
        lazy={false}
        paginator={false}
        handleOnPageChange={() => {}}
      />
    ),
    code: '<TablePaginadoSeplag\n  data={data}\n  rows={10}\n  columns={columns}\n  selectionMode="multiple"\n  handleOnPageChange={(e) => ...}\n/>',
  },
  {
    title: "Sem informações",
    description:
      "Quando `content` está vazio, a tabela mantém a estrutura e exibe a mensagem de estado vazio.",
    example: <TableSemInformacoesExample />,
    code: `const dataVazia = {
  content: [],
  totalRecords: 0,
  pageActual: 0,
  // ...demais campos do ResultsSeplag
};

<TablePaginadoSeplag
  data={dataVazia}
  rows={10}
  columns={columns}
  handleOnPageChange={() => {}}
/>`,
  },
  {
    title: "Estado de erro (isError / errorMessage / onRetry)",
    description:
      "Use `isError` para exibir um estado dedicado de erro no lugar da tabela, com mensagem customizável em `errorMessage` e um botão \"Tentar novamente\" quando `onRetry` é informado. Útil para representar falhas de rede sem quebrar o layout da tela. Clique em \"Tentar novamente\" para simular a recuperação.",
    example: <TableComErroExample />,
    code: `<TablePaginadoSeplag
  data={data}
  rows={10}
  columns={columns}
  isError={isError}
  errorMessage="Não foi possível carregar os registros. Tente novamente."
  onRetry={() => refetch()}
  handleOnPageChange={(e) => ...}
/>`,
  },
  {
    title: "Com botões customizados",
    description: "Use `renderBotoes` para adicionar ações personalizadas por linha.",
    example: (
      <TablePaginadoSeplag
        data={mockData}
        rows={10}
        columns={columns}
        hasEventoAcao
        renderBotoes={(row: PessoaExemplo) => (
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => alert(`Custom: ${row.nome}`)}
          >
            ⚙️
          </button>
        )}
        lazy={false}
        paginator={false}
        handleOnPageChange={() => {}}
      />
    ),
    code: "<TablePaginadoSeplag\n  data={data}\n  rows={10}\n  columns={columns}\n  hasEventoAcao\n  renderBotoes={(row) => <MeuBotao row={row} />}\n  handleOnPageChange={(e) => ...}\n/>",
  },
  {
    title: "Alinhamento das ações (acoesAlign)",
    description:
      "Por padrão a fila de botões fica centralizada na célula. Quando as ações são condicionais " +
      "(aqui só o cargo Gerente tem o segundo botão), o centro faz os ícones mudarem de posição a " +
      "cada linha — `acoesAlign=\"left\"` ancora todos no mesmo ponto.",
    example: (
      <TablePaginadoSeplag
        data={mockData}
        rows={10}
        columns={columns}
        hasEventoAcao
        acoesAlign="left"
        renderBotoes={(row: PessoaExemplo) => (
          <div style={{ display: "flex", gap: "6px" }}>
            <BotaoIconSeplag
              type="button"
              tooltip="Visualizar"
              icon="pi pi-eye"
              onClick={() => alert(`Visualizar: ${row.nome}`)}
            />
            {row.cargo === "Gerente" && (
              <BotaoIconSeplag
                type="button"
                severity="danger"
                tooltip="Encerrar"
                icon="pi pi-ban"
                onClick={() => alert(`Encerrar: ${row.nome}`)}
              />
            )}
          </div>
        )}
        lazy={false}
        paginator={false}
        handleOnPageChange={() => {}}
      />
    ),
    code: '<TablePaginadoSeplag\n  data={data}\n  rows={10}\n  columns={columns}\n  hasEventoAcao\n  acoesAlign="left"\n  renderBotoes={(row) => <MeusBotoes row={row} />}\n  handleOnPageChange={(e) => ...}\n/>',
  },
  {
    title: "Ações condicionais por linha (can*) e histórico",
    description:
      "Cada `handleX` tem um `canX` correspondente (`canView`, `canEdit`, `canDuplicar`, `canDelete`, `canGerarOficio`, `canHistorico`) que decide, por linha, se o botão aparece — sem eles, o botão aparece em todas as linhas normalmente. `handleHistorico` adiciona um botão dedicado de histórico (ícone `pi pi-history`, cor neutra). Aqui o botão Excluir só aparece para o cargo Analista, e `disableAcoesGrouping` mantém os botões sempre individuais mesmo havendo 4 ações.",
    example: (
      <TablePaginadoSeplag
        data={mockData}
        rows={10}
        columns={columns}
        hasEventoAcao
        disableAcoesGrouping
        handleView={(row) => alert(`Visualizar: ${row.nome}`)}
        handleEdit={(row) => alert(`Editar: ${row.nome}`)}
        handleHistorico={(row) => alert(`Histórico: ${row.nome}`)}
        handleDelete={(row) => alert(`Excluir: ${row.nome}`)}
        canDelete={(row) => row.cargo === "Analista"}
        lazy={false}
        paginator={false}
        handleOnPageChange={() => {}}
      />
    ),
    code: `<TablePaginadoSeplag
  data={data}
  rows={10}
  columns={columns}
  hasEventoAcao
  disableAcoesGrouping
  handleView={(row) => ...}
  handleEdit={(row) => ...}
  handleHistorico={(row) => ...}
  handleDelete={(row) => ...}
  canDelete={(row) => row.situacao === "EM_ANDAMENTO"}
  handleOnPageChange={(e) => ...}
/>`,
  },
  {
    title: "Com ações extras (extraAcoes)",
    description:
      "Use `extraAcoes` para injetar ações adicionais por linha dinamicamente. " +
      "Quando há menos de 3 ações padrão, as ações extras aparecem como botões individuais; " +
      "quando há 3 ou mais ações padrão, elas são agrupadas no menu do SplitButton.",
    example: <TableComExtraAcoesExample />,
    code: '<TablePaginadoSeplag\n  data={data}\n  rows={10}\n  columns={columns}\n  hasEventoAcao\n  handleView={(row) => ...}\n  handleEdit={(row) => ...}\n  extraAcoes={(row) => [\n    { label: "Imprimir", icon: "pi pi-print", command: () => ... },\n  ]}\n  handleOnPageChange={(e) => ...}\n/>',
  },
  {
    title: "Máscaras em colunas (CPF, CNPJ, Data)",
    description:
      "Use o campo `body` em `ColumnMetaSeplag` para formatar valores usando as funções utilitárias da lib: `formatCPFSeplag`, `formatCNPJSeplag`, `formatarParaCNPJComPaddingSeplag` e `formatAnyDateSeplag`.",
    example: (
      <TablePaginadoSeplag
        data={mockColaboradores}
        rows={10}
        columns={columnsMascaras}
        lazy={false}
        paginator={false}
        handleOnPageChange={() => {}}
      />
    ),
    code: 'import {\n  formatCPFSeplag,\n  formatCNPJSeplag,\n  formatAnyDateSeplag,\n} from "@seplag/ui-lib-react-18";\nimport type { ColumnMetaSeplag } from "@seplag/ui-lib-react-18";\n\nconst columns: ColumnMetaSeplag<Colaborador>[] = [\n  { header: "Nome", field: "nome" },\n  { header: "CPF", body: (row) => formatCPFSeplag(row.cpf) },\n  { header: "CNPJ", body: (row) => formatCNPJSeplag(row.cnpj) },\n  { header: "Admissão", body: (row) => formatAnyDateSeplag(row.dataAdmissao) },\n];',
  },
  {
    title: "Coluna com badge de status e valor monetário",
    description:
      "Use `body` para renderizar qualquer elemento React, incluindo BadgeSeplag com variant semântico, valores em moeda e ícones.",
    example: (
      <TablePaginadoSeplag
        data={mockColaboradores}
        rows={10}
        columns={columnsColaboradores}
        hasEventoAcao
        handleView={(row) => alert(`Visualizar: ${row.nome}`)}
        handleEdit={(row) => alert(`Editar: ${row.nome}`)}
        lazy={false}
        paginator={false}
        handleOnPageChange={() => {}}
      />
    ),
    code: 'const columns: ColumnMetaSeplag<Colaborador>[] = [\n  { header: "Nome", field: "nome" },\n  { header: "CPF", body: (row) => formatCPFSeplag(row.cpf) },\n  {\n    header: "Salário",\n    body: (row) => row.salario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),\n  },\n  { header: "Admissão", body: (row) => formatAnyDateSeplag(row.dataAdmissao) },\n  {\n    header: "Situação",\n    body: (row) => (\n      <BadgeSeplag\n        label={row.situacao}\n        variant={row.situacao === "ativo" ? "success" : row.situacao === "inativo" ? "error" : "warning"}\n        size="xs"\n      />\n    ),\n  },\n];',
  },
  {
    title: "Com largura global de coluna",
    description:
      "Use `columnWidth` e `columnHeaderWidth` para definir uma largura padrão para todas as colunas.",
    example: <TableComLarguraGlobalExample />,
    code: '<TablePaginadoSeplag\n  data={data}\n  rows={10}\n  columns={columns}\n  columnWidth="250px"\n  columnHeaderWidth="250px"\n  handleOnPageChange={(e) => ...}\n/>',
  },
  {
    title: "Com largura individual por coluna",
    description:
      "Use `width` e `headerWidth` em cada coluna para controlar larguras específicas. Colunas sem largura definida usam a largura global como fallback.",
    example: <TableComLarguraIndividualExample />,
    code: 'const columns: ColumnMetaSeplag<Pessoa>[] = [\n  { header: "Nome", field: "nome", width: "350px", headerWidth: "350px" },\n  { header: "CPF", body: (row) => formatCPFSeplag(row.cpf), width: "200px" },\n  { header: "Cargo", field: "cargo", width: "250px" },\n];\n\n<TablePaginadoSeplag\n  data={data}\n  rows={10}\n  columns={columns}\n  columnWidth="150px"\n  handleOnPageChange={(e) => ...}\n/>',
  },
  {
    title: "Com agrupamento de linhas",
    description:
      "Use `grouping` para agrupar linhas por um campo do registro. O agrupamento usa os recursos nativos do PrimeReact DataTable e pode ser combinado com selecao, paginacao e colunas customizadas.",
    example: (
      <TablePaginadoSeplag
        data={mockEventosAgrupados}
        rows={10}
        columns={columnsEventosAgrupados}
        selectionMode="multiple"
        showSelectAll={false}
        lazy={false}
        paginator={false}
        handleOnPageChange={() => {}}
        grouping={{
          field: "grupo",
          mode: "subheader",
          headerTemplate: (row) => <span className="seplag-table-group-title">{row.grupo}</span>,
        }}
      />
    ),
    code: `const columns: ColumnMetaSeplag<Evento>[] = [
  {
    header: "EVENTO",
    body: (row) => (
      <>
        <strong>{row.codigo}</strong>
        {" - "}
        {row.descricao}
      </>
    ),
  },
  { header: "IMPORTACAO", body: (row) => row.importacao ?? "—" },
  { header: "VALIDACAO", body: (row) => <StatusBadge value={row.validacao} /> },
  { header: "PENDENCIAS", body: (row) => <StatusBadge value={row.pendencias} /> },
];

<TablePaginadoSeplag
  data={data}
  rows={10}
  columns={columns}
  selectionMode="multiple"
  showSelectAll={false}
  lazy={false}
  paginator={false}
  grouping={{
    field: "grupo",
    mode: "subheader",
    headerTemplate: (row) => <strong>{row.grupo}</strong>,
  }}
  handleOnPageChange={(e) => ...}
/>`,
  },
  {
    title: "Composição completa por grupo",
    description:
      "Combine `grouping` com `TableGroupHeaderSeplag` e `TableGroupFooterSeplag` para seleção, expansão, ações e carregamento independente por grupo. Os dados e callbacks continuam pertencendo à aplicação.",
    example: <TableComGruposCompostosExample />,
    code: `const [selected, setSelected] = useState([]);
const [expandedRows, setExpandedRows] = useState(data.content);

<TablePaginadoSeplag
  data={data}
  columns={columns}
  rows={10}
  selectionMode="multiple"
  selected={selected}
  handleSelectionChange={(event) => setSelected(event.value ?? [])}
  expandedRows={expandedRows}
  onRowToggle={(event) => setExpandedRows(event.data)}
  grouping={{
    field: "grupo",
    mode: "subheader",
    expandable: true,
    headerTemplate: (row) => (
      <TableGroupHeaderSeplag
        selected={grupoSelecionado(row.grupo)}
        indeterminate={grupoParcialmenteSelecionado(row.grupo)}
        onSelectionChange={(checked) => selecionarGrupo(row.grupo, checked)}
        onToggle={() => alternarGrupo(row.grupo)}
      >
        <strong>{row.grupo}</strong>
      </TableGroupHeaderSeplag>
    ),
    footerTemplate: (row, options) => (
      <TableGroupFooterSeplag
        shownRecords={itensCarregados(row.grupo)}
        totalRecords={totalDoGrupo(row.grupo)}
        onShowAll={() => carregarGrupo(row.grupo)}
        colSpan={options.colSpan}
      />
    ),
  }}
  header={<strong>REGISTROS AGRUPADOS</strong>}
  paginator={false}
  handleOnPageChange={() => {}}
/>`,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props: DocProp[] = [
  {
    name: "data",
    type: "ResultsSeplag<T> | undefined",
    required: true,
    description: "Objeto paginado com `content`, `totalRecords`, `pageActual`, etc.",
  },
  {
    name: "rows",
    type: "number",
    required: true,
    description: "Quantidade de linhas por página.",
  },
  {
    name: "columns",
    type: "ColumnMetaSeplag<T>[]",
    required: true,
    description: "Definição das colunas. Cada item tem `header`, `field` e opcionalmente `body`.",
  },
  {
    name: "grouping",
    type: "TableGroupingSeplag<T>",
    description:
      "Configura agrupamento de linhas. Informe `field`, `mode`, templates opcionais, ordenacao e se os grupos podem ser expandidos.",
  },
  {
    name: "handleOnPageChange",
    type: "(page: DataTableStateEvent) => void",
    required: true,
    description: "Callback chamado ao mudar de página.",
  },
  {
    name: "hasEventoAcao",
    type: "boolean",
    description: "Exibe a coluna de ações (Visualizar, Editar, Excluir, Duplicar).",
  },
  {
    name: "handleEdit",
    type: "(row: T) => void",
    description: "Callback para editar um registro. Exibe botão de edição.",
  },
  {
    name: "canEdit",
    type: "(row: T) => boolean",
    description:
      "Quando informado, decide por linha se o botão de editar aparece. Sem ele, o botão aparece em todas as linhas quando `handleEdit` é informado.",
  },
  {
    name: "handleDelete",
    type: "(row: T) => void",
    description: "Callback para excluir. Abre modal de confirmação antes de chamar.",
  },
  {
    name: "canDelete",
    type: "(row: T) => boolean",
    description:
      "Quando informado, decide por linha se o botão de excluir aparece. Sem ele, o botão aparece em todas as linhas quando `handleDelete` é informado.",
  },
  {
    name: "handleView",
    type: "(row: T) => void",
    description: "Callback para visualizar. Exibe botão de visualização.",
  },
  {
    name: "canView",
    type: "(row: T) => boolean",
    description:
      "Quando informado, decide por linha se o botão de visualizar aparece. Sem ele, o botão aparece em todas as linhas quando `handleView` é informado.",
  },
  {
    name: "handleDuplicar",
    type: "(row: T) => void",
    description: "Callback para duplicar. Aparece no SplitButton quando há 3 ou mais ações.",
  },
  {
    name: "canDuplicar",
    type: "(row: T) => boolean",
    description:
      "Quando informado, decide por linha se o botão de duplicar aparece. Sem ele, o botão aparece em todas as linhas quando `handleDuplicar` é informado.",
  },
  {
    name: "handleGerarOficio",
    type: "(row: T) => void",
    description:
      "Callback para gerar ofício do registro. Exibe botão individual quando há menos de 3 ações padrão, ou aparece no menu do SplitButton (entre Duplicar e Excluir) quando há 3 ou mais ações.",
  },
  {
    name: "canGerarOficio",
    type: "(row: T) => boolean",
    description:
      "Quando informado, decide por linha se o botão de gerar ofício aparece. Sem ele, o botão aparece em todas as linhas quando `handleGerarOficio` é informado.",
  },
  {
    name: "handleHistorico",
    type: "(row: T) => void",
    description:
      "Callback para ver o histórico do registro. Exibe botão individual (ícone `pi pi-history`, cor neutra) quando há menos de 3 ações padrão, ou aparece no menu do SplitButton (entre Duplicar e Excluir) quando há 3 ou mais ações.",
  },
  {
    name: "canHistorico",
    type: "(row: T) => boolean",
    description:
      "Quando informado, decide por linha se o botão de histórico aparece. Sem ele, o botão aparece em todas as linhas quando `handleHistorico` é informado.",
  },
  {
    name: "handleAdicionar",
    type: "() => void",
    description: "Exibe o botão Adicionar no cabeçalho da tabela.",
  },
  {
    name: "disableAdicionar",
    type: "boolean",
    description: "Desativa o botão Adicionar exibido por `handleAdicionar` sem escondê-lo.",
  },
  {
    name: "botaoAdicionarProps",
    type: "BotaoSeplagProps",
    description:
      "Customiza o botão exibido por `handleAdicionar`, como label, ícone, loading e type. Mantém o padrão Adicionar quando não informado.",
  },
  {
    name: "renderBotoes",
    type: "(row: T) => ReactNode",
    description: "Renderiza botões adicionais por linha na coluna de ações.",
  },
  {
    name: "extraAcoes",
    type: "(row: T) => { label: string; icon: string; command: () => void }[] | null",
    description:
      "Função que recebe o dado da linha e retorna ações adicionais. " +
      "Com menos de 3 ações padrão, cada ação vira um `BotaoIconSeplag` individual. " +
      "Com 3 ou mais ações padrão, as ações são adicionadas ao menu do `SplitButton`.",
  },
  {
    name: "acoesAlign",
    type: '"left" | "center" | "right"',
    description:
      "Alinha horizontalmente o conteúdo da coluna de ações — fila de botões, `SplitButton` e cabeçalho. " +
      "Quando omitido mantém o comportamento legado: fila de botões centralizada e `SplitButton` à direita.",
  },
  {
    name: "disableAcoesGrouping",
    type: "boolean",
    description:
      "Quando `true`, sempre renderiza os botões de ação individuais, mesmo com 3 ou mais ações — desativa o agrupamento automático em `SplitButton`. Padrão: `false`.",
  },
  {
    name: "selectionMode",
    type: '"multiple" | "checkbox" | "single" | null',
    description: 'Modo de seleção de linhas. Padrão: `"single"`.',
  },
  {
    name: "selected",
    type: "T[] | null",
    description: "Linhas selecionadas (controlado).",
  },
  {
    name: "showSelectAll",
    type: "boolean",
    description:
      "Exibe o checkbox de selecionar todos no cabecalho quando a tabela usa selecao multipla. Padrao: `true`.",
  },
  {
    name: "handleSelectionChange",
    type: "(event: { value: T[] | null }) => void",
    description: "Callback chamado ao alterar a seleção.",
  },
  {
    name: "metaKeySelection",
    type: "boolean",
    description:
      "Quando `true`, exige Ctrl/Cmd para selecionar múltiplas linhas (comportamento nativo do PrimeReact DataTable). Padrão: `false`.",
  },
  {
    name: "onRowSelect",
    type: "(event: DataTableSelectEvent) => void",
    description: "Callback chamado ao selecionar uma linha (evento nativo do DataTable).",
  },
  {
    name: "onRowUnselect",
    type: "(event: DataTableUnselectEvent) => void",
    description: "Callback chamado ao desselecionar uma linha (evento nativo do DataTable).",
  },
  {
    name: "handleFilterChange",
    type: "(filterModel: DataTableStateEvent) => void",
    description: "Callback chamado ao alterar filtros da tabela (modo lazy).",
  },
  {
    name: "isFetching",
    type: "boolean",
    description: "Exibe o ícone de carregamento sobre a tabela.",
  },
  {
    name: "keepLastDataOnEmpty",
    type: "boolean",
    description:
      "Mantém o último resultado visível quando `data` vier `undefined` fora de um refetch (ex: expurgo de cache do RTK Query em telas com `useLazyQuery` e trigger manual), evitando que a grid pareça \"esvaziar sozinha\". Padrão: `true`. Passe `false` para restaurar o comportamento antigo (grid vazia sempre que `data` for `undefined`).",
  },
  {
    name: "isError",
    type: "boolean",
    description:
      "Quando `true`, substitui a tabela por um estado de erro dedicado (ver `errorMessage` e `onRetry`).",
  },
  {
    name: "errorMessage",
    type: "ReactNode",
    description:
      'Mensagem exibida no estado de erro (quando `isError` é `true`). Padrão: "Erro ao carregar os dados."',
  },
  {
    name: "onRetry",
    type: "() => void",
    description:
      'Quando informado junto de `isError`, exibe um botão "Tentar novamente" que chama esse callback.',
  },
  {
    name: "emptyMessage",
    type: "ReactNode",
    description:
      'Mensagem exibida quando a busca não retorna registros. Padrão: "Nenhum registro encontrado".',
  },
  {
    name: "lazy",
    type: "boolean",
    description: "Modo lazy (paginação/filtro controlados pelo servidor). Padrão: `true`.",
  },
  {
    name: "paginator",
    type: "boolean",
    description: "Exibe o paginador na parte inferior. Padrão: `true`.",
  },
  {
    name: "rowsPerPage",
    type: "number[]",
    description: "Opções de linhas por página no paginador.",
  },
  {
    name: "dataKey",
    type: "string",
    description: 'Campo usado como chave única das linhas. Padrão: `"id"`.',
  },
  {
    name: "header",
    type: "DataTableHeaderTemplateType<T[]>",
    description: "Conteúdo extra para o cabeçalho da tabela.",
  },
  {
    name: "footer",
    type: "DataTableFooterTemplateType<T[]>",
    description: "Conteúdo do rodapé global da tabela.",
  },
  {
    name: "className / tableClassName / rowClassName",
    type: "PrimeReact DataTable props",
    description: "Permite estilizar o contêiner, a tabela e as linhas sem duplicar o componente.",
  },
  {
    name: "expandedRows",
    type: "DataTableExpandedRows | DataTableValueArray",
    description: "Linhas expandidas (para rowExpansion).",
  },
  {
    name: "rowExpansionTemplate",
    type: "(data: T, options) => ReactNode",
    description: "Template renderizado ao expandir uma linha.",
  },
  {
    name: "allowExpansion",
    type: "boolean | ((data: T, options) => boolean)",
    description: "Controla quais linhas têm o ícone de expansão.",
  },
  {
    name: "isDisabled",
    type: "boolean",
    description: "Desativa seleção e eventos de linha.",
  },
  {
    name: "columnWidth",
    type: "string",
    description:
      'Largura padrão para todas as colunas (ex: "200px", "20%"). Usado como fallback quando a coluna não define `width` próprio.',
  },
  {
    name: "columnHeaderWidth",
    type: "string",
    description:
      'Largura padrão do header para todas as colunas (ex: "200px", "20%"). Usado como fallback quando a coluna não define `headerWidth` próprio.',
  },
  {
    name: "deleteMessage",
    type: "ReactNode",
    description:
      "Mensagem exibida no modal de confirmação ao excluir um registro. Aceita texto simples, HTML ou JSX. Quando não informado, exibe a mensagem padrão do ModalDeleteSeplag.",
  },
  {
    name: "size",
    type: '"small" | "normal" | "large"',
    description: "Densidade das linhas da tabela (PrimeReact DataTable). Padrão: `\"small\"`.",
  },
  {
    name: "id",
    type: "string",
    required: false,
    description:
      "Identificador da tabela, propagado como data-testid para a DataTable, para o botão Adicionar e para o modal de exclusão (como `${id}-delete-modal`). Cada linha também recebe um data-testid próprio nos botões de ação, derivado de dataKey.",
  },
];

// ---------------------------------------------------------------------------
// Página de documentação
// ---------------------------------------------------------------------------

export default function TablePaginadoDoc() {
  return (
    <DocPage
      title="TablePaginado"
      badge="Estável"
      since="v0.0.1"
      description="Tabela paginada com suporte a seleção, ações por linha, expansão de linhas e botão de adicionar integrado ao cabeçalho. Usa PrimeReact DataTable internamente."
      importStatement={
        'import { TablePaginadoSeplag } from "@seplag/ui-lib-react-18";\nimport type { TablePaginadoSeplagProps, ColumnMetaSeplag, TableGroupingSeplag } from "@seplag/ui-lib-react-18";'
      }
      sections={sections}
      props={props}
    />
  );
}
