import { createContext } from "react";
import type { Toast } from "primereact/toast";
import type React from "react";

export const ContextToastSeplag = createContext<{
  toastRef: React.RefObject<Toast | null> | null;
}>({
  toastRef: null,
});

export default ContextToastSeplag;
