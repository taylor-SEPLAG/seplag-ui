# `PaginaInicial/Informativos/` — Mural de informativos

> Documentação completa do módulo: [`../README.md`](../README.md)

## Objetivo

Exibir comunicados institucionais na página inicial, com CRUD completo em modal para usuários
autorizados.

## Responsabilidade principal

Feature completa — UI, chamadas HTTP e permissão. Segunda metade da
[`PaginaInicialSeplag`](../PaginaInicial.tsx), ao lado do [`Cronograma`](../Cronograma/).

## Arquivos

| Arquivo | Papel |
| --- | --- |
| [`index.tsx`](./index.tsx) | Componente `Informativos` — listagem e CRUD (375 linhas) |
| [`informativosApi.ts`](./informativosApi.ts) | 4 endpoints RTK Query injetados na apiSlice do host |
| [`types.ts`](./types.ts) | `TipoInformativo`, `InformativoRequest`, `InformativoResponse` |
| [`style.module.css`](./style.module.css) | Estilos |

Não é exportado individualmente — só via `PaginaInicialSeplag`.

## Funcionalidades existentes

### Modelo de dados

```ts
type TipoInformativo = "ALERTA" | "INFORMACAO" | "AVISO" | "IMPORTANTE";

type InformativoRequest  = { titulo, tipo, texto };
type InformativoResponse = { id, titulo, tipo, texto, dataPublicacao };
```

### Tipos de informativo

| Valor | Rótulo | Ícone |
| --- | --- | --- |
| `ALERTA` | Alerta | `pi pi-exclamation-triangle` |
| `INFORMACAO` | Informação | `pi pi-info-circle` |
| `AVISO` | Aviso | `pi pi-thumbtack` |
| `IMPORTANTE` | Importante | `pi pi-star` |

`getTipoInformativoVisual(tipo)` valida contra a lista e cai em `INFORMACAO` quando o valor
não é reconhecido — proteção contra dados inesperados da API.

### Endpoints — [`informativosApi.ts`](./informativosApi.ts)

Tag de cache: `"Informativos"`.

| Hook exportado | Método | URL |
| --- | --- | --- |
| `useListarInformativosPaginadoQuery` | GET | `/v1/informativos?page=0&sizePage=30&sort=DESC&sortProperties=dataPublicacao` |
| `useCriarInformativoMutation` | POST | `/v1/informativos` |
| `useAtualizarInformativoMutation` | PUT | `/v1/informativos/{id}` |
| `useDeletarInformativoMutation` | DELETE | `/v1/informativos/{id}` |

Os parâmetros de paginação e ordenação são **fixos** na query. A resposta é
`PaginatedResult<InformativoResponse>` (`{ content: [] }`).

Os hooks vêm de `getInformativosApi()`, com cache em `let informativosApi` de módulo.

### CRUD em modal

Formulário local (`InformativoForm`): `{ titulo, texto, tipoInformativo }`, com
`emptyForm` iniciando em `INFORMACAO`.

| Estado | Título do modal | Rótulo do botão |
| --- | --- | --- |
| Criando | "Novo Informativo" | "Adicionar" |
| Editando | "Editar Informativo" | "Salvar" |
| Salvando | — | "Salvando..." |

Funções auxiliares: `getModalTitle(isEditing)` e `getSubmitLabel(isSaving, isEditing)`.

Exclusão via [`ModalDeleteSeplag`](../../ModalDelete/).

### Permissão

```ts
usePaginaInicialPermissionsSeplag(DefaultPermissionsInformativoSeplag)
// → ROLE_INFORMATIVO_VISUALIZAR | _INCLUIR | _EDITAR | _DELETAR  (ROLE_ADMIN libera tudo)
```

Lê `state.userReducer.user.contaAcesso.authorities` do store do **consumidor**.

## Dependências

### Externas
- `react` — `useMemo`, `useState`

### Internas
- [`../../Botao`](../../Botao/) — `BotaoAdicionarSeplag`, `BotaoSeplag` e, **fora do barrel
  público**, `BotaoEditarSeplag` e `BotaoRemoverSeplag`
- [`../../Fields`](../../Fields/) — `TextFieldSeplag`, `TextAreaFieldSeplag`
- [`../../Modal`](../../Modal/) — `ModalSeplag`
- [`../../ModalDelete`](../../ModalDelete/) — `ModalDeleteSeplag`
- [`../../../hooks/toast`](../../../hooks/toast/) — `useToastSeplag`
- [`../permissions`](../permissions.ts) · [`../paginaInicialApi`](../paginaInicialApi.ts)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`../PaginaInicial.tsx`](../PaginaInicial.tsx) | Monta o componente no modo "home" |
| [`../Cronograma`](../Cronograma/) | Módulo irmão da página inicial |
| [`../permissions.ts`](../permissions.ts) | `DefaultPermissionsInformativoSeplag` + hook de permissão |
| [`../paginaInicialApi.ts`](../paginaInicialApi.ts) | Registry que injeta os endpoints na apiSlice do host |
| [`../../Modal`](../../Modal/) · [`../../ModalDelete`](../../ModalDelete/) | CRUD e confirmação de exclusão |
| [`../../Fields`](../../Fields/) | `TextFieldSeplag`, `TextAreaFieldSeplag` no formulário |
| [`../../Mensagem`](../../Mensagem/) | Alternativa de aviso inline, para comparação de uso |
| [`../../../hooks/toast`](../../../hooks/toast/) | Feedback das mutations |

## Fluxos importantes

```
useListarInformativosPaginadoQuery()
      │  { content: InformativoResponse[] }   ← 30 mais recentes, DESC por dataPublicacao
      ▼
Lista de cartões (ícone por tipo + título + texto + data)
      │
      ├─ podeIncluir  → BotaoAdicionarSeplag → modal em modo criação
      ├─ podeEditar   → BotaoEditarSeplag    → modal em modo edição
      └─ podeDeletar  → BotaoRemoverSeplag   → ModalDeleteSeplag
                                │
                                ▼
                      mutation → unwrap() → toast
                      → invalida tag "Informativos" → refetch automático
```

## Arquivos críticos

| Arquivo | Por quê |
| --- | --- |
| [`index.tsx`](./index.tsx) | 375 linhas — listagem, CRUD em modal e checagem de permissão |
| [`informativosApi.ts`](./informativosApi.ts) | Endpoints hardcoded, paginação fixa e cache de módulo (`let informativosApi`) |

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Alta** | **Endpoints e papéis hardcoded** | `/v1/informativos` e `ROLE_INFORMATIVO_*` embutidos no código da biblioteca. Ver R-02. |
| **Alta** | **Acoplamento ao store do consumidor** | Permissões lidas de `state.userReducer.user.contaAcesso.authorities`. Store divergente → todas as permissões `false`, silenciosamente. Ver R-01. |
| Média | **Paginação fixa e sem controle** | `page: 0, sizePage: 30` embutidos. A partir do 31º informativo, os mais antigos ficam inacessíveis — sem paginador, sem "carregar mais", sem aviso. O nome do hook (`useListarInformativosPaginadoQuery`) sugere paginação que não existe na UI. |
| Média | **Cache de módulo na apiSlice** | `let informativosApi` inicializado uma vez; impede troca de apiSlice e vaza entre testes. |
| Média | **Depende de símbolos não exportados** | `BotaoEditarSeplag` e `BotaoRemoverSeplag` não constam do barrel público. Ver R-08. |
| Baixa | **Tipos de retorno frouxos** | `QueryHook`/`MutationHook` são tipos locais simplificados; não refletem a superfície real dos hooks do RTK Query (sem `isError`, `error`, `refetch`, `isSuccess`). |
| Baixa | **`TipoInformativoVisual = TipoInformativo`** | Alias sem diferença — indica uma separação planejada entre tipo de domínio e tipo de apresentação que não se concretizou. |
| Baixa | **Sem props de configuração** | Textos, tipos e limite de itens não são parametrizáveis. |
| Baixa | **BOM no arquivo** | `index.tsx` começa com `﻿`. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa da Página Inicial
- [Arquitetura da biblioteca](../../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-01, R-02, R-08
