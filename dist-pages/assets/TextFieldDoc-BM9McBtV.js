import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r}from"./checkbox.esm-4xavqYZ-.js";import{t as i}from"./button.esm-CxeDfezL.js";import{v as a}from"./Fields-DvUfwV1i.js";import{t as o}from"./DocPage-DfNa9OED.js";var s=e(t(),1),c=n(),l=()=>null;function u(){let{control:e}=r({defaultValues:{nome:``,codigo:``}});return(0,c.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,c.jsx)(a,{name:`nome`,control:e,label:`Nome`,placeholder:`Digite o nome`,cols:`12 6`,getFormErrorMessage:l}),(0,c.jsx)(a,{name:`codigo`,control:e,label:`Código (somente letras/números)`,placeholder:`Ex: ABC123`,cols:`12 6`,allowNumberLetter:!0,getFormErrorMessage:l})]})}function d(){let{control:e,handleSubmit:t}=r({defaultValues:{nomeObrigatorio:``,campoDesabilitado:`Valor fixo`}});return(0,c.jsxs)(`form`,{className:`grid`,style:{width:`100%`},onSubmit:t(()=>{}),children:[(0,c.jsx)(a,{name:`nomeObrigatorio`,control:e,label:`Nome (obrigatório)`,placeholder:`Obrigatório — clique em Validar sem preencher`,cols:`12 6`,required:!0,getFormErrorMessage:l}),(0,c.jsx)(a,{name:`campoDesabilitado`,control:e,label:`Desabilitado`,cols:`12 6`,disabled:!0,getFormErrorMessage:l}),(0,c.jsx)(`div`,{className:`col-12`,children:(0,c.jsx)(i,{type:`submit`,label:`Validar`,size:`small`})})]})}function f(){let{control:e,handleSubmit:t}=r({defaultValues:{cpf:``,cnpj:``},mode:`onTouched`});return(0,c.jsxs)(`form`,{className:`grid`,style:{width:`100%`},onSubmit:t(()=>{}),children:[(0,c.jsx)(a,{name:`cpf`,control:e,label:`CPF`,placeholder:`Somente números, 11 dígitos`,cols:`12 6`,numbersOnly:!0,maxLength:11,rules:{validate:e=>/^\d{11}$/.test(e)||`CPF deve conter exatamente 11 dígitos`},getFormErrorMessage:l}),(0,c.jsx)(a,{name:`cnpj`,control:e,label:`CNPJ`,placeholder:`Somente números, 14 dígitos`,cols:`12 6`,numbersOnly:!0,maxLength:14,rules:{validate:{formato:e=>/^\d{14}$/.test(e)||`CNPJ deve conter exatamente 14 dígitos`,naoZeros:e=>e!==`00000000000000`||`CNPJ não pode ser somente zeros`}},getFormErrorMessage:l}),(0,c.jsx)(`div`,{className:`col-12`,children:(0,c.jsx)(i,{type:`submit`,label:`Validar`,size:`small`})})]})}function p(){let{control:e,handleSubmit:t}=r({defaultValues:{codigo:``,email:``},mode:`onTouched`});return(0,c.jsxs)(`form`,{className:`grid`,style:{width:`100%`},onSubmit:t(()=>{}),children:[(0,c.jsx)(a,{name:`codigo`,control:e,label:`Código (5–10 caracteres, maiúsculas e números)`,placeholder:`Ex: ABC12`,cols:`12 6`,required:!0,rules:{minLength:{value:5,message:`Mínimo 5 caracteres`},maxLength:{value:10,message:`Máximo 10 caracteres`},validate:e=>/^[A-Z0-9]+$/.test(e)||`Apenas maiúsculas e números`},getFormErrorMessage:l}),(0,c.jsx)(a,{name:`email`,control:e,label:`E-mail`,placeholder:`usuario@exemplo.com`,cols:`12 6`,required:!0,rules:{validate:e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)||`E-mail inválido`},getFormErrorMessage:l}),(0,c.jsx)(`div`,{className:`col-12`,children:(0,c.jsx)(i,{type:`submit`,label:`Validar`,size:`small`})})]})}function m(){let[e,t]=(0,s.useState)(``),[n,r]=(0,s.useState)(``);return(0,c.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,c.jsx)(a,{name:`telefone`,label:`Telefone (somente números)`,value:e,onChange:t,numbersOnly:!0,maxLength:11,cols:`12 6`,placeholder:`Ex: 31999999999`}),(0,c.jsx)(a,{name:`placa`,label:`Placa (sem espaços)`,value:n,onChange:r,noSpaces:!0,maxLength:7,cols:`12 6`,placeholder:`Ex: ABC1234`})]})}var h=[{title:`Uso básico`,description:`Campo de texto integrado com react-hook-form. O campo recebe control do useForm e exibe rótulo SEPLAG.`,example:(0,c.jsx)(u,{}),code:`import { useForm } from "react-hook-form";
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
/>`},{title:`Obrigatório e desabilitado`,description:`A prop "required" injeta automaticamente a validação de obrigatório com a mensagem baseada no label. Clique em "Validar" sem preencher para ver o erro.`,example:(0,c.jsx)(d,{}),code:`// Obrigatório: valida que o campo não está vazio nem somente espaços
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
/>`},{title:`Validação customizada`,description:`Use "rules.validate" para validar o valor com uma função própria. Pode ser uma única função ou um objeto com validações nomeadas. Preencha com valores inválidos e clique em "Validar".`,example:(0,c.jsx)(f,{}),code:`// Validação com função única
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
/>`},{title:`rules com required + minLength/maxLength + validate`,description:`Combine "required" (prop) com "rules" para adicionar critérios extras. A validação de obrigatório sempre roda primeiro.`,example:(0,c.jsx)(p,{}),code:`<TextFieldSeplag
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
/>`},{title:`Modo sem control (value + onChange)`,description:`Quando control não é informado, o campo opera como input simples controlado via value/onChange. Útil fora de contextos de formulário react-hook-form.`,example:(0,c.jsx)(m,{}),code:`const [telefone, setTelefone] = useState("");

<TextFieldSeplag
  name="telefone"
  label="Telefone"
  value={telefone}
  onChange={setTelefone}
  numbersOnly
  maxLength={11}
  cols="12 6"
/>`}],g=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário (path do react-hook-form).`},{name:`control`,type:`Control<T>`,required:!1,description:`Objeto control do useForm. Quando omitido, o campo opera em modo simples via value/onChange.`},{name:`label`,type:`string`,defaultValue:`""`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12 6"`,required:!1,description:`Largura via grid SEPLAG, ex: "12 6" ou "12 4".`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Injeta automaticamente a validação de obrigatório com mensagem baseada no label. Equivale a rules.required + validate que rejeita strings de espaços.`},{name:`rules`,type:`RegisterOptions<T>`,required:!1,description:`Regras do react-hook-form (validate, minLength, maxLength, required, etc.). Mescladas com a validação de required quando a prop required estiver ativa.`},{name:`value`,type:`string`,required:!1,description:`Valor externo (modo sem control).`},{name:`onChange`,type:`(value: string) => void`,required:!1,description:`Callback de mudança (modo sem control, ou complementar ao control).`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode`,required:!1,deprecated:!0,deprecationMessage:"DEPRECATED — Use react-hook-form error handling (fieldState.error) ou passe validações via `rules`",description:`Compatibilidade legada: quando retorna um nó válido, tem prioridade sobre o erro interno do react-hook-form.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, o campo não é renderizado.`},{name:`placeholder`,type:`string`,required:!1,description:`Texto de placeholder.`},{name:`maxLength`,type:`number`,required:!1,description:`Limite de caracteres.`},{name:`icon`,type:`string`,required:!1,description:`Ícone PrimeIcons exibido à direita, ex: "pi pi-search".`},{name:`numbersOnly`,type:`boolean`,defaultValue:`false`,required:!1,description:`Permite apenas dígitos (0-9).`},{name:`noSpaces`,type:`boolean`,defaultValue:`false`,required:!1,description:`Remove todos os espaços digitados.`},{name:`allowMoreThanOneSpace`,type:`boolean`,defaultValue:`false`,required:!1,description:`Permite mais de um espaço consecutivo.`},{name:`allowNumberLetter`,type:`boolean`,defaultValue:`false`,required:!1,description:`Permite apenas letras e números (sem especiais).`},{name:`autoTrimOnBlur`,type:`boolean`,defaultValue:`true`,required:!1,description:`Remove espaços nas extremidades ao sair do campo.`}];function _(){return(0,c.jsx)(o,{title:`TextField`,description:`Campo de texto simples padrão SEPLAG, integrado com react-hook-form. Suporta trimming automático, restrições de caracteres e exibição de ícone.`,badge:`Estável`,since:`v0.0.1`,sections:h,props:g})}export{_ as default};