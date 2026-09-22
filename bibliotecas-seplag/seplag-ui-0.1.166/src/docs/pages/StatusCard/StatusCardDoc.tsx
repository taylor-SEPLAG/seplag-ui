import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { StatusCardSeplag } from "@componentes/StatusCardSeplag";
import {
  SEPLAG_ERROR_BG,
  SEPLAG_ERROR_BORDER,
  SEPLAG_ERROR_TEXT,
  SEPLAG_INFO_BG,
  SEPLAG_INFO_BORDER,
  SEPLAG_INFO_TEXT,
  SEPLAG_SUCCESS_BG,
  SEPLAG_SUCCESS_BORDER,
  SEPLAG_SUCCESS_TEXT,
  SEPLAG_WARNING_BG,
  SEPLAG_WARNING_BORDER,
  SEPLAG_WARNING_TEXT,
} from "../../../tokens/colors";
import "primereact/resources/themes/saga-blue/theme.css";

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Card de indicador numérico com rótulo, valor em destaque e cores customizadas. O componente não tem variantes internas — cabe ao consumidor resolver a paleta (color/bg/borderColor) e passar isCustomColored para aplicá-la.",
    example: (
      <div className="grid" style={{ width: "100%" }}>
        <StatusCardSeplag
          id="total"
          label="Total de Solicitações"
          value={83}
          icon="pi pi-inbox"
          color={SEPLAG_INFO_TEXT}
          bg={SEPLAG_INFO_BG}
          borderColor={SEPLAG_INFO_BORDER}
          isCustomColored
        />
      </div>
    ),
    code: `import { StatusCardSeplag } from "@seplag/ui-lib-react-18";

<StatusCardSeplag
  id="total"
  label="Total de Solicitações"
  value={83}
  icon="pi pi-inbox"
  color={SEPLAG_INFO_TEXT}
  bg={SEPLAG_INFO_BG}
  borderColor={SEPLAG_INFO_BORDER}
  isCustomColored
/>`,
  },
  {
    title: "Dashboard de totalizadores",
    description:
      "Padrão recomendado: um mapa de variante → cores resolvido pelo consumidor, um card por situação, cols=\"12 6 3\" (4 por linha) para telas grandes.",
    example: (
      <div className="grid row-gap-3" style={{ width: "100%" }}>
        <StatusCardSeplag
          id="em-fila"
          label="Em Fila"
          value={93}
          icon="pi pi-clock"
          color={SEPLAG_WARNING_TEXT}
          bg={SEPLAG_WARNING_BG}
          borderColor={SEPLAG_WARNING_BORDER}
          isCustomColored
        />
        <StatusCardSeplag
          id="em-processamento"
          label="Em Processamento"
          value={7}
          icon="pi pi-spin pi-spinner"
          color={SEPLAG_INFO_TEXT}
          bg={SEPLAG_INFO_BG}
          borderColor={SEPLAG_INFO_BORDER}
          isCustomColored
        />
        <StatusCardSeplag
          id="com-erro"
          label="Processado com Erro"
          value={22}
          icon="pi pi-times-circle"
          color={SEPLAG_ERROR_TEXT}
          bg={SEPLAG_ERROR_BG}
          borderColor={SEPLAG_ERROR_BORDER}
          isCustomColored
        />
        <StatusCardSeplag
          id="com-sucesso"
          label="Processado com Sucesso"
          value={58}
          icon="pi pi-check-circle"
          color={SEPLAG_SUCCESS_TEXT}
          bg={SEPLAG_SUCCESS_BG}
          borderColor={SEPLAG_SUCCESS_BORDER}
          isCustomColored
        />
      </div>
    ),
    code: `const VARIANT_STYLE = {
  warning: { color: SEPLAG_WARNING_TEXT, bg: SEPLAG_WARNING_BG, border: SEPLAG_WARNING_BORDER },
  info: { color: SEPLAG_INFO_TEXT, bg: SEPLAG_INFO_BG, border: SEPLAG_INFO_BORDER },
  error: { color: SEPLAG_ERROR_TEXT, bg: SEPLAG_ERROR_BG, border: SEPLAG_ERROR_BORDER },
  success: { color: SEPLAG_SUCCESS_TEXT, bg: SEPLAG_SUCCESS_BG, border: SEPLAG_SUCCESS_BORDER },
} as const;

{cards.map(({ id, label, value, icon, variant }) => {
  const s = VARIANT_STYLE[variant];
  return (
    <StatusCardSeplag
      key={id}
      id={id}
      label={label}
      value={value}
      icon={icon}
      color={s.color}
      bg={s.bg}
      borderColor={s.border}
      isCustomColored
    />
  );
})}`,
  },
  {
    title: "Clicável (filtro por card)",
    description:
      'Quando onClick é passado, o elemento raiz vira <button>. Combinado com active, dá o padrão de "card-filtro": clicar destaca o card e filtra a listagem abaixo pela situação correspondente.',
    example: (
      <div className="grid" style={{ width: "100%" }}>
        <StatusCardSeplag
          id="ativo"
          label="Selecionado"
          value={12}
          icon="pi pi-check"
          color={SEPLAG_INFO_TEXT}
          bg={SEPLAG_INFO_BG}
          borderColor={SEPLAG_INFO_BORDER}
          isCustomColored
          active
          onClick={() => undefined}
        />
      </div>
    ),
    code: `<StatusCardSeplag
  id="ativo"
  label="Selecionado"
  value={12}
  color={SEPLAG_INFO_TEXT}
  bg={SEPLAG_INFO_BG}
  borderColor={SEPLAG_INFO_BORDER}
  isCustomColored
  active={selectedStatus === "ativo"}
  onClick={() => setSelectedStatus("ativo")}
/>`,
  },
  {
    title: "Ícone com cores independentes",
    description:
      "iconColor/iconBg permitem um quadrado de ícone com paleta diferente da do texto/borda do card — útil quando o ícone precisa se destacar mais do fundo pastel do card.",
    example: (
      <div className="grid" style={{ width: "100%" }}>
        <StatusCardSeplag
          id="destaque"
          label="Ícone destacado"
          value={190}
          icon="pi pi-star"
          color={SEPLAG_SUCCESS_TEXT}
          bg={SEPLAG_SUCCESS_BG}
          borderColor={SEPLAG_SUCCESS_BORDER}
          iconColor="#ffffff"
          iconBg={SEPLAG_SUCCESS_TEXT}
          isCustomColored
        />
      </div>
    ),
    code: `<StatusCardSeplag
  id="destaque"
  label="Ícone destacado"
  value={190}
  icon="pi pi-star"
  color={SEPLAG_SUCCESS_TEXT}
  bg={SEPLAG_SUCCESS_BG}
  borderColor={SEPLAG_SUCCESS_BORDER}
  iconColor="#ffffff"
  iconBg={SEPLAG_SUCCESS_TEXT}
  isCustomColored
/>`,
  },
];

const props: DocProp[] = [
  { name: "id", type: "string", required: true, description: 'Prefixo da classe "stat-${id}" e do target do Tooltip.' },
  { name: "label", type: "string", required: true, description: "Rótulo pequeno acima do valor." },
  { name: "value", type: "number | string", required: true, description: "Valor em destaque." },
  { name: "color", type: "string", required: true, description: "Cor do texto/ícone/borda quando isCustomColored." },
  {
    name: "bg",
    type: "string",
    required: true,
    description: "Cor de fundo quando isCustomColored ou active; também fallback do fundo do ícone.",
  },
  {
    name: "icon",
    type: "string",
    required: false,
    description: 'Classe PrimeIcons (ex: "pi pi-inbox"). Sem ela, o quadrado de ícone não é renderizado.',
  },
  { name: "iconColor", type: "string", defaultValue: "color", required: false, description: "Cor do ícone, independente da cor do texto." },
  { name: "iconBg", type: "string", defaultValue: "bg", required: false, description: "Fundo do quadrado do ícone, independente do fundo do card." },
  {
    name: "borderColor",
    type: "string",
    required: false,
    description: "Cor da borda (completa quando isCustomColored, sempre presente na borda esquerda).",
  },
  { name: "tooltip", type: "string", required: false, description: "Texto do Tooltip do PrimeReact." },
  {
    name: "active",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Fundo colorido mesmo sem isCustomColored, borda esquerda mais grossa, boxShadow e leve scale — estado de card selecionado.",
  },
  { name: "onClick", type: "() => void", required: false, description: "Torna o card um <button> clicável." },
  {
    name: "isCustomColored",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Aplica bg/color/borderColor mesmo sem active; sem isso o card fica com fundo branco padrão (surface-card).",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12 6 3"',
    required: false,
    description: 'String "col md:col lg:col" — 4 cards por linha em telas grandes por padrão.',
  },
  {
    name: "fill",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Ignora cols; use quando o elemento pai já controla o layout diretamente. Ver StatusCardGroupSeplag para distribuir N cards com largura igual.",
  },
];

export default function StatusCardDoc() {
  return (
    <DocPage
      title="StatusCardSeplag"
      description="Card de indicador numérico com rótulo, ícone opcional e variante de cor — usado em dashboards de resumo/totalizadores no topo de telas de listagem (contadores por situação, quantitativos por categoria)."
      badge="Estável"
      since="v0.1.123"
      importStatement={`import { StatusCardSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
