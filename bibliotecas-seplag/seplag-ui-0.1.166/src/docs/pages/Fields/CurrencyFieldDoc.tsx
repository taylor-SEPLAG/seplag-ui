import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { CurrencyFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({
    defaultValues: { salario: null, desconto: null },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <CurrencyFieldSeplag
        name="salario"
        control={control}
        label="Salário"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <CurrencyFieldSeplag
        name="desconto"
        control={control}
        label="Desconto (obrigatório)"
        cols="12 6"
        required
        getFormErrorMessage={noError}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description: "Campo de valor monetário em BRL com formatação automática.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { CurrencyFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<CurrencyFieldSeplag
  name="salario"
  control={control}
  label="Salário"
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
    name: "label",
    type: "string",
    required: false,
    description: "Rótulo exibido acima do campo.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12 6"',
    required: false,
    description: "Largura via grid SEPLAG.",
  },
  {
    name: "placeholder",
    type: "string",
    required: false,
    description: "Texto de dica exibido quando o campo está vazio.",
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
    name: "inputStyle",
    type: "CSSProperties",
    required: false,
    description: "Estilo inline aplicado ao input interno.",
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

export default function CurrencyFieldDoc() {
  return (
    <DocPage
      title="CurrencyField"
      description="Campo de valor monetário em Real (BRL) com formatação automática. Usa InputNumber do PrimeReact no modo currency."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
