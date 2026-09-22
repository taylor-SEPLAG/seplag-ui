import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { CheckboxSNSeplag } from "@componentes/CheckBoxSN";
import { CheckboxSNValorSeplag } from "@componentes/CheckBoxSN/values";
import "primereact/resources/themes/saga-blue/theme.css";

function CheckboxBasicExample() {
  const { control, watch } = useForm({
    defaultValues: { ativo: CheckboxSNValorSeplag.NAO },
  });
  const value = watch("ativo");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <CheckboxSNSeplag name="ativo" control={control} label="Ativo" />
      <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>
        Valor atual: <strong>{value}</strong>
      </span>
    </div>
  );
}

function CheckboxDisabledExample() {
  const { control } = useForm({
    defaultValues: { aprovado: CheckboxSNValorSeplag.SIM },
  });
  return (
    <CheckboxSNSeplag
      name="aprovado"
      control={control}
      label="Aprovado (desabilitado)"
      isDisabled
    />
  );
}

function CheckboxCustomValuesExample() {
  const { control, watch } = useForm({ defaultValues: { status: "0" } });
  const v = watch("status");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <CheckboxSNSeplag
        name="status"
        control={control}
        label="Habilitado"
        checkedValue="1"
        uncheckedValue="0"
      />
      <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>
        Valor: <strong>{v}</strong>
      </span>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Checkbox controlado via react-hook-form que alterna entre os valores do enum CheckboxSNValorSeplag (padrão SEPLAG).",
    example: <CheckboxBasicExample />,
    code: `import { useForm } from "react-hook-form";
  import { CheckboxSNSeplag, CheckboxSNValorSeplag } from "@seplag/ui-lib-react-18";

const { control } = useForm({ defaultValues: { ativo: CheckboxSNValorSeplag.NAO } });

<CheckboxSNSeplag name="ativo" control={control} label="Ativo" />`,
  },
  {
    title: "Desabilitado",
    description: "Use isDisabled para tornar o campo somente leitura.",
    example: <CheckboxDisabledExample />,
    code: `<CheckboxSNSeplag
  name="aprovado"
  control={control}
  label="Aprovado"
  isDisabled
/>`,
  },
  {
    title: "Valores customizados",
    description: "Altere os valores alternados via checkedValue e uncheckedValue.",
    example: <CheckboxCustomValuesExample />,
    code: `<CheckboxSNSeplag
  name="status"
  control={control}
  label="Habilitado"
  checkedValue="1"
  uncheckedValue="0"
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "name",
    type: "Path<T>",
    required: true,
    description: "Nome do campo no formulário (react-hook-form).",
  },
  {
    name: "control",
    type: "Control<T>",
    required: false,
    description: "Objeto control do useForm. Quando omitido, funciona como input simples.",
  },
  {
    name: "rules",
    type: "RegisterOptions<T, Path<T>>",
    required: false,
    description: "Validações customizadas (required, minLength, validate, etc).",
  },
  {
    name: "label",
    type: "string",
    required: true,
    description: "Texto exibido ao lado do checkbox.",
  },
  {
    name: "checkedValue",
    type: "string",
    defaultValue: "CheckboxSNValorSeplag.SIM",
    required: false,
    description: "Valor do campo quando marcado (padrão: CheckboxSNValorSeplag.SIM).",
  },
  {
    name: "uncheckedValue",
    type: "string",
    defaultValue: "CheckboxSNValorSeplag.NAO",
    required: false,
    description: "Valor do campo quando desmarcado (padrão: CheckboxSNValorSeplag.NAO).",
  },
  {
    name: "isDisabled",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Desabilita a interação com o checkbox.",
  },
  {
    name: "inputId",
    type: "string",
    required: false,
    description: "ID customizado do elemento input. Se não informado, usa o nome do campo.",
  },
  {
    name: "className",
    type: "string",
    required: false,
    description: "Classe CSS aplicada ao wrapper do checkbox.",
  },
  {
    name: "style",
    type: "CSSProperties",
    required: false,
    description: "Estilo inline aplicado ao wrapper do checkbox.",
  },
  {
    name: "value",
    type: "string",
    required: false,
    description: "Valor externo (modo sem control).",
  },
  {
    name: "onChange",
    type: "(value: string) => void",
    required: false,
    description: "Callback de mudança (modo sem control ou complementar ao control).",
  },
  {
    name: "getFormErrorMessage",
    type: "(name: string) => ReactNode",
    required: false,
    deprecated: true,
    deprecationMessage:
      "DEPRECATED — Use react-hook-form error handling (fieldState.error) ou passe validações via `rules`",
    description: "Compatibilidade legada: função que retorna a mensagem de erro do campo.",
  },
];

export default function CheckboxSNDoc() {
  return (
    <DocPage
      title="Checkbox S/N"
      description='Checkbox controlado via react-hook-form que persiste os valores "S" (Sim) e "N" (Não) — padrão amplamente utilizado nas telas SEPLAG.'
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { CheckboxSNSeplag, CheckboxSNValorSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
