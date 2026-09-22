import { Card } from "primereact/card";
import type { ReactNode } from "react";
import gridCss from "../../uteis/Grid";
import { BotaoVoltarSeplag } from "../Botao";
import styles from "./Card.module.css";

export interface CardSeplagProps {
  id?: string;
  cols?: string;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  /** Controls where the subtitle is rendered. "front" = same line as title. "below" = below the title (default). */
  subtitlePosition?: "front" | "below";
  handleVoltar?: () => void;
  legenda?: () => ReactNode;
  cardHeaderClassNames?: string;
  /** Inline style for the root wrapper */
  style?: React.CSSProperties;
  /** Footer node rendered below the children */
  footer?: ReactNode;
  actions?: ReactNode | null;
  /** Removes the internal padding of the card body, letting content align flush with the card edges. */
  noPadding?: boolean;
  children: ReactNode;
}

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 400,
  color: "var(--text-color-secondary, var(--surface-600))",
  whiteSpace: "normal",
  overflowWrap: "break-word",
  maxWidth: "100%",
  alignSelf: "flex-start",
};

export const CardSeplag = (props: CardSeplagProps) => {
  const { subtitlePosition = "below" } = props;
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
        <div className="flex flex-column" style={{ gap: 4, minWidth: 0 }}>
          <strong>{props.title}</strong>
          {renderSubtitle()}
        </div>
      );
    }
    return (
      <div className="flex align-items-center gap-2 flex-wrap" style={{ minWidth: 0 }}>
        <strong style={{ overflowWrap: "break-word" }}>{props.title}</strong>
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
                  className={`flex ${isSubtitleBelow ? "align-items-start" : "align-items-center"}`}
                  style={{ gap: 12, minWidth: 0, flex: 1 }}
                >
                  <BotaoVoltarSeplag
                    id={props.id ? `${props.id}-voltar` : undefined}
                    data-testid={props.id ? `${props.id}-voltar` : "card-voltar"}
                    onClick={props.handleVoltar}
                  />
                  <h5
                    style={{
                      flex: 1,
                      minWidth: 0,
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
        <div
          className={`flex justify-content-between ${
            isSubtitleBelow ? "align-items-start" : "align-items-center"
          }`}
        >
          <h5
            className="flex"
            style={{
              flex: 1,
              minWidth: 0,
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
    <div className={colClasseCss()} style={{ padding: 0, ...props.style }}>
      <Card
        id={props.id}
        data-testid={props.id}
        className={[props.cardHeaderClassNames, props.noPadding ? styles.noPadding : ""]
          .filter(Boolean)
          .join(" ")}
      >
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
