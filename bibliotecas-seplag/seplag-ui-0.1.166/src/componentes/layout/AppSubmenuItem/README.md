# `layout/AppSubmenuItem/` — AppSubmenuItemSeplag

> Documentação completa do módulo de layout: [`../README.md`](../README.md)

## Objetivo

Renderizar um item individual do menu lateral: link de rota, link externo ou agrupador, com
submenu animado (sidebar expandida) ou flyout em overlay (sidebar recolhida).

## Responsabilidade principal

Metade da **recursão mútua** do menu, junto com [`AppSubmenuSeplag`](../AppSubmenu/).
É o arquivo com maior densidade de lógica do módulo de layout (221 linhas).

## Ponto de entrada

[`AppSubmenuItem.tsx`](./AppSubmenuItem.tsx).

```ts
export { AppSubmenuItemSeplag } from "./layout/AppSubmenuItem/AppSubmenuItem";
```

> O tipo `AppSubmenuItemSeplagProps` é **local** ao arquivo, não exportado.

## Funcionalidades

### Props (interface local)

| Prop | Papel |
| --- | --- |
| `item` | `IMenuSeplag` |
| `className` | Classe do `<li>` |
| `root` | Item de nível raiz |
| `active` | Ramo aberto (vem do `activeLabels` do pai) |
| `collapsed` | Sidebar recolhida |
| `onMenuClick` | Callback de navegação (propagado do `LayoutSeplag`) |
| `onMenuItemClick` | Callback de alternância do ramo (do `AppSubmenuSeplag`) |

### Três formas de link — `renderLink`

| Condição | Elemento |
| --- | --- |
| Sem `item.to` | `<a href={item.url}>` — link externo ou agrupador |
| `item.to` + `label != null` + `visibleOnMenu` | `<Link to={item.to}>` do react-router |
| Demais | Apenas o conteúdo, sem elemento clicável |

Classes do link: `active-route` (rota casa) e `active-menuitem-routerlink`
(`active && item.to`).

### Ícone especial

`item.icon === "pi pi-circle-on"` recebe tratamento diferenciado: `fontSize: 6px`,
`color: #7EA9C9` — usado como marcador de subitem.

### Dois modos de submenu

**Sidebar expandida** — `CSSTransition` do PrimeReact:

```tsx
<CSSTransition nodeRef={nodeRef} classNames="layout-submenu-collapse"
               timeout={{ enter: 350, exit: 250 }} in={active} unmountOnExit>
  <div ref={nodeRef}>
    <AppSubmenuSeplag items={item.items} onMenuItemClick={onMenuClick} root={false} />
  </div>
</CSSTransition>
```

**Sidebar recolhida** (`isCollapsedRoot && hasChildren`) — `OverlayPanel` posicionado
manualmente:

```tsx
const handleClick = (e) => {
  e.preventDefault();
  const rect = e.currentTarget.getBoundingClientRect();
  overlayRef.current?.toggle(e);
  let attempts = 0;
  const tryApply = () => {
    applyOverlayPosition(rect);
    attempts += 1;
    if (attempts < 5) requestAnimationFrame(tryApply);
  };
  requestAnimationFrame(tryApply);
};

const applyOverlayPosition = (rect) => {
  overlayEl.style.cssText +=
    `position:fixed!important;top:${rect.top}px!important;left:${rect.right + 2}px!important;` +
    `margin:0!important;z-index:1100!important;`;
};
```

O loop de 5 tentativas em `requestAnimationFrame` reaplica a posição porque o `OverlayPanel`
recalcula seu próprio posicionamento após a montagem.

### Coordenação de flyouts

```tsx
onShow={() => { setIsOverlayOpen(true);  registerOpenFlyout(hideSelf); }}
onHide={() => { setIsOverlayOpen(false); unregisterFlyout(hideSelf);  }}
```

[`sidebarFlyoutRegistry`](../Config/sidebarFlyoutRegistry.ts) fecha automaticamente o flyout
anterior. Clicar em um item dentro do flyout o fecha (`handleOverlayMenuClick`).

### Tooltip no modo recolhido

`<Tooltip target={`#${itemId}`} content={item.label} position="right" showDelay={200} />` —
renderizado apenas quando `isCollapsedRoot && item.label && !isOverlayOpen`, evitando
tooltip sobre o flyout aberto.

### Identificadores

- `id`: `` `sidebar-item-${useId().replace(/:/g, "")}` `` — único por instância
- `data-testid`: `` `sidebar-item-${slug}` `` — derivado de `item.to ?? nameRef ?? label ?? "item"`,
  normalizado para `[a-zA-Z0-9-]`
- `<li>`: `` `${itemTestId}-li` ``

## Dependências

- **Externas:** `primereact/csstransition`, `primereact/overlaypanel`, `primereact/tooltip`,
  `react-router-dom` (`Link`, `useLocation`), `react` (`useId`, `useRef`, `useState`, `useCallback`)
- **Internas:** [`../AppSubmenu/AppSubmenu`](../AppSubmenu/) (recursão),
  [`../Config/menu`](../Config/menu.ts) (tipo),
  [`../Config/sidebarFlyoutRegistry`](../Config/sidebarFlyoutRegistry.ts)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`../AppSubmenu`](../AppSubmenu/) | Outra metade da recursão mútua; fornece `active` e `onMenuItemClick` |
| [`../Config/sidebarFlyoutRegistry`](../Config/sidebarFlyoutRegistry.ts) | Garante um único flyout aberto |
| [`../Config/menu`](../Config/menu.ts) | Modelo `IMenuSeplag` (`to`, `url`, `icon`, `disabled`, `items`) |
| [`../AppProfile`](../AppProfile/) | Usa o mesmo padrão de flyout e o mesmo registry |
| `react-router-dom` | `Link` e `useLocation` |

## Fluxos importantes

**Sidebar expandida (`collapsed = false`):**

```
clique no item
   ├─ item.items? → onMenuItemClick alterna o ramo em activeLabels (no AppSubmenu)
   └─ folha       → onMenuClick({ originalEvent, item: [item] })  → LayoutSeplag fecha overlay/mobile
                    <Link to> navega
   │
   └─ <CSSTransition in={active} timeout={{ enter: 350, exit: 250 }} unmountOnExit>
         └─ <AppSubmenuSeplag items={item.items} root={false} />
```

**Sidebar recolhida (`isCollapsedRoot && hasChildren`):**

```
clique no item raiz
   ├─ e.preventDefault()
   ├─ rect = getBoundingClientRect()
   ├─ overlayRef.toggle(e)
   └─ requestAnimationFrame × 5 → applyOverlayPosition(rect)
                                    style.cssText += position:fixed; top; left: rect.right+2; z-index:1100

onShow  → registerOpenFlyout(hideSelf)   ← fecha o flyout anterior
onHide  → unregisterFlyout(hideSelf)

clique em item dentro do flyout → handleOverlayMenuClick → overlayRef.hide() + onMenuClick
```

## Arquivos críticos

- [`AppSubmenuItem.tsx`](./AppSubmenuItem.tsx) — 221 linhas com recursão, posicionamento
  manual de overlay e detecção de rota. É o arquivo de maior densidade lógica do módulo de
  layout e o mais sensível a atualizações do PrimeReact.

## Débitos específicos deste arquivo

| Severidade | Item |
| --- | --- |
| **Média** | **`isRouteActive` duplicado** — cópia literal (~30 linhas) da mesma função em [`AppSubmenu.tsx`](../AppSubmenu/AppSubmenu.tsx). Ver R-06. |
| **Média** | **Posicionamento manual do overlay** — `style.cssText +=` com `!important` e loop de 5 `requestAnimationFrame` é acoplamento direto a detalhes internos do `OverlayPanel` do PrimeReact. Frágil a atualizações da biblioteca. O mesmo código está duplicado em [`AppProfile.tsx`](../AppProfile/AppProfile.tsx). |
| Média | `z-index: 1100` fixo no `cssText` — precisa ser mantido em sincronia com a escala definida em [`AppPrimeReactProviderSeplag`](../../../provider/AppPrimeReactProvider/), que não é lida aqui. |
| Baixa | `style.cssText +=` **acumula** declarações a cada reposicionamento, fazendo a string crescer indefinidamente enquanto o elemento existir. |
| Baixa | Cor `#7EA9C9` hardcoded para o ícone de subitem. Ver R-04. |
| Baixa | `onMenuClick` tipado com `originalEvent: any`. |
| Baixa | `AppSubmenuItemSeplagProps` não exportado, apesar de o componente estar no barrel. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa do módulo de layout
- [`../AppSubmenu/README.md`](../AppSubmenu/README.md) · [`../Config/README.md`](../Config/README.md)
- [Arquitetura da biblioteca](../../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-06
