# `AnexarDocumento/` — AnexarDocumentoSeplag

## Objetivo

Campo de anexo de documento com dois estados visuais: **seleção** (upload básico ou
arrastar-e-soltar) e **anexado** (cartão com nome do arquivo, botões visualizar e remover).

## Responsabilidade principal

Padronizar o anexo de documentos nos formulários SEPLAG, com PDF de até 2 MB como default
institucional.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 258 linhas.

```ts
export { AnexarDocumentoSeplag } from "./AnexarDocumento";
export type { AnexarDocumentoSeplagProps } from "./AnexarDocumento";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `name` | `"anexar-documento"` | Base dos `data-testid` |
| `arquivoBase64` | — | `{ nome, extensao, contentType, conteudoEmBase64 } \| null` — **presença alterna o estado visual** |
| `handleViewArquivo` | — | Callback do botão visualizar (obrigatório) |
| `onUploadDocument` | — | `onSelect` do `FileUpload` |
| `onRemoveArquivo` | — | **Quando ausente, o botão remover não é renderizado** |
| `fileUploadRef` | — | `RefObject<FileUpload>` para controle imperativo (ex.: `clear()`) |
| `hideLabel` | — | Omite o [`RotuloSeplag`](../Rotulo/) |
| `label` | `"Anexar Documento"` | Rótulo |
| `cols` | `"12 4"` | Grid |
| `dragDrop` | `false` | Alterna entre modo `basic` e `advanced` |
| `accept` | `"application/pdf"` | Tipos aceitos |
| `maxFileSize` | `2000000` | 2 MB |
| `chooseLabel` | `"Anexar documento"` | Rótulo do botão |
| `helperText` | `"Formato aceito: .pdf \| Tamanho máximo: 2MB"` | Texto de apoio (**só no modo `dragDrop`**) |
| `emptyTemplateText` | `"Arraste e solte o arquivo aqui"` | Área de drop vazia |
| `invalidFileSizeMessageDetail` | `"Tamanho Máximo do Arquivo Não Permitido. Tamanho Máximo de {1}."` | Mensagem de erro |
| `canView` | `true` | Habilita o botão visualizar |
| `className` / `style` | — | Estilos do wrapper interno |

### Dois estados visuais

**Com `arquivoBase64`** — cartão azul (`#f0f9ff` / borda `#bfdbfe`):

```
📄 {arquivoBase64.nome}          [👁 Visualizar] [✕ Remover]
```

**Sem `arquivoBase64`** — `FileUpload` do PrimeReact:

| `dragDrop` | Modo | Aparência |
| --- | --- | --- |
| `false` | `basic` | Botão único de largura total (`surface-400`) |
| `true` | `advanced` | Cabeçalho cinza + área de drop + template de item com botão remover |

### Composição do rótulo

```tsx
hideLabel
  ? <div className={className ?? cols ?? "col-12 md:col-4"} style={style}>{content}</div>
  : <RotuloSeplag nome={label || "Anexar Documento"} cols={cols || "12 4"}>
      <div className={className} style={style}>{content}</div>
    </RotuloSeplag>
```

### Memoização

`handleView`, `handleRemove`, `headerTemplate`, `emptyTemplate` e `itemTemplate` usam
`useCallback`; `content` usa `useMemo` com 17 dependências.

### Identificadores

`{name}` (FileUpload) · `{name}-visualizar` · `{name}-remover` · `{name}-item-remover`.

## Dependências

### Externas
- `primereact/fileupload` — `FileUpload`, `ItemTemplateOptions`

### Internas
- [`../Botao`](../Botao/) — `BotaoIconSeplag`
- [`../Rotulo`](../Rotulo/) — `RotuloSeplag`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Base64FileModal`](../Base64FileModal/) | Par natural: `handleViewArquivo` normalmente abre este modal |
| [`uteis/toBase64`](../../uteis/toBase64.ts) | `toBase64Seplag(file)` converte o `File` selecionado |
| [`uteis/base64ParaBlob`](../../uteis/base64ParaBlob.ts) | `baixarArquivoBase64Seplag` para download direto |
| [`Fields/ImageUploadField`](../Fields/ImageUploadField.tsx) | Equivalente para **imagens**, com recorte via [`ReactCrop`](../ReactCrop/) |
| [`DropdownBaseLegal`](../DropdownBaseLegal/) | Também trabalha com anexos em base64 |

Nenhum componente da biblioteca consome `AnexarDocumentoSeplag` internamente.

## Fluxos importantes

```tsx
const [anexo, setAnexo] = useState<Anexo | null>(null);
const [visualizando, setVisualizando] = useState(false);
const fileUploadRef = useRef<FileUpload>(null);

const selecionar = async (e: FileUploadSelectEvent) => {
  const file = e.files?.[0];
  if (!file) return;
  const dataUrl = await toBase64Seplag(file);            // "data:application/pdf;base64,AAA..."
  setAnexo({
    nome: file.name,
    extensao: file.name.split(".").pop() ?? "",
    contentType: file.type,
    conteudoEmBase64: dataUrl.split(",")[1],             // remove o prefixo data:
  });
  fileUploadRef.current?.clear();
};

<AnexarDocumentoSeplag
  name="documento-comprobatorio"
  label="Documento comprobatório"
  cols="12 6"
  dragDrop
  fileUploadRef={fileUploadRef}
  arquivoBase64={anexo}
  onUploadDocument={selecionar}
  onRemoveArquivo={() => setAnexo(null)}
  handleViewArquivo={() => setVisualizando(true)}
/>

<Base64FileModalSeplag
  visible={visualizando}
  onHide={() => setVisualizando(false)}
  base64={anexo?.conteudoEmBase64 ?? null}
  mimeType={anexo?.contentType ?? "application/pdf"}
  fileName={anexo?.nome ?? "documento"}
/>
```

> **Atenção:** `toBase64Seplag` devolve a *data URL* completa. O
> [`Base64FileModalSeplag`](../Base64FileModal/) espera base64 **puro** — é preciso remover
> o prefixo `data:...;base64,`.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Fora do padrão de campo** | Não aceita `control`, `required`, `visible`, `rules` nem `getFormErrorMessage`. Viola **RA-04**; a integração com `react-hook-form` e a exibição de erro de validação ficam totalmente a cargo do consumidor. |
| Média | **`helperText` ignorado sem `dragDrop`** | No modo `basic`, o texto exibido é a **string literal** `"Formato aceito: .pdf | Tamanho máximo: 2MB"` (linha 772), não a prop `helperText`. Alterar `accept`/`maxFileSize` sem `dragDrop` produz um texto de apoio incorreto. |
| Média | **`extensao` no contrato, sem uso** | O tipo de `arquivoBase64` exige `extensao`, mas o componente nunca lê esse campo. |
| Baixa | **Cores hardcoded** | `#e5e7eb`, `#ffffff`, `#4b5563`, `#f0f9ff`, `#bfdbfe`, `#dc2626`, `#1e40af`. Viola **RA-07**. Ver R-04. |
| Baixa | **Ícone fixo de PDF** | `pi pi-file-pdf` é exibido independentemente do `contentType` real do anexo. |
| Baixa | **`handleViewArquivo` obrigatório** | Exigido no tipo mesmo quando `canView={false}`. |
| Baixa | **`hideLabel` muda a semântica de `className`** | Com `hideLabel`, `className` vira a classe de grid do wrapper (`className ?? cols ?? "col-12 md:col-4"`); sem, é apenas a classe do `<div>` interno. |
| Baixa | **`useMemo` com 17 dependências** | O `content` é recalculado com frequência; o ganho da memoização é discutível. |
| Baixa | **Um arquivo por vez** | Sem suporte a múltiplos anexos (`multiple` do `FileUpload` não é exposto). |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — RA-04, R-04
- [`Base64FileModal/README.md`](../Base64FileModal/README.md) · [`uteis/README.md`](../../uteis/README.md)
