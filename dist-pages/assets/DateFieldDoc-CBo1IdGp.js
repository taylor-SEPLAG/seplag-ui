import{t as e}from"./jsx-runtime-ChuIQw48.js";import{K as t,P as n}from"./index-DyeHa39m.js";import{t as r}from"./DocPage-CHgTh2J-.js";var i=e(),a=()=>null;function o(){let{control:e}=t({defaultValues:{nascimento:null,admissao:null}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`nascimento`,control:e,label:`Data de Nascimento`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`admissao`,control:e,label:`Data de Admissão (obrigatória)`,cols:`12 6`,required:!0,getFormErrorMessage:a})]})}function s(){let{control:e,watch:r}=t({defaultValues:{dataInicio:null,dataFim:null}}),o=r(`dataInicio`);return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`dataInicio`,control:e,label:`Data Início`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`dataFim`,control:e,label:`Data Fim`,cols:`12 6`,validateAfterDate:o??void 0,validateAfterMessage:`Data fim não pode ser anterior à data início`,getFormErrorMessage:a})]})}var c=[{title:`Uso básico`,description:`Calendário com máscara, locale pt-BR e ícone de abertura.`,example:(0,i.jsx)(o,{}),code:`import { useForm } from "react-hook-form";
import { DateFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<DateFieldSeplag
  name="nascimento"
  control={control}
  label="Data de Nascimento"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`},{title:`Intervalo de datas`,description:`Use validateAfterDate para garantir que a data fim seja após a data início.`,example:(0,i.jsx)(s,{}),code:`const dataInicio = watch("dataInicio");

<DateFieldSeplag
  name="dataInicio"
  control={control}
  label="Data Início"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>
<DateFieldSeplag
  name="dataFim"
  control={control}
  label="Data Fim"
  cols="12 6"
  validateAfterDate={dataInicio}
  validateAfterMessage="Data fim não pode ser anterior à data início"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],l=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12 6 3"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`placeholder`,type:`string`,defaultValue:`"dd/mm/aaaa"`,required:!1,description:`Texto de placeholder.`},{name:`dateFormat`,type:`string`,defaultValue:`"dd/mm/yy"`,required:!1,description:`Formato de exibição da data.`},{name:`mask`,type:`string`,defaultValue:`"99/99/9999"`,required:!1,description:`Máscara do input de texto.`},{name:`view`,type:`"date" | "month" | "year"`,defaultValue:`"date"`,required:!1,description:`Modo de visualização do calendário.`},{name:`minDate`,type:`Date`,required:!1,description:`Data mínima selecionável.`},{name:`maxDate`,type:`Date`,required:!1,description:`Data máxima selecionável.`},{name:`validateAfterDate`,type:`string`,required:!1,description:`Data de referência: o campo não pode ser anterior a ela.`},{name:`validateAfterMessage`,type:`string`,required:!1,description:`Mensagem de erro quando validateAfterDate falha.`},{name:`customValidation`,type:`Validate | Record<string, Validate>`,required:!1,description:`Validações customizadas do react-hook-form.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function u(){return(0,i.jsx)(r,{title:`DateField`,description:`Campo de data com calendário PrimeReact, locale pt-BR, máscara e suporte a intervalo de datas com validação automática.`,badge:`Estável`,since:`v0.0.1`,sections:c,props:l})}export{u as default};