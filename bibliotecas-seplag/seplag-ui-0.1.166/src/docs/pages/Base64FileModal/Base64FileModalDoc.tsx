import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { useMemo, useState, useEffect } from "react";
import Base64FileModal from "@componentes/Base64FileModal";
import { BotaoSeplag } from "@componentes/Botao";
import sampleProjectImage from "../../../assets/img/logo-seplag.png";
import "primereact/resources/themes/saga-blue/theme.css";

const SAMPLE_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
const SAMPLE_TEXT_BASE64 = "SGVsbG8gV29ybGQh"; // "Hello World!"

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Abra um modal com diferentes tipos de base64 para testar preview e download.",
    example: <Base64Playground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Abra o modal passando o conteúdo base64, `mimeType` e um `fileName` opcional.",
    example: (
      <div>
        <Base64FileModal
          visible={false}
          onHide={() => {}}
          base64={SAMPLE_TEXT_BASE64}
          mimeType="text/plain"
          fileName="exemplo.txt"
        />
      </div>
    ),
    code: `import Base64FileModal from "@componentes/Base64FileModal";

<Base64FileModal
  visible={true}
  onHide={() => {}}
  base64="${SAMPLE_TEXT_BASE64}"
  mimeType="text/plain"
  fileName="exemplo.txt"
/>`,
  },
  {
    title: "Quando não há preview",
    description:
      "Alguns tipos (ex.: arquivos binários não suportados) não tem visualização — o componente mostra uma mensagem e permite baixar.",
    example: (
      <Base64FileModal
        visible={false}
        onHide={() => {}}
        base64={""}
        mimeType="application/zip"
        fileName="arquivo.zip"
      />
    ),
    code: "",
  },
];

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"base64-file-modal"',
    required: false,
    description:
      "Identificador do modal, propagado como data-testid do Dialog e usado para compor o id dos botões Baixar/Fechar.",
  },
  {
    name: "visible",
    type: "boolean",
    required: true,
    description: "Mostra/oculta o modal.",
  },
  {
    name: "onHide",
    type: "() => void",
    required: true,
    description: "Callback para fechar o modal.",
  },
  {
    name: "base64",
    type: "string | null | undefined",
    required: false,
    description: "String Base64 (pura, sem prefixo `data:`).",
  },
  {
    name: "mimeType",
    type: "string",
    required: true,
    description: "Mime type do conteúdo (ex: `image/png`, `application/pdf`, `text/plain`).",
  },
  {
    name: "fileName",
    type: "string",
    required: false,
    defaultValue: '"arquivo"',
    description: "Nome sugerido para download.",
  },
  {
    name: "header",
    type: "string",
    required: false,
    defaultValue: '"Visualização do arquivo"',
    description: "Título do modal.",
  },
  {
    name: "modalWidth",
    type: "string",
    required: false,
    defaultValue: '"80vw"',
    description: "Largura do modal (CSS).",
  },
];

export default function Base64FileModalDoc() {
  return (
    <DocPage
      title="Base64FileModal"
      description="Modal para visualizar arquivos representados como base64 (imagem, PDF, texto) e permitir download."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { default as Base64FileModalSeplag } from "@seplag/ui-lib-react-18";
import type { Base64FileModalSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}

function Base64Playground() {
  const [visible, setVisible] = useState(false);
  const [kind, setKind] = useState<"image" | "text" | "unsupported">("image");
  const [fileName, setFileName] = useState("arquivo");

  const [base64, setBase64] = useState<string>("");

  // Carrega base64 para imagem do projeto ao selecionar 'image'
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (kind === "image") {
          const resp = await fetch(sampleProjectImage);
          const blob = await resp.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            if (cancelled) return;
            const dataUrl = reader.result as string;
            const comma = dataUrl.indexOf(",");
            setBase64(dataUrl.slice(comma + 1));
          };
          reader.readAsDataURL(blob);
        } else if (kind === "text") {
          setBase64(SAMPLE_TEXT_BASE64);
        } else {
          setBase64("");
        }
      } catch {
        setBase64(SAMPLE_IMAGE_BASE64);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const mimeType = useMemo(() => {
    if (kind === "image") return "image/png";
    if (kind === "text") return "text/plain";
    return "application/zip";
  }, [kind]);

  const base64Attr = base64 ? `"${base64}"` : "undefined";
  const visibleAttr = String(visible);
  const code = [
    'import { default as Base64FileModalSeplag } from "@seplag/ui-lib-react-18";',
    "",
    "<Base64FileModalSeplag",
    `  visible={${visibleAttr}}`,
    "  onHide={() => { /* fechar */ }}",
    `  base64={${base64Attr}}`,
    `  mimeType="${mimeType}"`,
    `  fileName="${fileName}"`,
    "/>",
  ].join("\n");

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview">
        <BotaoSeplag label="Abrir modal" onClick={() => setVisible(true)} />

        <Base64FileModal
          visible={visible}
          onHide={() => setVisible(false)}
          base64={base64 || undefined}
          mimeType={mimeType}
          fileName={fileName || undefined}
        />
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <span className="pg-label">Tipo</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as any)}>
            <option value="image">Imagem (PNG)</option>
            <option value="text">Texto</option>
            <option value="unsupported">Não suportado</option>
          </select>
        </div>

        <div className="pg-field">
          <span className="pg-label">fileName</span>
          <input
            className="pg-input"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>

        <PlaygroundCode code={code} />
      </div>
    </div>
  );
}
