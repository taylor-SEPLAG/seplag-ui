import style from "./Table.module.css";
import "./TableGlobal.css";
import loadingIcon from "../../assets/img/Logo_Branco_Estado_MT.png";
import { SplitButton } from "primereact/splitbutton";
import type { ResultsSeplag } from "../../interfaces/Results";
import { ModalDeleteSeplag } from "@componentes/ModalDelete";
import { BotaoAdicionarSeplag, BotaoIconSeplag } from "@componentes/Botao";
import { useState, type ReactNode } from "react";
import {
  DataTable,
  type DataTableExpandedRows,
  type DataTableHeaderTemplateType,
  type DataTableRowExpansionTemplate,
  type DataTableRowReorderEvent,
  type DataTableRowToggleEvent,
  type DataTableSelectEvent,
  type DataTableStateEvent,
  type DataTableUnselectEvent,
  type DataTableValue,
  type DataTableValueArray,
} from "primereact/datatable";
import { Column } from "primereact/column";
import type { ColumnBodyOptions } from "primereact/column";

export interface TablePaginadoSeplagProps<T extends DataTableValue> {
  readonly dataKey?: string;
  readonly data: ResultsSeplag<T> | undefined;
  readonly expandedRows?: DataTableExpandedRows | DataTableValueArray;
  rowExpansionTemplate?: (
    data: T,
    options: DataTableRowExpansionTemplate,
  ) => React.ReactNode;

  readonly rows: number;
  readonly columns: ColumnMetaSeplag<T>[];
  readonly isFetching?: boolean;
  readonly hasEventoAcao?: boolean;
  readonly lazy?: boolean;
  readonly paginator?: boolean;
  readonly metaKeySelection?: boolean;
  readonly rowsPerPage?: number[];
  readonly selected?: T[] | null;
  readonly selectionMode?: "multiple" | "checkbox" | "single" | null;
  readonly handleSelectionChange?: (event: { value: T[] | null }) => void;
  readonly handleOnPageChange: (page: DataTableStateEvent) => void;
  readonly handleFilterChange?: (filterModel: DataTableStateEvent) => void;
  readonly onRowSelect?: (event: DataTableSelectEvent) => void;
  readonly onRowUnselect?: (event: DataTableUnselectEvent) => void;
  readonly handleDelete?: ((arg: T) => void) | null;
  readonly handleEdit?: ((arg: T) => void) | null;
  readonly handleDuplicar?: ((arg: T) => void) | null;
  readonly handleView?: ((arg: T) => void) | null;
  readonly handleAdicionar?: (() => void) | null;
  readonly disableAdicionar?: boolean;
  readonly expanderPosition?: "start" | "end";
  readonly collapsedRowIcon?: string;
  readonly expandedRowIcon?: string;
  readonly allowExpansion?:
    | boolean
    | ((data: T, options: ColumnBodyOptions) => boolean);
  readonly onRowToggle?: (event: DataTableRowToggleEvent) => void;
  readonly isDisabled?: boolean;
  readonly renderBotoes?: (data: T) => ReactNode;
  readonly actionHeader?: ReactNode;
  readonly renderExpander?: (data: T) => ReactNode;
  readonly header?: DataTableHeaderTemplateType<T[]>;
  /** Exibe a alça de arrastar e habilita reordenar linhas com o mouse. */
  readonly reorderableRows?: boolean;
  readonly onRowReorder?: (novaOrdem: T[]) => void;
}
export interface ColumnMetaSeplag<T> {
  header: ReactNode;
  sortable?: boolean;
  field?: string;
  body?: (data: T, options: ColumnBodyOptions) => React.ReactNode;
  selectionMode?: string;
  expander?: false;
}

export function TablePaginadoSeplag<T extends DataTableValue>({
  dataKey = "id",
  data,
  rows,
  columns,
  isFetching = false,
  hasEventoAcao = false,
  selectionMode = "single",
  metaKeySelection = false,
  lazy = true,
  paginator = true,
  selected = null,
  rowsPerPage,
  handleOnPageChange,
  handleFilterChange,
  handleDelete,
  handleEdit,
  handleDuplicar,
  handleView,
  handleAdicionar,
  disableAdicionar,
  handleSelectionChange,
  header,
  onRowSelect,
  onRowUnselect,
  expandedRows,
  rowExpansionTemplate,
  allowExpansion,
  expanderPosition = "start",
  collapsedRowIcon,
  expandedRowIcon,
  onRowToggle,
  isDisabled,
  renderBotoes,
  actionHeader = "Ações",
  renderExpander,
  reorderableRows = false,
  onRowReorder,
}: Readonly<TablePaginadoSeplagProps<T>>) {
  const first = (data?.pageActual ?? 0) * rows;

  const [visibleConfirmExcluir, setVisibleConfirmExcluir] = useState(false);
  const [selectedConfirmExclusao, setSelectedConfirmExclusao] = useState<T>();

  const handleAbrirConfirmacaoExclusao = (rowData: T) => {
    setSelectedConfirmExclusao(rowData);
    setVisibleConfirmExcluir(true);
  };

  const renderBotaoAdicionar = () => {
    if (!handleAdicionar) return null;

    return (
      <BotaoAdicionarSeplag
        onClick={handleAdicionar}
        disabled={disableAdicionar}
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
      <div style={{ display: "flex", columnGap: "5px" }}>
        {renderBotaoAdicionar()}
        {typeof hdr === "function" ? null : hdr}
      </div>
    );
  }

  const actionBotoes = (rowData: T) => {
    const individualCount = [
      handleView,
      handleEdit,
      handleDelete,
      handleDuplicar,
    ].filter(Boolean).length;

    if (individualCount >= 3) {
      const splitModel = [] as any[];
      if (handleEdit)
        splitModel.push({
          label: "Editar",
          icon: "pi pi-pencil",
          command: () => handleEdit(rowData),
        });
      if (handleDuplicar)
        splitModel.push({
          label: "Duplicar",
          icon: "pi pi-copy",
          command: () => handleDuplicar(rowData),
        });
      if (handleDelete)
        splitModel.push({
          label: "Excluir",
          icon: "pi pi-trash",
          command: () => handleAbrirConfirmacaoExclusao(rowData),
        });

      return (
        <SplitButton
          icon="pi pi-eye"
          onClick={() => handleView?.(rowData)}
          model={splitModel}
        />
      );
    }

    return (
      <div className={style.compTableDivButtons}>
        {handleView && (
          <BotaoIconSeplag
            type="button"
            tooltip="Visualizar"
            icon="pi pi-eye"
            onClick={() => handleView(rowData)}
          />
        )}
        {handleEdit && (
          <BotaoIconSeplag
            severity="warning"
            type="button"
            tooltip="Editar"
            icon="pi pi-pencil"
            onClick={() => handleEdit(rowData)}
          />
        )}
        {handleDuplicar && (
          <BotaoIconSeplag
            type="button"
            tooltip="Duplicar"
            icon="pi pi-copy"
            onClick={() => handleDuplicar(rowData)}
          />
        )}
        {handleDelete && (
          <BotaoIconSeplag
            severity="danger"
            type="button"
            tooltip="Excluir"
            icon="pi pi-trash"
            onClick={() => handleAbrirConfirmacaoExclusao(rowData)}
          />
        )}
        {renderBotoes?.(rowData)}
      </div>
    );
  };

  const confirmarExclusao = () => {
    setVisibleConfirmExcluir(false);

    if (!selectedConfirmExclusao) return;

    handleDelete?.(selectedConfirmExclusao);
  };

  return (
    <div>
      <DataTable
        dataKey={dataKey}
        value={data?.content}
        totalRecords={data?.totalRecords}
        tableStyle={{ minWidth: "50rem", width: "100%" }}
        rowsPerPageOptions={rowsPerPage}
        loading={isFetching}
        rows={rows}
        loadingIcon={<LoaderIcon />}
        paginator={paginator}
        lazy={lazy}
        selectionPageOnly
        first={first}
        showGridlines
        stripedRows
        header={header ? customHeader(header) : renderHeader()}
        metaKeySelection={metaKeySelection}
        emptyMessage="Nenhum registro encontrado"
        onFilter={handleFilterChange}
        onPage={handleOnPageChange}
        onRowSelect={isDisabled ? undefined : onRowSelect}
        onRowUnselect={onRowUnselect}
        expandedRows={expandedRows}
        collapsedRowIcon={collapsedRowIcon}
        expandedRowIcon={expandedRowIcon}
        onSelectionChange={isDisabled ? undefined : handleSelectionChange}
        rowExpansionTemplate={rowExpansionTemplate}
        onRowToggle={onRowToggle}
        selectionMode={selectionMode as any}
        selection={selected as any}
        reorderableRows={reorderableRows}
        onRowReorder={(event: DataTableRowReorderEvent<any>) => onRowReorder?.(event.value as T[])}
      >
        {reorderableRows && (
          <Column key="col-reorder" rowReorder style={{ width: "3rem" }} />
        )}
        {selectionMode === "multiple" && !isDisabled && (
          <Column
            key="col-selection"
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>
        )}
        {allowExpansion && expanderPosition === "start" && (
          <Column
            key="col-expander"
            expander={allowExpansion}
            style={{ width: "3rem" }}
          />
        )}
        {columns.map((col, i) => (
          <Column
            key={
              col.field ||
              (typeof col.header === "string" ? col.header : undefined) ||
              i
            }
            field={col.field}
            header={col.header}
            bodyStyle={{ wordBreak: "break-all" }}
            body={col.body}
            sortable={col.sortable}
          />
        ))}
        {hasEventoAcao && (
          <Column key="col-acoes" header={actionHeader} body={actionBotoes} />
        )}
        {renderExpander && (
          <Column
            key="col-expander-custom"
            header=""
            body={renderExpander}
            style={{ width: "3rem" }}
          />
        )}
        {allowExpansion && expanderPosition === "end" && (
          <Column
            key="col-expander-end"
            expander={allowExpansion}
            style={{ width: "3rem" }}
          />
        )}
      </DataTable>

      <ModalDeleteSeplag
        visible={visibleConfirmExcluir}
        onCancel={() => setVisibleConfirmExcluir(false)}
        onConfirm={confirmarExclusao}
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
