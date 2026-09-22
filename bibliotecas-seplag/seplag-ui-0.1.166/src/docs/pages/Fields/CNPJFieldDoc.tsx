import React from "react";
import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { CNPJFieldSeplag } from "@componentes/Fields";
import { validarCNPJSeplag, unmaskedCNPJSeplag } from "../../../uteis/cpfCnpj/manipulaCNPJAndCPF";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({ defaultValues: { cnpj: "", cnpjObrig: "" } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <CNPJFieldSeplag
        name="cnpj"
        control={control}
        label="CNPJ"
        cols="12 6"
        getFormErrorMessage={noError}
      />
      <CNPJFieldSeplag
        name="cnpjObrig"
        control={control}
        label="CNPJ (obrigatório)"
        cols="12 6"
        required
        getFormErrorMessage={noError}
      />
    </div>
  );
}

type PlaygroundStatus = "idle" | "incompleto" | "invalido" | "valido";

function PlaygroundExample() {
  const [value, setValue] = React.useState("");
  const [status, setStatus] = React.useState<PlaygroundStatus>("idle");

  function handleChange(val: string) {
    setValue(val);
    const raw = unmaskedCNPJSeplag(val);
    if (!raw) {
      setStatus("idle");
    } else if (raw.length < 14) {
      setStatus("incompleto");
    } else if (validarCNPJSeplag(raw)) {
      setStatus("valido");
    } else {
      setStatus("invalido");
    }
  }

  const statusConfig: Record<PlaygroundStatus, { icon: string; text: string; color: string } | null> = {
    idle: null,
    incompleto: { icon: "pi-hourglass", text: "CNPJ incompleto", color: "#f59e0b" },
    invalido:   { icon: "pi-times-circle", text: "CNPJ inválido", color: "#ef4444" },
    valido:     { icon: "pi-check-circle", text: "CNPJ válido", color: "#22c55e" },
  };

  const info = statusConfig[status];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <CNPJFieldSeplag
        name="cnpj_playground"
        label="CNPJ"
        cols="12 6"
        value={value}
        onChange={handleChange}
      />
      {info && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            background: `${info.color}18`,
            border: `1px solid ${info.color}`,
            color: info.color,
            fontWeight: 600,
            width: "fit-content",
          }}
        >
          <i className={`pi ${info.icon}`} />
          {info.text}
        </div>
      )}
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Digite um CNPJ (numérico ou alfanumérico) para ver a validação em tempo real.",
    example: <PlaygroundExample />,
    code: `import { useState } from "react";
import { CNPJFieldSeplag } from "@seplag/ui-lib-react-18";
import { validarCNPJSeplag, unmaskedCNPJSeplag } from "@seplag/ui-lib-react-18";

function Exemplo() {
  const [value, setValue] = useState("");
  const raw = unmaskedCNPJSeplag(value);
  const valido = raw.length === 14 && validarCNPJSeplag(raw);

  return (
    <CNPJFieldSeplag
      name="cnpj"
      label="CNPJ"
      value={value}
      onChange={setValue}
    />
  );
}`,
  },
  {
    title: "Uso básico",
    description:
      "Campo de CNPJ com máscara e validação de dígitos verificadores integrado ao react-hook-form.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { CNPJFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<CNPJFieldSeplag
  name="cnpj"
  control={control}
  label="CNPJ"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Sem validação de dígitos verificadores
<CNPJFieldSeplag
  name="cnpj"
  control={control}
  label="CNPJ"
  validarCNPJ={false}
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
    defaultValue: '"CNPJ"',
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
    name: "validarCNPJ",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Ativa/desativa a validação dos dígitos verificadores.",
  },
  {
    name: "onBlur",
    type: "() => void",
    required: false,
    description: "Callback executado ao sair do campo.",
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

export default function CNPJFieldDoc() {
  return (
    <DocPage
      title="CNPJField"
      description="Campo de CNPJ com máscara automática e validação dos dígitos verificadores (módulo 11), compatível com o novo formato alfanumérico. Integrado com react-hook-form."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
