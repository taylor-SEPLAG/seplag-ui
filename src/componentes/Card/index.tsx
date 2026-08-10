import { Card } from "primereact/card";
import gridCss from "../../uteis/Grid";
import { BotaoVoltarSeplag } from "../Botao";
import type { ReactNode } from "react";

export interface CardSeplagProps {
  cols?: string;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  /** Controls where the subtitle is rendered. "front" = same line as title (default). "below" = below the title. */
  subtitlePosition?: "front" | "below";
  handleVoltar?: () => void;
  legenda?: () => ReactNode;
  cardHeaderClassNames?: string;
  /** Inline style for the root wrapper */
  style?: React.CSSProperties;
  /** Footer node rendered below the children */
  footer?: ReactNode;
  actions?: ReactNode | null;
  /** Optional page-level navigation rendered above the card title. */
  headerNavigation?: ReactNode;
  children: ReactNode;
}

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 500,
  color: "var(--surface-500)",
  background: "var(--surface-100)",
  border: "1px solid var(--surface-200)",
  borderRadius: "6px",
  padding: "2px 10px",
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
  alignSelf: "flex-start",
};

export const CardSeplag = (props: CardSeplagProps) => {
  const { subtitlePosition = "front" } = props;
  const isSubtitleBelow = subtitlePosition === "below";

  function colClasseCss() {
    return gridCss(props.cols ? props.cols : "12");
  }

  function renderSubtitle() {
    if (!props.subtitle) return null;
    return <span style={subtitleStyle}>{props.subtitle}</span>;
  }

  function renderTitleContent() {
    if (isSubtitleBelow) {
      return (
        <div className="flex flex-column" style={{ gap: 4 }}>
          <strong>{props.title}</strong>
          {renderSubtitle()}
        </div>
      );
    }
    return (
      <div className="flex align-items-center gap-2">
        <strong>{props.title}</strong>
        {renderSubtitle()}
      </div>
    );
  }

  function title() {
    if (!props.title) {
      return <></>;
    }
    if (props.handleVoltar) {
      return (
        <div className="col-12">
          <div className="grid" style={{ alignItems: "center" }}>
            <div className="col-12">
              <div
                className={`flex w-full justify-content-between ${
                  isSubtitleBelow ? "align-items-start" : "align-items-center"
                }`}
              >
                <div
                  className={`flex ${
                    isSubtitleBelow ? "align-items-start" : "align-items-center"
                  }`}
                  style={{ gap: 12 }}
                >
                  <BotaoVoltarSeplag onClick={props.handleVoltar} />
                  <h5
                    style={{
                      flex: 1,
                      minHeight: isSubtitleBelow ? undefined : "35px",
                      marginBottom: "0px",
                    }}
                  >
                    {renderTitleContent()}
                  </h5>
                </div>
                {props.actions}
              </div>
            </div>
            <div className="col-12">{props.legenda?.()}</div>
          </div>

          <hr />
        </div>
      );
    }

    return (
      <div className="col-12">
        {props.headerNavigation}
        <div
          className={`flex justify-content-between ${
            isSubtitleBelow ? "align-items-start" : "align-items-center"
          }`}
        >
          <h5
            style={{
              flex: 1,
              minHeight: isSubtitleBelow ? undefined : "35px",
              marginBottom: "0px",
            }}
          >
            {renderTitleContent()}
            {props.legenda?.()}
          </h5>
          {props.actions}
        </div>

        <hr />
      </div>
    );
  }

  return (
    <div className={colClasseCss()} style={props.style}>
      <Card className={props.cardHeaderClassNames}>
        <div className="grid">
          {title()}
          {props.children}
          {props.footer}
        </div>
      </Card>
    </div>
  );
};

export default CardSeplag;
