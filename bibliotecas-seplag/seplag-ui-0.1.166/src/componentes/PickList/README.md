# `PickList/` — PickListSeplag

## Objetivo

Transferência bidirecional entre duas listas ("Não selecionados" ↔ "Selecionados"), com
filtro em ambos os lados e modo somente-leitura.

## Responsabilidade principal

Encapsular o `PickList` do PrimeReact com rótulo, textos em português, defaults
institucionais e um modo de visualização (`isView`) que substitui o widget por uma lista
estática de chips.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 192 linhas. Export apenas nomeado (`export { PickListSeplag }`).

```ts
export { PickListSeplag } from "./PickList";
export type { PickListSeplagProps } from "./PickList";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `title` | — | Rótulo (via [`RotuloSeplag`](../Rotulo/) com `cols="12"` fixo) |
| `name` | `"picklist"` | Base dos `data-testid` |
| `isView` | `false` | Modo somente-leitura |
| `naoSelecionados` / `selecionados` | — | As duas listas (`T[]`) |
| `setNaoSelecionados` / `setSelecionados` | — | Setters — **estado controlado pelo consumidor** |
| `titleNaoSelecionados` | `"Não selecionados"` | Cabeçalho da origem |
| `titleSelecionados` | `"Selecionados"` | Cabeçalho do destino |
| `dataKey` | `"id"` | Chave única |
| `dataLabel` | `"descricao"` | Caminho do rótulo (suporta aninhamento: `"orgao.nome"`) |
| `filterBy` | `"descricao"` | Campo de filtro |
| `filterPlaceholder` | `"Procurar por descrição"` | — |
| `naoSelecionadosItemTemplate` / `selecionadosItemTemplate` | — | Templates customizados |
| `onViewItemTemplate` | — | Template do modo `isView` |

### Configuração fixa do widget

Valores embutidos, sem prop de override: `breakpoint="960px"`,
`showSourceControls={false}`, `showTargetControls={false}` (sem botões de reordenação),
`sourceStyle`/`targetStyle` com `height: 24rem`, `autoOptionFocus={false}`, `filter`.

### Resolução de rótulo

```ts
const processLabel = (path, obj) =>
  path.split(".").reduce((prev, curr) =>
    (!prev || typeof prev !== "object") ? undefined : prev[curr], obj);
```

`getLabelText` aceita `string`, `number`, `boolean` e `bigint`; qualquer outro tipo (objeto,
`null`, `""`) retorna `undefined`, e o item é renderizado como **"Item inválido"** —
degradação graciosa em vez de erro.

`getItemKey(item, dataKey, index)` aceita apenas `string`/`number` como chave; caso
contrário usa o índice.

### Modo `isView`

Substitui o `PickList` por uma lista de chips (`<span className="p-2 border-round bg-gray-100">`)
apenas dos **selecionados**. `onViewItemTemplate(item, index)` permite customizar.

### Identificadores

`{name}` (widget) · `{name}-source-{key}` · `{name}-target-{key}` · `{name}-view-{key}`.

## Dependências

### Externas
- `primereact/picklist` — `PickList`, `PickListChangeEvent`

### Internas
- [`../Rotulo`](../Rotulo/) — `RotuloSeplag`

## Módulos relacionados

| Módulo | Quando usar |
| --- | --- |
| [`Fields/MultiSelectField`](../Fields/MultiSelectField.tsx) | Seleção múltipla compacta, integrada a `react-hook-form`, com grid e validação |
| **`PickList`** | Quando a **visualização lado a lado** de disponíveis × selecionados agrega valor (listas médias, escolha deliberada) |
| [`ListaBuscaAcao`](../ListaBuscaAcao/) + [`ListaSimples`](../ListaSimples/) | Alternativa quando a origem vem de busca no servidor, não de lista pré-carregada |

Nenhum componente da biblioteca consome `PickListSeplag` internamente.

## Fluxos importantes

```tsx
const [disponiveis, setDisponiveis] = useState<Perfil[]>([]);
const [atribuidos, setAtribuidos]   = useState<Perfil[]>([]);

useEffect(() => {
  if (!perfis) return;
  const idsAtribuidos = new Set(usuario.perfis.map((p) => p.id));
  setAtribuidos(perfis.filter((p) => idsAtribuidos.has(p.id)));
  setDisponiveis(perfis.filter((p) => !idsAtribuidos.has(p.id)));
}, [perfis, usuario]);

<PickListSeplag
  name="perfis"
  title="Perfis de acesso"
  isView={modoVisualizacao}
  dataKey="id"
  dataLabel="descricao"
  filterBy="descricao"
  naoSelecionados={disponiveis}
  selecionados={atribuidos}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setAtribuidos}
/>

// no submit:
handleSubmit((form) => salvar({ ...form, perfisIds: atribuidos.map((p) => p.id) }));
```

**Integração com `react-hook-form` é responsabilidade do consumidor** — o componente não
aceita `control` nem `name` de formulário.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Média** | **`getItemKey(item, dataKey, 0)` nos templates** | Nos `sourceItemTemplate` e `targetItemTemplate` (linhas 152 e 165), o índice passado é sempre `0` — o `PickList` do PrimeReact não fornece índice nesses callbacks. Se `dataKey` não resolver para `string`/`number`, **todos os itens recebem o mesmo `id`/`data-testid`** (`{name}-source-0`), quebrando os seletores de teste e gerando ids duplicados no DOM. |
| Média | **Fora do padrão de campo** | Não aceita `control`, `cols`, `required`, `disabled`, `visible` nem `rules`. `cols="12"` é fixo no `RotuloSeplag`. Viola **RA-04**; parcialmente **RA-05**. |
| Média | **Estado inteiramente externo** | O consumidor mantém as duas listas e deve garantir que sejam disjuntas. Não há validação nem sincronização automática a partir de uma lista única de ids. |
| Baixa | **Dimensões fixas** | `height: 24rem` nos dois painéis e `breakpoint: 960px` embutidos, sem override. |
| Baixa | **Sem reordenação** | `showSourceControls`/`showTargetControls` fixos em `false` — a ordem dos selecionados não pode ser alterada pelo usuário. |
| Baixa | **`filterBy` e `dataLabel` independentes** | Ambos default `"descricao"`, mas configurados separadamente; divergência entre eles produz filtro que não corresponde ao texto exibido. |
| Baixa | **"Item inválido" silencioso** | A degradação é graciosa, mas não há aviso em console nem sinalização ao desenvolvedor de que o `dataLabel` está incorreto. |
| Baixa | **Modo `isView` sem os não selecionados** | Exibe apenas os selecionados, ainda que renderize o `titleSelecionados` dentro de um bloco preparado para mais de uma seção. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — RA-04, RA-05
- [`Fields/README.md`](../Fields/README.md) · [`Rotulo/README.md`](../Rotulo/README.md)
