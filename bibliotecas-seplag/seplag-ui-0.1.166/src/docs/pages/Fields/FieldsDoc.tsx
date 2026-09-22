import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import {
  TextFieldSeplag,
  TextAreaFieldSeplag,
  EmailFieldSeplag,
  NumberFieldSeplag,
  MaskFieldSeplag,
  CPFFieldSeplag,
  CNPJFieldSeplag,
  DateFieldSeplag,
  DropdownFieldSeplag,
  SwitchFieldSeplag,
} from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

// Helpers para mensagens de erro no padrão SEPLAG
const noError = () => null;

function TextFieldsExample() {
  const { control } = useForm({
    defaultValues: { nome: "", email: "", descricao: "" },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <TextFieldSeplag
        name="nome"
        control={control}
        label="Nome"
        placeholder="Digite o nome"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <EmailFieldSeplag
        name="email"
        control={control}
        label="E-mail"
        placeholder="email@seplag.mt.gov.br"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <TextAreaFieldSeplag
        name="descricao"
        control={control}
        label="Descrição"
        placeholder="Descreva..."
        cols="12"
        getFormErrorMessage={noError}
      />
    </div>
  );
}

function NumericFieldsExample() {
  const { control } = useForm({
    defaultValues: { quantidade: 0, cpf: "", cnpj: "", telefone: "" },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <NumberFieldSeplag
        name="quantidade"
        control={control}
        label="Quantidade"
        cols="12 4"
        getFormErrorMessage={noError}
      />
      <CPFFieldSeplag
        name="cpf"
        control={control}
        label="CPF"
        cols="12 4"
        getFormErrorMessage={noError}
      />
      <CNPJFieldSeplag
        name="cnpj"
        control={control}
        label="CNPJ"
        cols="12 4"
        getFormErrorMessage={noError}
      />
      <MaskFieldSeplag
        name="telefone"
        control={control}
        label="Telefone"
        mask="(99) 99999-9999"
        cols="12 4"
        getFormErrorMessage={noError}
      />
    </div>
  );
}

function SelectionFieldsExample() {
  const { control } = useForm({
    defaultValues: { uf: null, nascimento: null, ativo: false },
  });
  const ufs = [
    { label: "Mato Grosso", value: "MT" },
    { label: "São Paulo", value: "SP" },
    { label: "Rio de Janeiro", value: "RJ" },
  ];
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DropdownFieldSeplag
        name="uf"
        control={control}
        label="UF"
        options={ufs}
        optionLabel="label"
        optionValue="value"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <DateFieldSeplag
        name="nascimento"
        control={control}
        label="Data de Nascimento"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <SwitchFieldSeplag
        name="ativo"
        control={control}
        label="Ativo"
        cols="12"
        getFormErrorMessage={noError}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Campos de texto",
    description:
      "TextField, EmailField e TextAreaField — todos integrados com react-hook-form e Rótulo SEPLAG.",
    example: <TextFieldsExample />,
    code: `import { useForm } from "react-hook-form";
import {
  TextFieldSeplag,
  EmailFieldSeplag,
  TextAreaFieldSeplag,
} from "@seplag/ui-lib-react-18";

const { control } = useForm({ defaultValues: { nome: "", email: "" } });

<TextFieldSeplag
  name="nome"
  control={control}
  label="Nome"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>
<EmailFieldSeplag
  name="email"
  control={control}
  label="E-mail"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`,
  },
  {
    title: "Campos numéricos e formatados",
    description: "NumberField, CPFField, CNPJField e MaskField com máscara automática.",
    example: <NumericFieldsExample />,
    code: `<NumberFieldSeplag  name="quantidade" control={control} label="Quantidade" cols="12 4" />
<CPFFieldSeplag     name="cpf"        control={control} label="CPF"        cols="12 4" />
<CNPJFieldSeplag    name="cnpj"       control={control} label="CNPJ"       cols="12 4" />
<MaskFieldSeplag
  name="telefone"
  control={control}
  label="Telefone"
  mask="(99) 99999-9999"
  cols="12 4"
/>`,
  },
  {
    title: "Seleção e data",
    description: "DropdownField, DateField e SwitchField para escolha de valores.",
    example: <SelectionFieldsExample />,
    code: `<DropdownFieldSeplag
  name="uf"
  control={control}
  label="UF"
  options={[{ label: "Mato Grosso", value: "MT" }]}
  optionLabel="label"
  optionValue="value"
  cols="12 6"
/>
<DateFieldSeplag name="nascimento" control={control} label="Data de Nascimento" cols="12 6" />
<SwitchFieldSeplag name="ativo"   control={control} label="Ativo" cols="12" />`,
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
    required: false,
    description: "Rótulo do campo.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12"',
    required: false,
    description: 'Largura via grid SEPLAG, ex: "12 6" (col-12 col-md-6).',
  },
  {
    name: "required",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Adiciona asterisco e validação de campo obrigatório.",
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
    description: "Quando false, o campo não é renderizado.",
  },
  {
    name: "getFormErrorMessage",
    type: "(name: string) => ReactNode | null",
    required: false,
    deprecated: true,
    deprecationMessage:
      "DEPRECATED — Use react-hook-form error handling (fieldState.error) ou passe validações via `rules`",
    description: "Compatibilidade legada: função que retorna a mensagem de erro do campo.",
  },
  {
    name: "placeholder",
    type: "string",
    required: false,
    description: "Texto de placeholder (TextField, Email, TextArea, Mask).",
  },
  {
    name: "mask",
    type: "string",
    required: false,
    description: 'MaskField: máscara de entrada, ex: "(99) 99999-9999".',
  },
  {
    name: "options",
    type: "object[]",
    required: false,
    description: "DropdownField / MultiSelect: lista de opções.",
  },
];

export default function FieldsDoc() {
  return (
    <DocPage
      title="Campos de Formulário"
      description="Conjunto de campos de formulário padrão SEPLAG, todos integrados com react-hook-form e encapsulados com o Rótulo. Incluem: TextField, TextArea, Email, Number, CPF, CNPJ, Mask, Date, Dropdown, Switch e mais."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
