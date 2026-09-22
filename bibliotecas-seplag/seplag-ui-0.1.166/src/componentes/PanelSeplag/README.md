# `PanelSeplag/` — PanelSeplag

## Objetivo

Agrupar visualmente um conjunto de campos ou conteúdo dentro de uma tela, com borda, título,
descrição e ícone opcionais.

## Responsabilidade principal

Subdividir o conteúdo de um [`CardSeplag`](../Card/) em seções semânticas — o nível
intermediário da hierarquia de contêineres da biblioteca.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 118 linhas. Implementado com `forwardRef<HTMLDivElement>`.

```ts
export { PanelSeplag } from "./PanelSeplag";
export type { PanelSeplagProps } from "./PanelSeplag";
```

> Exporta **apenas nomeado**, sem `default`. `displayName = "PanelSeplag"` é definido
> explicitamente (necessário por causa do `forwardRef`).

## Funcionalidades existentes

### Props

Todas documentadas com JSDoc no próprio arquivo — um dos componentes mais bem comentados da
biblioteca.

| Prop              | Default   | Papel                                                                |
| ----------------- | --------- | -------------------------------------------------------------------- |
| `cols`            | `"12"`    | Grid via `classesCssSeplag`                                          |
| `title`           | —         | Título do cabeçalho (`<strong class="label-rotulo label-destaque">`) |
| `description`     | —         | Texto abaixo do título (`<span class="text-sm">`)                    |
| `icon`            | —         | Classe do ícone (ex.: `"pi pi-user"`)                                |
| `iconClassName`   | —         | Classes extras do ícone                                              |
| `iconPosition`    | `"left"`  | `"left"` ou `"right"`                                                |
| `gap`             | `"2"`     | Mapeado para `gap-{n}` do PrimeFlex                                  |
| `className`       | —         | Classes do contêiner interno                                         |
| `classNameHeader` | —         | Classes do cabeçalho                                                 |
| `id`              | —         | `id` + base dos `data-testid`                                        |
| `ariaLabel`       | —         | Fallback: `title`                                                    |
| `children`        | —         | Conteúdo                                                             |
| `trailing`        | —         | Conteúdo à direita do cabeçalho, empurrado por `ml-auto`             |
| `headerVariant`   | `"plain"` | `"plain"` (sem fundo) ou `"filled"` (faixa tintada de borda a borda) |

### `trailing` — conteúdo à direita do cabeçalho

Slot para contador, totalizador ([`ResumoValoresSeplag`](../ResumoValores/)) ou botão de ação.
Empurrado por `ml-auto` — a classe correta do PrimeFlex.

`trailing` sozinho já faz o cabeçalho ser renderizado, mesmo sem `title`. Mas **não conta como
rótulo visível**: a condição do `aria-label` continua sendo `title || description || icon`,
então um painel só com `trailing` mantém seu nome acessível.

`data-testid`: `` `${id}-trailing` ``.

### `headerVariant` — faixa tintada

`"filled"` transforma o cabeçalho numa faixa que encosta nas bordas, separada do conteúdo por
uma linha — o padrão das telas de quadro de vagas.

Para a faixa encostar nas bordas, o padding **sai do contêiner e passa para o cabeçalho e o
conteúdo** (`p-3` em cada), e o contêiner ganha `overflow-hidden` para o arredondamento
recortar os cantos da faixa. Consequência: **`gap` deixa de ter efeito** nesse modo.

Sem cabeçalho (`title`, `description`, `icon` e `trailing` todos ausentes), `"filled"` é
ignorado e o contêiner volta ao `p-2` + `gap-{n}` normais.

```tsx
<PanelSeplag
  title="Redução por órgão de distribuição"
  description="Somente vagas disponíveis podem ser reduzidas."
  headerVariant="filled"
  trailing={<ResumoValoresSeplag itens={[{ id: "sel", valor: "0 vaga(s) selecionada(s)" }]} />}
>
  <TabelaEditavelSeplag ... />
</PanelSeplag>
```

### Estrutura

```html
<section ref id data-testid class="{colClass}" aria-label="{ariaLabel|title se SEM header}">
  <div class="flex flex-column border-1 border-300 border-round-sm p-2 gap-{n} {className}">
    <!-- header: só quando title || description || icon -->
    <header class="flex align-items-center gap-2 {classNameHeader}" data-testid="{id}-header">
      [ícone à esquerda]
      <div class="flex flex-column">
        <strong class="label-rotulo label-destaque">{title}</strong>
        <span class="text-sm">{description}</span>
      </div>
      [ícone à direita — com classe margin-left-auto]
    </header>

    <!-- só quando há children -->
    <div data-testid="{id}-content">{children}</div>
  </div>
</section>
```

### Detalhes de acessibilidade

- Elemento raiz semântico `<section>` e `<header>` (diferencial em relação a outros
  contêineres da biblioteca, que usam `<div>`)
- `aria-label` aplicado **apenas quando não há cabeçalho visível** (`hasHeader ? undefined : computedAriaLabel`) —
  evita rótulo duplicado para leitores de tela
- Ícone com `aria-hidden="true"`

### Reaproveitamento de classes

`label-rotulo` e `label-destaque` vêm de [`Rotulo/style.css`](../Rotulo/style.css) (CSS global),
garantindo que o título do painel tenha a mesma tipografia dos rótulos de campo.

## Dependências

### Externas

- `react` — `forwardRef`, tipo `ReactNode`

### Internas

- [`../../uteis/Grid`](../../uteis/Grid.ts) — `classesCssSeplag`

Não usa PrimeReact — é HTML puro com classes PrimeFlex.

## Módulos relacionados

Hierarquia de contêineres da biblioteca:

```
CardSeplag        ← moldura da tela (título, voltar, ações, rodapé)
  └── PanelSeplag ← seção dentro da tela (título, descrição, borda)
        └── Fields/*, ListaSimplesSeplag, TablePaginadoSeplag, ...
```

| Alternativa                          | Quando usar                                   |
| ------------------------------------ | --------------------------------------------- |
| [`Card`](../Card/)                   | Moldura de tela inteira                       |
| **`PanelSeplag`**                    | Seção estática, sempre visível                |
| [`AccordionCard`](../AccordionCard/) | Seção **colapsável**                          |
| [`Divider`](../Divider/)             | Apenas separação visual, sem borda nem título |

Nenhum componente da biblioteca consome `PanelSeplag` internamente.

## Fluxos importantes

```tsx
<CardSeplag title="Cadastro de servidor" handleVoltar={voltar}>
  <PanelSeplag id="dados-pessoais" title="Dados pessoais"
               description="Informações de identificação" icon="pi pi-user" cols="12">
    <div className="grid">
      <TextFieldSeplag name="nome" label="Nome"      control={control} cols="12 8" .../>
      <CPFFieldSeplag  name="cpf"  label="CPF"       control={control} cols="12 4" .../>
      <DateFieldSeplag name="dataNascimento" label="Nascimento" control={control} cols="12 4" .../>
    </div>
  </PanelSeplag>

  <PanelSeplag id="endereco" title="Endereço" icon="pi pi-map-marker" cols="12">
    ...
  </PanelSeplag>
</CardSeplag>
```

> **Atenção:** o `PanelSeplag` **não** monta um `<div className="grid">` interno (ao
> contrário do [`CardSeplag`](../Card/)). Para que campos com `cols` se alinhem dentro dele,
> o consumidor precisa envolvê-los em `<div className="grid">`.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único.

## Observações técnicas e débitos identificados

| Severidade | Item                                             | Detalhe                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Média      | **Sem `grid` interno**                           | Diferente do `CardSeplag`, não cria contexto de grid. Campos com `cols` colocados diretamente como filhos ficam desalinhados. Não há aviso disso na documentação JSDoc das props.                                                                                                                                                                                                             |
| Baixa      | **`margin-left-auto` — confirmado inexistente**  | Usada para empurrar o ícone de `iconPosition="right"`. Confirmado por busca: a classe **não existe** nem no PrimeFlex nem no CSS do projeto (0 ocorrências) — hoje o ícone da direita não é empurrado. `trailing` já nasceu com o `ml-auto` correto; trocar a do ícone é correção de uma linha, mas **muda o layout de quem usa `iconPosition="right"` hoje** e por isso não foi feita junto. |
| Baixa      | **`gap` como string numérica**                   | `gap="3"` → `gap-3`. Aceita qualquer string, inclusive valores inválidos, sem validação de tipo.                                                                                                                                                                                                                                                                                              |
| Baixa      | **`className` no contêiner, não no `<section>`** | O `<section>` recebe apenas a classe de grid; `className` vai para o `<div>` interno. Não é óbvio pelo nome da prop.                                                                                                                                                                                                                                                                          |
| Baixa      | **Conteúdo omitido quando `children` é falsy**   | `{children && <div>...}` — um `children` que seja `0` ou `""` não renderiza o wrapper de conteúdo.                                                                                                                                                                                                                                                                                            |
| Baixa      | **Sem variante sem borda**                       | A borda (`border-1 border-300`) é sempre aplicada.                                                                                                                                                                                                                                                                                                                                            |
| Positivo   | **Melhor documentação inline da biblioteca**     | Todas as props têm JSDoc descritivo.                                                                                                                                                                                                                                                                                                                                                          |
| Positivo   | **HTML semântico**                               | `<section>` + `<header>` + `aria-label` condicional.                                                                                                                                                                                                                                                                                                                                          |
| Positivo   | **Com testes**                                   | [`index.test.tsx`](./index.test.tsx) — 11 casos, 4 deles travando o modo `plain` no comportamento anterior a `trailing`/`headerVariant`.                                                                                                                                                                                                                                                      |

### Pendências para hotfix

Registrada em [`src/README.md`](../../README.md#pendências-gerais-da-biblioteca).

| Id      | Item                          | Por que foi adiado                                                                                                                                                                                                                                |
| ------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P-C** | `margin-left-auto` não existe | Trocar por `ml-auto` corrige o `iconPosition="right"`, que hoje não empurra nada — mas **muda o layout de toda tela que já usa essa prop**. Não é retrocompatível, então ficou fora do commit aditivo. O slot `trailing` já nasceu com `ml-auto`. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.5
- [`Card/README.md`](../Card/README.md) · [`AccordionCard/README.md`](../AccordionCard/README.md)
