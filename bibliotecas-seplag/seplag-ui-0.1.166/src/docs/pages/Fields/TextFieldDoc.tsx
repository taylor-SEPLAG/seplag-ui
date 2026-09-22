import { useState } from "react";
import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { TextFieldSeplag } from "@componentes/Fields";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css";

const noError = () => null;

function BasicExample() {
  const { control } = useForm({ defaultValues: { nome: "", codigo: "" } });
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
      <TextFieldSeplag
        name="codigo"
        control={control}
        label="Código (somente letras/números)"
        placeholder="Ex: ABC123"
        cols="12 6"
        allowNumberLetter
        getFormErrorMessage={noError}
      />
    </div>
  );
}

function RequiredExample() {
  const { control, handleSubmit } = useForm({
    defaultValues: { nomeObrigatorio: "", campoDesabilitado: "Valor fixo" },
  });
  return (
    <form className="grid" style={{ width: "100%" }} onSubmit={handleSubmit(() => {})}>
      <TextFieldSeplag
        name="nomeObrigatorio"
        control={control}
        label="Nome (obrigatório)"
        placeholder="Obrigatório — clique em Validar sem preencher"
        cols="12 6"
        required
        getFormErrorMessage={noError}
      />
      <TextFieldSeplag
        name="campoDesabilitado"
        control={control}
        label="Desabilitado"
        cols="12 6"
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
    defaultValues: { cpf: "", cnpj: "" },
    mode: "onTouched",
  });

  const isValidCpf = (v: string) => /^\d{11}$/.test(v) || "CPF deve conter exatamente 11 dígitos";

  const isCnpjValid = (v: string) => /^\d{14}$/.test(v) || "CNPJ deve conter exatamente 14 dígitos";

  return (
    <form className="grid" style={{ width: "100%" }} onSubmit={handleSubmit(() => {})}>
      <TextFieldSeplag
        name="cpf"
        control={control}
        label="CPF"
        placeholder="Somente números, 11 dígitos"
        cols="12 6"
        numbersOnly
        maxLength={11}
        rules={{ validate: isValidCpf }}
        getFormErrorMessage={noError}
      />
      <TextFieldSeplag
        name="cnpj"
        control={control}
        label="CNPJ"
        placeholder="Somente números, 14 dígitos"
        cols="12 6"
        numbersOnly
        maxLength={14}
        rules={{
          validate: {
            formato: isCnpjValid,
            naoZeros: (v) => v !== "00000000000000" || "CNPJ não pode ser somente zeros",
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

function RulesExample() {
  const { control, handleSubmit } = useForm({
    defaultValues: { codigo: "", email: "" },
    mode: "onTouched",
  });
  return (
    <form className="grid" style={{ width: "100%" }} onSubmit={handleSubmit(() => {})}>
      <TextFieldSeplag
        name="codigo"
        control={control}
        label="Código (5–10 caracteres, maiúsculas e números)"
        placeholder="Ex: ABC12"
        cols="12 6"
        required
        rules={{
          minLength: { value: 5, message: "Mínimo 5 caracteres" },
          maxLength: { value: 10, message: "Máximo 10 caracteres" },
          validate: (v) => /^[A-Z0-9]+$/.test(v) || "Apenas maiúsculas e números",
        }}
        getFormErrorMessage={noError}
      />
      <TextFieldSeplag
        name="email"
        control={control}
        label="E-mail"
        placeholder="usuario@exemplo.com"
        cols="12 6"
        required
        rules={{
          validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "E-mail inválido",
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
  const [telefone, setTelefone] = useState("");
  const [placa, setPlaca] = useState("");
  return (
    <div className="grid" style={{ width: "100%" }}>
      <TextFieldSeplag
        name="telefone"
        label="Telefone (somente números)"
        value={telefone}
        onChange={setTelefone}
        numbersOnly
        maxLength={11}
        cols="12 6"
        placeholder="Ex: 31999999999"
      />
      <TextFieldSeplag
        name="placa"
        label="Placa (sem espaços)"
        value={placa}
        onChange={setPlaca}
        noSpaces
        maxLength={7}
        cols="12 6"
        placeholder="Ex: ABC1234"
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Campo de texto integrado com react-hook-form. O campo recebe control do useForm e exibe rótulo SEPLAG.",
    example: <BasicExample />,
    code: `import { useForm } from "react-hook-form";
import { TextFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<TextFieldSeplag
  name="nome"
  control={control}
  label="Nome"
  placeholder="Digite o nome"
  cols="12 6"
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>`,
  },
  {
    title: "Obrigatório e desabilitado",
    description:
      'A prop "required" injeta automaticamente a validação de obrigatório com a mensagem baseada no label. Clique em "Validar" sem preencher para ver o erro.',
    example: <RequiredExample />,
    code: `// Obrigatório: valida que o campo não está vazio nem somente espaços
<TextFieldSeplag
  name="nome"
  control={control}
  label="Nome"
  required
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>

// Desabilitado
<TextFieldSeplag
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
      'Use "rules.validate" para validar o valor com uma função própria. Pode ser uma única função ou um objeto com validações nomeadas. Preencha com valores inválidos e clique em "Validar".',
    example: <CustomValidationExample />,
    code: `// Validação com função única
<TextFieldSeplag
  name="cpf"
  control={control}
  label="CPF"
  numbersOnly
  maxLength={11}
  rules={{
    validate: (value) =>
      /^\\d{11}$/.test(value) || "CPF deve conter exatamente 11 dígitos",
  }}
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>

// Validações nomeadas (múltiplos critérios)
<TextFieldSeplag
  name="cnpj"
  control={control}
  label="CNPJ"
  numbersOnly
  maxLength={14}
  rules={{
    validate: {
      formato: (v) => /^\\d{14}$/.test(v) || "CNPJ deve ter 14 dígitos",
      naoZeros: (v) =>
        v !== "00000000000000" || "CNPJ não pode ser somente zeros",
    },
  }}
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>`,
  },
  {
    title: "rules com required + minLength/maxLength + validate",
    description:
      'Combine "required" (prop) com "rules" para adicionar critérios extras. A validação de obrigatório sempre roda primeiro.',
    example: <RulesExample />,
    code: `<TextFieldSeplag
  name="codigo"
  control={control}
  label="Código"
  required
  rules={{
    minLength: { value: 5, message: "Mínimo 5 caracteres" },
    maxLength: { value: 10, message: "Máximo 10 caracteres" },
    validate: (value) =>
      /^[A-Z0-9]+$/.test(value) || "Apenas maiúsculas e números",
  }}
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>

// Você também pode passar required dentro de rules:
<TextFieldSeplag
  name="email"
  control={control}
  label="E-mail"
  rules={{
    required: "E-mail é obrigatório",
    validate: (v) =>
      /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v) || "E-mail inválido",
  }}
  getFormErrorMessage={(name) =>
    errors[name] && <small className="p-error">{errors[name].message}</small>
  }
/>`,
  },
  {
    title: "Modo sem control (value + onChange)",
    description:
      "Quando control não é informado, o campo opera como input simples controlado via value/onChange. Útil fora de contextos de formulário react-hook-form.",
    example: <NoControlExample />,
    code: `const [telefone, setTelefone] = useState("");

<TextFieldSeplag
  name="telefone"
  label="Telefone"
  value={telefone}
  onChange={setTelefone}
  numbersOnly
  maxLength={11}
  cols="12 6"
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
    defaultValue: '"12 6"',
    required: false,
    description: 'Largura via grid SEPLAG, ex: "12 6" ou "12 4".',
  },
  {
    name: "required",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Injeta automaticamente a validação de obrigatório com mensagem baseada no label. Equivale a rules.required + validate que rejeita strings de espaços.",
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
    description: "Callback de mudança (modo sem control, ou complementar ao control).",
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
    name: "placeholder",
    type: "string",
    required: false,
    description: "Texto de placeholder.",
  },
  {
    name: "maxLength",
    type: "number",
    required: false,
    description: "Limite de caracteres.",
  },
  {
    name: "icon",
    type: "string",
    required: false,
    description: 'Ícone PrimeIcons exibido à direita, ex: "pi pi-search".',
  },
  {
    name: "numbersOnly",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Permite apenas dígitos (0-9).",
  },
  {
    name: "noSpaces",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Remove todos os espaços digitados.",
  },
  {
    name: "allowMoreThanOneSpace",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Permite mais de um espaço consecutivo.",
  },
  {
    name: "allowNumberLetter",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Permite apenas letras e números (sem especiais).",
  },
  {
    name: "autoTrimOnBlur",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Remove espaços nas extremidades ao sair do campo.",
  },
  {
    name: "autoComplete",
    type: "string",
    required: false,
    description:
      "Atributo HTML autocomplete repassado ao input. Por padrão o autocomplete do navegador " +
      "fica ativo (comportamento nativo); passe autoComplete=\"off\" para desativá-lo em campos " +
      "sensíveis (ex.: senhas, dados que não devem ser sugeridos pelo navegador).",
  },
];

export default function TextFieldDoc() {
  return (
    <DocPage
      title="TextField"
      description="Campo de texto simples padrão SEPLAG, integrado com react-hook-form. Suporta trimming automático, restrições de caracteres e exibição de ícone."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
