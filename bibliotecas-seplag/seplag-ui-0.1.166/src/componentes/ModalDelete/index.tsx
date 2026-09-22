import { Dialog } from "primereact/dialog";
import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "../Botao";

const DEFAULT_MESSAGE = "Deseja realmente remover o registro selecionado?";

export interface ModalDeleteSeplagProps {
  id?: string;
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: ReactNode;
}

const ModalDeleteSeplag = ({
  id = "confirmation-delete-modal",
  visible,
  onConfirm,
  onCancel,
  message,
}: ModalDeleteSeplagProps) => {
  const handleConfirm = useCallback(() => onConfirm?.(), [onConfirm]);
  const handleCancel = useCallback(() => onCancel?.(), [onCancel]);

  const footer = useMemo(
    () => (
      <div>
        <BotaoSalvarSeplag
          id={`${id}-confirmar`}
          data-testid={`${id}-confirmar`}
          label="Sim"
          type="button"
          icon="pi pi-check"
          iconPos="left"
          onClick={handleConfirm}
          className="margin-app-entre-button"
        />

        <BotaoVoltarSeplag
          id={`${id}-cancelar`}
          data-testid={`${id}-cancelar`}
          label="Não"
          type="button"
          icon="pi pi-times"
          iconPos="left"
          onClick={handleCancel}
        />
      </div>
    ),
    [handleConfirm, handleCancel, id],
  );

  return (
    <Dialog
      id={id}
      data-testid={id}
      header="Confirmação"
      visible={visible}
      footer={footer}
      closable={false}
      onHide={handleCancel}
    >
      {typeof message === "string" ? (
        <p dangerouslySetInnerHTML={{ __html: message || DEFAULT_MESSAGE }} />
      ) : (
        <p>{message || DEFAULT_MESSAGE}</p>
      )}
    </Dialog>
  );
};

export { ModalDeleteSeplag };
