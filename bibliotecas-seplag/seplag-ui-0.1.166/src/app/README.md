# `app/` — Store Redux de referência

## Objetivo

Fornecer a instância de store Redux e os hooks tipados usados **internamente** pela
biblioteca. Não faz parte da API pública.

## Responsabilidade principal

Dar tipagem a `useDispatch`/`useSelector` para os componentes da lib que leem o store
do consumidor — hoje, apenas o [`LoaderSeplag`](../componentes/Loader/).

## Ponto de entrada

**Nenhum.** `src/index.ts` **não exporta** nada de `app/`. Os símbolos existem apenas
para consumo interno, embora sejam emitidos em `dist/app/` por causa de `preserveModules`.

## Funcionalidades existentes

### [`store/store.ts`](./store/store.ts)

```ts
export const store = configureStore({ reducer: {} });

export type AppDispatch = typeof store.dispatch;
export type RootState  = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
```

O store é criado com **`reducer: {}`** — vazio. Sua única função é derivar os tipos
`RootState`, `AppDispatch` e `AppThunk`.

### [`hook/hooks.ts`](./hook/hooks.ts)

```ts
export const useAppDispatchSeplag: () => AppDispatch = useDispatch;
export const useAppSelectorSeplag: TypedUseSelectorHook<RootState> = useSelector;
```

## Dependências

- **Externas:** `@reduxjs/toolkit` (`configureStore`, `ThunkAction`, `Action`),
  `react-redux` (`useDispatch`, `useSelector`, `TypedUseSelectorHook`).
- **Internas:** `hook/hooks.ts` → `store/store.ts` (apenas tipos).

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`componentes/Loader`](../componentes/Loader/) | `LoaderSeplag` usa `useAppSelectorSeplag` para ler `state.loaderReducer.count` e `.message` |
| [`componentes/Loader/loaderSlice.ts`](../componentes/Loader/loaderSlice.ts) | Slice que o **consumidor** deve registrar sob a chave `loaderReducer` |
| [`componentes/Mensagem/message.ts`](../componentes/Mensagem/message.ts) | Importa `RootState` daqui — **módulo órfão**, nunca usado |

## Fluxos importantes

**Contrato implícito com o store da aplicação consumidora:**

```
Aplicação consumidora
  configureStore({
    reducer: {
      loaderReducer: loaderSliceSeplag.reducer,   ◄── chave OBRIGATÓRIA para LoaderSeplag
      userReducer:   ...,                          ◄── exigida por PaginaInicial/permissions.ts
      [apiSlice.reducerPath]: apiSlice.reducer,
    }
  })
        │
        ▼
  <Provider store>
        │
        ▼
  <LoaderSeplag />
     useAppSelectorSeplag((state) => state.loaderReducer.count) > 0
     useAppSelectorSeplag((state) => state.loaderReducer.message)
        │
        └─► loaderSeplag(message)  ← overlay com o brasão do Estado

  Controle do contador (feito pelo consumidor):
     dispatch(incrementLoaderSeplag("Salvando..."))   → count += 1
     dispatch(decrementLoaderSeplag())                → count -= 1 (piso em 0)
```

O contador permite requisições concorrentes: o overlay só desaparece quando **todas**
decrementam.

## Arquivos críticos

- [`hook/hooks.ts`](./hook/hooks.ts) — ponte entre a biblioteca e o store do consumidor.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Alta** | **`RootState` não descreve o store real** | `store` tem `reducer: {}`, então `RootState` é efetivamente vazio. `useAppSelectorSeplag((state) => state.loaderReducer.count)` **não é validado pelo compilador contra o store do consumidor** — não há garantia em tempo de compilação nem em runtime de que `loaderReducer` exista. Se a chave estiver ausente, `LoaderSeplag` nunca aparece, silenciosamente. Ver R-01 no documento de Arquitetura. |
| Média | **Hooks não exportados** | `useAppSelectorSeplag`/`useAppDispatchSeplag` não estão em `src/index.ts`, mas o consumidor precisa conhecer o contrato do store para o `LoaderSeplag` funcionar. Não há API pública nem tipo exportado que documente esse acoplamento. |
| Média | **`store` exportado sem uso** | A instância `store` é criada, exportada e **nunca usada** — nem pela lib, nem pelo consumidor (não é pública). Existe só para derivar tipos. É empacotada em `dist/app/store/store.js`. |
| Baixa | **Órfão dependente** | `componentes/Mensagem/message.ts` importa `RootState` daqui e nunca é importado por ninguém. Ver R-07. |
| Baixa | **Nome da pasta** | `hook/` no singular, enquanto o módulo transversal é `hooks/` no plural. |

## Diretriz de evolução

Prioridade 1 no plano de dívida (§10.3 do documento de Arquitetura):
tornar o contrato de store explícito — exportar `useAppSelectorSeplag` com um tipo de
`RootState` que declare as chaves exigidas (`loaderReducer`, `userReducer`), ou substituir
o acesso ao store por props/contexto nos componentes afetados.

## Documentos relacionados

- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-01, §10.3
- [`componentes/Loader/README.md`](../componentes/Loader/README.md)
