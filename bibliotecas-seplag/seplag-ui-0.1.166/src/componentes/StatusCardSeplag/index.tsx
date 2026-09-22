import { Tooltip } from "primereact/tooltip";
import { memo, type ElementType } from "react";
import gridCss from "../../uteis/Grid";

export interface StatusCardSeplagProps {
  id: string;
  label: string;
  value: number | string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  color: string;
  bg: string;
  borderColor?: string;
  tooltip?: string;
  active?: boolean;
  onClick?: () => void;
  isCustomColored?: boolean;
  cols?: string;
  /**
   * Quando true, não aplica classes de grid (col-12/md/lg) no wrapper —
   * use quando o elemento pai já controla o layout diretamente (ex: CSS
   * Grid com `repeat(auto-fill, minmax(...))`, ver `StatusCardGroupSeplag`).
   */
  fill?: boolean;
  /** Altura mínima do card. Default: "6.6rem". */
  minHeight?: string;
  /** "sm" reduz padding e o tamanho do ícone, para telas com pouco espaço vertical. Default: "md". */
  size?: "sm" | "md";
}

export const StatusCardSeplag = memo(function StatusCardSeplag({
  id,
  label,
  value,
  icon,
  iconColor,
  iconBg,
  color,
  bg,
  borderColor,
  tooltip,
  active,
  onClick,
  isCustomColored = false,
  cols = "12 6 3",
  fill = false,
  minHeight,
  size = "md",
}: Readonly<StatusCardSeplagProps>) {
  const Component: ElementType = onClick ? "button" : "div";
  const isCompact = size === "sm";
  const resolvedMinHeight = minHeight ?? (isCompact ? "3.5rem" : "6.6rem");

  const cursorClass = (): string => {
    if (onClick) return "cursor-pointer";
    if (tooltip) return "cursor-help";
    return "";
  };

  const backgoundValue = (): string => {
    if (isCustomColored || active) return bg;
    return "white";
  };

  const gridCols: string = gridCss(cols);

  return (
    <>
      {tooltip && <Tooltip target={`.stat-${id}`} content={tooltip} position="top" />}

      <div className={fill ? undefined : gridCols} style={fill ? { minWidth: 0 } : undefined}>
        <Component
          type={onClick ? "button" : undefined}
          id={id}
          data-testid={id}
          className={`stat-${id} ${isCustomColored ? "" : "surface-card surface-border"} border-round-lg ${isCompact ? "p-2" : "p-4"} h-full transition-all transition-duration-200 hover:shadow-2 ${cursorClass()}`}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            background: backgoundValue(),
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            minHeight: resolvedMinHeight,
            textAlign: "left",
            border: `1px solid ${isCustomColored ? borderColor : ""}`,
            borderLeft: `${active ? "6px" : "4px"} solid ${borderColor}`,
            boxShadow: active ? `0 8px 18px -12px ${color}` : undefined,
            transform: active ? "scale(1.015)" : "scale(1)",
            overflow: "hidden",
          }}
          onClick={onClick}
        >
          <div className="flex align-items-start justify-content-between gap-3">
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <span
                className={`${isCustomColored ? color : "text-700"} font-medium text-sm`}
                style={{ color: isCustomColored ? color : undefined }}
              >
                {label}
              </span>
              <strong
                className={`block text-900 ${isCompact ? "text-lg" : "text-2xl"} mt-2`}
                style={{ lineHeight: 1, whiteSpace: "nowrap" }}
              >
                {value}
              </strong>
            </div>

            {icon && (
              <div
                className="border-round-lg flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: isCompact ? "2rem" : "3rem",
                  height: isCompact ? "2rem" : "3rem",
                  backgroundColor: iconBg ?? bg,
                }}
              >
                <i
                  className={`${icon} ${isCompact ? "text-base" : "text-xl"}`}
                  style={{ color: iconColor ?? color }}
                />
              </div>
            )}
          </div>
        </Component>
      </div>
    </>
  );
});

export default StatusCardSeplag;
