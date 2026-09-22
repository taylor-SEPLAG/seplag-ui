import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { StatusCardGroupSeplag } from "@componentes/StatusCardGroupSeplag";
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
    title: "Por que existe",
    description:
      'O grid PrimeFlex é base-12: 5 cards não dividem 12 igualmente (12/5 = 2.4), então cols="12 6 2" sobra espaço vazio, e um flex-wrap com flex-grow faz o item órfão da última linha esticar sozinho até 100%. StatusCardGroupSeplag usa CSS Grid repeat(auto-fit, minmax(...)) — todas as células têm a mesma largura e a última linha incompleta fica com espaço vazio em vez de esticar um card.',
    example: (
      <StatusCardGroupSeplag
        className="mb-2"
        cards={[
          { id: "autorizadas", label: "Autorizadas", value: 750, icon: "pi pi-file", color: SEPLAG_INFO_TEXT, bg: SEPLAG_INFO_BG, borderColor: SEPLAG_INFO_BORDER, isCustomColored: true },
          { id: "ocupadas", label: "Ocupadas", value: 0, icon: "pi pi-users", color: SEPLAG_WARNING_TEXT, bg: SEPLAG_WARNING_BG, borderColor: SEPLAG_WARNING_BORDER, isCustomColored: true },
          { id: "comprometidas", label: "Comprometidas", value: 0, icon: "pi pi-clock", color: SEPLAG_ERROR_TEXT, bg: SEPLAG_ERROR_BG, borderColor: SEPLAG_ERROR_BORDER, isCustomColored: true },
          { id: "disponiveis", label: "Disponíveis", value: 190, icon: "pi pi-check-circle", color: SEPLAG_SUCCESS_TEXT, bg: SEPLAG_SUCCESS_BG, borderColor: SEPLAG_SUCCESS_BORDER, isCustomColored: true },
          { id: "pendente", label: "Pendente de distribuição", value: 560, icon: "pi pi-hourglass", color: "#9C27B0", bg: "#faf5fc", borderColor: "#e1b8ee", isCustomColored: true },
        ]}
      />
    ),
    code: `import { StatusCardGroupSeplag } from "@seplag/ui-lib-react-18";

<StatusCardGroupSeplag
  cards={[
    { id: "autorizadas", label: "Autorizadas", value: 750, icon: "pi pi-file", color: SEPLAG_INFO_TEXT, bg: SEPLAG_INFO_BG, borderColor: SEPLAG_INFO_BORDER, isCustomColored: true },
    { id: "ocupadas", label: "Ocupadas", value: 0, icon: "pi pi-users", color: SEPLAG_WARNING_TEXT, bg: SEPLAG_WARNING_BG, borderColor: SEPLAG_WARNING_BORDER, isCustomColored: true },
    { id: "comprometidas", label: "Comprometidas", value: 0, icon: "pi pi-clock", color: SEPLAG_ERROR_TEXT, bg: SEPLAG_ERROR_BG, borderColor: SEPLAG_ERROR_BORDER, isCustomColored: true },
    { id: "disponiveis", label: "Disponíveis", value: 190, icon: "pi pi-check-circle", color: SEPLAG_SUCCESS_TEXT, bg: SEPLAG_SUCCESS_BG, borderColor: SEPLAG_SUCCESS_BORDER, isCustomColored: true },
    { id: "pendente", label: "Pendente de distribuição", value: 560, icon: "pi pi-hourglass", color: "#9C27B0", bg: "#faf5fc", borderColor: "#e1b8ee", isCustomColored: true },
  ]}
/>`,
  },
  {
    title: "minCardWidth",
    description:
      "Controla a largura mínima de cada card antes de quebrar para a próxima linha (default 190px). Reduza para caber mais colunas em containers estreitos.",
    example: (
      <StatusCardGroupSeplag
        minCardWidth={130}
        cards={[
          { id: "a", label: "Nova", value: 3, icon: "pi pi-file", color: SEPLAG_INFO_TEXT, bg: SEPLAG_INFO_BG, borderColor: SEPLAG_INFO_BORDER, isCustomColored: true },
          { id: "b", label: "Concluído", value: 11, icon: "pi pi-check-circle", color: SEPLAG_SUCCESS_TEXT, bg: SEPLAG_SUCCESS_BG, borderColor: SEPLAG_SUCCESS_BORDER, isCustomColored: true },
          { id: "c", label: "Corrigido", value: 1, icon: "pi pi-refresh", color: SEPLAG_INFO_TEXT, bg: SEPLAG_INFO_BG, borderColor: SEPLAG_INFO_BORDER, isCustomColored: true },
        ]}
      />
    ),
    code: `<StatusCardGroupSeplag minCardWidth={130} cards={[...]} />`,
  },
];

const props: DocProp[] = [
  {
    name: "cards",
    type: "(Omit<StatusCardSeplagProps, \"cols\" | \"fill\"> & { key?: string })[]",
    required: true,
    description: "Lista de cards a renderizar. `key` é opcional — o fallback é o `id` do card.",
  },
  {
    name: "minCardWidth",
    type: "number",
    defaultValue: "190",
    required: false,
    description: "Largura mínima (px) de cada card antes de quebrar para a próxima linha.",
  },
  { name: "className", type: "string", required: false, description: "Classe CSS aplicada ao container grid." },
];

export default function StatusCardGroupDoc() {
  return (
    <DocPage
      title="StatusCardGroupSeplag"
      description="Distribui N StatusCardSeplag em largura igual, preenchendo 100% do container — sem o item órfão da última linha esticar sozinho. Componente recomendado sempre que o número de cards não divide 12 (base do grid PrimeFlex) igualmente, como 5 ou 7 cards."
      badge="Estável"
      since="v0.1.123"
      importStatement={`import { StatusCardGroupSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
