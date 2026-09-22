# `UnsavedChangesWarning/` — Guarda de alterações não salvas

## Objetivo

Impedir que o usuário perca dados ao sair de um formulário com alterações pendentes,
interceptando navegações do react-router, do histórico do navegador e o fechamento da aba.

## Responsabilidade principal

Concentrar a interceptação de navegação em um único provider, expondo às telas apenas dois
hooks simples.

## Estrutura

```
UnsavedChangesWarning/
├── index.ts                     ← barrel
├── types.ts                     ← UnsavedChangesContextValueSeplag
├── context.ts                   ← UnsavedChangesContextSeplag
├── hooks.ts                     ← useUnsavedChangesSeplag, useUnsavedChangesSyncSeplag
└── UnsavedChangesProvider.tsx   ← UnsavedChangesProviderSeplag (192 linhas)
```

## Ponto de entrada

```ts
// componentes/index.ts
export {
  UnsavedChangesProviderSeplag,
  useUnsavedChangesSeplag,
  useUnsavedChangesSyncSeplag,
} from "./UnsavedChangesWarning";
export type { UnsavedChangesContextValueSeplag } from "./UnsavedChangesWarning";
```

## Funcionalidades existentes

### Contrato do contexto

```ts
interface UnsavedChangesContextValueSeplag {
  setDirty: (dirty: boolean) => void;
  guard: (action: () => void) => void;
}
```

### Hooks

| Hook | Uso |
| --- | --- |
| `useUnsavedChangesSeplag()` | Acessa `{ setDirty, guard }`. **Lança erro** se usado fora do provider |
| `useUnsavedChangesSyncSeplag(isDirty)` | Sincroniza o estado sujo; no cleanup chama `setDirty(false)` |

`useUnsavedChangesSyncSeplag` é o uso típico:

```tsx
const { formState } = useForm();
useUnsavedChangesSyncSeplag(formState.isDirty);
```

### Três mecanismos de interceptação

**1. Fechamento da aba/navegador**

```tsx
const handler = (e: BeforeUnloadEvent) => { if (!isDirtyRef.current) return; e.preventDefault(); };
globalThis.addEventListener("beforeunload", handler);
```

O navegador exibe seu próprio diálogo nativo (a mensagem customizada é ignorada pelos
navegadores modernos).

**2. Navegação do react-router — monkey-patch da History API**

```tsx
globalThis.history.pushState    = makeInterceptor(origPushStateRef.current);
globalThis.history.replaceState = makeInterceptor(origReplaceStateRef.current);
```

O interceptor:
- Deixa passar quando `isAllowedRef.current` ou `!isDirtyRef.current`
- Deixa passar quando o caminho de destino é o mesmo (evita bloquear mudanças de query string)
- Caso contrário: guarda `{ state, title, url }` em `pendingNavRef` e abre o modal

Os métodos originais são restaurados no cleanup do `useEffect`.

**3. Botão Voltar do navegador — `popstate`**

```tsx
const onPopState = () => {
  if (isAllowedRef.current || !isDirtyRef.current) return;
  origPushStateRef.current(globalThis.history.state, "", globalThis.location.href);  // desfaz
  setVisible(true);
};
```

Reempurra a URL atual para cancelar o retorno, depois abre o modal.

### `guard(action)` — ações arbitrárias

```tsx
const guard = (action: () => void) => {
  if (!isDirtyRef.current) { action(); return; }
  pendingActionRef.current = action;
  setVisible(true);
};
```

Protege qualquer operação, não apenas navegação: troca de aba, fechamento de modal,
recarregamento de dados.

### Confirmação — "Sim" (`leave`)

Três caminhos, conforme a origem do bloqueio:

```
pendingActionRef  → executa a action
pendingNavRef     → isAllowed=true → pushState original → dispatchEvent(PopStateEvent)
                    (força o react-router a reagir) → setTimeout(isAllowed=false, 0)
nenhum (popstate) → isAllowed=true → history.go(-1) → setTimeout(isAllowed=false, 0)
```

### Modal

[`ModalSeplag`](../Modal/) com `customFooter`, título "Alterações não salvas", mensagem
default *"Você possui alterações não salvas. Se sair agora, os dados serão perdidos."* +
*"Deseja continuar?"*. Botões "Sim" (outlined, `SEPLAG_PRIMARY`) e "Cancelar" (`autoFocus`).

`data-testid`: `unsaved-changes-modal` · `-sim` · `-cancelar` · `-content`.

### Uso de `useRef` para o estado sujo

`isDirtyRef` é uma `ref`, não estado — alterar o estado sujo **não causa re-render** do
provider nem de seus filhos, o que é essencial já que `useUnsavedChangesSyncSeplag` é
chamado a cada mudança de `formState.isDirty`.

## Dependências

### Externas
- `react` — `useCallback`, `useEffect`, `useMemo`, `useRef`, `useState`, `createContext`, `useContext`
- APIs do navegador: `history.pushState`, `history.replaceState`, `history.go`,
  `PopStateEvent`, `beforeunload`

### Internas
- [`@componentes/Botao`](../Botao/) — `BotaoSeplag`
- [`@componentes/Modal`](../Modal/) — `ModalSeplag`
- [`../../tokens`](../../tokens/) — `SEPLAG_PRIMARY`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Modal`](../Modal/) | Modal de confirmação |
| [`FormActions`](../FormActions/) | `onGoBack` costuma ser envolvido em `guard()` |
| [`Card`](../Card/) | `handleVoltar` costuma ser envolvido em `guard()` |
| [`Tabs`](../Tabs/) | `onChange` costuma ser envolvido em `guard()` |
| `react-router-dom` | Interceptado indiretamente, via History API |

## Fluxos importantes

```
main.tsx
  <BrowserRouter>
    <UnsavedChangesProviderSeplag>          ← monkey-patch aplicado aqui
      <LayoutSeplag>
        <Outlet/>
            │
            └─ Tela de formulário
                 const { formState } = useForm();
                 useUnsavedChangesSyncSeplag(formState.isDirty);   ← setDirty(true/false)
                 const { guard } = useUnsavedChangesSeplag();
                      │
                      ├─ <CardSeplag handleVoltar={() => guard(() => navigate(-1))}>
                      ├─ <TabsSeplag onChange={(v) => guard(() => setAba(v))}>
                      └─ <FormActionsSeplag onGoBack={() => guard(voltar)}>
```

Ao desmontar a tela, `useUnsavedChangesSyncSeplag` chama `setDirty(false)` no cleanup,
liberando a navegação automaticamente.

## Arquivos críticos

- [`UnsavedChangesProvider.tsx`](./UnsavedChangesProvider.tsx) — 192 linhas que **substituem
  métodos globais do navegador**. É o código de maior risco sistêmico da biblioteca.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Alta** | **Monkey-patch de `history.pushState`/`replaceState`** | Substituição de APIs globais do navegador. Se outra biblioteca (analytics, feature flags, outro roteador) também aplicar patch, o comportamento depende da ordem de montagem. Duas instâncias do provider fazem a segunda capturar a versão já modificada pela primeira, e o cleanup restaura na ordem errada. |
| Média | **Depende de `PopStateEvent` sintético** | O caminho "Sim" com navegação pendente chama `origPushState` e dispara um `PopStateEvent` manual para que o react-router reaja. Isso depende de detalhe de implementação do roteador; uma mudança no react-router pode quebrar a navegação sem erro visível. |
| Média | **`setTimeout(..., 0)` para resetar `isAllowedRef`** | Janela de corrida: se outra navegação ocorrer no mesmo tick, ela passa sem bloqueio. |
| Média | **Detecção de navegação por `pathname`** | `targetPath === globalThis.location.pathname` deixa passar mudanças de query string e hash sem confirmação. Intencional para filtros na URL, mas pode surpreender. |
| Baixa | **`message` não é configurável no provider** | `useUnsavedChangesGuardSeplag(isDirtyRef, message = DEFAULT_MESSAGE)` aceita o parâmetro, mas `UnsavedChangesProviderSeplag` **não expõe uma prop** para isso — a mensagem é sempre a default. |
| Baixa | **`message` nas dependências sem uso** | `useEffect(..., [isDirtyRef, message])` do `beforeunload` lista `message`, que não é usada no efeito (navegadores modernos ignoram mensagens customizadas). |
| Baixa | **Não intercepta `<a href>` nativo** | Links comuns fora do react-router escapam da guarda (embora o `beforeunload` cubra a saída do site). |
| Baixa | **Classes CSS globais no rodapé** | `customFooter` usa `"modalSeplag-botoes-footer modalSeplag-botoes-footer-right"` como strings literais, mas essas classes vêm de [`Modal/style.module.css`](../Modal/style.module.css), onde são **escopadas** — provavelmente sem efeito. |
| Baixa | Sem testes. |
| Positivo | **`useRef` para o estado sujo** | Evita re-renders em cascata a cada tecla digitada no formulário. |
| Positivo | **Erro explícito fora do provider** | `useUnsavedChangesSeplag` lança `"useUnsavedChanges deve ser usado dentro de um <UnsavedChangesProvider>."` — contraste com `useToastSeplag`, que falha em silêncio. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §7.5
- [Objetivo da biblioteca](../../../docs/objetivo-da-biblioteca-de-componentes.md) — P-07
- [`Modal/README.md`](../Modal/README.md) · [`FormActions/README.md`](../FormActions/README.md)
