# `DropdownBaseLegal/` — DropdownBaseLegalSeplag

## Objetivo

Campo especializado para seleção múltipla de **documentos legais** (leis, decretos, normas,
portarias, resoluções), com filtragem por vigência, chips coloridos por tipo, visualização
do arquivo anexo e confirmação ao remover.

## Responsabilidade principal

Encapsular a regra de negócio de "base legal" — documento vigente, tipo, numeração/ano e
arquivo em base64 — em um único campo reutilizável entre os sistemas SEPLAG.

> É o componente mais **específico de domínio** do catálogo (fora de
> [`PaginaInicial`](../PaginaInicial/)) e o que mais **diverge dos padrões da biblioteca** —
> ver a seção de débitos.

## Estrutura

```
DropdownBaseLegal/
├── index.tsx                          ← DropdownBaseLegalSeplag + DropdownInner + StandaloneDropdown
├── types.ts                           ← tipos públicos + mapas default
├── helpers/documentoLegalHelpers.ts   ← regras puras (vigência, normalização, filtro)
├── hooks/useDocumentoSelection.ts     ← estado de seleção e paginação de opções
├── templates/
│   ├── ItemTemplate.tsx               ← item da lista do painel
│   ├── SelectedItemTemplate.tsx       ← chip no input
│   ├── FooterTemplate.tsx             ← rodapé do painel ("N selecionado(s)" + Concluir)
│   └── EmptyFilterTemplate.tsx        ← estado vazio da busca
├── ChipDropdownBaseLegal/
│   ├── ChipSelecionado.tsx            ← chip com badge de tipo
│   └── SelectedDocumentItem.tsx       ← linha da lista de selecionados (visualizar/remover)
└── DropdownBaseLegal.module.css
```

## Ponto de entrada

```ts
export { DropdownBaseLegalSeplag } from "./DropdownBaseLegal";
export { TIPO_COR_MAP_DEFAULT_SEPLAG, TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG } from "./DropdownBaseLegal/types";
export type {
  DocumentoLegalSeplag, DocumentoLegalTipoCorMapSeplag, DocumentoLegalTipoMapSeplag,
  DropdownBaseLegalSeplagProps, FileSelecionadoSeplag, NormalizedDocumentoSeplag,
} from "./DropdownBaseLegal/types";
```

## Funcionalidades existentes

### Contrato de dados

**Entrada** (`DocumentoLegalSeplag`) — superconjunto aceito; campos não usados são ignorados:

```ts
{ id, numrDocumentoLegal?, anoVigencia?, nomeDocumentoLegal?, dataFim?, dataVigencia?,
  siglaTipoDocumento?, valores?: [{ nomeCampo, valorCampo }], arquivo?: { conteudoEmBase64, contentType, nome } }
```

**Saída normalizada** (`NormalizedDocumentoSeplag`), exposta em `onSelectionChange` e nos templates:

```ts
{ id, label, fullName, description, tipo, numrDocumentoLegal, anoVigencia,
  nomeDocumentoLegal, dataFim, dataVigencia, arquivo? }
```

`description` = `` `[${tipo}] ${numero} - ${ano}` `` (usado como `optionLabel` no `MultiSelect`).
`label` = nome truncado em 150 caracteres.

### Regras de negócio — [`helpers/documentoLegalHelpers.ts`](./helpers/documentoLegalHelpers.ts)

| Função | Regra |
| --- | --- |
| `isDocumentoAtivo(dataVigencia, dataFim)` | Sem `dataFim` → **ativo**. `dataFim` inválida → ativo. Senão: `dataFim > hoje`; se houver `dataVigencia` válida, exige também `dataVigencia < dataFim`. Formato `dd/MM/yyyy`. |
| `getDocumentoTipo(doc, tipoMap)` | Procura `valores[]` com `nomeCampo === "tipoDocLegalId"` → `tipoMap[valorCampo]`. Fallback: `siglaTipoDocumento` (`"DOCLEGAL"` → `"Documento Legal"`). Último recurso: `"Documento"`. |
| `normalizeDocumento(doc, tipoMap)` | Monta o objeto normalizado; `anoVigencia` com `/` é reduzido ao 3º segmento; `contentType` default `application/pdf` |
| `filterDocumentos(docs, termo, tipoMap)` | Descarta não-vigentes; busca (case-insensitive) em tipo, número, ano e nome; devolve normalizados |
| `isDuplicado(id, selected)` | Verifica se o id já está selecionado |
| `getCorByTipo(tipo, corMap)` | Fallback `{ color: "#333", bg: "#eee" }` |
| `truncateText(text, max = 150)` | Trunca com `...` |

### Mapas default — [`types.ts`](./types.ts)

| Código | Tipo | Cor / fundo |
| --- | --- | --- |
| `1` | Lei | `#1351b4` / `#dce9f5` |
| `2` | Decreto | `#b41313` / `#f5dcdc` |
| `3` | Norma | `#137d13` / `#dcf5e0` |
| `4` | Portaria | `#b46f13` / `#f5e8d9` |
| `5` | Lei Complementar | `#6f13b4` / `#e8d9f5` |
| `6` | Resolução | `#137d7d` / `#d9f5f5` |

Ambos sobrescritíveis por `tipoMap` e `corMap`.

### Modos de operação

| Condição | Componente |
| --- | --- |
| `name` **e** `control` presentes | `<Controller>` → `DropdownInner` (valor: `number[]` de ids) |
| Caso contrário | `StandaloneDropdown` — `useState<number[]>` interno |

`fieldName` = `name ?? "documentoLegalIds"`.

### Estado de seleção — [`hooks/useDocumentoSelection.ts`](./hooks/useDocumentoSelection.ts)

- `options` — janela de 20 itens, carregada por `loadOptions(start, filter)`
- `selected` — `NormalizedDocumentoSeplag[]`
- `getDocumentosNaoSelecionados` — usado pelo "selecionar todos"

### Sincronização form ↔ local

`DropdownInner` mantém o valor do formulário (ids) e o estado local (objetos normalizados)
em sincronia por dois `useEffect`, usando `isSameIds` para comparação por conjunto.
Há guarda explícita contra loop quando o formulário traz ids ainda ausentes na lista
carregada.

### Interações

| Ação | Comportamento |
| --- | --- |
| Selecionar todos | Detecta `newValues.length === options.length && > selected.length` → concatena `getDocumentosNaoSelecionados` |
| Selecionar duplicado | `isDuplicado` → exibe `"Este documento já está selecionado."` e **não** altera a seleção |
| Remover chip | Abre `ModalDeleteSeplag` com mensagem `Deseja realmente remover o documento [tipo] numero/ano?` |
| Visualizar | Sem `conteudoEmBase64` → toast de aviso; senão abre `Base64FileModalSeplag` |
| Filtrar | `onFilter` limpa `options` e recarrega a partir do índice 0 |
| Atalho "+ Adicionar documento" | Modo padrão: `<Link to={addNewHref} target={addNewTarget}>` (default `_blank`). Se `onAddNewClick` for informado, renderiza `<button onClick={onAddNewClick}>` no lugar (mesmo visual/posição) e ignora `addNewHref`/`addNewTarget` — útil para abrir um modal de cadastro sem navegar de rota. |

### Lista de selecionados

Renderizada abaixo do campo em um `VirtualScroller` (`itemSize: 60`, altura
`min(selected.length, 3) * 60px`), com `SelectedDocumentItem` (visualizar + remover).

## Dependências

### Externas
- `primereact/multiselect`, `primereact/toast`, `primereact/virtualscroller`
- `react-hook-form` — `Controller`
- `react-router-dom` — `Link` (**exige Router no host**)
- `date-fns` — `compareAsc`, `isValid`, `parse`, `startOfDay`

### Internas
- [`../Base64FileModal`](../Base64FileModal/) — visualização do arquivo
- [`../ModalDelete`](../ModalDelete/) — confirmação de remoção
- [`../Badge`](../Badge/) — chip de tipo
- [`../Botao`](../Botao/) — ações nos templates e chips

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Fields/MultiSelectField`](../Fields/MultiSelectField.tsx) | Alternativa genérica, alinhada aos padrões da lib |
| [`Base64FileModal`](../Base64FileModal/) · [`ModalDelete`](../ModalDelete/) | Montados internamente |

## Fluxos importantes

```
documentos (do consumidor)
   │
   ├─► filterDocumentos(documentos, "", tipoMap)   ← useMemo
   │      ├─ isDocumentoAtivo → descarta vencidos
   │      └─ normalizeDocumento → NormalizedDocumentoSeplag[]
   │
   ├─► useDocumentoSelection → options (janela de 20) + selected
   │
   ├─► useEffect: value (ids do form) ⇄ selected (objetos)   [isSameIds]
   │
   ├─► <MultiSelect optionLabel="description" display="chip" appendTo="self">
   │      ├─ itemTemplate         → ItemTemplate (badge colorido + descrição)
   │      ├─ selectedItemTemplate → SelectedItemTemplate → ChipSelecionado
   │      ├─ panelFooterTemplate  → FooterTemplate ("N selecionado(s)" + Concluir)
   │      └─ emptyFilterMessage   → EmptyFilterTemplate
   │
   ├─► commit(novos) → setSelected + onChange(ids) + onSelectionChange(novos)
   │
   └─► <VirtualScroller items={selected}> → SelectedDocumentItem
           ├─ visualizar → Base64FileModalSeplag
           └─ remover    → ModalDeleteSeplag
```

## Arquivos críticos

| Arquivo | Por quê |
| --- | --- |
| [`helpers/documentoLegalHelpers.ts`](./helpers/documentoLegalHelpers.ts) | Concentra a regra de vigência — define quais documentos o usuário sequer enxerga |
| [`index.tsx`](./index.tsx) | 428 linhas; sincronização bidirecional form ↔ estado local |
| [`types.ts`](./types.ts) | Contrato público + mapas de tipo e cor |

## Observações técnicas e débitos identificados

Este componente **viola cinco padrões** da biblioteca (registrado como R-09 no documento de
Arquitetura):

| Severidade | Violação | Detalhe |
| --- | --- | --- |
| Média | **Toast próprio** | Monta `<Toast ref={toast} />` interno (linha 200) em vez de usar `toastService` / `ToastProviderSeplag`. Viola **RA-12**. Resultado: notificações deste componente aparecem em uma instância separada, possivelmente com posição e empilhamento diferentes. |
| Média | **Não usa `RotuloSeplag`** | Desenha o próprio `<label>` com estilo inline (`fontWeight: 600, color: "#6e6a6a", fontSize: "1.1rem"`) e asterisco em `#e11d48`. Viola **RA-05**; a aparência diverge de todos os demais campos. |
| Média | **Grid montado à mão** | `` className={`col-${cols}`} `` (linhas 348 e 375). Com `cols="12 6"` produz `col-12 6` — **classe inválida**. Deveria usar `classesCssSeplag`. Viola **RA-05**. |
| Média | **Não usa `resolveFieldRules`** | Monta `rules={{ required: requiredRule, ...rules }}` diretamente, sem a validação de string em branco nem o merge de constraints. Viola **RA-06**. |
| Baixa | **Cores hardcoded** | `#1351b4`, `#e11d48`, `#6e6a6a`, `#9ca3af`, `#e5e7eb`, `#ffffff` inline, além dos mapas de cor. Viola **RA-07**. Ver R-04. |
| Média | **Dependência de `react-router-dom`** | `<Link>` obriga o componente a viver dentro de um Router mesmo quando `addNewHref` não é usado — o import é estático. |
| Média | **`getFormErrorMessage` depreciado é o único canal de erro** | O tipo marca a prop como `@deprecated`, mas `fieldState.error.message` **nunca é renderizado**: `fieldState` só alimenta o booleano `invalid`. Sem `getFormErrorMessage`, uma regra de `required` falha silenciosamente. |
| Baixa | **Paginação de opções sem gatilho de scroll** | `loadOptions(start)` suporta paginação incremental, mas só é chamada com `start = 0`. Após o filtro, apenas os 20 primeiros resultados ficam disponíveis; não há `onLazyLoad` nem botão "carregar mais". |
| Baixa | **`useEffect` de sincronização complexo** | Dois efeitos com guardas de loop (`isSameIds` aplicado duas vezes). Sensível a alterações; sem testes. |
| Baixa | **`error` state sem uso efetivo** | `const [error, setError] = useState(false)` só é **desligado** (`setError(false)`); nunca é ligado. |
| Baixa | **`containerRef` sem uso** | Declarado e atribuído ao `<div>` raiz, nunca lido. |
| Baixa | **Sem testes** | Componente com maior densidade de regra de negócio do catálogo, sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-09, RA-05, RA-06, RA-12
- [`Fields/README.md`](../Fields/README.md) · [`Base64FileModal/README.md`](../Base64FileModal/README.md)
