import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { CheckboxFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({
    defaultValues: { aceito: "N", newsletter: "N" },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <CheckboxFieldSeplag
        name="aceito"
        control={control}
        label="Termos de uso"
        checkboxLabel="Li e aceito os termos de uso"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <CheckboxFieldSeplag
        name="newsletter"
        control={control}
        label="Newsletter"
        checkboxLabel="Desejo receber novidades por e-mail"
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
      "Checkbox que armazena 'S' (marcado) ou 'N' (desmarcado) por padrão. Os valores podem ser customizados.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { CheckboxFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm({
  defaultValues: { aceito: "N" },
});

<CheckboxFieldSeplag
  name="aceito"
  control={control}
  label="Termos de uso"
  checkboxLabel="Li e aceito os termos de uso"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Valores customizados (ex: true/false)
<CheckboxFieldSeplag
  name="ativo"
  control={control}
  label="Ativo"
  checkboxLabel="Registro ativo"
  checkedValue={true}
  uncheckedValue={false}
  defaultValue={false}
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
    name: "label",
    type: "string",
    required: false,
    description: "Rótulo exibido acima do checkbox (RotuloSeplag).",
  },
  {
    name: "checkboxLabel",
    type: "string",
    required: true,
    description: "Texto exibido ao lado do checkbox.",
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
    name: "checkedValue",
    type: "any",
    defaultValue: '"S"',
    required: false,
    description: "Valor gravado no formulário quando marcado.",
  },
  {
    name: "uncheckedValue",
    type: "any",
    defaultValue: '"N"',
    required: false,
    description: "Valor gravado no formulário quando desmarcado.",
  },
  {
    name: "defaultValue",
    type: "any",
    defaultValue: '"N"',
    required: false,
    description: "Valor inicial do campo.",
  },
  {
    name: "className",
    type: "string",
    required: false,
    description: "Classe CSS aplicada ao wrapper.",
  },
  {
    name: "style",
    type: "CSSProperties",
    required: false,
    description: "Estilo inline aplicado ao wrapper.",
  },
];

export default function CheckboxFieldDoc() {
  return (
    <DocPage
      title="CheckboxField"
      description="Campo de checkbox integrado com react-hook-form. Armazena valores customizáveis (padrão 'S'/'N'). Inclui rótulo no padrão SEPLAG e label ao lado do checkbox."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
