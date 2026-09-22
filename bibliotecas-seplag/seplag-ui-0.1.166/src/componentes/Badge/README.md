# `Badge/` — BadgeSeplag e variantes

## Objetivo

Exibir rótulos compactos de estado, categoria ou marcação — com variantes semânticas de cor,
truncamento com tooltip, ícone, botão de remoção e comportamento clicável opcional.

## Responsabilidade principal

Padronizar a sinalização visual de status em toda a plataforma. É o substituto recomendado
para os componentes depreciados [`StatusByFilterChip`](../StatusByFilterChip/) e
[`StatusByDataFimChip`](../StatusByDataFimChip/).

## Ponto de entrada

[`index.tsx`](./index.tsx) — 366 linhas.

```ts
export { BadgeAmarelo, BadgeInfo, BadgeOutline, BadgeSeplag, BadgeVerde, BadgeVermelho } from "./Badge";
export type { BadgeSeplagProps } from "./Badge";
```

## Funcionalidades existentes

### Variantes semânticas

Cada `variant` resolve um trio de cores de [`tokens/colors`](../../tokens/colors.ts):

| Variant | texto / fundo / borda |
| --- | --- |
| `success` | `SEPLAG_SUCCESS_TEXT` / `_BG` / `_BORDER` |
| `warning` | `SEPLAG_WARNING_TEXT` / `_BG` / `_BORDER` |
| `error` | `SEPLAG_ERROR_TEXT` / `_BG` / `_BORDER` |
| `info` | `SEPLAG_INFO_TEXT` / `_BG` / `_BORDER` |
| `neutral` (default) | `SEPLAG_GRAY_600` / `SEPLAG_WHITE` / `SEPLAG_BORDER_LIGHT` |

`color`, `bg` e `border` sobrescrevem individualmente. Se `border` não for informado e a
variante não tiver borda, o fallback é `` `${color}50` `` (alfa hexadecimal).

### Wrappers pré-configurados

| Componente | Configuração |
| --- | --- |
| `BadgeInfo` | `variant="info"` |
| `BadgeVerde` | `variant="success"`, label default `"Sim"` |
| `BadgeAmarelo` | `variant="warning"`, label default `"Sim"` |
| `BadgeVermelho` | `variant="error"` |
| `BadgeOutline` | `variant="neutral"` |

Todos usam `Omit<BadgeSeplagProps, "color" \| "bg" \| "border">` — as cores da variante não
podem ser sobrescritas nos wrappers.

### Formatação do rótulo

Precedência: `uppercase` → `capitalize` (default `true`) → literal.
`capitalizeLabel` deixa a primeira letra maiúscula e **converte o resto para minúsculas**.

`maxLength` trunca com `...` e move o texto completo para o tooltip.
`resolveDisplayTooltip` combina texto truncado e `tooltip`: `` `${fullLabel} - ${tooltip}` ``.

### Modos de renderização

| Condição | Elemento |
| --- | --- |
| `isClickable` (`!disabled && (clickable ?? Boolean(onClick))`) | `<BotaoChipSeplag>` com `tooltip`/`tooltipOptions` do PrimeReact |
| Caso contrário | `<span>` + `<Tooltip target={#badgeId}>` separado, quando há tooltip |

### Demais props

| Prop | Default | Efeito |
| --- | --- | --- |
| `size` | `"sm"` | `xs` (`text-xs`, padding `1px 6px`), `sm` (`text-sm`, `3px 10px`), `md` (`text-base`, `4px 14px`) |
| `minWidth` | `120` | Largura mínima |
| `maxWidth` | `"100%"` | Com `maxWidth`, aplica `whiteSpace: normal` + `wordBreak: break-word` |
| `textAlign` | `"center"` | Mapeado para `justifyContent` (`flex-start`/`center`/`flex-end`) |
| `fontWeight` | — | `true` → 700; senão 500 |
| `icon` | — | `<i>` em `inline-flex` com `marginTop: 2` |
| `removable` + `onRemove` | `false` | Botão `pi pi-times` com `e.stopPropagation()` |
| `disabled` | `false` | `opacity: 0.5`, `pointerEvents: none` |
| `active` + `activeBg` | `false` | Sobrescreve fundo, cor (`activeColor`, default `#ffffff`) e borda |
| `customStyle` | — | Espalhado por último — sobrescreve tudo |

### Identificação

`id ?? \`badge-${useId().replaceAll(":", "")}\``. O botão de remover deriva
`` `${badgeId}-remover` ``.

## Dependências

### Externas
- `primereact/tooltip` — `Tooltip`
- `react` — `useId`

### Internas
- [`@componentes/Botao`](../Botao/) — `BotaoChipSeplag` (modo clicável), `BotaoSeplag` (remover)
- [`../../tokens/colors`](../../tokens/colors.ts) — 14 tokens
- [`Badge.module.css`](./Badge.module.css) — classe `noRipple`

## Módulos relacionados

| Consumidor | Uso |
| --- | --- |
| [`Fields/utils/inactiveOption`](../Fields/utils/inactiveOption.tsx) | Badge "Inativo" (`variant="error"`, `size="xs"`, `minWidth={0}`) |
| [`DropdownBaseLegal`](../DropdownBaseLegal/) | `ItemTemplate` e `ChipSelecionado` (cores custom por tipo de documento) |
| [`StatusByFilterChip`](../StatusByFilterChip/) · [`StatusByDataFimChip`](../StatusByDataFimChip/) | `minWidth={120}` — **depreciados** |
| [`PaginaInicial/Cronograma`](../PaginaInicial/Cronograma/) | Status de evento |

## Fluxos importantes

```
props → resolveBaseColors(variant, color, bg, border)
      → isActiveCustom = active && Boolean(activeBg) ? sobrescreve os 3
      → formattedLabel = uppercase | capitalize | literal
      → resolveDisplayLabel(label, maxLength) → { displayLabel, fullLabel }
      → resolveDisplayTooltip(fullLabel, tooltip)
      → buildBadgeStyle({...}) → CSSProperties (customStyle por último)
      │
      ├─ isClickable → <BotaoChipSeplag tooltip tooltipOptions>
      └─ senão       → <Tooltip target="#id"/> + <span>
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — a resolução de cores define a semântica de status da plataforma.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Sombreamento de identificador** | A variável local `const style = buildBadgeStyle(...)` (linha 293) sombreia o import `import style from "./Badge.module.css"` (linha 21). O CSS Module só é acessível na função `renderRemoveButton`, que está fora do escopo do componente — funciona, mas é frágil. |
| Média | **Tooltip via seletor de id** | `<Tooltip target={`#${badgeId}`}>` cria uma instância de tooltip por badge. Em uma tabela com dezenas de badges, o custo se acumula. |
| Baixa | **`capitalize` default `true` altera o texto** | `capitalizeLabel` faz `slice(1).toLowerCase()`, então `"CPF do Servidor"` vira `"Cpf do servidor"`. Siglas exigem `capitalize={false}` ou `uppercase`. |
| Baixa | **`minWidth` default de 120px** | Badges curtos ficam desproporcionalmente largos por default. Vários consumidores passam `minWidth={0}` explicitamente. |
| Baixa | **`maxWidth` truthy** | `whiteSpace: maxWidth ? "normal" : "nowrap"` — como o default é `"100%"` (truthy), o comportamento padrão é sempre quebrar linha. |
| Baixa | **`variant` sem `neutral` explícito nos wrappers** | `BadgeOutline` e `BadgeSeplag` sem `variant` produzem o mesmo resultado. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md)
- [`tokens/README.md`](../../tokens/README.md) · [`Botao/README.md`](../Botao/README.md)
