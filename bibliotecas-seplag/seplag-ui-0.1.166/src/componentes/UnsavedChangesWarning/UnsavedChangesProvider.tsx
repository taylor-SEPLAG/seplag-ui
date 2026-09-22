import { BotaoSeplag } from "@componentes/Botao";
import ModalSeplag from "@componentes/Modal";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEPLAG_PRIMARY } from "../../tokens";
import { UnsavedChangesContextSeplag } from "./context";

const DEFAULT_MESSAGE: React.ReactNode =
  "Você possui alterações não salvas. Se sair agora, os dados serão perdidos.";

interface PendingNav {
  state: unknown;
  title: string;
  url?: string | URL | null;
}

interface UnsavedChangesGuard {
  guard: (action: () => void) => void;
  Modal: React.ReactElement;
}

function useUnsavedChangesGuardSeplag(
  isDirtyRef: React.MutableRefObject<boolean>,
  discardAll: () => void,
  message = DEFAULT_MESSAGE,
): UnsavedChangesGuard {
  const [visible, setVisible] = useState(false);
  const pendingNavRef = useRef<PendingNav | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const isAllowedRef = useRef(false);
  const origPushStateRef = useRef(globalThis.history.pushState.bind(globalThis.history));
  const origReplaceStateRef = useRef(globalThis.history.replaceState.bind(globalThis.history));

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
    };
    globalThis.addEventListener("beforeunload", handler);
    return () => globalThis.removeEventListener("beforeunload", handler);
  }, [isDirtyRef, message]);

  useEffect(() => {
    origPushStateRef.current = globalThis.history.pushState.bind(globalThis.history);
    origReplaceStateRef.current = globalThis.history.replaceState.bind(globalThis.history);

    const makeInterceptor =
      (orig: typeof globalThis.history.pushState) =>
      (state: unknown, title: string, url?: string | URL | null) => {
        if (isAllowedRef.current || !isDirtyRef.current) {
          orig(state, title, url);
          return;
        }

        const targetPath = url
          ? new URL(url.toString(), globalThis.location.href).pathname
          : globalThis.location.pathname;

        if (targetPath === globalThis.location.pathname) {
          orig(state, title, url);
          return;
        }

        pendingNavRef.current = { state, title, url };
        pendingActionRef.current = null;
        setVisible(true);
      };

    globalThis.history.pushState = makeInterceptor(origPushStateRef.current);
    globalThis.history.replaceState = makeInterceptor(origReplaceStateRef.current);

    const onPopState = () => {
      if (isAllowedRef.current || !isDirtyRef.current) return;
      origPushStateRef.current(globalThis.history.state, "", globalThis.location.href);
      pendingNavRef.current = null;
      pendingActionRef.current = null;
      setVisible(true);
    };

    globalThis.addEventListener("popstate", onPopState);

    return () => {
      globalThis.history.pushState = origPushStateRef.current;
      globalThis.history.replaceState = origReplaceStateRef.current;
      globalThis.removeEventListener("popstate", onPopState);
    };
  }, [isDirtyRef]);

  const guard = (action: () => void) => {
    if (!isDirtyRef.current) {
      action();
      return;
    }
    pendingActionRef.current = action;
    pendingNavRef.current = null;
    setVisible(true);
  };

  const stay = () => {
    setVisible(false);
    pendingNavRef.current = null;
    pendingActionRef.current = null;
  };

  const leave = () => {
    const action = pendingActionRef.current;
    const pending = pendingNavRef.current;
    pendingActionRef.current = null;
    pendingNavRef.current = null;
    setVisible(false);
    discardAll();

    if (action) {
      isAllowedRef.current = true;
      action();
      setTimeout(() => {
        isAllowedRef.current = false;
      }, 0);
    } else if (pending) {
      isAllowedRef.current = true;
      origPushStateRef.current(pending.state, pending.title, pending.url);
      globalThis.dispatchEvent(new PopStateEvent("popstate", { state: pending.state }));
      setTimeout(() => {
        isAllowedRef.current = false;
      }, 0);
    } else {
      isAllowedRef.current = true;
      globalThis.history.go(-1);
      setTimeout(() => {
        isAllowedRef.current = false;
      }, 0);
    }
  };

  const customFooter = (
    <div className="modalSeplag-botoes-footer modalSeplag-botoes-footer-right">
      <BotaoSeplag
        id="unsaved-changes-modal-sim"
        data-testid="unsaved-changes-modal-sim"
        label="Sim"
        onClick={leave}
        outlined
        style={{
          color: SEPLAG_PRIMARY,
          borderColor: SEPLAG_PRIMARY,
          minWidth: 120,
        }}
      />
      <BotaoSeplag
        id="unsaved-changes-modal-cancelar"
        data-testid="unsaved-changes-modal-cancelar"
        label="Cancelar"
        onClick={stay}
        style={{ minWidth: 120 }}
        autoFocus
      />
    </div>
  );

  const Modal = (
    <ModalSeplag
      id="unsaved-changes-modal"
      visible={visible}
      titulo="Alterações não salvas"
      fechar={stay}
      customFooter={customFooter}
      alignFooter="right"
    >
      <div data-testid="unsaved-changes-modal-content">
        {message}
        <p>Deseja continuar?</p>
      </div>
    </ModalSeplag>
  );

  return { guard, Modal };
}

export function UnsavedChangesProviderSeplag({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isDirtyRef = useRef(false);
  const standaloneDirtyRef = useRef(false);
  const dirtySourcesRef = useRef(new Set<symbol>());
  const discardCallbacksRef = useRef(new Set<() => void>());

  const recompute = useCallback(() => {
    isDirtyRef.current = standaloneDirtyRef.current || dirtySourcesRef.current.size > 0;
  }, []);

  const setDirty = useCallback(
    (value: boolean) => {
      standaloneDirtyRef.current = value;
      recompute();
    },
    [recompute],
  );

  const registerDirty = useCallback(
    (key: symbol, dirty: boolean) => {
      if (dirty) {
        dirtySourcesRef.current.add(key);
      } else {
        dirtySourcesRef.current.delete(key);
      }
      recompute();
    },
    [recompute],
  );

  const onDiscard = useCallback((callback: () => void) => {
    discardCallbacksRef.current.add(callback);
    return () => discardCallbacksRef.current.delete(callback);
  }, []);

  const discardAll = useCallback(() => {
    discardCallbacksRef.current.forEach((callback) => callback());
    standaloneDirtyRef.current = false;
    dirtySourcesRef.current.clear();
    recompute();
  }, [recompute]);

  const { guard, Modal } = useUnsavedChangesGuardSeplag(isDirtyRef, discardAll);

  const contextValue = useMemo(
    () => ({ setDirty, registerDirty, onDiscard, guard }),
    [setDirty, registerDirty, onDiscard, guard],
  );

  return (
    <UnsavedChangesContextSeplag.Provider value={contextValue}>
      {Modal}
      {children}
    </UnsavedChangesContextSeplag.Provider>
  );
}
