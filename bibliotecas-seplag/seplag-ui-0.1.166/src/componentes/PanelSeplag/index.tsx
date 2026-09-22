import { forwardRef, type ReactNode } from "react";
import gridCss from "../../uteis/Grid";

/**
 * Props do componente PanelSeplag
 */
export interface PanelSeplagProps {
  /** Coluna(s) do grid responsivo. Aceita 1 a 3 valores: "col" | "col md:col" | "col md:col lg:col" */
  cols?: string;

  /** Título exibido no cabeçalho do painel */
  title?: string;

  /** Descrição exibida abaixo do título */
  description?: string;

  /** Espaçamento entre os filhos. Mapeia para gap-{n} do PrimeFlex */
  gap?: string;

  /** Classes CSS adicionais no contêiner principal */
  className?: string;

  /** Classes CSS adicionais na área do cabeçalho */
  classNameHeader?: string;

  /** Identificador HTML do elemento raiz */
  id?: string;

  /** Classe CSS do ícone (ex: "pi pi-user") */
  icon?: string;

  /** Classes CSS adicionais para estilizar o ícone */
  iconClassName?: string;

  /** Posição do ícone em relação ao título */
  iconPosition?: "left" | "right";

  /** Conteúdo interno do painel */
  children?: ReactNode;

  /** Rótulo ARIA para acessibilidade (se omitido, usa title) */
  ariaLabel?: string;

  /**
   * Conteúdo alinhado à direita do cabeçalho, empurrado por `ml-auto`.
   * Use para contadores, totalizadores (`ResumoValoresSeplag`) ou um botão de ação.
   * Sozinho já é suficiente para o cabeçalho ser renderizado, mesmo sem `title`.
   */
  trailing?: ReactNode;

  /**
   * Aparência do cabeçalho.
   *
   * - `"plain"` (padrão) — cabeçalho sem fundo, no mesmo bloco do conteúdo.
   * - `"filled"` — faixa tintada de borda a borda, separada do conteúdo por uma linha.
   *   Nesse modo o padding sai do contêiner e passa para o cabeçalho e o conteúdo, para a
   *   faixa encostar nas bordas; `gap` deixa de ter efeito.
   *
   * @default "plain"
   */
  headerVariant?: "plain" | "filled";
}

const PanelSeplag = forwardRef<HTMLDivElement, PanelSeplagProps>(
  (
    {
      cols,
      title,
      description,
      gap,
      className,
      classNameHeader,
      id,
      icon,
      iconClassName,
      iconPosition = "left",
      children,
      ariaLabel,
      trailing,
      headerVariant = "plain",
    },
    ref,
  ) => {
    const gapClass = gap ? `gap-${gap}` : "gap-2";
    const hasHeader = title || description || icon || trailing;
    const isFilled = headerVariant === "filled" && Boolean(hasHeader);

    // Determina o aria-label para acessibilidade
    const computedAriaLabel = ariaLabel || title;

    // No modo filled a faixa precisa encostar nas bordas: o padding sai do contêiner e passa
    // para o cabeçalho e o conteúdo. `overflow-hidden` faz o arredondamento do contêiner
    // recortar os cantos da faixa.
    const containerClass = isFilled
      ? `flex flex-column border-1 border-300 border-round-sm overflow-hidden ${className ?? ""}`
      : `flex flex-column border-1 border-300 border-round-sm p-2 ${gapClass} ${className ?? ""}`;

    const headerClass = isFilled
      ? `flex align-items-center gap-2 p-3 surface-50 border-bottom-1 border-300 ${classNameHeader ?? ""}`
      : `flex align-items-center gap-2 ${classNameHeader ?? ""}`;

    // Renderiza o conteúdo do header
    const headerContent = (title || description) && (
      <div className="flex flex-column">
        {title && <strong className="label-rotulo label-destaque">{title}</strong>}
        {description && <span className="text-sm">{description}</span>}
      </div>
    );

    // Renderiza o ícone uma única vez (reutilizável)
    const iconElement = icon && (
      <i className={`${icon} ${iconClassName ?? ""}`} aria-hidden="true" />
    );

    return (
      <section
        ref={ref}
        id={id}
        data-testid={id}
        className={gridCss(cols ?? "12")}
        // `trailing` sozinho não é rótulo visível: a condição de aria-label continua sendo
        // a presença de title/description/icon, como antes de `trailing` existir.
        aria-label={title || description || icon ? undefined : computedAriaLabel}
      >
        <div className={containerClass}>
          {hasHeader && (
            <header className={headerClass} data-testid={id ? `${id}-header` : undefined}>
              {iconPosition === "left" && iconElement && (
                <span className="flex align-items-center flex-shrink-0">{iconElement}</span>
              )}
              {headerContent}
              {iconPosition === "right" && iconElement && (
                <span className="flex align-items-center flex-shrink-0 margin-left-auto">
                  {iconElement}
                </span>
              )}
              {trailing && (
                <div
                  className="ml-auto flex-shrink-0"
                  data-testid={id ? `${id}-trailing` : undefined}
                >
                  {trailing}
                </div>
              )}
            </header>
          )}
          {children && (
            <div
              className={isFilled ? "p-3" : undefined}
              data-testid={id ? `${id}-content` : undefined}
            >
              {children}
            </div>
          )}
        </div>
      </section>
    );
  },
);

PanelSeplag.displayName = "PanelSeplag";

export { PanelSeplag };
