import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r as t}from"./checkbox.esm-4xavqYZ-.js";import{f as n}from"./Fields-DvUfwV1i.js";import{t as r}from"./DocPage-DfNa9OED.js";var i=e(),a=()=>null;function o(){let{control:e}=t({defaultValues:{ativo:`S`,notificacoes:`N`}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`ativo`,control:e,label:`Ativo`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`notificacoes`,control:e,label:`Notificações`,cols:`12 6`,textTooltip:`Habilita notificações por e-mail`,getFormErrorMessage:a})]})}function s(){let{control:e}=t({defaultValues:{vertical:`S`,horizontal:`S`}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`vertical`,control:e,label:`horizontal={false}`,cols:`12 6`,horizontal:!1,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`horizontal`,control:e,label:`horizontal={true}`,cols:`12 6`,horizontal:!0,getFormErrorMessage:a})]})}var c=[{title:`Uso básico`,description:`Toggle que armazena 'S' (ligado) ou 'N' (desligado). Suporta tooltip.`,example:(0,i.jsx)(o,{}),code:`import { useForm } from "react-hook-form";
import { SwitchFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm({
  defaultValues: { ativo: "S" },
});

<SwitchFieldSeplag
  name="ativo"
  control={control}
  label="Ativo"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`},{title:`Layout horizontal`,description:`A prop horizontal controla a orientação entre o rótulo e o switch. Com false (padrão) o rótulo fica acima; com true ficam lado a lado.`,example:(0,i.jsx)(s,{}),code:`// horizontal={false} — rótulo acima (padrão)
<SwitchFieldSeplag
  name="vertical"
  control={control}
  label="Publicado"
  cols="12 6"
  horizontal={false}
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// horizontal={true} — rótulo e switch lado a lado
<SwitchFieldSeplag
  name="horizontal"
  control={control}
  label="Publicado"
  cols="12 6"
  horizontal
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],l=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,required:!1,description:`Rótulo exibido acima do switch.`},{name:`cols`,type:`string`,defaultValue:`"12 6"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`horizontal`,type:`boolean`,defaultValue:`false`,required:!1,description:`Layout horizontal: rótulo e switch lado a lado.`},{name:`textTooltip`,type:`string`,required:!1,description:`Texto do tooltip exibido ao passar o mouse.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function u(){return(0,i.jsx)(r,{title:`SwitchField`,description:`Campo toggle (InputSwitch) que armazena 'S' ou 'N'. Integrado com react-hook-form. Suporta tooltip e layout horizontal.`,badge:`Estável`,since:`v0.0.1`,sections:c,props:l})}export{u as default};