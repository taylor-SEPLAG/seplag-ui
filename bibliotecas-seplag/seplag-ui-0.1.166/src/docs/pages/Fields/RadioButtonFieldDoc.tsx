import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { RadioButtonFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

const opcoesSimNao = [
  { label: "Sim", value: "S" },
  { label: "Não", value: "N" },
];

const opcoesSexo = [
  { label: "Masculino", value: "M" },
  { label: "Feminino", value: "F" },
  { label: "Outro", value: "O" },
];

function BasicExample() {
  const { control } = useForm({ defaultValues: { ativo: "S", sexo: "M" } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <RadioButtonFieldSeplag
        name="ativo"
        control={control}
        label="Ativo"
        options={opcoesSimNao}
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <RadioButtonFieldSeplag
        name="sexo"
        control={control}
        label="Sexo"
        options={opcoesSexo}
        cols="12 6"
        getFormErrorMessage={noError}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description: "Grupo de radio buttons com opções customizáveis, integrado com react-hook-form.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { RadioButtonFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm({
  defaultValues: { ativo: "S" },
});

const opcoes = [
  { label: "Sim", value: "S" },
  { label: "Não", value: "N" },
];

<RadioButtonFieldSeplag
  name="ativo"
  control={control}
  label="Ativo"
  options={opcoes}
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "name",
    type: "Path<T>",
    required: true,
    description: "Nome do campo no formulário.",
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
    name: "options",
    type: "RadioOptionSeplag[]",
    required: true,
    description: "Lista de opções do grupo de radio buttons.",
  },
  {
    name: "label",
    type: "string",
    required: false,
    description: "Rótulo exibido acima do grupo.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12"',
    required: false,
    description: "Largura via grid SEPLAG.",
  },
  {
    name: "required",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Torna o campo obrigatório.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Desabilita todos os radio buttons.",
  },
  {
    name: "visible",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Quando false, oculta o campo.",
  },
  {
    name: "getFormErrorMessage",
    type: "(name: string) => ReactNode",
    required: false,
    deprecated: true,
    deprecationMessage:
      "DEPRECATED — Use react-hook-form error handling (fieldState.error) ou passe validações via `rules`",
    description:
      "Compatibilidade legada: quando retorna um nó válido, tem prioridade sobre o erro interno do react-hook-form.",
  },
];

export default function RadioButtonFieldDoc() {
  return (
    <DocPage
      title="RadioButtonField"
      description="Grupo de radio buttons com rótulos customizáveis. Integrado com react-hook-form e Rótulo SEPLAG."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
