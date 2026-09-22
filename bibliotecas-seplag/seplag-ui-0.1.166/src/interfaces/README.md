# `interfaces/` — Contratos de dados da API

## Objetivo

Declarar os contratos de dados trocados entre as aplicações SEPLAG e seus backends:
formato de resposta paginada e formato de resposta de permissão.

## Responsabilidade principal

Padronizar a forma como listagens paginadas e checagens de permissão trafegam, para que
`TablePaginadoSeplag`, `AccordionSeplag` e `GroupActionsSeplag` funcionem sem adaptador
em qualquer sistema.

## Ponto de entrada

[`index.ts`](./index.ts) → re-exporta `Results`, `paginacao` e `permissao/permissionResponse`.
Reexportado por `src/index.ts` — **tudo aqui é API pública**.

## Funcionalidades existentes

### [`Results.ts`](./Results.ts) — Resposta paginada

`ResultsSeplag<T>` é o **contrato central de listagem** da biblioteca. Corresponde ao
`Page<T>` do Spring Data, acrescido de três campos:

```ts
interface ResultsSeplag<T> {
  content: T[];
  pageable?: PageableSeplag;
  last: boolean;
  totalPages: number;
  pageActual: number;    // ← extra (fora do padrão Spring)
  sizePage: number;      // ← extra
  totalRecords: number;  // ← extra
  size: number;
  number: number;
  sort?: SortSeplag;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
```

Tipos auxiliares: `PageableSeplag` (`sort`, `offset`, `pageSize`, `pageNumber`, `unpaged`, `paged`)
e `SortSeplag` (`empty`, `sorted`, `unsorted`).

> **Campos efetivamente lidos pelos componentes:** `TablePaginadoSeplag` usa apenas
> `content`, `totalRecords` e `pageActual`. `AccordionSeplag` monta um `ResultsSeplag<G>`
> sintético para o agrupamento e lê também `number`, `totalPages`, `first`, `last` e `size`.
> Os demais campos existem por fidelidade ao contrato do backend.

### [`paginacao.ts`](./paginacao.ts) — Constantes e helper de paginação

| Símbolo | Conteúdo |
| --- | --- |
| `opcoesPaginacaoSeplag` | `{ page: 0, rows: 10, rowsPerPage: [10, 20, 30] }` |
| `getPageParamsSeplag(event)` | Converte `DataTableStateEvent` do PrimeReact em `{ page, rows }` com fallbacks |

### [`permissao/permissionResponse.ts`](./permissao/permissionResponse.ts)

```ts
interface IPermissionResponseSeplag {
  podeVisualizar: boolean;
  podeIncluir: boolean;
  podeEditar: boolean;
  podeDeletar: boolean;
}
```

Modelo CRUD de permissão por tela. Consumido por `GroupActionsSeplag` (via
`Partial<IPermissionResponseSeplag>`) e reproduzido como formato de retorno por
`usePaginaInicialPermissionsSeplag`.

## Dependências

- **Externa:** `primereact/datatable` — tipo `DataTableStateEvent` em `paginacao.ts`.
- **Interna:** nenhuma.

## Módulos relacionados

| Módulo | Uso |
| --- | --- |
| [`componentes/TablePaginado`](../componentes/TablePaginado/) | `data: ResultsSeplag<T> \| undefined` |
| [`componentes/Accordion`](../componentes/Accordion/) | `data: ResultsSeplag<S>`; produz `ResultsSeplag<G>` interno |
| [`componentes/GroupActions`](../componentes/GroupActions/) | `permissions: Partial<IPermissionResponseSeplag>` |
| [`componentes/PaginaInicial/permissions.ts`](../componentes/PaginaInicial/permissions.ts) | Retorna a mesma forma, **sem importar o tipo** |
| [`hooks/filters/useFiltersSeplag`](../hooks/filters/) | Emite `page`/`rows` compatíveis com `opcoesPaginacaoSeplag` |

## Fluxos importantes

```
Backend Spring (Page<T>)
      │  JSON
      ▼
RTK Query (apiSlice do consumidor)
      │  ResultsSeplag<T>
      ▼
<TablePaginadoSeplag data={data} rows={rows} handleOnPageChange={onPageChange}>
      │  first = (data.pageActual ?? 0) * rows
      │  value = data.content
      │  totalRecords = data.totalRecords
      ▼
onPage(DataTableStateEvent) ──► useFiltersSeplag.onPageChange ──► setPage / setRows
                                                                       │
                                                              nova chamada onSearch
```

## Arquivos críticos

- [`Results.ts`](./Results.ts) — mudar este tipo quebra toda tela de listagem da plataforma.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Redundância no contrato** | `pageActual` × `number`, `sizePage` × `size` × `pageable.pageSize`, `totalRecords` × `totalElements` (ausente). O tipo mistura o padrão Spring com campos customizados sem documentar qual é autoritativo. |
| Baixa | **`opcoesPaginacaoSeplag` pouco usado** | `useFiltersSeplag` tem seus próprios defaults (`initialRows = 10`); a constante não é consumida internamente por nenhum componente. |
| Baixa | **`getPageParamsSeplag` com falso negativo** | Usa `page.page ? page.page : 0` — como `0` é *falsy*, o resultado é o mesmo, mas o padrão `??` seria mais correto. Idem para `rows`. |
| Baixa | **`IPermissionResponseSeplag` duplicado na prática** | `usePaginaInicialPermissionsSeplag` devolve um objeto com as mesmas 4 chaves sem referenciar o tipo. |
| Baixa | **Prefixo `I` inconsistente** | `IPermissionResponseSeplag` e `IMenuSeplag`/`IVinculoSeplag` usam prefixo húngaro; `ResultsSeplag`, `PageableSeplag` e `SortSeplag` não. |
| Baixa | **Sem `totalElements`** | Campo padrão do Spring `Page` ausente; o equivalente é `totalRecords`. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md) — §7.2
- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md) — §4.4
