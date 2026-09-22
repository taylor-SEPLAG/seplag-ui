# `SimpleLoader/` — SimpleLoaderSeplag

## Objetivo

Overlay de carregamento idêntico ao [`LoaderSeplag`](../Loader/), mas controlado por uma prop
booleana em vez do store Redux.

## Responsabilidade principal

Permitir o uso do loader institucional **sem exigir Redux** nem a chave `loaderReducer` no
store do consumidor.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 11 linhas.

```ts
export { SimpleLoaderSeplag } from "./SimpleLoader";
```

> A interface `SimpleLoaderSeplagProps` é **local** ao arquivo e **não é exportada** — nem
> no arquivo, nem no barrel.

## Funcionalidades existentes

### Implementação completa

```tsx
import { loaderSeplag } from "@componentes/Loader/loaderContent";

interface SimpleLoaderSeplagProps {
  isLoading: boolean;
  message?: string;
}

export function SimpleLoaderSeplag({ isLoading, message }: SimpleLoaderSeplagProps) {
  return isLoading ? loaderSeplag(message) : null;
}
```

### Props

| Prop | Papel |
| --- | --- |
| `isLoading` | Controla a exibição |
| `message` | Texto abaixo do spinner (default de `loaderSeplag`: `"Carregando"`) |

Aparência, estrutura e `data-testid` (`loader-seplag`) são idênticos aos do `LoaderSeplag` —
ambos delegam para a mesma função [`loaderSeplag`](../Loader/loaderContent.tsx).

## Dependências

### Externas
Nenhuma.

### Internas
- [`@componentes/Loader/loaderContent`](../Loader/loaderContent.tsx) — `loaderSeplag`

O CSS (`loader.css`) é carregado pelo barrel de componentes, não por este módulo.

## Módulos relacionados

| Alternativa | Controle | Requer Redux |
| --- | --- | --- |
| [`LoaderSeplag`](../Loader/) | `state.loaderReducer.count > 0` | **Sim** — chave `loaderReducer` obrigatória |
| **`SimpleLoaderSeplag`** | Prop `isLoading` | Não |
| [`SkeletonSeplag`](../SkeletonSeplag/) | Prop | Não — não bloqueante |
| `isFetching` do [`TablePaginadoSeplag`](../TablePaginado/) | Prop | Não — localizado na tabela |

## Fluxos importantes

```tsx
const { data, isFetching } = useBuscarServidorQuery(id);
const [salvando, setSalvando] = useState(false);

return (
  <>
    <SimpleLoaderSeplag isLoading={isFetching || salvando}
                        message={salvando ? "Salvando..." : "Carregando..."} />
    <CardSeplag title="Servidor">...</CardSeplag>
  </>
);
```

**Escolha entre os dois loaders:**

```
Precisa que qualquer parte da aplicação acione o loader
  (interceptors, middlewares, código fora do React)?
      SIM → LoaderSeplag + loaderSliceSeplag no store
      NÃO → SimpleLoaderSeplag com estado local
```

## Arquivos críticos

Nenhum. É um wrapper de 11 linhas.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **Props não exportadas** | `SimpleLoaderSeplagProps` é local e não consta do barrel. Consumidores em TypeScript não conseguem tipar wrappers próprios. Contraste com quase todos os outros componentes, que exportam suas props. |
| Baixa | **Sem `Readonly<>`** | Diverge do padrão dominante da biblioteca. |
| Baixa | **Sem `default export`** | Diverge da maioria dos componentes. |
| Baixa | **Overlay sem contexto** | `loader-overlay` é posicionado como overlay de página inteira. Montar dois `SimpleLoaderSeplag` simultaneamente empilha dois overlays com o mesmo `id="loader-seplag"`, gerando `id` duplicado no DOM. |
| Baixa | **Sem `aria-busy`/`role="status"`** | Herdado de `loaderSeplag` — não é anunciado por leitores de tela. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`Loader/README.md`](../Loader/README.md) — documentação completa do overlay e do slice
- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md)
