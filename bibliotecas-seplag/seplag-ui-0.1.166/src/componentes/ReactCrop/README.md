# `ReactCrop/` — ImageCropperSeplag

## Objetivo

Modal de seleção e recorte de imagem, com proporção fixa 3:4 (formato de foto de documento).

## Responsabilidade principal

Padronizar o upload de foto de perfil/servidor: validar tamanho, permitir recorte e devolver
um `File` pronto para envio.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 135 linhas.

```ts
export { ImageCropperSeplag } from "./ReactCrop";
```

> A interface `ImageCropperSeplagProps` é **local** ao arquivo (sem `export`), e o tipo não
> consta do barrel.

## Funcionalidades existentes

### Props

| Prop | Tipo | Papel |
| --- | --- | --- |
| `visible` | `boolean` | Controlado pelo consumidor |
| `onHide` | `() => void` | Fechamento |
| `setFile` | `(file: File) => void` | Recebe o `File` recortado |

### Dois estados internos

**Sem imagem** — `FileUpload` do PrimeReact:

```tsx
mode="basic"
chooseLabel="Selecionar Imagem (JPEG e PNG de até 2 MB)"
accept="image/*"
maxFileSize={2000000}
```

**Com imagem** — `Cropper` do `react-cropper`:

| Configuração | Valor |
| --- | --- |
| `aspectRatio` | `3 / 4` |
| `autoCropArea` | `0.5` |
| `viewMode` | `2` |
| `dragMode` | `"crop"` |
| `rotatable` | `false` |
| `guides` / `background` | `true` |
| Dimensões | `600 × 800` |
| `minContainer` | `250 × 180` |

### Validação de tamanho

```tsx
if (e.files[0].size > 2000000) {
  printToast({ severity: "error", summary: "Erro ao enviar o arquivo",
               detail: "O tamanho do arquivo excede 2 MBs, ...", life: 5000 });
} else {
  const reader = new FileReader();
  reader.onload = (event) => setImgSrc(event.target.result as string);
  reader.readAsDataURL(file);
}
```

Validação **redundante** com o `maxFileSize` do `FileUpload`, que já bloqueia o arquivo antes.

### Recorte e entrega

```tsx
const canvas = cropper.getCroppedCanvas();
adjustCanvasSize(canvas);
const ctx = canvas.getContext("2d");
if (ctx) ctx.drawImage(canvas, 0, 0);

canvas.toBlob((blob) => {
  if (blob) {
    setFile(new File([blob], "name", { type: blob.type }));
    onHide();
    setImgSrc(null);
  }
});
```

### Identificadores

`image-cropper-modal` · `image-cropper-upload` · `image-cropper-cortar`.

## Dependências

### Externas
- `react-cropper` — `Cropper`, `ReactCropperElement` (**peer dependency**)
- `cropperjs/dist/cropper.css` — CSS **global** importado no topo do módulo
- `primereact/dialog`, `primereact/fileupload`

### Internas
- [`../Botao`](../Botao/) — `BotaoSeplag`
- [`../../hooks/toast`](../../hooks/toast/) — `useToastSeplag().printToast`

> Requer [`ToastProviderSeplag`](../../provider/printToast/) acima na árvore; sem ele, o erro
> de tamanho falha em silêncio.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Fields/ImageUploadField`](../Fields/ImageUploadField.tsx) | **Único consumidor interno** — monta o cropper e exibe o preview |
| [`AnexarDocumento`](../AnexarDocumento/) | Equivalente para **documentos** (PDF) |
| [`uteis/toBase64`](../../uteis/toBase64.ts) | Converte o `File` resultante para envio |

## Fluxos importantes

```
ImageUploadFieldSeplag
  ├── <Image src={fotoPreview ?? placeholderImage} />
  └── !isView:
        <BotaoSeplag label="Alterar foto" onClick={() => setCropperVisible(true)} />
        <ImageCropperSeplag visible onHide setFile={onFileSelect} />
                 │
                 ├─ FileUpload (accept="image/*", max 2 MB)
                 │      └─ onSelect → valida tamanho → FileReader → setImgSrc(dataURL)
                 │
                 ├─ Cropper (3:4)
                 │      └─ "Cortar Imagem" → getCroppedCanvas → adjustCanvasSize
                 │            → toBlob → new File([blob], "name") → setFile(file)
                 │            → onHide() + setImgSrc(null)
                 ▼
        Consumidor recebe o File em onFileSelect
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único.
- [`utils.ts`](./utils.ts) — **módulo órfão** (ver débitos).

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| **Média** | **`adjustCanvasSize` provavelmente não funciona como pretendido** | A função declara `let width = 400; let height = 300;` **fixos** e faz os cálculos de proporção sobre esses valores, ignorando as dimensões reais do canvas. A condição final `canvas.width > 900 && canvas.height > 700` exige **ambas** as dimensões acima do limite — com proporção 3:4, largura e altura raramente ultrapassam os dois limites simultaneamente. Na prática, o redimensionamento quase nunca ocorre. |
| **Média** | **`ctx.drawImage(canvas, 0, 0)` sobre si mesmo** | Desenhar um canvas em seu próprio contexto na posição `(0,0)` é uma operação sem efeito útil (ou destrutiva, se as dimensões tiverem sido alteradas na linha anterior). Provavelmente resíduo de uma implementação anterior. |
| **Média** | **Módulo órfão: [`utils.ts`](./utils.ts)** | Exporta `toBase64` (nomeado e default) — **cópia idêntica** de [`uteis/toBase64.ts`](../../uteis/toBase64.ts), sem o sufixo `Seplag`. **Nunca é importado**, nem pelo próprio `index.tsx`. Empacotado em `dist/` por `preserveModules`. Ver R-07. |
| Média | **Nome de arquivo fixo `"name"`** | `new File([blob], "name", ...)` — o arquivo resultante sempre se chama `name`, sem extensão. O nome original é perdido. |
| Baixa | **Validação de tamanho duplicada** | O `FileUpload` já bloqueia com `maxFileSize={2000000}` e exibe sua própria mensagem; a checagem manual raramente é alcançada. |
| Baixa | **`accept="image/*"` × rótulo "JPEG e PNG"** | O rótulo do botão promete JPEG/PNG, mas o `accept` permite qualquer imagem (GIF, WEBP, SVG). |
| Baixa | **CSS global do cropper.js** | `import "cropperjs/dist/cropper.css"` injeta estilos globais em qualquer bundle que alcance este módulo. |
| Baixa | **Proporção 3:4 fixa** | Sem prop para alterar `aspectRatio`, dimensões ou `rotatable`. |
| Baixa | **`toBlob` sem tipo/qualidade** | Usa o default do navegador (`image/png`, sem compressão) — o arquivo resultante pode ser maior que o original JPEG. |
| Baixa | **Props não exportadas** | `ImageCropperSeplagProps` é local. |
| Baixa | **`useState<string \| null>("")`** | Inicializado com string vazia, não `null` — inconsistente com o tipo. |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-07
- [`Fields/README.md`](../Fields/README.md) · [`AnexarDocumento/README.md`](../AnexarDocumento/README.md)
