import { useState } from "react";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import {
  RadioCardGroupSeplag,
  type RadioCardOptionSeplag,
} from "@componentes/RadioCardGroup";

const OPCOES_TIPO_CERTAME: RadioCardOptionSeplag<"CONCURSO" | "PSS">[] = [
  {
    value: "CONCURSO",
    label: "Concurso Público",
    descricao: "Provimento efetivo, vinculado a um plano de carreira.",
    icon: "pi pi-verified",
    color: "#0d6efd",
    colorBg: "#eaf2ff",
    colorBorder: "#0d6efd",
  },
  {
    value: "PSS",
    label: "Processo Seletivo Simplificado (PSS)",
    descricao: "Contratação temporária, sem vínculo de carreira.",
    icon: "pi pi-clock",
    color: "#b45309",
    colorBg: "#fff7ea",
    colorBorder: "#b45309",
  },
];

function BasicExample() {
  const [tipo, setTipo] = useState<"CONCURSO" | "PSS" | undefined>();

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <RadioCardGroupSeplag
        options={OPCOES_TIPO_CERTAME}
        value={tipo}
        getKey={(opcao) => opcao.value}
        onChange={setTipo}
      />
      <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: "0.75rem 0 0" }}>
        Selecionado: {tipo ?? "nenhum"}
      </p>
    </div>
  );
}

const OPCOES_SEM_COR = [
  { value: 1, label: "Opção simples", descricao: "Sem cor de destaque nem ícone." },
  { value: 2, label: "Outra opção", descricao: "Cada card funciona mesmo sem os extras." },
];

function MinimalExample() {
  const [valor, setValor] = useState<number | undefined>();
  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <RadioCardGroupSeplag options={OPCOES_SEM_COR} value={valor} onChange={setValor} />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Grupo de cartões clicáveis para seleção única fora de um formulário react-hook-form — por exemplo, escolher o tipo de um registro antes de abrir a tela de cadastro (modal 'Novo Certame'). Cada opção pode ter cor de destaque, ícone e uma descrição curta abaixo do rótulo. O estado é totalmente controlado por value/onChange, como um input comum.",
    example: <BasicExample />,
    code: `import { useState } from "react";
import { RadioCardGroupSeplag, type RadioCardOptionSeplag } from "@seplag/ui-lib-react-18";

const OPCOES_TIPO_CERTAME: RadioCardOptionSeplag<"CONCURSO" | "PSS">[] = [
  {
    value: "CONCURSO",
    label: "Concurso Público",
    descricao: "Provimento efetivo, vinculado a um plano de carreira.",
    icon: "pi pi-verified",
    color: "#0d6efd",
    colorBg: "#eaf2ff",
    colorBorder: "#0d6efd",
  },
  {
    value: "PSS",
    label: "Processo Seletivo Simplificado (PSS)",
    descricao: "Contratação temporária, sem vínculo de carreira.",
    icon: "pi pi-clock",
    color: "#b45309",
    colorBg: "#fff7ea",
    colorBorder: "#b45309",
  },
];

const [tipo, setTipo] = useState<"CONCURSO" | "PSS" | undefined>();

<RadioCardGroupSeplag
  options={OPCOES_TIPO_CERTAME}
  value={tipo}
  getKey={(opcao) => opcao.value}
  onChange={setTipo}
/>`,
  },
  {
    title: "Sem cor nem ícone",
    description:
      "icon e as props de cor (color/colorBg/colorBorder) são opcionais — sem elas, o card usa as cores neutras padrão e não exibe ícone, mantendo só o rótulo e a descrição.",
    example: <MinimalExample />,
    code: `const opcoes = [
  { value: 1, label: "Opção simples", descricao: "Sem cor de destaque nem ícone." },
  { value: 2, label: "Outra opção", descricao: "Cada card funciona mesmo sem os extras." },
];

<RadioCardGroupSeplag options={opcoes} value={valor} onChange={setValor} />`,
  },
];

const props: DocProp[] = [
  {
    name: "options",
    type: "ReadonlyArray<RadioCardOptionSeplag<T>>",
    required: true,
    description:
      "Lista de opções: { value, label, descricao?, icon?, color?, colorBg?, colorBorder? }.",
  },
  {
    name: "value",
    type: "T",
    required: false,
    description: "Valor atualmente selecionado. Compare por igualdade estrita (===) com option.value.",
  },
  {
    name: "onChange",
    type: "(value: T) => void",
    required: true,
    description: "Chamado com option.value ao clicar em um card.",
  },
  {
    name: "getKey",
    type: "(option: RadioCardOptionSeplag<T>) => string | number",
    required: false,
    description: "Gera a key de cada card. Padrão: String(option.value).",
  },
  {
    name: "className",
    type: "string",
    required: false,
    description: "Classe adicional aplicada ao container do grupo.",
  },
];

export default function RadioCardGroupDoc() {
  return (
    <DocPage
      title="RadioCardGroup"
      description="Grupo de cartões clicáveis usados como seleção única fora de react-hook-form — controlado por value/onChange, como um input comum. Use para escolher o tipo de um registro antes de abrir seu formulário de cadastro (ex.: 'Novo Certame'). Para seleção dentro de um formulário RHF, veja CardRadioGroupSeplag."
      badge="Estável"
      since="v0.1.152"
      importStatement={'import { RadioCardGroupSeplag } from "@seplag/ui-lib-react-18";'}
      sections={sections}
      props={props}
    />
  );
}
