import { BadgeSeplag } from "@componentes/Badge";
import "primereact/resources/themes/saga-blue/theme.css";
import { useState } from "react";
import { DocPage, PlaygroundCode, type DocProp, type DocSection } from "../../components/DocPage";

// ---------------------------------------------------------------------------
// Playground interativo
// ---------------------------------------------------------------------------

const SIZE_OPTIONS = ["xs", "sm", "md"] as const;
const ICON_OPTIONS = [
  { label: "Nenhum", value: "" },
  { label: "pi-clock", value: "pi pi-clock" },
  { label: "pi-check-circle", value: "pi pi-check-circle" },
  { label: "pi-times-circle", value: "pi pi-times-circle" },
  { label: "pi-exclamation-triangle", value: "pi pi-exclamation-triangle" },
  { label: "pi-info-circle", value: "pi pi-info-circle" },
  { label: "pi-tag", value: "pi pi-tag" },
  { label: "pi-user", value: "pi pi-user" },
  { label: "pi-calendar", value: "pi pi-calendar" },
  { label: "pi-star", value: "pi pi-star" },
];

const VARIANT_OPTIONS = ["success", "warning", "error", "info", "neutral"] as const;

const STATUS_VARIANT_GUIDE = [
  { status: "Disponível", variant: "info", uso: "Listagens de grupos/itens prontos para vínculo." },
  { status: "Vinculado", variant: "success", uso: "Entidade já vinculada ou ativa no fluxo." },
  { status: "Adicionado", variant: "info", uso: "Item incluído manualmente na sessão/lista." },
  { status: "Ativo", variant: "success", uso: "Estado operacional positivo." },
  { status: "Inativo", variant: "neutral", uso: "Estado sem ação, sem erro." },
  { status: "Encerrado", variant: "neutral", uso: "Ciclo concluído sem falha." },
  { status: "Agendado", variant: "warning", uso: "Ação futura/pendente de execução." },
  { status: "Pendente", variant: "warning", uso: "Aguardando análise, decisão ou processamento." },
  { status: "Extinto", variant: "error", uso: "Estado final impeditivo ou descontinuado." },
  { status: "Devolvido", variant: "error", uso: "Retornado para correção/ajuste." },
  { status: "Concluído", variant: "success", uso: "Processo finalizado com sucesso." },
  {
    status: "Vantagem",
    variant: "success",
    uso: "Tipo de rubrica classificado como provento/vantagem.",
  },
  { status: "Desconto", variant: "error", uso: "Tipo de rubrica de desconto." },
  { status: "Auxiliar", variant: "info", uso: "Tipo de rubrica auxiliar." },
] as const;

function parseCustomStyleInput(input: string): React.CSSProperties | undefined {
  try {
    return input ? (JSON.parse(input) as React.CSSProperties) : undefined;
  } catch {
    return undefined;
  }
}

function BadgePlayground() {
  const [label, setLabel] = useState("Em andamento");
  const [icon, setIcon] = useState("pi pi-clock");
  const [customIcon, setCustomIcon] = useState("");
  const [size, setSize] = useState<(typeof SIZE_OPTIONS)[number]>("sm");
  const [variant, setVariant] = useState<(typeof VARIANT_OPTIONS)[number]>("info");
  const [active, setActive] = useState(false);
  const [clickable, setClickable] = useState(false);
  const [tooltip, setTooltip] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom" | "left" | "right">(
    "top",
  );
  const [minWidth, setMinWidth] = useState("");
  const [maxWidth, setMaxWidth] = useState("");
  const [bold, setBold] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "">("");
  const [customStyleInput, setCustomStyleInput] = useState("");

  const TOOLTIP_POSITIONS = ["top", "bottom", "left", "right"] as const;
  const resolvedIcon = customIcon || icon || "";

  const customStyle = parseCustomStyleInput(customStyleInput);

  const propsCode = [
    `label="${label}"`,
    resolvedIcon ? `icon="${resolvedIcon}"` : "",
    `variant="${variant}"`,
    size !== "sm" ? `size="${size}"` : "",
    active ? "active" : "",
    clickable ? 'onClick={() => alert("clicado!")}' : "",
    tooltip ? `tooltip="${tooltip}"` : "",
    tooltip && tooltipPosition !== "top" ? `tooltipPosition="${tooltipPosition}"` : "",
    minWidth ? `minWidth="${minWidth}"` : "",
    maxWidth ? `maxWidth="${maxWidth}"` : "",
    bold ? "fontWeight" : "",
    uppercase ? "uppercase" : "",
    textAlign ? `textAlign="${textAlign}"` : "",
    customStyleInput ? `customStyle={${customStyleInput}}` : "",
  ]
    .filter(Boolean)
    .join("\n  ");

  const generatedCode = `import { BadgeSeplag } from "@seplag/ui-lib-react-18";\n\n<BadgeSeplag\n  ${propsCode}\n/>`;

  return (
    <div className="botao-playground">
      {/* Preview */}
      <div className="botao-playground-preview">
        <BadgeSeplag
          label={label}
          icon={resolvedIcon || undefined}
          variant={variant}
          size={size}
          active={active}
          onClick={clickable ? () => undefined : undefined}
          tooltip={tooltip || undefined}
          tooltipPosition={tooltipPosition}
          minWidth={minWidth || undefined}
          maxWidth={maxWidth || undefined}
          fontWeight={bold}
          uppercase={uppercase}
          textAlign={textAlign || undefined}
          customStyle={customStyle}
        />
      </div>

      {/* Controles */}
      <div className="botao-playground-controls">
        {/* Label */}
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-badge-label">
            label
          </label>
          <input
            id="pg-badge-label"
            className="pg-input"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Texto do badge"
          />
        </div>

        {/* Icon */}
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-badge-icon">
            icon
          </label>
          <select
            id="pg-badge-icon"
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

        {/* Custom Icon */}
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-badge-custom-icon">
            icon customizado
          </label>
          <input
            id="pg-badge-custom-icon"
            className="pg-input"
            type="text"
            value={customIcon}
            onChange={(e) => setCustomIcon(e.target.value)}
            placeholder="ex: fa-solid fa-check"
          />
        </div>

        {/* Variant */}
        <div className="pg-field">
          <span className="pg-label">variant</span>
          <div className="pg-radio-group">
            {VARIANT_OPTIONS.map((value) => (
              <label key={value} className={`pg-radio-btn${variant === value ? " selected" : ""}`}>
                <input
                  type="radio"
                  name="badge-variant"
                  checked={variant === value}
                  onChange={() => setVariant(value)}
                />
                {value}
              </label>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="pg-field">
          <span className="pg-label">size</span>
          <div className="pg-radio-group">
            {SIZE_OPTIONS.map((s) => (
              <label key={s} className={`pg-radio-btn${size === s ? " selected" : ""}`}>
                <input
                  type="radio"
                  name="badge-size"
                  value={s}
                  checked={size === s}
                  onChange={() => setSize(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Booleanos */}
        <div className="pg-field">
          <span className="pg-label">modificadores</span>
          <div className="pg-checkbox-group">
            {(
              [
                ["active", active, setActive],
                ["clickable (onClick)", clickable, setClickable],
                ["bold (fontWeight)", bold, setBold],
                ["uppercase", uppercase, setUppercase],
              ] as [string, boolean, (v: boolean) => void][]
            ).map(([name, val, setter]) => (
              <label key={name} className={`pg-checkbox-btn${val ? " selected" : ""}`}>
                <input type="checkbox" checked={val} onChange={(e) => setter(e.target.checked)} />
                {name}
              </label>
            ))}
          </div>
        </div>

        {/* Dimensões */}
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-badge-minwidth">
            minWidth
          </label>
          <input
            id="pg-badge-minwidth"
            className="pg-input"
            type="text"
            value={minWidth}
            onChange={(e) => setMinWidth(e.target.value)}
            placeholder="ex: 100px ou 10rem"
          />
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-badge-maxwidth">
            maxWidth
          </label>
          <input
            id="pg-badge-maxwidth"
            className="pg-input"
            type="text"
            value={maxWidth}
            onChange={(e) => setMaxWidth(e.target.value)}
            placeholder="ex: 200px ou 20rem"
          />
        </div>

        {/* Text Align */}
        <div className="pg-field">
          <span className="pg-label">textAlign</span>
          <div className="pg-radio-group">
            {(["left", "center", "right", ""] as const).map((align) => (
              <label
                key={align || "none"}
                className={`pg-radio-btn${textAlign === align ? " selected" : ""}`}
              >
                <input
                  type="radio"
                  name="badge-align"
                  checked={textAlign === align}
                  onChange={() => setTextAlign(align)}
                />
                {align || "padrão"}
              </label>
            ))}
          </div>
        </div>
        {/* Tooltip */}
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-badge-tooltip">
            tooltip
          </label>
          <input
            id="pg-badge-tooltip"
            className="pg-input"
            type="text"
            value={tooltip}
            onChange={(e) => setTooltip(e.target.value)}
            placeholder="Texto do tooltip"
          />
        </div>

        {tooltip && (
          <div className="pg-field">
            <span className="pg-label">tooltipPosition</span>
            <div className="pg-radio-group">
              {TOOLTIP_POSITIONS.map((p) => (
                <label
                  key={p}
                  className={`pg-radio-btn${tooltipPosition === p ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="badge-tooltip-pos"
                    value={p}
                    checked={tooltipPosition === p}
                    onChange={() => setTooltipPosition(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Custom Style */}
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-badge-customstyle">
            customStyle (JSON)
          </label>
          <textarea
            id="pg-badge-customstyle"
            className="pg-input"
            style={{
              minHeight: "80px",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
            value={customStyleInput}
            onChange={(e) => setCustomStyleInput(e.target.value)}
            placeholder={'{"borderRadius": "8px", "padding": "10px 20px"}'}
          />
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
    title: "Matriz oficial de status",
    description:
      "Use este mapeamento como referência única entre texto de status e variant. Em caso de novo status, siga a semântica de negócio mais próxima e registre aqui.",
    example: (
      <div style={{ display: "grid", gap: 10 }}>
        {STATUS_VARIANT_GUIDE.map((item) => (
          <div
            key={item.status}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 110px 1fr",
              alignItems: "center",
              gap: 12,
            }}
          >
            <BadgeSeplag label={item.status} variant={item.variant} size="sm" minWidth={140} />
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
              {`variant: ${item.variant}`}
            </span>
            <span style={{ fontSize: "0.82rem", color: "#334155" }}>{item.uso}</span>
          </div>
        ))}
      </div>
    ),
    code: `const STATUS_VARIANT_MAP = {
  DISPONIVEL: "info",
  VINCULADO: "success",
  ADICIONADO: "info",
  ATIVO: "success",
  INATIVO: "neutral",
  ENCERRADO: "neutral",
  AGENDADO: "warning",
  PENDENTE: "warning",
  EXTINTO: "error",
  DEVOLVIDO: "error",
  CONCLUIDO: "success",
  VANTAGEM: "success",
  DESCONTO: "error",
  AUXILIAR: "info",
} as const;`,
  },
  {
    title: "Padrão recomendado",
    description:
      "Nos sistemas consumidores, use BadgeSeplag com variant semântico. Evite controlar cores por color/bg/border diretamente no projeto, deixando a gestão visual centralizada na biblioteca.",
    example: (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <BadgeSeplag label="Ativo" variant="success" />
        <BadgeSeplag label="Encerrado" variant="neutral" />
        <BadgeSeplag label="Agendado" variant="warning" />
        <BadgeSeplag label="Inativo" variant="neutral" />
        <BadgeSeplag label="Extinto" variant="error" />
      </div>
    ),
    code: `<BadgeSeplag label="Ativo" variant="success" />
<BadgeSeplag label="Encerrado" variant="neutral" />
<BadgeSeplag label="Agendado" variant="warning" />
<BadgeSeplag label="Inativo" variant="neutral" />
<BadgeSeplag label="Extinto" variant="error" />`,
  },
  {
    title: "Playground",
    description:
      "Monte o badge escolhendo as props ao vivo. O código gerado é atualizado automaticamente.",
    example: <BadgePlayground />,
    code: "// Use o playground acima para gerar o código do seu badge",
  },
  {
    title: "Variações semânticas",
    description: "Use variant para representar significado visual sem controlar cores manualmente.",
    example: (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <BadgeSeplag label="Ativo" variant="success" />
        <BadgeSeplag label="Inativo" variant="neutral" />
        <BadgeSeplag label="Pendente" icon="pi pi-clock" variant="warning" />
        <BadgeSeplag label="Análise" icon="pi pi-info-circle" variant="info" />
        <BadgeSeplag label="Extinto" variant="error" />
      </div>
    ),
    code: `<BadgeSeplag label="Ativo" variant="success" />
<BadgeSeplag label="Inativo" variant="neutral" />
<BadgeSeplag label="Pendente" icon="pi pi-clock" variant="warning" />
<BadgeSeplag label="Análise" icon="pi pi-info-circle" variant="info" />
<BadgeSeplag label="Extinto" variant="error" />`,
  },
  {
    title: "Tamanhos",
    description: "Três tamanhos disponíveis: xs, sm (padrão) e md.",
    example: (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <BadgeSeplag label="xs" size="xs" variant="info" />
        <BadgeSeplag label="sm" size="sm" variant="info" />
        <BadgeSeplag label="md" size="md" variant="info" />
      </div>
    ),
    code: `<BadgeSeplag label="xs" size="xs" variant="info" />
<BadgeSeplag label="sm" size="sm" variant="info" />
<BadgeSeplag label="md" size="md" variant="info" />`,
  },
  {
    title: "Estado ativo",
    description:
      "Quando active=true, aplica destaque visual. Use variant como base semântica para filtros selecionados.",
    example: (
      <div style={{ display: "flex", gap: 8 }}>
        <BadgeSeplag label="Inativo" variant="info" active={false} />
        <BadgeSeplag label="Ativo" variant="info" active={true} />
      </div>
    ),
    code: `{/* Inativo */}
<BadgeSeplag label="Inativo" variant="info" active={false} />

{/* Ativo — fundo sólido */}
<BadgeSeplag label="Ativo" variant="info" active={true} />`,
  },
  {
    title: "Clicável",
    description:
      "Quando onClick é fornecido, o badge é renderizado como <button> via BotaoChipSeplag (cursor pointer, acessível).",
    example: (
      <BadgeSeplag
        label="Clique aqui"
        icon="pi pi-filter"
        variant="success"
        onClick={() => undefined}
      />
    ),
    code: `<BadgeSeplag
  label="Clique aqui"
  icon="pi pi-filter"
  variant="success"
  onClick={() => handleFiltro()}
/>`,
  },
  {
    title: "Tooltip",
    description:
      "Use tooltip para exibir um texto ao passar o mouse. tooltipPosition controla a direção (padrão: top). Funciona tanto em badges estáticos quanto clicáveis.",
    example: (
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <BadgeSeplag label="Padrão (top)" variant="info" tooltip="Tooltip acima" />
        <BadgeSeplag
          label="Abaixo"
          variant="success"
          tooltip="Tooltip abaixo"
          tooltipPosition="bottom"
        />
        <BadgeSeplag
          label="Esquerda"
          variant="warning"
          tooltip="Tooltip à esquerda"
          tooltipPosition="left"
        />
        <BadgeSeplag
          label="Direita"
          variant="neutral"
          tooltip="Tooltip à direita"
          tooltipPosition="right"
        />
        <BadgeSeplag
          label="Clicável"
          variant="error"
          tooltip="Badge clicável com tooltip"
          onClick={() => undefined}
        />
      </div>
    ),
    code: `{/* Estático */}
<BadgeSeplag label="Padrão" variant="info" tooltip="Tooltip acima" />
<BadgeSeplag label="Abaixo" variant="success" tooltip="Tooltip abaixo" tooltipPosition="bottom" />

{/* Clicável */}
<BadgeSeplag label="Clicável" variant="error" tooltip="Tooltip" onClick={() => handleClick()} />`,
  },
  {
    title: "Texto em maiúsculo",
    description:
      "Use uppercase para renderizar o label em caixa alta. Por padrão, uppercase é false e o texto mantém a capitalização original.",
    example: (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <BadgeSeplag label="Ativo" variant="success" />
        <BadgeSeplag label="Ativo" variant="success" uppercase />
      </div>
    ),
    code: `<BadgeSeplag label="Ativo" variant="success" />
<BadgeSeplag label="Ativo" variant="success" uppercase />`,
  },
  {
    title: "Dimensões e alinhamento",
    description:
      "Use minWidth/maxWidth para controlar o tamanho, fontWeight para texto negrito, e textAlign para alinhar o conteúdo.",
    example: (
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <BadgeSeplag label="Mínimo 120px" variant="info" minWidth="120px" />
        <BadgeSeplag label="Máximo 100px" variant="success" maxWidth="100px" />
        <BadgeSeplag label="Negrito" variant="error" fontWeight />
        <BadgeSeplag
          label="Alinhado à direita"
          variant="warning"
          textAlign="right"
          minWidth="150px"
        />
      </div>
    ),
    code: `<BadgeSeplag label="Mínimo 120px" variant="info" minWidth="120px" />
<BadgeSeplag label="Máximo 100px" variant="success" maxWidth="100px" />
<BadgeSeplag label="Negrito" variant="error" fontWeight />
<BadgeSeplag label="Alinhado à direita" variant="warning" textAlign="right" minWidth="150px" />`,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    required: false,
    description:
      "Identificador HTML do elemento raiz, também usado como data-testid (e para gerar o id do botão de remover, quando removable). Quando omitido, um id único é gerado automaticamente via useId().",
  },
  {
    name: "label",
    type: "string",
    required: true,
    description: "Texto exibido no badge.",
  },
  {
    name: "variant",
    type: '"success" | "warning" | "error" | "info" | "neutral"',
    defaultValue: '"neutral"',
    required: false,
    description: "Variante semântica recomendada para padronização visual de status.",
  },
  {
    name: "color",
    type: "string",
    required: false,
    description:
      "Sobrescrita manual de cor (legado). Prefira variant para manter o padrão da biblioteca.",
  },
  {
    name: "bg",
    type: "string",
    required: false,
    description:
      "Sobrescrita manual de fundo (legado). Prefira variant para manter o padrão da biblioteca.",
  },
  {
    name: "icon",
    type: "string",
    required: false,
    description: 'Classe de ícone PrimeIcons exibida à esquerda do texto (ex: "pi pi-clock").',
  },
  {
    name: "border",
    type: "string",
    required: false,
    description: "Sobrescrita manual de borda (legado). Em geral, use a borda do variant.",
  },
  {
    name: "size",
    type: '"xs" | "sm" | "md"',
    defaultValue: '"sm"',
    required: false,
    description: "Tamanho do badge. Controla padding e tamanho da fonte.",
  },
  {
    name: "active",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Quando true, aplica activeBg como fundo sólido e activeColor como texto.",
  },
  {
    name: "activeBg",
    type: "string",
    required: false,
    description: "Cor de fundo quando active=true.",
  },
  {
    name: "activeColor",
    type: "string",
    defaultValue: '"#ffffff"',
    required: false,
    description: "Cor do texto quando active=true.",
  },
  {
    name: "onClick",
    type: "() => void",
    required: false,
    description:
      "Quando fornecido, o badge é renderizado como <button> (BotaoChipSeplag). Caso contrário, renderiza como <span>.",
  },
  {
    name: "tooltip",
    type: "string",
    required: false,
    description: "Texto exibido ao passar o mouse sobre o badge.",
  },
  {
    name: "tooltipPosition",
    type: '"top" | "bottom" | "left" | "right"',
    defaultValue: '"top"',
    required: false,
    description: "Direção do tooltip.",
  },
  {
    name: "minWidth",
    type: "string | number",
    required: false,
    description: 'Largura mínima do badge (ex: "100px" ou 100).',
  },
  {
    name: "maxWidth",
    type: "string | number",
    required: false,
    description: 'Largura máxima do badge (ex: "200px" ou 200).',
  },
  {
    name: "fontWeight",
    type: "boolean",
    required: false,
    description: "Quando true, aplica fontWeight 700 (negrito). Padrão é 500.",
  },
  {
    name: "uppercase",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Quando true, renderiza o label em caixa alta (toUpperCase).",
  },
  {
    name: "textAlign",
    type: '"left" | "center" | "right"',
    required: false,
    description: "Alinhamento do texto dentro do badge.",
  },
  {
    name: "customStyle",
    type: "React.CSSProperties",
    required: false,
    description:
      "Objeto com propriedades CSS customizadas que serão aplicadas e podem sobrescrever outras propriedades.",
  },
];

export default function BadgeDoc() {
  return (
    <DocPage
      title="Badge"
      description="Componente de badge/chip visual para exibição de status, categorias e filtros. O padrão recomendado é usar variant semântico (success, warning, error, info, neutral), evitando cores manuais no sistema consumidor."
      badge="Estável"
      since="v0.0.1"
      importStatement={'import { BadgeSeplag } from "@seplag/ui-lib-react-18";'}
      sections={sections}
      props={props}
    />
  );
}
