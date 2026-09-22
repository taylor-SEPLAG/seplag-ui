import { useCallback, useMemo, useState } from "react";
import type { IPermissionResponseSeplag } from "../../interfaces/permissao/permissionResponse";
import { BotaoIconSeplag } from "../Botao";
import { ModalDeleteSeplag } from "../ModalDelete";

export interface GroupActionsSeplagProps {
  permissions: Partial<IPermissionResponseSeplag>;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  deleteMessage?: string;
  rowId?: string | number;
}

const GroupActionsSeplag = ({
  permissions,
  onEdit,
  onDuplicate,
  onDelete,
  deleteMessage,
  rowId,
}: GroupActionsSeplagProps) => {
  const [visible, setVisible] = useState(false);

  const { podeEditar = false, podeIncluir = false, podeDeletar = false } = permissions ?? {};

  const actions = useMemo(
    () => [
      {
        key: "edit",
        show: Boolean(podeEditar && onEdit),
        severity: "warning",
        tooltip: "Editar",
        icon: "pi pi-pencil",
        onClick: onEdit,
      },
      {
        key: "duplicate",
        show: Boolean(podeIncluir && onDuplicate),
        severity: "secondary",
        tooltip: "Duplicar",
        icon: "pi pi-copy",
        onClick: onDuplicate,
      },
      {
        key: "delete",
        show: Boolean(podeDeletar && onDelete),
        severity: "danger",
        tooltip: "Excluir",
        icon: "pi pi-trash",
        onClick: () => setVisible(true),
        isDelete: true,
      },
    ],
    [podeEditar, podeIncluir, podeDeletar, onEdit, onDuplicate, onDelete],
  );

  const hasActions = actions.some((a) => a.show);
  const handleCancel = useCallback(() => setVisible(false), []);
  const handleConfirm = useCallback(() => {
    if (onDelete) onDelete();
    setVisible(false);
  }, [onDelete]);

  if (!hasActions) return null;

  const groupTestId = rowId == null ? "group-actions" : `group-actions-${rowId}`;

  return (
    <>
      <div className="flex flex-1 justify-content-end">
        <div className="flex gap-2">
          {actions.map(
            (a) =>
              a.show && (
                <BotaoIconSeplag
                  key={a.key}
                  id={`${groupTestId}-${a.key}`}
                  data-testid={`${groupTestId}-${a.key}`}
                  severity={a.severity as any}
                  type="button"
                  tooltip={a.tooltip}
                  icon={a.icon}
                  onClick={a.onClick}
                />
              ),
          )}
        </div>
      </div>

      {podeDeletar && onDelete && (
        <ModalDeleteSeplag
          id={`${groupTestId}-delete-modal`}
          visible={visible}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          message={deleteMessage}
        />
      )}
    </>
  );
};

export { GroupActionsSeplag };
