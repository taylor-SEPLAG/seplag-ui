import { useContext } from "react";
import { ContextToastSeplag } from "../../provider/printToast/ToastContext";
import type { ToastMessage } from "primereact/toast";

const TOAST_PRESET = {
  created: "cadastrado",
  updated: "atualizado",
  deleted: "excluído",
};

export function useToastSeplag() {
  const context = useContext(ContextToastSeplag);
  const toastRef = context?.toastRef;

  const show = (severity: ToastMessage["severity"], detail: string, summary: string) => {
    toastRef?.current?.show({ severity, summary, detail, life: 5000 });
  };

  return {
    toastPreset: (preset: keyof typeof TOAST_PRESET) =>
      show("success", `Registro ${TOAST_PRESET[preset]} com sucesso!`, "Sucesso"),
    toastSucesso: (detail: string, summary = "Sucesso") => show("success", detail, summary),
    toastErro: (detail: string, summary = "Erro") => show("error", detail, summary),
    toastAtencao: (detail: string, summary = "Atenção") => show("warn", detail, summary),
    printToast: (arg: ToastMessage) => toastRef?.current?.show(arg),
  };
}
