import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r}from"./checkbox.esm-4xavqYZ-.js";import{t as i}from"./button.esm-CxeDfezL.js";import{_ as a}from"./Fields-Zarl6JUN.js";import{t as o}from"./DocPage-DfNa9OED.js";var s=e(t(),1),c=n(),l=()=>null;function u(){let{control:e}=r({defaultValues:{descricao:``,obs:``}});return(0,c.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,c.jsx)(a,{name:`descricao`,control:e,label:`Descrição`,placeholder:`Descreva...`,cols:`12`,rows:3,getFormErrorMessage:l}),(0,c.jsx)(a,{name:`obs`,control:e,label:`Observações (máx. 200 caracteres)`,placeholder:`Digite suas observações...`,cols:`12`,rows:4,maxLength:200,getFormErrorMessage:l})]})}function d(){let{control:e,handleSubmit:t}=r({defaultValues:{justificativa:``,campoDesabilitado:`Valor fixo`}});return(0,c.jsxs)(`form`,{className:`grid`,style:{width:`100%`},onSubmit:t(()=>{}),children:[(0,c.jsx)(a,{name:`justificativa`,control:e,label:`Justificativa (obrigatória)`,placeholder:`Obrigatório — clique em Validar sem preencher`,cols:`12`,required:!0,getFormErrorMessage:l}),(0,c.jsx)(a,{name:`campoDesabilitado`,control:e,label:`Desabilitado`,cols:`12`,disabled:!0,getFormErrorMessage:l}),(0,c.jsx)(`div`,{className:`col-12`,children:(0,c.jsx)(i,{type:`submit`,label:`Validar`,size:`small`})})]})}function f(){let{control:e,handleSubmit:t}=r({defaultValues:{descricao:``,motivo:``},mode:`onTouched`});return(0,c.jsxs)(`form`,{className:`grid`,style:{width:`100%`},onSubmit:t(()=>{}),children:[(0,c.jsx)(a,{name:`descricao`,control:e,label:`Descrição (mín. 20 caracteres)`,placeholder:`Digite pelo menos 20 caracteres`,cols:`12`,rows:3,rules:{validate:e=>e&&e.trim().length>=20||`Mínimo de 20 caracteres`},getFormErrorMessage:l}),(0,c.jsx)(a,{name:`motivo`,control:e,label:`Motivo (validações nomeadas)`,placeholder:`Digite o motivo`,cols:`12`,rows:3,rules:{required:`Motivo é obrigatório`,validate:{minCaracteres:e=>e&&e.trim().length>=10||`Mínimo 10 caracteres`,semPalavroesProibidas:e=>!/palavr[aã]o/i.test(e??``)||`Conteúdo inválido`}},getFormErrorMessage:l}),(0,c.jsx)(`div`,{className:`col-12`,children:(0,c.jsx)(i,{type:`submit`,label:`Validar`,size:`small`})})]})}function p(){let[e,t]=(0,s.useState)(``);return(0,c.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,c.jsx)(a,{name:`obs`,label:`Observação livre`,value:e,onChange:t,maxLength:300,cols:`12`,rows:4,placeholder:`Modo sem control — estado gerenciado externamente`}),(0,c.jsx)(`div`,{className:`col-12`,children:(0,c.jsxs)(`small`,{className:`text-500`,children:[`Valor atual: "`,e,`"`]})})]})}var m=[{title:`Uso básico`,description:`Área de texto com auto-resize integrada com react-hook-form. Exibe contador de caracteres quando maxLength é definido.`,example:(0,c.jsx)(u,{}),code:`import { useForm } from "react-hook-form";
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
/>`},{title:`Obrigatório e desabilitado`,description:`A prop "required" injeta automaticamente a validação de obrigatório com mensagem baseada no label. Clique em "Validar" sem preencher para ver o erro.`,example:(0,c.jsx)(d,{}),code:`<TextAreaFieldSeplag
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
/>`},{title:`Validação customizada`,description:`Use "rules.validate" com uma função ou objeto de validações nomeadas. A validação de obrigatório (quando required=true) sempre roda antes das customizadas.`,example:(0,c.jsx)(f,{}),code:`// Validação com função única
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
/>`},{title:`Modo sem control (value + onChange)`,description:`Quando control não é informado, o campo opera como textarea simples controlado externamente via value/onChange.`,example:(0,c.jsx)(p,{}),code:`const [obs, setObs] = useState("");

<TextAreaFieldSeplag
  name="obs"
  label="Observação"
  value={obs}
  onChange={setObs}
  maxLength={300}
  cols="12"
  rows={4}
/>`}],h=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário (path do react-hook-form).`},{name:`control`,type:`Control<T>`,required:!1,description:`Objeto control do useForm. Quando omitido, o campo opera em modo simples via value/onChange.`},{name:`label`,type:`string`,defaultValue:`""`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12"`,required:!1,description:`Largura via grid SEPLAG, ex: "12" ou "12 6".`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Injeta automaticamente a validação de obrigatório com mensagem baseada no label.`},{name:`rules`,type:`RegisterOptions<T>`,required:!1,description:`Regras do react-hook-form (validate, minLength, maxLength, required, etc.). Mescladas com a validação de required quando a prop required estiver ativa.`},{name:`value`,type:`string`,required:!1,description:`Valor externo (modo sem control).`},{name:`onChange`,type:`(value: string) => void`,required:!1,description:`Callback de mudança (modo sem control ou complementar ao control).`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode`,required:!1,deprecated:!0,deprecationMessage:"DEPRECATED — Use react-hook-form error handling (fieldState.error) ou passe validações via `rules`",description:`Compatibilidade legada: quando retorna um nó válido, tem prioridade sobre o erro interno do react-hook-form.`},{name:`rows`,type:`number`,defaultValue:`4`,required:!1,description:`Número de linhas visíveis.`},{name:`maxLength`,type:`number`,required:!1,description:`Limite de caracteres. Exibe contador quando definido.`},{name:`placeholder`,type:`string`,required:!1,description:`Texto de placeholder.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, o campo não é renderizado.`}];function g(){return(0,c.jsx)(o,{title:`TextAreaField`,description:`Campo de área de texto com auto-resize e contador de caracteres opcional. Integrado com react-hook-form e Rótulo SEPLAG.`,badge:`Estável`,since:`v0.0.1`,sections:m,props:h})}export{g as default};