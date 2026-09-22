# `ModalDelete/` — ModalDeleteSeplag

## Objetivo

Diálogo de confirmação de exclusão padronizado ("Confirmação" / "Sim" / "Não").

## Responsabilidade principal

Garantir que toda remoção de registro na plataforma peça confirmação com o mesmo texto,
mesmos botões e mesma disposição.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 73 linhas. Exporta apenas nomeado (`export { ModalDeleteSeplag }`),
sem `default`.

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"confirmation-delete-modal"` | Base dos `data-testid` |
| `visible` | — | Controlado pelo consumidor |
| `onConfirm` | — | Botão "Sim" |
| `onCancel` | — | Botão "Não" **e** `onHide` |
| `message` | `"Deseja realmente remover o registro selecionado?"` | `ReactNode` |

### Comportamento

- Cabeçalho fixo: `"Confirmação"`.
- `closable={false}` — **não há "X"**; a única saída é por um dos dois botões.
- `BotaoSalvarSeplag` label "Sim", ícone `pi pi-check` → `onConfirm`.
- `BotaoVoltarSeplag` label "Não", ícone `pi pi-times` → `onCancel`.
- `footer` memoizado com `useMemo`; `handleConfirm`/`handleCancel` com `useCallback`.

### Renderização da mensagem

```tsx
{typeof message === "string"
  ? <p dangerouslySetInnerHTML={{ __html: message || DEFAULT_MESSAGE }} />
  : <p>{message || DEFAULT_MESSAGE}</p>}
```

Mensagens `string` são renderizadas **como HTML**; `ReactNode` é renderizado normalmente.

### Identificadores

`{id}` · `{id}-confirmar` · `{id}-cancelar`.

## Dependências

### Externas
- `primereact/dialog` — `Dialog`

### Internas
- [`../Botao`](../Botao/) — `BotaoSalvarSeplag`, `BotaoVoltarSeplag`

Não usa [`ModalSeplag`](../Modal/) — monta o `Dialog` diretamente.

## Módulos relacionados

Consumidores diretos:

| Módulo | Como usa |
| --- | --- |
| [`TablePaginado`](../TablePaginado/) | Montado internamente; orquestrado por `useConfirmacaoExclusaoSeplag`; `id` = `{tableId}-delete-modal` |
| [`GroupActions`](../GroupActions/) | Estado próprio (`useState`); `id` = `{groupTestId}-delete-modal` |
| [`DropdownBaseLegal`](../DropdownBaseLegal/) | Confirma remoção de documento selecionado; mensagem dinâmica com tipo/número/ano |
| [`PaginaInicial/Cronograma`](../PaginaInicial/Cronograma/) | Confirma exclusão de ciclo, seção ou evento |

## Fluxos importantes

**Via `TablePaginadoSeplag` (mais comum — o consumidor não monta o modal):**

```
<TablePaginadoSeplag hasEventoAcao handleDelete={excluir} deleteMessage="...">
      │
      ├─ useConfirmacaoExclusaoSeplag(handleDelete)
      │      { visible, abrir(rowData), cancelar(), confirmar() }
      │
      ├─ TableRowActionsSeplag → clique em "Excluir" → abrir(rowData)
      │
      └─ <ModalDeleteSeplag visible message onConfirm={confirmar} onCancel={cancelar}>
             │  confirmar() → setVisible(false) → handleDelete(selected)
```

**Uso direto:**

```tsx
const [visivel, setVisivel] = useState(false);

<ModalDeleteSeplag
  id="excluir-orgao"
  visible={visivel}
  message={`Excluir o órgão "${orgao.nome}"?`}
  onConfirm={() => { excluir(orgao.id); setVisivel(false); }}
  onCancel={() => setVisivel(false)}
/>
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — usado por 4 componentes da biblioteca; é o último ponto de
  confirmação antes de uma operação destrutiva.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Média (segurança)** | **`dangerouslySetInnerHTML` incondicional para strings** | Linha 65. Diferente do [`MensagemSeplag`](../Mensagem/), **não há flag `allowHtml`** nem detecção de tag: toda `message: string` vira HTML. Consumidores que interpolam dados vindos da API — como `DropdownBaseLegal` (`removalCandidate.numrDocumentoLegal`) e `Cronograma` (`exclusaoPendente.titulo`) — expõem um vetor de XSS se esses valores forem controláveis pelo usuário. Ver R-05. |
| Baixa | **`closable={false}` sem `closeOnEscape`** | Sem "X" e sem configuração explícita de ESC. O PrimeReact fecha com ESC por default, disparando `onHide` → `onCancel`. Comportamento correto, mas não explícito no código. |
| Baixa | **Rodapé sem alinhamento** | `<div>` simples, sem `flex`/`justify-content` — o alinhamento depende do CSS do `Dialog`. Contrasta com [`ModalSeplag`](../Modal/), que tem `alignFooter`. |
| Baixa | **Classe global no botão** | `className="margin-app-entre-button"` (sem CSS Module) — depende de estilo global, provavelmente vindo de `Modal/style.module.css`, onde a classe **é** escopada. Ou seja, provavelmente não tem efeito. |
| Baixa | **`onConfirm?.()` em prop obrigatória** | `handleConfirm` usa optional chaining sobre `onConfirm`, que é declarada obrigatória no tipo. |
| Baixa | **Sem `default export`** | Diverge da maioria dos componentes da lib, que exportam nomeado **e** default. |
| Baixa | **Sem testes** | Sem cobertura, apesar de guardar operações destrutivas. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-05
- [`TablePaginado/README.md`](../TablePaginado/README.md) · [`Modal/README.md`](../Modal/README.md)
