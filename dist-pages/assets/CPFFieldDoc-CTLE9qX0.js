import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r as t}from"./checkbox.esm-4xavqYZ-.js";import{c as n}from"./Fields-C5oQemj6.js";import{t as r}from"./DocPage-DNS5xyAT.js";var i=e(),a=()=>null;function o(){let{control:e}=t({defaultValues:{cpf:``,cpfObrig:``}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`cpf`,control:e,label:`CPF`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`cpfObrig`,control:e,label:`CPF (obrigatório)`,cols:`12 6`,required:!0,getFormErrorMessage:a})]})}var s=[{title:`Uso básico`,description:`Campo de CPF com máscara 999.999.999-99 aplicada automaticamente.`,example:(0,i.jsx)(o,{}),code:`import { useForm } from "react-hook-form";
import { CPFFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<CPFFieldSeplag
  name="cpf"
  control={control}
  label="CPF"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],c=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,defaultValue:`"CPF"`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12 6"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function l(){return(0,i.jsx)(r,{title:`CPFField`,description:`Campo de CPF com máscara automática 999.999.999-99, integrado com react-hook-form.`,badge:`Estável`,since:`v0.0.1`,sections:s,props:c})}export{l as default};