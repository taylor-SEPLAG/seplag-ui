import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r as t}from"./checkbox.esm-4xavqYZ-.js";import{d as n}from"./Fields-C8sVbz99.js";import{t as r}from"./DocPage-DfNa9OED.js";var i=e(),a=()=>null;function o(){let{control:e}=t({defaultValues:{qtd:null,idade:null}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`qtd`,control:e,label:`Quantidade`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`idade`,control:e,label:`Idade (0–120)`,cols:`12 6`,min:0,max:120,getFormErrorMessage:a})]})}var s=[{title:`Uso básico`,description:`Campo numérico inteiro sem agrupamento (sem separador de milhares).`,example:(0,i.jsx)(o,{}),code:`import { useForm } from "react-hook-form";
import { NumberFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<NumberFieldSeplag
  name="qtd"
  control={control}
  label="Quantidade"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Com limites min/max
<NumberFieldSeplag
  name="idade"
  control={control}
  label="Idade"
  min={0}
  max={120}
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],c=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12 6"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`min`,type:`number`,required:!1,description:`Valor mínimo permitido.`},{name:`max`,type:`number`,required:!1,description:`Valor máximo permitido.`},{name:`inputStyle`,type:`CSSProperties`,required:!1,description:`Estilo inline aplicado ao input interno.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function l(){return(0,i.jsx)(r,{title:`NumberField`,description:`Campo numérico inteiro sem agrupamento de dígitos, integrado com react-hook-form. Suporta limites mínimo e máximo.`,badge:`Estável`,since:`v0.0.1`,sections:s,props:c})}export{l as default};