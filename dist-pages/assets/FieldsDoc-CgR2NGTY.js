import{t as e}from"./jsx-runtime-ChuIQw48.js";import{A as t,C as n,D as r,E as i,K as a,M as o,N as s,O as c,P as l,S as u,j as d}from"./index-DyeHa39m.js";import{t as f}from"./DocPage-CHgTh2J-.js";var p=e(),m=()=>null;function h(){let{control:e}=a({defaultValues:{nome:``,email:``,descricao:``}});return(0,p.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,p.jsx)(s,{name:`nome`,control:e,label:`Nome`,placeholder:`Digite o nome`,cols:`12 6`,getFormErrorMessage:m}),(0,p.jsx)(t,{name:`email`,control:e,label:`E-mail`,placeholder:`email@seplag.mt.gov.br`,cols:`12 6`,getFormErrorMessage:m}),(0,p.jsx)(o,{name:`descricao`,control:e,label:`Descrição`,placeholder:`Descreva...`,cols:`12`,getFormErrorMessage:m})]})}function g(){let{control:e}=a({defaultValues:{quantidade:0,cpf:``,cnpj:``,telefone:``}});return(0,p.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,p.jsx)(r,{name:`quantidade`,control:e,label:`Quantidade`,cols:`12 4`,getFormErrorMessage:m}),(0,p.jsx)(u,{name:`cpf`,control:e,label:`CPF`,cols:`12 4`,getFormErrorMessage:m}),(0,p.jsx)(n,{name:`cnpj`,control:e,label:`CNPJ`,cols:`12 4`,getFormErrorMessage:m}),(0,p.jsx)(i,{name:`telefone`,control:e,label:`Telefone`,mask:`(99) 99999-9999`,cols:`12 4`,getFormErrorMessage:m})]})}function _(){let{control:e}=a({defaultValues:{uf:null,nascimento:null,ativo:!1}});return(0,p.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,p.jsx)(d,{name:`uf`,control:e,label:`UF`,options:[{label:`Mato Grosso`,value:`MT`},{label:`São Paulo`,value:`SP`},{label:`Rio de Janeiro`,value:`RJ`}],optionLabel:`label`,optionValue:`value`,cols:`12 6`,getFormErrorMessage:m}),(0,p.jsx)(l,{name:`nascimento`,control:e,label:`Data de Nascimento`,cols:`12 6`,getFormErrorMessage:m}),(0,p.jsx)(c,{name:`ativo`,control:e,label:`Ativo`,cols:`12`,getFormErrorMessage:m})]})}var v=[{title:`Campos de texto`,description:`TextField, EmailField e TextAreaField — todos integrados com react-hook-form e Rótulo SEPLAG.`,example:(0,p.jsx)(h,{}),code:`import { useForm } from "react-hook-form";
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
/>`},{title:`Campos numéricos e formatados`,description:`NumberField, CPFField, CNPJField e MaskField com máscara automática.`,example:(0,p.jsx)(g,{}),code:`<NumberFieldSeplag  name="quantidade" control={control} label="Quantidade" cols="12 4" />
<CPFFieldSeplag     name="cpf"        control={control} label="CPF"        cols="12 4" />
<CNPJFieldSeplag    name="cnpj"       control={control} label="CNPJ"       cols="12 4" />
<MaskFieldSeplag
  name="telefone"
  control={control}
  label="Telefone"
  mask="(99) 99999-9999"
  cols="12 4"
/>`},{title:`Seleção e data`,description:`DropdownField, DateField e SwitchField para escolha de valores.`,example:(0,p.jsx)(_,{}),code:`<DropdownFieldSeplag
  name="uf"
  control={control}
  label="UF"
  options={[{ label: "Mato Grosso", value: "MT" }]}
  optionLabel="label"
  optionValue="value"
  cols="12 6"
/>
<DateFieldSeplag name="nascimento" control={control} label="Data de Nascimento" cols="12 6" />
<SwitchFieldSeplag name="ativo"   control={control} label="Ativo" cols="12" />`}],y=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário (react-hook-form).`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,required:!1,description:`Rótulo do campo.`},{name:`cols`,type:`string`,defaultValue:`"12"`,required:!1,description:`Largura via grid SEPLAG, ex: "12 6" (col-12 col-md-6).`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Adiciona asterisco e validação de campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, o campo não é renderizado.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro do campo.`},{name:`placeholder`,type:`string`,required:!1,description:`Texto de placeholder (TextField, Email, TextArea, Mask).`},{name:`mask`,type:`string`,required:!1,description:`MaskField: máscara de entrada, ex: "(99) 99999-9999".`},{name:`options`,type:`object[]`,required:!1,description:`DropdownField / MultiSelect: lista de opções.`}];function b(){return(0,p.jsx)(f,{title:`Campos de Formulário`,description:`Conjunto de campos de formulário padrão SEPLAG, todos integrados com react-hook-form e encapsulados com o Rótulo. Incluem: TextField, TextArea, Email, Number, CPF, CNPJ, Mask, Date, Dropdown, Switch e mais.`,badge:`Estável`,since:`v0.0.1`,sections:v,props:y})}export{b as default};