# `ListaArrastavel/` — ListaArrastavelSeplag

## Objetivo

Exibir uma lista de registros **reordenável via drag and drop**, usando apenas a API nativa de
arraste do navegador (`draggable`, `onDragStart`/`onDragOver`/`onDrop`) — sem biblioteca externa
de DnD.

## Responsabilidade principal

Cobrir o caso de listas embutidas em formulários onde a ordem dos itens é significado de negócio
(ex.: ordem das fases de um certame) e o usuário precisa poder reordenar manualmente arrastando.

## Ponto de entrada

[`index.tsx`](./index.tsx) — arquivo único.

```ts
export { ListaArrastavelSeplag } from "./ListaArrastavel";
export type { ListaArrastavelSeplagProps } from "./ListaArrastavel";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `items` | — | `readonly T[]` na ordem atual — obrigatória |
| `getKey(item)` | — | Chave única de cada item — obrigatória |
| `onReordenar(origem, destino)` | — | Callback ao soltar um item — obrigatória |
| `renderItem(item, indice)` | — | Renderiza o conteúdo de cada linha — obrigatória |
| `disabled` | `false` | Remove `draggable` e a alça de arraste |
| `ariaLabel` | — | `aria-label` da `<ul>` |
| `emptyMessage` | `"Nenhum item adicionado."` | Exibido quando `items` está vazio |
| `maxHeight` | — | Ativa scroll vertical interno quando definida |

### Quem mantém a ordem

O componente **não guarda estado da ordem** — é controlado. `onReordenar(indiceOrigem,
indiceDestino)` só informa a intenção; cabe ao consumidor recalcular e persistir o novo array
(tipicamente com `splice` + `setState` ou `useFieldArray.move` do react-hook-form).

### Fluxo de arraste

```
onDragStart(indice)      → guarda indiceArrastado
onDragOver(indice)       → preventDefault + guarda indiceSobreposto (feedback visual)
onDrop(indice)           → chama onReordenar(indiceArrastado, indice), limpa os dois estados
onDragEnd / onDragLeave  → limpa os estados sem reordenar (cancelamento)
```

### Estrutura

```html
<ul aria-label style="border; border-radius: 8px; overflow-y: auto se maxHeight">
  <li draggable style="opacity 0.4 se sendo arrastado; background destacado se sobreposto">
    <i class="pi pi-bars" />  <!-- alça de arraste, oculta se disabled -->
    <div>{renderItem(item, indice)}</div>
  </li>
  ...
</ul>
```

### Cores

Usa variáveis CSS do tema PrimeReact (`var(--surface-border)`, `var(--surface-50)`,
`var(--primary-50)`) com fallback literal, no mesmo padrão do `ListaSimplesSeplag`.

## Dependências

### Externas
Nenhuma. Drag and drop nativo do HTML5, sem biblioteca.

### Internas
Nenhuma. É folha do grafo.

## Módulos relacionados

| Módulo | Quando usar cada um |
| --- | --- |
| [`ListaSimples`](../ListaSimples/) | Lista embutida sem necessidade de reordenar |
| **`ListaArrastavel`** | Lista embutida onde a ordem dos itens é editável pelo usuário |
| [`TablePaginado`](../TablePaginado/) | Listagem principal de tela, com paginação server-side |

## Fluxos importantes

```tsx
const [fases, setFases] = useState(fasesIniciais);

function reordenar<T>(items: readonly T[], origem: number, destino: number): T[] {
  const copia = [...items];
  const [removido] = copia.splice(origem, 1);
  copia.splice(destino, 0, removido);
  return copia;
}

<ListaArrastavelSeplag
  items={fases}
  getKey={(f) => f.id}
  ariaLabel="Fases do certame"
  onReordenar={(origem, destino) => setFases((atual) => reordenar(atual, origem, destino))}
  renderItem={(fase, indice) => (
    <div>
      <div style={{ fontWeight: 600 }}>{indice + 1}. {fase.nome}</div>
      <div>{fase.descricao}</div>
    </div>
  )}
/>
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único, sem dependências.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **Sem suporte a touch/mobile** | A API de drag and drop nativa do HTML5 não funciona em telas touch sem polyfill; a reordenação fica inacessível em tablets/celulares. |
| Baixa | **Sem reordenação por teclado** | Não há alternativa acessível (ex.: botões subir/descer) para quem não usa mouse. |
| Baixa | **`indiceSobreposto` não distingue posição relativa** | O destaque visual marca o item sobre o qual se está passando, mas não indica se o drop vai inserir antes ou depois dele. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.6, §3.8
- [`ListaSimples/README.md`](../ListaSimples/README.md)
