# `CheckBoxSN/` — CheckboxSNSeplag

## Objetivo

Checkbox cujo valor é a string `"S"` ou `"N"` — o formato de booleano usado pelos backends
legados da SEPLAG.

## Responsabilidade principal

Traduzir entre o `checked: boolean` do widget e o par de strings esperado pela API, sem que
cada tela precise fazer a conversão manualmente.

## Ponto de entrada

[`index.tsx`](./index.tsx) + [`values.ts`](./values.ts).

```ts
export { CheckboxSNSeplag } from "./CheckBoxSN";
export { CheckboxSNValorSeplag } from "./CheckBoxSN/values";
export type { CheckboxSNSeplagProps } from "./CheckBoxSN";
export type { CheckboxSNValorSeplagValue } from "./CheckBoxSN/values";
```

## Funcionalidades existentes

### Valores

```ts
// values.ts
export const CheckboxSNValorSeplag = { SIM: "S", NAO: "N" } as const;
export type CheckboxSNValorSeplagValue = (typeof CheckboxSNValorSeplag)[keyof typeof CheckboxSNValorSeplag];
```

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `name` | — | `Path<T>` |
| `control` | — | Presente → modo `react-hook-form` |
| `label` | — | **Obrigatório**; renderizado à direita do checkbox |
| `rules` | — | Passadas direto ao `Controller` (**sem** `resolveFieldRules`) |
| `inputId` | `String(name)` | `id` do input |
| `isDisabled` | `false` | Nome divergente do padrão `disabled` da lib |
| `className` / `style` | — | Aplicados ao `<div>` externo |
| `checkedValue` | `CheckboxSNValorSeplag.SIM` (`"S"`) | Valor quando marcado |
| `uncheckedValue` | `CheckboxSNValorSeplag.NAO` (`"N"`) | Valor quando desmarcado |
| `value` / `onChange` | — | Modo standalone |
| `getFormErrorMessage` | — | **`@deprecated`** — declarada no tipo, mas **nunca usada** na implementação |

### Modo dual

Segue o padrão **RA-04** da biblioteca:

| Condição | Comportamento |
| --- | --- |
| Sem `control` | `useState(externalValue ?? uncheckedValue)`; se `value` for informado, ele tem precedência sobre o estado interno |
| Com `control` | `<Controller>`; `checked = value === checkedValue`; `onChange(e.checked ? checkedValue : uncheckedValue)` |

### Estrutura

```html
<div class={className} style={style}>
  <Checkbox id inputId name data-testid checked onChange disabled />
  <label for={id} style="margin-left: 8">{label}</label>
</div>
```

## Dependências

### Externas
- `primereact/checkbox` — `Checkbox`, `CheckboxChangeEvent`
- `react-hook-form` — `Controller`, `Control`, `Path`, `RegisterOptions`, `FieldValues`

### Internas
- [`./values`](./values.ts) — apenas

**Não importa [`RotuloSeplag`](../Rotulo/) nem os utilitários de [`Fields/`](../Fields/).**

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Fields/CheckboxField`](../Fields/CheckboxField.tsx) | **Alternativa alinhada aos padrões da lib** — mesmo modelo `"S"`/`"N"`, mas com `RotuloSeplag`, `cols`, `resolveFieldRules`, `FieldError` e ARIA |
| [`Fields/SwitchField`](../Fields/SwitchField.tsx) | Também opera com `"S"`/`"N"`, em forma de switch |
| [`Fields/CheckboxList`](../Fields/CheckboxList.tsx) | Lista de checkboxes com valor `any[]` |

> **Orientação de uso:** para campos dentro de um formulário com grid e validação, prefira
> `CheckboxFieldSeplag`. `CheckboxSNSeplag` é adequado para checkboxes soltos, fora do
> layout de formulário.

## Fluxos importantes

```
Backend            "S" | "N"
   ▼
useForm defaultValues: { ativo: "S" }
   ▼
<CheckboxSNSeplag name="ativo" control={control} label="Ativo" />
   │  checked = field.value === "S"
   ▼
usuário desmarca → onChange("N")
   ▼
handleSubmit → { ativo: "N" } → backend
```

## Arquivos críticos

- [`values.ts`](./values.ts) — 7 linhas que definem o vocabulário booleano compartilhado com
  `CheckboxFieldSeplag` e `SwitchFieldSeplag` (que, no entanto, **repetem os literais**
  `"S"`/`"N"` em vez de importar daqui).

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Não segue o padrão de campo da lib** | Sem `RotuloSeplag`, sem `cols`, sem `resolveFieldRules`, sem `FieldError`, sem `aria-invalid`/`aria-describedby`, sem `visible`. Viola **RA-05** e **RA-06**. Sobrepõe-se funcionalmente a `CheckboxFieldSeplag`, que segue os padrões. |
| Média | **`getFormErrorMessage` declarada e ignorada** | A prop existe no tipo (marcada `@deprecated`), mas **não é desestruturada nem usada** na implementação. Um consumidor que a passe não verá erro algum ser renderizado. |
| Baixa | **`isDisabled` em vez de `disabled`** | Diverge de todos os outros componentes da biblioteca. |
| Baixa | **Erro de validação nunca exibido** | `render={({ field })}` não desestrutura `fieldState`; regras em `rules` podem falhar sem feedback visual. |
| Baixa | **`{ ...restField }` espalhado no `Checkbox`** | Inclui `ref` e `onBlur` do `react-hook-form`. O `ref` do RHF espera um elemento de formulário; o `Checkbox` do PrimeReact expõe `inputRef` para isso (padrão adotado em `CheckboxListSeplag`). |
| Baixa | **`field as any`** | Cast na desestruturação (linha 79). |
| Baixa | **Literais duplicados** | `CheckboxFieldSeplag` e `SwitchFieldSeplag` usam `"S"`/`"N"` literais em vez de `CheckboxSNValorSeplag`. |
| Baixa | **`useState` com valor inicial estático** | O estado interno é inicializado com `externalValue` no primeiro render; mudanças posteriores em `value` funcionam apenas porque `value` tem precedência na leitura — o estado interno fica dessincronizado. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — RA-04, RA-05, RA-06
- [`Fields/README.md`](../Fields/README.md)
