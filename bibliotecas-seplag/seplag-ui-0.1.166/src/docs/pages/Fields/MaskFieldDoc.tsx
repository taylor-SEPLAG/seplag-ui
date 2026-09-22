import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { MaskFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({ defaultValues: { telefone: "", cep: "" } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <MaskFieldSeplag
        name="telefone"
        control={control}
        label="Telefone"
        mask="(99) 99999-9999"
        placeholder="(99) 99999-9999"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <MaskFieldSeplag
        name="cep"
        control={control}
        label="CEP"
        mask="99999-999"
        placeholder="00000-000"
        cols="12 6"
        getFormErrorMessage={noError}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Campo com máscara de entrada genérica. Use '9' para dígitos, 'a' para letras e '*' para alfanuméricos.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { MaskFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<MaskFieldSeplag
  name="telefone"
  control={control}
  label="Telefone"
  mask="(99) 99999-9999"
  placeholder="(99) 99999-9999"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

<MaskFieldSeplag
  name="cep"
  control={control}
  label="CEP"
  mask="99999-999"
  placeholder="00000-000"
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
    name: "mask",
    type: "string",
    required: true,
    description: "Máscara de entrada. Use 9 (dígito), a (letra), * (alfanumérico).",
  },
  {
    name: "placeholder",
    type: "string",
    defaultValue: '"dd/mm/yyyy"',
    required: false,
    description: "Texto de placeholder.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12 6"',
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

export default function MaskFieldDoc() {
  return (
    <DocPage
      title="MaskField"
      description="Campo com máscara de entrada genérica (InputMask do PrimeReact), integrado com react-hook-form. Use para telefones, CEP, datas ou qualquer formato fixo."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
