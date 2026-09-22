# `Mensagem/` — MensagemSeplag

## Objetivo

Exibir mensagens inline de aviso, informação, erro ou sucesso dentro do fluxo da página
(não é toast, não é modal).

## Responsabilidade principal

Padronizar a caixa de mensagem contextual: cores por severidade, ícone correspondente,
papel ARIA adequado e integração com o grid responsivo da biblioteca.

## Ponto de entrada

[`index.tsx`](./index.tsx).

```ts
export { MensagemSeplag } from "./Mensagem";
export type { MensagemSeplagProps, MensagemSeveritySeplag } from "./Mensagem";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"mensagem-seplag"` | `id` + `data-testid` |
| `message` | — | Texto (pode conter HTML — ver débitos) |
| `visible` | `true` | `false` → retorna `null` |
| `cols` | `"12"` | Grid via `classesCssSeplag` |
| `severity` | `"warning"` | `warning` \| `info` \| `error` \| `success` |
| `icon` | — | Sobrescreve o ícone da severidade |
| `allowHtml` | **`true`** | Habilita renderização de HTML |
| `style` | — | Espalhado por último sobre a paleta |

### Severidades

| Severity | Paleta (de [`tokens/colors`](../../tokens/colors.ts)) | Ícone |
| --- | --- | --- |
| `warning` | `SEPLAG_WARNING_BG` / `_BORDER` / `_TEXT` | `pi pi-exclamation-triangle` |
| `info` | `SEPLAG_INFO_BG` / `_BORDER` / `_TEXT` | `pi pi-info-circle` |
| `error` | `SEPLAG_ERROR_BG` / `_BORDER` / `_TEXT` | `pi pi-times-circle` |
| `success` | `SEPLAG_SUCCESS_BG` / `_BORDER` / `_TEXT` | `pi pi-check-circle` |

### Acessibilidade

```
severity === "error"  → role="alert",  aria-live="assertive"
demais                → role="status", aria-live="polite"
```

O ícone recebe `aria-hidden="true"`. O atributo `data-severity` é exposto no elemento raiz,
facilitando seletores em testes.

### Detecção de HTML

```tsx
const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(message);
const shouldRenderHtml = allowHtml && hasHtmlTag;
```

Ou seja: com `allowHtml` no default (`true`), qualquer mensagem que **contenha uma tag HTML**
é renderizada via `dangerouslySetInnerHTML`.

### Estrutura

```html
<div class="{colClass}">
  <div id data-testid data-severity role aria-live
       class="inline-flex align-items-center gap-2 border-1 px-2 py-1"
       style="border-radius: 6px; {paleta}; {style}">
    <i class="{icon}" aria-hidden="true"/>
    <div style="font-weight:600; font-size:1rem; line-height:1.4">{message}</div>
  </div>
</div>
```

## Dependências

### Externas
Nenhuma. Não usa PrimeReact — é HTML puro com estilo inline e classes PrimeFlex.

### Internas
- [`../../uteis/Grid`](../../uteis/Grid.ts) — `classesCssSeplag`
- [`../../tokens/colors`](../../tokens/colors.ts) — 12 tokens (os 4 trios de severidade)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`tokens/`](../../tokens/) | Fonte das paletas de severidade |
| [`provider/printToast`](../../provider/printToast/) | Alternativa **transiente**: use toast para feedback de operação, `MensagemSeplag` para aviso permanente na página |
| [`Fields/FieldError`](../Fields/FieldError.tsx) | Alternativa para erro **de campo** (`<small class="p-error">`) |

Nenhum componente da biblioteca consome `MensagemSeplag` internamente — é de uso exclusivo
das aplicações consumidoras.

## Fluxos importantes

Escolha do mecanismo de feedback:

```
Feedback de operação (salvou, excluiu, falhou)   → useToastSeplag()
Erro de validação de um campo                    → getFormErrorMessage / FieldError
Aviso contextual permanente na tela              → MensagemSeplag
Confirmação bloqueante                           → ModalDeleteSeplag / ModalSeplag
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — componente principal.
- [`message.ts`](./message.ts) — **módulo órfão** (ver débitos).

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Média (segurança)** | **`allowHtml` default `true`** | Linha 104 usa `dangerouslySetInnerHTML`. Como o default habilita HTML e a detecção é apenas uma regex de tag, qualquer `message` vinda de API ou de entrada do usuário que contenha `<` + letra é interpretada como markup. **Diretriz:** inverter o default para `false`. Ver R-05 no documento de Arquitetura. |
| **Média** | **Módulo órfão: [`message.ts`](./message.ts)** | Define `messageSlice` (Redux Toolkit), `setMessage` e `selectMessage`, e importa `RootState` de [`app/store/store.ts`](../../app/store/store.ts) — o store **vazio** interno da lib. **Nunca é importado por nenhum módulo** e não está no barrel público. Ainda assim é empacotado em `dist/` por causa de `preserveModules`. Também não se relaciona com o `MensagemSeplag` visual: usa o vocabulário de severidade do PrimeReact (`"warn"`), não o da lib (`"warning"`). Ver R-07. |
| Baixa | **Sem suporte a título/ação** | Não há `summary`, botão de fechar nem ação. Para mensagens dispensáveis é preciso o consumidor controlar `visible`. |
| Baixa | **Tipografia fixa** | `fontWeight: 600` e `fontSize: "1rem"` inline, sem override — `style` afeta apenas o contêiner externo, não o texto. |
| Baixa | **`inline-flex` no contêiner interno** | A caixa se ajusta ao conteúdo; para ocupar toda a largura da coluna é preciso `style={{ display: "flex" }}`. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-05, R-07
- [`tokens/README.md`](../../tokens/README.md) · [`provider/README.md`](../../provider/README.md)
