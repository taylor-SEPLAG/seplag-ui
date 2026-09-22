# `SkeletonSeplag/` — SkeletonSeplag

## Objetivo

Placeholder de carregamento com presets prontos (texto, título, avatar, botão, cartão),
suporte a múltiplas linhas e modo de composição livre.

## Responsabilidade principal

Substituir o loader bloqueante ([`LoaderSeplag`](../Loader/)) por uma indicação **não
bloqueante** que preserva a estrutura da página durante o carregamento.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 108 linhas.

```ts
export { SkeletonSeplag } from "./SkeletonSeplag";
```

> `SkeletonSeplagProps` é exportado **no arquivo**, mas **não** no barrel de componentes.
> Ver débitos.

## Funcionalidades existentes

### Presets (`variant`)

| Variant | Dimensões |
| --- | --- |
| `text` (default) | `height: 14px`, `width: 100%` |
| `title` | `height: 20px`, `width: 60%` |
| `avatar` | `shape: "circle"`, `size: 2.5rem` |
| `button` | `height: 32px`, `width: 100px`, `borderRadius: 6px` |
| `card` | `height: 80px`, `borderRadius: 12px` |
| `custom` | `{}` — nenhum preset; use `width`/`height`/`size`/`borderRadius` |

`width`, `height`, `size` e `borderRadius` informados pelo consumidor **sobrescrevem** o preset.

### Três modos de renderização

| Condição | Resultado |
| --- | --- |
| `children` presente | `<div id data-testid class={containerClassName}>{children}</div>` — modo composição |
| `lines > 1` | `<div>` flex-column com `gap` + N `<Skeleton>`; `data-testid` de cada linha: `` `${id}-skeleton-${lines}-${i}` `` |
| Padrão | Um único `<Skeleton className="mb-2">` |

### Subcomponente `SkeletonSeplag.Item`

```ts
SkeletonSeplag.Item = (props: SkeletonProps) => <Skeleton {...props} />;
```

Repasse direto do `Skeleton` do PrimeReact, para uso no modo composição.

### Props adicionais

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"skeleton-seplag"` | `id` + `data-testid` |
| `lines` | `1` | Número de linhas |
| `gap` | `"0.5rem"` | Espaçamento entre linhas |
| `containerClassName` | `""` | Classe do wrapper (modos `children` e multi-linha) |
| `className` | `""` | Classe do `Skeleton` |

Estende `SkeletonProps` do PrimeReact — todas as props originais são aceitas.

## Dependências

### Externas
- `primereact/skeleton` — `Skeleton`, `SkeletonProps`

### Internas
Nenhuma.

## Módulos relacionados

| Alternativa | Característica |
| --- | --- |
| [`SkeletonSimples`](../SkeletonSimples/) | Wrapper mínimo: `height` default `35px` + `mb-2` |
| **`SkeletonSeplag`** | Presets, múltiplas linhas, composição |
| [`Loader`](../Loader/) / [`SimpleLoader`](../SimpleLoader/) | Overlay **bloqueante** de página inteira |
| `isFetching` do [`TablePaginado`](../TablePaginado/) | Indicador embutido na tabela |

Nenhum componente da biblioteca consome `SkeletonSeplag` internamente.

## Fluxos importantes

**Substituindo campos durante o carregamento:**

```tsx
{isFetching ? (
  <SkeletonSeplag variant="text" lines={4} gap="1rem" containerClassName="col-12" />
) : (
  <>
    <TextFieldSeplag name="nome"  control={control} cols="12 6" .../>
    <TextFieldSeplag name="email" control={control} cols="12 6" .../>
  </>
)}
```

**Modo composição — reproduzindo o layout real:**

```tsx
<SkeletonSeplag containerClassName="flex align-items-center gap-3 p-3">
  <SkeletonSeplag.Item shape="circle" size="3rem" />
  <div className="flex flex-column gap-2 flex-1">
    <SkeletonSeplag.Item height="20px" width="40%" />
    <SkeletonSeplag.Item height="14px" width="70%" />
  </div>
  <SkeletonSeplag.Item height="32px" width="100px" borderRadius="6px" />
</SkeletonSeplag>
```

## Arquivos críticos

Nenhum. Componente isolado, sem dependências internas.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **`SkeletonSeplagProps` fora do barrel** | O tipo é exportado em `index.tsx`, mas `componentes/index.ts` exporta apenas o componente. Consumidores em TypeScript não conseguem importar o tipo pelo caminho oficial. Ver R-08. |
| Baixa | **Indireção desnecessária** | `SkeletonSeplagBase` é envolvida por `SkeletonSeplag = (props) => <SkeletonSeplagBase {...props} />` apenas para permitir a anexação de `.Item`. `Object.assign` (padrão usado em `DateTimeFieldSeplag`) evitaria o componente extra. |
| Baixa | **`className` aplicado de formas diferentes** | Modo single: `` `mb-2 ${className}` ``; modo multi-linha: `` `mb-0 ${className}` ``. Margem inferior muda conforme o número de linhas, sem prop de controle. |
| Baixa | **`children` ignora todas as demais props** | No modo composição, `variant`, `lines`, `width` e `height` são silenciosamente descartados. |
| Baixa | **Sem `cols`** | Não integra o grid da biblioteca — usa `containerClassName` para isso. |
| Baixa | **Sem `aria-busy`/`role="status"`** | Skeletons não são anunciados por leitores de tela. |
| Baixa | **`skeletonKeys` recalculado** | `Array.from({ length: lines }, ...)` é executado a cada render, mesmo no modo de linha única (onde não é usado). |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-08
- [`SkeletonSimples/README.md`](../SkeletonSimples/README.md) · [`Loader/README.md`](../Loader/README.md)
