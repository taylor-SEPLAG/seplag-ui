import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r as t}from"./checkbox.esm-4xavqYZ-.js";import{u as n}from"./Fields-C8sVbz99.js";import{t as r}from"./DocPage-DfNa9OED.js";var i=e(),a=()=>null;function o(){let{control:e}=t({defaultValues:{telefone:``,cep:``}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`telefone`,control:e,label:`Telefone`,mask:`(99) 99999-9999`,placeholder:`(99) 99999-9999`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`cep`,control:e,label:`CEP`,mask:`99999-999`,placeholder:`00000-000`,cols:`12 6`,getFormErrorMessage:a})]})}var s=[{title:`Uso básico`,description:`Campo com máscara de entrada genérica. Use '9' para dígitos, 'a' para letras e '*' para alfanuméricos.`,example:(0,i.jsx)(o,{}),code:`import { useForm } from "react-hook-form";
import { MaskFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

<MaskFieldSeplag
  name="telefone"
  control={control}
  label="Telefone"
  mask="(99) 99999-9999"
  placeholder="(99) 99999-9999"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

<MaskFieldSeplag
  name="cep"
  control={control}
  label="CEP"
  mask="99999-999"
  placeholder="00000-000"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],c=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`mask`,type:`string`,defaultValue:`"99/99/9999"`,required:!1,description:`Máscara de entrada. Use 9 (dígito), a (letra), * (alfanumérico).`},{name:`placeholder`,type:`string`,defaultValue:`"dd/mm/yyyy"`,required:!1,description:`Texto de placeholder.`},{name:`cols`,type:`string`,defaultValue:`"12 6"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function l(){return(0,i.jsx)(r,{title:`MaskField`,description:`Campo com máscara de entrada genérica (InputMask do PrimeReact), integrado com react-hook-form. Use para telefones, CEP, datas ou qualquer formato fixo.`,badge:`Estável`,since:`v0.0.1`,sections:s,props:c})}export{l as default};