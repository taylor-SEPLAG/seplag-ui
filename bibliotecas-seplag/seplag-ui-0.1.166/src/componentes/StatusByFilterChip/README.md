# `StatusByFilterChip/` — StatusByFilterChipSeplag

> ⚠️ **`@deprecated`** — Use [`BadgeSeplag`](../Badge/) com mapeamento explícito de status
> para variante no próprio consumidor.

## Objetivo

Traduzir uma string de status vinda da API em um badge colorido com rótulo em português.

## Responsabilidade principal

Encapsular o mapeamento *status → rótulo → cor* usando os enums de
[`type/status`](../../type/status.ts).

## Ponto de entrada

[`StatusByFilterChip.tsx`](./StatusByFilterChip.tsx) — 30 linhas.

```ts
/** @deprecated Use BadgeSeplag with explicit status-to-variant mapping in the consumer. */
export { StatusByFilterChipSeplag } from "./StatusByFilterChip/StatusByFilterChip";
```

> A interface de props é **local** (`interface Props`), não exportada.

## Funcionalidades existentes

### Props

| Prop | Tipo | Papel |
| --- | --- | --- |
| `descStatus` | `string \| null \| undefined` | Status vindo da API |

### Lógica

```ts
const raw = descStatus?.trim().toUpperCase() || StatusKeySeplag.PENDENTE;
const key = Object.values(StatusKeySeplag).includes(raw as StatusKeySeplag)
  ? (raw as StatusKeySeplag)
  : StatusKeySeplag.PENDENTE;
```

Normaliza (trim + uppercase) e valida contra o enum, com fallback em `PENDENTE`.

### Mapeamento

| `StatusKeySeplag` | Rótulo (`StatusLabels`) | Variante do badge |
| --- | --- | --- |
| `ATIVO` | "Ativo" | `success` |
| `PENDENTE` | "Pendente" | `warning` |
| `INATIVO` | "Inativo" | `error` |
| `EXTINTO` | "Extinto" | `error` |

Renderiza `<BadgeSeplag label={label} variant={variant} minWidth={120} />`.

## Dependências

### Externas
Nenhuma.

### Internas
- [`@componentes/Badge`](../Badge/) — `BadgeSeplag`
- [`@type/status`](../../type/status.ts) — `StatusKeySeplag`, `StatusLabels`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Badge`](../Badge/) | **Substituto recomendado** |
| [`StatusByDataFimChip`](../StatusByDataFimChip/) | Componente irmão, também `@deprecated`, que deriva o status de uma data de fim |
| [`type/status`](../../type/) | Origem do enum e dos rótulos — **continua público e recomendado** |

## Fluxos importantes

```
API  descStatus: "ativo" | "ATIVO " | "extinto" | null | ...
      │
      ├─ trim().toUpperCase()                       → "ATIVO"
      ├─ Object.values(StatusKeySeplag).includes()?  → válido? usa; senão PENDENTE
      ├─ StatusLabels[key]                          → "Ativo"
      ├─ variant: ATIVO→success | PENDENTE→warning | INATIVO/EXTINTO→error
      ▼
<BadgeSeplag label variant minWidth={120} />
```

Uso típico em coluna de tabela:

```tsx
{ header: "Situação", body: (row) => <StatusByFilterChipSeplag descStatus={row.descStatus} /> }
```

## Migração

**Antes:**

```tsx
<StatusByFilterChipSeplag descStatus={registro.descStatus} />
```

**Depois** — mapeamento explícito no consumidor:

```tsx
const VARIANTE_POR_STATUS: Record<StatusKeySeplag, BadgeSeplagProps["variant"]> = {
  [StatusKeySeplag.ATIVO]:    "success",
  [StatusKeySeplag.PENDENTE]: "warning",
  [StatusKeySeplag.INATIVO]:  "error",
  [StatusKeySeplag.EXTINTO]:  "error",
};

function statusChip(descStatus?: string | null) {
  const raw = descStatus?.trim().toUpperCase();
  const key = Object.values(StatusKeySeplag).includes(raw as StatusKeySeplag)
    ? (raw as StatusKeySeplag)
    : StatusKeySeplag.PENDENTE;
  return <BadgeSeplag label={StatusLabels[key]} variant={VARIANTE_POR_STATUS[key]} minWidth={120} />;
}
```

**Motivação da depreciação (hipótese):** o mapeamento status → cor é uma decisão de **negócio
de cada sistema**, não do design system. Sistemas diferentes podem querer `PENDENTE` em
`info` em vez de `warning`, ou tratar `EXTINTO` distintamente de `INATIVO`. Manter a regra na
biblioteca força um comportamento único para todos. O código não registra a justificativa
explicitamente.

## Arquivos críticos

Nenhum. Componente depreciado, de 30 linhas.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Média** | **Depreciado, ainda exportado** | Marcado `@deprecated` no barrel, sem versão-alvo de remoção nem aviso em runtime. |
| Média | **`EXTINTO` e `INATIVO` indistinguíveis** | Ambos usam `variant="error"` — o usuário não diferencia visualmente os dois estados. |
| Baixa | **Props não exportadas** | `interface Props` local, sem `export` — consumidores não conseguem tipar wrappers. |
| Baixa | **Nome genérico** | "ByFilter" não descreve o comportamento (mapear status para badge). |
| Baixa | **`minWidth={120}` fixo** | Sem prop de customização; badges curtos ficam largos. |
| Baixa | **Sem `visible`/`id`** | Diverge da convenção da biblioteca (§3.4). |
| Baixa | Sem testes. |

## Documentos relacionados

- [`Badge/README.md`](../Badge/README.md) — substituto recomendado
- [`type/README.md`](../../type/README.md) · [`StatusByDataFimChip/README.md`](../StatusByDataFimChip/README.md)
- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §10.4
