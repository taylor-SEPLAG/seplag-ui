import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { BreadcrumbItemSeplag } from "./index";

export type BreadcrumbCurrentItemSeplag = BreadcrumbItemSeplag;

interface BreadcrumbCurrentContextValueSeplag {
  current: BreadcrumbCurrentItemSeplag[] | null;
  setCurrent: (current: BreadcrumbCurrentItemSeplag[] | null) => void;
}

const BreadcrumbCurrentContext = createContext<BreadcrumbCurrentContextValueSeplag | null>(null);

/**
 * Provedor do item atual do breadcrumb automático (`LayoutSeplag` com `showBreadcrumb`). Deve
 * envolver as rotas da aplicação (ex.: acima do `<BrowserRouter>` ou logo abaixo dele).
 */
export function BreadcrumbCurrentProviderSeplag({ children }: Readonly<{ children: ReactNode }>) {
  const [current, setCurrent] = useState<BreadcrumbCurrentItemSeplag[] | null>(null);
  const value = useMemo(() => ({ current, setCurrent }), [current]);

  return (
    <BreadcrumbCurrentContext.Provider value={value}>{children}</BreadcrumbCurrentContext.Provider>
  );
}

/** Usado internamente pelo `LayoutSeplag` para ler os itens atuais declarados pela página ativa. */
export function useBreadcrumbCurrentValueSeplag(): BreadcrumbCurrentItemSeplag[] | null {
  return useContext(BreadcrumbCurrentContext)?.current ?? null;
}

/**
 * Declara o(s) item(ns) atual(is) (label + ícone opcional) do breadcrumb automático do
 * `LayoutSeplag` para a página em que é chamado. Necessário em rotas sem label próprio no menu
 * (ex.: `new`, `edit/:id`), já que o menu não tem texto para essas telas. Aceita um único item ou
 * uma lista, para páginas que precisam encadear mais de um item final (ex.: etapa + subetapa).
 * Limpa automaticamente ao desmontar a página.
 */
export function useSetBreadcrumbCurrentSeplag(
  current: BreadcrumbCurrentItemSeplag | BreadcrumbCurrentItemSeplag[],
): void {
  const context = useContext(BreadcrumbCurrentContext);
  const items = Array.isArray(current) ? current : [current];
  const depsKey = items
    .map((item) => `${item.label}|${item.icon ?? ""}|${item.href ?? ""}`)
    .join(",");

  useEffect(() => {
    context?.setCurrent(items);
    return () => context?.setCurrent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);
}
