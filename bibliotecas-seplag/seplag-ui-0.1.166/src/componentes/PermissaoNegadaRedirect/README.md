# `PermissaoNegadaRedirect/` — PermissaoNegadaRedirectSeplag

## Objetivo

Redirecionar o usuário para uma rota segura quando ele acessa uma tela sem permissão,
exibindo um toast de aviso **uma única vez**.

## Responsabilidade principal

Cobrir a lacuna deixada pelo filtro de menu: `hasPermissionByRouteListSeplag` esconde itens
do menu, mas **não bloqueia acesso direto por URL**. Este componente fecha esse caminho.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 27 linhas.

```ts
export { PermissaoNegadaRedirectSeplag } from "./PermissaoNegadaRedirect";
export type { PermissaoNegadaRedirectSeplagProps } from "./PermissaoNegadaRedirect";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `redirectTo` | — | Rota de destino (obrigatória) |
| `mensagem` | `"Você não tem permissão para acessar esta página."` | Texto do toast |

### Implementação

```tsx
const { toastAtencao } = useToastSeplag();
const avisadoRef = useRef(false);

useEffect(() => {
  if (avisadoRef.current) return;
  avisadoRef.current = true;
  toastAtencao(mensagem);
}, [mensagem]);

return <Navigate to={redirectTo} replace />;
```

Dois detalhes importantes:

1. **`avisadoRef`** — guarda contra toast duplicado. Em `React.StrictMode` (modo de
   desenvolvimento), efeitos são executados duas vezes; a ref garante um único aviso.
2. **`replace`** — substitui a entrada no histórico, para que o botão "Voltar" do navegador
   não traga o usuário de volta à rota proibida em um laço.

## Dependências

### Externas
- `react-router-dom` — `Navigate` (**exige Router no host**)
- `react` — `useEffect`, `useRef`

### Internas
- [`../../hooks/toast/useToast`](../../hooks/toast/useToast.ts) — `toastAtencao`

> **Requer `ToastProviderSeplag` acima na árvore.** Sem ele, `useToastSeplag` falha
> silenciosamente e o redirecionamento acontece sem aviso.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`layout/Config/menu`](../layout/Config/menu.ts) | `hasPermissionByKeysSeplag` e `hasPermissionByRouteListSeplag` — a checagem que decide se este componente é renderizado |
| [`provider/printToast`](../../provider/printToast/) | Fornece o `<Toast>` |
| [`NotFound`](../NotFound/) | Caso **404** (rota inexistente), complementar a este caso **403** |

## Fluxos importantes

**Guarda de rota:**

```tsx
function RotaProtegida({ permissionKeys, children }: Props) {
  const permissoes = getPermissionsSeplag();

  if (!hasPermissionByKeysSeplag(permissionKeys, permissoes)) {
    return <PermissaoNegadaRedirectSeplag redirectTo="/inicio" />;
  }

  return children;
}

<Route
  path="/servidores/novo"
  element={
    <RotaProtegida permissionKeys={["ROLE_SERVIDOR_INCLUIR"]}>
      <ServidorForm />
    </RotaProtegida>
  }
/>
```

**Sequência completa de controle de acesso na plataforma:**

```
1. Menu     → hasPermissionByRouteListSeplag(deepCloneMenuSeplag(menu))
              esconde itens sem permissão

2. Rota     → guarda do consumidor + PermissaoNegadaRedirectSeplag
              bloqueia acesso direto por URL

3. Ação     → BotaoSeplag hasPermission={...} / GroupActionsSeplag permissions={...}
              esconde botões de ação

4. Backend  → validação definitiva (fora do escopo da biblioteca)
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — 27 linhas; guarda de acesso do lado do cliente.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Falha silenciosa sem `ToastProviderSeplag`** | `useToastSeplag` não lança erro fora do provider (`toastRef?.current?.show`). O usuário é redirecionado **sem entender o motivo**. Contraste com `useUnsavedChangesSeplag`, que lança erro explícito quando fora do seu provider. |
| Baixa | **`toastAtencao` fora das dependências do efeito** | `useEffect(..., [mensagem])` não inclui `toastAtencao`. Como `useToastSeplag` recria a função a cada render, incluí-la causaria loop — a `avisadoRef` já resolve o problema, mas a omissão não está documentada com `eslint-disable` nem comentário. |
| Baixa | **Segurança apenas visual** | Como toda guarda de rota no cliente, é contornável. A autorização real precisa estar no backend. |
| Baixa | **Sem callback de auditoria** | Não há prop para registrar a tentativa de acesso negado (log/telemetria). |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §7.3
- [Objetivo da biblioteca](../../../docs/objetivo-da-biblioteca-de-componentes.md) — P-06
- [`layout/README.md`](../layout/README.md) · [`hooks/README.md`](../../hooks/README.md)
