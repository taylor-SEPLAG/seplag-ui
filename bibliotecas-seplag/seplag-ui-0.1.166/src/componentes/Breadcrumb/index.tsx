import type { CSSProperties, MouseEvent, ReactNode } from "react";
import {
  SEPLAG_BORDER_LIGHT,
  SEPLAG_GRAY_600,
  SEPLAG_GRAY_800,
  SEPLAG_PRIMARY,
} from "../../tokens/colors";

const NAV_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  minWidth: 0,
  width: "100%",
  background: "#FFFFFF",
  borderBottom: `1px solid ${SEPLAG_BORDER_LIGHT}`,
  borderRadius: "6px 6px 0 0",
  padding: "0.75rem 1.25rem",
};

const LIST_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.5rem",
  listStyle: "none",
  margin: 0,
  padding: 0,
  fontSize: "0.875rem",
};

const ITEM_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  minWidth: 0,
};

const LINK_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  color: SEPLAG_GRAY_600,
  textDecoration: "none",
  background: "none",
  border: "none",
  font: "inherit",
  fontSize: "inherit",
  fontWeight: 500,
  cursor: "pointer",
  padding: 0,
  transition: "color 0.15s ease",
};

const CURRENT_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  color: SEPLAG_GRAY_800,
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "40ch",
};

const SEPARATOR_STYLE: CSSProperties = {
  color: SEPLAG_GRAY_600,
  display: "inline-flex",
  flexShrink: 0,
};

const ICON_STYLE: CSSProperties = {
  display: "block",
  flexShrink: 0,
};

function HomeIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={ICON_STYLE}
      aria-hidden="true"
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9.5a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={ICON_STYLE}
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export interface BreadcrumbItemSeplag {
  label: string;
  /** Classe de ícone PrimeIcons (ex: "pi pi-sitemap") exibida antes do label. */
  icon?: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbSeplagProps {
  items: BreadcrumbItemSeplag[];
  /** Exibe um ícone de casa clicável antes do primeiro item, levando à página inicial. */
  homeHref?: string;
  onHomeClick?: () => void;
  className?: string;
  style?: CSSProperties;
  id?: string;
  "data-testid"?: string;
}

function Link({
  children,
  href,
  onClick,
  ariaLabel,
  title,
  id,
  "data-testid": dataTestId,
}: Readonly<{
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
  id?: string;
  "data-testid"?: string;
}>) {
  const handleEnter = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = SEPLAG_PRIMARY;
  };
  const handleLeave = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = SEPLAG_GRAY_600;
  };

  if (href) {
    return (
      <a
        id={id}
        data-testid={dataTestId}
        href={href}
        style={LINK_STYLE}
        aria-label={ariaLabel}
        title={title ?? ariaLabel}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      id={id}
      data-testid={dataTestId}
      type="button"
      style={LINK_STYLE}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </button>
  );
}

export function BreadcrumbSeplag({
  items,
  homeHref,
  onHomeClick,
  className = "",
  style,
  id,
  "data-testid": dataTestId,
}: Readonly<BreadcrumbSeplagProps>) {
  const hasHome = Boolean(homeHref || onHomeClick);
  const testId = dataTestId ?? id;

  return (
    <nav
      id={id}
      data-testid={testId}
      aria-label="breadcrumb"
      className={className}
      style={{ ...NAV_STYLE, ...style }}
    >
      <ol style={LIST_STYLE}>
        {hasHome && (
          <li style={ITEM_STYLE} data-testid={testId ? `${testId}-home` : undefined}>
            <Link
              href={homeHref}
              onClick={onHomeClick}
              ariaLabel="Página inicial"
              id={testId ? `${testId}-home-link` : undefined}
              data-testid={testId ? `${testId}-home-link` : undefined}
            >
              <HomeIcon />
            </Link>
            <span style={SEPARATOR_STYLE}>
              <ChevronIcon />
            </span>
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isNavigable = Boolean(item.href || item.onClick);
          const itemTestId = testId ? `${testId}-item-${index}` : undefined;

          return (
            <li key={`${item.label}-${index}`} style={ITEM_STYLE} data-testid={itemTestId}>
              {isNavigable ? (
                <Link
                  href={item.href}
                  onClick={item.onClick}
                  title={item.label}
                  id={itemTestId ? `${itemTestId}-link` : undefined}
                  data-testid={itemTestId ? `${itemTestId}-link` : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  style={isLast ? CURRENT_STYLE : LINK_STYLE}
                  aria-current={isLast ? "page" : undefined}
                  title={item.label}
                  data-testid={itemTestId ? `${itemTestId}-current` : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span style={SEPARATOR_STYLE} aria-hidden="true">
                  <ChevronIcon />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default BreadcrumbSeplag;
