import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { MensagemSeplag, type MensagemSeveritySeplag } from "@componentes/Mensagem";
import "primereact/resources/themes/saga-blue/theme.css";

const SEVERITIES: MensagemSeveritySeplag[] = ["success", "info", "warning", "error"];

function MensagemPlayground() {
  const [severity, setSeverity] = useState<MensagemSeveritySeplag>("success");
  const [message, setMessage] = useState("Operação realizada com sucesso!");
  const [icon, setIcon] = useState("");
  const [visible, setVisible] = useState(true);

  const effectiveIcon = icon.trim() || undefined;

  const propsLines = [
    `  severity="${severity}"`,
    `  message="${message}"`,
    ...(effectiveIcon ? [`  icon="${effectiveIcon}"`] : []),
    ...(visible ? [] : [`  visible={false}`]),
  ];

  const code = `<MensagemSeplag\n${propsLines.join("\n")}\n/>`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview">
        <MensagemSeplag
          severity={severity}
          message={message}
          icon={effectiveIcon}
          visible={visible}
        />
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <span className="pg-label">severity</span>
          <div className="pg-radio-group">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                className={`pg-radio-btn${severity === s ? " selected" : ""}`}
                onClick={() => setSeverity(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="pg-field">
          <span className="pg-label">message</span>
          <input
            className="pg-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        <div className="pg-field">
          <span className="pg-label">icon</span>
          <input
            className="pg-input"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="ex: pi pi-box"
          />
        </div>

        <div className="pg-field">
          <span className="pg-label">visible</span>
          <div className="pg-checkbox-group">
            <button
              className={`pg-checkbox-btn${visible ? " selected" : ""}`}
              onClick={() => setVisible((v) => !v)}
            >
              visible
            </button>
          </div>
        </div>
      </div>

      <PlaygroundCode code={code} />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Experimente as props em tempo real.",
    example: <MensagemPlayground />,
    code: `import { MensagemSeplag } from "@seplag/ui-lib-react-18";

<MensagemSeplag severity="success" message="Operação realizada com sucesso!" />`,
  },
  {
    title: "Severidades",
    description: "Quatro variações visuais para comunicar diferentes tipos de mensagem ao usuário.",
    example: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <MensagemSeplag severity="success" message="Operação realizada com sucesso!" />
        <MensagemSeplag severity="info" message="Atenção: esta ação é irreversível." />
        <MensagemSeplag severity="warning" message="Verifique os dados antes de prosseguir." />
        <MensagemSeplag severity="error" message="Ocorreu um erro. Tente novamente." />
      </div>
    ),
    code: `import { MensagemSeplag } from "@seplag/ui-lib-react-18";

<MensagemSeplag severity="success" message="Operação realizada com sucesso!" />
<MensagemSeplag severity="info"    message="Atenção: esta ação é irreversível." />
<MensagemSeplag severity="warning" message="Verifique os dados antes de prosseguir." />
<MensagemSeplag severity="error"   message="Ocorreu um erro. Tente novamente." />`,
  },
  {
    title: "Controle de visibilidade",
    description:
      "A prop visible controla se a mensagem é renderizada. Útil para exibição condicional pós-submit.",
    example: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <MensagemSeplag severity="success" message="Visível: true" visible={true} />
        <MensagemSeplag severity="warning" message="Nunca aparece" visible={false} />
      </div>
    ),
    code: `const [saved, setSaved] = useState(false);

<MensagemSeplag
  severity="success"
  message="Registro salvo com sucesso!"
  visible={saved}
/>`,
  },
  {
    title: "Ícone customizado",
    description: "Substitua o ícone padrão por qualquer classe PrimeIcons.",
    example: (
      <MensagemSeplag
        severity="info"
        message="Novo componente disponível na biblioteca."
        icon="pi pi-box"
      />
    ),
    code: `<MensagemSeplag
  severity="info"
  message="Novo componente disponível na biblioteca."
  icon="pi pi-box"
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"mensagem-seplag"',
    required: false,
    description: "Identificador do container da mensagem, usado como data-testid.",
  },
  {
    name: "message",
    type: "string",
    required: true,
    description: "Texto da mensagem exibida (ou HTML quando allowHtml=true).",
  },
  {
    name: "allowHtml",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Quando true, permite renderizar tags HTML presentes na prop message.",
  },
  {
    name: "severity",
    type: '"warning" | "info" | "error" | "success"',
    defaultValue: '"warning"',
    required: false,
    description: "Paleta de cores e ícone padrão da mensagem.",
  },
  {
    name: "visible",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Quando false, o componente não é renderizado.",
  },
  {
    name: "icon",
    type: "string",
    required: false,
    description: "Classe PrimeIcons para substituir o ícone padrão de cada severidade.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12"',
    required: false,
    description: "Largura via grid SEPLAG (1–12).",
  },
  {
    name: "style",
    type: "CSSProperties",
    required: false,
    description: "Estilos inline aplicados ao container da mensagem.",
  },
];

export default function MensagemDoc() {
  return (
    <DocPage
      title="Mensagem"
      description="Componente de alerta inline SEPLAG para feedback ao usuário. Suporta quatro severidades com cores, bordas e ícones semânticos pré-configurados."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { MensagemSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
