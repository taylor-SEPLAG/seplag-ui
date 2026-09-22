import type { ToastMessage } from "primereact/toast";

type ShowFn = (msg: ToastMessage) => void;

let _show: ShowFn | null = null;

export const toastService = {
  register(fn: ShowFn) {
    _show = fn;
  },
  unregister() {
    _show = null;
  },
  show(msg: ToastMessage) {
    _show?.(msg);
  },
};
