import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { FieldsetDateFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({
    defaultValues: { periodo: null, vencimento: null },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <FieldsetDateFieldSeplag
        name="periodo"
        control={control}
        label="Período"
        cols="12"
        getFormErrorMessage={noError}
      />
      <FieldsetDateFieldSeplag
        name="vencimento"
        control={control}
        label="Vencimento"
        cols="12"
        required
        getFormErrorMessage={noError}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description: "Campo de data encapsulado dentro de um Fieldset do PrimeReact.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { FieldsetDateFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<FieldsetDateFieldSeplag
  name="periodo"
  control={control}
  label="Período"
  cols="12"
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
    name: "label",
    type: "string",
    required: false,
    description: "Rótulo do Fieldset e do campo.",
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
    description: "Desabilita o campo.",
  },
  {
    name: "visible",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Quando false, oculta o campo.",
  },
  {
    name: "placeholder",
    type: "string",
    defaultValue: '"dd/mm/aaaa"',
    required: false,
    description: "Texto de placeholder.",
  },
  {
    name: "dateFormat",
    type: "string",
    defaultValue: '"dd/mm/yy"',
    required: false,
    description: "Formato de exibição da data.",
  },
  {
    name: "view",
    type: '"date" | "month" | "year"',
    defaultValue: '"date"',
    required: false,
    description: "Modo de visualização do calendário.",
  },
  {
    name: "validateAfterDate",
    type: "string",
    required: false,
    description: "Data de referência: o campo não pode ser anterior a ela.",
  },
  {
    name: "validateAfterMessage",
    type: "string",
    required: false,
    description: "Mensagem de erro quando validateAfterDate falha.",
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
  {
    name: "autoComplete",
    type: "string",
    required: false,
    description:
      "Atributo HTML autocomplete repassado ao input. Por padrão o autocomplete do navegador " +
      "fica ativo; passe autoComplete=\"off\" para desativá-lo.",
  },
];

export default function FieldsetDateFieldDoc() {
  return (
    <DocPage
      title="FieldsetDateField"
      description="Campo de data encapsulado dentro de um Fieldset do PrimeReact. Ideal para filtros e agrupamentos visuais de datas."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
