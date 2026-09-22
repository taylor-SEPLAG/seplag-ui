import { useState } from "react";
import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { TextAreaFieldSeplag } from "@componentes/Fields";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({ defaultValues: { descricao: "", obs: "" } });
  return (
    <div className="grid" style={{ width: "100%" }}>
      <TextAreaFieldSeplag
        name="descricao"
        control={control}
        label="Descrição"
        placeholder="Descreva..."
        cols="12"
        rows={3}
        getFormErrorMessage={noError}
      />
      <TextAreaFieldSeplag
        name="obs"
        control={control}
        label="Observações (máx. 200 caracteres)"
        placeholder="Digite suas observações..."
        cols="12"
        rows={4}
        maxLength={200}
        getFormErrorMessage={noError}
      />
    </div>
  );
}

function RequiredExample() {
  const { control, handleSubmit } = useForm({
    defaultValues: { justificativa: "", campoDesabilitado: "Valor fixo" },
  });
  return (
    <form className="grid" style={{ width: "100%" }} onSubmit={handleSubmit(() => {})}>
      <TextAreaFieldSeplag
        name="justificativa"
        control={control}
        label="Justificativa (obrigatória)"
        placeholder="Obrigatório — clique em Validar sem preencher"
        cols="12"
        required
        getFormErrorMessage={noError}
      />
      <TextAreaFieldSeplag
        name="campoDesabilitado"
        control={control}
        label="Desabilitado"
        cols="12"
        disabled
        getFormErrorMessage={noError}
      />
      <div className="col-12">
        <Button type="submit" label="Validar" size="small" />
      </div>
    </form>
  );
}

function CustomValidationExample() {
  const { control, handleSubmit } = useForm({
    defaultValues: { descricao: "", motivo: "" },
    mode: "onTouched",
  });
  return (
    <form className="grid" style={{ width: "100%" }} onSubmit={handleSubmit(() => {})}>
      <TextAreaFieldSeplag
        name="descricao"
        control={control}
        label="Descrição (mín. 20 caracteres)"
        placeholder="Digite pelo menos 20 caracteres"
        cols="12"
        rows={3}
        rules={{
          validate: (v) => (v && v.trim().length >= 20) || "Mínimo de 20 caracteres",
        }}
        getFormErrorMessage={noError}
      />
      <TextAreaFieldSeplag
        name="motivo"
        control={control}
        label="Motivo (validações nomeadas)"
        placeholder="Digite o motivo"
        cols="12"
        rows={3}
        rules={{
          required: "Motivo é obrigatório",
          validate: {
            minCaracteres: (v) => (v && v.trim().length >= 10) || "Mínimo 10 caracteres",
            semPalavroesProibidas: (v) => !/palavr[aã]o/i.test(v ?? "") || "Conteúdo inválido",
          },
        }}
        getFormErrorMessage={noError}
      />
      <div className="col-12">
        <Button type="submit" label="Validar" size="small" />
      </div>
    </form>
  );
}

function NoControlExample() {
  const [obs, setObs] = useState("");
  return (
    <div className="grid" style={{ width: "100%" }}>
      <TextAreaFieldSeplag
        name="obs"
        label="Observação livre"
        value={obs}
        onChange={setObs}
        maxLength={300}
        cols="12"
        rows={4}
        placeholder="Modo sem control — estado gerenciado externamente"
      />
      <div className="col-12">
        <small className="text-500">Valor atual: "{obs}"</small>
      </div>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Área de texto com auto-resize integrada com react-hook-form. Exibe contador de caracteres quando maxLength é definido.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { TextAreaFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<TextAreaFieldSeplag
  name="descricao"
  control={control}
  label="Descrição"
  placeholder="Descreva..."
  cols="12"
  rows={3}
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>

// Com contador de caracteres
<TextAreaFieldSeplag
  name="obs"
  control={control}
  label="Observações"
  maxLength={200}
  cols="12"
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>`,
  },
  {
    title: "Obrigatório e desabilitado",
    description:
      'A prop "required" injeta automaticamente a validação de obrigatório com mensagem baseada no label. Clique em "Validar" sem preencher para ver o erro.',
    example: <RequiredExample />,
    code: `<TextAreaFieldSeplag
  name="justificativa"
  control={control}
  label="Justificativa"
  required
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>

<TextAreaFieldSeplag
  name="campo"
  control={control}
  label="Campo"
  disabled
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>`,
  },
  {
    title: "Validação customizada",
    description:
      'Use "rules.validate" com uma função ou objeto de validações nomeadas. A validação de obrigatório (quando required=true) sempre roda antes das customizadas.',
    example: <CustomValidationExample />,
    code: `// Validação com função única
<TextAreaFieldSeplag
  name="descricao"
  control={control}
  label="Descrição"
  rules={{
    validate: (value) =>
      (value && value.trim().length >= 20) || "Mínimo de 20 caracteres",
  }}
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>

// Validações nomeadas (múltiplos critérios)
<TextAreaFieldSeplag
  name="motivo"
  control={control}
  label="Motivo"
  rules={{
    required: "Motivo é obrigatório",
    validate: {
      minCaracteres: (v) =>
        (v && v.trim().length >= 10) || "Mínimo 10 caracteres",
      semPalavroesProibidas: (v) =>
        !/palavr[aã]o/i.test(v ?? "") || "Conteúdo inválido",
    },
  }}
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>`,
  },
  {
    title: "Modo sem control (value + onChange)",
    description:
      "Quando control não é informado, o campo opera como textarea simples controlado externamente via value/onChange.",
    example: <NoControlExample />,
    code: `const [obs, setObs] = useState("");

<TextAreaFieldSeplag
  name="obs"
  label="Observação"
  value={obs}
  onChange={setObs}
  maxLength={300}
  cols="12"
  rows={4}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "name",
    type: "Path<T>",
    required: true,
    description: "Nome do campo no formulário (path do react-hook-form).",
  },
  {
    name: "control",
    type: "Control<T>",
    required: false,
    description:
      "Objeto control do useForm. Quando omitido, o campo opera em modo simples via value/onChange.",
  },
  {
    name: "label",
    type: "string",
    defaultValue: '""',
    required: false,
    description: "Rótulo exibido acima do campo.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12"',
    required: false,
    description: 'Largura via grid SEPLAG, ex: "12" ou "12 6".',
  },
  {
    name: "required",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Injeta automaticamente a validação de obrigatório com mensagem baseada no label.",
  },
  {
    name: "rules",
    type: "RegisterOptions<T>",
    required: false,
    description:
      "Regras do react-hook-form (validate, minLength, maxLength, required, etc.). Mescladas com a validação de required quando a prop required estiver ativa.",
  },
  {
    name: "value",
    type: "string",
    required: false,
    description: "Valor externo (modo sem control).",
  },
  {
    name: "onChange",
    type: "(value: string) => void",
    required: false,
    description: "Callback de mudança (modo sem control ou complementar ao control).",
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
    name: "rows",
    type: "number",
    defaultValue: "4",
    required: false,
    description: "Número de linhas visíveis.",
  },
  {
    name: "maxLength",
    type: "number",
    required: false,
    description: "Limite de caracteres. Exibe contador quando definido.",
  },
  {
    name: "placeholder",
    type: "string",
    required: false,
    description: "Texto de placeholder.",
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
    name: "autoComplete",
    type: "string",
    required: false,
    description:
      "Atributo HTML autocomplete repassado ao input. Por padrão o autocomplete do navegador " +
      "fica ativo; passe autoComplete=\"off\" para desativá-lo.",
  },
];

export default function TextAreaFieldDoc() {
  return (
    <DocPage
      title="TextAreaField"
      description="Campo de área de texto com auto-resize e contador de caracteres opcional. Integrado com react-hook-form e Rótulo SEPLAG."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
