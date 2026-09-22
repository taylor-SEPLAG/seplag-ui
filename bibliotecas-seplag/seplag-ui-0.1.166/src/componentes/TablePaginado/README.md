# `TablePaginado/` — TablePaginadoSeplag

## Objetivo

Fornecer a tabela paginada padrão da plataforma SEPLAG: listagem lazy com paginação
server-side, colunas customizáveis, agrupamento, expansão de linha, coluna de ações e
confirmação de exclusão embutida.

## Responsabilidade principal

É o **componente de dados mais usado da biblioteca**. Encapsula o `DataTable` do PrimeReact
e o conecta ao contrato [`ResultsSeplag<T>`](../../interfaces/Results.ts).

## Pontos de entrada

| Arquivo | Conteúdo |
| --- | --- |
| [`index.tsx`](./index.tsx) | `TablePaginadoSeplag` + tipos (384 linhas) |
| [`TableRowActionsSeplag.tsx`](./TableRowActionsSeplag.tsx) | Coluna "Ações" (190 linhas) |
| [`useConfirmacaoExclusaoSeplag.ts`](./useConfirmacaoExclusaoSeplag.ts) | Hook de confirmação de exclusão |

```ts
// componentes/index.ts
export { TablePaginadoSeplag } from "./TablePaginado";
export type {
  ColumnMetaSeplag, TableGroupFooterTemplateOptionsSeplag,
  TableGroupHeaderTemplateOptionsSeplag, TableGroupingSeplag, TablePaginadoSeplagProps,
} from "./TablePaginado";
```

## Funcionalidades existentes

### Dados e paginação

| Prop | Default | Papel |
| --- | --- | --- |
| `data` | — | `ResultsSeplag<T> \| undefined` |
| `rows` | — | Tamanho da página |
| `rowsPerPage` | — | Opções do seletor de tamanho |
| `handleOnPageChange` | — | Recebe `DataTableStateEvent` |
| `lazy` | `true` | Paginação server-side |
| `paginator` | `true` | Exibe o paginador |
| `dataKey` | `"id"` | Chave única da linha |
| `keepLastDataOnEmpty` | `true` | Mantém o último resultado quando `data` fica `undefined` fora de refetch |

`first` é calculado como `(displayData?.pageActual ?? 0) * rows`.

**`keepLastDataOnEmpty`** resolve um problema real documentado no JSDoc: expurgo de cache do
RTK Query em telas com `useLazyQuery` fazia a grid "esvaziar sozinha". A implementação usa
o padrão *derived state* do React:

```tsx
const [lastData, setLastData] = useState(data);
if (data && data !== lastData) setLastData(data);
const displayData = keepLastDataOnEmpty ? (data ?? (isFetching ? undefined : lastData)) : data;
```

### Estados de carregamento, erro e vazio

| Prop | Default |
| --- | --- |
| `isFetching` | `false` — exibe `LoaderIcon` (brasão do Estado girando, CSS Module `style.rotate`) |
| `isError` | `false` — zera `value`/`totalRecords`, desliga o paginador e mostra `errorState` |
| `errorMessage` | `"Erro ao carregar os dados."` |
| `onRetry` | — quando informado, adiciona botão "Tentar novamente" |
| `emptyMessage` | `"Nenhum registro encontrado"` |

### Colunas

```ts
interface ColumnMetaSeplag<T> {
  header: string;
  field?: string;
  body?: (data: T, options: ColumnBodyOptions) => ReactNode;
  selectionMode?: string;
  expander?: false;
  width?: string;
  headerWidth?: string;
}
```

Colunas com `header === "Ações"` recebem tratamento especial: `width`/`headerWidth` padrão
de `5rem`, `whiteSpace: nowrap` e `textAlign: center` (ou o valor de `acoesAlign`).

Ordem de renderização das colunas:
1. Coluna de seleção (quando `selectionMode === "multiple"` e não `isDisabled`)
2. Coluna de expansão (quando `allowExpansion`)
3. Colunas de `columns[]`
4. Coluna "Ações" (quando `hasEventoAcao`)

### Seleção

`selectionMode` (`"single"` default, `"multiple"`, `"checkbox"`, `null`), `selected`,
`handleSelectionChange`, `onRowSelect`, `onRowUnselect`, `showSelectAll`, `metaKeySelection`,
`selectionPageOnly` (fixo em `true`). `isDisabled` desliga seleção e eventos de linha.

### Agrupamento

```ts
interface TableGroupingSeplag<T> {
  field: keyof T | string;
  mode?: "subheader" | "rowspan";
  headerTemplate?: (data, options) => ReactNode;
  footerTemplate?: (data, options) => ReactNode;
  sortField?: keyof T | string;   // default: field
  sortOrder?: 1 | 0 | -1 | null;  // default: 1
  expandable?: boolean;
}
```

Os templates são tipicamente [`TableGroupHeaderSeplag`](../TableGroup/) e
`TableGroupFooterSeplag`.

### Expansão de linha

`allowExpansion` (booleano ou predicado por linha), `expandedRows`, `onRowToggle`,
`rowExpansionTemplate`. Usado pelo [`AccordionSeplag`](../Accordion/) para construir
o comportamento de acordeão.

### Coluna de ações — `TableRowActionsSeplag`

Comportamento **adaptativo**: conta quantas ações individuais existem entre `handleView`,
`handleEdit`, `hasDelete`, `handleDuplicar` e `handleGerarOficio`.

| Contagem | Renderização |
| --- | --- |
| < 3 | `BotaoIconSeplag` individuais lado a lado, com tooltip |
| ≥ 3 | `SplitButton` — botão principal executa `handleView`, o menu recebe as demais |

No modo `SplitButton`, `withTestId` usa `cloneElement` no template de cada item para injetar
`id` e `data-testid`. Ações extras vêm de `extraAcoes(rowData)` (`{ label, icon, command }[]`)
e componentes livres de `renderBotoes(rowData)` (apenas no modo individual).

`data-testid` das ações: `` `row-${rowIndex}-visualizar|editar|excluir|duplicar|gerar-oficio` ``.

#### Alinhamento — `acoesAlign`

`acoesAlign?: "left" | "center" | "right"` alinha horizontalmente o conteúdo da coluna de
ações. Sem a prop, vale o comportamento legado (defaults distintos por modo, mantidos para
não alterar telas existentes):

| Alvo | Sem `acoesAlign` | Com `acoesAlign` |
| --- | --- | --- |
| Fila de `BotaoIconSeplag` (< 3 ações) | `justify-content: center` | segue a prop |
| `SplitButton` (≥ 3 ações) | à direita, pelo `bodyStyle` da célula | segue a prop |
| Cabeçalho "Ações" (`hasEventoAcao`) | `text-right` | `text-{align}` |
| Coluna `"Ações"` vinda de `columns[]` | `textAlign: center` | segue a prop |

O contêiner dos botões é `display: flex` e ocupa a largura da célula — por isso o
alinhamento vem de `justify-content`, e não de `text-align`. Como a coluna é declarada com
`width: 5rem` + `whiteSpace: nowrap`, ela encolhe até o conteúdo: se os botões já preenchem
a célula, mudar `acoesAlign` não produz efeito visível. O ganho aparece quando as linhas têm
quantidades diferentes de botões (ações condicionais) — com `"left"` os ícones ficam
ancorados em vez de "dançar" entre as linhas.

```tsx
<TablePaginadoSeplag
  hasEventoAcao
  renderBotoes={renderBotoes}
  acoesAlign="left"
  /* ... */
/>
```

### Exclusão com confirmação

```
handleDelete informado
   → TableRowActionsSeplag recebe hasDelete=true
   → clique em "Excluir" → confirmacaoExclusao.abrir(rowData)
   → useConfirmacaoExclusaoSeplag guarda { visible: true, selected: rowData }
   → <ModalDeleteSeplag visible message={deleteMessage} onConfirm onCancel>
   → confirmar → setVisible(false) → handleDelete(selected)
```

O `ModalDeleteSeplag` é montado **dentro** do `TablePaginadoSeplag` — o consumidor só
fornece `handleDelete` e, opcionalmente, `deleteMessage`.

### Cabeçalho e botão Adicionar

`handleAdicionar` adiciona um `BotaoAdicionarSeplag` ao header. Se `header` também for
informado, `customHeader` compõe os dois em um `flex`. `botaoAdicionarProps` e
`disableAdicionar` customizam o botão.

### Identificadores

Com a prop `id`, o `pt.bodyRow` injeta `id` e `data-testid` por linha:
`` `${id}-row-${index}` ``. Sem `id`, usa `` `row-${index}` ``. Sufixos derivados:
`` `${id}-adicionar` ``, `` `${id}-delete-modal` ``.

## Dependências

### Externas
- `primereact/datatable` — `DataTable` e ~12 tipos
- `primereact/column` — `Column`, `ColumnBodyOptions`
- `primereact/splitbutton`, `primereact/menuitem` (em `TableRowActionsSeplag`)

### Internas
- [`@componentes/Botao`](../Botao/) — `BotaoAdicionarSeplag`, `BotaoSeplag`, `BotaoIconSeplag`
- [`@componentes/ModalDelete`](../ModalDelete/) — `ModalDeleteSeplag`
- [`../../interfaces/Results`](../../interfaces/Results.ts) — `ResultsSeplag<T>`
- `../../assets/img/Logo_Branco_Estado_MT.png` — ícone de carregamento
- [`Table.module.css`](./Table.module.css) + [`TableGlobal.css`](./TableGlobal.css)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`hooks/filters/useFiltersSeplag`](../../hooks/filters/) | Fornece `page`, `rows` e `onPageChange` |
| [`Accordion`](../Accordion/) | **Usa `TablePaginadoSeplag` como motor** de agrupamento/expansão |
| [`TableGroup`](../TableGroup/) | Templates de cabeçalho/rodapé de grupo |
| [`ModalDelete`](../ModalDelete/) | Montado internamente |
| [`interfaces/`](../../interfaces/) | Contrato `ResultsSeplag<T>` |

## Fluxos importantes

Ver §7.2 do [documento de Arquitetura](../../../docs/arquitetura-da-biblioteca-de-componentes.md)
para o diagrama completo do fluxo filtro → busca → tabela.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — 40+ props públicas; alterações têm alto risco de regressão.
- [`TableGlobal.css`](./TableGlobal.css) — CSS **global**, aplicado a todas as tabelas da página.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **CSS global** | `TableGlobal.css` não é escopado — afeta qualquer `DataTable` na aplicação consumidora, inclusive os que não passam por este componente. |
| Média | **Interface muito larga** | `TablePaginadoSeplagProps` tem mais de 40 props. Difícil de evoluir sem quebrar; muitas combinações não são testadas (ex.: `grouping` + `allowExpansion` + `selectionMode="multiple"`). |
| Média | **Coluna de ações identificada por string** | O tratamento especial depende de `col.header === "Ações"` (linha 328) — comparação literal, sensível a acento e caixa. Renomear o cabeçalho perde a formatação. |
| Baixa | **`selectionMode`/`selection` com `as any`** | Comentário nas linhas 291-293 explica: a união discriminada do `DataTableProps` é incompatível com a prop pública simplificada. Decisão consciente e documentada. |
| Baixa | **`tableStyle` fixo** | `minWidth: "50rem"` embutido (linha 267), sem prop de override. |
| Baixa | **`ColumnMetaSeplag.expander?: false`** | Tipo permite apenas o literal `false` — efetivamente inútil; a expansão é controlada por `allowExpansion`. |
| Baixa | **`extraAcoes` renderizado duas vezes** | Presente tanto no ramo `SplitButton` quanto no individual, com `data-testid` de formatos diferentes (`extra-${index}-${icon}` vs `extra-${icon}`). |
| Baixa | **`useConfirmacaoExclusaoSeplag` não exportado** | Útil fora da tabela (o [`GroupActions`](../GroupActions/) reimplementa a mesma lógica com `useState`), mas não é público. |
| Baixa | **Sem testes** | Componente de dados mais usado, sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.6, §7.2
- [Objetivo da biblioteca](../../../docs/objetivo-da-biblioteca-de-componentes.md) — P-04, §4.4
- [`interfaces/README.md`](../../interfaces/README.md) · [`TableGroup/README.md`](../TableGroup/README.md)
