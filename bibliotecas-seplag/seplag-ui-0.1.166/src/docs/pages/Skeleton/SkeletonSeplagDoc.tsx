import { useState } from "react";
import { DocPage, PlaygroundCode, type DocProp, type DocSection } from "../../components/DocPage";
import { SkeletonSeplag } from "@componentes/SkeletonSeplag";
import "primereact/resources/themes/saga-blue/theme.css";

const VARIANT_OPTIONS = ["text", "title", "avatar", "button", "card", "custom"] as const;

type SkeletonVariant = (typeof VARIANT_OPTIONS)[number];

function SkeletonPlayground() {
  const [variant, setVariant] = useState<SkeletonVariant>("text");
  const [lines, setLines] = useState(3);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [size, setSize] = useState("");
  const [borderRadius, setBorderRadius] = useState("");
  const [gap, setGap] = useState("0.5rem");

  const propsCode = [
    `variant="${variant}"`,
    lines === 1 ? "" : `lines={${lines}}`,
    width ? `width="${width}"` : "",
    height ? `height="${height}"` : "",
    size ? `size="${size}"` : "",
    borderRadius ? `borderRadius="${borderRadius}"` : "",
    gap === "0.5rem" ? "" : `gap="${gap}"`,
  ]
    .filter(Boolean)
    .join("\n  ");

  const generatedCode = `import { SkeletonSeplag } from "@seplag/ui-lib-react-18";\n\n<SkeletonSeplag\n  ${propsCode}\n/>`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview" style={{ minHeight: 140 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <SkeletonSeplag
            variant={variant}
            lines={lines}
            width={width || undefined}
            height={height || undefined}
            size={size || undefined}
            borderRadius={borderRadius || undefined}
            gap={gap}
          />
        </div>
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <span className="pg-label">variant</span>
          <div className="pg-radio-group">
            {VARIANT_OPTIONS.map((value) => (
              <label key={value} className={`pg-radio-btn${variant === value ? " selected" : ""}`}>
                <input
                  type="radio"
                  name="skeleton-variant"
                  checked={variant === value}
                  onChange={() => setVariant(value)}
                />
                {value}
              </label>
            ))}
          </div>
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="skeleton-lines">
            lines
          </label>
          <input
            id="skeleton-lines"
            className="pg-input"
            type="number"
            min={1}
            max={8}
            value={lines}
            onChange={(e) => setLines(Number(e.target.value) || 1)}
          />
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="skeleton-width">
            width
          </label>
          <input
            id="skeleton-width"
            className="pg-input"
            type="text"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="ex: 100%, 240px"
          />
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="skeleton-height">
            height
          </label>
          <input
            id="skeleton-height"
            className="pg-input"
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="ex: 14px"
          />
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="skeleton-size">
            size
          </label>
          <input
            id="skeleton-size"
            className="pg-input"
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="ex: 2.5rem (avatar)"
          />
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="skeleton-radius">
            borderRadius
          </label>
          <input
            id="skeleton-radius"
            className="pg-input"
            type="text"
            value={borderRadius}
            onChange={(e) => setBorderRadius(e.target.value)}
            placeholder="ex: 12px"
          />
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="skeleton-gap">
            gap
          </label>
          <input
            id="skeleton-gap"
            className="pg-input"
            type="text"
            value={gap}
            onChange={(e) => setGap(e.target.value)}
            placeholder="ex: 0.5rem"
          />
        </div>
      </div>

      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Monte o skeleton ao vivo escolhendo o preset e as dimensões. O código é gerado automaticamente.",
    example: <SkeletonPlayground />,
    code: `// Use o playground acima para gerar o código do seu SkeletonSeplag`,
  },
  {
    title: "Variações de preset",
    description: "Use a prop variant para escolher entre presets prontos de loading placeholders.",
    example: (
      <div
        style={{
          display: "grid",
          gap: 12,
          width: "100%",
          maxWidth: 480,
        }}
      >
        <SkeletonSeplag variant="title" />
        <SkeletonSeplag variant="text" lines={3} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SkeletonSeplag variant="avatar" />
          <SkeletonSeplag variant="button" />
        </div>
        <SkeletonSeplag variant="card" />
      </div>
    ),
    code: `<SkeletonSeplag variant="title" />
<SkeletonSeplag variant="text" lines={3} />
<SkeletonSeplag variant="avatar" />
<SkeletonSeplag variant="button" />
<SkeletonSeplag variant="card" />`,
  },
  {
    title: "Customização",
    description:
      "No variant custom, você controla manualmente largura, altura e borda para montar qualquer placeholder.",
    example: (
      <div style={{ width: "100%", maxWidth: 420 }}>
        <SkeletonSeplag
          variant="custom"
          lines={4}
          height="10px"
          width="100%"
          borderRadius="6px"
          gap="0.6rem"
        />
      </div>
    ),
    code: `<SkeletonSeplag
  variant="custom"
  lines={4}
  height="10px"
  width="100%"
  borderRadius="6px"
  gap="0.6rem"
/>`,
  },
  {
    title: "Cards em grade",
    description:
      "Use SkeletonSeplag com children para compor cards em grade com itens de tamanho variado.",
    example: (
      <div className="grid" style={{ width: "100%" }}>
        {["a", "b", "c", "d"].map((key) => (
          <div key={key} className="col-12 md:col-3">
            <SkeletonSeplag containerClassName="p-3 border-round surface-100 flex flex-column gap-2">
              <SkeletonSeplag.Item width="40%" height="12px" />
              <SkeletonSeplag.Item width="60%" height="20px" />
            </SkeletonSeplag>
          </div>
        ))}
      </div>
    ),
    code: `<div className="grid">
  {["a", "b", "c", "d"].map((key) => (
    <div key={key} className="col-12 md:col-3">
      <SkeletonSeplag containerClassName="p-3 border-round surface-100 flex flex-column gap-2">
        <SkeletonSeplag.Item width="40%" height="12px" />
        <SkeletonSeplag.Item width="60%" height="20px" />
      </SkeletonSeplag>
    </div>
  ))}
</div>`,
  },
  {
    title: "Tabela simulada",
    description: "Simule linhas de uma tabela usando SkeletonSeplag.Item em layout flex por linha.",
    example: (
      <SkeletonSeplag
        containerClassName="flex flex-column gap-2"
        style={{ width: "100%", maxWidth: 600 }}
      >
        {["1", "2", "3", "4", "5"].map((row) => (
          <div key={row} className="flex gap-3 align-items-center">
            <SkeletonSeplag.Item width="10%" height="14px" />
            <SkeletonSeplag.Item width="30%" height="14px" />
            <SkeletonSeplag.Item width="25%" height="14px" />
            <SkeletonSeplag.Item width="20%" height="14px" />
            <SkeletonSeplag.Item width="15%" height="14px" />
          </div>
        ))}
      </SkeletonSeplag>
    ),
    code: `<SkeletonSeplag containerClassName="flex flex-column gap-2">
  {["1", "2", "3", "4", "5"].map((row) => (
    <div key={row} className="flex gap-3 align-items-center">
      <SkeletonSeplag.Item width="10%" height="14px" />
      <SkeletonSeplag.Item width="30%" height="14px" />
      <SkeletonSeplag.Item width="25%" height="14px" />
      <SkeletonSeplag.Item width="20%" height="14px" />
      <SkeletonSeplag.Item width="15%" height="14px" />
    </div>
  ))}
</SkeletonSeplag>`,
  },
  {
    title: "Tabela com ações",
    description: "Linhas de tabela com botões de ação no final, simulando listagens com controles.",
    example: (
      <SkeletonSeplag
        containerClassName="flex flex-column gap-2"
        style={{ width: "100%", maxWidth: 600 }}
      >
        {["1", "2", "3"].map((row) => (
          <div key={row} className="flex gap-3 align-items-center">
            <SkeletonSeplag.Item width="35%" height="14px" />
            <SkeletonSeplag.Item width="30%" height="14px" />
            <SkeletonSeplag.Item width="60px" height="28px" borderRadius="6px" />
            <SkeletonSeplag.Item width="60px" height="28px" borderRadius="6px" />
          </div>
        ))}
      </SkeletonSeplag>
    ),
    code: `<SkeletonSeplag containerClassName="flex flex-column gap-2">
  {["1", "2", "3"].map((row) => (
    <div key={row} className="flex gap-3 align-items-center">
      <SkeletonSeplag.Item width="35%" height="14px" />
      <SkeletonSeplag.Item width="30%" height="14px" />
      <SkeletonSeplag.Item width="60px" height="28px" borderRadius="6px" />
      <SkeletonSeplag.Item width="60px" height="28px" borderRadius="6px" />
    </div>
  ))}
</SkeletonSeplag>`,
  },
  {
    title: "Lista simples com ação",
    description: "Lista de itens com linha de texto e um botão à direita.",
    example: (
      <SkeletonSeplag
        containerClassName="flex flex-column gap-3"
        style={{ width: "100%", maxWidth: 480 }}
      >
        {["1", "2", "3", "4"].map((row) => (
          <div key={row} className="flex justify-content-between align-items-center gap-3">
            <SkeletonSeplag.Item width="70%" height="14px" />
            <SkeletonSeplag.Item width="80px" height="28px" borderRadius="6px" />
          </div>
        ))}
      </SkeletonSeplag>
    ),
    code: `<SkeletonSeplag containerClassName="flex flex-column gap-3">
  {["1", "2", "3", "4"].map((row) => (
    <div key={row} className="flex justify-content-between align-items-center gap-3">
      <SkeletonSeplag.Item width="70%" height="14px" />
      <SkeletonSeplag.Item width="80px" height="28px" borderRadius="6px" />
    </div>
  ))}
</SkeletonSeplag>`,
  },
  {
    title: "Lista de usuários com avatar",
    description: "Simule uma lista de usuários com avatar circular e linhas de texto ao lado.",
    example: (
      <SkeletonSeplag
        containerClassName="flex flex-column gap-3"
        style={{ width: "100%", maxWidth: 400 }}
      >
        {["1", "2", "3"].map((row) => (
          <div key={row} className="flex align-items-center gap-3">
            <SkeletonSeplag.Item shape="circle" size="2.5rem" />
            <div className="flex flex-column gap-1" style={{ flex: 1 }}>
              <SkeletonSeplag.Item width="50%" height="14px" />
              <SkeletonSeplag.Item width="75%" height="12px" />
            </div>
          </div>
        ))}
      </SkeletonSeplag>
    ),
    code: `<SkeletonSeplag containerClassName="flex flex-column gap-3">
  {["1", "2", "3"].map((row) => (
    <div key={row} className="flex align-items-center gap-3">
      <SkeletonSeplag.Item shape="circle" size="2.5rem" />
      <div className="flex flex-column gap-1" style={{ flex: 1 }}>
        <SkeletonSeplag.Item width="50%" height="14px" />
        <SkeletonSeplag.Item width="75%" height="12px" />
      </div>
    </div>
  ))}
</SkeletonSeplag>`,
  },
  {
    title: "Perfil de entidade",
    description: "Skeleton para uma página de perfil com avatar grande e linhas de informação.",
    example: (
      <SkeletonSeplag
        containerClassName="p-4 flex flex-column gap-3"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--surface-100)",
          borderRadius: 12,
        }}
      >
        <div className="flex align-items-center gap-3">
          <SkeletonSeplag.Item shape="circle" size="4rem" />
          <div className="flex flex-column gap-2" style={{ flex: 1 }}>
            <SkeletonSeplag.Item width="55%" height="18px" />
            <SkeletonSeplag.Item width="40%" height="14px" />
          </div>
        </div>
        <SkeletonSeplag.Item width="100%" height="1px" />
        <SkeletonSeplag.Item width="80%" height="14px" />
        <SkeletonSeplag.Item width="65%" height="14px" />
        <SkeletonSeplag.Item width="70%" height="14px" />
      </SkeletonSeplag>
    ),
    code: `<SkeletonSeplag containerClassName="p-4 flex flex-column gap-3">
  <div className="flex align-items-center gap-3">
    <SkeletonSeplag.Item shape="circle" size="4rem" />
    <div className="flex flex-column gap-2" style={{ flex: 1 }}>
      <SkeletonSeplag.Item width="55%" height="18px" />
      <SkeletonSeplag.Item width="40%" height="14px" />
    </div>
  </div>
  <SkeletonSeplag.Item width="100%" height="1px" />
  <SkeletonSeplag.Item width="80%" height="14px" />
  <SkeletonSeplag.Item width="65%" height="14px" />
  <SkeletonSeplag.Item width="70%" height="14px" />
</SkeletonSeplag>`,
  },
  {
    title: "Formulário",
    description: "Simule um formulário com campos e botões de ação no rodapé.",
    example: (
      <SkeletonSeplag
        containerClassName="flex flex-column gap-3"
        style={{ width: "100%", maxWidth: 480 }}
      >
        <div className="flex flex-column gap-1">
          <SkeletonSeplag.Item width="30%" height="12px" />
          <SkeletonSeplag.Item width="100%" height="36px" borderRadius="6px" />
        </div>
        <div className="flex flex-column gap-1">
          <SkeletonSeplag.Item width="25%" height="12px" />
          <SkeletonSeplag.Item width="100%" height="36px" borderRadius="6px" />
        </div>
        <div className="flex flex-column gap-1">
          <SkeletonSeplag.Item width="35%" height="12px" />
          <SkeletonSeplag.Item width="100%" height="70px" borderRadius="6px" />
        </div>
        <div className="flex gap-2 justify-content-end">
          <SkeletonSeplag.Item width="90px" height="36px" borderRadius="6px" />
          <SkeletonSeplag.Item width="120px" height="36px" borderRadius="6px" />
        </div>
      </SkeletonSeplag>
    ),
    code: `<SkeletonSeplag containerClassName="flex flex-column gap-3">
  <div className="flex flex-column gap-1">
    <SkeletonSeplag.Item width="30%" height="12px" />
    <SkeletonSeplag.Item width="100%" height="36px" borderRadius="6px" />
  </div>
  <div className="flex flex-column gap-1">
    <SkeletonSeplag.Item width="25%" height="12px" />
    <SkeletonSeplag.Item width="100%" height="36px" borderRadius="6px" />
  </div>
  <div className="flex flex-column gap-1">
    <SkeletonSeplag.Item width="35%" height="12px" />
    <SkeletonSeplag.Item width="100%" height="70px" borderRadius="6px" />
  </div>
  <div className="flex gap-2 justify-content-end">
    <SkeletonSeplag.Item width="90px" height="36px" borderRadius="6px" />
    <SkeletonSeplag.Item width="120px" height="36px" borderRadius="6px" />
  </div>
</SkeletonSeplag>`,
  },
  {
    title: "Card com mídia",
    description:
      "Card com título no topo e bloco de imagem abaixo, típico de conteúdo com thumbnail.",
    example: (
      <div style={{ maxWidth: 320 }}>
        <SkeletonSeplag containerClassName="p-3 flex flex-column gap-2 border-round surface-100">
          <SkeletonSeplag.Item width="60%" height="16px" />
          <SkeletonSeplag.Item width="40%" height="12px" />
          <SkeletonSeplag.Item width="100%" height="140px" borderRadius="8px" />
        </SkeletonSeplag>
      </div>
    ),
    code: `<SkeletonSeplag containerClassName="p-3 flex flex-column gap-2 border-round surface-100">
  <SkeletonSeplag.Item width="60%" height="16px" />
  <SkeletonSeplag.Item width="40%" height="12px" />
  <SkeletonSeplag.Item width="100%" height="140px" borderRadius="8px" />
</SkeletonSeplag>`,
  },
];

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"skeleton-seplag"',
    required: false,
    description: "Identificador do skeleton, usado como data-testid (útil para testes aguardarem o loading sumir).",
  },
  {
    name: "variant",
    type: '"text" | "title" | "avatar" | "button" | "card" | "custom"',
    defaultValue: '"text"',
    required: false,
    description: "Preset visual aplicado ao skeleton.",
  },
  {
    name: "lines",
    type: "number",
    defaultValue: "1",
    required: false,
    description: "Quantidade de linhas renderizadas quando lines > 1.",
  },
  {
    name: "gap",
    type: "string",
    defaultValue: '"0.5rem"',
    required: false,
    description: "Espaçamento vertical entre linhas do skeleton múltiplo.",
  },
  {
    name: "containerClassName",
    type: "string",
    required: false,
    description: "Classe CSS aplicada no container externo.",
  },
  {
    name: "width",
    type: "string",
    required: false,
    description: "Largura do placeholder (prop herdada do PrimeReact Skeleton).",
  },
  {
    name: "height",
    type: "string",
    required: false,
    description: "Altura do placeholder (prop herdada do PrimeReact Skeleton).",
  },
  {
    name: "size",
    type: "string",
    required: false,
    description: "Tamanho do skeleton, útil no preset avatar.",
  },
  {
    name: "borderRadius",
    type: "string",
    required: false,
    description: "Raio da borda do skeleton.",
  },
  {
    name: "className",
    type: "string",
    required: false,
    description: "Classe CSS aplicada no elemento skeleton.",
  },
  {
    name: "children",
    type: "React.ReactNode",
    required: false,
    description:
      "Quando informado, renderiza o conteúdo children dentro do container (modo custom manual).",
  },
];

export default function SkeletonSeplagDoc() {
  return (
    <DocPage
      title="SkeletonSeplag"
      description="Componente de placeholders para estados de carregamento, com presets prontos e opções de customização para layouts específicos."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { SkeletonSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
