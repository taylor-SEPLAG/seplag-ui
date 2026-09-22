import { StatusCardSeplag, type StatusCardSeplagProps } from "../StatusCardSeplag";

export interface StatusCardGroupSeplagProps {
  readonly cards: (Omit<StatusCardSeplagProps, "cols" | "fill"> & { key?: string })[];
  /** Largura mínima de cada card antes de quebrar para a próxima linha. Default 190. */
  readonly minCardWidth?: number;
  /** Altura mínima aplicada a todos os cards do grupo. Default: "6.6rem" (definido em StatusCardSeplag). */
  readonly minCardHeight?: string;
  /** "sm" reduz padding e ícone de todos os cards do grupo, para telas com pouco espaço vertical. Default: "md". */
  readonly size?: "sm" | "md";
  readonly className?: string;
  readonly id?: string;
  readonly "data-testid"?: string;
}

/**
 * Distribui N StatusCardSeplag em largura igual, preenchendo 100% do
 * container — sem o item órfão da última linha esticar sozinho, problema
 * do flexbox com `flex-grow` quando N não é múltiplo do número de colunas.
 * Usa CSS Grid `repeat(auto-fill, minmax(...))`: cada célula tem a mesma
 * largura, e a última linha incompleta fica com espaço vazio em vez de
 * esticar um card.
 */
export function StatusCardGroupSeplag({
  cards,
  minCardWidth = 190,
  minCardHeight,
  size,
  className,
  id,
  "data-testid": dataTestId,
}: Readonly<StatusCardGroupSeplagProps>) {
  return (
    <div
      id={id}
      data-testid={dataTestId ?? id}
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
        gap: "0.75rem",
      }}
    >
      {cards.map(({ key, ...card }) => (
        <StatusCardSeplag
          key={key ?? card.id}
          {...card}
          fill
          minHeight={minCardHeight ?? card.minHeight}
          size={size ?? card.size}
        />
      ))}
    </div>
  );
}

export default StatusCardGroupSeplag;
