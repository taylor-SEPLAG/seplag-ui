import { BotaoAdicionarSeplag, BotaoSeplag, type BotaoSeplagProps } from "@componentes/Botao";
import { ModalDeleteSeplag } from "@componentes/ModalDelete";
import type { ColumnBodyOptions } from "primereact/column";
import { Column } from "primereact/column";
import {
  DataTable,
  type DataTableExpandedRows,
  type DataTableFooterTemplateType,
  type DataTableHeaderTemplateType,
  type DataTableProps,
  type DataTableRowExpansionTemplate,
  type DataTableRowGroupFooterTemplateType,
  type DataTableRowGroupHeaderTemplateType,
  type DataTableRowToggleEvent,
  type DataTableSelectEvent,
  type DataTableStateEvent,
  type DataTableUnselectEvent,
  type DataTableValue,
  type DataTableValueArray,
} from "primereact/datatable";
import { useState, type ReactNode } from "react";
import loadingIcon from "../../assets/img/Logo_Branco_Estado_MT.png";
import type { ResultsSeplag } from "../../interfaces/Results";
import style from "./Table.module.css";
import "./TableGlobal.css";
import { TableRowActionsSeplag, type TableAcoesAlignSeplag } from "./TableRowActionsSeplag";
import { useConfirmacaoExclusaoSeplag } from "./useConfirmacaoExclusaoSeplag";

export type { TableAcoesAlignSeplag } from "./TableRowActionsSeplag";

export interface TablePaginadoSeplagProps<T extends DataTableValue> {
  readonly dataKey?: string;
  readonly data: ResultsSeplag<T> | undefined;
  readonly expandedRows?: DataTableExpandedRows | DataTableValueArray;
  rowExpansionTemplate?: (data: T, options: DataTableRowExpansionTemplate) => React.ReactNode;
  readonly grouping?: TableGroupingSeplag<T>;

  readonly rows: number;
  readonly columns: ColumnMetaSeplag<T>[];
  readonly isFetching?: boolean;
  /**
   * Mantém o último resultado visível quando `data` vier undefined fora de um refetch
   * (ex: expurgo de cache do RTK Query em telas com useLazyQuery e trigger manual),
   * evitando que a grid pareça "esvaziar sozinha". Default true; passe false para
   * restaurar o comportamento antigo (grid vazia sempre que `data` for undefined).
   */
  readonly keepLastDataOnEmpty?: boolean;
  /** Quando true, exibe o estado de erro no lugar da grid (ver `errorMessage`/`onRetry`). */
  readonly isError?: boolean;
  /** Mensagem exibida quando `isError` for true. Default: "Erro ao carregar os dados." */
  readonly errorMessage?: ReactNode;
  /** Quando informado, exibe um botão "Tentar novamente" no estado de erro. */
  readonly onRetry?: () => void;
  /** Mensagem exibida quando a busca não retorna registros. Default: "Nenhum registro encontrado". */
  readonly emptyMessage?: ReactNode;
  readonly hasEventoAcao?: boolean;
  readonly lazy?: boolean;
  readonly paginator?: boolean;
  readonly metaKeySelection?: boolean;
  readonly rowsPerPage?: number[];
  readonly selected?: T[] | null;
  readonly selectionMode?: "multiple" | "checkbox" | "single" | null;
  readonly showSelectAll?: boolean;
  readonly handleSelectionChange?: (event: { value: T[] | null }) => void;
  readonly handleOnPageChange: (page: DataTableStateEvent) => void;
  readonly handleFilterChange?: (filterModel: DataTableStateEvent) => void;
  readonly onRowSelect?: (event: DataTableSelectEvent) => void;
  readonly onRowUnselect?: (event: DataTableUnselectEvent) => void;
  readonly handleDelete?: ((arg: T) => void) | null;
  /** Quando informado, decide por linha se o botão de excluir aparece. Sem ele, o botão aparece em todas as linhas quando `handleDelete` é informado. */
  readonly canDelete?: (arg: T) => boolean;
  readonly handleEdit?: ((arg: T) => void) | null;
  /** Quando informado, decide por linha se o botão de editar aparece. Sem ele, o botão aparece em todas as linhas quando `handleEdit` é informado. */
  readonly canEdit?: (arg: T) => boolean;
  readonly handleDuplicar?: ((arg: T) => void) | null;
  /** Quando informado, decide por linha se o botão de duplicar aparece. Sem ele, o botão aparece em todas as linhas quando `handleDuplicar` é informado. */
  readonly canDuplicar?: (arg: T) => boolean;
  readonly handleView?: ((arg: T) => void) | null;
  /** Quando informado, decide por linha se o botão de visualizar aparece. Sem ele, o botão aparece em todas as linhas quando `handleView` é informado. */
  readonly canView?: (arg: T) => boolean;
  readonly handleGerarOficio?: ((arg: T) => void) | null;
  /** Quando informado, decide por linha se o botão de gerar ofício aparece. Sem ele, o botão aparece em todas as linhas quando `handleGerarOficio` é informado. */
  readonly canGerarOficio?: (arg: T) => boolean;
  readonly handleHistorico?: ((arg: T) => void) | null;
  /** Quando informado, decide por linha se o botão de histórico aparece. Sem ele, o botão aparece em todas as linhas quando `handleHistorico` é informado. */
  readonly canHistorico?: (arg: T) => boolean;
  readonly handleAdicionar?: (() => void) | null;
  readonly disableAdicionar?: boolean;
  readonly botaoAdicionarProps?: BotaoSeplagProps;
  readonly allowExpansion?: boolean | ((data: T, options: ColumnBodyOptions) => boolean);
  readonly onRowToggle?: (event: DataTableRowToggleEvent) => void;
  readonly isDisabled?: boolean;
  readonly renderBotoes?: (data: T) => ReactNode;
  readonly extraAcoes?: (data: T) => { label: string; icon: string; command: () => void }[] | null;
  readonly acoesAlign?: TableAcoesAlignSeplag;
  readonly disableAcoesGrouping?: boolean;
  /** Quantidade mínima de ações (fixas + extraAcoes) para agrupar em dropdown. Default: 3. */
  readonly acoesGroupingThreshold?: number;
  readonly header?: DataTableHeaderTemplateType<T[]>;
  readonly footer?: DataTableFooterTemplateType<T[]>;
  readonly className?: string;
  readonly tableClassName?: string;
  readonly rowClassName?: DataTableProps<T[]>["rowClassName"];
  readonly columnWidth?: string;
  readonly columnHeaderWidth?: string;
  readonly tableMinWidth?: string;
  readonly deleteMessage?: ReactNode;
  readonly size?: "small" | "normal" | "large";
  readonly id?: string;
}

export interface TableGroupingSeplag<T> {
  readonly field: keyof T | string;
  readonly mode?: "subheader" | "rowspan";
  readonly headerTemplate?: (
    data: T,
    options: TableGroupHeaderTemplateOptionsSeplag<T>,
  ) => React.ReactNode;
  readonly footerTemplate?: (
    data: T,
    options: TableGroupFooterTemplateOptionsSeplag<T>,
  ) => React.ReactNode;
  readonly sortField?: keyof T | string;
  readonly sortOrder?: 1 | 0 | -1 | null;
  readonly expandable?: boolean;
}

export interface TableGroupHeaderTemplateOptionsSeplag<T> {
  readonly index: number;
  readonly props: unknown;
  readonly customRendering: boolean;
  readonly rowData?: T;
}

export interface TableGroupFooterTemplateOptionsSeplag<
  T,
> extends TableGroupHeaderTemplateOptionsSeplag<T> {
  readonly colSpan: number;
}

export interface ColumnMetaSeplag<T> {
  header: string;
  field?: string;
  body?: (data: T, options: ColumnBodyOptions) => React.ReactNode;
  selectionMode?: string;
  expander?: false;
  width?: string;
  headerWidth?: string;
  minWidth?: string;
  maxWidth?: string;
}

export function TablePaginadoSeplag<T extends DataTableValue>({
  dataKey = "id",
  data,
  rows,
  columns,
  isFetching = false,
  keepLastDataOnEmpty = true,
  isError = false,
  errorMessage = "Erro ao carregar os dados.",
  onRetry,
  emptyMessage = "Nenhum registro encontrado",
  hasEventoAcao = false,
  selectionMode = "single",
  showSelectAll = true,
  metaKeySelection = false,
  lazy = true,
  paginator = true,
  selected = null,
  rowsPerPage,
  handleOnPageChange,
  handleFilterChange,
  handleDelete,
  canDelete,
  handleEdit,
  canEdit,
  handleDuplicar,
  canDuplicar,
  handleView,
  canView,
  handleGerarOficio,
  canGerarOficio,
  handleHistorico,
  canHistorico,
  handleAdicionar,
  disableAdicionar,
  botaoAdicionarProps,
  handleSelectionChange,
  header,
  footer,
  className,
  tableClassName,
  rowClassName,
  onRowSelect,
  onRowUnselect,
  expandedRows,
  rowExpansionTemplate,
  grouping,
  allowExpansion,
  onRowToggle,
  isDisabled,
  renderBotoes,
  extraAcoes,
  acoesAlign,
  disableAcoesGrouping,
  acoesGroupingThreshold,
  columnWidth,
  columnHeaderWidth,
  tableMinWidth,
  deleteMessage,
  size = "small",
  id,
}: Readonly<TablePaginadoSeplagProps<T>>) {
  const [lastData, setLastData] = useState(data);
  if (data && data !== lastData) {
    setLastData(data);
  }
  const fallbackData = isFetching ? undefined : lastData;
  const displayData = keepLastDataOnEmpty ? (data ?? fallbackData) : data;

  const first = (displayData?.pageActual ?? 0) * rows;
  const groupingField = grouping?.field ? String(grouping.field) : undefined;
  const groupingSortField = grouping?.sortField ? String(grouping.sortField) : groupingField;

  const confirmacaoExclusao = useConfirmacaoExclusaoSeplag(handleDelete);

  const renderBotaoAdicionar = () => {
    if (!handleAdicionar) return null;

    return (
      <BotaoAdicionarSeplag
        id={id ? `${id}-adicionar` : undefined}
        data-testid={id ? `${id}-adicionar` : "table-paginado-adicionar"}
        {...botaoAdicionarProps}
        onClick={handleAdicionar}
        disabled={disableAdicionar || botaoAdicionarProps?.disabled}
      />
    );
  };

  function renderHeader() {
    return renderBotaoAdicionar();
  }

  function customHeader(hdr: DataTableHeaderTemplateType<T[]>) {
    if (!handleAdicionar) {
      return hdr;
    }

    return (
      <div style={{ display: "flex", alignItems: "center", columnGap: "5px", width: "100%" }}>
        {renderBotaoAdicionar()}
        {typeof hdr === "function" ? null : hdr}
      </div>
    );
  }

  const actionBotoes = (rowData: T, options: ColumnBodyOptions) => (
    <TableRowActionsSeplag
      rowId={options.rowIndex}
      rowData={rowData}
      handleView={handleView && (!canView || canView(rowData)) ? handleView : null}
      handleEdit={handleEdit && (!canEdit || canEdit(rowData)) ? handleEdit : null}
      handleDuplicar={
        handleDuplicar && (!canDuplicar || canDuplicar(rowData)) ? handleDuplicar : null
      }
      handleGerarOficio={
        handleGerarOficio && (!canGerarOficio || canGerarOficio(rowData)) ? handleGerarOficio : null
      }
      handleHistorico={
        handleHistorico && (!canHistorico || canHistorico(rowData)) ? handleHistorico : null
      }
      hasDelete={Boolean(handleDelete) && (canDelete ? canDelete(rowData) : true)}
      onExcluir={confirmacaoExclusao.abrir}
      renderBotoes={renderBotoes}
      extraAcoes={extraAcoes}
      align={acoesAlign}
      disableGrouping={disableAcoesGrouping}
      groupingThreshold={acoesGroupingThreshold}
    />
  );

  const errorState = (
    <div className={style.compTableErrorState}>
      <span>{errorMessage}</span>
      {onRetry && (
        <BotaoSeplag
          id="table-paginado-retry"
          data-testid="table-paginado-retry"
          type="button"
          onClick={onRetry}
        >
          Tentar novamente
        </BotaoSeplag>
      )}
    </div>
  );

  return (
    <div>
      <DataTable
        id={id}
        data-testid={id}
        className={className}
        tableClassName={tableClassName}
        rowClassName={rowClassName}
        dataKey={dataKey}
        value={isError ? [] : displayData?.content}
        totalRecords={isError ? 0 : displayData?.totalRecords}
        tableStyle={{ minWidth: tableMinWidth ?? "50rem" }}
        rowsPerPageOptions={rowsPerPage}
        loading={isFetching}
        rows={rows}
        size={size}
        cellMemo={handleSelectionChange ? false : undefined}
        loadingIcon={<LoaderIcon />}
        paginator={paginator && !isError}
        lazy={lazy}
        selectionPageOnly
        first={first}
        showGridlines
        stripedRows
        header={header ? customHeader(header) : renderHeader()}
        footer={footer}
        metaKeySelection={metaKeySelection}
        emptyMessage={isError ? errorState : emptyMessage}
        onFilter={handleFilterChange}
        onPage={handleOnPageChange}
        onRowSelect={isDisabled ? undefined : onRowSelect}
        onRowUnselect={onRowUnselect}
        expandedRows={expandedRows}
        onSelectionChange={isDisabled ? undefined : handleSelectionChange}
        rowExpansionTemplate={rowExpansionTemplate}
        onRowToggle={onRowToggle}
        selectionMode={selectionMode as any}
        selection={selected as any}
        showSelectAll={showSelectAll}
        rowGroupMode={grouping?.mode}
        groupRowsBy={groupingField}
        sortField={groupingSortField}
        sortOrder={grouping ? (grouping.sortOrder ?? 1) : undefined}
        rowGroupHeaderTemplate={
          grouping?.headerTemplate as DataTableRowGroupHeaderTemplateType<T[]> | undefined
        }
        rowGroupFooterTemplate={
          grouping?.footerTemplate as DataTableRowGroupFooterTemplateType<T[]> | undefined
        }
        expandableRowGroups={grouping?.expandable}
        pt={{
          bodyRow: (options: { context: { index: number } }) => ({
            id: id ? `${id}-row-${options.context.index}` : `row-${options.context.index}`,
            "data-testid": id
              ? `${id}-row-${options.context.index}`
              : `row-${options.context.index}`,
          }),
        }}
      >
        {selectionMode === "multiple" && !isDisabled && (
          <Column
            key="col-selection"
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>
        )}
        {allowExpansion && (
          <Column key="col-expander" expander={allowExpansion} style={{ width: "5rem" }} />
        )}
        {columns.map((col, i) => {
          const isColunaAcoes = col.header === "Ações";

          return (
            <Column
              key={`col-${col.field ?? col.header ?? ""}-${i}`}
              field={col.field}
              header={col.header}
              bodyStyle={
                isColunaAcoes
                  ? { wordBreak: "break-all", textAlign: acoesAlign ?? "right" }
                  : { wordBreak: "break-all" }
              }
              body={col.body}
              style={{
                width: col.width ?? (isColunaAcoes ? "1%" : columnWidth),
                minWidth: col.minWidth,
                maxWidth: col.maxWidth,
                whiteSpace: isColunaAcoes ? "nowrap" : undefined,
              }}
              headerStyle={{
                width: col.headerWidth ?? (isColunaAcoes ? "1%" : columnHeaderWidth),
                minWidth: col.minWidth,
                maxWidth: col.maxWidth,
                whiteSpace: isColunaAcoes ? "nowrap" : undefined,
              }}
            />
          );
        })}
        {hasEventoAcao && (
          <Column
            key="col-acoes"
            header="Ações"
            body={actionBotoes}
            style={{ width: "1%", whiteSpace: "nowrap" }}
            headerStyle={{ width: "1%", whiteSpace: "nowrap" }}
            bodyStyle={{ textAlign: acoesAlign ?? "right" }}
            headerClassName={`text-${acoesAlign ?? "right"}`}
          />
        )}
      </DataTable>

      <ModalDeleteSeplag
        id={id ? `${id}-delete-modal` : undefined}
        visible={confirmacaoExclusao.visible}
        message={deleteMessage}
        onCancel={confirmacaoExclusao.cancelar}
        onConfirm={confirmacaoExclusao.confirmar}
      />
    </div>
  );
}

function LoaderIcon() {
  return (
    <div className={style.rotate}>
      <img src={loadingIcon} width={80} alt="Carregando..." />
    </div>
  );
}

export default TablePaginadoSeplag;
