import { useState, type ReactNode } from "react";

export interface ListaArrastavelSeplagProps<T> {
  readonly items: readonly T[];
  readonly getKey: (item: T) => string;
  readonly onReordenar: (indiceOrigem: number, indiceDestino: number) => void;
  readonly renderItem: (item: T, indice: number) => ReactNode;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly emptyMessage?: ReactNode;
  readonly maxHeight?: string;
}

export function ListaArrastavelSeplag<T>({
  items,
  getKey,
  onReordenar,
  renderItem,
  disabled,
  ariaLabel,
  emptyMessage = "Nenhum item adicionado.",
  maxHeight,
}: Readonly<ListaArrastavelSeplagProps<T>>) {
  const [indiceArrastado, setIndiceArrastado] = useState<number | null>(null);
  const [indiceSobreposto, setIndiceSobreposto] = useState<number | null>(null);

  if (!items.length) {
    return (
      <div className="text-color-secondary p-3 text-center">{emptyMessage}</div>
    );
  }

  return (
    <ul
      aria-label={ariaLabel}
      className="flex flex-column list-none m-0 p-0"
      style={{
        border: "1px solid var(--surface-border, #e5e7eb)",
        borderRadius: "8px",
        overflowY: maxHeight ? "auto" : "hidden",
        overflowX: "hidden",
        maxHeight,
      }}
    >
      {items.map((item, indice) => {
        const corLinhaAlternada =
          indice % 2 === 1 ? "var(--surface-50, #fafafa)" : "transparent";
        const background =
          indiceSobreposto === indice
            ? "var(--primary-50, #eff6ff)"
            : corLinhaAlternada;

        return (
          <li
            key={getKey(item)}
            draggable={!disabled}
            onDragStart={() => setIndiceArrastado(indice)}
            onDragOver={(event) => {
              event.preventDefault();
              if (indiceSobreposto !== indice) setIndiceSobreposto(indice);
            }}
            onDragLeave={() => {
              setIndiceSobreposto((atual) => (atual === indice ? null : atual));
            }}
            onDrop={() => {
              if (indiceArrastado !== null && indiceArrastado !== indice) {
                onReordenar(indiceArrastado, indice);
              }
              setIndiceArrastado(null);
              setIndiceSobreposto(null);
            }}
            onDragEnd={() => {
              setIndiceArrastado(null);
              setIndiceSobreposto(null);
            }}
            className="flex align-items-start gap-2 px-3 py-2"
            style={{
              opacity: indiceArrastado === indice ? 0.4 : 1,
              background,
              borderTop:
                indice > 0
                  ? "1px solid var(--surface-border, #e5e7eb)"
                  : undefined,
              transition: "background-color 0.15s ease",
            }}
          >
            {!disabled && (
              <i
                className="pi pi-bars text-color-secondary"
                aria-hidden="true"
                title="Arraste para reordenar"
                style={{ cursor: "grab", fontSize: "1rem", marginTop: "1.9rem" }}
              />
            )}
            <div className="flex-1">{renderItem(item, indice)}</div>
          </li>
        );
      })}
    </ul>
  );
}
