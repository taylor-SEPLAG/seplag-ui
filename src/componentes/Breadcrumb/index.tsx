import { Fragment } from "react";
import { Link } from "react-router-dom";
import style from "./Breadcrumb.module.css";

export interface BreadcrumbItemSeplag {
  label: string;
  to?: string;
}

export interface BreadcrumbSeplagProps {
  items: readonly BreadcrumbItemSeplag[];
  homeTo?: string;
  /** Centraliza o breadcrumb em uma faixa com divisória inferior. */
  divided?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function BreadcrumbSeplag({
  items,
  homeTo,
  ariaLabel = "Navegação estrutural",
  divided = false,
  className = "",
}: Readonly<BreadcrumbSeplagProps>) {
  const homeIcon = <i className="pi pi-home" aria-hidden="true" />;

  return (
    <nav className={`${style.breadcrumb} ${divided ? style.divided : ""} ${className}`.trim()} aria-label={ariaLabel}>
      {homeTo ? <Link to={homeTo} aria-label="Início">{homeIcon}</Link> : <span>{homeIcon}</span>}
      {items.map((item, index) => {
        const atual = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            <i className={`pi pi-angle-right ${style.separator}`} aria-hidden="true" />
            {atual ? (
              <strong aria-current="page">{item.label}</strong>
            ) : item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
