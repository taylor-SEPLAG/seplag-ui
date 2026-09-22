import { Dialog } from "primereact/dialog";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "../Botao";
import styles from "./style.module.css";

export interface ModalSeplagProps {
  id?: string;
  visible: boolean;
  isSubmit?: boolean;
  titulo?: string | ReactNode;
  children: ReactNode;
  funcAcao?: () => void;
  fechar: () => void;
  labelFechar?: string;
  labelAcao?: string;
  iconAcao?: string;
  iconFechar?: string;
  tamanho?: string;
  altura?: string;
  overflow?: "auto" | "hidden" | "scroll" | "visible";
  draggable?: boolean;
  customFooter?: ReactNode;
  ariaLabel?: string;
  closeOnEscape?: boolean;
  alignFooter?: "left" | "right";
  hideFooter?: boolean;
  showFooterDivider?: boolean;
  showHeaderDivider?: boolean;
  onlyClose?: boolean;
  loadingAcao?: boolean;
  disabledFechar?: boolean;
  showHeader?: boolean;
}

export const ModalSeplag = (props: Readonly<ModalSeplagProps>) => {
  const {
    id = "modal-seplag",
    visible,
    isSubmit = false,
    titulo,
    children,
    funcAcao,
    fechar,
    labelFechar = "Fechar",
    labelAcao = "Enviar",
    iconAcao = "pi pi-check",
    iconFechar = "pi pi-times",
    tamanho,
    altura,
    overflow = "auto",
    draggable = false,
    customFooter,
    alignFooter = "right",
    hideFooter = false,
    showFooterDivider = true,
    showHeaderDivider = true,
    showHeader = true,
    onlyClose = false,
    ariaLabel,
    closeOnEscape = true,
    loadingAcao = false,
    disabledFechar = false,
  } = props;

  const handleClose = useCallback(() => fechar(), [fechar]);
  const handleAction = useCallback(() => funcAcao?.(), [funcAcao]);

  const [visivelAnterior, setVisivelAnterior] = useState(visible);
  const [abrindoId, setAbrindoId] = useState(0);
  if (visible !== visivelAnterior) {
    setVisivelAnterior(visible);
    if (visible) {
      setAbrindoId((atual) => atual + 1);
    }
  }

  const footerDividerClassName = showFooterDivider ? styles["modalSeplag-footer-divider"] : "";

  const footerClassName = useMemo(
    () =>
      [
        styles["modalSeplag-botoes-footer"],
        alignFooter === "right" ? styles["modalSeplag-botoes-footer-right"] : "",
        footerDividerClassName,
      ]
        .filter(Boolean)
        .join(" "),
    [alignFooter, footerDividerClassName],
  );

  const dialogStyle = useMemo(
    () => ({
      width: tamanho ?? "min(32rem, 95vw)",
      maxWidth: tamanho ? `min(${tamanho}, 95vw)` : "95vw",
      height: altura ?? "auto",
    }),
    [tamanho, altura],
  );

  const resolvedAriaLabel = ariaLabel?.trim() || (typeof titulo === "string" ? titulo : "Modal");

  const footerContent = useMemo(() => {
    if (hideFooter) return undefined;
    if (customFooter) {
      return <div className={footerDividerClassName || undefined}>{customFooter}</div>;
    }

    return (
      <div className={footerClassName}>
        <BotaoVoltarSeplag
          id={`${id}-fechar`}
          data-testid={`${id}-fechar`}
          label={labelFechar}
          icon={iconFechar}
          onClick={handleClose}
          disabled={disabledFechar}
          className={`p-button-outlined p-button-danger ${styles["margin-app-entre-button"]}`}
          type="button"
        />
        {!onlyClose && (
          <BotaoSalvarSeplag
            id={`${id}-acao`}
            data-testid={`${id}-acao`}
            label={labelAcao}
            icon={iconAcao}
            onClick={handleAction}
            loading={loadingAcao}
            disabled={loadingAcao}
            autoFocus
            className={`p-button-raised ${styles["margin-app-entre-button"]}`}
            type={isSubmit ? "submit" : "button"}
          />
        )}
      </div>
    );
  }, [
    id,
    hideFooter,
    customFooter,
    footerClassName,
    footerDividerClassName,
    labelFechar,
    iconFechar,
    labelAcao,
    iconAcao,
    isSubmit,
    onlyClose,
    handleClose,
    handleAction,
    loadingAcao,
    disabledFechar,
  ]);

  return (
    <Dialog
      key={abrindoId}
      id={id}
      data-testid={id}
      header={titulo}
      showHeader={showHeader}
      footer={footerContent}
      visible={visible}
      style={dialogStyle}
      className={showHeaderDivider ? styles["modalSeplag-header-border"] : undefined}
      modal
      onHide={handleClose}
      contentStyle={{ flex: 1, minWidth: 0, paddingTop: "0.3rem", overflow }}
      draggable={draggable}
      aria-label={resolvedAriaLabel}
      closeOnEscape={closeOnEscape}
      pt={{ closeButton: { "data-testid": `${id}-close-x` } }}
    >
      <div
        className={`${styles["margin-superior-simples"]} ${styles["quebrar-texto"]} ${styles["modalSeplag-wrapper"]}`}
        style={{ minWidth: 0 }}
      >
        <div className="grid p-fluid" style={{ minWidth: 0 }}>
          {children}
        </div>
      </div>
    </Dialog>
  );
};

export default ModalSeplag;
