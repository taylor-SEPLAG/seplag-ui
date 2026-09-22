# `Loader/` — LoaderSeplag

## Objetivo

Overlay de carregamento global com o brasão do Estado de Mato Grosso, controlado por um
contador Redux que suporta requisições concorrentes.

## Responsabilidade principal

Fornecer o indicador de carregamento **de aplicação inteira** (bloqueante), em contraste com
os indicadores localizados ([`SkeletonSeplag`](../SkeletonSeplag/), `isFetching` do
[`TablePaginadoSeplag`](../TablePaginado/)).

## Arquivos

| Arquivo | Papel |
| --- | --- |
| [`loaderContent.tsx`](./loaderContent.tsx) | `loaderSeplag(message?)` — função de renderização |
| [`index.tsx`](./index.tsx) | `LoaderSeplag` — versão conectada ao Redux |
| [`loaderSlice.ts`](./loaderSlice.ts) | Slice com contador e mensagem |
| [`loader.css`](./loader.css) | CSS **global** (`loader-overlay`, `lds-ellipsis`, `msg`, `text`) |

## Pontos de entrada

```ts
// componentes/index.ts
import "./Loader/loader.css";                    // ← efeito colateral no barrel
export { LoaderSeplag } from "./Loader";
export { loaderSeplag } from "./Loader/loaderContent";
export { decrementLoaderSeplag, incrementLoaderSeplag, loaderSliceSeplag } from "./Loader/loaderSlice";
```

> O CSS é importado na **primeira linha** do barrel de componentes, garantindo que o estilo
> do overlay esteja presente mesmo em consumo via subpath export.

## Funcionalidades existentes

### `loaderSeplag(message = "Carregando")`

Função (não componente) que devolve o JSX do overlay:

```html
<div class="loader-overlay" id="loader-seplag" data-testid="loader-seplag">
  <img class="text" src={Logo_Branco_Estado_MT.png} alt="loader"/>
  <div class="lds-ellipsis"><div/><div/><div/><div/></div>
  <span class="msg">{message}</span>
</div>
```

`message.trim() || "Carregando"` — string vazia ou só com espaços cai no default.

### `loaderSliceSeplag`

```ts
initialState = { count: 0, message: "Carregando" }

incrementLoaderSeplag(message?)  // count += 1; message = payload ?? "Carregando"
decrementLoaderSeplag()          // count -= 1; se count <= 0 → count = 0, message = default
```

O `prepare` de `incrementLoaderSeplag` aplica o default. O piso em zero em
`decrementLoaderSeplag` protege contra decrementos desbalanceados.

### `LoaderSeplag`

```tsx
export function LoaderSeplag(props: Readonly<{ text?: string }>) {
  const isLoading = useAppSelectorSeplag((state) => state.loaderReducer.count) > 0;
  const message   = useAppSelectorSeplag((state) => state.loaderReducer.message) || props.text;
  return isLoading ? loaderSeplag(message) : null;
}
```

## Dependências

### Externas
- `@reduxjs/toolkit` — `createSlice`, `PayloadAction`
- `react-redux` (indireta, via `useAppSelectorSeplag`)

### Internas
- [`../../app/hook/hooks`](../../app/hook/hooks.ts) — `useAppSelectorSeplag`
- `../../assets/img/Logo_Branco_Estado_MT.png`
- [`loader.css`](./loader.css)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`SimpleLoader`](../SimpleLoader/) | Mesmo visual, controlado por prop booleana, **sem Redux** |
| [`provider/AuthThanosProvider`](../../provider/AuthThanosProvider/) | Chama `loaderSeplag()` diretamente enquanto autentica |
| [`app/`](../../app/) | Fornece `useAppSelectorSeplag` |
| [`SkeletonSeplag`](../SkeletonSeplag/) | Alternativa não-bloqueante |

## Fluxos importantes

### Contrato de store obrigatório

```
Aplicação consumidora
  configureStore({
    reducer: {
      loaderReducer: loaderSliceSeplag.reducer,   ◄── chave OBRIGATÓRIA
      ...
    }
  })
        │
        ▼
  <Provider store>
    <LoaderSeplag />      ← montado uma vez, tipicamente na raiz
        │
        └─ state.loaderReducer.count > 0 ? overlay : null
```

### Contador concorrente

```
dispatch(incrementLoaderSeplag("Salvando..."))   → count 0→1, overlay aparece
dispatch(incrementLoaderSeplag("Enviando anexo")) → count 1→2, mensagem muda
dispatch(decrementLoaderSeplag())                → count 2→1, overlay permanece
dispatch(decrementLoaderSeplag())                → count 1→0, overlay some, mensagem reseta
```

Cada operação assíncrona incrementa ao iniciar e decrementa ao terminar — o overlay só
desaparece quando **todas** concluírem.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — depende de uma chave específica no store do consumidor.
- [`loader.css`](./loader.css) — CSS global importado pelo barrel; afeta toda a aplicação.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Alta** | **Acoplamento não verificado ao store** | `LoaderSeplag` lê `state.loaderReducer.count`, mas o `RootState` de [`app/store/store.ts`](../../app/store/store.ts) é derivado de um store com `reducer: {}` — **não há validação em tempo de compilação nem em runtime**. Se o consumidor esquecer de registrar `loaderSliceSeplag` sob a chave `loaderReducer`, o overlay simplesmente nunca aparece, sem erro. Ver R-01. |
| Média | **Contrato não documentado na API pública** | `useAppSelectorSeplag` não é exportado, e nenhum tipo público declara a exigência da chave `loaderReducer`. |
| Média | **CSS global no barrel** | `import "./Loader/loader.css"` na linha 1 de `componentes/index.ts` injeta as classes `loader-overlay`, `lds-ellipsis`, `msg` e `text` no espaço global **sempre que a biblioteca é importada**. A classe `.text` é especialmente genérica e pode colidir com estilos da aplicação. |
| Baixa | **`message \|\| props.text` invertido** | O estado Redux **sempre** tem `message` (default `"Carregando"`), então `props.text` só seria usado se a mensagem do store fosse string vazia — na prática, a prop `text` é inerte. |
| Baixa | **`decrementLoaderSeplag` sem `prepare`** | Não aceita identificador da operação; decrementos duplicados de um mesmo fluxo zeram o contador prematuramente. |
| Baixa | **Sem integração automática com RTK Query** | Não há middleware que incremente/decremente automaticamente. **Hipótese:** o `createBaseApiSliceSeplag` foi projetado para ser combinado com isso pelo consumidor, mas o código não faz a ligação. |
| Baixa | **Sem `aria-busy`/`role="status"`** | O overlay não é anunciado por leitores de tela. |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-01, §10.3
- [`app/README.md`](../../app/README.md) · [`SimpleLoader/README.md`](../SimpleLoader/README.md)
