# `FormActions/` — FormActionsSeplag

## Objetivo

Rodapé padrão de formulário: divisor horizontal seguido dos botões Voltar e Salvar alinhados
à direita.

## Responsabilidade principal

Garantir que todo formulário da plataforma encerre com a mesma disposição de ações,
incluindo o estado de carregamento durante o salvamento.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 63 linhas.

```ts
export { FormActionsSeplag } from "./FormActions";
```

> A interface `FormActionsSeplagProps` é **local** ao arquivo (sem `export`).

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"form-actions"` | Base dos `data-testid` |
| `onGoBack` | — | Callback do botão Voltar (obrigatório) |
| `onSave` | — | **Quando ausente, o botão Salvar vira `type="submit"`** |
| `showSave` / `showBack` | `true` | Exibição de cada botão |
| `isLoading` | `false` | `loading` no botão Salvar |
| `disableSave` / `disableBack` | `false` | Desabilita cada botão |
| `saveLabel` / `backLabel` | `"Salvar"` / `"Voltar"` | Rótulos |
| `saveProps` | — | `Omit<BotaoSeplagProps, "type" \| "loading" \| "onClick">` |
| `children` | — | Botões extras, renderizados **entre** Voltar e Salvar |

### Comportamento do botão Salvar

```tsx
type={onSave ? "button" : "submit"}
```

Dois modos:

| Uso | Resultado |
| --- | --- |
| **Sem `onSave`** | `type="submit"` — o formulário submete via `handleSubmit` do `react-hook-form` (validação executa) |
| **Com `onSave`** | `type="button"` — chama o callback diretamente (validação **não** executa automaticamente) |

O modo submit é o recomendado, por acionar a validação do `react-hook-form`.

### Estrutura

```html
<DividerSeplag className="col-12" />
<div id data-testid class="flex gap-2 justify-content-end col-12">
  [BotaoVoltarSeplag  id="{id}-voltar"]
  {children}
  [BotaoSalvarSeplag  id="{id}-salvar"]
</div>
```

Ordem visual: **Voltar → extras → Salvar** (ação primária à direita).

### Identificadores

`{id}` · `{id}-voltar` · `{id}-salvar`.

## Dependências

### Externas
- `react` — tipo `ReactNode`

### Internas
- [`@componentes/Botao`](../Botao/) — `BotaoSalvarSeplag`, `BotaoVoltarSeplag`, `BotaoSeplagProps`
- [`@componentes/Divider`](../Divider/) — `DividerSeplag`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Card`](../Card/) | Contêiner do formulário; o `FormActionsSeplag` costuma ser o último filho |
| [`Fields/`](../Fields/) | Campos acima do rodapé de ações |
| [`FilterForm`](../FilterForm/) | Equivalente para **filtros** (`FilterActionsSeplag`), não para cadastro |
| [`UnsavedChangesWarning`](../UnsavedChangesWarning/) | `guard()` pode proteger o `onGoBack` |
| [`Modal`](../Modal/) | Tem rodapé próprio; não usa este componente |

Nenhum componente da biblioteca consome `FormActionsSeplag` internamente.

## Fluxos importantes

**Modo submit (recomendado):**

```tsx
const { control, handleSubmit, formState } = useForm<Servidor>();
const { guard } = useUnsavedChangesSeplag();

<form onSubmit={handleSubmit(salvar)}>
  <CardSeplag title="Servidor" handleVoltar={() => guard(() => navigate(-1))}>
    <TextFieldSeplag name="nome" control={control} cols="12 6" .../>
    <CPFFieldSeplag  name="cpf"  control={control} cols="12 6" .../>

    <FormActionsSeplag
      id="servidor-acoes"
      onGoBack={() => guard(() => navigate(-1))}
      isLoading={salvando}
      disableSave={!formState.isDirty}
    />
  </CardSeplag>
</form>
```

**Com ação extra:**

```tsx
<FormActionsSeplag onGoBack={voltar} isLoading={salvando} saveLabel="Enviar para análise">
  <BotaoSeplag label="Salvar rascunho" type="button" outlined onClick={salvarRascunho} />
</FormActionsSeplag>
```

## Arquivos críticos

Nenhum. Componente de composição, sem lógica própria.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **`type` implícito pela presença de `onSave`** | A alternância entre `submit` e `button` depende de `onSave` estar definido. Um consumidor que passe `onSave` esperando também a validação do `react-hook-form` não a terá — a diferença não está documentada em nenhum JSDoc. |
| Baixa | **Tipo de props não exportado** | `FormActionsSeplagProps` é local ao arquivo. |
| Baixa | **`DividerSeplag className="col-12"` redundante** | O `DividerSeplag` já aplica `col-12` por default (`cols = "12"`), resultando em `" col-12 col-12"`. |
| Baixa | **Divisor sempre renderizado** | Não há prop para omiti-lo (contraste com `showFooterDivider` do [`ModalSeplag`](../Modal/)). |
| Baixa | **Alinhamento fixo** | `justify-content-end` embutido, sem opção de alinhar à esquerda. |
| Baixa | **`children` entre os botões** | Extras aparecem entre Voltar e Salvar, sem controle de posição. |
| Baixa | **`onGoBack` obrigatório mesmo com `showBack={false}`** | O tipo exige a prop ainda que o botão não seja renderizado. |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §7.1
- [`Botao/README.md`](../Botao/README.md) · [`FilterForm/README.md`](../FilterForm/README.md)
