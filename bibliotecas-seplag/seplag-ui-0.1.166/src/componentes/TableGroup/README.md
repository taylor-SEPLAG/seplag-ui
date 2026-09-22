# `TableGroup/` — TableGroupHeaderSeplag e TableGroupFooterSeplag

## Objetivo

Fornecer os templates de cabeçalho e rodapé de grupo usados pelo agrupamento de linhas
(`rowGroupMode`) do [`TablePaginadoSeplag`](../TablePaginado/).

## Responsabilidade principal

Padronizar a apresentação de grupos em tabelas: seleção do grupo inteiro (com estado
indeterminado), área clicável de expansão e rodapé com contagem "Exibindo N de M" e ação
"Exibir todos".

## Ponto de entrada

[`index.tsx`](./index.tsx) — 127 linhas, dois componentes.

```ts
export { TableGroupFooterSeplag, TableGroupHeaderSeplag } from "./TableGroup";
export type { TableGroupFooterSeplagProps, TableGroupHeaderSeplagProps } from "./TableGroup";
```

## Funcionalidades existentes

### `TableGroupHeaderSeplag`

| Prop | Default | Papel |
| --- | --- | --- |
| `groupId` | — | Base do `data-testid`; sem ele usa `useId()` |
| `children` | — | Conteúdo do cabeçalho |
| `trailing` | — | Conteúdo à direita (ex.: badges, contadores) |
| `selected` | `false` | Estado do checkbox |
| `indeterminate` | `false` | Estado parcial do checkbox |
| `onSelectionChange` | — | **Quando ausente, o checkbox não é renderizado** |
| `selectionAriaLabel` | `"Selecionar grupo"` | Rótulo acessível |
| `selectionDisabled` | `false` | Desabilita o checkbox |
| `onToggle` | — | **Quando presente**, `children` vira um botão clicável |
| `className` | — | Classe extra no wrapper |

**Estado indeterminado:** a propriedade `indeterminate` de um `<input type="checkbox">` não
existe em HTML — só no DOM. O componente usa `ref` + `useEffect`:

```tsx
useEffect(() => {
  if (checkboxRef.current) checkboxRef.current.indeterminate = indeterminate;
}, [indeterminate]);
```

Usa **`<input type="checkbox">` nativo**, não o `Checkbox` do PrimeReact.

`data-testid`: `` `table-group-${groupId}-checkbox` `` e `` `table-group-${groupId}-toggle` ``.

### `TableGroupFooterSeplag`

| Prop | Default | Papel |
| --- | --- | --- |
| `groupId` | — | Base do `data-testid` |
| `shownRecords` / `totalRecords` | — | Exibidos como "Exibindo N de M" |
| `onShowAll` | — | Ação "Exibir todos" |
| `loading` | `false` | Desabilita o botão e troca o rótulo |
| `showAllLabel` | `"Exibir todos"` | — |
| `loadingLabel` | `"Carregando..."` | — |
| `colSpan` | — | **Quando informado, envolve o conteúdo em `<td colSpan>`** |
| `className` | — | Classe extra na célula |

O botão só aparece quando `shownRecords < totalRecords` **e** `onShowAll` é fornecido.

`data-testid`: `` `table-group-${groupId}-footer-show-all` `` (ou `table-group-footer-show-all`
sem `groupId`).

## Dependências

### Externas
- `react` — `useEffect`, `useId`, `useRef`

### Internas
- [`../Botao`](../Botao/) — `BotaoSeplag` com `unstyled`
- [`TableGroup.module.css`](./TableGroup.module.css) — `header`, `checkbox`, `toggleSurface`,
  `content`, `trailing`, `footer`, `showAll`, `footerCell`, `noRipple`

Não depende do `TablePaginadoSeplag` — a relação é de **uso pelo consumidor**, não de import.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`TablePaginado`](../TablePaginado/) | Consumidor previsto: `grouping.headerTemplate` e `grouping.footerTemplate` |
| [`Accordion`](../Accordion/) | Abordagem alternativa de agrupamento (via expansão de linha, não `rowGroupMode`) |

## Fluxos importantes

```tsx
<TablePaginadoSeplag
  data={data}
  columns={colunas}
  grouping={{
    field: "orgaoId",
    mode: "subheader",
    expandable: true,
    headerTemplate: (row) => (
      <TableGroupHeaderSeplag
        groupId={row.orgaoId}
        selected={estaTodoSelecionado(row.orgaoId)}
        indeterminate={estaParcialmenteSelecionado(row.orgaoId)}
        onSelectionChange={(sel) => selecionarGrupo(row.orgaoId, sel)}
        trailing={<BadgeSeplag label={`${contarItens(row.orgaoId)} itens`} />}
      >
        {row.orgaoNome}
      </TableGroupHeaderSeplag>
    ),
    footerTemplate: (row, options) => (
      <TableGroupFooterSeplag
        groupId={row.orgaoId}
        shownRecords={exibidos(row.orgaoId)}
        totalRecords={total(row.orgaoId)}
        onShowAll={() => carregarTodos(row.orgaoId)}
        colSpan={options.colSpan}
      />
    ),
  }}
/>
```

O `colSpan` vem de `TableGroupFooterTemplateOptionsSeplag`, definido em
[`TablePaginado/index.tsx`](../TablePaginado/index.tsx).

## Arquivos críticos

- [`index.tsx`](./index.tsx) — o efeito de `indeterminate` é a única forma de expressar
  seleção parcial; removê-lo quebra silenciosamente a indicação visual.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Checkbox nativo, fora do padrão visual** | `<input type="checkbox">` puro, estilizado só por CSS Module, enquanto o restante da biblioteca usa `Checkbox` do PrimeReact. A aparência do grupo diverge da coluna de seleção da própria tabela (que usa `selectionMode="multiple"` do PrimeReact). |
| Média | **Seleção de grupo é responsabilidade do consumidor** | O componente é totalmente controlado: não sabe quais linhas pertencem ao grupo nem interage com a seleção do `DataTable`. Toda a lógica de "selecionar todos do grupo" e de cálculo de `indeterminate` fica na aplicação. |
| Baixa | **`onToggle` não indica estado** | O botão de expansão não recebe `aria-expanded` (contraste com [`Accordion`](../Accordion/), que define). Leitores de tela não anunciam aberto/fechado. |
| Baixa | **`colSpan` opcional muda a estrutura do DOM** | Sem `colSpan`, devolve um `<div>`; com `colSpan`, um `<td>`. O consumidor precisa saber em qual contexto está renderizando. |
| Baixa | **`className` aplicado em lugares diferentes** | No header vai para o wrapper; no footer vai para o `<td>` (e é ignorado quando `colSpan` é omitido). |
| Baixa | **Texto fixo "Exibindo N de M"** | Não há prop para customizar a frase, apenas os rótulos do botão. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.6
- [`TablePaginado/README.md`](../TablePaginado/README.md)
