import type { ReactNode } from "react";
import { ModalSeplag } from "../Modal";

const DEFAULT_MESSAGE = "Deseja realmente confirmar esta ação?";

const quebraLinhaStyle = { wordBreak: "break-all", overflowWrap: "anywhere" } as const;

export interface ModalConfirmacaoSeplagProps {
  id?: string;
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Título do modal. @default "Confirmação" */
  titulo?: string;
  message?: ReactNode;
  /** @default "Sim" */
  labelConfirmar?: string;
  /** @default "Não" */
  labelCancelar?: string;
  /** @default "pi pi-check" */
  iconConfirmar?: string;
  /** @default "pi pi-times" */
  iconCancelar?: string;
  confirmando?: boolean;
}

export const ModalConfirmacaoSeplag = ({
  id = "confirmacao-modal",
  visible,
  onConfirm,
  onCancel,
  titulo = "Confirmação",
  message,
  labelConfirmar = "Sim",
  labelCancelar = "Não",
  iconConfirmar = "pi pi-check",
  iconCancelar = "pi pi-times",
  confirmando = false,
}: ModalConfirmacaoSeplagProps) => {
  return (
    <ModalSeplag
      id={id}
      visible={visible}
      titulo={titulo}
      fechar={onCancel}
      funcAcao={onConfirm}
      labelFechar={labelCancelar}
      labelAcao={labelConfirmar}
      iconFechar={iconCancelar}
      iconAcao={iconConfirmar}
      closeOnEscape={!confirmando}
      disabledFechar={confirmando}
      loadingAcao={confirmando}
    >
      <div className="col-12" style={quebraLinhaStyle}>
        {typeof message === "string" ? (
          <p
            style={quebraLinhaStyle}
            dangerouslySetInnerHTML={{ __html: message || DEFAULT_MESSAGE }}
          />
        ) : (
          <p style={quebraLinhaStyle}>{message || DEFAULT_MESSAGE}</p>
        )}
      </div>
    </ModalSeplag>
  );
};

export default ModalConfirmacaoSeplag;
