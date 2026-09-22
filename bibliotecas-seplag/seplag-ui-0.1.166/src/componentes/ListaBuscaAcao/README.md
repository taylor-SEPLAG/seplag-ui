# `ListaBuscaAcao/` — ListaBuscaAcaoSeplag

## Objetivo

Exibir resultados de busca em uma lista rolável, cada item com título, descrição opcional e
**uma ação** (por padrão, "Adicionar").

## Responsabilidade principal

Cobrir o padrão "buscar → escolher → adicionar à seleção", muito comum nos cadastros SEPLAG
(adicionar servidor, adicionar órgão, adicionar dependente).

## Ponto de entrada

[`index.tsx`](./index.tsx) — 154 linhas.

```ts
export { ListaBuscaAcaoSeplag } from "./ListaBuscaAcao";
export type { ListaBuscaAcaoSeplagProps } from "./ListaBuscaAcao";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `items` | — | `readonly T[]` |
| `getKey(item)` | — | Chave única |
| `getTitle(item)` | — | Linha principal (`ReactNode`) |
| `getDescription(item)` | — | Linha secundária, opcional |
| `onAction(item)` | — | Ação disparada pelo botão |
| `renderAction(item, action)` | — | Substitui o botão padrão |
| `actionLabel` | `"Adicionar"` | Rótulo do botão padrão |
| `emptyMessage` | `"Nenhum resultado encontrado."` | — |
| `maxHeight` | `"12rem"` | Área rolável |
| `maxItems` | — | Corta a lista antes de renderizar (`slice(0, max(0, maxItems))`) |
| `keepInfoInOneLine` | `false` | `nowrap` + `overflow: hidden` + `text-overflow: ellipsis` |
| `style` / `itemStyle` | — | Estilos do contêiner e dos itens |

### Layout do item

```
grid-template-columns: minmax(0, 1fr) auto
├── coluna 1: título (0.875rem, peso 500, #0f172a)
│              descrição (0.8rem, #6b7280)
└── coluna 2: ação (botão outlined, 92px × 34px)
```

`minmax(0, 1fr)` é o que permite o truncamento funcionar dentro de um grid.

Separador: `borderBottom` em todos os itens **exceto o último**.

`data-testid`: `` `lista-busca-acao-${key}` `` e `` `lista-busca-acao-${key}-acao` ``.

## Dependências

### Externas
Nenhuma. HTML puro com estilo inline.

### Internas
- [`../Botao`](../Botao/) — `BotaoSeplag`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`AutoComplete`](../AutoComplete/) | Par natural: o campo faz a busca, esta lista exibe e permite adicionar |
| [`Fields/SearchField`](../Fields/SearchField.tsx) | Alternativa de busca integrada a `react-hook-form` |
| [`ListaSimples`](../ListaSimples/) | Para exibir os itens **já selecionados**, sem ação de busca |
| [`PickList`](../PickList/) | Alternativa completa de transferência bidirecional |

Nenhum componente da biblioteca consome `ListaBuscaAcaoSeplag` internamente.

## Fluxos importantes

Padrão de composição típico:

```tsx
const [termo, setTermo] = useState("");
const termoDebounced = useDebouncedValueSeplag(termo, 400);
const { data: resultados = [] } = useBuscarServidoresQuery(termoDebounced, { skip: termoDebounced.length < 3 });
const [selecionados, setSelecionados] = useState<Servidor[]>([]);

<>
  <TextFieldSeplag name="busca" label="Buscar servidor" value={termo} onChange={setTermo} />

  <ListaBuscaAcaoSeplag
    items={resultados.filter((r) => !selecionados.some((s) => s.id === r.id))}
    getKey={(s) => s.id}
    getTitle={(s) => s.nome}
    getDescription={(s) => `CPF ${formatCPFSeplag(s.cpf)} — Vínculo ${s.numrVinculo}`}
    onAction={(s) => setSelecionados((prev) => [...prev, s])}
    maxItems={20}
    keepInfoInOneLine
  />

  <ListaSimplesSeplag
    items={selecionados}
    getKey={(s) => s.id}
    columns={[
      { header: "Nome", field: "nome" },
      { header: "", body: (s) => <BotaoIconSeplag icon="pi pi-trash" onClick={() => remover(s)} />, width: "3rem" },
    ]}
  />
</>
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **Cores hardcoded** | `#e2e8f0`, `#64748b`, `#0f172a`, `#f1f5f9`, `#6b7280`, `#030213`, `rgba(0,0,0,0.1)` — nenhuma vem de [`tokens/colors`](../../tokens/colors.ts). Viola **RA-07**. Ver R-04. |
| Baixa | **Botão com estilo inline extenso** | O `BotaoSeplag` padrão recebe 11 propriedades inline que sobrescrevem quase toda a variante `base` — na prática, é um botão fora do design system, dentro de um componente do design system. |
| Baixa | **`maxItems` silencioso** | Itens além do limite somem sem indicação de que a lista foi truncada. |
| Baixa | **Sem `id` configurável** | Diferente de [`ListaSimples`](../ListaSimples/), não aceita prop `id`; os `data-testid` usam o prefixo fixo `lista-busca-acao-`. |
| Baixa | **Sem `cols`** | Não integra o grid da biblioteca; precisa de wrapper. |
| Baixa | **Sem estados de carregamento/erro** | Lista vazia durante o carregamento exibe `emptyMessage`, indistinguível de "não encontrado". |
| Baixa | **Uma única ação por item** | `renderAction` permite customizar, mas o layout de grid reserva apenas uma coluna à direita. |
| Baixa | **Sem semântica de lista** | `<div>` em vez de `<ul>`/`<li>`. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.6, R-04
- [`ListaSimples/README.md`](../ListaSimples/README.md) · [`AutoComplete/README.md`](../AutoComplete/README.md)
