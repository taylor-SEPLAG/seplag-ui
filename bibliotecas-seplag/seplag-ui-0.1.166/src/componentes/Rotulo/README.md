# `Rotulo/` — RotuloSeplag

## Objetivo

Envelopar qualquer elemento de formulário com o rótulo institucional SEPLAG: classe de grid
responsivo, `<label>` associado, marcador de obrigatoriedade, ícones laterais e tooltip
informativo.

## Responsabilidade principal

É, junto com [`BotaoSeplag`](../Botao/), um dos **dois componentes-base** da biblioteca.
Centraliza a decisão de "como um campo se apresenta", para que nenhum campo desenhe o próprio
`<label>` — regra arquitetural **RA-05**.

## Ponto de entrada

[`index.tsx`](./index.tsx) — exporta `RotuloSeplag` (nomeado e default) e `RotuloSeplagProps`.

```ts
// componentes/index.ts
export { RotuloSeplag } from "./Rotulo";
export type { RotuloSeplagProps } from "./Rotulo";
```

## Funcionalidades existentes

### Props

| Prop | Tipo | Default | Papel |
| --- | --- | --- | --- |
| `nome` | `string \| ReactNode` | — | Texto do rótulo |
| `children` | `ReactNode` | — | Elemento envolvido |
| `cols` | `string` | `"12"` | Grid responsivo via `classesCssSeplag` |
| `horizontal` | `boolean` | `false` | Alterna entre `rotulo-vertical` e `rotulo-horizontal` |
| `obrigatorio` | `boolean` | `false` | Exibe asterisco vermelho e define `aria-required` |
| `htmlFor` | `string` | — | Associa `<label htmlFor>`; **também habilita os `data-testid`** |
| `style` | `CSSProperties` | — | Estilo do wrapper de grid |
| `hidden` | `boolean` | `false` | Retorna `null` |
| `info` | `string \| ReactNode` | — | Ícone `pi-question-circle` com tooltip (só renderiza se for `string`) |
| `iconLeft` | `string` | — | Classe de ícone antes do texto |
| `iconRight` | `string` | — | Classe de ícone depois do texto |
| `semMoldura` | `boolean` | `false` | Devolve apenas `children`, sem classe de grid e sem a caixa de rótulo |

#### `semMoldura` — campo sem moldura

Todo campo de [`Fields/`](../Fields/) delega ao `RotuloSeplag`, que sempre emite a classe de
grid derivada de `cols` (`col-12 md:col-6` no `NumberFieldSeplag`, com o padding do PrimeFlex)
e sempre renderiza a caixa `label-rotulo col-fixed` — mesmo com `nome=""`. Dentro de uma célula
de tabela isso injeta um contexto de grid indevido e um rótulo vazio ocupando espaço.

`semMoldura` desliga as duas coisas:

```tsx
<td>
  <NumberFieldSeplag name={`itens.${i}.quantidade`} control={control} semMoldura />
</td>
```

`nome`, `obrigatorio`, `info`, `iconLeft`, `iconRight` e `horizontal` passam a ser ignorados —
todos descrevem a moldura. O rótulo vira responsabilidade do contexto (o `<th>` da coluna).
A verificação de `hidden` continua antes: `hidden` + `semMoldura` ainda retorna `null`.

> **Largura.** Sem a moldura o campo perde o wrapper `.elemento`, e `.p-inputnumber` é
> `display: inline-flex` **sem largura** — o `<input>` interno assumiria o tamanho padrão do
> navegador (~177px) e estouraria contêineres estreitos, como célula de tabela.
>
> Por isso `NumberFieldSeplag` e `DropdownFieldSeplag` aplicam a classe
> `seplag-field-sem-moldura` ([`SemMolduraField.css`](../Fields/SemMolduraField.css)) quando
> `semMoldura` está ligado: o campo ocupa 100% do contêiner, que é o contrato — o contexto
> controla a largura, então o campo **estica** para o que ele der, em vez de impor um tamanho
> próprio. Para largura fixa, use `inputStyle`.
>
> Campos que ainda não têm `semMoldura` não recebem esse tratamento.

### Estrutura renderizada

```html
<!-- Tooltip só é montado quando há info/iconLeft/iconRight -->
<Tooltip target=".custom-target-icon" className="rotulo-seplag-tooltip" />

<div class="{colClass}" aria-required data-testid="rotulo-{htmlFor}">
  <div class="content-rotulo rotulo-vertical|rotulo-horizontal">
    <label class="label-rotulo col-fixed label-destaque"
           for="{htmlFor}" data-testid="rotulo-{htmlFor}-label">
      <i class="{iconLeft}"/> <span>{nome}</span>
      <span class="obrigatorio">*</span>
      <i class="{iconRight}"/> <i class="pi pi-question-circle custom-target-icon"/>
    </label>
    <div class="col elemento" data-testid="rotulo-{htmlFor}-elemento">
      {children}
    </div>
  </div>
</div>
```

Sem `htmlFor`, o `<label>` é substituído por um `<div>` com as mesmas classes e os
`data-testid` ficam `undefined`.

### Composição interna

`LabelContent` é um subcomponente local (não exportado) que monta o conteúdo do rótulo,
reutilizado nos dois ramos (`<label>` e `<div>`) para evitar duplicação.

### Estilos

- Classes de layout: `content-rotulo`, `rotulo-vertical`, `rotulo-horizontal`, `label-rotulo`,
  `col-fixed`, `label-destaque`, `elemento` — definidas em [`style.css`](./style.css) (global).
- Existe também [`style.module.css`](./style.module.css) na pasta, **não importado** pelo
  `index.tsx`.

## Dependências

### Externas
- `primereact/tooltip` — `Tooltip` (montado condicionalmente)
- `react` — tipos `CSSProperties`, `ReactNode`

### Internas
- [`../../uteis/Grid`](../../uteis/Grid.ts) — `classesCssSeplag` (default import como `gridCss`)
- [`./style.css`](./style.css) — CSS global

**Nenhuma dependência de outro componente.** É uma folha do grafo, o que o torna seguro
como base.

## Módulos relacionados

Consumidores diretos:

| Módulo | Uso |
| --- | --- |
| [`Fields/`](../Fields/) | **Todos os 20 campos** envolvem seu input em `RotuloSeplag` |
| [`PickList`](../PickList/) | `<RotuloSeplag nome={title} cols="12">` nos dois modos |
| [`AnexarDocumento`](../AnexarDocumento/) | Quando `hideLabel` é `false` |
| [`layout/AppProfile`](../layout/AppProfile/) | Três campos de senha no modal de troca |

## Fluxos importantes

**Encadeamento de `cols` e obrigatoriedade em um campo:**

```
<TextFieldSeplag cols="12 6" required rules={{ ... }} />
        │
        ├─ resolveFieldRules(label, required, rules) → resolvedRules
        ├─ isFieldObrigatorio(required, resolvedRules) → boolean
        │
        ▼
<RotuloSeplag cols="12 6" obrigatorio={true} htmlFor="nome">
        │
        ├─ classesCssSeplag("12 6") → " col-12 md:col-6"
        ├─ aria-required={true}
        ├─ <span class="obrigatorio">*</span>
        └─ <label for="nome">  ←→  <InputText id="nome">
```

O asterisco aparece quando `required` é `true` **ou** quando `resolvedRules.required` é
uma string/`true` — ou seja, `rules={{ required: "..." }}` sem a prop `required` também
marca o campo visualmente.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — 127 linhas que definem a apresentação de todo campo da plataforma.
- [`style.css`](./style.css) — CSS **global**; as classes não são escopadas e podem colidir
  com estilos da aplicação consumidora.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **CSS global sem escopo** | `style.css` define `.content-rotulo`, `.label-rotulo`, `.elemento`, `.obrigatorio` no espaço global. `.elemento` é um nome genérico com risco real de colisão. |
| Média | **`Tooltip target` genérico** | `<Tooltip target=".custom-target-icon" />` casa com **todos** os elementos dessa classe na página. Como cada `RotuloSeplag` com `info` monta seu próprio `<Tooltip>`, N rótulos criam N tooltips apontando para os mesmos N ícones. |
| Baixa | **`info` só funciona como string** | O tipo aceita `ReactNode`, mas a renderização é condicionada a `typeof info === "string"` (linha 36) — um `ReactNode` é silenciosamente ignorado. |
| Média | **`data-testid` e `<label for>` dependentes de `htmlFor`** (R-17) | Sem `htmlFor`, `testId` é `undefined` (os três `data-testid` somem) **e** o `<label>` é substituído por um `<div>` — perdendo a associação rótulo↔campo para leitores de tela. Dez campos chamam o `RotuloSeplag` **sem** `htmlFor` no modo `react-hook-form`: `CNPJField`, `CPFField`, `CheckboxField`, `CheckboxList`, `CurrencyField`, `DropdownField`, `EmailField`, `NumberField`, `RadioButtonField` e `SearchField`. Os demais (`TextField`, `TextAreaField`, `DateField`, `DateTimeField`, `FieldsetDateField`, `MaskField`, `MultiSelectField`, `SwitchField`, `TelefoneComercialField`) passam corretamente. |
| Baixa | **`style.module.css` órfão** | Presente na pasta, não importado por `index.tsx`. |
| Baixa | **Cores e espaçamentos inline** | `color: "red"` no asterisco e `color: "#6c757d"` no ícone de info, em vez de tokens (`SEPLAG_DANGER`, `SEPLAG_GRAY_600`). Ver R-04. |
| Baixa | **`aria-required` no wrapper** | O atributo é aplicado no `<div>` de grid, não no `<input>` — os campos definem `aria-invalid`/`aria-describedby` no próprio input, mas não `aria-required`. |
| Baixa | **Sem testes** | Sem cobertura, apesar de ser dependência de 24 componentes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.4, §3.5, RA-05
- [`Fields/README.md`](../Fields/README.md) · [`uteis/README.md`](../../uteis/README.md)
