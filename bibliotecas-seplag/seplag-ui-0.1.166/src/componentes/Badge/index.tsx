import { BotaoChipSeplag, BotaoSeplag } from "@componentes/Botao";
import { Tooltip } from "primereact/tooltip";
import React, { useId } from "react";
import {
  SEPLAG_BORDER_LIGHT,
  SEPLAG_ERROR_BG,
  SEPLAG_ERROR_BORDER,
  SEPLAG_ERROR_TEXT,
  SEPLAG_GRAY_600,
  SEPLAG_INFO_BG,
  SEPLAG_INFO_BORDER,
  SEPLAG_INFO_TEXT,
  SEPLAG_SUCCESS_BG,
  SEPLAG_SUCCESS_BORDER,
  SEPLAG_SUCCESS_TEXT,
  SEPLAG_WARNING_BG,
  SEPLAG_WARNING_BORDER,
  SEPLAG_WARNING_TEXT,
  SEPLAG_WHITE,
} from "../../tokens/colors";
import style from "./Badge.module.css";

export interface BadgeSeplagProps {
  id?: string;
  label: string;
  uppercase?: boolean;
  capitalize?: boolean;
  icon?: string;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  color?: string;
  bg?: string;
  border?: string;
  size?: "xs" | "sm" | "md";
  onClick?: () => void;
  clickable?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  active?: boolean;
  activeBg?: string;
  activeColor?: string;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  minWidth?: string | number;
  maxWidth?: string | number;
  maxLength?: number;
  fontWeight?: boolean;
  textAlign?: "left" | "center" | "right";
  customStyle?: React.CSSProperties;
}

const SIZE_CLASS: Record<NonNullable<BadgeSeplagProps["size"]>, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
};

const SIZE_PADDING: Record<NonNullable<BadgeSeplagProps["size"]>, string> = {
  xs: "1px 6px",
  sm: "3px 10px",
  md: "4px 14px",
};

const VARIANT_STYLE = {
  success: {
    color: SEPLAG_SUCCESS_TEXT,
    bg: SEPLAG_SUCCESS_BG,
    border: SEPLAG_SUCCESS_BORDER,
  },
  warning: {
    color: SEPLAG_WARNING_TEXT,
    bg: SEPLAG_WARNING_BG,
    border: SEPLAG_WARNING_BORDER,
  },
  error: {
    color: SEPLAG_ERROR_TEXT,
    bg: SEPLAG_ERROR_BG,
    border: SEPLAG_ERROR_BORDER,
  },
  info: {
    color: SEPLAG_INFO_TEXT,
    bg: SEPLAG_INFO_BG,
    border: SEPLAG_INFO_BORDER,
  },
  neutral: {
    color: SEPLAG_GRAY_600,
    bg: SEPLAG_WHITE,
    border: SEPLAG_BORDER_LIGHT,
  },
} as const;

const JUSTIFY_CONTENT_MAP = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
} as const;

function capitalizeLabel(label: string) {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
}

function resolveDisplayLabel(label: string, maxLength?: number) {
  if (!maxLength || label.length <= maxLength) {
    return {
      displayLabel: label,
      fullLabel: "",
    };
  }

  return {
    displayLabel: `${label.slice(0, maxLength)}...`,
    fullLabel: label,
  };
}

function resolveBaseColors(
  variant: NonNullable<BadgeSeplagProps["variant"]>,
  color?: string,
  bg?: string,
  border?: string,
) {
  const defaultVariantStyle = VARIANT_STYLE[variant];
  const resolvedBaseColor = color ?? defaultVariantStyle.color;
  const resolvedBaseBg = bg ?? defaultVariantStyle.bg;

  return {
    resolvedBaseColor,
    resolvedBaseBg,
    resolvedBorder: border ?? defaultVariantStyle.border ?? `${resolvedBaseColor}50`,
  };
}

function renderBadgeIcon(icon?: string) {
  if (!icon) return null;

  return (
    <i
      className={icon}
      style={{
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1,
        marginTop: 2,
      }}
    />
  );
}

function resolveDisplayTooltip(fullLabel: string, tooltip?: string) {
  if (fullLabel && tooltip) {
    return `${fullLabel} - ${tooltip}`;
  }

  return fullLabel || tooltip || "";
}

function buildBadgeStyle({
  size,
  resolvedColor,
  resolvedBg,
  resolvedBorder,
  maxWidth,
  textAlign,
  isClickable,
  disabled,
  fontWeight,
  minWidth,
  customStyle,
}: {
  size: NonNullable<BadgeSeplagProps["size"]>;
  resolvedColor: string;
  resolvedBg: string;
  resolvedBorder: string;
  maxWidth: string | number;
  textAlign: NonNullable<BadgeSeplagProps["textAlign"]>;
  isClickable: boolean;
  disabled: boolean;
  fontWeight?: boolean;
  minWidth: string | number;
  customStyle?: React.CSSProperties;
}): React.CSSProperties {
  return {
    padding: SIZE_PADDING[size],
    color: resolvedColor,
    backgroundColor: resolvedBg,
    border: `1px solid ${resolvedBorder}`,
    whiteSpace: maxWidth ? "normal" : "nowrap",
    wordBreak: maxWidth ? "break-word" : undefined,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: JUSTIFY_CONTENT_MAP[textAlign],
    cursor: isClickable ? "pointer" : "default",
    outline: "none",
    fontWeight: fontWeight ? 700 : 500,
    fontFamily: "inherit",
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : undefined,
    minWidth,
    maxWidth,
    ...customStyle,
  };
}

function renderRemoveButton(
  removable: boolean,
  disabled: boolean,
  badgeId: string,
  onRemove?: () => void,
) {
  if (!removable) return null;

  return (
    <BotaoSeplag
      unstyled
      type="button"
      id={`${badgeId}-remover`}
      data-testid={`${badgeId}-remover`}
      className={style.noRipple}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onRemove?.();
      }}
      disabled={disabled}
      aria-label="Remover"
      style={{
        border: "none",
        background: "transparent",
        color: "inherit",
        padding: "0 0 0 4px",
        margin: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1,
      }}
    >
      <i className="pi pi-times" />
    </BotaoSeplag>
  );
}

export function BadgeSeplag({
  id,
  label,
  uppercase = false,
  capitalize = true,
  icon,
  variant = "neutral",
  color,
  bg,
  border,
  size = "sm",
  onClick,
  clickable,
  removable = false,
  onRemove,
  disabled = false,
  active = false,
  activeBg,
  activeColor = "#ffffff",
  tooltip,
  tooltipPosition = "top",
  minWidth = 120,
  maxWidth = "100%",
  maxLength,
  fontWeight,
  textAlign = "center",
  customStyle,
}: Readonly<BadgeSeplagProps>) {
  const { resolvedBaseColor, resolvedBaseBg, resolvedBorder } = resolveBaseColors(
    variant,
    color,
    bg,
    border,
  );
  const isActiveCustom = active && Boolean(activeBg);
  const resolvedBg = isActiveCustom ? (activeBg as string) : resolvedBaseBg;
  const resolvedColor = isActiveCustom ? activeColor : resolvedBaseColor;
  const resolvedBorderC = isActiveCustom ? (activeBg as string) : resolvedBorder;
  const isClickable = !disabled && (clickable ?? Boolean(onClick));
  const formattedLabel = uppercase
    ? label.toUpperCase()
    : capitalize
      ? capitalizeLabel(label)
      : label;
  const { displayLabel, fullLabel } = resolveDisplayLabel(formattedLabel, maxLength);
  const displayTooltip = resolveDisplayTooltip(fullLabel, tooltip);

  const generatedId = useId();
  const badgeId = id ?? `badge-${generatedId.replaceAll(":", "")}`;

  const style = buildBadgeStyle({
    size,
    resolvedColor,
    resolvedBg,
    resolvedBorder: resolvedBorderC,
    maxWidth,
    textAlign,
    isClickable,
    disabled,
    fontWeight,
    minWidth,
    customStyle,
  });

  const className = [
    "align-items-center gap-1 border-round-3xl",
    SIZE_CLASS[size],
    "transition-all transition-duration-150",
  ].join(" ");

  const removeButton = renderRemoveButton(removable, disabled, badgeId, onRemove);

  if (isClickable) {
    return (
      <BotaoChipSeplag
        id={badgeId}
        data-testid={badgeId}
        className={className}
        style={style}
        onClick={onClick}
        tooltip={displayTooltip}
        tooltipOptions={displayTooltip ? { position: tooltipPosition } : undefined}
      >
        {renderBadgeIcon(icon)}
        {displayLabel}
        {removeButton}
      </BotaoChipSeplag>
    );
  }

  return (
    <>
      {displayTooltip && (
        <Tooltip target={`#${badgeId}`} content={displayTooltip} position={tooltipPosition} />
      )}
      <span id={badgeId} data-testid={badgeId} className={className} style={style}>
        {renderBadgeIcon(icon)}
        {displayLabel}
        {removeButton}
      </span>
    </>
  );
}

type BadgeVariantProps = Omit<BadgeSeplagProps, "color" | "bg" | "border">;
type BadgeVariantPropsWithOptionalLabel = Omit<BadgeVariantProps, "label"> & { label?: string };

export const BadgeInfo = (props: BadgeVariantProps) => <BadgeSeplag variant="info" {...props} />;

export const BadgeVerde = ({ label = "Sim", ...props }: BadgeVariantPropsWithOptionalLabel) => (
  <BadgeSeplag variant="success" label={label} {...props} />
);

export const BadgeAmarelo = ({ label = "Sim", ...props }: BadgeVariantPropsWithOptionalLabel) => (
  <BadgeSeplag variant="warning" label={label} {...props} />
);

export const BadgeVermelho = (props: BadgeVariantProps) => (
  <BadgeSeplag variant="error" {...props} />
);

export const BadgeOutline = (props: BadgeVariantProps) => (
  <BadgeSeplag variant="neutral" {...props} />
);
