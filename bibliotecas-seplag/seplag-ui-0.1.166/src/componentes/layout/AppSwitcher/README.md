# `layout/AppSwitcher/` — AppSwitcherSeplag

> Documentação completa do módulo de layout: [`../README.md`](../README.md)

## Objetivo

Seletor de sistemas: um ícone de grade na topbar abre um painel com cards de todos os
sistemas corporativos da SEPLAG, destacando o atual.

## Responsabilidade principal

Materializar a navegação entre os nove sistemas do ecossistema SEPLAG, funcionando como o
"app switcher" institucional.

## Arquivos

| Arquivo | Papel |
| --- | --- |
| [`index.tsx`](./index.tsx) | `AppSwitcherSeplag` + tipos (152 linhas) |
| [`sistemasSeplag.tsx`](./sistemasSeplag.tsx) | Catálogo institucional dos 9 sistemas |
| [`AppSwitcher.module.css`](./AppSwitcher.module.css) | Classe `noRipple` |
| [`style.module.css`](./style.module.css) | **Não importado** por `index.tsx` |

## Ponto de entrada

```ts
export { AppSwitcherSeplag } from "./layout/AppSwitcher";
export type { AppLinkTargetSeplag, AppSwitcherSeplagProps, AppSystemItemSeplag } from "./layout/AppSwitcher";
export { sistemasSeplag } from "./layout/AppSwitcher/sistemasSeplag";
```

## Funcionalidades

### Contrato de item

```ts
type AppLinkTargetSeplag = "_self" | "_blank";

interface AppSystemItemSeplag {
  id: string;
  label: string;
  url: string;
  target?: AppLinkTargetSeplag;   // default "_self"
  icon?: string | ReactNode;      // classe PrimeIcons ou componente
}
```

### Props

| Prop | Papel |
| --- | --- |
| `items` | Lista de sistemas |
| `currentSystem` | Rótulo do sistema atual — usado para destacar o card |
| `className` | Classe do wrapper |

### Comportamento

**Normalização** (`useMemo`): descarta itens sem `id`, `label` ou `url`.

**Destaque:** `item.label === currentSystem` → fundo `#1FA1FC66`; demais → `#FFF`.

**Navegação:**

```ts
target === "_blank"
  ? globalThis.open(item.url, "_blank", "noopener,noreferrer")
  : globalThis.location.assign(item.url);
```

`noopener,noreferrer` previne o ataque de *reverse tabnabbing*.

**Painel:** `OverlayPanel` com `dismissable` e `appendTo={document.body}`, fundo `#D8D8D8`,
cards de 130×110px em `flex-wrap` com `maxWidth: 26rem`, `role="menu"`.

**Ícone:** aceita `string` (classe PrimeIcons, renderizada com `fontSize: 3rem`) ou
`ReactNode` (renderizado diretamente).

### Catálogo institucional — [`sistemasSeplag.tsx`](./sistemasSeplag.tsx)

Nove sistemas, com `label` vindo de [`SistemaSeplagId`](../../../type/sistemas.ts) e ícones
de [`CustomIcons`](../../CustomIcons/):

| id | Sistema | URL | Ícone |
| --- | --- | --- | --- |
| 1 | GESTÃO DE PESSOAS | `/gestao/app` | `UserCheckSeplag` |
| 2 | FOLHA | `/folha/app` | `BankNoteSeplag` |
| 3 | PERÍCIA | `#` | `MedicalCircleSeplag` |
| 4 | CONSIGNADO | `#` | `CoinsHandSeplag` |
| 5 | CONTAGEM DE TEMPO | `#` | `ChartBreakoutSquareSeplag` |
| 6 | E-SOCIAL | `/integracao/app` | `StickerSquareSeplag` |
| 7 | APOSENTADORIA | `#` | `UserPlusSeplag` |
| 8 | CONFORMIDADE | `#` | `ClipboardCheckSeplag` |
| 9 | AUDITORIA | `#` | `FileCheckSeplag` |

Ícones instanciados com `React.createElement(Componente)`.

### Identificadores

`app-switcher-toggle` · `app-switcher-item-{id}`.

## Dependências

- **Externas:** `primereact/overlaypanel`, `react-icons/tb` (`TbGridDots`)
- **Internas:** [`../../Botao`](../../Botao/), [`../../CustomIcons`](../../CustomIcons/),
  [`../../../type/sistemas`](../../../type/sistemas.ts)

> **`react-icons` é peer dependency e este é seu único uso em toda a biblioteca** —
> um ícone de grade. Candidato a substituição por SVG local, eliminando um peer.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`../AppTopbar`](../AppTopbar/) | **Único consumidor interno** — monta o switcher ao lado do nome do sistema |
| [`../layout`](../layout/) | Repassa `sistemas` e `currentSystem` até o topbar |
| [`../../CustomIcons`](../../CustomIcons/) | Fornece os 9 ícones SVG do catálogo |
| [`../../../type/sistemas`](../../../type/sistemas.ts) | `SistemaSeplagId` — rótulos usados como identificadores |
| [`../../Botao`](../../Botao/) | `BotaoSeplag unstyled` para o gatilho e para cada card |

## Fluxos importantes

```
sistemasSeplag  (ou lista customizada do consumidor)
      │  AppSystemItemSeplag[]
      ▼
<LayoutSeplag sistemas={...} currentSystem={SistemaSeplagId.FOLHA}>
      └─ <AppTopbarSeplag systemas currentSystem>
            └─ <AppSwitcherSeplag items currentSystem>
                  │
                  ├─ normalized = items.filter(x => x?.id && x?.label && x?.url)
                  │
                  ├─ clique no TbGridDots → opRef.toggle(e)
                  │
                  └─ <OverlayPanel dismissable appendTo={document.body} role="menu">
                        cards 130×110 em flex-wrap (maxWidth 26rem)
                        ├─ destaque: item.label === currentSystem → fundo #1FA1FC66
                        ├─ ícone: typeof icon === "string" ? <i class={icon}/> : icon
                        └─ clique → goTo(item)
                              ├─ opRef.hide()
                              ├─ target "_blank" → globalThis.open(url, "_blank", "noopener,noreferrer")
                              └─ senão         → globalThis.location.assign(url)
```

> A navegação usa `location.assign`, ou seja, **recarrega a página inteira** — os sistemas
> SEPLAG são aplicações independentes, não rotas de um mesmo SPA.

## Arquivos críticos

- [`sistemasSeplag.tsx`](./sistemasSeplag.tsx) — catálogo institucional com URLs de produção
  embutidas; alterações afetam a navegação entre todos os sistemas.
- [`index.tsx`](./index.tsx) — a comparação `item.label === currentSystem` define o destaque
  do sistema atual.

## Débitos específicos desta pasta

| Severidade | Item |
| --- | --- |
| Média | **Destaque por rótulo, não por `id`** | `item.label === currentSystem` — o campo `id` existe mas não é usado na comparação. Alterar um rótulo em `SistemaSeplagId` quebra o destaque silenciosamente. Ver [`type/README.md`](../../../type/README.md). |
| Média | **URLs `#` para 6 dos 9 sistemas** | Clicar navega para `#`, sem feedback ao usuário de que o sistema ainda não está disponível. Não há `disabled` nem tooltip explicativo. |
| Média | **Peer pesado para uso mínimo** | `react-icons` inteiro como peer dependency por causa de `TbGridDots`. |
| Baixa | **Cores hardcoded** | `#D8D8D8` (fundo do painel), `#005494` (texto e ícones), `#1FA1FC66` (destaque), `#FFF`. Ver R-04. |
| Baixa | **Estilos inline extensos** | Cada card recebe ~15 propriedades inline, apesar de existirem dois CSS Modules na pasta. |
| Baixa | **`style.module.css` órfão** | Presente na pasta, não importado. |
| Baixa | **`role="menu"` sem `role="menuitem"`** | O contêiner declara `role="menu"`, mas os itens são botões sem `role="menuitem"` — semântica ARIA incompleta. |
| Baixa | **URLs absolutas fixas no catálogo** | `/gestao/app`, `/folha/app`, `/integracao/app` são caminhos relativos à raiz do domínio, embutidos no código da biblioteca — não configuráveis por ambiente. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa do módulo de layout
- [`../../../type/README.md`](../../../type/README.md) · [`../../CustomIcons/README.md`](../../CustomIcons/README.md)
- [Objetivo da biblioteca](../../../../docs/objetivo-da-biblioteca-de-componentes.md) — §1.1
