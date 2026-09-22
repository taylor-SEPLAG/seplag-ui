# `tokens/` — Tokens de design

## Objetivo

Centralizar as constantes de design do Design System SEPLAG. Hoje o módulo contém
**apenas tokens de cor**.

## Responsabilidade principal

Ser a **fonte única da verdade cromática**. O cabeçalho de [`colors.ts`](./colors.ts) declara
a regra de forma explícita:

> *"Centraliza todos os tokens de cor utilizados nos componentes da biblioteca.
> Importe daqui ao invés de definir cores localmente nos componentes."*

## Ponto de entrada

[`index.ts`](./index.ts) → `export * from "./colors"`, re-exportado por `src/index.ts`.
Toda constante é **API pública**.

## Funcionalidades existentes

### Paleta primária e secundária

| Token | Valor |
| --- | --- |
| `SEPLAG_PRIMARY` | `#2196F3` |
| `SEPLAG_PRIMARY_DARK` | `#1769AA` |
| `SEPLAG_PRIMARY_LIGHT` | `#64B5F6` |
| `SEPLAG_SECONDARY` | `#607D8B` |
| `SEPLAG_SECONDARY_DARK` | `#37474F` |
| `SEPLAG_SECONDARY_LIGHT` | `#90A4AE` |

### Semânticas

| Token | Valor |
| --- | --- |
| `SEPLAG_SUCCESS` | `#4CAF50` |
| `SEPLAG_WARNING` | `#FF9800` |
| `SEPLAG_DANGER` | `#F44336` |
| `SEPLAG_INFO` | `#2196F3` (igual a `SEPLAG_PRIMARY`) |

### Trios de severidade (fundo / borda / texto)

Projetados para compor caixas de mensagem e badges:

| Severidade | `_BG` | `_BORDER` | `_TEXT` |
| --- | --- | --- | --- |
| Warning | `#fff8e6` | `#f4c16a` | `#d48a16` |
| Info | `#eff6ff` | `#93c5fd` | `#1d4ed8` |
| Error | `#fef2f2` | `#fca5a5` | `#dc2626` |
| Success | `#f0fdf4` | `#86efac` | `#16a34a` |

### Neutras e bordas

`SEPLAG_WHITE` `#FFFFFF` · `SEPLAG_BLACK` `#000000` · `SEPLAG_GRAY_100` `#F5F5F5` ·
`SEPLAG_GRAY_200` `#EEEEEE` · `SEPLAG_GRAY_400` `#BDBDBD` · `SEPLAG_GRAY_600` `#757575` ·
`SEPLAG_GRAY_800` `#424242` · `SEPLAG_BORDER_LIGHT` `#E6E6E6`

### Complementares

`SEPLAG_PURPLE` `#9C27B0` · `SEPLAG_TEAL` `#009688`

### Cores de esteira (workflow)

`ESTEIRA_SOLICITACAO` `#3b82f6` · `ESTEIRA_ANALISE_DOCUMENTAL` `#8b5cf6` ·
`ESTEIRA_PARECER_JURIDICO` `#ec4899` · `ESTEIRA_CRIACAO` `#f59e0b` ·
`ESTEIRA_TESTES` `#6366f1` · `ESTEIRA_APROVACAO_FINAL` `#059669`

> **Nota de nomenclatura:** este é o **único grupo sem o prefixo `SEPLAG_`**, divergindo
> da regra RA-03 do documento de Arquitetura.

## Dependências

Nenhuma. O módulo é composto exclusivamente por `export const` de strings.

## Módulos relacionados

Consumidores verificados no código:

| Componente | Tokens usados |
| --- | --- |
| [`componentes/Botao`](../componentes/Botao/) | `SEPLAG_PRIMARY` |
| [`componentes/Badge`](../componentes/Badge/) | Os 4 trios de severidade + `SEPLAG_GRAY_600`, `SEPLAG_WHITE`, `SEPLAG_BORDER_LIGHT` |
| [`componentes/Mensagem`](../componentes/Mensagem/) | Os 4 trios de severidade |
| [`componentes/Tabs`](../componentes/Tabs/) | `SEPLAG_PRIMARY`, `SEPLAG_SECONDARY`, `SEPLAG_WHITE`, `SEPLAG_BORDER_LIGHT` |
| [`componentes/UnsavedChangesWarning`](../componentes/UnsavedChangesWarning/) | `SEPLAG_PRIMARY` |

**Nenhum consumidor de `ESTEIRA_*` foi encontrado em `src/`.**
**Hipótese:** foram adicionados para uso pelas aplicações consumidoras (esteira de processos
de RH), não pela própria biblioteca. O código não registra a motivação.

## Fluxos importantes

Padrão de uso para severidade — verificado em `Badge` e `Mensagem`:

```ts
const VARIANT_STYLE = {
  success: { color: SEPLAG_SUCCESS_TEXT, bg: SEPLAG_SUCCESS_BG, border: SEPLAG_SUCCESS_BORDER },
  warning: { color: SEPLAG_WARNING_TEXT, bg: SEPLAG_WARNING_BG, border: SEPLAG_WARNING_BORDER },
  error:   { color: SEPLAG_ERROR_TEXT,   bg: SEPLAG_ERROR_BG,   border: SEPLAG_ERROR_BORDER   },
  info:    { color: SEPLAG_INFO_TEXT,    bg: SEPLAG_INFO_BG,    border: SEPLAG_INFO_BORDER    },
  neutral: { color: SEPLAG_GRAY_600,     bg: SEPLAG_WHITE,      border: SEPLAG_BORDER_LIGHT   },
};
```

## Arquivos críticos

- [`colors.ts`](./colors.ts) — 67 linhas que definem a identidade visual da plataforma.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Regra amplamente violada** | Apenas 5 componentes importam de `tokens/`. Literais hexadecimais aparecem em pelo menos 9 outros: `AccordionCard`, `AppSwitcher`, `CustomIcons`, `DropdownBaseLegal`, `ListaBuscaAcao`, `AnexarDocumento`, `AppSubmenuItem`, `Rotulo` e `TIPO_COR_MAP_DEFAULT_SEPLAG`. Ver R-04 no documento de Arquitetura. |
| Média | **Ausência de outros tipos de token** | Não há tokens de espaçamento, tipografia, raio de borda, sombra ou breakpoint. Esses valores estão inline nos componentes (`height: 40`, `borderRadius: 4`, `fontSize: "0.875rem"`, `1024px` etc.). |
| Baixa | **Sem variáveis CSS** | Os tokens só existem como constantes JavaScript. Regras em `.css`/`.module.css` não conseguem referenciá-los — usam variáveis do tema PrimeReact (`var(--surface-500)`, `var(--surface-border)`) ou literais. |
| Baixa | **`SEPLAG_INFO` duplica `SEPLAG_PRIMARY`** | Mesmo valor `#2196F3`; a intenção semântica pode divergir no futuro. |
| Baixa | **`ESTEIRA_*` sem prefixo** | Quebra a convenção de nomenclatura da biblioteca (RA-03). |
| Baixa | **`ESTEIRA_*` sem consumidor** | Nenhum uso em `src/` — candidato a documentação de uso externo ou a remoção. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md) — RA-07, R-04
- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md) — P-01
