import type { CSSProperties, ReactNode } from "react";

export interface ColumnMetaListaSimplesSeplag<T> {
  header?: ReactNode;
  field?: keyof T & string;
  body?: (item: T) => ReactNode;
  width?: string;
}

export type ListaSimplesSeplagProps<T> = {
  id?: string;
  items: readonly T[];
  getKey: (item: T) => string | number;
  renderItem?: (item: T) => ReactNode;
  columns?: ColumnMetaListaSimplesSeplag<T>[];
  showHeader?: boolean;
  emptyMessage?: string;
  minHeight?: string;
  maxHeight?: string;
  style?: CSSProperties;
  itemStyle?: CSSProperties;
};

function getColumnValue<T>(item: T, column: ColumnMetaListaSimplesSeplag<T>): ReactNode {
  if (column.body) return column.body(item);
  if (column.field) return item[column.field] as ReactNode;
  return null;
}

export function ListaSimplesSeplag<T>({
  id = "lista-simples",
  items,
  getKey,
  renderItem,
  columns,
  showHeader = true,
  emptyMessage = "Nenhum registro encontrado.",
  minHeight,
  maxHeight = "16rem",
  style,
  itemStyle,
}: Readonly<ListaSimplesSeplagProps<T>>) {
  const gridTemplateColumns = columns
    ? columns.map((column) => column.width ?? "1fr").join(" ")
    : undefined;

  return (
    <div
      id={id}
      data-testid={id}
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid var(--surface-border)",
        borderRadius: "6px",
        ...style,
      }}
    >
      {columns && showHeader && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns,
            columnGap: "0.75rem",
            padding: "0.75rem",
            fontWeight: 600,
            borderBottom: "1px solid var(--surface-border)",
          }}
        >
          {columns.map((column, index) => (
            <div key={column.field ?? index}>{column.header}</div>
          ))}
        </div>
      )}

      <div
        style={{
          minHeight,
          maxHeight,
          overflowY: "auto",
        }}
      >
        {items.length === 0 ? (
          <div style={{ padding: "0.75rem" }}>
            <span>{emptyMessage}</span>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={getKey(item)}
              id={`${id}-item-${getKey(item)}`}
              data-testid={`${id}-item-${getKey(item)}`}
              style={{
                display: columns ? "grid" : "block",
                gridTemplateColumns,
                columnGap: "0.75rem",
                padding: "0.75rem",
                boxSizing: "border-box",
                borderTop: index > 0 ? "1px solid var(--surface-border)" : "none",
                ...itemStyle,
              }}
            >
              {columns
                ? columns.map((column, columnIndex) => (
                    <div key={column.field ?? columnIndex}>{getColumnValue(item, column)}</div>
                  ))
                : renderItem?.(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ListaSimplesSeplag;
