# `layout/layout/` — LayoutSeplag

> Documentação completa do módulo de layout: [`../README.md`](../README.md)

## Objetivo

Orquestrador da casca da aplicação: monta sidebar, topbar, perfil, área de conteúdo e rodapé,
e gerencia todo o estado de abertura/recolhimento do menu.

## Responsabilidade principal

É o **único ponto de montagem** que uma aplicação consumidora precisa para ter a identidade
e a navegação padrão SEPLAG.

## Arquivos

| Arquivo | Papel |
| --- | --- |
| [`Layout.tsx`](./Layout.tsx) | `LayoutSeplag` (171 linhas) |
| [`Layout.css`](./Layout.css) | CSS **global** — classes `layout-*` |
| [`Layout.module.scss`](./Layout.module.scss) | **Órfão** — não importado |

## Funcionalidades

Ver [`../README.md`](../README.md) para a tabela completa de props, modos de menu e classes
CSS derivadas.

Resumo do estado interno:

| Estado | Papel |
| --- | --- |
| `staticMenuInactive` | Sidebar recolhida no modo `static` (desktop) |
| `overlayMenuActive` | Sidebar aberta no modo `overlay` (desktop) |
| `mobileMenuActive` | Sidebar aberta no mobile |
| `layoutColorMode` | **Fixo em `"light"`**, sem setter |

Derivações:

```
sidebarOpenOnDesktop = menuMode === "overlay" ? overlayMenuActive : !staticMenuInactive
isSidebarOpen        = isDesktop() ? sidebarOpenOnDesktop : mobileMenuActive
isCollapsed          = menuMode === "static" && staticMenuInactive && isDesktop()
showBackdrop         = overlayMenuActive || mobileMenuActive
```

`isCollapsed` é propagado para [`AppProfileSeplag`](../AppProfile/) e
[`AppMenuSeplag`](../AppMenu/), ativando o modo *flyout*.

## Dependências

- **Externas:** `react-router-dom` (`Outlet`) — **exige um Router no host**
- **Internas:** [`AppFooter`](../AppFooter/), [`AppMenu`](../AppMenu/),
  [`AppProfile`](../AppProfile/), [`AppSwitcher`](../AppSwitcher/) (tipo),
  [`AppTopbar`](../AppTopbar/), [`Config/institucional`](../Config/institucional.ts),
  [`Config/menu`](../Config/menu.ts) (tipos)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`provider/AuthThanosProvider`](../../../provider/AuthThanosProvider/) | Monta o layout somente após a autenticação concluir |
| [`Config/menu`](../Config/menu.ts) | Produz o `menuItems` já filtrado por permissão |
| [`UnsavedChangesWarning`](../../UnsavedChangesWarning/) | Provider normalmente montado entre o Router e o layout |
| [`NotFound`](../../NotFound/) | Rota `*` registrada como filha do layout |
| [`type/sistemas`](../../../type/sistemas.ts) | Origem dos valores de `currentSystem` |

## Fluxos importantes

```
<UnsavedChangesProviderSeplag>
  └─ <LayoutSeplag currentSystem ambienteSistema sistemas menuItems ...>
        │  estado: staticMenuInactive | overlayMenuActive | mobileMenuActive
        │
        ├─ <nav class={sidebarClasses}>
        │     ├─ logo (com ou sem logoHref)
        │     ├─ <AppProfileSeplag collapsed={isCollapsed} ... />
        │     └─ <AppMenuSeplag items={menuItems} collapsed={isCollapsed}
        │                       onMenuItemClick={onMenuItemClick} />
        │
        ├─ backdrop (overlayMenuActive || mobileMenuActive) → closeMenus()
        │
        └─ <div class="layout-main">
              ├─ <AppTopbarSeplag onToggleMenu isSidebarVisible ... />
              ├─ <div class="layout-content">{children ?? <Outlet/>}</div>
              └─ <AppFooterSeplag text={footerText}>{footerChildren}</AppFooterSeplag>
```

`onToggleMenu` decide o que alternar conforme `isDesktop()` e `menuMode`;
`onMenuItemClick` fecha os menus flutuantes ao clicar em um item **folha** (`!event.item?.items`).

## Arquivos críticos

- [`Layout.tsx`](./Layout.tsx) — orquestra 5 componentes e todo o estado de navegação;
  regressões aqui afetam a casca de todos os sistemas.
- [`Layout.css`](./Layout.css) — CSS **global**; as classes `layout-*` não são escopadas e
  podem colidir com estilos da aplicação consumidora.

## Débitos específicos deste arquivo

| Severidade | Item |
| --- | --- |
| Média | `isDesktop()` lê `window.innerWidth` **durante o render** (linha 71), sem listener de `resize`. Redimensionar a janela não recalcula `isSidebarOpen`/`isCollapsed`. |
| Média | `onMenuItemClick(event: any)` — tipo `any` na cadeia de callbacks do menu. |
| Baixa | `layoutColorMode` é `useState("light")` sem setter; as classes `layout-sidebar-dark` do CSS nunca são ativadas. |
| Baixa | `Layout.module.scss` está na pasta e não é importado. |
| Baixa | `Layout.css` é global — classes `layout-*` sem escopo. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa do módulo de layout
- [Arquitetura da biblioteca](../../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §7.4
