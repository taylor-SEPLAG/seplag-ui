# `PaginaInicial/` — Página inicial (Cronograma + Informativos)

## Objetivo

Entregar uma **página inicial completa e funcional** para os sistemas SEPLAG, com dois
módulos: mural de informativos e cronograma do ciclo de pagamento (com modo de configuração
para usuários autorizados).

## Responsabilidade principal

> ⚠️ **Este é o único módulo da biblioteca que contém regra de negócio, chamadas HTTP e
> papéis de acesso.** É a exceção arquitetural do catálogo, registrada como **R-02** no
> documento de Arquitetura.

Diferente de todos os demais componentes — que recebem dados prontos por props — este
declara seus próprios endpoints, injeta-os na apiSlice do host e lê permissões do store Redux
do consumidor.

## Estrutura

```
PaginaInicial/
├── index.ts                    ← barrel público
├── PaginaInicial.tsx           ← orquestrador (alterna home ↔ configuração)
├── paginaInicialApi.ts         ← registry de injeção de endpoints
├── permissions.ts              ← papéis e hook de permissão (lê o store do host)
├── style.module.css
├── Cronograma/
│   ├── index.tsx               ← 897 linhas — maior arquivo do repositório
│   ├── cronogramaApi.ts        ← 4 endpoints RTK Query
│   ├── cronogramaMappers.ts    ← API ⇄ modelo de UI
│   ├── types.ts
│   └── style.module.css
└── Informativos/
    ├── index.tsx               ← 375 linhas
    ├── informativosApi.ts      ← 4 endpoints RTK Query
    ├── types.ts
    └── style.module.css
```

## Ponto de entrada

```ts
// componentes/index.ts
export { configurarPaginaInicialSeplag, PaginaInicialSeplag } from "./PaginaInicial";
```

**Duas etapas obrigatórias no consumidor:**

```ts
// 1. Registrar a apiSlice — ANTES do primeiro render
import { apiSlice } from "./app/api";
configurarPaginaInicialSeplag(apiSlice);

// 2. Renderizar
<Route path="/inicio" element={<PaginaInicialSeplag />} />
```

## Funcionalidades existentes

### `PaginaInicial.tsx`

Alterna entre dois modos por meio do callback `onConfigModeChange` do `Cronograma`:

| Modo | Layout | Conteúdo |
| --- | --- | --- |
| Home (`isViewingHome`) | `style.homeGrid` | `<Informativos />` + `<Cronograma />` |
| Configuração | `style.configGrid` | Apenas `<Cronograma />` (tela cheia) |

### Injeção de endpoints — [`paginaInicialApi.ts`](./paginaInicialApi.ts)

Registry de módulo (service locator):

```ts
let paginaInicialApiSlice: ApiSliceLike | undefined;

export function configurarPaginaInicialSeplag(apiSlice) { paginaInicialApiSlice = apiSlice; }

export function injetarEndpointsPaginaInicialSeplag<Result>(endpoints): Result {
  if (!paginaInicialApiSlice) throw new Error("Chame configurarPaginaInicialSeplag(apiSlice) no módulo host.");
  return injectEndpoints.call(paginaInicialApiSlice, { endpoints, overrideExisting: false });
}
```

Os módulos `cronogramaApi.ts` e `informativosApi.ts` fazem cache do resultado em variáveis
de módulo (`let cronogramaApi`, `let informativosApi`), inicializadas na primeira chamada de
`getCronogramaApi()` / `getInformativosApi()`.

### Permissões — [`permissions.ts`](./permissions.ts)

```ts
export function usePaginaInicialPermissionsSeplag(permissions: PaginaInicialPermissionSet) {
  const auths = useSelector((state: HostState) =>
    state.userReducer?.user?.contaAcesso?.authorities ?? []);
  const admin = auths.some(({ nomeRole }) => nomeRole === "ROLE_ADMIN");
  // ...
  return { podeVisualizar, podeIncluir, podeEditar, podeDeletar };
}
```

**Conjuntos de papéis pré-definidos:**

| Constante | `nome` | Sufixos |
| --- | --- | --- |
| `DefaultPermissionsInformativoSeplag` | `ROLE_INFORMATIVO` | `_VISUALIZAR`, `_INCLUIR`, `_EDITAR`, `_DELETAR` |
| `DefaultPermissionsCicloCronogramaSeplag` | `ROLE_CICLO_PAGAMENTO` | idem |

### `Cronograma/`

Timeline do ciclo de pagamento, com modo de visualização e modo de configuração.

**Modelo:** `CronogramaData` → `SecaoCronograma[]` → `EventoCronograma[]`, todos com campo
`ordem`.

**Endpoints** ([`cronogramaApi.ts`](./Cronograma/cronogramaApi.ts)) — tag `"CicloPagamento"`:

| Hook | Método | URL |
| --- | --- | --- |
| `useListarCiclosPagamentoQuery` | GET | `/v1/ciclo-pagamento` |
| `useCriarCicloPagamentoMutation` | POST | `/v1/ciclo-pagamento` |
| `useAtualizarCicloPagamentoMutation` | PUT | `/v1/ciclo-pagamento/{id}` |
| `useDeletarCicloPagamentoMutation` | DELETE | `/v1/ciclo-pagamento/{id}` |

**Mapeadores** ([`cronogramaMappers.ts`](./Cronograma/cronogramaMappers.ts)):

- `mapCicloPagamentoToCronograma` — API → UI. Ordena por `ordem`; alterna o marcador de cor
  das seções (`index % 2 === 0 ? "azul" : "laranja"`); normaliza status
  (`CONCLUIDO`/`EM_ANDAMENTO`/`AGENDADO` → `concluido`/`emAndamento`/`agendado`, default `agendado`).
- `mapCronogramaToCicloPagamentoRequest` — UI → API. Aplica `getRequestId(id) = Math.max(id, 0)`,
  convertendo **ids temporários negativos em `0`** (sinal de "novo registro" para o backend).
- Datas: `formatDateFromApi` aceita ISO (`yyyy-MM-ddTHH:mm`) e `dd/MM/yyyy HH:mm`;
  `formatDateToApi` acrescenta `:00` de segundos.

**Ids temporários:** `createTemporaryId()` usa um contador de módulo decrescente
(`temporaryIdSequence -= 1`), gerando `-1`, `-2`, …

**Validação** (`getCronogramaValidationMessage`), em ordem:
1. Título do ciclo obrigatório
2. Toda seção precisa de título
3. Todo evento precisa de data início, data fim e descrição
4. Data fim ≥ data início

**Reordenação:** drag-and-drop nativo HTML5 (`DragEvent`), com `reorderById` +
`normalizeOrder` reatribuindo `ordem` sequencial após cada movimento.

**Status do evento:** `agendado` → badge `warning` · `emAndamento` → `info` ·
`concluido` → `success`.

### `Informativos/`

Mural de comunicados com CRUD em modal.

**Endpoints** ([`informativosApi.ts`](./Informativos/informativosApi.ts)) — tag `"Informativos"`:

| Hook | Método | URL |
| --- | --- | --- |
| `useListarInformativosPaginadoQuery` | GET | `/v1/informativos?page=0&sizePage=30&sort=DESC&sortProperties=dataPublicacao` |
| `useCriarInformativoMutation` | POST | `/v1/informativos` |
| `useAtualizarInformativoMutation` | PUT | `/v1/informativos/{id}` |
| `useDeletarInformativoMutation` | DELETE | `/v1/informativos/{id}` |

**Tipos de informativo:** `ALERTA` (`pi pi-exclamation-triangle`), `INFORMACAO`
(`pi pi-info-circle`), `AVISO` (`pi pi-thumbtack`), `IMPORTANTE` (`pi pi-star`).
Valor inválido cai em `INFORMACAO` (`getTipoInformativoVisual`).

## Dependências

### Externas
- `react-redux` — `useSelector` (leitura direta do store do **host**)
- RTK Query — via a apiSlice injetada
- `react`

### Internas
- [`../Badge`](../Badge/), [`../Botao`](../Botao/) (incluindo `BotaoEditarSeplag` e
  `BotaoRemoverSeplag`, **não exportados no barrel público**),
  [`../Fields`](../Fields/) (`DateTimeFieldSeplag`, `TextFieldSeplag`, `TextAreaFieldSeplag`),
  [`../Modal`](../Modal/), [`../ModalDelete`](../ModalDelete/),
  [`../../hooks/toast`](../../hooks/toast/)

### Contratos exigidos do consumidor

| Contrato | Detalhe |
| --- | --- |
| `configurarPaginaInicialSeplag(apiSlice)` | Chamado **antes** do primeiro render, senão exceção em runtime |
| Tags na apiSlice | `"CicloPagamento"` e `"Informativos"` devem constar em `tagTypes` |
| Endpoints no backend | `/v1/ciclo-pagamento` e `/v1/informativos` |
| Store Redux | `state.userReducer.user.contaAcesso.authorities: { nomeRole: string }[]` |
| Papéis | `ROLE_INFORMATIVO_*`, `ROLE_CICLO_PAGAMENTO_*`, `ROLE_ADMIN` |

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Cronograma/`](./Cronograma/README.md) · [`Informativos/`](./Informativos/README.md) | Os dois submódulos que compõem a página |
| [`../../lib/createBaseApiSliceSeplag`](../../lib/createBaseApiSliceSeplag.ts) | Cria a apiSlice que o consumidor registra via `configurarPaginaInicialSeplag` |
| [`../../app/`](../../app/) | O contrato de store (`userReducer`) é análogo ao do [`LoaderSeplag`](../Loader/) (`loaderReducer`) |
| [`../layout/Config/menu`](../layout/Config/menu.ts) | Modelo **alternativo** de permissão da biblioteca (por chave em `localStorage`), não usado aqui |
| [`../../interfaces/permissao`](../../interfaces/permissao/permissionResponse.ts) | `IPermissionResponseSeplag` tem a mesma forma do retorno de `usePaginaInicialPermissionsSeplag`, mas **não é referenciado** |
| [`../Modal`](../Modal/) · [`../ModalDelete`](../ModalDelete/) · [`../Fields`](../Fields/) · [`../Badge`](../Badge/) · [`../Botao`](../Botao/) | Componentes de UI usados internamente |

## Fluxos importantes

```
main.tsx do consumidor
   configurarPaginaInicialSeplag(apiSlice)      ← ANTES de qualquer render
        │
        ▼
   <PaginaInicialSeplag />
        ├── <Informativos />
        │      ├─ usePaginaInicialPermissionsSeplag(DefaultPermissionsInformativoSeplag)
        │      │     └─ state.userReducer.user.contaAcesso.authorities   ← store do HOST
        │      ├─ getInformativosApi() → injetarEndpointsPaginaInicialSeplag(...)
        │      │     └─ apiSlice.injectEndpoints({ overrideExisting: false })
        │      ├─ useListarInformativosPaginadoQuery()
        │      └─ CRUD em <ModalSeplag> + <ModalDeleteSeplag>
        │
        └── <Cronograma onConfigModeChange={...} />
               ├─ usePaginaInicialPermissionsSeplag(DefaultPermissionsCicloCronogramaSeplag)
               ├─ useListarCiclosPagamentoQuery() → mapCicloPagamentoToCronograma
               ├─ modo config: drag-and-drop, ids temporários negativos, validação
               └─ salvar → mapCronogramaToCicloPagamentoRequest → POST/PUT
```

## Arquivos críticos

| Arquivo | Por quê |
| --- | --- |
| [`paginaInicialApi.ts`](./paginaInicialApi.ts) | Registry mutável; sem `configurarPaginaInicialSeplag`, lança exceção |
| [`permissions.ts`](./permissions.ts) | Acopla a biblioteca à forma do store do consumidor |
| [`Cronograma/index.tsx`](./Cronograma/index.tsx) | 897 linhas — maior arquivo do repositório |
| [`Cronograma/cronogramaMappers.ts`](./Cronograma/cronogramaMappers.ts) | Conversão de datas e ids temporários — erros aqui corrompem dados |

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Alta** | **Viola a separação de camadas** | É o único `componentes/` com HTTP, papéis de negócio e leitura do store do host. Endpoints (`/v1/ciclo-pagamento`, `/v1/informativos`) e papéis (`ROLE_CICLO_PAGAMENTO_*`) estão **hardcoded** — a biblioteca só serve sistemas cujo backend expõe exatamente essas rotas. Ver R-02. |
| **Alta** | **Acoplamento à forma do store do consumidor** | `state.userReducer.user.contaAcesso.authorities` é lido com optional chaining e fallback `[]`. Se o host divergir, **todas as permissões retornam `false` silenciosamente** e a página fica somente-leitura sem nenhum erro. Ver R-01. |
| **Alta** | **Registry mutável com cache de módulo** | `let cronogramaApi` / `let informativosApi` são inicializados uma única vez. Consequências: (a) impossível trocar de apiSlice em runtime; (b) estado vaza entre testes no mesmo processo; (c) esquecer `configurarPaginaInicialSeplag` lança exceção **durante o render**, não na inicialização. |
| Média | **`Cronograma/index.tsx` com 897 linhas** | Concentra UI, drag-and-drop, validação, ids temporários e orquestração de 4 mutations. Difícil de testar e de evoluir. |
| Média | **Tipos da API frouxos** | `PaginaInicialEndpointBuilder` usa `query: (definition: unknown) => unknown`. `ApiSliceLike` exige apenas `{ injectEndpoints: unknown }`. Não há verificação de que a apiSlice recebida seja realmente do RTK Query, nem de que as tags existam. |
| Média | **Paginação fixa em Informativos** | `page: 0, sizePage: 30` embutidos na query — só os 30 informativos mais recentes são exibidos, sem paginação nem aviso. |
| Média | **Depende de símbolos não exportados** | Usa `BotaoEditarSeplag` e `BotaoRemoverSeplag`, ausentes do barrel público. Ver R-08. |
| Baixa | **Sem props de configuração** | `PaginaInicialSeplag` não aceita nenhuma prop: nem endpoints, nem papéis, nem textos. Tudo é convenção. |
| Baixa | **Contador global de id temporário** | `temporaryIdSequence` é variável de módulo — nunca reinicia, e é compartilhado entre instâncias. |
| Baixa | **`formatTimelineDate` com `slice` posicional** | Extrai `dd/MM` com `.slice(0, 5)` sobre a string, assumindo formato exato. |
| Baixa | **BOM nos arquivos** | `index.ts`, `Cronograma/index.tsx` e `Informativos/index.tsx` começam com `﻿`. |
| Baixa | Sem testes. |

## Diretriz de evolução

Prioridade 9 no plano de dívida (§10.3 do documento de Arquitetura):
**extrair `PaginaInicial` para um pacote próprio**, ou parametrizar endpoints, papéis e
seletor de permissão por props — devolvendo à biblioteca a característica de ser puramente
de apresentação.

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-01, R-02, §10.3
- [`lib/README.md`](../../lib/README.md) · [`app/README.md`](../../app/README.md)
