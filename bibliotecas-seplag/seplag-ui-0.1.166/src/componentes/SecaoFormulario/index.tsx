import { forwardRef, type ReactNode } from "react";
import gridCss from "../../uteis/Grid";
import styles from "./SecaoFormulario.module.css";

/**
 * Props do componente SecaoFormularioSeplag
 */
export interface SecaoFormularioSeplagProps {
  /** Coluna(s) do grid responsivo. Aceita 1 a 3 valores: "col" | "col md:col" | "col md:col lg:col" */
  cols?: string;

  /** Título exibido no cabeçalho da seção */
  title?: string;

  /** Texto de apoio exibido abaixo do título */
  description?: string;

  /** Classe CSS do ícone (ex.: "pi pi-briefcase"), exibido dentro do badge */
  icon?: string;

  /** Substitui o badge padrão por um nó próprio (ex.: um SVG) */
  iconElement?: ReactNode;

  /** Conteúdo à direita do cabeçalho (ex.: um badge de situação) */
  headerRight?: ReactNode;

  /** Remove o padding interno da área de conteúdo */
  noPadding?: boolean;

  /** Aplica cor de fundo ao cabeçalho. Desativado por padrão. */
  corDeFundoHeaderAtiva?: boolean;

  /** Cor de fundo do cabeçalho quando `corDeFundoHeaderAtiva` é `true`. Padrão: `var(--primary-50)`, a mesma do badge do ícone. */
  corDeFundoHeader?: string;

  /** Aplica cor de fundo à área de conteúdo. Desativado por padrão. */
  corDeFundoConteudoAtiva?: boolean;

  /** Cor de fundo do conteúdo quando `corDeFundoConteudoAtiva` é `true`. Padrão: `var(--primary-50)`. */
  corDeFundoConteudo?: string;

  /** Identificador HTML do elemento raiz e base dos `data-testid` */
  id?: string;

  /** Classes CSS adicionais no contêiner principal */
  className?: string;

  /** Classes CSS adicionais no cabeçalho */
  classNameHeader?: string;

  /** Rótulo ARIA para acessibilidade (se omitido, usa `title`) */
  ariaLabel?: string;

  /** Conteúdo da seção */
  children?: ReactNode;
}

/**
 * Seção de formulário não expansível: cabeçalho com ícone em destaque,
 * título, descrição e uma linha divisória acima do conteúdo.
 *
 * Diferente do `AccordionCardSeplag`, não colapsa — o conteúdo está sempre visível.
 * Diferente do `PanelSeplag`, o ícone recebe um badge e o cabeçalho é separado
 * do conteúdo por um divisor.
 */
const SecaoFormularioSeplag = forwardRef<HTMLElement, SecaoFormularioSeplagProps>(
  (
    {
      cols,
      title,
      description,
      icon,
      iconElement,
      headerRight,
      noPadding = false,
      corDeFundoHeaderAtiva = true,
      corDeFundoHeader,
      corDeFundoConteudoAtiva = false,
      corDeFundoConteudo,
      id,
      className,
      classNameHeader,
      ariaLabel,
      children,
    },
    ref,
  ) => {
    const temIcone = Boolean(icon || iconElement);
    const temHeader = Boolean(title || description || temIcone || headerRight);
    const computedAriaLabel = ariaLabel ?? title;

    const badge =
      iconElement ??
      (icon ? (
        <span className={styles.badge} aria-hidden="true">
          <i className={icon} />
        </span>
      ) : null);

    return (
      <section
        ref={ref}
        id={id}
        data-testid={id}
        className={`${gridCss(cols ?? "12")} ${styles.colStretch}`}
        aria-label={temHeader ? undefined : computedAriaLabel}
      >
        <div className={`${styles.secao} ${className ?? ""}`}>
          {temHeader && (
            <header
              className={`${styles.header} ${classNameHeader ?? ""}`}
              data-testid={id ? `${id}-header` : undefined}
              style={
                corDeFundoHeaderAtiva
                  ? { background: corDeFundoHeader ?? "var(--primary-50, #eff6ff)" }
                  : undefined
              }
            >
              {badge}
              {(title || description) && (
                <div className={styles.textos}>
                  {title && <strong className={styles.titulo}>{title}</strong>}
                  {description && <span className={styles.descricao}>{description}</span>}
                </div>
              )}
              {headerRight && (
                <div className={styles.headerRight}>{headerRight}</div>
              )}
            </header>
          )}

          {children && (
            <div
              className={noPadding ? styles.semPadding : styles.conteudo}
              data-testid={id ? `${id}-content` : undefined}
              style={
                corDeFundoConteudoAtiva
                  ? { background: corDeFundoConteudo ?? "var(--primary-50, #eff6ff)" }
                  : undefined
              }
            >
              {children}
            </div>
          )}
        </div>
      </section>
    );
  },
);

SecaoFormularioSeplag.displayName = "SecaoFormularioSeplag";

export { SecaoFormularioSeplag };
export default SecaoFormularioSeplag;
