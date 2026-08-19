import { Dialog } from "primereact/dialog";
import { useMemo, useCallback, type ReactNode } from "react";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "../Botao";

export interface ModalDeleteSeplagProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  children?: ReactNode;
  confirmDisabled?: boolean;
}

const ModalDeleteSeplag = ({
  visible,
  onConfirm,
  onCancel,
  message,
  children,
  confirmDisabled = false,
}: ModalDeleteSeplagProps) => {
  const handleConfirm = useCallback(() => onConfirm?.(), [onConfirm]);
  const handleCancel = useCallback(() => onCancel?.(), [onCancel]);

  const footer = useMemo(
    () => (
      <div>
        <BotaoSalvarSeplag
          label="Sim"
          type="button"
          icon="pi pi-check"
          iconPos="left"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          className="margin-app-entre-button"
        />

        <BotaoVoltarSeplag
          label="Não"
          type="button"
          icon="pi pi-times"
          iconPos="left"
          onClick={handleCancel}
        />
      </div>
    ),
    [handleConfirm, handleCancel, confirmDisabled],
  );

  return (
    <Dialog
      id="confirmation-delete-modal"
      header="Confirmação"
      visible={visible}
      footer={footer}
      closable={false}
      onHide={handleCancel}
    >
      <p>{message || "Deseja realmente remover o registro selecionado?"}</p>
      {children}
    </Dialog>
  );
};

export { ModalDeleteSeplag };
