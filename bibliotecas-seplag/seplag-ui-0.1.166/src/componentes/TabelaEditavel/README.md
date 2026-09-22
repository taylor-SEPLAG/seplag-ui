# `TabelaEditavel/` — TabelaEditavelSeplag

## Objetivo

Fornecer uma tabela **em memória e editável**: poucas linhas já carregadas, colunas de leitura
ao lado de células com campo de formulário.

## Responsabilidade principal

Cobrir o padrão de **alocação** — "quanto cada órgão tem, quanto você quer mexer, qual o efeito"
— que aparece nas telas de quadro de vagas (reduzir, transformar, distribuir).

O componente é deliberadamente burro: **não registra campo, não valida, não soma, não pagina e
não conhece regra de negócio**. Tudo isso vem do `body` de cada coluna.

## Ponto de entrada

[`index.tsx`](./index.tsx) + [`style.module.css`](./style.module.css).

```ts
export { TabelaEditavelSeplag } from "./TabelaEditavel";
export type {
  ColunaTabelaEditavelSeplag,
  OpcoesCelulaTabelaEditavelSeplag,
  TabelaEditavelSeplagProps,
} from "./TabelaEditavel";
```

## Funcionalidades existentes

### Props

| Prop                        | Default                         | Papel                                                    |
| --------------------------- | ------------------------------- | -------------------------------------------------------- |
| `items`                     | —                               | `readonly T[]`, já em memória                            |
| `getKey(item)`              | —                               | Chave da linha e sufixo dos `data-testid` — obrigatória  |
| `columns`                   | —                               | Definição das colunas                                    |
| `disabled`                  | `false`                         | Chega ao `body`, **não é aplicado sozinho** — ver abaixo |
| `rowClassName(item, index)` | —                               | Classe extra por linha (linha travada, em erro…)         |
| `emptyMessage`              | `"Nenhum registro encontrado."` | Ocupa todas as colunas via `colSpan`                     |
| `cols`                      | `"12"`                          | Grid responsivo via `classesCssSeplag`                   |
| `id`                        | —                               | `id` do raiz e base dos `data-testid`                    |
| `className`                 | —                               | Classes extras no raiz                                   |
| `ariaLabel`                 | —                               | Nome acessível da `<table>`                              |

### Coluna

```ts
interface ColunaTabelaEditavelSeplag<T> {
  id: string; // obrigatório — ver "Identidade da coluna"
  header: ReactNode;
  field?: keyof T & string;
  body?: (item: T, index: number, opcoes: { disabled: boolean }) => ReactNode;
  footer?: ReactNode | ((items: readonly T[]) => ReactNode);
  width?: string;
  align?: "left" | "center" | "right"; // default: "left"
}
```

Precedência da célula: `body(...)` → `item[field]` → `null`.

### Identidade da coluna — por que `id` é obrigatório

Linhas e colunas têm identidades de origens diferentes:

|            | De onde vem a chave                                                                 |
| ---------- | ----------------------------------------------------------------------------------- |
| **Linha**  | `getKey(item)` — normalmente o id vindo da API, ou `fields[].id` do `useFieldArray` |
| **Coluna** | `coluna.id` — declarado em código, porque coluna não é dado                         |

`id` é **obrigatório e sem fallback para o índice**. Um fallback do tipo
`coluna.id ?? coluna.field ?? indice` — que é o que o
[`ListaSimplesSeplag`](../ListaSimples/) faz e que está registrado como débito no README dele
— mistura três espaços de nomes e volta ao índice justamente nas colunas só com `body`, que
são as que mais mudam de posição.

Dois motivos concretos:

1. **Conjuntos condicionais de colunas.** `[...base, ...(podeEditar ? [colunaAcoes] : [])]`
   muda a posição das colunas entre renders. Com chave por índice o React reaproveita a célula
   errada — o que atinge foco, cursor e estado interno de widgets (o painel do `Dropdown`, por
   exemplo). Valores de campo do `react-hook-form` sobrevivem, porque seguem o `name` e não o
   nó do DOM, mas o resto não.
2. **`data-testid` estável.** O sufixo da célula é o `id` da coluna, não a posição:
   `` `${id}-cell-${chave}-${coluna.id}` ``. Inserir uma coluna no meio **não** renumera os
   seletores dos testes já escritos.

### Como o `disabled` chega às células

Esta é a decisão central do componente. A tabela **não** aplica `disabled` a nada — ela o
repassa como terceiro argumento do `body`:

```tsx
{
  header: "Quantidade a transformar",
  body: (orgao, indice, { disabled }) => (
    <NumberFieldSeplag
      name={`itens.${indice}.qtd`}
      control={control}
      semMoldura
      disabled={disabled || orgao.travada}
      min={0}
      max={orgao.elegiveis}
    />
  ),
}
```

A alternativa descartada era um React Context que os editores consumissem sozinhos. Isso
exigiria que o `NumberFieldSeplag` — um campo genérico — conhecesse um contexto de tabela, ou
um invólucro extra fazendo `cloneElement`. O repasse explícito evita as duas coisas e **compõe
com regras da própria linha**, que o contexto não saberia expressar.

### Rodapé

Basta **uma** coluna declarar `footer` para o `<tfoot>` inteiro aparecer. Não há prop
`showFooter`: ela permitiria o estado inválido "rodapé ligado, nenhuma coluna com conteúdo".

`footer` aceita um `ReactNode` fixo ou uma função que recebe `items` — útil para totais:

```tsx
{ header: "Disponíveis", field: "disponiveis", align: "right",
  footer: (itens) => itens.reduce((soma, o) => soma + o.disponiveis, 0) }
```

### Semântica e acessibilidade

`<table>` real com `<thead>` / `<tbody>` / `<tfoot>`, `scope="col"` em cada `<th>` e
`aria-label` opcional. Leitores de tela anunciam a estrutura tabular e associam cada célula à
sua coluna — o que **não** acontece no [`ListaSimplesSeplag`](../ListaSimples/), que usa `<div>`
com `display: grid` (débito registrado no README dele).

### Largura das colunas

A tabela usa **`table-layout: auto`**, não `fixed`. Com `fixed`, quando a soma dos `width`
declarados passa da largura disponível, as colunas **sem** `width` são espremidas até ~zero e o
conteúdo colide — foi exatamente o que aconteceu na primeira versão da página de documentação,
onde 6 de 7 colunas somavam 57rem e a coluna "Órgão" desapareceu.

Com `auto`, `width` continua sendo uma preferência forte, nenhuma coluna colapsa, e o que não
couber vira rolagem horizontal no contêiner (`overflow-x: auto`).

**Regra prática:** declare `width` só nas colunas que precisam de um tamanho previsível (as de
campo editável) e deixe as demais absorverem o espaço restante.

### Identificadores

Com `id`: `` `${id}-row-${chave}` ``, `` `${id}-cell-${chave}-${coluna.id}` ``,
`` `${id}-footer` ``, `` `${id}-footer-${coluna.id}` `` e `` `${id}-vazio` ``.

Nenhum deles depende de posição: reordenar ou inserir colunas não quebra seletor de teste.

## Dependências

### Externas

Nenhuma. HTML puro — não usa PrimeReact.

### Internas

- [`../../uteis/Grid`](../../uteis/Grid.ts) — `classesCssSeplag`

Os campos das células vêm do consumidor; a tabela não importa nenhum.

## Módulos relacionados

| Módulo                               | Quando usar cada um                                                                                                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`TablePaginado`](../TablePaginado/) | Listagem de tela: paginação server-side, ordenação, seleção, ações de linha                                                                                           |
| **`TabelaEditavel`**                 | Poucas linhas em memória, dentro de formulário, com células editáveis                                                                                                 |
| [`ListaSimples`](../ListaSimples/)   | Poucas linhas em memória, **somente leitura**, sem semântica de tabela                                                                                                |
| [`PanelSeplag`](../PanelSeplag/)     | Moldura: título, descrição e `trailing`                                                                                                                               |
| [`ResumoValores`](../ResumoValores/) | Totalizadores acima/abaixo da tabela                                                                                                                                  |
| [`Fields`](../Fields/)               | Os campos das células — use `semMoldura`, `readOnly` nas colunas de leitura e `valoresIndisponiveis` quando as linhas escolhem de uma lista compartilhada sem repetir |

## Fluxos importantes

Composição completa de uma tela de alocação:

```tsx
<PanelSeplag
  title="Redução por órgão de distribuição"
  description="Somente vagas disponíveis, regulares e sem comprometimento ativo podem ser reduzidas."
  headerVariant="filled"
  trailing={
    <ResumoValoresSeplag itens={[{ id: "sel", valor: `${selecionadas} vaga(s) selecionada(s)` }]} />
  }
>
  <TabelaEditavelSeplag
    id="reducao"
    items={orgaos}
    getKey={(o) => o.id}
    ariaLabel="Redução por órgão"
    disabled={!quadroDestino}
    rowClassName={(o) => (o.travada ? "linha-travada" : undefined)}
    columns={[
      { header: "Órgão", field: "nome" },
      { header: "Distribuídas", field: "distribuidas", align: "right" },
      { header: "Disponíveis", field: "disponiveis", align: "right" },
      {
        header: "Quantidade a reduzir",
        width: "10rem",
        body: (o, i, { disabled }) => (
          <NumberFieldSeplag
            name={`itens.${i}.reduzir`}
            control={control}
            semMoldura
            disabled={disabled}
            min={0}
            max={o.disponiveis}
          />
        ),
      },
      {
        header: "Efeito previsto",
        body: (_o, i) => <span>{watch(`itens.${i}.reduzir`) ?? 0} extinta(s) imediatamente</span>,
      },
    ]}
  />
</PanelSeplag>
```

O estado bloqueado da tela de transformação (enquanto o quadro de destino não é escolhido) é
`disabled` na tabela + [`MensagemSeplag`](../Mensagem/) acima dela.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único, sem dependência de componentes.

## Observações técnicas e débitos identificados

| Severidade | Item                                       | Detalhe                                                                                                                                                                            |
| ---------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baixa      | **Sem ordenação, seleção ou expansão**     | Deliberado: o contrato é "formulário", não "listagem". Precisando disso, o caso é do [`TablePaginado`](../TablePaginado/).                                                         |
| Baixa      | **Sem `maxHeight`**                        | Diferente do `ListaSimples` (que força `16rem`), não há área rolável vertical — o caso previsto é de poucas linhas. Listas longas rolam com a página.                              |
| Baixa      | **`id` de coluna é verboso**               | Toda coluna precisa declarar `id`, mesmo em tabelas de duas colunas que nunca mudam. É o preço de não ter fallback para o índice — decisão consciente, ver "Identidade da coluna". |
| Baixa      | **Rodapé de uma linha só**                 | `<tfoot>` tem exatamente uma `<tr>`. Rodapés com múltiplas linhas de total não são expressáveis.                                                                                   |
| Baixa      | **`emptyMessage` também esconde o rodapé** | Com `items` vazio o `<tfoot>` continua sendo renderizado se alguma coluna declarar `footer`, exibindo totais de uma lista vazia. Cabe ao consumidor tratar.                        |
| Positivo   | **Semântica de tabela real**               | `<table>` + `scope="col"` + `<tfoot>`, ao contrário do `ListaSimples`.                                                                                                             |
| Positivo   | **Com testes**                             | [`index.test.tsx`](./index.test.tsx) — 13 casos, incluindo integração com `react-hook-form` e o contrato do `disabled`.                                                            |

## Documentos relacionados

- [`PanelSeplag/README.md`](../PanelSeplag/README.md) · [`ResumoValores/README.md`](../ResumoValores/README.md)
- [`Fields/README.md`](../Fields/README.md) — seção "Campo dentro de célula de tabela"
- [`TablePaginado/README.md`](../TablePaginado/README.md) — a alternativa para listagem
