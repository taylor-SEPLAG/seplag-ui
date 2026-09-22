import { BotaoSeplag } from "../Botao";
import type { CSSProperties, ReactNode } from "react";

export type ListaBuscaAcaoSeplagProps<T> = {
  items: readonly T[];
  getKey: (item: T) => string | number;
  getTitle: (item: T) => ReactNode;
  getDescription?: (item: T) => ReactNode;
  onAction: (item: T) => void;
  renderAction?: (item: T, action: (item: T) => void) => ReactNode;
  actionLabel?: string;
  emptyMessage?: string;
  maxHeight?: string;
  maxItems?: number;
  style?: CSSProperties;
  itemStyle?: CSSProperties;
  keepInfoInOneLine?: boolean;
};

export function ListaBuscaAcaoSeplag<T>({
  items,
  getKey,
  getTitle,
  getDescription,
  onAction,
  renderAction,
  actionLabel = "Adicionar",
  emptyMessage = "Nenhum resultado encontrado.",
  maxHeight = "12rem",
  maxItems,
  style,
  itemStyle,
  keepInfoInOneLine = false,
}: Readonly<ListaBuscaAcaoSeplagProps<T>>) {
  const displayedItems =
    typeof maxItems === "number" ? items.slice(0, Math.max(0, maxItems)) : items;

  return (
    <div
      style={{
        marginTop: "0.5rem",
        width: "100%",
        boxSizing: "border-box",
        maxHeight,
        overflowY: "auto",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        background: "#fff",
        ...style,
      }}
    >
      {displayedItems.length === 0 ? (
        <p
          style={{
            margin: 0,
            padding: "0.5rem 0.75rem",
            fontSize: "0.8rem",
            color: "#64748b",
          }}
        >
          {emptyMessage}
        </p>
      ) : (
        displayedItems.map((item, index) => {
          const itemKey = getKey(item);
          const itemTestId = `lista-busca-acao-${itemKey}`;

          return (
          <div
            key={itemKey}
            id={itemTestId}
            data-testid={itemTestId}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              alignItems: "center",
              columnGap: "0.75rem",
              padding: "0.5rem 0.75rem",
              borderBottom: index === displayedItems.length - 1 ? "none" : "1px solid #f1f5f9",
              ...itemStyle,
            }}
          >
            <div
              style={{
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "0.1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#0f172a",
                  whiteSpace: keepInfoInOneLine ? "nowrap" : "normal",
                  overflow: keepInfoInOneLine ? "hidden" : "visible",
                  textOverflow: keepInfoInOneLine ? "ellipsis" : "clip",
                  lineHeight: "1.2rem",
                }}
              >
                {getTitle(item)}
              </div>
              {getDescription ? (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    whiteSpace: keepInfoInOneLine ? "nowrap" : "normal",
                    overflow: keepInfoInOneLine ? "hidden" : "visible",
                    textOverflow: keepInfoInOneLine ? "ellipsis" : "clip",
                    lineHeight: "1.15rem",
                  }}
                >
                  {getDescription(item)}
                </div>
              ) : null}
            </div>

            {renderAction ? (
              renderAction(item, onAction)
            ) : (
              <BotaoSeplag
                id={`${itemTestId}-acao`}
                data-testid={`${itemTestId}-acao`}
                label={actionLabel}
                type="button"
                onClick={() => onAction(item)}
                outlined
                style={{
                  width: "auto",
                  minWidth: "92px",
                  height: "34px",
                  fontSize: "0.8rem",
                  borderRadius: "6px",
                  padding: "0.25rem 0.85rem",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  color: "#030213",
                  background: "#fff",
                  flex: "0 0 auto",
                  margin: 0,
                }}
              />
            )}
          </div>
          );
        })
      )}
    </div>
  );
}

export default ListaBuscaAcaoSeplag;
