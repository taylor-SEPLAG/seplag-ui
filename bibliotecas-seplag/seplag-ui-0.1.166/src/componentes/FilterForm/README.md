# `FilterForm/` — FilterFormSeplag e FilterActionsSeplag

## Objetivo

Envelope de layout para a área de filtros de uma tela de listagem, e contêiner para os botões
de ação desses filtros.

## Responsabilidade principal

Padronizar o container do filtro — classes de grid, `p-fluid` e alinhamento vertical dos
botões com os campos. **Não contém lógica de filtragem**: essa é responsabilidade do
[`useFiltersSeplag`](../../hooks/filters/).

## Ponto de entrada

[`index.tsx`](./index.tsx) — 47 linhas, dois componentes.

```ts
export { FilterActionsSeplag, FilterFormSeplag } from "./FilterForm";
```

> As interfaces `FilterFormSeplagProps` e `FilterActionsSeplagProps` são **locais** ao
> arquivo (nem `export` no arquivo, nem no barrel).

## Funcionalidades existentes

### `FilterFormSeplag`

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"filter-form"` | `id` + `data-testid` |
| `children` | — | Campos de filtro |
| `onSubmit` | — | Handler do `<form>` |
| `asDiv` | — | Renderiza `<div>` em vez de `<form>` |

```tsx
// asDiv → <div  id data-testid className="col-12 grid p-fluid">
// padrão → <form id data-testid className="col-12 grid p-fluid" onSubmit>
```

`asDiv` existe para o caso de o filtro estar **dentro** de outro `<form>` — HTML não permite
formulários aninhados.

### `FilterActionsSeplag`

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"filter-actions"` | `id` + `data-testid` |
| `children` | — | Botões |

```html
<div id data-testid class="flex gap-2" style="padding-top: 1.8rem; align-items: flex-start">
```

O `paddingTop: 1.8rem` compensa a altura do rótulo dos campos vizinhos, alinhando os botões
com os **inputs**, não com os labels.

### Classes aplicadas

| Classe | Efeito |
| --- | --- |
| `col-12` | Ocupa a largura total no grid do [`CardSeplag`](../Card/) |
| `grid` | Cria contexto de grid para os `cols` dos campos filhos |
| `p-fluid` | PrimeReact: inputs ocupam 100% da largura do contêiner |

## Dependências

### Externas
- `react` — tipos `ReactNode` e `React.JSX.IntrinsicElements["form"]["onSubmit"]`

### Internas
Nenhuma. É folha do grafo.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`hooks/filters/useFiltersSeplag`](../../hooks/filters/) | Onde vive a lógica de filtro, debounce, paginação e persistência |
| [`Fields/`](../Fields/) | Campos colocados dentro do `FilterFormSeplag` |
| [`Botao`](../Botao/) | `BotaoConsultarSeplag`, `BotaoLimparFiltroSeplag` dentro do `FilterActionsSeplag` |
| [`TablePaginado`](../TablePaginado/) | Consome `page`/`rows`/`onPageChange` do `useFiltersSeplag` |
| [`FormActions`](../FormActions/) | Equivalente para **formulários de cadastro** (Salvar/Voltar), não para filtros |

Nenhum componente da biblioteca consome `FilterFormSeplag` internamente.

## Fluxos importantes

```tsx
const { control, getValues, reset } = useForm<Filtros>({ defaultValues });

const { page, rows, onPageChange, resetAll } = useFiltersSeplag<Filtros>({
  control, getValues, reset, defaultValues,
  debouncedFields: ["nome"],
  storageKey: "filtros-servidores",
  onSearch: (filtros, page, rows) => buscar({ ...filtros, page, rows }),
});

<CardSeplag title="Servidores">
  <FilterFormSeplag id="filtros-servidores">
    <TextFieldSeplag     name="nome"   label="Nome"   control={control} cols="12 4" .../>
    <DropdownFieldSeplag name="orgao"  label="Órgão"  control={control} cols="12 4" .../>
    <DateFieldSeplag     name="admissao" label="Admissão" control={control} cols="12 2" .../>

    <FilterActionsSeplag>
      <BotaoLimparFiltroSeplag onClick={resetAll} icon="pi pi-filter-slash" />
    </FilterActionsSeplag>
  </FilterFormSeplag>

  <TablePaginadoSeplag data={data} rows={rows} handleOnPageChange={onPageChange} ... />
</CardSeplag>
```

> Com `useFiltersSeplag`, a busca é **reativa** (dispara ao digitar, com debounce) — não há
> botão "Consultar". `BotaoConsultarSeplag` é usado quando o consumidor prefere busca manual,
> via `onSubmit` do `FilterFormSeplag`.

## Arquivos críticos

Nenhum. São dois wrappers de layout, sem lógica.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **Tipos de props não exportados** | `FilterFormSeplagProps` e `FilterActionsSeplagProps` são declarados sem `export`. Consumidores em TypeScript não conseguem tipar wrappers próprios. |
| Baixa | **`paddingTop: 1.8rem` mágico** | Valor calibrado para a altura do rótulo dos campos, embutido inline sem constante nem comentário. Alterar a tipografia de [`RotuloSeplag`](../Rotulo/) desalinha os botões silenciosamente. |
| Baixa | **`asDiv` não desabilita `onSubmit`** | O tipo permite passar `onSubmit` junto de `asDiv`; nesse caso a prop é ignorada, sem aviso. |
| Baixa | **Classes fixas** | `col-12 grid p-fluid` não é customizável — não há prop `className` nem `cols`. |
| Baixa | **`FilterActionsSeplag` sem alinhamento configurável** | `flex gap-2` + `align-items: flex-start` fixos, sem opção de alinhar à direita (contraste com `alignFooter` do [`ModalSeplag`](../Modal/)). |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §7.2
- [Objetivo da biblioteca](../../../docs/objetivo-da-biblioteca-de-componentes.md) — P-04
- [`hooks/README.md`](../../hooks/README.md) · [`FormActions/README.md`](../FormActions/README.md)
