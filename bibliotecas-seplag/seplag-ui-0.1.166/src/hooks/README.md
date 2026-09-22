# `hooks/` — Hooks transversais

## Objetivo

Encapsular lógica de UI reutilizável e sem representação visual própria: orquestração de
filtros de listagem, debounce, notificações (toast) e renderização de mensagem de erro de campo.

## Responsabilidade principal

Remover repetição das telas dos sistemas consumidores. Cada hook aqui substitui um trecho
que antes era copiado de tela em tela.

## Pontos de entrada

Três hooks são exportados no barrel público (`src/index.ts`):

```ts
export * from "./hooks/filters/useDebouncedValueSeplag";
export * from "./hooks/filters/useFiltersSeplag";
export * from "./hooks/mensagemErro";   // → useMensagemErroFormularioSeplag
export * from "./hooks/toast";          // → useToastSeplag
```

`useFilterStorageSeplag` (`loadFilterStorageSeplag` / `saveFilterStorageSeplag` /
`clearFilterStorageSeplag`) **não é exportado** — é detalhe interno de `useFiltersSeplag`.

## Funcionalidades existentes

### [`filters/useFiltersSeplag.ts`](./filters/useFiltersSeplag.ts) — 174 linhas

Orquestra o ciclo completo *filtro → busca → paginação → persistência*.

**Entrada** (`UseFiltersSeplagOptions<TFilters>`):

| Prop | Default | Papel |
| --- | --- | --- |
| `control`, `getValues`, `reset` | — | Vindos do `useForm` do consumidor |
| `defaultValues` | — | Estado base para `resetAll` / `resetField` |
| `onSearch(filters, page, rows)` | — | Callback disparado a cada busca válida |
| `debouncedFields` | `[]` | Campos que passam por debounce; os demais disparam imediatamente |
| `minChars` | `3` | Bloqueia busca com campo string de `0 < len < minChars` |
| `debounceMs` | `400` | Atraso do debounce |
| `initialRows` | `10` | Tamanho de página inicial |
| `storageKey` | — | Quando informado, persiste `{ filters, page, rows }` em `localStorage` |
| `isValidField(campo, valor)` | — | Validação extra; `false` bloqueia a busca |

**Saída** (`UseFiltersSeplagResult<TFilters>`): `{ page, rows, onPageChange, resetAll, resetField, refetch }`.

**Regras de comportamento verificadas no código:**

1. Na montagem, se houver estado persistido, `reset(restoredStorage.filters)` é aplicado e a
   primeira busca é suprimida (`restorePendingRef`).
2. Qualquer mudança nos filtros **zera a página** (`effectivePage = 0`) antes de buscar.
3. `lastSearchKeyRef` (`${filtersKey}|${page}|${rows}`) deduplica buscas idênticas.
4. `refetch()` repete a **última** busca com os mesmos argumentos (`lastSearchArgsRef`),
   sem passar por debounce nem validação.
5. `resetField(campo)` restaura apenas aquele campo ao default e zera a página.
6. `onSearch` e `isValidField` são acessados via `ref` atualizado a cada render — mudanças
   nessas funções **não** disparam nova busca.

### [`filters/useDebouncedValueSeplag.ts`](./filters/useDebouncedValueSeplag.ts)

`useDebouncedValueSeplag<T>(value, delayMs): T`. Estabiliza a referência do valor por
`JSON.stringify` antes de aplicar o timer, permitindo passar objetos sem re-disparar
o efeito a cada render.

### [`filters/useFilterStorageSeplag.ts`](./filters/useFilterStorageSeplag.ts)

Wrapper de `localStorage` à prova de falha — todo acesso está em `try/catch` com fallback
silencioso (modo privado, quota excedida). Tipo `FilterStorageStateSeplag<TFilters>` =
`{ filters, page, rows }`.

### [`toast/useToast.ts`](./toast/useToast.ts)

Lê `ContextToastSeplag` e devolve atalhos semânticos:

| Método | Resultado |
| --- | --- |
| `toastPreset("created")` | *"Registro cadastrado com sucesso!"* / summary "Sucesso" |
| `toastPreset("updated")` | *"Registro atualizado com sucesso!"* |
| `toastPreset("deleted")` | *"Registro excluído com sucesso!"* |
| `toastSucesso(detail, summary?)` | severity `success`, summary default "Sucesso" |
| `toastErro(detail, summary?)` | severity `error`, summary default "Erro" |
| `toastAtencao(detail, summary?)` | severity `warn`, summary default "Atenção" |
| `printToast(msg)` | Passa um `ToastMessage` completo do PrimeReact |

Todos usam `life: 5000` (exceto `printToast`, onde o consumidor define).

### [`mensagemErro/useMensagemErroFormulario.tsx`](./mensagemErro/useMensagemErroFormulario.tsx)

`useMensagemErroFormularioSeplag(errors)` devolve `(nome) => ReactNode`, pronta para a prop
`getFormErrorMessage` de qualquer campo. Resolve caminhos aninhados
(`"endereco.cidade"`) via `getErrorMessageInObjectSeplag` e renderiza
`<small className="p-error">{mensagem}</small>`.

## Dependências

### Externas
- `react-hook-form` — `Control`, `useWatch`, `UseFormReset`, `UseFormGetValues`, `FieldErrors`
- `primereact/datatable` — tipo `DataTableStateEvent` em `onPageChange`
- `primereact/toast` — tipo `ToastMessage`
- `react`

### Internas
- `hooks/mensagemErro` → `uteis/getErrorMessageInObject`
- `hooks/toast` → `provider/printToast/ToastContext`
- `hooks/filters/useFiltersSeplag` → `useDebouncedValueSeplag` + `useFilterStorageSeplag`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| `componentes/TablePaginado` | Consome `page`, `rows`, `onPageChange` de `useFiltersSeplag` |
| `componentes/FilterForm` | Envelope visual dos campos de filtro |
| `componentes/Fields/utils/inactiveOption` | Usa `useToastSeplag().toastAtencao` |
| `componentes/PermissaoNegadaRedirect` | Usa `useToastSeplag().toastAtencao` |
| `componentes/ReactCrop` | Usa `useToastSeplag().printToast` |
| `provider/printToast` | Fornece o contexto que `useToastSeplag` lê |

## Fluxos importantes

```
useForm<TFiltros>()
   │ control
   ▼
useFiltersSeplag({ control, getValues, reset, defaultValues, onSearch, storageKey })
   │
   ├── useWatch(control) ─► JSON.stringify ─► useMemo estável
   ├── separa campos em { immediateValues, debouncedSourceValues }
   ├── useDebouncedValueSeplag(debouncedSourceValues, 400)
   ├── merge ─► effectiveFilters
   ├── guarda 1: algum campo string com 0 < len < minChars? → aborta
   ├── guarda 2: isValidField retornou false? → aborta
   ├── guarda 3: searchKey igual à anterior? → aborta
   ├── se filtros mudaram → setPage(0)
   ├── se storageKey → saveFilterStorageSeplag
   └── onSearch(effectiveFilters, effectivePage, rows)
```

## Arquivos críticos

- [`filters/useFiltersSeplag.ts`](./filters/useFiltersSeplag.ts) — orquestrador de toda
  tela de listagem da biblioteca.
- [`toast/useToast.ts`](./toast/useToast.ts) — único caminho recomendado para notificar
  o usuário a partir de um componente React.

## Observações técnicas e débitos identificados

| Item | Detalhe |
| --- | --- |
| **`JSON.stringify` como chave de memo** | Usado em `useFiltersSeplag` (linhas 72-74) e `useDebouncedValueSeplag` (linha 4). Perde `Date`/`undefined`, é sensível à ordem das chaves e custa O(n) por render. Funciona para filtros simples de string/número. |
| **Supressões de lint** | 5 ocorrências de `// eslint-disable-next-line react-hooks/exhaustive-deps` em `useFiltersSeplag.ts` — consequência direta do padrão acima. |
| **`useRef` sem inicializador** | `useRef<ReturnType<typeof setTimeout>>()` em `useDebouncedValueSeplag.ts:9`. Compila com `@types/react@18`; passa a ser erro em `@types/react@19+`. |
| **`debouncedFieldsSet` recriado** | `new Set(debouncedFields)` é reconstruído a cada render (linha 76) e usado dentro de um `useMemo` que não o lista como dependência. |
| **Contexto de toast opcional** | `useToastSeplag` não lança erro quando usado fora do `ToastProviderSeplag` — falha silenciosamente (`toastRef?.current?.show`). Contraste com `useUnsavedChangesSeplag`, que lança erro explícito. |
| **`useFilterStorageSeplag` não exportado** | Consumidores que queiram limpar filtros persistidos manualmente não têm API pública para isso. |
| **Sem testes** | Nenhum hook tem cobertura de teste. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md)
- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md)
