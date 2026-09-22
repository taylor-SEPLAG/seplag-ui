import type { CSSProperties } from "react";
import gridCss from "../../uteis/Grid";
import {
  SEPLAG_WARNING_BG,
  SEPLAG_WARNING_BORDER,
  SEPLAG_WARNING_TEXT,
  SEPLAG_INFO_BG,
  SEPLAG_INFO_BORDER,
  SEPLAG_INFO_TEXT,
  SEPLAG_ERROR_BG,
  SEPLAG_ERROR_BORDER,
  SEPLAG_ERROR_TEXT,
  SEPLAG_SUCCESS_BG,
  SEPLAG_SUCCESS_BORDER,
  SEPLAG_SUCCESS_TEXT,
} from "../../tokens/colors";

export type MensagemSeveritySeplag = "warning" | "info" | "error" | "success";

export interface MensagemSeplagProps {
  id?: string;
  message: string;
  visible?: boolean;
  cols?: string;
  severity?: MensagemSeveritySeplag;
  icon?: string;
  allowHtml?: boolean;
  style?: CSSProperties;
}

const severityStyles: Record<MensagemSeveritySeplag, CSSProperties> = {
  warning: {
    backgroundColor: SEPLAG_WARNING_BG,
    borderColor: SEPLAG_WARNING_BORDER,
    color: SEPLAG_WARNING_TEXT,
  },
  info: {
    backgroundColor: SEPLAG_INFO_BG,
    borderColor: SEPLAG_INFO_BORDER,
    color: SEPLAG_INFO_TEXT,
  },
  error: {
    backgroundColor: SEPLAG_ERROR_BG,
    borderColor: SEPLAG_ERROR_BORDER,
    color: SEPLAG_ERROR_TEXT,
  },
  success: {
    backgroundColor: SEPLAG_SUCCESS_BG,
    borderColor: SEPLAG_SUCCESS_BORDER,
    color: SEPLAG_SUCCESS_TEXT,
  },
};

const severityIcons: Record<MensagemSeveritySeplag, string> = {
  warning: "pi pi-exclamation-triangle",
  info: "pi pi-info-circle",
  error: "pi pi-times-circle",
  success: "pi pi-check-circle",
};

export function MensagemSeplag(props: Readonly<MensagemSeplagProps>) {
  const {
    id = "mensagem-seplag",
    message,
    visible = true,
    cols = "12",
    severity = "warning",
    icon,
    allowHtml = true,
    style,
  } = props;

  if (!visible) return null;

  const palette = severityStyles[severity];
  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(message);
  const shouldRenderHtml = allowHtml && hasHtmlTag;
  const role = severity === "error" ? "alert" : "status";
  const ariaLive = severity === "error" ? "assertive" : "polite";

  return (
    <div className={gridCss(cols)}>
      <div
        id={id}
        data-testid={id}
        className="inline-flex align-items-center gap-2 border-1 px-2 py-1"
        role={role}
        aria-live={ariaLive}
        data-severity={severity}
        style={{
          borderRadius: "6px",
          ...palette,
          ...style,
        }}
      >
        <i
          className={icon ?? severityIcons[severity]}
          aria-hidden="true"
          style={{ fontSize: "1rem", color: palette.color }}
        />
        {shouldRenderHtml ? (
          <div
            style={{
              fontWeight: 600,
              fontSize: "1rem",
              lineHeight: 1.4,
            }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        ) : (
          <div
            style={{
              fontWeight: 600,
              fontSize: "1rem",
              lineHeight: 1.4,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
