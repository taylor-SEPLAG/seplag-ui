# `layout/` — Casca da aplicação

## Objetivo

Fornecer a casca visual completa dos sistemas SEPLAG: sidebar com menu hierárquico e
controle de permissão, barra superior com seletor de sistemas, perfil de usuário com troca
de senha e de vínculo, e rodapé institucional.

## Responsabilidade principal

Permitir que um sistema novo tenha a identidade e a navegação padrão SEPLAG montando um
único componente (`LayoutSeplag`). Não autentica nem roteia — recebe callbacks e delega.

## Estrutura

```
layout/
├── layout/Layout.tsx          ← LayoutSeplag: orquestrador
├── AppTopbar/index.tsx        ← barra superior + hambúrguer
├── AppSwitcher/               ← seletor de sistemas (grade de 9 cards)
│   ├── index.tsx
│   └── sistemasSeplag.tsx     ← catálogo institucional dos 9 sistemas
├── AppProfile/AppProfile.tsx  ← avatar, menu de perfil, modais de senha e vínculo
├── AppMenu/AppMenu.tsx        ← contêiner do menu
├── AppSubmenu/AppSubmenu.tsx  ← lista recursiva (nível N)
├── AppSubmenuItem/AppSubmenuItem.tsx ← item recursivo (nível N+1)
├── AppFooter/AppFooter.tsx    ← rodapé
└── Config/
    ├── menu.ts                ← modelo de menu + filtro por permissão
    ├── institucional.ts       ← texto do órgão
    └── sidebarFlyoutRegistry.ts ← mutex de flyout aberto
```

## Pontos de entrada

```ts
// componentes/index.ts
export { LayoutSeplag }        from "./layout/layout/Layout";
export { AppTopbarSeplag }     from "./layout/AppTopbar";
export { AppSwitcherSeplag }   from "./layout/AppSwitcher";
export { AppMenuSeplag }       from "./layout/AppMenu/AppMenu";
export { AppSubmenuSeplag }    from "./layout/AppSubmenu/AppSubmenu";
export { AppSubmenuItemSeplag } from "./layout/AppSubmenuItem/AppSubmenuItem";
export { AppProfileSeplag }    from "./layout/AppProfile/AppProfile";
export { AppFooterSeplag }     from "./layout/AppFooter/AppFooter";
export { sistemasSeplag }      from "./layout/AppSwitcher/sistemasSeplag";
export { SEPLAG_NOME_ORGAO_SEPLAG } from "./layout/Config/institucional";
export { deepCloneMenuSeplag, getPermissionsSeplag,
         hasPermissionByKeysSeplag, hasPermissionByRouteListSeplag } from "./layout/Config/menu";
export type { IMenuSeplag, IVinculoSeplag } from "./layout/Config/menu";
```

## Funcionalidades existentes

### `LayoutSeplag` — [`layout/Layout.tsx`](./layout/Layout.tsx)

**Props principais:**

| Grupo | Props |
| --- | --- |
| Identidade | `currentSystem`, `ambienteSistema`, `sistemas`, `logoSrc`, `logoHref` |
| Menu | `menuItems`, `menuMode` (`"static"` \| `"overlay"`) |
| Conteúdo | `children` (fallback: `<Outlet/>` do react-router-dom) |
| Rodapé | `footerText` (default `SEPLAG_NOME_ORGAO_SEPLAG`), `footerChildren` |
| Perfil | `nomeApresentacao`, `numrVinculoAtual`, `vinculos`, `avatarSrc`, `onLogout`, `onAlterarSenha`, `onSelecionarVinculo` |

**Modos de menu:**

| Modo | Desktop | Mobile (`innerWidth <= 1024`) |
| --- | --- | --- |
| `static` (default) | Sidebar empurra o conteúdo; hambúrguer recolhe/expande com animação | Sidebar sobreposta com backdrop |
| `overlay` | Sidebar flutua sobre o conteúdo; clicar fora fecha | Idem |

Estado interno: `staticMenuInactive`, `overlayMenuActive`, `mobileMenuActive`,
`layoutColorMode` (**fixo em `"light"`**, sem setter).

Classes derivadas: `layout-wrapper`, `layout-static`/`layout-overlay`,
`layout-static-sidebar-inactive`, `layout-overlay-sidebar-active`,
`layout-mobile-sidebar-active`, `layout-sidebar-collapsed`, `layout-sidebar-light`/`-dark`.

`isCollapsed` (apenas `menuMode === "static"` + desktop + inativo) é propagado para
`AppProfileSeplag` e `AppMenuSeplag`, ativando o modo *flyout*.

### Menu e permissão — [`Config/menu.ts`](./Config/menu.ts)

```ts
interface IMenuSeplag {
  label: string | null;   // null → nunca aparece no menu
  icon: string;
  items?: IMenuSeplag[];
  nameRef?: string | null;
  to?: string;            // rota react-router
  url?: string;           // link externo (usado quando não há `to`)
  component?: ReactNode;
  visibleOnRouter?: boolean;
  visibleOnMenu?: boolean;
  badgeStyleClass?: string;
  permissionKeys?: string[] | null;
  disabled?: boolean;
}
```

| Função | Comportamento |
| --- | --- |
| `getPermissionsSeplag(storageKey = "permissions_key")` | Lê e faz `JSON.parse` do `localStorage` |
| `hasPermissionByKeysSeplag(keys, permissions?, adminRole = "ROLE_ADMIN")` | `false` se `keys` for nulo ou `permissions` não for array; `ROLE_ADMIN` libera tudo; senão `keys.some(k => permissions.includes(k))` |
| `hasPermissionByRouteListSeplag(menu, permissions?, adminRole?)` | Percorre a árvore marcando `visibleOnRouter`/`visibleOnMenu`; filtra filhos sem permissão; **oculta o pai que ficou sem filhos visíveis**; `label === null` sempre oculta do menu |
| `deepCloneMenuSeplag(items)` | Clone profundo dos itens e de `items[]` |

> ⚠️ **`hasPermissionByRouteListSeplag` MUTA o array recebido** (atribui `visibleOnRouter`,
> `visibleOnMenu` e reatribui `item.items`). Sempre chame sobre `deepCloneMenuSeplag(menu)`.
> Regra arquitetural **RA-11**.

### Menu recursivo

`AppMenuSeplag` → `AppSubmenuSeplag` ↔ `AppSubmenuItemSeplag` formam uma **recursão mútua**
que renderiza profundidade arbitrária.

- `AppMenuSeplag` pré-filtra: mantém itens sem `items` ou com ao menos um filho `visibleOnRouter`.
- `AppSubmenuSeplag` filtra `visibleOnMenu !== false && label !== null`, mantém o conjunto
  `activeLabels` (rótulos abertos) e sincroniza com a rota atual quando `location.pathname` muda.
- `AppSubmenuItemSeplag` renderiza `<Link to>` (rota interna), `<a href={url}>` (externo) ou
  só o conteúdo. Ícone `pi pi-circle-on` recebe tratamento especial (6px, `#7EA9C9`).

**Detecção de rota ativa** (`isRouteActive`): normaliza (remove query/hash e barra final),
compara igualdade, prefixo (`/rota/`) e converte segmentos `:param` em `[^/]+` para casar
rotas dinâmicas. Comparação *case-insensitive*.

**Sidebar recolhida:** itens raiz com filhos abrem um `OverlayPanel` posicionado via
`applyOverlayPosition` (até 5 tentativas em `requestAnimationFrame`), com `<Tooltip>` no
ícone. `sidebarFlyoutRegistry` garante **um único flyout aberto por vez**.

### `AppProfileSeplag`

Avatar (default `assets/img/default-avatar.jpg`), nome, vínculo atual e menu com 4 opções:
Perfil, Alterar Senha, Alterar Vínculo, Sair. Contém dois `ModalSeplag`:

- **Trocar a Senha** — 3 campos `Password` do PrimeReact dentro de `RotuloSeplag`;
  ao confirmar chama `onAlterarSenha(atual, nova, confirmar)` e limpa os campos.
- **Alterar Vínculo** — `DataTable` com seleção única, filtrando `statVinculo === "ATIVO"`;
  colunas `numrVinculo`, `statVinculo`, `unidade.descUnidade`, `orgao.descOrgao`.

### `AppTopbarSeplag` e `AppSwitcherSeplag`

Topbar: botão hambúrguer animado (CSS Module `menu-btn`/`open`), texto
`"{currentSystem} - {ambienteSistema}"` e o `AppSwitcherSeplag`.

Switcher: ícone `TbGridDots` (react-icons) abre um `OverlayPanel` com cards de 130×110px.
Filtra itens sem `id`/`label`/`url`. Destaca o sistema atual comparando
`item.label === currentSystem` (fundo `#1FA1FC66`). Navega com `globalThis.open(...,"_blank","noopener,noreferrer")`
ou `globalThis.location.assign(url)`.

`sistemasSeplag.tsx` traz o catálogo dos 9 sistemas, com ícones de [`CustomIcons`](../CustomIcons/)
e rótulos de [`type/sistemas`](../../type/sistemas.ts).

### `AppFooterSeplag`

`<div className="layout-footer">{children ?? <span>{text}</span>}</div>`.

## Dependências

### Externas
- `react-router-dom` — `Outlet`, `Link`, `useLocation` — **o layout exige um Router no host**
- `primereact` — `OverlayPanel`, `Tooltip`, `CSSTransition`, `Password`, `DataTable`, `Column`
- `react-icons/tb` — `TbGridDots` (único uso deste peer em toda a lib)

### Internas
- [`../Botao`](../Botao/), [`../Modal`](../Modal/), [`../Rotulo`](../Rotulo/), [`../CustomIcons`](../CustomIcons/)
- [`../../type/sistemas`](../../type/sistemas.ts)
- Assets: `Logo_Branco_Estado_MT.png`, `default-avatar.jpg`

### Estilos
- [`layout/Layout.css`](./layout/Layout.css) — **global** (classes `layout-*`)
- [`layout/Layout.module.scss`](./layout/Layout.module.scss) — presente, **não importado**
- CSS Modules: `AppTopbar.module.css`, `AppProfile.module.css`, `AppSwitcher.module.css`,
  `AppSwitcher/style.module.css`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`provider/AuthThanosProvider`](../../provider/AuthThanosProvider/) | Monta o layout após autenticar |
| [`NotFound`](../NotFound/) | Usa `SEPLAG_NOME_ORGAO_SEPLAG` de `Config/institucional` |
| [`PermissaoNegadaRedirect`](../PermissaoNegadaRedirect/) | Complementa o filtro de menu para acesso direto por URL |
| [`type/sistemas`](../../type/) | Rótulos usados como identificadores |

## Fluxos importantes

```
Aplicação consumidora
  menuBase: IMenuSeplag[]  (constante do módulo)
      │
      ├─ deepCloneMenuSeplag(menuBase)      ← OBRIGATÓRIO (RA-11)
      ▼
  hasPermissionByRouteListSeplag(clone)     ← muta o clone
      │  marca visibleOnMenu/visibleOnRouter, poda ramos sem permissão
      ▼
  <LayoutSeplag menuItems={menuFiltrado} menuMode="static" ...>
      ├── <AppProfileSeplag collapsed={isCollapsed}>
      ├── <AppMenuSeplag items collapsed>
      │      └── <AppSubmenuSeplag root>
      │             └── <AppSubmenuItemSeplag>  ⇄ recursão
      │                    ├─ collapsed + tem filhos → OverlayPanel (flyout)
      │                    │      └── registerOpenFlyout(hide)  ← fecha o anterior
      │                    └─ senão → CSSTransition + AppSubmenuSeplag
      ├── <AppTopbarSeplag> → <AppSwitcherSeplag>
      ├── {children ?? <Outlet/>}
      └── <AppFooterSeplag>
```

## Arquivos críticos

| Arquivo | Por quê |
| --- | --- |
| [`Config/menu.ts`](./Config/menu.ts) | Define o modelo de menu e o filtro de permissão (com mutação) |
| [`layout/Layout.tsx`](./layout/Layout.tsx) | Orquestra 5 componentes e todo o estado de navegação |
| [`layout/Layout.css`](./layout/Layout.css) | CSS global; classes `layout-*` sem escopo |
| [`AppSubmenuItem.tsx`](./AppSubmenuItem/AppSubmenuItem.tsx) | Recursão + posicionamento manual de overlay |

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Alta** | **Mutação do menu de entrada** | `hasPermissionByRouteListSeplag` altera o array recebido. Chamado sobre uma constante de módulo, corrompe o menu entre navegações. `deepCloneMenuSeplag` existe para mitigar, mas nada no tipo ou na assinatura força seu uso. |
| Média | **`isRouteActive` duplicado** | ~30 linhas **idênticas** em `AppSubmenu.tsx` e `AppSubmenuItem.tsx`. Correções precisam ser aplicadas duas vezes. Ver R-06. |
| Média | **`applyOverlayPosition` duplicado** | Mesma lógica de posicionamento fixo + loop de `requestAnimationFrame` (5 tentativas) em `AppSubmenuItem.tsx` e `AppProfile.tsx`. Depende de `cssText +=` com `!important`, sensível a mudanças internas do PrimeReact. |
| Média | **`isDesktop()` lê `window` no render** | `Layout.tsx:71` chama `window.innerWidth > 1024` durante a renderização, sem listener de `resize`. Redimensionar a janela não recalcula `isSidebarOpen`/`isCollapsed` até o próximo render por outro motivo. |
| Média | **`onMenuItemClick(event: any)`** | Tipo `any` na assinatura pública de `AppMenuSeplagProps` e no encadeamento até `AppSubmenuSeplag`. |
| Baixa | **Tema escuro inacessível** | `layoutColorMode` é `useState("light")` sem setter; as classes `layout-sidebar-dark` existem no CSS mas nunca são ativadas. |
| Baixa | **Cores hardcoded** | `#7EA9C9` (ícone de submenu), `#D8D8D8`, `#005494`, `#1FA1FC66` (AppSwitcher). Ver R-04. |
| Baixa | **`Layout.module.scss` órfão** | Arquivo presente, não importado — o layout usa `Layout.css` global. |
| Baixa | **`getPermissionsSeplag` sem `try/catch`** | `JSON.parse` de valor corrompido no `localStorage` lança exceção não tratada. |
| Baixa | **Identidade do sistema por rótulo** | `AppSwitcherSeplag` compara `item.label === currentSystem` em vez de usar `item.id`. Ver [`type/README.md`](../../type/README.md). |
| Baixa | **Item "Perfil" sem ação** | O `BotaoSeplag` de "Perfil" em `AppProfile` não tem `onClick`. |
| Baixa | **Sem testes** | Nenhum componente de layout tem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §7.4, RA-11, R-06
- [Objetivo da biblioteca](../../../docs/objetivo-da-biblioteca-de-componentes.md) — P-05, P-06
- [`type/README.md`](../../type/README.md) · [`CustomIcons/README.md`](../CustomIcons/README.md)
