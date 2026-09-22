# `Base64FileModal/` — Base64FileModalSeplag

## Objetivo

Visualizar e baixar arquivos recebidos em **base64** — PDF, imagem ou texto — dentro de um
diálogo maximizável.

## Responsabilidade principal

Cobrir o padrão dos backends SEPLAG, que devolvem anexos como string base64 embutida no JSON
em vez de URL. O componente converte para `Blob`, gera uma `objectURL` e escolhe o
visualizador adequado ao `mimeType`.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 225 linhas. Exportado como **default** e renomeado no barrel:

```ts
export { default as Base64FileModalSeplag } from "./Base64FileModal";
export type { Base64FileModalSeplagProps } from "./Base64FileModal";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"base64-file-modal"` | Base dos `data-testid` |
| `visible` | — | Controlado pelo consumidor |
| `onHide` | — | Fechamento |
| `base64` | — | Base64 **puro** (sem prefixo `data:`) |
| `mimeType` | — | Determina o visualizador |
| `fileName` | `"arquivo"` | Nome sugerido no download |
| `header` | `"Visualização do arquivo"` | Título do diálogo |
| `modalWidth` | `"80vw"` | Largura |

### Visualizadores por `mimeType`

| `mimeType` | Renderização |
| --- | --- |
| `application/pdf` | `<iframe src={objectUrl}>` em `height: 70vh` |
| `image/*` | `<img src={objectUrl}>` com `maxWidth/maxHeight: 100%` |
| `text/*` | `<TextPreview>` — lê o blob com `blob.text()` e exibe em `<pre>` |
| demais | `<Message severity="info">` — *"Este tipo de arquivo não suporta visualização. Use o botão Baixar."* |

### Gerenciamento de `objectURL`

```tsx
useEffect(() => {
  if (!visible || !base64) {
    setObjectUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    return;
  }
  setLoading(true); setError(null);
  try {
    const url = URL.createObjectURL(base64ToBlob(base64, mimeType));
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);   // cleanup revoga
  } catch {
    setError("Erro ao decodificar o arquivo.");
  } finally {
    setLoading(false);
  }
}, [visible, base64, mimeType]);
```

A URL é revogada tanto no cleanup quanto ao fechar/limpar — evita vazamento de memória.

### Download

```tsx
const url = objectUrl ?? URL.createObjectURL(base64ToBlob(base64, mimeType));
link.href = url; link.download = fileName; link.click();
if (!objectUrl) URL.revokeObjectURL(url);   // só revoga a URL criada aqui
```

Funciona mesmo quando o tipo não é pré-visualizável (não há `objectUrl` armazenada).

### Estados exibidos

| Condição | Conteúdo |
| --- | --- |
| `loading` | `<ProgressSpinner>` |
| `error` | `<Message severity="error">` |
| sem `base64` | `<Message severity="warn">` *"Nenhum arquivo disponível para exibição."* |
| tipo não suportado | `<Message severity="info">` |

O botão "Baixar" é desabilitado quando `!base64 \|\| error`.

### Subcomponente `TextPreview`

Local, não exportado. Cria um `Blob` a partir do base64 e usa `blob.text()`
(assíncrono) para obter o conteúdo, com estados de carregando e erro próprios.

## Dependências

### Externas
- `primereact/dialog`, `primereact/message`, `primereact/progressspinner`

### Internas
- [`../Botao`](../Botao/) — `BotaoSeplag`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`DropdownBaseLegal`](../DropdownBaseLegal/) | **Único consumidor interno** — visualiza o arquivo do documento legal selecionado |
| [`AnexarDocumento`](../AnexarDocumento/) | Par natural: anexa o arquivo; o `handleViewArquivo` normalmente abre este modal |
| [`uteis/base64ParaBlob`](../../uteis/base64ParaBlob.ts) | Utilitário público equivalente (`baixarArquivoBase64Seplag`) |

## Fluxos importantes

```tsx
const [arquivo, setArquivo] = useState<{ base64: string; contentType: string; nome: string } | null>(null);

<AnexarDocumentoSeplag
  arquivoBase64={anexo}
  handleViewArquivo={() => setArquivo({
    base64: anexo.conteudoEmBase64, contentType: anexo.contentType, nome: anexo.nome,
  })}
/>

<Base64FileModalSeplag
  visible={arquivo !== null}
  onHide={() => setArquivo(null)}
  base64={arquivo?.base64 ?? null}
  mimeType={arquivo?.contentType ?? "application/octet-stream"}
  fileName={arquivo?.nome ?? "arquivo"}
/>
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — o gerenciamento de `objectURL` é o ponto mais sensível;
  falhas ali causam vazamento de memória com arquivos grandes.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **`base64ToBlob` duplicado** | Reimplementa localmente (linhas 845-855 do arquivo consolidado) o que já existe em [`uteis/base64ParaBlob.ts`](../../uteis/base64ParaBlob.ts). A versão local acrescenta `replaceAll(/\s/g, "")`, removendo quebras de linha do base64 — a versão pública **não faz isso**. Ver R-06. |
| Média | **Loop de `codePointAt` para arquivos grandes** | A conversão percorre byte a byte em JavaScript. Um PDF de alguns MB gera milhões de iterações na thread principal. `Uint8Array.from(binary, c => c.charCodeAt(0))` seria mais direto. |
| Média | **`iframe` com conteúdo do usuário** | PDFs são renderizados em `<iframe src={objectUrl}>` sem atributo `sandbox`. Um PDF malicioso com JavaScript embutido executa no contexto da `blob:` URL. |
| Baixa | **`setLoading(false)` no `finally` prematuro** | O `finally` executa imediatamente após `createObjectURL`, antes de o `iframe`/`img` terminar de renderizar — o spinner some cedo demais para arquivos grandes. |
| Baixa | **`eslint-disable react-hooks/set-state-in-effect`** | Supressão na linha 881 para o `setObjectUrl` funcional dentro do efeito. |
| Baixa | **`TextPreview` sem limite de tamanho** | Arquivos de texto muito grandes são carregados inteiros em memória e renderizados em um `<pre>`. |
| Baixa | **`fileName` sem extensão automática** | O download usa o nome como está; se o consumidor não incluir a extensão, o arquivo é salvo sem ela. |
| Baixa | **Não usa `ModalSeplag`** | Monta `Dialog` diretamente, com rodapé próprio — diverge de [`Modal`](../Modal/). |
| Baixa | **Sem `aria-label` no `iframe`** | Tem `title`, o que é adequado, mas não há descrição adicional. |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-06
- [`uteis/README.md`](../../uteis/README.md) · [`AnexarDocumento/README.md`](../AnexarDocumento/README.md)
