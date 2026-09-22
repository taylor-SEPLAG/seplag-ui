# `type/` — Enums de domínio

## Objetivo

Declarar os enumeradores de domínio institucional da SEPLAG: identificação dos sistemas
corporativos e o conjunto padrão de status de registro.

## Responsabilidade principal

Evitar strings mágicas repetidas entre a biblioteca e as aplicações consumidoras,
especialmente no `AppSwitcherSeplag` (onde o rótulo do sistema é usado como chave de
identificação do sistema atual).

## Ponto de entrada

```ts
// src/index.ts
export * from "./type/sistemas";
export * from "./type/status";
```

Não há barrel `index.ts` no módulo — os dois arquivos são exportados individualmente.

## Funcionalidades existentes

### [`sistemas.ts`](./sistemas.ts)

Objeto `as const` + tipo homônimo (padrão *const enum object*, compatível com
`erasableSyntaxOnly` do `tsconfig`):

| Chave | Valor |
| --- | --- |
| `GESTAO_DE_PESSOAS` | `"GESTÃO DE PESSOAS"` |
| `FOLHA` | `"FOLHA"` |
| `PERICIA` | `"PERÍCIA"` |
| `CONSIGNADO` | `"CONSIGNADO"` |
| `CONTAGEM_DE_TEMPO` | `"CONTAGEM DE TEMPO"` |
| `E_SOCIAL` | `"E-SOCIAL"` |
| `APOSENTADORIA` | `"APOSENTADORIA"` |
| `CONFORMIDADE` | `"CONFORMIDADE"` |
| `AUDITORIA` | `"AUDITORIA"` |

> Os valores são **rótulos de exibição em caixa alta com acento**, não identificadores
> técnicos. Isso é intencional: `LayoutSeplag.currentSystem` compara por igualdade com
> `AppSystemItemSeplag.label` para destacar o sistema ativo no `AppSwitcherSeplag`.
> O JSDoc de `LayoutSeplagProps.currentSystem` confirma: *"Deve bater exatamente com o
> `label` de um item de `sistemas` (ver `SistemaSeplagId`)."*

### [`status.ts`](./status.ts)

| Chave / valor | Rótulo (`StatusLabels`) |
| --- | --- |
| `ATIVO` | `"Ativo"` |
| `INATIVO` | `"Inativo"` |
| `EXTINTO` | `"Extinto"` |
| `PENDENTE` | `"Pendente"` |

`StatusLabels` é um `Record<StatusKeySeplag, string>` que mapeia a chave em caixa alta
(formato do backend) para o rótulo em *Title Case* (formato de exibição).

## Dependências

Nenhuma. Ambos os arquivos contêm apenas constantes e tipos.

## Módulos relacionados

| Módulo | Uso |
| --- | --- |
| [`componentes/layout/AppSwitcher/sistemasSeplag.tsx`](../componentes/layout/AppSwitcher/sistemasSeplag.tsx) | Monta os 9 itens do seletor de sistemas usando `SistemaSeplagId` como `label` |
| [`componentes/layout/layout/Layout.tsx`](../componentes/layout/layout/Layout.tsx) | `currentSystem` é comparado com esses valores |
| [`componentes/StatusByFilterChip`](../componentes/StatusByFilterChip/) | `StatusKeySeplag` + `StatusLabels` — **`@deprecated`** |
| [`componentes/StatusByDataFimChip`](../componentes/StatusByDataFimChip/) | `StatusKeySeplag` + `StatusLabels` — **`@deprecated`** |

## Fluxos importantes

**Identificação do sistema ativo:**

```
LayoutSeplag currentSystem={SistemaSeplagId.FOLHA}   // "FOLHA"
      │
      ▼
AppTopbarSeplag currentSystem
      │  exibe: "{currentSystem} - {ambienteSistema}"
      ▼
AppSwitcherSeplag currentSystem
      │  item.label === currentSystem → fundo destacado (#1FA1FC66)
      ▼
sistemasSeplag[] (label vindo de SistemaSeplagId)
```

**Mapeamento de status para badge** (padrão `@deprecated`, mantido para compatibilidade):

```
descStatus da API ("ATIVO")
   → trim().toUpperCase()
   → valida contra Object.values(StatusKeySeplag), fallback PENDENTE
   → StatusLabels[key]  ("Ativo")
   → variant: ATIVO→success | PENDENTE→warning | demais→error
   → <BadgeSeplag label variant minWidth={120} />
```

## Arquivos críticos

- [`sistemas.ts`](./sistemas.ts) — acoplamento por valor literal com `sistemasSeplag.tsx` e
  `LayoutSeplag`. Alterar um rótulo aqui quebra silenciosamente o destaque do sistema ativo.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Rótulo usado como identificador** | `SistemaSeplagId` mistura identidade e apresentação. Renomear "PERÍCIA" para "PERÍCIA MÉDICA" quebra a comparação em `AppSwitcherSeplag` sem erro de compilação. O campo `id` de `AppSystemItemSeplag` existe (`"1"`..`"9"`), mas **não é usado** na comparação. |
| Baixa | **Sem barrel** | Diferente de `uteis/`, `interfaces/` e `tokens/`, `type/` não tem `index.ts`. `src/index.ts` importa arquivo a arquivo. |
| Baixa | **`StatusKeySeplag` só usado por deprecados** | Os dois únicos consumidores (`StatusByFilterChip` e `StatusByDataFimChip`) estão marcados `@deprecated` no barrel de componentes. O enum continua público e útil, mas perderá seus consumidores internos. |
| Baixa | **`EXTINTO` sem tratamento próprio** | `StatusByFilterChipSeplag` mapeia `EXTINTO` para `error`, mesma variante de `INATIVO`. |
| Baixa | **Nome do tipo** | `SistemaSeplagId` sugere identificador, mas o valor é um rótulo. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md)
- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md) — §1.1
