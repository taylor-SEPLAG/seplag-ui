import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import {
  BotaoSeplag,
  BotaoChipSeplag,
  BotaoAdicionarSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
  BotaoFecharSeplag,
  BotaoConsultarSeplag,
  BotaoLimparFiltroSeplag,
  BotaoIconSeplag,
} from "@componentes/Botao";
import "primereact/resources/themes/saga-blue/theme.css";

// ---------------------------------------------------------------------------
// Playground interativo
// ---------------------------------------------------------------------------

const VARIANT_OPTIONS = ["base", "save", "back", "clear", "icon"] as const;
const ICON_OPTIONS = [
  { label: "Nenhum", value: "" },
  { label: "pi-plus", value: "pi pi-plus" },
  { label: "pi-save", value: "pi pi-save" },
  { label: "pi-arrow-left", value: "pi pi-arrow-left" },
  { label: "pi-search", value: "pi pi-search" },
  { label: "pi-trash", value: "pi pi-trash" },
  { label: "pi-pencil", value: "pi pi-pencil" },
  { label: "pi-check", value: "pi pi-check" },
  { label: "pi-times", value: "pi pi-times" },
  { label: "pi-download", value: "pi pi-download" },
  { label: "pi-upload", value: "pi pi-upload" },
  { label: "pi-eye", value: "pi pi-eye" },
  { label: "pi-print", value: "pi pi-print" },
];
const ICONPOS_OPTIONS = ["left", "right"] as const;

function BotaoPlayground() {
  const [variant, setVariant] = useState<(typeof VARIANT_OPTIONS)[number]>("base");
  const [label, setLabel] = useState("Meu botão");
  const [icon, setIcon] = useState("");
  const [iconPos, setIconPos] = useState<"left" | "right">("left");
  const [disabled, setDisabled] = useState(false);
  const [raised, setRaised] = useState(false);
  const [rounded, setRounded] = useState(false);
  const [outlined, setOutlined] = useState(false);
  const [text, setText] = useState(false);
  const [tooltip, setTooltip] = useState("");

  const propsCode = [
    `variant="${variant}"`,
    label ? `label="${label}"` : "",
    icon ? `icon="${icon}"` : "",
    icon ? `iconPos="${iconPos}"` : "",
    disabled ? "disabled" : "",
    raised ? "raised" : "",
    rounded ? "rounded" : "",
    outlined ? "outlined" : "",
    text ? "text" : "",
    tooltip ? `tooltip="${tooltip}"` : "",
  ]
    .filter(Boolean)
    .join("\n  ");

  const generatedCode = `import { BotaoSeplag } from "@seplag/ui-lib-react-18";\n\n<BotaoSeplag\n  ${propsCode}\n/>`;

  return (
    <div className="botao-playground">
      {/* Preview */}
      <div className="botao-playground-preview">
        <BotaoSeplag
          variant={variant}
          label={variant === "icon" ? undefined : label || undefined}
          icon={icon || undefined}
          iconPos={iconPos}
          disabled={disabled}
          raised={raised}
          rounded={rounded}
          outlined={outlined}
          text={text}
          tooltip={tooltip || undefined}
        />
      </div>

      {/* Controles */}
      <div className="botao-playground-controls">
        {/* Variant */}
        <div className="pg-field">
          <span className="pg-label">variant</span>
          <div className="pg-radio-group">
            {VARIANT_OPTIONS.map((v) => (
              <label key={v} className={`pg-radio-btn${variant === v ? " selected" : ""}`}>
                <input
                  type="radio"
                  name="variant"
                  value={v}
                  checked={variant === v}
                  onChange={() => setVariant(v)}
                />
                {v}
              </label>
            ))}
          </div>
        </div>

        {/* Label */}
        {variant !== "icon" && (
          <div className="pg-field">
            <label className="pg-label" htmlFor="pg-label">
              label
            </label>
            <input
              id="pg-label"
              className="pg-input"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Texto do botão"
            />
          </div>
        )}

        {/* Icon */}
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-icon">
            icon
          </label>
          <select
            id="pg-icon"
            className="pg-select"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* iconPos */}
        {icon && variant !== "icon" && (
          <div className="pg-field">
            <span className="pg-label">iconPos</span>
            <div className="pg-radio-group">
              {ICONPOS_OPTIONS.map((p) => (
                <label key={p} className={`pg-radio-btn${iconPos === p ? " selected" : ""}`}>
                  <input
                    type="radio"
                    name="iconPos"
                    value={p}
                    checked={iconPos === p}
                    onChange={() => setIconPos(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tooltip */}
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-tooltip">
            tooltip
          </label>
          <input
            id="pg-tooltip"
            className="pg-input"
            type="text"
            value={tooltip}
            onChange={(e) => setTooltip(e.target.value)}
            placeholder="Texto do tooltip"
          />
        </div>

        {/* Booleanos */}
        <div className="pg-field">
          <span className="pg-label">modificadores</span>
          <div className="pg-checkbox-group">
            {(
              [
                ["disabled", disabled, setDisabled],
                ["raised", raised, setRaised],
                ["rounded", rounded, setRounded],
                ["outlined", outlined, setOutlined],
                ["text", text, setText],
              ] as [string, boolean, (v: boolean) => void][]
            ).map(([name, val, setter]) => (
              <label key={name} className={`pg-checkbox-btn${val ? " selected" : ""}`}>
                <input type="checkbox" checked={val} onChange={(e) => setter(e.target.checked)} />
                {name}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Código gerado */}
      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Monte o botão escolhendo as props ao vivo. O código gerado é atualizado automaticamente.",
    example: <BotaoPlayground />,
    code: `// Use o playground acima para gerar o código do seu botão`,
  },
  {
    title: "Variações",
    description:
      "Cada variante encapsula estilo, ícone e texto padrão. Todas aceitam as mesmas props do PrimeReact Button.",
    example: (
      <>
        <BotaoAdicionarSeplag />
        <BotaoSalvarSeplag />
        <BotaoVoltarSeplag />
        <BotaoFecharSeplag />
        <BotaoConsultarSeplag />
        <BotaoLimparFiltroSeplag />
        <BotaoIconSeplag icon="pi pi-trash" tooltip="Excluir" />
      </>
    ),
    code: `import {
  BotaoAdicionarSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
  BotaoFecharSeplag,
  BotaoConsultarSeplag,
  BotaoLimparFiltroSeplag,
  BotaoIconSeplag,
} from "@seplag/ui-lib-react-18";

<BotaoAdicionarSeplag />
<BotaoSalvarSeplag />
<BotaoVoltarSeplag />
<BotaoFecharSeplag />
<BotaoConsultarSeplag />
<BotaoLimparFiltroSeplag />
<BotaoIconSeplag icon="pi pi-trash" tooltip="Excluir" />`,
  },
  {
    title: "Label customizado",
    description: "Sobrescreva o label padrão via prop.",
    example: (
      <>
        <BotaoSalvarSeplag label="Confirmar" icon="pi pi-check" />
        <BotaoVoltarSeplag label="Cancelar" />
      </>
    ),
    code: `<BotaoSalvarSeplag label="Confirmar" icon="pi pi-check" />
<BotaoVoltarSeplag label="Cancelar" />`,
  },
  {
    title: "BotaoChipSeplag",
    description:
      "Botão sem estilos pré-definidos (unstyled). Ideal para criar chips, tags clicáveis ou qualquer elemento customizado que precise do comportamento de botão sem herdar o visual do PrimeReact.",
    example: (
      <BotaoChipSeplag
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 12px",
          borderRadius: 16,
          border: "1px solid #1351b4",
          color: "#1351b4",
          cursor: "pointer",
          background: "white",
        }}
      >
        <i className="pi pi-tag" />
        Chip customizado
      </BotaoChipSeplag>
    ),
    code: `import { BotaoChipSeplag } from "@seplag/ui-lib-react-18";

<BotaoChipSeplag
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 16,
    border: "1px solid #1351b4",
    color: "#1351b4",
    cursor: "pointer",
    background: "white",
  }}
>
  <i className="pi pi-tag" />
  Chip customizado
</BotaoChipSeplag>`,
  },
];

const props: DocProp[] = [
  {
    name: "label",
    type: "string",
    required: false,
    description: "Texto do botão. Cada variante possui um padrão próprio.",
  },
  {
    name: "variant",
    type: '"base" | "save" | "back" | "clear" | "icon"',
    defaultValue: '"base"',
    required: false,
    description: "Estilo visual do botão (usado internamente pelo BotaoSeplag base).",
  },
  {
    name: "hasPermission",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description:
      "Quando false, o botão não é renderizado. Útil para controle de permissões por perfil de usuário.",
  },
  {
    name: "icon",
    type: "string",
    required: false,
    description: 'Classe de ícone PrimeIcons, ex: "pi pi-plus".',
  },
  {
    name: "iconPos",
    type: '"left" | "right" | "top" | "bottom"',
    defaultValue: '"left"',
    required: false,
    description: "Posição do ícone em relação ao label.",
  },
  {
    name: "style",
    type: "React.CSSProperties",
    required: false,
    description: "Estilos CSS inline. Mesclados sobre o estilo base da variante escolhida.",
  },
  {
    name: "tooltip",
    type: "string",
    required: false,
    description: "Texto exibido ao passar o mouse sobre o botão.",
  },
  {
    name: "tooltipOptions",
    type: "TooltipOptions",
    defaultValue: '{ position: "top" }',
    required: false,
    description: "Opções do tooltip do PrimeReact. Sobrescreve o padrão position: top.",
  },
  {
    name: "onClick",
    type: "() => void",
    required: false,
    description: "Callback de clique.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Desabilita o botão.",
  },
];

const chipProps: DocProp[] = [
  {
    name: "children",
    type: "React.ReactNode",
    required: true,
    description: "Conteúdo interno do chip (texto, ícones, elementos JSX).",
  },
  {
    name: "style",
    type: "React.CSSProperties",
    required: false,
    description: "Estilos CSS inline aplicados diretamente ao botão.",
  },
  {
    name: "className",
    type: "string",
    required: false,
    description: "Classe CSS externa para estilização via stylesheet.",
  },
  {
    name: "onClick",
    type: "() => void",
    required: false,
    description: "Callback de clique.",
  },
  {
    name: "type",
    type: '"button" | "submit" | "reset"',
    defaultValue: '"button"',
    required: false,
    description: "Tipo HTML do botão.",
  },
  {
    name: "tooltip",
    type: "string",
    required: false,
    description: "Texto exibido ao passar o mouse sobre o chip.",
  },
  {
    name: "tooltipOptions",
    type: "TooltipOptions",
    defaultValue: '{ position: "top" }',
    required: false,
    description: "Opções do tooltip do PrimeReact.",
  },
];

export default function BotaoDoc() {
  return (
    <>
      <DocPage
        title="Botão"
        description="Biblioteca de botões de ação padrão SEPLAG, construída sobre o Button do PrimeReact. Cada variante encapsula estilos, ícones e comportamentos específicos, garantindo consistência visual em toda a aplicação."
        badge="Estável"
        since="v0.0.1"
        importStatement={`import { BotaoSeplag, BotaoChipSeplag } from "@seplag/ui-lib-react-18";`}
        sections={sections}
        props={props}
      />

      <DocPage
        title="BotaoChipSeplag"
        description="Botão sem estilos pré-definidos (unstyled), construído sobre o BotaoSeplag com unstyled=true. Utilize quando precisar de controle total sobre a aparência, como em chips, tags ou elementos clicáveis customizados. Preserva o suporte a hasPermission e demais funcionalidades do BotaoSeplag."
        badge="Estável"
        since="v0.0.1"
        importStatement={`import { BotaoChipSeplag } from "@seplag/ui-lib-react-18";`}
        sections={[]}
        props={chipProps}
      />
    </>
  );
}
