import { useLocation, useNavigate } from "react-router-dom";
import { useBreadcrumbCurrentValueSeplag } from "./BreadcrumbCurrentContext";
import type { IMenuSeplag } from "../layout/Config/menu";
import type { BreadcrumbSeplagProps } from "./index";
import type { BreadcrumbCurrentItemSeplag } from "./BreadcrumbCurrentContext";

function findPath(items: IMenuSeplag[], pathname: string): IMenuSeplag[] | null {
  for (const item of items) {
    if (item.to === pathname) {
      return [item];
    }
    if (item.items) {
      const childPath = findPath(item.items, pathname);
      if (childPath) {
        return [item, ...childPath];
      }
    }
  }
  return null;
}

interface EntryWithTo {
  item: IMenuSeplag;
  ancestors: IMenuSeplag[];
}

function collectEntriesWithTo(items: IMenuSeplag[], ancestors: IMenuSeplag[] = []): EntryWithTo[] {
  return items.flatMap((item) => {
    const own = item.to ? [{ item, ancestors }] : [];
    const children = item.items ? collectEntriesWithTo(item.items, [...ancestors, item]) : [];
    return [...own, ...children];
  });
}

/**
 * Rotas de ação (`new`, `edit/:id`, `:id`) costumam ser irmãs da rota de listagem na árvore do
 * menu, não filhas dela (ex.: "Setor" e "Setor/new" têm o mesmo pai "Estrutura Organizacional").
 * Quando não há match exato, procura — entre todas as rotas com `to` — aquela cujo `to` é o
 * prefixo mais longo de `pathname`: essa é a rota "irmã" mais próxima (ex.: a listagem de Setor),
 * usada como item intermediário entre os ancestrais reais e a ação atual.
 *
 * Só considera candidatas rotas com `label` (a listagem) — rotas de ação como `.../new` também
 * têm `to` prefixo de rotas irmãs mais específicas (ex.: `.../new/:representanteId`, usada para
 * duplicar) e, sendo mais longas que a listagem, venceriam a busca pelo prefixo mais longo mesmo
 * não sendo o item correto para a trilha.
 */
function findNearestSiblingEntry(items: IMenuSeplag[], pathname: string): EntryWithTo | null {
  const candidates = collectEntriesWithTo(items).filter(
    ({ item }) =>
      item.to &&
      item.to !== "/" &&
      item.label != null &&
      pathname.startsWith(item.to) &&
      item.to !== pathname,
  );

  if (candidates.length === 0) return null;

  return candidates.reduce(
    (longest, candidate) =>
      (candidate.item.to?.length ?? 0) > (longest.item.to?.length ?? 0) ? candidate : longest,
    candidates[0],
  );
}

const ACTION_LABEL_BY_PATTERN: { pattern: RegExp; label: string }[] = [
  // `/new` também pode vir seguido de parâmetros extras (ex.: duplicar a partir de um
  // registro existente, `.../new/:representanteId`), por isso aceita segmentos após `/new`.
  { pattern: /\/new(\/|$)/, label: "Cadastrar" },
  { pattern: /\/edit(\/|$)/, label: "Editar" },
  { pattern: /\/nv(\/|$)/, label: "Nova Versão" },
  { pattern: /\/historico(\/|$)/, label: "Histórico" },
  { pattern: /\/view(\/|$)/, label: "Visualizar" },
  { pattern: /\/[^/]+$/, label: "Visualizar" },
];

/** Deriva um texto de ação (Cadastrar/Editar/Visualizar) a partir do padrão da rota. */
function guessActionLabel(routeTo: string): string | undefined {
  return ACTION_LABEL_BY_PATTERN.find(({ pattern }) => pattern.test(routeTo))?.label;
}

/**
 * Monta a prop `breadcrumb` do CardSeplag a partir de um menu `IMenuSeplag[]`: os ancestrais e o
 * item atual (label + ícone) vêm do menu casando com a rota ativa, e o ícone de casa já navega
 * para a raiz do menu (primeiro item).
 *
 * Rotas de ação (`new`, `edit/:id`, `:id`) normalmente têm `label: null` no menu e são irmãs da
 * rota de listagem (não filhas) — nesses casos a trilha usa os ancestrais da rota "irmã" mais
 * próxima (ex.: a listagem de Setor) mais o label dela como item intermediário, e o texto do item
 * atual segue esta prioridade: `current` explícito > contexto (`useSetBreadcrumbCurrentSeplag`) >
 * texto inferido do padrão da rota (`/new` → "Cadastrar", `/edit/...` → "Editar", `/:id` →
 * "Visualizar") > label da rota no menu.
 */
export function useBreadcrumbFromMenuSeplag(
  menu: IMenuSeplag[],
  current?: BreadcrumbCurrentItemSeplag | BreadcrumbCurrentItemSeplag[],
): Omit<BreadcrumbSeplagProps, "className" | "style"> {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const contextCurrent = useBreadcrumbCurrentValueSeplag();
  const exactPath = findPath(menu, pathname);
  const homeRoute = menu[0]?.to;
  const baseProps = { onHomeClick: homeRoute ? () => navigate(homeRoute) : undefined };

  // Rotas de ação (`new`, `edit/:id`, `:id`) costumam ter `label: null` e são irmãs da rota de
  // listagem na árvore do menu (não filhas dela) — mesmo com match exato de `to`, os ancestrais
  // do match exato pulam a listagem. Nesse caso usa a rota "irmã" mais próxima (a listagem) como
  // item intermediário, igual ao caso sem match exato.
  const exactRouteHasNoLabel = exactPath?.at(-1)?.label == null;
  const siblingEntry =
    !exactPath || exactRouteHasNoLabel ? findNearestSiblingEntry(menu, pathname) : null;

  // Rotas cuja URL não compartilha prefixo com nenhuma rota do menu (ex.: listagem em
  // "/eventos/painel-controle" e detalhe em "/eventos/importar/:id") não têm como ter os
  // ancestrais inferidos automaticamente. Nesse caso a página declara a trilha inteira via
  // `useSetBreadcrumbCurrentSeplag` (passando uma lista com os ancestrais + item atual).
  if (!exactPath && !siblingEntry) {
    if (contextCurrent && contextCurrent.length > 0) {
      return { ...baseProps, items: contextCurrent };
    }
    return { ...baseProps, items: [] };
  }

  const ancestorItems = siblingEntry
    ? [...siblingEntry.ancestors, siblingEntry.item]
    : exactPath!.slice(0, -1);
  const routeItem = exactPath?.at(-1);
  const routeTo = routeItem?.to ?? pathname;
  const guessedLabel = guessActionLabel(routeTo);
  let explicitCurrent: BreadcrumbCurrentItemSeplag[] | null = null;
  if (current != null) {
    explicitCurrent = Array.isArray(current) ? current : [current];
  }
  const currentItems: BreadcrumbCurrentItemSeplag[] = explicitCurrent ??
    contextCurrent ?? [
      {
        label: routeItem?.label || guessedLabel || "",
      },
    ];

  return {
    ...baseProps,
    items: [
      ...ancestorItems.map((item) => ({
        label: item.label ?? "",
        // O item de listagem (siblingEntry.item) vira ancestral quando a rota atual é uma
        // ação (Cadastrar/Editar/Visualizar) irmã dela — nesse caso não exibe ícone, só nos
        // demais ancestrais (grupos do menu, ex.: "Estrutura Organizacional").
        icon: item === siblingEntry?.item ? undefined : item.icon,
        onClick: item.to ? () => navigate(item.to!) : undefined,
      })),
      ...currentItems,
    ],
  };
}
