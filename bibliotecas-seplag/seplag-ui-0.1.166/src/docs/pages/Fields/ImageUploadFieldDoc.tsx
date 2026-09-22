import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { ImageUploadFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

function BasicExample() {
  return (
    <div className="grid" style={{ width: "100%" }}>
      <ImageUploadFieldSeplag label="Foto do Servidor" cols="12 2" onFileSelect={() => {}} />
    </div>
  );
}

function ViewExample() {
  return (
    <div className="grid" style={{ width: "100%" }}>
      <ImageUploadFieldSeplag
        label="Foto (visualização)"
        cols="12 2"
        isView
        fotoPreview="https://cdn-icons-png.flaticon.com/512/18125/18125416.png"
        onFileSelect={() => {}}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Upload com cropper",
    description: "Exibe a imagem atual e abre um cropper ao clicar no botão de alterar.",
    example: <BasicExample />,
    code: `import { ImageUploadFieldSeplag } from "@seplag/ui-lib-react-18";

<ImageUploadFieldSeplag
  label="Foto do Servidor"
  cols="12 2"
  fotoPreview={servidorFoto}
  onFileSelect={(file) => setFoto(file)}
/>`,
  },
  {
    title: "Modo visualização",
    description: "Prop isView oculta o botão de upload e exibe apenas a imagem.",
    example: <ViewExample />,
    code: `<ImageUploadFieldSeplag
  label="Foto"
  cols="12 2"
  isView
  fotoPreview={servidorFoto}
  onFileSelect={() => {}}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "name",
    type: "string",
    required: false,
    description:
      "Identificador usado para gerar id/data-testid do preview e do botão de upload. Quando omitido, usa \"foto\" como base.",
  },
  {
    name: "onFileSelect",
    type: "(file: File) => void",
    required: true,
    description: "Callback chamado ao selecionar/recortar a imagem.",
  },
  {
    name: "label",
    type: "string",
    defaultValue: '"Foto"',
    required: false,
    description: "Rótulo exibido acima da imagem.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12 2"',
    required: false,
    description: "Largura via grid SEPLAG.",
  },
  {
    name: "fotoPreview",
    type: "string",
    required: false,
    description: "URL da imagem atual (base64 ou URL remota).",
  },
  {
    name: "placeholderImage",
    type: "string",
    required: false,
    description: "URL da imagem placeholder quando fotoPreview não está definida.",
  },
  {
    name: "buttonLabel",
    type: "string",
    defaultValue: '"Alterar foto"',
    required: false,
    description: "Texto do botão de upload.",
  },
  {
    name: "isView",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Modo somente leitura: oculta o botão de upload.",
  },
  {
    name: "visible",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Quando false, oculta o componente.",
  },
];

export default function ImageUploadFieldDoc() {
  return (
    <DocPage
      title="ImageUploadField"
      description="Campo de upload de imagem com cropper integrado (react-image-crop). Exibe a imagem atual e permite recortá-la antes de salvar."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
