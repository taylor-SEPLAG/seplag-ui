import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import "primereact/resources/themes/saga-blue/theme.css";
import {
  SEPLAG_PRIMARY,
  SEPLAG_PRIMARY_DARK,
  SEPLAG_PRIMARY_LIGHT,
  SEPLAG_SECONDARY,
  SEPLAG_SECONDARY_DARK,
  SEPLAG_SECONDARY_LIGHT,
  SEPLAG_SUCCESS,
  SEPLAG_WARNING,
  SEPLAG_DANGER,
  SEPLAG_INFO,
  SEPLAG_WARNING_BG,
  SEPLAG_WARNING_BORDER,
  SEPLAG_WARNING_TEXT,
  SEPLAG_INFO_BG,
  SEPLAG_INFO_BORDER,
  SEPLAG_INFO_TEXT,
  SEPLAG_ERROR_BG,
  SEPLAG_ERROR_BORDER,
  SEPLAG_ERROR_TEXT,
  SEPLAG_SUCCESS_BG,
  SEPLAG_SUCCESS_BORDER,
  SEPLAG_SUCCESS_TEXT,
  SEPLAG_WHITE,
  SEPLAG_BLACK,
  SEPLAG_GRAY_100,
  SEPLAG_GRAY_200,
  SEPLAG_GRAY_400,
  SEPLAG_GRAY_600,
  SEPLAG_GRAY_800,
  SEPLAG_BORDER_LIGHT,
  SEPLAG_PURPLE,
  SEPLAG_TEAL,
  ESTEIRA_SOLICITACAO,
  ESTEIRA_ANALISE_DOCUMENTAL,
  ESTEIRA_PARECER_JURIDICO,
  ESTEIRA_CRIACAO,
  ESTEIRA_TESTES,
  ESTEIRA_APROVACAO_FINAL,
} from "../../../tokens/colors";

function Swatch({ label, color }: Readonly<{ label: string; color: string }>) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 64,
          height: 32,
          background: color,
          borderRadius: 4,
          border: "1px solid #ddd",
        }}
      />
      <div>
        <div style={{ fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#555" }}>{color}</div>
      </div>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Cores do Design System",
    description:
      "Tokens de cor centrais usados pelos componentes. Importe de `src/tokens/colors` quando precisar usar cores diretamente.",
    example: (
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        <Swatch label="Primary" color={SEPLAG_PRIMARY} />
        <Swatch label="Primary Dark" color={SEPLAG_PRIMARY_DARK} />
        <Swatch label="Primary Light" color={SEPLAG_PRIMARY_LIGHT} />
        <Swatch label="Secondary" color={SEPLAG_SECONDARY} />
        <Swatch label="Secondary Dark" color={SEPLAG_SECONDARY_DARK} />
        <Swatch label="Secondary Light" color={SEPLAG_SECONDARY_LIGHT} />
        <Swatch label="Success" color={SEPLAG_SUCCESS} />
        <Swatch label="Warning" color={SEPLAG_WARNING} />
        <Swatch label="Danger" color={SEPLAG_DANGER} />
        <Swatch label="Info" color={SEPLAG_INFO} />
      </div>
    ),
    code: `import { SEPLAG_PRIMARY } from "@seplag/ui-lib-react-18/src/tokens/colors";`,
  },
  {
    title: "Neutras",
    description: "Tons de cinza usados para fundo, bordas e textos secundários.",
    example: (
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        <Swatch label="White" color={SEPLAG_WHITE} />
        <Swatch label="Black" color={SEPLAG_BLACK} />
        <Swatch label="Gray 100" color={SEPLAG_GRAY_100} />
        <Swatch label="Gray 200" color={SEPLAG_GRAY_200} />
        <Swatch label="Gray 400" color={SEPLAG_GRAY_400} />
        <Swatch label="Gray 600" color={SEPLAG_GRAY_600} />
        <Swatch label="Gray 800" color={SEPLAG_GRAY_800} />
        <Swatch label="Border Light" color={SEPLAG_BORDER_LIGHT} />
      </div>
    ),
    code: `import { SEPLAG_GRAY_100 } from "@seplag/ui-lib-react-18/src/tokens/colors";`,
  },
  {
    title: "Severity tokens",
    description: "Tokens auxiliares para estados: background, border e text.",
    example: (
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        <Swatch label="Warning BG" color={SEPLAG_WARNING_BG} />
        <Swatch label="Warning Border" color={SEPLAG_WARNING_BORDER} />
        <Swatch label="Warning Text" color={SEPLAG_WARNING_TEXT} />

        <Swatch label="Info BG" color={SEPLAG_INFO_BG} />
        <Swatch label="Info Border" color={SEPLAG_INFO_BORDER} />
        <Swatch label="Info Text" color={SEPLAG_INFO_TEXT} />

        <Swatch label="Error BG" color={SEPLAG_ERROR_BG} />
        <Swatch label="Error Border" color={SEPLAG_ERROR_BORDER} />
        <Swatch label="Error Text" color={SEPLAG_ERROR_TEXT} />

        <Swatch label="Success BG" color={SEPLAG_SUCCESS_BG} />
        <Swatch label="Success Border" color={SEPLAG_SUCCESS_BORDER} />
        <Swatch label="Success Text" color={SEPLAG_SUCCESS_TEXT} />
      </div>
    ),
    code: `// Severity tokens: SEPLAG_WARNING_BG, SEPLAG_WARNING_BORDER, SEPLAG_WARNING_TEXT`,
  },
  {
    title: "Complementares",
    description: "Cores auxiliares para casos especiais e destaques.",
    example: (
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        <Swatch label="Purple" color={SEPLAG_PURPLE} />
        <Swatch label="Teal" color={SEPLAG_TEAL} />
      </div>
    ),
    code: `import { SEPLAG_PURPLE, SEPLAG_TEAL } from "@seplag/ui-lib-react-18/src/tokens/colors";`,
  },
  {
    title: "Cores de Esteira (Workflow)",
    description:
      "Tokens para visualização de fluxos de trabalho, processos e esteiras de aprovação.",
    example: (
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        <Swatch label="Solicitação" color={ESTEIRA_SOLICITACAO} />
        <Swatch label="Análise Documental" color={ESTEIRA_ANALISE_DOCUMENTAL} />
        <Swatch label="Parecer Jurídico" color={ESTEIRA_PARECER_JURIDICO} />
        <Swatch label="Criação" color={ESTEIRA_CRIACAO} />
        <Swatch label="Testes" color={ESTEIRA_TESTES} />
        <Swatch label="Aprovação Final" color={ESTEIRA_APROVACAO_FINAL} />
      </div>
    ),
    code: `import {
  ESTEIRA_SOLICITACAO,
  ESTEIRA_ANALISE_DOCUMENTAL,
  ESTEIRA_PARECER_JURIDICO,
  ESTEIRA_CRIACAO,
  ESTEIRA_TESTES,
  ESTEIRA_APROVACAO_FINAL,
} from "@seplag/ui-lib-react-18/src/tokens/colors";`,
  },
];

const props: DocProp[] = [
  {
    name: "Categoria: Primárias",
    type: "SEPLAG_PRIMARY, SEPLAG_PRIMARY_DARK, SEPLAG_PRIMARY_LIGHT",
    required: false,
    description: "Cores primárias do Design System para botões, links e destaques principais.",
  },
  {
    name: "Categoria: Secundárias",
    type: "SEPLAG_SECONDARY, SEPLAG_SECONDARY_DARK, SEPLAG_SECONDARY_LIGHT",
    required: false,
    description: "Cores secundárias para elementos menos proeminentes.",
  },
  {
    name: "Categoria: Semânticas",
    type: "SEPLAG_SUCCESS, SEPLAG_WARNING, SEPLAG_DANGER, SEPLAG_INFO",
    required: false,
    description:
      "Cores semânticas para indicar estados e mensagens (sucesso, aviso, erro, informação).",
  },
  {
    name: "Categoria: Severity Tokens",
    type: "SEPLAG_*_BG, SEPLAG_*_BORDER, SEPLAG_*_TEXT",
    required: false,
    description:
      "Tokens para background, borda e texto de alertas (Warning, Info, Error, Success).",
  },
  {
    name: "Categoria: Neutras",
    type: "SEPLAG_WHITE, SEPLAG_BLACK, SEPLAG_GRAY_*, SEPLAG_BORDER_LIGHT",
    required: false,
    description: "Tons de cinza e cores neutras para fundos, bordas e textos secundários.",
  },
  {
    name: "Categoria: Complementares",
    type: "SEPLAG_PURPLE, SEPLAG_TEAL",
    required: false,
    description: "Cores auxiliares para casos especiais e destaques.",
  },
  {
    name: "Categoria: Esteira (Workflow)",
    type: "ESTEIRA_*, ESTEIRA_APROVACAO_FINAL",
    required: false,
    description:
      "Cores para visualização de fluxos de trabalho, processos e esteiras de aprovação.",
  },
  {
    name: "Arquivo de Origem",
    type: "src/tokens/colors.ts",
    required: true,
    description: "Exporta constantes hex para todas as cores do Design System.",
  },
];

export default function ColorsDoc() {
  return (
    <DocPage
      title="Tokens: Cores"
      description="Paleta de cores e tokens usados pela biblioteca Seplag. Use esses tokens para manter consistência visual entre componentes."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { SEPLAG_PRIMARY } from "@seplag/ui-lib-react-18/src/tokens/colors";`}
      sections={sections}
      props={props}
    />
  );
}
