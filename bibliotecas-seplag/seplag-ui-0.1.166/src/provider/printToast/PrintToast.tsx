import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { Toast } from "primereact/toast";
import type { ToastMessage } from "primereact/toast";
import { ContextToastSeplag } from "./ToastContext";
import { toastService } from "./toastService";

interface ToastProviderSeplagProps {
  readonly children: React.ReactNode;
}

export function ToastProviderSeplag({ children }: ToastProviderSeplagProps) {
  const toast = useRef<Toast>(null);

  const show = useCallback((msg: ToastMessage) => {
    toast.current?.show(msg);
  }, []);

  useEffect(() => {
    toastService.register(show);
    return () => toastService.unregister();
  }, [show]);

  const contextValue = useMemo(() => ({ toastRef: toast }), []);

  return (
    <ContextToastSeplag.Provider value={contextValue}>
      <Toast ref={toast} pt={{ icon: { style: { alignSelf: "center" } } }} />
      {children}
    </ContextToastSeplag.Provider>
  );
}

export default ToastProviderSeplag;
