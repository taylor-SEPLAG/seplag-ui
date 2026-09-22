# `Fields/` — Campos de formulário

## Objetivo

Fornecer o conjunto completo de campos de formulário da plataforma SEPLAG, encapsulando a
ligação entre os inputs do PrimeReact e o `react-hook-form`, com rótulo, grid, validação,
mensagem de erro, atributos de acessibilidade e `data-testid` padronizados.

## Responsabilidade principal

Eliminar o boilerplate de `<Controller>` + `<label>` + regras de obrigatoriedade +
renderização de erro que antes era repetido em cada tela. É o **maior subsistema da
biblioteca**: 20 campos + 3 utilitários + 19 arquivos de tipo.

## Pontos de entrada

| Arquivo                  | Papel                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| [`index.ts`](./index.ts) | Barrel de componentes e tipos — reexportado por `componentes/index.ts` via `export * from "./Fields"` |
| [`types.ts`](./types.ts) | Barrel dos arquivos de `types/`                                                                       |

## Funcionalidades existentes

### Catálogo de campos

| Componente                     | Widget PrimeReact       | Tipo do valor               | Observações                                                                 |
| ------------------------------ | ----------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `TextFieldSeplag`              | `InputText`             | `string`                    | Saneamento configurável, `autoTrimOnBlur`, ícone à direita                  |
| `TextAreaFieldSeplag`          | `InputTextarea`         | `string`                    | `mergeConstraintRules({ maxLength })`                                       |
| `EmailFieldSeplag`             | `InputText`             | `string`                    | Regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`, `maxLength` 100                         |
| `NumberFieldSeplag`            | `InputNumber`           | `number`                    | `min`/`max`, `mode`, `currency`, `locale`, fração                           |
| `CurrencyFieldSeplag`          | `InputText`             | `number`                    | Formata `pt-BR`/`BRL`; limite de 12 dígitos; reusa `NumberFieldSeplagProps` |
| `MaskFieldSeplag`              | `InputMask`             | `string`                    | Máscara genérica, default `99/99/9999`                                      |
| `TelefoneComercialFieldSeplag` | `InputText`             | `string`                    | Formatação progressiva; suporta 10 e 11 dígitos                             |
| `CPFFieldSeplag`               | `InputMask`             | `string`                    | Máscara `999.999.999-99`, `showIcon` + `onSearch`, `onComplete`             |
| `CNPJFieldSeplag`              | `InputMask`             | `string`                    | Máscara `**.***.***/****-99` (alfanumérica), valida DV por default          |
| `DateFieldSeplag`              | `Calendar`              | `string "dd/MM/yyyy"`       | `minDate`/`maxDate`, `validateAfterDate`, `validateStartDate`               |
| `DateTimeFieldSeplag`          | `Calendar`              | `string "dd/MM/yyyy HH:mm"` | Expõe `.parseValue()` e `.formatValue()` como estáticos                     |
| `FieldsetDateFieldSeplag`      | `Calendar` + `Fieldset` | `string "dd/MM/yyyy"`       | Variante do `DateField` envolvida em `<Fieldset>`                           |
| `DropdownFieldSeplag`          | `Dropdown`              | `any`                       | Filtro normalizado, virtual scroller, opções inativas/desabilitadas         |
| `MultiSelectFieldSeplag`       | `MultiSelect`           | `any[]`                     | Idem + `panelScope`, `viewMode`, preservação de itens bloqueados            |
| `CheckboxFieldSeplag`          | `Checkbox`              | `"S"` / `"N"`               | Valores configuráveis via `checkedValue`/`uncheckedValue`                   |
| `CheckboxListSeplag`           | `Checkbox[]`            | `any[]`                     | Lista de checkboxes com `toggleValue`                                       |
| `RadioButtonFieldSeplag`       | `RadioButton[]`         | `any`                       | Opções via `RadioOptionSeplag`                                              |
| `SwitchFieldSeplag`            | `InputSwitch`           | `"S"` / `"N"`               | `horizontal`, `textTooltip`                                                 |
| `SearchFieldSeplag`            | `AutoComplete`          | `string`                    | `completeMethod` com `delay: 300`, `forceSelection`                         |
| `ImageUploadFieldSeplag`       | `Image` + `FileUpload`  | `File` (callback)           | Abre `ImageCropperSeplag`; **não usa `react-hook-form`**                    |

### Utilitários — [`utils/`](./utils/)

#### [`resolveFieldRules.ts`](./utils/resolveFieldRules.ts) — núcleo de validação

| Função                                        | Comportamento                                                                                                                                                     |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buildRequiredValidate(label)`                | Rejeita `null`/`undefined` e strings só com espaços (`/[^\s]/`) → `"{label} é obrigatório"`                                                                       |
| `mergeConstraintRules(constraints, rules)`    | Injeta `maxLength`/`minLength`/`min`/`max` com mensagens padrão, **sem sobrescrever** o que o consumidor declarou                                                 |
| `resolveFieldRules(label, required, rules)`   | Mescla obrigatoriedade com `rules`; garante que `required` rode **antes** das validações custom; suporta `validate` como função ou objeto de validadores nomeados |
| `isFieldObrigatorio(required, resolvedRules)` | Decide se o asterisco vermelho aparece                                                                                                                            |
| `ensureErrorNodeId(node, id)`                 | Clona o nó de erro externo para garantir o atributo `id`                                                                                                          |

Tipo exportado: `FieldRules<T> = RegisterOptions<T, Path<T>>`.

#### [`utils/inactiveOption.tsx`](./utils/inactiveOption.tsx) — opções inativas

Padrão compartilhado por `DropdownFieldSeplag` e `MultiSelectFieldSeplag`:

- `isOptionInactive(option)` — `Boolean(option?.inactive)`
- `renderOptionLabelWithInactiveBadge(label, option, badgeLabel)` — envolve o rótulo com um
  `<BadgeSeplag variant="error" size="xs">` quando inativo
- `sortActiveFirstThenInactive(list, alphabetical)` — separa em dois grupos, ordena cada um
  por `_label` (`localeCompare`) e concatena — **inativos sempre no fim**
- `useInactiveSelectionToast(mensagem)` — devolve `notifyIfInactive(option)` que dispara
  `toastAtencao`

Defaults: `INACTIVE_BADGE_LABEL_DEFAULT = "Inativo"`,
`INACTIVE_TOAST_MESSAGE_DEFAULT = "Este registro está inativo."`

> **Contrato implícito:** o consumidor deve marcar as options com a propriedade booleana
> `inactive`. Não há tipo exportado que declare isso.

#### [`utils/sanitizeTextFieldValue.ts`](./utils/sanitizeTextFieldValue.ts)

Cadeia de saneamento do `TextFieldSeplag`, avaliada em ordem de **prioridade** (o primeiro
flag verdadeiro vence e retorna):

```
numbersOnly           → remove tudo que não for dígito
noSpaces              → remove todo espaço
allowNumberLetter     → mantém apenas [A-Za-z0-9]
!allowMoreThanOneSpace → colapsa espaços consecutivos em um  ← default
(nenhum)              → devolve o valor cru
```

#### [`FieldError.tsx`](./FieldError.tsx)

`<small id data-testid className="p-error" style={{display:"block", marginTop:"0.25rem"}}>`.
Retorna `null` quando não há `children`.

#### [`DateTimeFieldUtils.ts`](./DateTimeFieldUtils.ts)

Constantes `DATE_TIME_FIELD_FORMAT_SEPLAG` (`"dd/MM/yyyy HH:mm"`) e
`DATE_TIME_FIELD_MASK_SEPLAG` (`"99/99/9999 99:99"`), mais `parseDateTimeFieldValueSeplag`,
`formatDateTimeFieldValueSeplag`, `cleanDateTimeMaskedValueSeplag` (converte
`"__/__/____ __:__"` em `""`) e `isDateTimeInputTypingEventSeplag`.

> **Efeito colateral em import:** o módulo chama `updateLocaleOptions({ now, today, clear }, "pt")`
> no carregamento (linha 13). Importar qualquer coisa deste arquivo altera o locale global
> do PrimeReact.

### Tipos — [`types/`](./types/)

19 arquivos, um por campo, reexportados por `types.ts`. Todos herdam a mesma base:

```ts
name, control?, label?, cols?, required?, disabled?, visible?,
getFormErrorMessage?, rules?
```

Além de `FormFieldSeplagProps` (base "estrita": `control` e `getFormErrorMessage`
obrigatórios), `RadioOptionSeplag` e `SuggestionSeplag`.

### Campo dentro de célula de tabela — `semMoldura` e `readOnly`

Duas props habilitam o uso de um campo fora de um formulário em grid, tipicamente dentro de
`<td>`. Hoje existem em `NumberFieldSeplag` e `DropdownFieldSeplag`.

| Prop         | Papel                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `semMoldura` | Repassada ao [`RotuloSeplag`](../Rotulo/): renderiza só o campo, sem classe de grid e sem a caixa de rótulo. O campo passa a ocupar **100% do contêiner** — ver abaixo |
| `readOnly`   | Exibe o valor sem permitir alteração, **sem** as consequências de `disabled`                                                                                           |

```tsx
// coluna de leitura ao lado da coluna editável
<NumberFieldSeplag name={`itens.${i}.quantidadeAtual`} control={control} semMoldura readOnly />
<NumberFieldSeplag name={`itens.${i}.aAdicionar`}     control={control} semMoldura min={0} />
```

**Por que `readOnly` e não `disabled`.** Um campo `disabled` sai da navegação por Tab e
costuma ser pulado por leitores de tela. Quando o valor existe para o usuário **ler** e
decidir o que preencher no campo ao lado, esconder o dado é justamente o que não se quer.
`readOnly` mantém foco e anúncio; o fundo esmaecido vem de
[`ReadOnlyField.css`](./ReadOnlyField.css). Quando as duas props são passadas, `disabled`
prevalece.

> Em ambos os modos o valor permanece no estado do formulário: nenhum campo repassa `disabled`
> ao `Controller`, só ao componente do PrimeReact. A regra "input desabilitado não é enviado" é
> de `<form>` nativo e não vale aqui — o payload do `handleSubmit` sai do estado do RHF.

**Largura em `semMoldura`.** Sem a moldura o campo perde o wrapper `.elemento`, e
`.p-inputnumber` é `display: inline-flex` **sem largura** — o `<input>` interno assumiria o
tamanho padrão do navegador (~177px) e estouraria uma célula estreita, invadindo a coluna
vizinha. Por isso os dois campos aplicam a classe `seplag-field-sem-moldura`
([`SemMolduraField.css`](./SemMolduraField.css)), que os faz ocupar 100% do contêiner. É o
contrato do modo: o contexto controla a largura, então o campo **estica** para o que ele der em
vez de impor um tamanho próprio. Para largura fixa, use `inputStyle`.

### `valoresIndisponiveis` — várias linhas escolhendo da mesma lista

Caso típico: uma tabela em que cada linha escolhe um órgão, e o mesmo órgão não pode aparecer
duas vezes. O consumidor passa a lista completa de valores já tomados:

```tsx
const usados = watch("linhas").map((l) => l.orgaoId);

<DropdownFieldSeplag
  name={`linhas.${i}.orgaoId`}
  control={control}
  options={orgaos}
  optionLabel="nome"
  optionValue="id"
  valoresIndisponiveis={usados}
/>;
```

**Por que uma prop, e não só `excludeIf`.** O `excludeIf` já resolveria — mas exige uma guarda
que é fácil esquecer e falha em silêncio:

```tsx
// ERRADO: apaga a seleção da própria linha
excludeIf={(o) => usados.includes(o.id)}

// certo, e é o que a prop faz sozinha
excludeIf={(o) => usados.includes(o.id) && o.id !== valorDestaLinha}
```

O `excludeIf` remove a opção de `safeOptions` antes de tudo, e `safeOptions` é justamente onde
o `valueTemplate` procura o rótulo do valor selecionado. Sem a própria opção ele não acha nada
e cai no `placeholder` — a linha parece vazia, embora o valor continue no formulário.

Como o campo conhece o próprio valor, `valoresIndisponiveis` aplica a guarda internamente.
Passe a lista inteira, incluindo o valor da própria linha; entradas `null` de linhas ainda não
preenchidas são inofensivas. Combina com `excludeIf` — os dois filtros se aplicam.

Para manter a opção **visível porém esmaecida** em vez de sumir, use `optionsDisabled`.

### `min`/`max` no NumberField — por que ele escuta dois handlers

O `InputNumber` do PrimeReact tem dois canais de saída, e **os dois são necessários**:

| Handler         | Quando dispara                                                                                    | Valor entregue                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `onChange`      | a cada tecla                                                                                      | **cru** — `updateValue` chama `handleOnChange` com `parseValue(...)` sem passar por `validateValue`, então `min`/`max` **não** são aplicados |
| `onValueChange` | em Tab/Enter/blur, nos spinners, e **sempre que o componente corrige um valor fora do intervalo** | validado                                                                                                                                     |

A exibição, por sua vez, é reescrita a partir de `props.value` já clampada, pelo efeito
`changeValue` — que, ao corrigir, devolve o valor certo por `onValueChange`.

Escutar só o `onChange` faz o formulário guardar o valor cru enquanto a tela mostra o clampado.
Com `max={2}`, digitar `10` exibia **2** e submetia **10**; insistindo, o estado ia para 20 e 200
enquanto a célula oscilava. Coberto por
[`NumberFieldLimites.test.tsx`](./NumberFieldLimites.test.tsx), que reproduz a sequência tecla a
tecla e falha se o `onValueChange` for removido.

> `CurrencyFieldSeplag` não tem esse problema: usa `InputText` e rejeita a tecla quando
> passaria de `max`, em vez de clampar. (Ele também **não** trata `min`.)

**Implementação do `readOnly`.** O `InputNumber` tem `readOnly` nativo. O `Dropdown` **não** tem, e o modo é
obtido barrando as duas portas de entrada do componente:

| Porta   | Como é barrada                                   | Por quê                                                                                                                                                                   |
| ------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mouse   | `onClick` com `preventDefault`                   | O `_onClick` interno chama `props.onClick` e desiste se o evento voltar com `defaultPrevented` — é a saída oficial do PrimeReact                                          |
| Teclado | `onKeyDownCapture` com `stopPropagation` no root | O `onInputKeyDown` fica no input focável e abre o painel com **qualquer caractere imprimível**, não só com as teclas de navegação; a captura impede o evento de chegar lá |

`stopPropagation` sem `preventDefault` preserva a ação padrão do Tab, então o campo continua
focável. `filter` e `showClear` são desligados, e o `onChange` é ignorado como segunda barreira.

> Como o bloqueio depende de detalhes internos do `Dropdown`, o comportamento é coberto por
> [`ReadOnlyField.test.tsx`](./ReadOnlyField.test.tsx) — inclusive o caso do caractere
> imprimível, que a primeira implementação (lista de teclas por `event.key`) deixava passar.
> O handler interno compara `event.code`, não `event.key`.

## O padrão dual-mode

**Regra arquitetural RA-04.** Todo campo (exceto `ImageUploadFieldSeplag`) implementa duas
renderizações no mesmo arquivo:

```tsx
if (!control) {
  // Modo standalone — consumidor controla value/onChange
  const externalError = getFormErrorMessage?.(name);
  return (
    <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
      <div className="flex flex-column">
        <InputPrimeReact id={inputId} value={value} onChange={e => onChange?.(...)} />
        {ensureErrorNodeId(externalError, errorId)}
      </div>
    </RotuloSeplag>
  );
}

// Modo react-hook-form
return (
  <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio}>
    <Controller name={name} control={control} rules={resolvedRules}
      render={({ field, fieldState }) => {
        const externalError = getFormErrorMessage?.(field.name);
        const errorMessage = externalError ? externalError : fieldState.error?.message;
        return (
          <div className="flex flex-column">
            <InputPrimeReact id={field.name} value={field.value} onChange={field.onChange} />
            <FieldError id={errorId}>{errorMessage}</FieldError>
          </div>
        );
      }}
    />
  </RotuloSeplag>
);
```

**Precedência de erro:** `getFormErrorMessage(name)` **vence** `fieldState.error.message`
em todos os campos. A prop está marcada `@deprecated` nos tipos, mas é mantida por
compatibilidade retroativa.

## Convenções de identificação

| Elemento                               | Valor                                                       |
| -------------------------------------- | ----------------------------------------------------------- |
| `id` / `data-testid` do input          | `String(name)` (standalone) ou `field.name` (RHF)           |
| `id` da mensagem de erro               | `` `${inputId}-error` ``                                    |
| `data-testid` do rótulo                | `` `rotulo-${htmlFor}` `` e `` `rotulo-${htmlFor}-label` `` |
| `aria-invalid`                         | `true` quando há erro; `undefined` caso contrário           |
| `aria-describedby`                     | `errorId` **apenas quando há mensagem**                     |
| Opções (`CheckboxList`, `RadioButton`) | `` `${inputId}_${index}` ``                                 |

Em campos que usam widgets compostos, o `name`/`data-testid` chega ao `<input>` interno via
API `pt` do PrimeReact:

```tsx
pt={{ input: { root: { name: field.name, "data-testid": field.name, autoComplete } } }}
```

## Dependências

### Externas

- `primereact/*` — `inputtext`, `inputtextarea`, `inputnumber`, `inputmask`, `calendar`,
  `dropdown`, `multiselect`, `checkbox`, `radiobutton`, `inputswitch`, `autocomplete`,
  `fieldset`, `image`, `utils` (`classNames`), `api` (`updateLocaleOptions`)
- `react-hook-form` — `Controller`, `RegisterOptions`, `Control`, `Path`, `FieldValues`, `Validate`

### Internas

| Origem                           | Destino                                                             |
| -------------------------------- | ------------------------------------------------------------------- |
| Todos os campos                  | [`../Rotulo`](../Rotulo/)                                           |
| `DateField`, `FieldsetDateField` | [`../../uteis/manipulaData`](../../uteis/manipulaData.ts)           |
| `CNPJField`                      | [`../../uteis`](../../uteis/) → `validacaoCNPJSeplag`               |
| `CPFField`                       | [`../Botao`](../Botao/) → `BotaoIconSeplag`                         |
| `utils/inactiveOption`           | [`../Badge`](../Badge/) + [`../../hooks/toast`](../../hooks/toast/) |
| `ImageUploadField`               | [`../Botao`](../Botao/) + [`../ReactCrop`](../ReactCrop/)           |
| `DateTimeFieldUtils`             | `date-fns`                                                          |

## Módulos relacionados

| Módulo                                                | Relação                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| [`hooks/mensagemErro`](../../hooks/mensagemErro/)     | Produz a função para `getFormErrorMessage`                   |
| [`FilterForm`](../FilterForm/)                        | Envelope `<form className="col-12 grid p-fluid">` dos campos |
| [`FormActions`](../FormActions/)                      | Botões Salvar/Voltar ao fim do formulário                    |
| [`Card`](../Card/) · [`PanelSeplag`](../PanelSeplag/) | Contêineres típicos                                          |
| [`UnsavedChangesWarning`](../UnsavedChangesWarning/)  | `useUnsavedChangesSyncSeplag(formState.isDirty)`             |
| [`hooks/filters`](../../hooks/filters/)               | `useFiltersSeplag` observa os campos de filtro               |

## Fluxos importantes

### Pipeline de validação

```
props: { label, required, rules, maxLength/min/max }
   │
   ├─► mergeConstraintRules({ maxLength, min, max }, rules)
   │        └─ injeta regras com mensagem PT-BR sem sobrescrever as do consumidor
   │
   ├─► resolveFieldRules(label, required, rulesComConstraints)
   │        ├─ required = true  → { required: "{label} é obrigatório", validate: requiredValidate }
   │        ├─ rules.validate função → wrapper: required primeiro, depois a custom
   │        ├─ rules.validate objeto → cada validador é envolvido individualmente
   │        └─ rules.required do consumidor tem precedência (`rules.required ?? ...`)
   │
   ├─► isFieldObrigatorio(required, resolvedRules) → asterisco no RotuloSeplag
   │
   └─► <Controller rules={resolvedRules}>
```

### Ciclo de valor de um campo de data

```
API "2026-03-15"
  → stringToDateSeplag → Date → <Calendar value>
  → usuário escolhe → onChange(Date)
  → formatDateToStringSeplag → "15/03/2026"
  → field.onChange("15/03/2026")

O estado do formulário guarda SEMPRE string no formato brasileiro.
```

### Opções ativas/inativas em Dropdown e MultiSelect

```
options (do consumidor, com `inactive?: boolean`)
   │
   ├─► map → adiciona campos derivados:
   │       _search : NFD sem acentos + lowercase de [optionLabel, ...filterFields]
   │       _label  : optionLabel em UPPERCASE (se uppercase=true)
   │
   ├─► optionsFiltered? → filtra por lista de valores permitidos
   ├─► sortActiveFirstThenInactive(lista, sortAlphabetically)
   │
   ├─► filterBy="_search"   ← busca sem acento, sem custo por tecla
   ├─► optionLabel="_label"
   ├─► itemTemplate → renderOptionLabelWithInactiveBadge (badge "Inativo")
   ├─► optionDisabled → Set(optionsDisabled)
   └─► onChange → notifyIfInactive(option) → toastAtencao
```

**Virtual scroller adaptativo:** ativado apenas quando a quantidade de opções ultrapassa
`virtualScrollThreshold` (`{ itemSize: 43, lazy: false }`), prop disponível em `DropdownFieldSeplag`
e `MultiSelectFieldSeplag` com `@default 200`. O comentário no código explica: o `VirtualScroller`
do PrimeReact reserva altura fixa e impede o painel de encolher com poucos itens filtrados.

## Arquivos críticos

| Arquivo                                                      | Por quê                                            |
| ------------------------------------------------------------ | -------------------------------------------------- |
| [`utils/resolveFieldRules.ts`](./utils/resolveFieldRules.ts) | Toda validação de todos os campos passa por aqui   |
| [`utils/inactiveOption.tsx`](./utils/inactiveOption.tsx)     | Regra de negócio de registro inativo compartilhada |
| [`index.ts`](./index.ts) + [`types.ts`](./types.ts)          | Definem a superfície pública do subsistema         |
| [`DateTimeFieldUtils.ts`](./DateTimeFieldUtils.ts)           | Efeito colateral de locale no import               |

## Observações técnicas e débitos identificados

| Severidade | Item                                                  | Detalhe                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Alta**   | **Hook após return condicional** (R-14)               | `DateTimeField.tsx` chama `if (!visible) return null;` (linha 51) **antes** de `useId()` (linha 53). Alternar `visible` entre renders muda a ordem dos hooks. `CurrencyField` e `SwitchField` já corrigiram esse ponto movendo o `useState` para antes do return (comentário explicativo em `CurrencyField.tsx:56`).                                                                                                                       |
| Média      | **Dois caminhos de validação**                        | `DateField`, `DateTimeField`, `FieldsetDateField`, `EmailField` e `CNPJField` só chamam `resolveFieldRules` **quando o consumidor passa `rules`**; senão usam um builder local. Isso produz mensagens e comportamento de `required` sutilmente diferentes conforme o caminho.                                                                                                                                                              |
| Média      | **`getFormErrorMessage` depreciado mas prioritário**  | Está marcado `@deprecated` em todos os tipos, e ainda assim **vence** `fieldState.error`. Migrações precisam remover a prop, não apenas parar de usá-la.                                                                                                                                                                                                                                                                                   |
| Média      | **`any` difundido**                                   | Praticamente todo campo é genérico com `<T extends FieldValues = any>`, e `options` é `any[]` em `Dropdown`, `MultiSelect`, `CheckboxList` e `RadioButton`. ESLint marca `no-explicit-any` como `warn`.                                                                                                                                                                                                                                    |
| Média      | **Duplicação de `normalizar()`**                      | Função idêntica (NFD + lowercase) em `DropdownField.tsx:23` e `MultiSelectField.tsx:23`. Idem para o bloco de `effectiveVirtualScroller`.                                                                                                                                                                                                                                                                                                  |
| Média      | **Efeito colateral em import**                        | `DateTimeFieldUtils.ts:13` chama `updateLocaleOptions(..., "pt")` no topo do módulo.                                                                                                                                                                                                                                                                                                                                                       |
| Baixa      | **Tipos de props faltando**                           | `CPFFieldSeplagProps` é interface **local** ao arquivo (não está em `types/` nem no barrel). `CurrencyFieldSeplag` reusa `NumberFieldSeplagProps`; `FieldsetDateFieldSeplag` reusa `DateFieldSeplagProps`. Ver R-08.                                                                                                                                                                                                                       |
| Baixa      | **`ImageUploadFieldSeplag` fora do padrão**           | Não aceita `control`, não usa `Controller` nem `resolveFieldRules` — a integração com o formulário é responsabilidade do consumidor via `onFileSelect`.                                                                                                                                                                                                                                                                                    |
| Baixa      | **`FormFieldSeplagProps` sem uso**                    | Interface "estrita" exportada, mas nenhum campo a utiliza como base — cada um redeclara suas props.                                                                                                                                                                                                                                                                                                                                        |
| Baixa      | **Contrato `inactive` não tipado**                    | Nenhuma interface declara a propriedade que `isOptionInactive` lê.                                                                                                                                                                                                                                                                                                                                                                         |
| Média      | **`htmlFor` ausente em 10 campos no modo RHF** (R-17) | `CNPJField`, `CPFField`, `CheckboxField`, `CheckboxList`, `CurrencyField`, `DropdownField`, `EmailField`, `NumberField`, `RadioButtonField` e `SearchField` chamam `<RotuloSeplag>` **sem** `htmlFor` no ramo `react-hook-form`. Consequência: o rótulo vira `<div>` em vez de `<label for>` (perdendo a associação para leitores de tela) e os `data-testid` do rótulo (`rotulo-*`) somem. Ver [`Rotulo/README.md`](../Rotulo/README.md). |
| Baixa      | **Altura fixa inline**                                | `TextField` aplica `style={{ height: "40px" }}` diretamente; os demais campos herdam a altura do tema PrimeReact.                                                                                                                                                                                                                                                                                                                          |
| Baixa      | **Cobertura de teste**                                | `TextField`, `NumberField` (2 arquivos) e `Dropdown` cobertos; os outros 17 campos, não.                                                                                                                                                                                                                                                                                                                                                   |

### Pendências para hotfix

Adiadas por não serem retrocompatíveis ou por dependerem de decisão. Registradas em
[`src/README.md`](../../README.md#pendências-gerais-da-biblioteca).

| Id      | Item                                                            | Por que foi adiado                                                                                                                                                                                                      |
| ------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P-D** | `readOnly` e `semMoldura` só em `NumberField` e `DropdownField` | Estender aos outros 17 campos é aditivo e incremental; foi limitado ao escopo das telas de quadro de vagas. O `MultiSelectField` tem um `readOnly` próprio, com semântica diferente — unificar exige decidir qual vence |
| **P-E** | `CurrencyFieldSeplag` ignora `min`                              | Trata só `max` (rejeita a tecla), embora reuse `NumberFieldSeplagProps`, que declara `min`. Passar a respeitá-lo **muda o comportamento** de qualquer tela que informe `min` hoje                                       |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.2, §3.3, §7.1, RA-04 a RA-06
- [Objetivo da biblioteca](../../../docs/objetivo-da-biblioteca-de-componentes.md) — P-02
- [`Rotulo/README.md`](../Rotulo/README.md) · [`hooks/README.md`](../../hooks/README.md)
