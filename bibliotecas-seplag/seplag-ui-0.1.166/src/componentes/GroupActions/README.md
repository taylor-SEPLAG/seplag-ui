# `GroupActions/` — GroupActionsSeplag

## Objetivo

Grupo de botões de ação (Editar, Duplicar, Excluir) filtrado por permissão, com confirmação
de exclusão embutida.

## Responsabilidade principal

Exibir apenas as ações que o usuário tem permissão para executar, evitando que cada tela
repita a checagem `podeEditar && <Botao .../>`.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 104 linhas. Export apenas nomeado.

```ts
export { GroupActionsSeplag } from "./GroupActions";
export type { GroupActionsSeplagProps } from "./GroupActions";
```

## Funcionalidades existentes

### Props

| Prop | Papel |
| --- | --- |
| `permissions` | `Partial<IPermissionResponseSeplag>` — `{ podeVisualizar?, podeIncluir?, podeEditar?, podeDeletar? }` |
| `onEdit` | Callback de edição |
| `onDuplicate` | Callback de duplicação |
| `onDelete` | Callback de exclusão (após confirmação) |
| `deleteMessage` | Mensagem do modal de confirmação |
| `rowId` | Base dos `data-testid` |

### Mapeamento permissão × ação

| Ação | Condição de exibição | Severidade | Ícone |
| --- | --- | --- | --- |
| Editar | `podeEditar && onEdit` | `warning` | `pi pi-pencil` |
| Duplicar | **`podeIncluir`** `&& onDuplicate` | `secondary` | `pi pi-copy` |
| Excluir | `podeDeletar && onDelete` | `danger` | `pi pi-trash` |

> Duplicar usa `podeIncluir` (não `podeEditar`), porque a operação **cria** um novo registro.

Defaults: `podeEditar = false`, `podeIncluir = false`, `podeDeletar = false` — sem permissão
explícita, nenhuma ação aparece.

Se nenhuma ação for exibida (`hasActions === false`), o componente retorna `null`.

### Confirmação de exclusão

Estado local (`useState`) + [`ModalDeleteSeplag`](../ModalDelete/) montado internamente:

```
clique em Excluir → setVisible(true)
   → ModalDeleteSeplag visible message={deleteMessage}
   → "Sim"  → handleConfirm → onDelete() + setVisible(false)
   → "Não"  → handleCancel  → setVisible(false)
```

O modal só é montado quando `podeDeletar && onDelete`.

### Memoização

`actions` (`useMemo`), `handleCancel` e `handleConfirm` (`useCallback`).

### Identificadores

`groupTestId` = `rowId == null ? "group-actions" : \`group-actions-${rowId}\``.
Derivados: `{groupTestId}-edit` · `-duplicate` · `-delete` · `-delete-modal`.

## Dependências

### Externas
- `react` — `useState`, `useMemo`, `useCallback`

### Internas
- [`../Botao`](../Botao/) — `BotaoIconSeplag`
- [`../ModalDelete`](../ModalDelete/) — `ModalDeleteSeplag`
- [`../../interfaces/permissao/permissionResponse`](../../interfaces/permissao/permissionResponse.ts) — `IPermissionResponseSeplag`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`TablePaginado/TableRowActionsSeplag`](../TablePaginado/TableRowActionsSeplag.tsx) | **Alternativa dentro da tabela** — mais ações (Visualizar, Gerar Ofício), converte em `SplitButton` a partir de 3, mas **não** filtra por permissão |
| [`interfaces/`](../../interfaces/) | Contrato `IPermissionResponseSeplag` |
| [`layout/Config/menu`](../layout/Config/menu.ts) | `hasPermissionByKeysSeplag` — checagem por chave de papel, complementar a este modelo CRUD |
| [`Botao`](../Botao/) | `BotaoSeplag` também aceita `hasPermission` para casos de ação única |

**Quando usar cada um:**

```
Ações de linha em TablePaginadoSeplag        → hasEventoAcao + handleEdit/handleDelete/...
Ações fora da tabela (card, painel, item)    → GroupActionsSeplag
Ação isolada                                 → BotaoSeplag hasPermission={...}
```

## Fluxos importantes

```tsx
const permissoes = usePermissoesServidor();   // { podeVisualizar, podeIncluir, podeEditar, podeDeletar }

{secoes.map((secao) => (
  <AccordionCardSeplag
    key={secao.id}
    id={secao.id}
    title={secao.titulo}
    isOpen={aberto === secao.id}
    onToggle={() => alternar(secao.id)}
    showIcon
    headerRight={
      <GroupActionsSeplag
        rowId={secao.id}
        permissions={permissoes}
        onEdit={() => editar(secao)}
        onDuplicate={() => duplicar(secao)}
        onDelete={() => excluir(secao.id)}
        deleteMessage={`Excluir a seção "${secao.titulo}"?`}
      />
    }
  >
    ...
  </AccordionCardSeplag>
))}
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **`deleteMessage: string` e `dangerouslySetInnerHTML`** | A prop é tipada como `string` e repassada ao [`ModalDeleteSeplag`](../ModalDelete/), que renderiza strings **como HTML**. Interpolar dados vindos da API na mensagem (como no exemplo acima) abre vetor de XSS. Ver R-05. |
| Média | **`podeVisualizar` sem uso** | A prop faz parte de `IPermissionResponseSeplag`, mas o componente **não oferece ação de visualizar** — o valor é aceito e ignorado. |
| Média | **Duplica `useConfirmacaoExclusaoSeplag`** | O hook [`useConfirmacaoExclusaoSeplag`](../TablePaginado/useConfirmacaoExclusaoSeplag.ts) resolve exatamente este fluxo no `TablePaginadoSeplag`, mas não é público — aqui a lógica é reimplementada com `useState`. |
| Baixa | **`severity` com `as any`** | `severity={a.severity as any}` (linha 84) — o array `actions` tipa `severity` como `string`, incompatível com a união do PrimeReact. |
| Baixa | **Conjunto de ações fixo** | Apenas três ações; não há slot para ações customizadas (contraste com `extraAcoes` e `renderBotoes` do `TableRowActionsSeplag`). |
| Baixa | **Sem tooltips configuráveis** | "Editar", "Duplicar" e "Excluir" são literais. |
| Baixa | **Alinhamento fixo** | `flex flex-1 justify-content-end` embutido, sem prop. |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-05
- [Objetivo da biblioteca](../../../docs/objetivo-da-biblioteca-de-componentes.md) — P-06
- [`interfaces/README.md`](../../interfaces/README.md) · [`TablePaginado/README.md`](../TablePaginado/README.md)
