import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r as t}from"./checkbox.esm-4xavqYZ-.js";import{s as n}from"./Fields-C8sVbz99.js";import{t as r}from"./DocPage-DfNa9OED.js";var i=e(),a=()=>null;function o(){let{control:e}=t({defaultValues:{aceito:`N`,newsletter:`N`}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`aceito`,control:e,label:`Termos de uso`,checkboxLabel:`Li e aceito os termos de uso`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`newsletter`,control:e,label:`Newsletter`,checkboxLabel:`Desejo receber novidades por e-mail`,cols:`12 6`,getFormErrorMessage:a})]})}var s=[{title:`Uso básico`,description:`Checkbox que armazena 'S' (marcado) ou 'N' (desmarcado) por padrão. Os valores podem ser customizados.`,example:(0,i.jsx)(o,{}),code:`import { useForm } from "react-hook-form";
import { CheckboxFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm({
  defaultValues: { aceito: "N" },
});

<CheckboxFieldSeplag
  name="aceito"
  control={control}
  label="Termos de uso"
  checkboxLabel="Li e aceito os termos de uso"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Valores customizados (ex: true/false)
<CheckboxFieldSeplag
  name="ativo"
  control={control}
  label="Ativo"
  checkboxLabel="Registro ativo"
  checkedValue={true}
  uncheckedValue={false}
  defaultValue={false}
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],c=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,required:!1,description:`Rótulo exibido acima do checkbox (RotuloSeplag).`},{name:`checkboxLabel`,type:`string`,required:!1,description:`Texto exibido ao lado do checkbox.`},{name:`cols`,type:`string`,defaultValue:`"12"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`checkedValue`,type:`any`,defaultValue:`"S"`,required:!1,description:`Valor gravado no formulário quando marcado.`},{name:`uncheckedValue`,type:`any`,defaultValue:`"N"`,required:!1,description:`Valor gravado no formulário quando desmarcado.`},{name:`defaultValue`,type:`any`,defaultValue:`"N"`,required:!1,description:`Valor inicial do campo.`},{name:`className`,type:`string`,required:!1,description:`Classe CSS aplicada ao wrapper.`},{name:`style`,type:`CSSProperties`,required:!1,description:`Estilo inline aplicado ao wrapper.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function l(){return(0,i.jsx)(r,{title:`CheckboxField`,description:`Campo de checkbox integrado com react-hook-form. Armazena valores customizáveis (padrão 'S'/'N'). Inclui rótulo no padrão SEPLAG e label ao lado do checkbox.`,badge:`Estável`,since:`v0.0.1`,sections:s,props:c})}export{l as default};