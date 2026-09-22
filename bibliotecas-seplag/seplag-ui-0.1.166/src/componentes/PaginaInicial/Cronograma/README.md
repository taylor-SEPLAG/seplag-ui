# `PaginaInicial/Cronograma/` — Cronograma do ciclo de pagamento

> Documentação completa do módulo: [`../README.md`](../README.md)

## Objetivo

Exibir e configurar a linha do tempo do ciclo de pagamento: seções ordenadas, cada uma com
eventos que têm data/hora de início, data/hora de fim, descrição e status.

## Responsabilidade principal

Feature completa — UI, chamadas HTTP, mapeamento de dados, validação e permissão. É o maior
arquivo do repositório (`index.tsx`, 897 linhas).

## Arquivos

| Arquivo | Papel |
| --- | --- |
| [`index.tsx`](./index.tsx) | Componente `Cronograma` — UI, drag-and-drop, validação, orquestração |
| [`cronogramaApi.ts`](./cronogramaApi.ts) | 4 endpoints RTK Query injetados na apiSlice do host |
| [`cronogramaMappers.ts`](./cronogramaMappers.ts) | Conversão API ⇄ modelo de UI |
| [`types.ts`](./types.ts) | Tipos de UI e de contrato da API |
| [`style.module.css`](./style.module.css) | Estilos |

Não é exportado individualmente — só via [`PaginaInicialSeplag`](../PaginaInicial.tsx).

## Funcionalidades existentes

### Modelo de dados

```ts
CronogramaData { id?, status?, titulo, secoes: SecaoCronograma[] }
  └── SecaoCronograma { id, ordem, titulo, marcador: "laranja"|"azul", eventos: EventoCronograma[] }
        └── EventoCronograma { id, ordem, dataInicio, dataFim, descricao, status }

EventoCronogramaStatus = "concluido" | "emAndamento" | "agendado"
```

Contrato da API (`CicloPagamentoRequest`/`Response`) usa `nome` onde a UI usa `titulo`, e não
tem o campo `marcador` — ele é derivado no mapeamento.

### Endpoints — [`cronogramaApi.ts`](./cronogramaApi.ts)

Tag de cache: `"CicloPagamento"`.

| Hook exportado | Método | URL | Tags |
| --- | --- | --- | --- |
| `useListarCiclosPagamentoQuery` | GET | `/v1/ciclo-pagamento` | provides |
| `useCriarCicloPagamentoMutation` | POST | `/v1/ciclo-pagamento` | invalidates |
| `useAtualizarCicloPagamentoMutation` | PUT | `/v1/ciclo-pagamento/{id}` | invalidates |
| `useDeletarCicloPagamentoMutation` | DELETE | `/v1/ciclo-pagamento/{id}` | invalidates |

Os hooks são obtidos por `getCronogramaApi()`, que faz cache em `let cronogramaApi` de módulo.

### Mapeadores — [`cronogramaMappers.ts`](./cronogramaMappers.ts)

**API → UI (`mapCicloPagamentoToCronograma`):**

| Regra | Detalhe |
| --- | --- |
| Ordenação | `sortByOrdem` em seções e eventos |
| `nome` → `titulo` | Renomeia o campo |
| `marcador` | Derivado do índice: `index % 2 === 0 ? "azul" : "laranja"` |
| `status` do ciclo | Default `"ATIVO"` |
| `status` do evento | `normalizeStatus`: `CONCLUIDO`/`EM_ANDAMENTO`/`AGENDADO` → camelCase; qualquer outro → `agendado` |
| Datas | `formatDateFromApi`: aceita `yyyy-MM-ddTHH:mm` (ISO) e `dd/MM/yyyy HH:mm`; devolve `dd/MM/yyyy HH:mm` |

**UI → API (`mapCronogramaToCicloPagamentoRequest`):**

| Regra | Detalhe |
| --- | --- |
| Ids temporários | `getRequestId(id) = Math.max(id, 0)` — ids negativos viram `0` (novo registro) |
| Ordenação | `sortByOrdem` antes de mapear |
| Datas | `formatDateToApi`: `dd/MM/yyyy [HH:mm]` → `dd/MM/yyyy HH:mm:00` (hora/minuto default `00`) |
| `marcador` | Descartado — não faz parte do contrato da API |

### Ids temporários

```ts
let temporaryIdSequence = 0;
function createTemporaryId() { temporaryIdSequence -= 1; return temporaryIdSequence; }
```

Novas seções e eventos recebem `-1`, `-2`, … Ao salvar, `getRequestId` os converte em `0`.

### Reordenação

Drag-and-drop nativo HTML5 (`DragEvent`), com:

```ts
reorderById(items, draggedId, targetId)   // remove e reinsere na posição alvo
normalizeOrder(items)                     // reatribui ordem = index + 1
```

### Validação — `getCronogramaValidationMessage`

Ordem de verificação (primeira falha interrompe):

1. `"O título do ciclo é obrigatório."`
2. `"Toda seção deverá possuir um título informado."`
3. `"Data início, data fim e descrição são obrigatórios em todos os eventos."`
4. `"A data/hora final deverá ser maior ou igual à data/hora inicial."`

As validações de data usam `DateTimeFieldSeplag.parseValue` — os helpers estáticos anexados
ao componente de campo.

`normalizeCronogramaDraft` aplica `trim()` nos títulos e renumera `ordem` antes do envio.

### Status do evento

| Status | Rótulo | Variante do [`BadgeSeplag`](../../Badge/) |
| --- | --- | --- |
| `agendado` | "Agendado" | `warning` |
| `emAndamento` | "Em Andamento" | `info` |
| `concluido` | "Concluído" | `success` |

### Exclusão

`ExclusaoPendente` é uma união discriminada por `tipo` (`"ciclo"` \| `"secao"` \| `"evento"`),
cada uma com sua mensagem em `getExclusaoMessage`. A seção avisa que os eventos vinculados
também serão removidos.

## Dependências

### Externas
- `react` — `useState`, `useEffect`, tipo `DragEvent`

### Internas
- [`../../Badge`](../../Badge/), [`../../Botao`](../../Botao/) (incluindo `BotaoRemoverSeplag`,
  **não exportado no barrel público**), [`../../Fields`](../../Fields/) (`DateTimeFieldSeplag`),
  [`../../ModalDelete`](../../ModalDelete/), [`../../../hooks/toast`](../../../hooks/toast/),
  [`../permissions`](../permissions.ts), [`../paginaInicialApi`](../paginaInicialApi.ts)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`../PaginaInicial.tsx`](../PaginaInicial.tsx) | Monta o componente e reage a `onConfigModeChange` |
| [`../Informativos`](../Informativos/) | Módulo irmão da página inicial |
| [`../permissions.ts`](../permissions.ts) | `DefaultPermissionsCicloCronogramaSeplag` + hook de permissão |
| [`../paginaInicialApi.ts`](../paginaInicialApi.ts) | Registry que injeta os endpoints na apiSlice do host |
| [`../../Fields`](../../Fields/) | `DateTimeFieldSeplag` (incluindo os estáticos `parseValue`/`formatValue`) |
| [`../../Badge`](../../Badge/) · [`../../Botao`](../../Botao/) · [`../../ModalDelete`](../../ModalDelete/) | UI |
| [`../../../hooks/toast`](../../../hooks/toast/) | Feedback de salvamento e validação |

## Fluxos importantes

```
useListarCiclosPagamentoQuery()
      │  CicloPagamentoResponse[]
      ▼
mapCicloPagamentoToCronograma(ciclo)  →  CronogramaData
      │
      ├─ modo visualização: timeline com badges de status
      │
      └─ modo configuração (podeEditar):
            ├─ adicionar/remover seção e evento (ids negativos)
            ├─ drag-and-drop → reorderById → normalizeOrder
            ├─ editar via DateTimeFieldSeplag e inputs
            │
            └─ salvar:
                  getCronogramaValidationMessage(draft)
                     ├─ mensagem → toastErro, aborta
                     └─ null → normalizeCronogramaDraft
                              → mapCronogramaToCicloPagamentoRequest
                              → criar (sem id) | atualizar (com id)
                              → invalida tag "CicloPagamento" → refetch
```

## Arquivos críticos

| Arquivo | Por quê |
| --- | --- |
| [`index.tsx`](./index.tsx) | 897 linhas — maior arquivo do repositório; concentra UI, drag-and-drop, validação e orquestração |
| [`cronogramaMappers.ts`](./cronogramaMappers.ts) | Conversão de datas e a convenção de id temporário → `0`; erros aqui **corrompem dados no backend** |
| [`cronogramaApi.ts`](./cronogramaApi.ts) | Cache de módulo (`let cronogramaApi`) e endpoints hardcoded |

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Alta** | **897 linhas em um arquivo** | Concentra UI, drag-and-drop, validação, ids temporários, permissões e 4 mutations. Maior arquivo do repositório; difícil de testar e de revisar. |
| **Alta** | **Endpoints e papéis hardcoded** | `/v1/ciclo-pagamento` e `ROLE_CICLO_PAGAMENTO_*` embutidos. Ver R-02. |
| Média | **Cache de módulo na apiSlice** | `let cronogramaApi` é inicializado uma vez; impede troca de apiSlice e vaza entre testes. |
| Média | **`marcador` derivado do índice** | `index % 2 === 0 ? "azul" : "laranja"` — a cor de uma seção **muda** se outra for inserida antes dela. Não é uma propriedade da seção, é do momento da renderização. |
| Média | **Contrato de id temporário implícito** | `Math.max(id, 0)` transforma qualquer id negativo em `0`. Depende de o backend interpretar `0` como "criar novo" — convenção não documentada em nenhum tipo. |
| Média | **Datas manipuladas por regex/`slice`** | `formatDateFromApi`, `formatDateToApi` e `formatTimelineDate` operam sobre strings com regex e `slice` posicional, em vez de `date-fns` (usado no restante da biblioteca). Fusos horários e formatos inesperados não são tratados. |
| Baixa | **`temporaryIdSequence` global** | Variável de módulo compartilhada; nunca reinicia. |
| Baixa | **Drag-and-drop nativo sem alternativa por teclado** | A reordenação só é possível com mouse/toque — inacessível por teclado. |
| Baixa | **BOM no arquivo** | `index.tsx` começa com `﻿`. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa da Página Inicial
- [Arquitetura da biblioteca](../../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-02
