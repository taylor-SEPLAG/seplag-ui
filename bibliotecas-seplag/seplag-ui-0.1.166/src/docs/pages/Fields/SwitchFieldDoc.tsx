import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { SwitchFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({
    defaultValues: { ativo: "S", notificacoes: "N" },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <SwitchFieldSeplag
        name="ativo"
        control={control}
        label="Ativo"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <SwitchFieldSeplag
        name="notificacoes"
        control={control}
        label="Notificações"
        cols="12 6"
        textTooltip="Habilita notificações por e-mail"
        getFormErrorMessage={noError}
      />
    </div>
  );
}

function HorizontalCompareExample() {
  const { control } = useForm({
    defaultValues: { vertical: "S", horizontal: "S" },
  });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <SwitchFieldSeplag
        name="vertical"
        control={control}
        label="horizontal={false}"
        cols="12 6"
        horizontal={false}
        getFormErrorMessage={noError}
      />
      <SwitchFieldSeplag
        name="horizontal"
        control={control}
        label="horizontal={true}"
        cols="12 6"
        horizontal={true}
        getFormErrorMessage={noError}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description: "Toggle que armazena 'S' (ligado) ou 'N' (desligado). Suporta tooltip.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { SwitchFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm({
  defaultValues: { ativo: "S" },
});

<SwitchFieldSeplag
  name="ativo"
  control={control}
  label="Ativo"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`,
  },
  {
    title: "Layout horizontal",
    description:
      "A prop horizontal controla a orientação entre o rótulo e o switch. Com false (padrão) o rótulo fica acima; com true ficam lado a lado.",
    example: <HorizontalCompareExample />,
    code: `// horizontal={false} — rótulo acima (padrão)
<SwitchFieldSeplag
  name="vertical"
  control={control}
  label="Publicado"
  cols="12 6"
  horizontal={false}
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// horizontal={true} — rótulo e switch lado a lado
<SwitchFieldSeplag
  name="horizontal"
  control={control}
  label="Publicado"
  cols="12 6"
  horizontal
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
    description: "Rótulo exibido acima do switch.",
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
    name: "horizontal",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Layout horizontal: rótulo e switch lado a lado.",
  },
  {
    name: "textTooltip",
    type: "string",
    required: false,
    description: "Texto do tooltip exibido ao passar o mouse.",
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

export default function SwitchFieldDoc() {
  return (
    <DocPage
      title="SwitchField"
      description="Campo toggle (InputSwitch) que armazena 'S' ou 'N'. Integrado com react-hook-form. Suporta tooltip e layout horizontal."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
