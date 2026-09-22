# `Accordion/` — AccordionSeplag

## Objetivo

Exibir uma lista paginada **agrupada em acordeões**: cada grupo tem cabeçalho clicável,
subtítulo opcional, botão "Adicionar" próprio e conteúdo expansível definido pelo consumidor.

## Responsabilidade principal

Transformar um `ResultsSeplag<S>` plano em grupos visuais, reutilizando o
[`TablePaginadoSeplag`](../TablePaginado/) como **motor** de paginação e expansão de linha.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 172 linhas.

```ts
export { AccordionSeplag } from "./Accordion";
export type { AccordionItemSeplag, AccordionSeplagProps } from "./Accordion";
```

## Funcionalidades existentes

### Contrato de grupo

```ts
interface AccordionItemSeplag<T> {
  id: string | number;
  headerTitle: string;
  headerSubtitle?: string;
  items: T[];
}
```

O tipo do componente é `AccordionSeplag<T, G extends AccordionItemSeplag<T>, S = T>`:
`S` é o tipo dos itens vindos da API, `G` é o tipo do grupo, `T` é o tipo dos itens dentro
do grupo.

### Props

| Prop | Papel |
| --- | --- |
| `data` | `ResultsSeplag<S> \| undefined` |
| `groupBy(items: S[]) => G[]` | **Função de agrupamento fornecida pelo consumidor** |
| `renderExpansion(group: G) => ReactNode` | Conteúdo exibido ao expandir |
| `dataKey` | `keyof G` — chave única do grupo |
| `rows`, `rowsPerPage`, `isFetching`, `handleOnPageChange` | Repassados ao `TablePaginadoSeplag` |
| `handleAdicionar` | Quando informado, cada cabeçalho ganha um botão de adicionar |
| `addButtonLabel` | Default `"Adicionar"` |

### Comportamento de expansão

**Somente um grupo aberto por vez:**

```tsx
setExpandedRows((prev) => (prev?.[key] ? null : { [key]: true }));
```

Clicar no grupo aberto fecha; clicar em outro fecha o anterior.

### Estratégia de renderização

O componente monta uma **tabela de uma única coluna sem cabeçalho**, cujo `body` é o
cabeçalho do acordeão:

```tsx
const columns: ColumnMetaSeplag<G>[] = [
  { header: "", field: dataKey as string, body: gridHeaderTemplate },
];
```

E constrói um `ResultsSeplag<G>` **sintético** para o motor de paginação:

```tsx
{
  content: gruposAgrupados,
  totalRecords: data?.totalRecords || 0,   // ← contagem de ITENS, não de grupos
  size: gruposAgrupados.length,
  number: data?.number || 0,
  totalPages: data?.totalPages || 0,
  numberOfElements: gruposAgrupados.length,
  first: data?.first ?? true,
  last: data?.last ?? true,
  empty: gruposAgrupados.length === 0,
  pageActual: data?.number || 0,
  sizePage: data?.size || 0,
}
```

### Cabeçalho do grupo

`gridHeaderTemplate` renderiza:
- `BotaoSeplag unstyled` ocupando a área de texto → alterna a expansão; `aria-expanded`
- Título em `uppercase text-lg`, negrito quando expandido
- Subtítulo opcional em `text-600`
- `BotaoSeplag` "Adicionar" (quando `handleAdicionar`), com `e.stopPropagation()`
- `BotaoSeplag` de chevron (`pi-chevron-up`/`down`) com `aria-label="Expandir"`

`data-testid`: `` `accordion-${key}-header` ``, `` `accordion-${key}-adicionar` ``,
`` `accordion-${key}-toggle` ``.

### Memoização

`content` (`data?.content ?? []`), `gruposAgrupados` (`groupBy(content)`) e `gruposResults`
usam `useMemo`.

## Dependências

### Externas
- `primereact/datatable` — tipo `DataTableStateEvent`

### Internas
- [`@componentes/TablePaginado`](../TablePaginado/) — `TablePaginadoSeplag`, `ColumnMetaSeplag`
- [`@componentes/Botao`](../Botao/) — `BotaoSeplag`
- [`../../interfaces`](../../interfaces/) — `ResultsSeplag`
- [`Accordion.module.css`](./Accordion.module.css) — classe `noRipple`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`TablePaginado`](../TablePaginado/) | **Motor interno** — paginação, expansão e renderização |
| [`AccordionCard`](../AccordionCard/) | Alternativa **sem tabela e sem paginação**: acordeão simples controlado por `isOpen` |
| [`interfaces/`](../../interfaces/) | Contrato `ResultsSeplag` |
| [`hooks/filters`](../../hooks/filters/) | `useFiltersSeplag` fornece `rows` e `handleOnPageChange` |

## Fluxos importantes

```
API → ResultsSeplag<S>  (itens planos, paginados no servidor)
   │
   ├─ content = data.content
   ├─ gruposAgrupados = groupBy(content)          ← consumidor decide o critério
   │
   ├─ gruposResults = ResultsSeplag<G> sintético
   │        (mantém totalRecords/number/totalPages do original)
   │
   ▼
<TablePaginadoSeplag<G>
    data={gruposResults}
    columns={[{ header: "", field: dataKey, body: gridHeaderTemplate }]}
    allowExpansion={false}
    expandedRows={expandedRows}
    onRowToggle={(e) => setExpandedRows(e.data)}
    rowExpansionTemplate={renderExpansion}
    dataKey={dataKey} />
```

**Importante:** a paginação é **server-side sobre os itens**, não sobre os grupos. O
agrupamento acontece apenas na página corrente — um grupo pode aparecer em duas páginas se
seus itens estiverem divididos.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — a construção do `ResultsSeplag<G>` sintético é o ponto mais
  delicado; erros ali quebram a paginação silenciosamente.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Semântica de paginação ambígua** | `totalRecords` do objeto sintético é a contagem de **itens** (`data.totalRecords`), enquanto `content` são **grupos**. O paginador exibe o total de itens, mas a página mostra N grupos — a contagem apresentada ao usuário não corresponde ao que está na tela. |
| Média | **Agrupamento limitado à página** | `groupBy` opera apenas sobre `data.content` (página atual). Grupos cujos itens atravessam o limite da página aparecem fragmentados. Não há aviso disso na API do componente. |
| Média | **`expandedRows` com `any`** | `useState<any>(null)` (linha 39) e casts `(grupo as any)[dataKey]`. |
| Baixa | **`allowExpansion={false}` mas usa expansão** | A coluna de expansão do PrimeReact é desligada, mas `expandedRows` + `rowExpansionTemplate` continuam ativos — a expansão é dirigida exclusivamente pelo cabeçalho customizado. Funciona, mas é contraintuitivo ao ler o código. |
| Baixa | **`groupBy` na lista de dependências** | `useMemo(() => groupBy(content), [content, groupBy])` — se o consumidor não memoizar `groupBy`, o agrupamento é recalculado a cada render. |
| Baixa | **Botão sem `type`** | O `BotaoSeplag` do chevron não declara `type="button"` (os outros dois declaram). Dentro de um `<form>`, pode disparar submit. |
| Baixa | **Estilos inline no cabeçalho** | `letterSpacing`, dimensões do chevron e `background: transparent` inline, apesar de existir um CSS Module na pasta (usado apenas para `noRipple`). |
| Baixa | **Sem testes versionados** | Existe um `AccordionSeplag.test.tsx` **não versionado** na árvore de trabalho (aparece como untracked no git). |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.6
- [`TablePaginado/README.md`](../TablePaginado/README.md) · [`AccordionCard/README.md`](../AccordionCard/README.md)
