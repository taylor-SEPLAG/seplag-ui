import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { CheckboxListSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

const opcoesPermissoes = [
  { nome: "Leitura", codigo: "LEITURA" },
  { nome: "Escrita", codigo: "ESCRITA" },
  { nome: "Exclusão", codigo: "EXCLUSAO" },
];

const opcoesDiasSemana = [
  { nome: "Segunda", codigo: "SEG" },
  { nome: "Terça", codigo: "TER" },
  { nome: "Quarta", codigo: "QUA" },
  { nome: "Quinta", codigo: "QUI" },
  { nome: "Sexta", codigo: "SEX" },
];

function BasicExample() {
  const { control } = useForm({
    defaultValues: { permissoes: ["LEITURA"], diasSemana: [] as string[] },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <CheckboxListSeplag
        name="permissoes"
        control={control}
        label="Permissões"
        options={opcoesPermissoes}
        optionLabel="nome"
        optionValue="codigo"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <CheckboxListSeplag
        name="diasSemana"
        control={control}
        label="Dias de funcionamento"
        options={opcoesDiasSemana}
        optionLabel="nome"
        optionValue="codigo"
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
      "Lista de checkboxes com opções customizáveis. O valor armazenado é um array com os values dos itens marcados, permitindo selecionar um ou vários checks.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { CheckboxListSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm({
  defaultValues: { permissoes: ["LEITURA"] },
});

const opcoes = [
  { nome: "Leitura", codigo: "LEITURA" },
  { nome: "Escrita", codigo: "ESCRITA" },
  { nome: "Exclusão", codigo: "EXCLUSAO" },
];

<CheckboxListSeplag
  name="permissoes"
  control={control}
  label="Permissões"
  options={opcoes}
  optionLabel="nome"
  optionValue="codigo"
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
    description: "Nome do campo no formulário. Armazena um array de strings.",
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
    type: "any[]",
    required: true,
    description: "Lista de opções exibidas como checkboxes.",
  },
  {
    name: "optionLabel",
    type: "string",
    required: true,
    description: "Nome da propriedade de cada item de `options` usada como rótulo do checkbox.",
  },
  {
    name: "optionValue",
    type: "string",
    required: true,
    description: "Nome da propriedade de cada item de `options` usada como valor armazenado.",
  },
  {
    name: "label",
    type: "string",
    required: false,
    description: "Rótulo exibido acima da lista de checkboxes.",
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
    description: "Torna o campo obrigatório (ao menos um item selecionado).",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Desabilita todos os checkboxes.",
  },
  {
    name: "visible",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Quando false, oculta o campo.",
  },
  {
    name: "value",
    type: "any[]",
    required: false,
    description: "Valor controlado externamente, usado quando `control` não é informado.",
  },
  {
    name: "onChange",
    type: "(value: any[]) => void",
    required: false,
    description: "Callback disparado a cada alteração, usado quando `control` não é informado.",
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

export default function CheckboxListDoc() {
  return (
    <DocPage
      title="CheckboxList"
      description="Lista de checkboxes integrada com react-hook-form. Diferente do CheckboxField (um único check S/N), permite selecionar um ou vários itens de uma lista de opções, armazenando o resultado como array."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
