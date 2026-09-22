# `layout/AppSubmenu/` — AppSubmenuSeplag

> Documentação completa do módulo de layout: [`../README.md`](../README.md)

## Objetivo

Renderizar uma lista `<ul>` de itens de menu em qualquer nível da hierarquia, mantendo o
estado de quais ramos estão abertos e sincronizando-o com a rota atual.

## Responsabilidade principal

Metade da **recursão mútua** que sustenta menus de profundidade arbitrária:

```
AppSubmenuSeplag  →  AppSubmenuItemSeplag  →  AppSubmenuSeplag  →  ...
```

## Ponto de entrada

[`AppSubmenu.tsx`](./AppSubmenu.tsx) — 138 linhas.

```ts
export { AppSubmenuSeplag } from "./layout/AppSubmenu/AppSubmenu";
```

> O tipo `AppSubmenuSeplagProps` é **local** ao arquivo, não exportado nem incluído no barrel.

## Funcionalidades

### Props (interface local)

| Prop | Papel |
| --- | --- |
| `items` | `IMenuSeplag[] \| null \| undefined` |
| `onMenuItemClick` | `(event: { originalEvent: any; item: IMenuSeplag[] }) => void` |
| `root` | Indica se é o nível raiz |
| `className` | Classe do `<ul>` |
| `collapsed` | Modo sidebar recolhida |

### Filtragem

```ts
const visibleItems = props.items?.filter(
  (item) => item.visibleOnMenu !== false && item.label !== null,
);
```

### Estado de ramos abertos

`activeLabels: Set<string>` — inicializado com os rótulos dos itens que contêm a rota atual
(`hasActiveRoute`, recursivo).

**Sincronização com a rota** usando o padrão *derived state* (sem `useEffect`):

```tsx
const [trackedPath, setTrackedPath] = useState(location.pathname);

if (trackedPath !== location.pathname) {
  setTrackedPath(location.pathname);
  const routeItem = visibleItems?.find((item) => hasActiveRoute(item));
  setActiveLabels((current) => {
    const next = new Set(current);
    visibleItems?.forEach((item) => {
      if (!item.label || item === routeItem) return;
      if (!hasActiveRoute(item)) next.delete(item.label);   // fecha ramos irrelevantes
    });
    if (routeItem?.label) next.add(routeItem.label);        // abre o ramo da rota
    return next;
  });
}
```

Clicar em um item **alterna** seu rótulo no conjunto. Itens `disabled` fazem
`event.preventDefault()`.

### Detecção de rota ativa — `isRouteActive`

1. `normalize(value)` — remove query/hash e barras finais; `""` vira `"/"`
2. Comparação exata (case-insensitive)
3. Prefixo: `currentPath.startsWith(targetPath + "/")`
4. Padrão dinâmico: segmentos iniciados por `:` viram `[^/]+`; o resto é escapado com
   `escapeRegExp` e a expressão é ancorada (`^...$`)

`hasActiveRoute(item)` aplica `isRouteActive` ao item e, recursivamente, aos filhos.

### Classe do item

```ts
styleClass = [item.badgeStyleClass, active && !item.to ? "active-menuitem" : ""]
```

`active-menuitem` só é aplicada a **agrupadores** (itens sem `to`).

## Dependências

- **Externas:** `react-router-dom` (`useLocation`), `react`
- **Internas:** [`../AppSubmenuItem/AppSubmenuItem`](../AppSubmenuItem/),
  [`../Config/menu`](../Config/menu.ts) (tipo)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`../AppSubmenuItem`](../AppSubmenuItem/) | Outra metade da recursão mútua |
| [`../AppMenu`](../AppMenu/) | Monta a instância raiz (`root={true}`) |
| [`../Config/menu`](../Config/menu.ts) | Origem de `visibleOnMenu`, `label` e `to` |
| `react-router-dom` | `useLocation` — detecção da rota ativa |

## Fluxos importantes

```
props.items
   │
   ├─ visibleItems = items.filter(i => i.visibleOnMenu !== false && i.label !== null)
   │
   ├─ activeLabels: Set<string>
   │     inicial → rótulos de itens cujo ramo contém a rota atual (hasActiveRoute)
   │
   ├─ location.pathname mudou?  (derived state, sem useEffect)
   │     ├─ fecha ramos que não contêm a nova rota
   │     └─ abre o ramo da nova rota
   │
   ├─ clique em item → alterna o rótulo em activeLabels (item.disabled → preventDefault)
   │
   └─ <ul className={props.className}>
         └─ para cada item: <AppSubmenuItemSeplag active={activeLabels.has(item.label)} ... />
                                 └─ recursão: <AppSubmenuSeplag items={item.items} root={false} />
```

## Arquivos críticos

- [`AppSubmenu.tsx`](./AppSubmenu.tsx) — concentra o estado de ramos abertos e a detecção de
  rota ativa; erros aqui deixam o menu dessincronizado da navegação.

## Débitos específicos deste arquivo

| Severidade | Item |
| --- | --- |
| **Média** | **`isRouteActive` duplicado** — as ~30 linhas da função (normalize + escapeRegExp + toRoutePattern) são **idênticas** às de [`AppSubmenuItem.tsx`](../AppSubmenuItem/AppSubmenuItem.tsx). Correções precisam ser aplicadas nos dois arquivos. Ver R-06. |
| Média | `key={item.label + "_" + i}` — chave baseada em rótulo + índice; itens sem `label` (que já foram filtrados) ou com rótulos repetidos geram chaves instáveis. |
| Média | Funções `normalize`, `escapeRegExp` e `toRoutePattern` são **redefinidas a cada chamada** de `isRouteActive`, que por sua vez é chamada para cada item em cada render. |
| Baixa | `activeLabels` é indexado por `label` (string), não por identidade — dois itens com o mesmo rótulo em ramos diferentes abrem e fecham juntos. |
| Baixa | `onMenuItemClick` tipado com `originalEvent: any`. |
| Baixa | `AppSubmenuSeplagProps` não é exportado, embora o componente esteja no barrel público. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa do módulo de layout
- [`../AppSubmenuItem/README.md`](../AppSubmenuItem/README.md)
- [Arquitetura da biblioteca](../../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-06
