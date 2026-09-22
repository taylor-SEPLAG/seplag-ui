import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { DateFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({
    defaultValues: { nascimento: null, admissao: null },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DateFieldSeplag
        name="nascimento"
        control={control}
        label="Data de Nascimento"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <DateFieldSeplag
        name="admissao"
        control={control}
        label="Data de Admissão (obrigatória)"
        cols="12 6"
        required
        getFormErrorMessage={noError}
      />
    </div>
  );
}

function RangeExample() {
  const { control, watch } = useForm({
    defaultValues: { dataInicio: null, dataFim: null },
  });
  const dataInicio = watch("dataInicio");
  return (
    <div className="grid" style={{ width: "100%" }}>
      <DateFieldSeplag
        name="dataInicio"
        control={control}
        label="Data Início"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <DateFieldSeplag
        name="dataFim"
        control={control}
        label="Data Fim"
        cols="12 6"
        validateAfterDate={dataInicio ?? undefined}
        validateAfterMessage="Data fim não pode ser anterior à data início"
        getFormErrorMessage={noError}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description: "Calendário com máscara, locale pt-BR e ícone de abertura.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { DateFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<DateFieldSeplag
  name="nascimento"
  control={control}
  label="Data de Nascimento"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`,
  },
  {
    title: "Intervalo de datas",
    description: "Use validateAfterDate para garantir que a data fim seja após a data início.",
    example: <RangeExample />,
    code: `const dataInicio = watch("dataInicio");

<DateFieldSeplag
  name="dataInicio"
  control={control}
  label="Data Início"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>
<DateFieldSeplag
  name="dataFim"
  control={control}
  label="Data Fim"
  cols="12 6"
  validateAfterDate={dataInicio}
  validateAfterMessage="Data fim não pode ser anterior à data início"
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
    description: "Rótulo exibido acima do campo.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12 6 3"',
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
    name: "mask",
    type: "string",
    defaultValue: '"99/99/9999"',
    required: false,
    description: "Máscara do input de texto.",
  },
  {
    name: "view",
    type: '"date" | "month" | "year"',
    defaultValue: '"date"',
    required: false,
    description: "Modo de visualização do calendário.",
  },
  {
    name: "minDate",
    type: "Date",
    required: false,
    description: "Data mínima selecionável.",
  },
  {
    name: "maxDate",
    type: "Date",
    required: false,
    description: "Data máxima selecionável.",
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
    name: "customValidation",
    type: "Validate | Record<string, Validate>",
    required: false,
    description: "Validações customizadas do react-hook-form.",
  },
  {
    name: "validateStartDate",
    type: "any",
    required: false,
    description: "Data de referência: o campo não pode ser posterior a ela.",
  },
  {
    name: "validateStartMessage",
    type: "string",
    required: false,
    description: "Mensagem de erro quando validateStartDate falha.",
  },
  {
    name: "shouldUnregister",
    type: "boolean",
    required: false,
    description: "Remove o campo do formulário ao desmontar o componente.",
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

export default function DateFieldDoc() {
  return (
    <DocPage
      title="DateField"
      description="Campo de data com calendário PrimeReact, locale pt-BR, máscara e suporte a intervalo de datas com validação automática."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
