# `ListaSimples/` — ListaSimplesSeplag

## Objetivo

Exibir uma lista de registros **sem paginação, sem seleção e sem PrimeReact** — uma
alternativa leve ao [`TablePaginadoSeplag`](../TablePaginado/) para conjuntos pequenos e já
carregados em memória.

## Responsabilidade principal

Cobrir o caso de listas embutidas em formulários, modais e painéis, onde a `DataTable`
completa seria excessiva (peso, estilos globais, paginador).

## Ponto de entrada

[`index.tsx`](./index.tsx) — 116 linhas.

```ts
export { ListaSimplesSeplag } from "./ListaSimples";
export type { ColumnMetaListaSimplesSeplag, ListaSimplesSeplagProps } from "./ListaSimples";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"lista-simples"` | Base dos `data-testid` |
| `items` | — | `readonly T[]` |
| `getKey(item)` | — | Chave única — obrigatória |
| `columns` | — | Modo tabular |
| `renderItem(item)` | — | Modo livre (usado quando `columns` é omitido) |
| `showHeader` | `true` | Exibe o cabeçalho (só com `columns`) |
| `emptyMessage` | `"Nenhum registro encontrado."` | — |
| `minHeight` / `maxHeight` | — / `"16rem"` | Área rolável |
| `style` / `itemStyle` | — | Estilos do contêiner e das linhas |

### Dois modos de renderização

| Modo | Ativação | Layout |
| --- | --- | --- |
| **Tabular** | `columns` informado | `display: grid` com `gridTemplateColumns` derivado de `columns[].width ?? "1fr"` |
| **Livre** | apenas `renderItem` | `display: block`; o consumidor controla o conteúdo |

### Definição de coluna

```ts
interface ColumnMetaListaSimplesSeplag<T> {
  header?: ReactNode;
  field?: keyof T & string;
  body?: (item: T) => ReactNode;
  width?: string;
}
```

Precedência em `getColumnValue`: `body(item)` → `item[field]` → `null`.

### Estrutura

```html
<div id data-testid style="border: 1px solid var(--surface-border); border-radius: 6px">
  <!-- cabeçalho: só quando columns && showHeader -->
  <div style="display:grid; grid-template-columns:{...}; font-weight:600; border-bottom:...">
    <div>{column.header}</div>  ...
  </div>

  <div style="min-height; max-height; overflow-y: auto">
    <div id="{id}-item-{key}" data-testid="{id}-item-{key}"
         style="display:grid|block; border-top: 1px solid (exceto o primeiro)">
      ...
    </div>
  </div>
</div>
```

### Cores

Usa variáveis CSS do tema PrimeReact (`var(--surface-border)`) em vez de literais — um dos
poucos componentes da biblioteca que fazem isso.

## Dependências

### Externas
Nenhuma. HTML puro com estilo inline.

### Internas
Nenhuma. É folha do grafo.

## Módulos relacionados

| Módulo | Quando usar cada um |
| --- | --- |
| [`TablePaginado`](../TablePaginado/) | Listagem principal de tela, com paginação server-side, ações de linha, ordenação e seleção |
| **`ListaSimples`** | Lista embutida, poucos itens, já em memória, sem paginação |
| [`ListaBuscaAcao`](../ListaBuscaAcao/) | Lista de **resultados de busca** com uma ação por item (tipicamente "Adicionar") |
| [`PickList`](../PickList/) | Transferência bidirecional entre "disponíveis" e "selecionados" |

Nenhum componente da biblioteca consome `ListaSimplesSeplag` internamente.

## Fluxos importantes

**Modo tabular:**

```tsx
<ListaSimplesSeplag
  id="dependentes"
  items={dependentes}
  getKey={(d) => d.id}
  maxHeight="20rem"
  columns={[
    { header: "Nome",       field: "nome",  width: "2fr" },
    { header: "Parentesco", field: "grau" },
    { header: "Nascimento", body: (d) => formatAnyDateSeplag(d.dataNascimento), width: "8rem" },
    { header: "",           body: (d) => <BotaoIconSeplag icon="pi pi-trash" onClick={() => remover(d)} />, width: "3rem" },
  ]}
/>
```

**Modo livre:**

```tsx
<ListaSimplesSeplag
  items={anexos}
  getKey={(a) => a.id}
  renderItem={(a) => (
    <div className="flex justify-content-between">
      <span>{a.nome}</span>
      <BadgeSeplag label={a.tipo} size="xs" />
    </div>
  )}
/>
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único, sem dependências.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **Sem `cols` / `classesCssSeplag`** | Diferente de [`Card`](../Card/), [`PanelSeplag`](../PanelSeplag/) e [`Mensagem`](../Mensagem/), não aceita a prop `cols` do grid da biblioteca — o consumidor precisa envolvê-lo em um `<div className="col-...">`. |
| Baixa | **`renderItem` silenciosamente ignorado** | Quando `columns` é informado, `renderItem` nunca é chamado. Não há aviso nem tipo que impeça a combinação. |
| Baixa | **`showHeader` sem efeito no modo livre** | Só tem sentido com `columns`; sem elas, é ignorado. |
| Baixa | **`key` de coluna instável** | `key={column.field ?? index}` — colunas com `body` e sem `field` caem no índice; reordenar as colunas remonta os nós. |
| Baixa | **`maxHeight` default sempre ativo** | `"16rem"` por padrão cria área rolável mesmo em listas curtas — o consumidor precisa passar `maxHeight="none"` para desativar. |
| Baixa | **Sem estados de carregamento/erro** | Não há `isLoading` nem `isError`, ao contrário do `TablePaginadoSeplag`. |
| Baixa | **Sem semântica de tabela** | Usa `<div>` com `display: grid`, não `<table>`/`<ul>`. Leitores de tela não anunciam a estrutura tabular; o cabeçalho não é associado às células. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.6, §3.8
- [`TablePaginado/README.md`](../TablePaginado/README.md) · [`ListaBuscaAcao/README.md`](../ListaBuscaAcao/README.md)
