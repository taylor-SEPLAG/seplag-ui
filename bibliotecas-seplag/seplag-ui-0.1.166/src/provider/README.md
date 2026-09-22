# `provider/` — Providers de contexto

## Objetivo

Fornecer os contextos React e a configuração global que as aplicações consumidoras devem
montar na raiz da árvore: configuração do PrimeReact, sistema de notificações (toast) e
guarda de autenticação.

## Responsabilidade principal

Definir o **ambiente de execução compartilhado**. Nenhum provider aqui contém regra de negócio.

## Pontos de entrada

```ts
// src/index.ts
export * from "./provider/AppPrimeReactProvider/AppPrimeReactProvider";
export * from "./provider/AuthThanosProvider/AuthThanosProvider";
export * from "./provider/printToast";   // ToastProviderSeplag, ContextToastSeplag, toastService
```

## Ordem de montagem recomendada

Derivada das dependências entre os módulos:

```tsx
<Provider store={store}>                    {/* react-redux — do consumidor */}
  <AppPrimeReactProviderSeplag>             {/* zIndex, ripple, filterMatchMode */}
    <ToastProviderSeplag>                   {/* registra o toastService */}
      <AuthThanosProviderSeplag ...>        {/* usa loaderSeplag enquanto autentica */}
        <BrowserRouter>                     {/* react-router-dom — do consumidor */}
          <UnsavedChangesProviderSeplag>    {/* componentes/UnsavedChangesWarning */}
            <LayoutSeplag ...>
```

`ToastProviderSeplag` precisa estar **acima** de qualquer componente que use
`useToastSeplag`, e idealmente antes da primeira chamada de API, já que
`createBaseApiSliceSeplag` dispara toasts de erro pelo `toastService`.

## Funcionalidades existentes

| Símbolo | Tipo | O que entrega |
| --- | --- | --- |
| `AppPrimeReactProviderSeplag` | provider | Configuração institucional do PrimeReact (zIndex, ripple, filterMatchMode) — §1 |
| `primeReactConfigSeplag` | constante | A configuração default, exportada para composição |
| `ToastProviderSeplag` | provider | Monta o `<Toast>` único e registra o `toastService` — §2 |
| `ContextToastSeplag` | contexto | Carrega `{ toastRef }`; lido por `useToastSeplag` |
| `toastService` | service locator | Permite que código **não-React** dispare toasts |
| `AuthThanosProviderSeplag` | provider | Orquestra o ciclo de vida do `OAuth2LibSeplag` e bloqueia a renderização até autenticar — §3 |

Detalhamento nas três seções numeradas a seguir.

---

## 1. [`AppPrimeReactProvider/`](./AppPrimeReactProvider/)

### Funcionalidades

Encapsula o `PrimeReactProvider` com a configuração institucional (`primeReactConfigSeplag`),
também exportada isoladamente para composição.

| Configuração | Valor |
| --- | --- |
| `filterMatchModeOptions.text` | `STARTS_WITH`, `CONTAINS`, `NOT_CONTAINS`, `ENDS_WITH`, `EQUALS`, `NOT_EQUALS` |
| `filterMatchModeOptions.numeric` | `EQUALS`, `NOT_EQUALS`, `LESS_THAN`, `LESS_THAN_OR_EQUAL_TO`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL_TO` |
| `filterMatchModeOptions.date` | `DATE_IS`, `DATE_IS_NOT`, `DATE_BEFORE`, `DATE_AFTER` |
| `cssTransition` | `true` |
| `nullSortOrder` | `1` |
| `ripple` | `true` |
| `autoZIndex` | `true` |
| `zIndex` | `modal: 1100`, `overlay: 1000`, `menu: 1000`, `tooltip: 1100`, `toast: 1200` |

A prop `value` faz *shallow merge* sobre o default: `{ ...primeReactConfigSeplag, ...value }`.

> A escala de `zIndex` importa: `toast (1200)` fica acima de `modal (1100)`, garantindo que
> notificações apareçam sobre diálogos. Os *flyouts* da sidebar recolhida usam `z-index: 1100`
> aplicado inline em `AppSubmenuItem`/`AppProfile`.

---

## 2. [`printToast/`](./printToast/) — Sistema de notificações

Três arquivos com papéis distintos:

| Arquivo | Papel |
| --- | --- |
| [`PrintToast.tsx`](./printToast/PrintToast.tsx) | `ToastProviderSeplag` — monta o `<Toast>` do PrimeReact e provê o contexto |
| [`ToastContext.ts`](./printToast/ToastContext.ts) | `ContextToastSeplag` — carrega `{ toastRef }` |
| [`toastService.ts`](./printToast/toastService.ts) | Service locator para código **fora** do React |

### Padrão arquitetural

```
<ToastProviderSeplag>
   ├── useRef<Toast>            → toast
   ├── useCallback show(msg)    → toast.current?.show(msg)
   ├── useEffect: toastService.register(show)
   │              cleanup: toastService.unregister()
   ├── <ContextToastSeplag.Provider value={{ toastRef: toast }}>
   └── <Toast ref={toast} />
```

Dois caminhos de consumo:

| Origem | Caminho |
| --- | --- |
| Componente React | `useToastSeplag()` → `ContextToastSeplag` → `toastRef.current.show()` |
| Código não-React (apiSlice) | `toastService.show()` → função registrada → mesmo `<Toast>` |

O `toastService` existe porque `createBaseApiSliceSeplag` (`lib/`) precisa notificar erros
de rede e **não pode chamar hooks**.

---

## 3. [`AuthThanosProvider/`](./AuthThanosProvider/)

### Funcionalidades

Guarda de autenticação. Orquestra o ciclo de vida do `OAuth2LibSeplag` e bloqueia a
renderização dos filhos até que o consumidor sinalize `isAuthenticated`.

**Props** (`AuthThanosProviderSeplagProps`):

| Prop | Tipo | Papel |
| --- | --- | --- |
| `authThanos` | `OAuth2LibSeplag` | Instância criada pelo consumidor |
| `isAuthenticated` | `boolean` | **Controlado pelo consumidor** — o provider não gerencia esse estado |
| `onAuthenticated` | `(userInfo: any) => void` | Recebe `resp.contaAcesso` do endpoint de userinfo |
| `children` | `ReactNode` | — |

**Efeito de montagem** (executa uma única vez, `[]`):

1. `setOnTokenExpiredSeplag(() => updateTokenSeplag().catch(() => logoutSeplag()))`
2. `initSeplag()` — pode redirecionar para o servidor de autorização
3. Se autenticou: `loadUserInfoSeplag()` → `onAuthenticated(resp.contaAcesso)` →
   `startTokenAutoRefreshSeplag()`
4. Erros são capturados e apenas logados (`console.error("Keycloak initialization error", ...)`)

**Renderização:** `<div>{isAuthenticated ? children : loaderSeplag()}</div>`.

> `loaderSeplag()` vem de `componentes/Loader/loaderContent` — este é o único ponto em que
> `provider/` importa de `componentes/`.

## Dependências

### Externas
- `primereact/api` — `PrimeReactProvider`, `FilterMatchMode`, `APIOptions`, `updateLocaleOptions`
- `primereact/toast` — `Toast`, `ToastMessage`
- `react`

### Internas
- `AuthThanosProvider` → `lib/OAuth2Seplag` (tipo) e `componentes/Loader/loaderContent`
- `printToast/PrintToast` → `printToast/ToastContext` e `printToast/toastService`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| `hooks/toast/useToast` | Consumidor primário de `ContextToastSeplag` |
| `lib/createBaseApiSliceSeplag` | Consumidor de `toastService` |
| `componentes/Fields/utils/inactiveOption` | Dispara toast ao selecionar opção inativa |
| `componentes/PermissaoNegadaRedirect` | Toast de atenção antes de redirecionar |
| `componentes/ReactCrop` | Toast de erro em arquivo acima de 2 MB |
| `componentes/Loader` | Renderizado pelo `AuthThanosProviderSeplag` durante a autenticação |

## Fluxos importantes

**Notificação — três origens, um único `<Toast>`:**

```
 (a) Componente React        useToastSeplag() ──► ContextToastSeplag.toastRef.current.show()
 (b) Camada de API           toastService.show() ◄── createBaseApiSliceSeplag (erro HTTP)
 (c) Regra de campo inativo  toastService via useToastSeplag ◄── Fields/utils/inactiveOption
                                        │
                                        ▼
                       <ToastProviderSeplag> → <Toast/> (instância única)
                              register(show) no mount · unregister() no unmount
```

**Autenticação — bloqueio da árvore até o usuário estar autenticado:**

```
<AuthThanosProviderSeplag authThanos isAuthenticated onAuthenticated>
   │ useEffect (uma vez)
   ├─ setOnTokenExpiredSeplag(() => updateTokenSeplag().catch(logoutSeplag))
   ├─ initSeplag()
   │     ├─ token válido no localStorage         → true
   │     ├─ URL com ?code → exchangeCodeForToken → true
   │     ├─ URL com ?error → console.log
   │     └─ nenhum caso → authorizeSeplag() (sai da página)
   ├─ loadUserInfoSeplag() → onAuthenticated(resp.contaAcesso)
   └─ startTokenAutoRefreshSeplag()
   │
   └─ render: isAuthenticated ? children : loaderSeplag()
```

**Empilhamento visual** (definido em `primeReactConfigSeplag`):
`toast (1200)` > `modal/tooltip (1100)` > `overlay/menu (1000)`. Os flyouts da sidebar
recolhida usam `z-index: 1100` aplicado inline.

## Arquivos críticos

- [`printToast/toastService.ts`](./printToast/toastService.ts) — 17 linhas que sustentam toda
  a comunicação entre a camada de infraestrutura e a UI.
- [`AppPrimeReactProvider/AppPrimeReactProvider.tsx`](./AppPrimeReactProvider/AppPrimeReactProvider.tsx) —
  a escala de `zIndex` definida aqui determina o empilhamento de modais, painéis e toasts
  em toda a plataforma.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Alta | **`setInterval` não limpo** | `startTokenAutoRefreshSeplag()` é chamado no `useEffect` do `AuthThanosProviderSeplag`, mas não há `clearInterval` no cleanup. Combinado com o bug de `expiryDate` em `updateTokenSeplag` (ver [`lib/README.md`](../lib/README.md)), pode gerar refresh a cada 10 s. |
| Média | **`onAuthenticated(userInfo: any)`** | Sem tipagem. O provider também assume que a resposta do userinfo tem a propriedade `contaAcesso`, contrato não documentado no tipo. |
| Média | **`isAuthenticated` é externo** | O provider executa o fluxo de autenticação mas não sabe se ele terminou — quem decide é o consumidor. Se o `onAuthenticated` não atualizar o estado do host, a tela fica presa no loader indefinidamente. |
| Baixa | **Erro apenas logado** | Falha de `initSeplag`/`loadUserInfoSeplag` só produz `console.error`; não há callback `onError`. |
| Baixa | **`<div>` extra** | O provider envolve os filhos em um `<div>` sem classe, que pode interferir em layouts com `flex`/`grid` no elemento pai. |
| Baixa | **`useToastSeplag` não valida o contexto** | Fora do `ToastProviderSeplag` falha silenciosamente em vez de lançar erro. |
| Baixa | **`toastService` é singleton de módulo** | Duas instâncias de `ToastProviderSeplag` na mesma página fazem a segunda sobrescrever o registro da primeira. |
| Baixa | **Sem testes** | Nenhum arquivo de `provider/` tem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.7, §7.3, §7.4
- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md) — §4.5
