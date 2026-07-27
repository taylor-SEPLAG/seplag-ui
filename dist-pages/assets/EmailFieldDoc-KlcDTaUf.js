import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r as t}from"./checkbox.esm-4xavqYZ-.js";import{h as n}from"./Fields-C5oQemj6.js";import{t as r}from"./DocPage-DNS5xyAT.js";var i=e(),a=()=>null;function o(){let{control:e}=t({defaultValues:{email:``,emailInst:``}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`email`,control:e,label:`E-mail`,placeholder:`usuario@dominio.com`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`emailInst`,control:e,label:`E-mail institucional (obrigatório)`,placeholder:`usuario@seplag.mt.gov.br`,cols:`12 6`,required:!0,getFormErrorMessage:a})]})}var s=[{title:`Uso básico`,description:`Campo de e-mail com validação de formato automática e remoção de espaços.`,example:(0,i.jsx)(o,{}),code:`import { useForm } from "react-hook-form";
import { EmailFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<EmailFieldSeplag
  name="email"
  control={control}
  label="E-mail"
  placeholder="usuario@dominio.com"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Obrigatório
<EmailFieldSeplag
  name="email"
  control={control}
  label="E-mail institucional"
  required
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],c=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,defaultValue:`"E-mail"`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12 6"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`placeholder`,type:`string`,defaultValue:`"Digite o e-mail"`,required:!1,description:`Texto de placeholder.`},{name:`maxLength`,type:`number`,defaultValue:`100`,required:!1,description:`Limite de caracteres.`},{name:`autoTrimOnBlur`,type:`boolean`,defaultValue:`true`,required:!1,description:`Remove espaços ao sair do campo.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function l(){return(0,i.jsx)(r,{title:`EmailField`,description:`Campo de e-mail com validação de formato automática (regex), remoção de espaços em tempo real e integração com react-hook-form.`,badge:`Estável`,since:`v0.0.1`,sections:s,props:c})}export{l as default};