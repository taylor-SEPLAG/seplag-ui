import { BotaoSeplag } from "@componentes/Botao";
import React from "react";

const defaultCardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "12px",
  marginBottom: 8,
  background: "#f8fafc",
  width: "100%",
};

const defaultHeaderTextStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "0.9rem",
  color: "#1e293b",
};

const defaultIconStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "0.85rem",
};

const defaultCollapseButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "4px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#475569",
  transition: "transform 0.2s ease-in-out",
};

export interface AccordionCardSeplagProps {
  title?: string;
  id?: number | string;
  isOpen: boolean;
  iconTitulo?: string;
  showIcon?: boolean;
  onToggle?: () => void;
  toggleElement?: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  children?: React.ReactNode;
  contentStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  iconStyleOverride?: React.CSSProperties;
  toggleStyleOverride?: React.CSSProperties;
  transitionDuration?: number;
  transitionEasing?: string;
}

export function AccordionCardSeplag({
  title,
  id,
  isOpen,
  iconTitulo,
  showIcon,
  onToggle,
  toggleElement,
  headerRight,
  className,
  headerClassName,
  children,
  contentStyle,
  containerStyle,
  headerStyle,
  iconStyleOverride,
  toggleStyleOverride,
  transitionDuration = 300,
  transitionEasing = "ease",
}: Readonly<AccordionCardSeplagProps>) {
  const rootStyle = containerStyle ?? defaultCardStyle;
  const hdrStyle = headerStyle ?? defaultHeaderTextStyle;
  const icStyle = iconStyleOverride ?? defaultIconStyle;
  const toggleBaseStyle = toggleStyleOverride
    ? { ...defaultCollapseButtonStyle, ...toggleStyleOverride }
    : defaultCollapseButtonStyle;

  const cardTestId = id == null ? "accordion-card" : `accordion-card-${id}`;
  const toggleTestId = `${cardTestId}-toggle`;

  const baseToggleButton = (
    <BotaoSeplag
      id={toggleTestId}
      data-testid={toggleTestId}
      onClick={onToggle}
      aria-expanded={isOpen}
      title={isOpen ? "Fechar" : "Abrir"}
      style={{
        boxShadow: "none",
        padding: 6,
        width: 32,
        height: 32,
        minWidth: 32,
        background: "transparent",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        ...toggleBaseStyle,
        transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
      }}
    >
      <i className="pi pi-chevron-down" style={{ fontSize: "0.9rem" }} />
    </BotaoSeplag>
  );

  return (
    <div
      id={id == null ? undefined : cardTestId}
      data-testid={cardTestId}
      className={className}
      style={rootStyle}
    >
      <div className={`flex align-items-center gap-2 mb-1 ${headerClassName ?? ""}`}>
        <i className={iconTitulo || "pi pi-users"} style={icStyle} />
        <span style={{ ...hdrStyle, flex: 1 }}>{title}</span>
        {headerRight}
        {showIcon && (toggleElement || baseToggleButton)}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: `grid-template-rows ${transitionDuration}ms ${transitionEasing}`,
        }}
      >
        <div style={{ overflow: "hidden", ...contentStyle }}>{children}</div>
      </div>
    </div>
  );
}

export default AccordionCardSeplag;
