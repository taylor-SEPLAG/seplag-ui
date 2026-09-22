# `SkeletonSimples/` — SkeletonSimplesSeplag

## Objetivo

Placeholder de carregamento de uma linha, com altura adequada a um campo de formulário.

## Responsabilidade principal

Ser a forma mais curta de substituir um campo ou linha durante o carregamento, sem presets
nem configuração.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 5 linhas.

```ts
export { SkeletonSimplesSeplag } from "./SkeletonSimples";
```

## Funcionalidades existentes

### Implementação completa

```tsx
import { Skeleton, type SkeletonProps } from "primereact/skeleton";

export function SkeletonSimplesSeplag({ height = "35px", ...props }: Readonly<SkeletonProps>) {
  return <Skeleton height={height} className="mb-2" {...props} />;
}
```

Aceita **todas** as props do `Skeleton` do PrimeReact (`width`, `shape`, `size`,
`borderRadius`, `animation`, `style`, `className`). A única customização é:

- `height` default `"35px"` — aproxima a altura de um `InputText` da biblioteca
- `className="mb-2"` fixo — margem inferior

> **Atenção à ordem do spread:** `{...props}` vem **depois** de `className="mb-2"`, então
> passar `className` **substitui** a margem em vez de acrescentar.

## Dependências

### Externas
- `primereact/skeleton` — `Skeleton`, `SkeletonProps`

### Internas
Nenhuma.

## Módulos relacionados

| Alternativa | Quando usar |
| --- | --- |
| **`SkeletonSimplesSeplag`** | Uma linha, altura de campo, sem configuração |
| [`SkeletonSeplag`](../SkeletonSeplag/) | Presets (`avatar`, `button`, `card`), múltiplas linhas, composição |
| [`Loader`](../Loader/) / [`SimpleLoader`](../SimpleLoader/) | Overlay bloqueante de página inteira |

Nenhum componente da biblioteca consome `SkeletonSimplesSeplag` internamente.

## Fluxos importantes

```tsx
<CardSeplag title="Servidor">
  <div className="grid">
    <div className="col-12 md:col-6">
      {isFetching
        ? <SkeletonSimplesSeplag />
        : <TextFieldSeplag name="nome" label="Nome" control={control} />}
    </div>
    <div className="col-12 md:col-6">
      {isFetching
        ? <SkeletonSimplesSeplag />
        : <CPFFieldSeplag name="cpf" control={control} />}
    </div>
  </div>
</CardSeplag>
```

## Arquivos críticos

Nenhum.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **`className` substitui `mb-2`** | Pela ordem do spread, `<SkeletonSimplesSeplag className="w-full" />` perde a margem inferior. O padrão esperado seria `classNames("mb-2", props.className)`. |
| Baixa | **Sem `id`/`data-testid`** | Diverge da convenção da biblioteca (§3.4). O `SkeletonSeplag` define `data-testid`; este não. |
| Baixa | **Sem tipo de props próprio** | Reusa `SkeletonProps` do PrimeReact. Não há `SkeletonSimplesSeplagProps` exportado. |
| Baixa | **Altura em px** | `"35px"` fixo, enquanto os campos da biblioteca usam `40px` (ver `TextField.tsx`) — 5px de diferença ao alternar entre skeleton e campo real. |
| Baixa | **Sobreposição com `SkeletonSeplag`** | `<SkeletonSeplag variant="custom" height="35px" />` produz resultado equivalente. Dois componentes públicos para o mesmo caso. |
| Baixa | **Sem `aria-busy`/`role="status"`** | Não é anunciado por leitores de tela. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`SkeletonSeplag/README.md`](../SkeletonSeplag/README.md)
- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.4
