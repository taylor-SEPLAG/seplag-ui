# `layout/Config/` — Configuração e regras do layout

> Documentação completa do módulo de layout: [`../README.md`](../README.md)

## Objetivo

Concentrar o modelo de dados do menu, as regras de permissão de navegação, o texto
institucional compartilhado e o registro de flyouts da sidebar.

## Responsabilidade principal

É onde vive a **lógica não-visual** do layout. Nenhum arquivo desta pasta renderiza JSX.

## Arquivos

| Arquivo | Papel | Público |
| --- | --- | --- |
| [`menu.ts`](./menu.ts) | Modelo `IMenuSeplag`/`IVinculoSeplag` + 4 funções de permissão | ✔ |
| [`institucional.ts`](./institucional.ts) | `SEPLAG_NOME_ORGAO_SEPLAG` | ✔ |
| [`sidebarFlyoutRegistry.ts`](./sidebarFlyoutRegistry.ts) | Mutex de flyout aberto | ✘ (interno) |

## Funcionalidades

### [`menu.ts`](./menu.ts)

Modelo e funções documentados em detalhe em [`../README.md`](../README.md). Resumo:

| Função | Comportamento |
| --- | --- |
| `getPermissionsSeplag(storageKey = "permissions_key")` | Lê e faz `JSON.parse` do `localStorage` |
| `hasPermissionByKeysSeplag(keys, permissions?, adminRole = "ROLE_ADMIN")` | `ROLE_ADMIN` libera tudo; senão `keys.some(...)` |
| `hasPermissionByRouteListSeplag(menu, ...)` | Filtra a árvore de menu — **muta a entrada** |
| `deepCloneMenuSeplag(items)` | Clone profundo, obrigatório antes do filtro |

**Regras de visibilidade aplicadas por `hasPermissionByRouteListSeplag`:**

1. Item com `permissionKeys` → `visibleOnRouter = visibleOnMenu = hasPermissionByKeysSeplag(...)`
2. Item sem `permissionKeys` (agrupador) → visível por padrão
3. `label === null` → `visibleOnMenu = false` (mas pode continuar roteável)
4. Filhos são filtrados recursivamente; **pai sem nenhum filho visível é ocultado**

> O comentário no código sinaliza como reverter a regra 4:
> *"PARA VOLTAR AO COMPORTAMENTO ANTERIOR (Mostrar pai mesmo sem filhos permitidos):
> Remova ou comente o bloco 'if' abaixo."*

### [`institucional.ts`](./institucional.ts)

```ts
export const SEPLAG_NOME_ORGAO_SEPLAG =
  "SEPLAG - SSCPG - Superintendência de Sistemas Corporativos de Planejamento e Gestão";
```

Consumidores: [`LayoutSeplag`](../layout/Layout.tsx) (rodapé, via `footerText` default) e
[`NotFoundSeplag`](../../NotFound/) (via `orgaoLabel` default). O JSDoc do arquivo declara o
propósito: *"para evitar divergência de redação"*.

### [`sidebarFlyoutRegistry.ts`](./sidebarFlyoutRegistry.ts)

Registry de módulo (13 linhas) que garante **um único flyout aberto** na sidebar recolhida:

```ts
let activeHide: HideFn | null = null;

export function registerOpenFlyout(hide) {
  if (activeHide && activeHide !== hide) activeHide();   // fecha o anterior
  activeHide = hide;
}

export function unregisterFlyout(hide) {
  if (activeHide === hide) activeHide = null;
}
```

Consumidores: [`AppSubmenuItem`](../AppSubmenuItem/) e [`AppProfile`](../AppProfile/),
nos callbacks `onShow`/`onHide` do `OverlayPanel`.

## Dependências

Nenhuma dependência externa. `menu.ts` referencia `React.ReactNode` apenas como tipo em
`IMenuSeplag.component`.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`../AppSubmenu`](../AppSubmenu/) | Filtra por `visibleOnMenu` e `label !== null` |
| [`../AppMenu`](../AppMenu/) | Pré-filtra por `visibleOnRouter` |
| [`../AppSubmenuItem`](../AppSubmenuItem/) · [`../AppProfile`](../AppProfile/) | Consumidores de `sidebarFlyoutRegistry` |
| [`../layout`](../layout/) | Recebe `menuItems` e usa `SEPLAG_NOME_ORGAO_SEPLAG` como `footerText` default |
| [`../../NotFound`](../../NotFound/) | Usa `SEPLAG_NOME_ORGAO_SEPLAG` como `orgaoLabel` default |
| [`../../PermissaoNegadaRedirect`](../../PermissaoNegadaRedirect/) | Complementa o filtro de menu para acesso direto por URL |

## Fluxos importantes

**Filtragem de menu por permissão:**

```
menuBase: IMenuSeplag[]           (constante do módulo, no consumidor)
      │
      ├─ deepCloneMenuSeplag(menuBase)            ← OBRIGATÓRIO (RA-11)
      ▼
hasPermissionByRouteListSeplag(clone, permissions?, adminRole?)
      │
      ├─ para cada item (recursivo):
      │     permissionKeys? → hasPermissionByKeysSeplag → visibleOnRouter/visibleOnMenu
      │     sem permissionKeys → visível (agrupador)
      │     label === null → visibleOnMenu = false
      │     filhos filtrados; pai sem filho visível → oculto
      │
      └─ retorna apenas os itens com visibleOnMenu === true
                  │
                  ▼
          <LayoutSeplag menuItems={...} />
```

**Coordenação de flyouts na sidebar recolhida:**

```
AppSubmenuItem A abre  → registerOpenFlyout(hideA)   → activeHide = hideA
AppProfile abre        → registerOpenFlyout(hideP)   → hideA() é chamado; activeHide = hideP
AppProfile fecha       → unregisterFlyout(hideP)     → activeHide = null
```

## Arquivos críticos

- [`menu.ts`](./menu.ts) — define o modelo de menu de toda a plataforma e **muta** o array
  recebido; erros aqui produzem itens visíveis a quem não deveria vê-los.
- [`sidebarFlyoutRegistry.ts`](./sidebarFlyoutRegistry.ts) — 13 linhas de estado global que
  garantem um único flyout aberto.

## Débitos específicos desta pasta

| Severidade | Item |
| --- | --- |
| **Alta** | `hasPermissionByRouteListSeplag` **muta o array recebido** (atribui `visibleOnRouter`/`visibleOnMenu`, reatribui `item.items`). `deepCloneMenuSeplag` existe para mitigar, mas nada na assinatura ou no tipo obriga seu uso. Regra arquitetural **RA-11**. |
| Baixa | `getPermissionsSeplag` faz `JSON.parse` sem `try/catch` — valor corrompido no `localStorage` lança exceção não tratada. |
| Baixa | `sidebarFlyoutRegistry` é singleton de módulo: duas instâncias de `LayoutSeplag` na mesma página compartilham o mesmo mutex. |
| Baixa | `IMenuSeplag.component?: React.ReactNode` mistura configuração de menu com definição de rota; nada na biblioteca consome esse campo. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa do módulo de layout
- [Arquitetura da biblioteca](../../../../docs/arquitetura-da-biblioteca-de-componentes.md) — RA-11
- [Objetivo da biblioteca](../../../../docs/objetivo-da-biblioteca-de-componentes.md) — P-06
