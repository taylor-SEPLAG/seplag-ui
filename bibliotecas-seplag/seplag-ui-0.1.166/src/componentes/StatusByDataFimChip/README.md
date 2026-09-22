# `StatusByDataFimChip/` — StatusByDataFimChipSeplag

> ⚠️ **`@deprecated`** — Use [`BadgeSeplag`](../Badge/) com mapeamento explícito de status
> para variante no próprio consumidor.

## Objetivo

Derivar visualmente "Ativo" ou "Inativo" a partir de uma **data de fim de vigência**.

## Responsabilidade principal

Encapsular a regra "vigente se a data de fim ainda não passou" em um badge colorido.

## Ponto de entrada

[`StatusByDataFimChip.tsx`](./StatusByDataFimChip.tsx) — 26 linhas.

```ts
/** @deprecated Use BadgeSeplag with explicit status-to-variant mapping in the consumer. */
export { StatusByDataFimChipSeplag } from "./StatusByDataFimChip/StatusByDataFimChip";
```

> A interface de props é **local** (`interface Props`), não exportada.

## Funcionalidades existentes

### Props

| Prop | Tipo | Papel |
| --- | --- | --- |
| `dataFim` | `string \| null \| undefined` | Data de fim no formato `"dd/MM/yyyy"` |

### Lógica

```ts
let ativo = true;

if (dataFim) {
  const dataFimParsed = parse(dataFim, "dd/MM/yyyy", new Date());
  ativo = isBefore(new Date(), dataFimParsed);   // hoje < dataFim → ativo
}

const key     = ativo ? StatusKeySeplag.ATIVO : StatusKeySeplag.INATIVO;
const variant = ativo ? "success" : "error";
```

**Regra:** sem `dataFim` → **ativo** (vigência indefinida). Com `dataFim` → ativo enquanto a
data atual for anterior à data de fim.

> Note que a comparação usa `new Date()` **com hora**, não `startOfDay` — no dia exato do
> vencimento, o resultado depende do horário. Contraste com
> [`isDocumentoAtivo`](../DropdownBaseLegal/helpers/documentoLegalHelpers.ts) do
> `DropdownBaseLegal`, que aplica `startOfDay` explicitamente.

Renderiza `<BadgeSeplag label={StatusLabels[key]} variant={variant} minWidth={120} />`.

## Dependências

### Externas
- `date-fns` — `parse`, `isBefore`

### Internas
- [`@componentes/Badge`](../Badge/) — `BadgeSeplag`
- [`@type/status`](../../type/status.ts) — `StatusKeySeplag`, `StatusLabels`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Badge`](../Badge/) | **Substituto recomendado** |
| [`StatusByFilterChip`](../StatusByFilterChip/) | Componente irmão, também `@deprecated`, que recebe o status pronto |
| [`uteis/manipulaData`](../../uteis/manipulaData.ts) | `isDateAfterSeplag`/`isDateBeforeSeplag` — utilitários públicos com comparação por dia (`startOfDay`) |
| [`DropdownBaseLegal/helpers`](../DropdownBaseLegal/helpers/documentoLegalHelpers.ts) | `isDocumentoAtivo` — regra de vigência mais completa (considera também `dataVigencia`) |

## Fluxos importantes

```
API  dataFim: "31/12/2026" | null | undefined
      │
      ├─ sem dataFim                        → ativo = true
      ├─ parse(dataFim, "dd/MM/yyyy")       → Date às 00:00 desse dia
      ├─ isBefore(new Date(), dataFimParsed) → ativo?
      ├─ key = ativo ? ATIVO : INATIVO
      ├─ StatusLabels[key]                  → "Ativo" | "Inativo"
      ▼
<BadgeSeplag label variant={ativo ? "success" : "error"} minWidth={120} />
```

Uso típico em coluna de tabela:

```tsx
{ header: "Vigência", body: (row) => <StatusByDataFimChipSeplag dataFim={row.dataFim} /> }
```

## Migração

**Antes:**

```tsx
<StatusByDataFimChipSeplag dataFim={registro.dataFim} />
```

**Depois** — usando os utilitários públicos da biblioteca:

```tsx
function vigenciaChip(dataFim?: string | null) {
  const ativo = !dataFim || isDateAfterSeplag(dataFim, new Date());
  return (
    <BadgeSeplag
      label={StatusLabels[ativo ? StatusKeySeplag.ATIVO : StatusKeySeplag.INATIVO]}
      variant={ativo ? "success" : "error"}
      minWidth={120}
    />
  );
}
```

`isDateAfterSeplag` compara com `startOfDay`, tornando o resultado independente do horário —
comportamento mais previsível que o do componente depreciado.

## Arquivos críticos

Nenhum. Componente depreciado, de 26 linhas.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Média** | **Comparação sensível à hora** | Usa `isBefore(new Date(), dataFimParsed)`. Como `parse("31/12/2026", "dd/MM/yyyy", …)` produz `00:00` desse dia, um registro com `dataFim` igual a hoje aparece como **Inativo** desde o primeiro minuto do dia. As demais regras de vigência da biblioteca (`isDateBeforeSeplag`, `isDocumentoAtivo`) aplicam `startOfDay` para evitar isso. |
| **Média** | **Depreciado, ainda exportado** | Marcado `@deprecated` no barrel, sem versão-alvo de remoção nem aviso em runtime. |
| Média | **Sem tratamento de data inválida** | `parse` de uma string malformada devolve `Invalid Date`; `isBefore` com data inválida retorna `false`, marcando o registro como **Inativo** silenciosamente. Não há `isValid`. |
| Baixa | **Formato de data fixo** | Aceita apenas `"dd/MM/yyyy"`. Uma data ISO (`"2026-12-31"`) falha no parse e cai no caso acima. |
| Baixa | **Props não exportadas** | `interface Props` local, sem `export`. |
| Baixa | **`minWidth={120}` fixo** | Sem customização. |
| Baixa | **Não considera `dataVigencia`** | Um registro com vigência futura aparece como Ativo. A regra completa existe em `isDocumentoAtivo` do [`DropdownBaseLegal`](../DropdownBaseLegal/), mas não é pública. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`Badge/README.md`](../Badge/README.md) — substituto recomendado
- [`uteis/README.md`](../../uteis/README.md) · [`StatusByFilterChip/README.md`](../StatusByFilterChip/README.md)
- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §10.4
