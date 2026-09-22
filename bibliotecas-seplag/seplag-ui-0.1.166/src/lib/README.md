# `lib/` — Infraestrutura

## Objetivo

Fornecer a infraestrutura não-visual compartilhada entre os sistemas SEPLAG: cliente de
autenticação OAuth2 e *factory* de cliente HTTP baseado em RTK Query com tratamento
padronizado de erro.

## Responsabilidade principal

Ser a **única camada da biblioteca que fala com a rede** (fora do módulo de negócio
`componentes/PaginaInicial`). Não renderiza nada.

## Pontos de entrada

```ts
// src/index.ts
export * from "./lib/OAuth2Seplag";              // OAuth2LibSeplag, OAuth2LibConfigSeplag
export * from "./lib/createBaseApiSliceSeplag";  // createBaseApiSliceSeplag, CreateBaseApiSliceSeplagOptions
```

## Funcionalidades existentes

| Símbolo | Tipo | O que entrega |
| --- | --- | --- |
| `OAuth2LibSeplag` | classe | Authorization Code Flow com PKCE opcional, persistência do token, refresh automático e logout — §1 |
| `OAuth2LibConfigSeplag` | interface | Configuração do cliente OAuth2 |
| `createBaseApiSliceSeplag` | factory | `createApi` do RTK Query com Bearer token, tratamento padronizado de erro, toast automático e log de depuração — §2 |
| `CreateBaseApiSliceSeplagOptions` | interface | Opções da factory |

Detalhamento nas duas seções numeradas a seguir.

---

## 1. [`OAuth2Seplag/`](./OAuth2Seplag/) — Cliente OAuth2

### Funcionalidades

`OAuth2LibSeplag` é uma **classe** (não um hook nem um componente) que implementa
Authorization Code Flow, com PKCE opcional.

**Configuração** (`OAuth2LibConfigSeplag`):

| Campo | Obrigatório | Default |
| --- | --- | --- |
| `redirectUri` | ✔ | — |
| `urlAuth` | ✔ | — (base; a lib concatena `/oauth2/authorize`, `/oauth2/token`, `/logout`) |
| `clientId` | ✔ | — |
| `clientSecret` | — | usado apenas quando `withPKCE` é `false` |
| `userInfoEndpoint` | ✔ | — |
| `scope` | — | `"read profile openid write"` |
| `withPKCE` | — | `false` |
| `post_logout_redirect_uri` | — | — |

**Métodos públicos:**

| Método | Comportamento |
| --- | --- |
| `initSeplag()` | Se o token do `localStorage["tk"]` ainda é válido → `true`. Se a URL tem `?code` → troca por token. Se tem `?error` → só loga no console. Senão → `authorizeSeplag()` (redireciona). |
| `isTokenLocalStorageValidSeplag()` | Compara `new Date()` com `token.expiryDate` |
| `authorizeSeplag()` | Monta a URL de autorização; com PKCE gera `code_verifier` (32 bytes aleatórios) e `code_challenge` (SHA-256, base64url) e guarda o verifier no `localStorage` |
| `exchangeCodeForTokenSeplag(code)` | `POST /oauth2/token`. Com PKCE envia `client_id` + `code_verifier`; sem PKCE envia `Authorization: Basic btoa(clientId:clientSecret)`. Calcula `expiryDate` e grava em `localStorage["tk"]`. |
| `loadUserInfoSeplag()` | `GET userInfoEndpoint` com Bearer. Em **401**, remove `"tk"` e faz logout. |
| `updateTokenSeplag()` | `POST /oauth2/token` com `grant_type=refresh_token` |
| `startTokenAutoRefreshSeplag()` | `setInterval` de 10 s; dispara `onTokenExpiredSeplag` quando faltar ≤ 60 s para expirar |
| `setOnTokenExpiredSeplag(cb)` | Registra o callback acima |
| `logoutSeplag()` | Redireciona para `{urlAuth}/logout`, com `post_logout_redirect_uri` opcional |

### Estado persistido

| Chave (`localStorage`) | Conteúdo |
| --- | --- |
| `tk` | `{ access_token, refresh_token, expires_in, expiryDate }` serializado |
| `code_verifier` | Verifier PKCE, removido após a troca bem-sucedida |

### Fluxo

```
AuthThanosProviderSeplag (provider/)
   │ useEffect (uma vez)
   ├─ setOnTokenExpiredSeplag(() => updateTokenSeplag().catch(logoutSeplag))
   └─ initSeplag()
        ├─ token válido no localStorage ────────────► true
        ├─ URL contém ?code ──► exchangeCodeForTokenSeplag ──► true
        ├─ URL contém ?error ──► console.log ──► undefined
        └─ nenhum dos casos ──► authorizeSeplag() (sai da página)
             │
             ▼ (retorno true)
        loadUserInfoSeplag() ──► onAuthenticated(resp.contaAcesso)
        startTokenAutoRefreshSeplag()
```

---

## 2. [`createBaseApiSliceSeplag.ts`](./createBaseApiSliceSeplag.ts) — Factory de apiSlice

### Funcionalidades

Cria uma `createApi` do RTK Query já configurada com autenticação, tratamento de erro e log.

**Opções** (`CreateBaseApiSliceSeplagOptions`):

| Campo | Papel |
| --- | --- |
| `reducerPath` | Chave do slice no store do consumidor |
| `baseUrl` | Base das requisições |
| `getToken()` | Fornece o access token; envolvido em `try/catch` |
| `publicEndpoints` | Nomes de endpoint que **não** recebem `Authorization` |
| `tagTypes` | Tags de cache do RTK Query |
| `debug` | Log detalhado. Default: `localStorage["seplag:debugApi"] === "true"` |

**Pipeline de cada requisição (`baseQueryWithReauth`):**

1. Marca `performance.now()`.
2. Executa a `baseQuery` (`fetchBaseQuery` com `prepareHeaders` injetando o Bearer).
3. Se `debug`, chama `logApiCall` — grupo colapsado no console com endpoint, método, URL,
   query params, headers (**`Authorization` mascarado como `Bearer ***`**), payload, status,
   dados/erro, headers de resposta, duração e resultado bruto.
4. Se `extraOptions.naoExibirMensagemErro === true`, retorna sem toast.
5. Se houver `result.error`, extrai a mensagem e dispara `toastService.show({ severity: "error", life: 5000 })`.
6. Se a resposta for **HTTP 200 com corpo contendo `keyError` e `message`**, converte em
   erro `CUSTOM_ERROR`, dispara o toast e devolve `{ error }`.

**Precedência em `extractErrorMessage`:**

```
data.fieldsValidation[0].message
  → data.message
  → data.error
  → `Erro ${status}: Erro ao processar requisição`
  → "Erro desconhecido"
```

Quando `data` é string, tenta `JSON.parse` e usa `.message`; se falhar, devolve a string crua.

### Uso pelo consumidor

```ts
export const apiSlice = createBaseApiSliceSeplag({
  reducerPath: "api",
  baseUrl: import.meta.env.VITE_API_URL,
  getToken: () => JSON.parse(localStorage.getItem("tk") ?? "{}").access_token,
  publicEndpoints: ["consultarCep"],
  tagTypes: ["Servidor", "Orgao"] as const,
});

// Endpoints reais são injetados pelo consumidor:
export const servidorApi = apiSlice.injectEndpoints({ endpoints: (builder) => ({ ... }) });
```

`endpoints: () => ({})` — a factory devolve uma apiSlice **vazia**, projetada para
`injectEndpoints`.

## Dependências

### Externas
- `@reduxjs/toolkit/query/react` — `createApi`, `fetchBaseQuery` e tipos
- APIs do navegador: `fetch`, `localStorage`, `crypto.getRandomValues`,
  `crypto.subtle.digest`, `btoa`, `atob`, `URLSearchParams`, `performance`, `Headers`

### Internas
- `createBaseApiSliceSeplag` → `provider/printToast/toastService`
  **Esta é a única dependência de `lib/` para fora de si mesmo.** Usa o service locator
  justamente por não poder chamar hooks React.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| `provider/AuthThanosProvider` | Orquestra o ciclo de vida do `OAuth2LibSeplag` |
| `provider/printToast/toastService` | Recebe os toasts de erro da apiSlice |
| `componentes/Loader` | **Hipótese:** projetado para ser incrementado/decrementado por middleware ou por `onQueryStarted` do consumidor — não há integração automática no código |
| `componentes/PaginaInicial/paginaInicialApi` | Espera receber uma apiSlice compatível (`injectEndpoints`) |

## Fluxos importantes

**Autenticação** — diagrama completo na seção 1 acima.

**Requisição HTTP com tratamento de erro:**

```
componente → hook do RTK Query → baseQueryWithReauth
      │
      ├─ prepareHeaders → getToken() → Bearer (exceto publicEndpoints)
      ├─ fetchBaseQuery(args)
      ├─ debugEnabled? → logApiCall (Authorization mascarado)
      │
      ├─ extraOptions.naoExibirMensagemErro? → retorna sem toast
      │
      ├─ result.error
      │     └─ extractErrorMessage → toastService.show({ severity: "error", life: 5000 })
      │
      ├─ HTTP 200 com { keyError, message }
      │     └─ converte em CUSTOM_ERROR + toast
      │
      └─ sucesso → data
```

**Ponte não-React → UI:** `lib/` não pode chamar hooks, então usa
[`toastService`](../provider/printToast/toastService.ts) (registrado pelo
`ToastProviderSeplag`) para notificar o usuário.

## Arquivos críticos

- [`OAuth2Seplag/OAuth2Lib.ts`](./OAuth2Seplag/OAuth2Lib.ts) — porta de entrada de todos os sistemas.
- [`createBaseApiSliceSeplag.ts`](./createBaseApiSliceSeplag.ts) — define o contrato de erro
  entre backend e frontend de toda a plataforma.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Alta | **`updateTokenSeplag` não atualiza `expiryDate` nem o `localStorage`** | Linha 209: `this.token = await response.json()`. O objeto novo não tem `expiryDate` calculado, então `this.token.expiryDate?.getTime() ?? 0` no `startTokenAutoRefreshSeplag` passa a valer `0` e o callback dispara **a cada 10 s** após o primeiro refresh. O `localStorage["tk"]` também fica desatualizado. |
| Alta | **`setInterval` nunca limpo** | `startTokenAutoRefreshSeplag` guarda o handle em `this.refreshInterval` e limpa apenas em chamadas subsequentes. O `AuthThanosProviderSeplag` não faz `clearInterval` no cleanup do `useEffect`. |
| Média | **`state` fixo** | `authorizationUrl.searchParams.append("state", "xyz")` (linha 105) — valor constante não oferece proteção CSRF. |
| Média | **`clientSecret` no bundle** | Sem PKCE, `btoa(clientId:clientSecret)` significa que o secret está no JavaScript entregue ao navegador. |
| Média | **Token em `localStorage`** | Chave `"tk"`, legível por qualquer script na mesma origem. |
| Baixa | **`JSON.parse` sem validação** | `isTokenLocalStorageValidSeplag` faz `JSON.parse(tokenStorage)` sem `try/catch`: um valor corrompido lança exceção não tratada. |
| Baixa | **Erros só logados** | O ramo `?error` de `initSeplag` apenas faz `console.log` — não há callback para a aplicação reagir. |
| Baixa | **`index.d.ts` órfão** | `OAuth2Seplag/index.d.ts` existe ao lado de `index.ts` e não é referenciado. |
| Baixa | **Log em produção** | `logApiCall` imprime payload e headers de resposta. Está atrás do flag `debug`, mas o flag pode ser ligado por qualquer usuário via `localStorage`. |
| Baixa | **Sem testes** | Nenhum arquivo de `lib/` tem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md) — §7.4, §7.6, R-11
- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md) — P-03
