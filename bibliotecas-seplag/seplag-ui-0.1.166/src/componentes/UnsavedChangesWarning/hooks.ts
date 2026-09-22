import { useContext, useEffect, useRef } from "react";
import { UnsavedChangesContextSeplag } from "./context";
import type { UnsavedChangesContextValueSeplag } from "./types";

export function useUnsavedChangesSeplag(): UnsavedChangesContextValueSeplag {
  const context = useContext(UnsavedChangesContextSeplag);
  if (!context) {
    throw new Error("useUnsavedChanges deve ser usado dentro de um <UnsavedChangesProvider>.");
  }
  return context;
}

export function useUnsavedChangesSyncSeplag(isDirty: boolean, onDiscard?: () => void): void {
  const { registerDirty, onDiscard: registerOnDiscard } = useUnsavedChangesSeplag();
  const keyRef = useRef(Symbol("useUnsavedChangesSync"));
  const onDiscardRef = useRef(onDiscard);

  useEffect(() => {
    onDiscardRef.current = onDiscard;
  }, [onDiscard]);

  useEffect(() => {
    const key = keyRef.current;
    registerDirty(key, isDirty);
    return () => registerDirty(key, false);
  }, [isDirty, registerDirty]);

  useEffect(() => registerOnDiscard(() => onDiscardRef.current?.()), [registerOnDiscard]);
}
