import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { ImageCropperSeplag } from "@componentes/ReactCrop";
import { useState } from "react";

function ImageCropperPlayground() {
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setVisible(true)}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 6,
          background: "#fff",
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
      >
        Selecionar e cortar foto
      </button>

      <div style={{ marginTop: "0.75rem" }}>
        {previewUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img
              src={previewUrl}
              alt="Prévia da imagem cortada"
              style={{ width: 96, height: 128, objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0" }}
            />
            <span style={{ color: "#334155" }}>Imagem cortada recebida via setFile.</span>
          </div>
        ) : (
          <span style={{ color: "#64748b" }}>Nenhuma imagem selecionada ainda.</span>
        )}
      </div>

      <ImageCropperSeplag
        visible={visible}
        onHide={() => setVisible(false)}
        setFile={(f) => setFile(f)}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Abra o modal, selecione uma imagem (JPEG/PNG, até 2 MB), ajuste o recorte (proporção 3:4) e clique em \"Cortar Imagem\". O arquivo resultante é recebido em setFile e exibido em uma prévia abaixo.",
    example: <ImageCropperPlayground />,
    code: `import { useState } from "react";
import { ImageCropperSeplag } from "@seplag/ui-lib-react-18";

const [visible, setVisible] = useState(false);
const [file, setFile] = useState<File | null>(null);

<>
  <button onClick={() => setVisible(true)}>Selecionar e cortar foto</button>

  {file && <img src={URL.createObjectURL(file)} alt="Prévia" />}

  <ImageCropperSeplag
    visible={visible}
    onHide={() => setVisible(false)}
    setFile={setFile}
  />
</>`,
  },
  {
    title: "Integração com upload de formulário",
    description:
      "Uso típico: abrir o cropper a partir de um botão de \"trocar foto\" e enviar o File resultante junto com o restante do formulário (ex.: em um FormData).",
    example: (
      <div style={{ color: "#64748b" }}>
        Veja o Playground acima — o padrão de integração é o mesmo, apenas guardando o File em estado do formulário.
      </div>
    ),
    code: `const [foto, setFoto] = useState<File | null>(null);

<ImageCropperSeplag
  visible={cropperVisivel}
  onHide={() => setCropperVisivel(false)}
  setFile={(file) => {
    setFoto(file);
    form.setValue("foto", file);
  }}
/>`,
  },
];

const props: DocProp[] = [
  { name: "visible", type: "boolean", required: true, description: "Controla a exibição do modal de recorte." },
  { name: "onHide", type: "() => void", required: true, description: "Callback executado ao fechar o modal (via botão de fechar do Dialog)." },
  {
    name: "setFile",
    type: "(file: File) => void",
    required: true,
    description:
      "Callback executado com o arquivo cortado (PNG, redimensionado no máximo para 900x700 preservando proporção) assim que o usuário clica em \"Cortar Imagem\". O modal é fechado automaticamente em seguida.",
  },
];

export default function ImageCropperDoc() {
  return (
    <DocPage
      title="ImageCropper"
      badge="Estável"
      since="v0.1.153"
      description="Modal para upload e recorte de imagens (fotos de perfil, por exemplo), com proporção fixa 3:4, baseado em react-cropper. Valida tamanho máximo de 2 MB e tipos JPEG/PNG."
      importStatement={`import { ImageCropperSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
