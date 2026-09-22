import { Tooltip } from "primereact/tooltip";
import type { CSSProperties, ReactNode } from "react";
import gridCss from "../../uteis/Grid";
import "./style.css";

export interface RotuloSeplagProps {
  nome: string | ReactNode;
  children: ReactNode;
  cols?: string;
  horizontal?: boolean;
  obrigatorio?: boolean;
  htmlFor?: string;
  style?: CSSProperties;
  hidden?: boolean;
  info?: string | ReactNode;
  iconLeft?: string;
  iconRight?: string;
  /**
   * Quando `true`, devolve apenas `children`: sem a classe de grid derivada de `cols`, sem a
   * caixa de rótulo e sem o wrapper `content-rotulo`.
   *
   * Use quando o campo é renderizado dentro de um contexto que já controla posição, largura e
   * espaçamento — célula de tabela, barra de ações ou grupo inline. Nesses casos o rótulo é
   * responsabilidade do contexto (o `<th>` da coluna, por exemplo), e a classe de grid do
   * PrimeFlex atrapalharia o layout do contêiner.
   *
   * As props `nome`, `obrigatorio`, `info`, `iconLeft`, `iconRight` e `horizontal` são
   * ignoradas neste modo, pois todas descrevem a moldura.
   *
   * @default false
   */
  semMoldura?: boolean;
}

const LabelContent = ({
  nome,
  obrigatorio,
  info,
  iconLeft,
  iconRight,
}: Pick<RotuloSeplagProps, "nome" | "obrigatorio" | "info" | "iconLeft" | "iconRight">) => (
  <>
    {iconLeft && <i className={iconLeft} style={{ marginRight: "0.4rem" }} />}
    <span>{nome}</span>
    {obrigatorio && (
      <span className="obrigatorio" style={{ color: "red", marginLeft: "0.15rem" }}>
        *
      </span>
    )}
    {iconRight && <i className={iconRight} style={{ marginLeft: "0.4rem" }} />}
    {typeof info === "string" && (
      <i
        className="pi pi-question-circle custom-target-icon"
        style={{
          fontSize: "0.8rem",
          cursor: "pointer",
          marginLeft: "0.15rem",
          color: "#6c757d",
        }}
        data-pr-tooltip={info}
        data-pr-position="mouse"
      />
    )}
  </>
);

export const RotuloSeplag = (props: Readonly<RotuloSeplagProps>) => {
  const {
    nome,
    children,
    cols = "12",
    horizontal = false,
    obrigatorio = false,
    htmlFor,
    style,
    hidden = false,
    info,
    iconLeft,
    iconRight,
    semMoldura = false,
  } = props;

  if (hidden) return null;

  if (semMoldura) return <>{children}</>;

  const colClass = gridCss(cols);
  const wrapperClass = horizontal
    ? "content-rotulo rotulo-horizontal"
    : "content-rotulo rotulo-vertical";
  const hasIcons = !!(info || iconLeft || iconRight);
  const labelStyle: CSSProperties | undefined = hasIcons
    ? { display: "flex", alignItems: "center" }
    : undefined;

  const testId = htmlFor ? `rotulo-${htmlFor}` : undefined;

  return (
    <>
      {hasIcons && <Tooltip target=".custom-target-icon" className="rotulo-seplag-tooltip" />}
      <div
        className={colClass}
        style={style}
        aria-required={obrigatorio || undefined}
        data-testid={testId}
      >
        <div className={wrapperClass}>
          {htmlFor ? (
            <label
              className="label-rotulo col-fixed label-destaque"
              htmlFor={htmlFor}
              data-testid={`${testId}-label`}
              style={labelStyle}
            >
              <LabelContent
                nome={nome}
                obrigatorio={obrigatorio}
                info={info}
                iconLeft={iconLeft}
                iconRight={iconRight}
              />
            </label>
          ) : (
            <div className="label-rotulo col-fixed label-destaque" style={labelStyle}>
              <LabelContent
                nome={nome}
                obrigatorio={obrigatorio}
                info={info}
                iconLeft={iconLeft}
                iconRight={iconRight}
              />
            </div>
          )}

          <div className="col elemento" data-testid={testId ? `${testId}-elemento` : undefined}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default RotuloSeplag;
