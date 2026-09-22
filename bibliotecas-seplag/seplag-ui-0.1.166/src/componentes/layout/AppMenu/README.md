# `layout/AppMenu/` — AppMenuSeplag

> Documentação completa do módulo de layout: [`../README.md`](../README.md)

## Objetivo

Contêiner do menu lateral. Faz uma pré-filtragem dos itens e delega a renderização recursiva
ao [`AppSubmenuSeplag`](../AppSubmenu/).

## Responsabilidade principal

Camada fina entre o [`LayoutSeplag`](../layout/) e a recursão de menu. Não conhece rotas nem
permissões — apenas o campo `visibleOnRouter` já calculado.

## Ponto de entrada

[`AppMenu.tsx`](./AppMenu.tsx) — 39 linhas.

```ts
export { AppMenuSeplag } from "./layout/AppMenu/AppMenu";
export type { AppMenuSeplagProps } from "./layout/AppMenu/AppMenu";
```

## Funcionalidades

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `items` | — | `IMenuSeplag[]` já filtrado por permissão |
| `onMenuItemClick` | — | `(event: any) => void` — propagado até os itens folha |
| `collapsed` | `false` | Modo sidebar recolhida (ativa flyouts) |

### Pré-filtragem

```tsx
const filteredMenu = useMemo(
  () => items.filter((item) => !item?.items || item.items.some((el) => el?.visibleOnRouter)),
  [items],
);
```

Mantém itens **sem filhos** (folhas) ou com **ao menos um filho** marcado `visibleOnRouter`.

> Note que esta regra usa `visibleOnRouter`, enquanto o [`AppSubmenuSeplag`](../AppSubmenu/)
> filtra por `visibleOnMenu`. `hasPermissionByRouteListSeplag` normalmente atribui o mesmo
> valor aos dois campos, mas os critérios são distintos.

### Estrutura

```html
<div class="layout-menu-container" id="app-menu" data-testid="app-menu" style="text-align: center">
  <AppSubmenuSeplag items={filteredMenu} className="layout-menu" root collapsed />
</div>
```

## Dependências

- **Externas:** `react` (`useMemo`)
- **Internas:** [`../AppSubmenu/AppSubmenu`](../AppSubmenu/), [`../Config/menu`](../Config/menu.ts) (tipo)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`layout/Layout.tsx`](../layout/) | Monta este componente na sidebar |
| [`AppSubmenu`](../AppSubmenu/) | Renderização recursiva |
| [`Config/menu`](../Config/menu.ts) | Origem de `visibleOnRouter`/`visibleOnMenu` |

## Fluxos importantes

```
LayoutSeplag
   menuItems (já filtrado por hasPermissionByRouteListSeplag)
      │
      ▼
AppMenuSeplag
   filteredMenu = items.filter(item => !item.items || item.items.some(el => el.visibleOnRouter))
      │
      ▼
<div class="layout-menu-container" id="app-menu">
   └─ <AppSubmenuSeplag items={filteredMenu} className="layout-menu" root collapsed />
            └─ <AppSubmenuItemSeplag> ⇄ <AppSubmenuSeplag>   (recursão mútua)
```

O `onMenuItemClick` recebido é repassado sem alteração até os itens folha, onde o
`LayoutSeplag` o usa para fechar a sidebar em overlay/mobile.

## Arquivos críticos

- [`AppMenu.tsx`](./AppMenu.tsx) — ponto único onde a pré-filtragem de itens acontece;
  um item removido aqui nunca chega à recursão.

## Débitos específicos deste arquivo

| Severidade | Item |
| --- | --- |
| Média | `onMenuItemClick: (event: any) => void` — `any` na API pública, propagado por toda a cadeia do menu. |
| Baixa | Dois critérios de visibilidade em pontos diferentes (`visibleOnRouter` aqui, `visibleOnMenu` no `AppSubmenu`), sem documentação da diferença. |
| Baixa | `style={{ textAlign: "center" }}` inline no contêiner, em vez de classe CSS. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa do módulo de layout
- [`../Config/README.md`](../Config/README.md)
