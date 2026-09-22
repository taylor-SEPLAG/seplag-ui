# `AutoComplete/` — AutoCompleteSeplag

## Objetivo

Campo de busca com sugestões, construído sobre o `AutoComplete` do PrimeReact, com controle
de abertura do painel, limite de itens renderizados, botão de limpar seleção e três tamanhos
visuais.

## Responsabilidade principal

Resolver problemas de usabilidade do `AutoComplete` original: painel que não abre quando
esperado, listas grandes que travam a renderização e ausência de botão para limpar um
objeto selecionado.

> **Diferença em relação ao [`SearchFieldSeplag`](../Fields/SearchField.tsx):**
> `SearchFieldSeplag` é um campo de formulário (usa `RotuloSeplag` + `Controller` + `rules`).
> `AutoCompleteSeplag` é um **wrapper de baixo nível** do widget, sem rótulo nem integração
> com `react-hook-form` — projetado para composição livre.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 249 linhas.

```ts
export { AutoCompleteSeplag } from "./AutoComplete";
export type { AutoCompleteSeplagProps } from "./AutoComplete";
```

Implementado com `React.forwardRef`, tipado como
`AutoCompleteSeplagComponent` para preservar os genéricos `<T, M extends boolean>`
(item e multi-seleção) através do `forwardRef`.

## Funcionalidades existentes

### Props próprias

Estende `Omit<AutoCompleteProps<T, M>, "completeMethod">`, adicionando:

| Prop | Default | Papel |
| --- | --- | --- |
| `completeMethod` | — | Assinatura **simplificada**: `(query: string) => void \| Promise<void>` em vez de receber o evento |
| `ShowClearSelection` | `false` | Exibe "×" para limpar quando o valor é um objeto |
| `componentSize` | `"md"` | `sm` / `md` / `lg` — aplica `p-inputtext-sm\|lg` e `p-button-sm\|lg` |
| `helpText` | — | `<small className="text-600 mt-2 block">` abaixo do campo |
| `minWidth` | — | Largura mínima do wrapper |
| `maxRenderedItems` | `50` | Corta `suggestions` antes de renderizar |

Defaults sobrescritos do PrimeReact: `delay: 0` (em vez de 300), `minLength: 0`,
`dropdownIcon: "pi pi-search"`, `showEmptyMessage: true`,
`emptyMessage: "Nenhum item encontrado"`.

### Controle de abertura do painel

Este é o comportamento central do componente:

```tsx
const shouldOpenOverlay =
  focused &&
  !props.disabled &&
  queryValue.length >= (props.minLength ?? 0) &&
  ((limitedSuggestions?.length ?? 0) > 0 || shouldShowEmptyState);

React.useEffect(() => {
  if (shouldOpenOverlay) autoCompleteRef.current.show();
}, [shouldOpenOverlay, limitedSuggestions]);
```

Estados internos: `focused` (`onFocus`/`onBlur`) e `hasSearched` (ligado em
`completeMethod`, desligado em `onSelect` e quando o texto é apagado).

`shouldShowEmptyState = showEmptyMessage && hasSearched && !hasSelectedObjectValue` — a
mensagem "nenhum item" só aparece **após uma busca real**, nunca no primeiro foco.

### Botão de limpar seleção

Aparece quando `ShowClearSelection && !multiple && typeof value === "object" && value !== null && !disabled`.
Posicionado absolutamente (`right: 2.75rem`, ao lado do botão de dropdown) e emite um
evento de mudança **sintético** com `value: null`, replicando a forma do
`AutoCompleteChangeEvent`:

```tsx
emitChange({
  originalEvent: event,
  value: null,
  stopPropagation, preventDefault,
  target: { name, id, value: null },
});
props.onClear?.(event);
```

`data-testid`: `` `${inputId ?? id ?? name ?? "seplag-autocomplete"}-limpar` ``.

### Composição de `pt`

Preserva o `pt` do consumidor e apenas **acrescenta** a classe de tamanho ao
`dropdownButton.root`, com verificação de tipo (`typeof ... === "object"`) antes de espalhar.

### Wrapper de largura

Envolve o widget em `<div>` + `<span position: relative>`. Se `props.style.width` existir
ou a classe `w-full` estiver presente, usa `display: block` e propaga a largura; senão
`inline-flex`.

## Dependências

### Externas
- `primereact/autocomplete` — `AutoComplete`, `AutoCompleteProps`
- `primereact/utils` — `classNames`

### Internas
- [`../Botao`](../Botao/) — `BotaoSeplag` (botão de limpar)
- [`AutoComplete.module.css`](./AutoComplete.module.css) — classe `noRipple`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Fields/SearchField`](../Fields/SearchField.tsx) | Alternativa integrada a `react-hook-form`, sobre o mesmo widget |
| [`Fields/DropdownField`](../Fields/DropdownField.tsx) | Para listas fechadas já carregadas |
| [`ListaBuscaAcao`](../ListaBuscaAcao/) | Padrão comum: `AutoCompleteSeplag` para buscar + `ListaBuscaAcaoSeplag` para exibir e adicionar resultados |

Nenhum componente da biblioteca consome `AutoCompleteSeplag` internamente.

## Fluxos importantes

```
usuário digita
   → completeMethod(query)          [setHasSearched(true)]
   → consumidor busca no backend
   → atualiza `suggestions`
   → limitedSuggestions = suggestions.slice(0, maxRenderedItems)
   → shouldOpenOverlay recalculado
   → useEffect → autoCompleteRef.current.show()

usuário seleciona
   → onSelect                       [setHasSearched(false)]
   → value passa a ser objeto
   → shouldShowClearSelection = true → aparece o "×"

usuário clica no "×"
   → handleClearSelection → emitChange({ value: null }) + onClear
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — a lógica de `shouldOpenOverlay` é sutil; alterações têm alto
  risco de regressão em comportamento de foco/abertura.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **`show()` imperativo em `useEffect`** | O painel é aberto chamando a API imperativa do PrimeReact a partir de um efeito. Não há chamada correspondente de `hide()`, então o fechamento depende inteiramente do comportamento interno do widget. Acoplamento a detalhe de implementação de terceiros. |
| Média | **Evento de mudança sintético** | `handleClearSelection` fabrica um objeto com a forma do `AutoCompleteChangeEvent`. Se o PrimeReact acrescentar campos ao evento em uma versão futura, consumidores que dependam deles quebram apenas nesse caminho. |
| Baixa | **`props as AutoCompleteProps<any, any>`** | Cast na linha do spread (necessário para conciliar os genéricos com o `forwardRef`), com perda de checagem. |
| Baixa | **`clearedValue = null as any`** | Cast explícito para satisfazer o tipo do valor. |
| Baixa | **`maxRenderedItems` silencioso** | Sugestões além do limite são descartadas sem aviso visual — o usuário não sabe que a lista foi truncada. |
| Baixa | **Posição do "×" fixa** | `right: 2.75rem` assume a largura do botão de dropdown; com `componentSize="lg"` ou `dropdown` desabilitado o alinhamento pode ficar incorreto. |
| Baixa | **`delay: 0` por default** | Diverge do PrimeReact (300 ms) e do `SearchFieldSeplag` (300 ms). Sem debounce próprio, cada tecla dispara `completeMethod` — o consumidor precisa controlar isso (ex.: com `useDebouncedValueSeplag`). |
| Baixa | **Sem `RotuloSeplag`** | Por ser um wrapper de baixo nível, não segue RA-05 — decisão consciente, mas exige que o consumidor monte o rótulo. |
| Positivo | **Tem teste** | [`index.test.tsx`](./index.test.tsx) — 224 linhas. Um dos 4 arquivos de teste do repositório. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md)
- [`Fields/README.md`](../Fields/README.md) · [`hooks/README.md`](../../hooks/README.md)
