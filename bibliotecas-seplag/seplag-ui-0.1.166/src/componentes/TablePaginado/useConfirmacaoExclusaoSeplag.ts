import { useState } from "react";

export function useConfirmacaoExclusaoSeplag<T>(handleDelete?: ((arg: T) => void) | null) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<T>();

  const abrir = (rowData: T) => {
    setSelected(rowData);
    setVisible(true);
  };

  const cancelar = () => setVisible(false);

  const confirmar = () => {
    setVisible(false);
    if (!selected) return;
    handleDelete?.(selected);
  };

  return { visible, abrir, cancelar, confirmar };
}
