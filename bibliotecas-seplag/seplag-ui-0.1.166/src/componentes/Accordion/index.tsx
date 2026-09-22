import { BotaoSeplag } from "@componentes/Botao";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { DataTableStateEvent } from "primereact/datatable";
import { useMemo, useState, type ReactNode } from "react";
import type { ResultsSeplag } from "../../interfaces";
import style from "./Accordion.module.css";

export interface AccordionItemSeplag<T> {
  id: string | number;
  headerTitle: string;
  headerSubtitle?: string;
  items: T[];
}

export interface AccordionSeplagProps<T, G extends AccordionItemSeplag<T>, S = T> {
  readonly data: ResultsSeplag<S> | undefined;
  readonly rows: number;
  readonly rowsPerPage: number[];
  readonly isFetching: boolean;
  readonly groupBy: (items: S[]) => G[];
  readonly renderExpansion: (group: G) => ReactNode;
  readonly handleOnPageChange: (page: DataTableStateEvent) => void;
  readonly handleAdicionar?: ((group?: G) => void) | null;
  readonly addButtonLabel?: string;
  readonly dataKey: keyof G;
}

export function AccordionSeplag<T, G extends AccordionItemSeplag<T>, S = T>({
  data,
  rows,
  rowsPerPage,
  isFetching,
  groupBy,
  renderExpansion,
  handleOnPageChange,
  handleAdicionar,
  addButtonLabel = "Adicionar",
  dataKey,
}: AccordionSeplagProps<T, G, S>) {
  const [expandedRows, setExpandedRows] = useState<any>(null);

  // Agrupar dados
  const content = useMemo(() => data?.content ?? [], [data?.content]);

  const gruposAgrupados = useMemo(() => groupBy(content), [content, groupBy]);

  const toggleRow = (grupo: G) => {
    const key = String((grupo as any)[dataKey]);
    setExpandedRows((prev: any) => (prev?.[key] ? null : { [key]: true }));
  };

  const gridHeaderTemplate = (grupo: G) => {
    const key = String((grupo as any)[dataKey]);
    const isExpanded = expandedRows ? expandedRows[key] : false;
    const testId = (suffix: string) => `accordion-${key}-${suffix}`;

    return (
      <div
        className="flex align-items-center justify-content-between w-full border-round p-2 transition-colors relative"
        style={{
          background: "transparent",
          cursor: "default",
        }}
      >
        <BotaoSeplag
          unstyled
          type="button"
          id={testId("header")}
          data-testid={testId("header")}
          onClick={() => toggleRow(grupo)}
          className={`flex-grow-1 flex align-items-center text-left border-none bg-transparent p-0 m-0 cursor-pointer ${style.noRipple}`}
          style={{ outline: "none", color: "inherit" }}
          aria-expanded={isExpanded}
        >
          <div className="text-800">
            <span
              className={`${isExpanded ? "font-bold" : ""} uppercase text-lg`}
              style={{ letterSpacing: "0.05em" }}
            >
              {grupo.headerTitle}
            </span>
            {grupo.headerSubtitle && (
              <span className={`ml-3 ${isExpanded ? "font-bold" : ""} text-600`}>
                {grupo.headerSubtitle}
              </span>
            )}
          </div>
        </BotaoSeplag>

        <div className="flex align-items-center gap-2" style={{ zIndex: 2 }}>
          {handleAdicionar && (
            <BotaoSeplag
              type="button"
              id={testId("adicionar")}
              label={addButtonLabel}
              icon="pi pi-plus"
              className="p-button-sm p-button-info"
              data-testid={testId("adicionar")}
              onClick={(e) => {
                e.stopPropagation();
                handleAdicionar(grupo);
              }}
            />
          )}

          <BotaoSeplag
            type="button"
            id={testId("toggle")}
            icon={isExpanded ? "pi pi-chevron-up" : "pi pi-chevron-down"}
            className="p-button-rounded p-button-text p-button-plain"
            data-testid={testId("toggle")}
            onClick={() => toggleRow(grupo)}
            aria-label="Expandir"
            size="small"
            style={{
              width: "1rem",
              height: "1.8rem",
              padding: 0,
              display: "flex",
              alignItems: "center",
              minWidth: "50px",
              justifyContent: "center",
            }}
          />
        </div>
      </div>
    );
  };

  const columns: ColumnMetaSeplag<G>[] = [
    {
      header: "",
      field: dataKey as string,
      body: gridHeaderTemplate,
    },
  ];

  const gruposResults: ResultsSeplag<G> = useMemo(
    () => ({
      content: gruposAgrupados,
      totalRecords: data?.totalRecords || 0,
      size: gruposAgrupados.length,
      number: data?.number || 0,
      totalPages: data?.totalPages || 0,
      numberOfElements: gruposAgrupados.length,
      first: data?.first ?? true,
      last: data?.last ?? true,
      empty: gruposAgrupados.length === 0,
      pageActual: data?.number || 0,
      sizePage: data?.size || 0,
    }),
    [gruposAgrupados, data],
  );

  return (
    <div className="col-12">
      <TablePaginadoSeplag<G>
        data={gruposResults}
        columns={columns}
        isFetching={isFetching}
        handleOnPageChange={handleOnPageChange}
        rows={rows}
        rowsPerPage={rowsPerPage}
        allowExpansion={false}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={renderExpansion}
        dataKey={dataKey as string}
      />
    </div>
  );
}
