import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r as t}from"./checkbox.esm-4xavqYZ-.js";import{l as n}from"./Fields-DvUfwV1i.js";import{t as r}from"./DocPage-DfNa9OED.js";var i=e(),a=()=>null;function o(){let{control:e}=t({defaultValues:{cnpj:``,cnpjObrig:``}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`cnpj`,control:e,label:`CNPJ`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`cnpjObrig`,control:e,label:`CNPJ (obrigatório)`,cols:`12 6`,required:!0,getFormErrorMessage:a})]})}var s=[{title:`Uso básico`,description:`Campo de CNPJ com máscara 99.999.999/9999-99 e validação de dígitos verificadores.`,example:(0,i.jsx)(o,{}),code:`import { useForm } from "react-hook-form";
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
/>`}],c=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,defaultValue:`"CNPJ"`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12 6"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`validarCNPJ`,type:`boolean`,defaultValue:`true`,required:!1,description:`Ativa/desativa a validação dos dígitos verificadores.`},{name:`onBlur`,type:`() => void`,required:!1,description:`Callback executado ao sair do campo.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function l(){return(0,i.jsx)(r,{title:`CNPJField`,description:`Campo de CNPJ com máscara automática 99.999.999/9999-99 e validação dos dígitos verificadores, integrado com react-hook-form.`,badge:`Estável`,since:`v0.0.1`,sections:s,props:c})}export{l as default};