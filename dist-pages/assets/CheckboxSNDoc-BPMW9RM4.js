import{t as e}from"./jsx-runtime-DZnDww7V.js";import{X as t,Y as n,Z as r}from"./index-C2HNGO9s.js";import{t as i}from"./DocPage-Jz1L0ZQP.js";var a=e();function o(){let{control:e,watch:i}=r({defaultValues:{ativo:t.NAO}}),o=i(`ativo`);return(0,a.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`1.5rem`},children:[(0,a.jsx)(n,{name:`ativo`,control:e,label:`Ativo`}),(0,a.jsxs)(`span`,{style:{fontSize:`0.85rem`,color:`#6c757d`},children:[`Valor atual: `,(0,a.jsx)(`strong`,{children:o})]})]})}function s(){let{control:e}=r({defaultValues:{aprovado:t.SIM}});return(0,a.jsx)(n,{name:`aprovado`,control:e,label:`Aprovado (desabilitado)`,isDisabled:!0})}function c(){let{control:e,watch:t}=r({defaultValues:{status:`0`}}),i=t(`status`);return(0,a.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`1.5rem`},children:[(0,a.jsx)(n,{name:`status`,control:e,label:`Habilitado`,checkedValue:`1`,uncheckedValue:`0`}),(0,a.jsxs)(`span`,{style:{fontSize:`0.85rem`,color:`#6c757d`},children:[`Valor: `,(0,a.jsx)(`strong`,{children:i})]})]})}var l=[{title:`Uso básico`,description:`Checkbox controlado via react-hook-form que alterna entre os valores do enum CheckboxSNValorSeplag (padrão SEPLAG).`,example:(0,a.jsx)(o,{}),code:`import { useForm } from "react-hook-form";
  import { CheckboxSNSeplag, CheckboxSNValorSeplag } from "@seplag/ui-lib-react-18";

const { control } = useForm({ defaultValues: { ativo: CheckboxSNValorSeplag.NAO } });

<CheckboxSNSeplag name="ativo" control={control} label="Ativo" />`},{title:`Desabilitado`,description:`Use isDisabled para tornar o campo somente leitura.`,example:(0,a.jsx)(s,{}),code:`<CheckboxSNSeplag
  name="aprovado"
  control={control}
  label="Aprovado"
  isDisabled
/>`},{title:`Valores customizados`,description:`Altere os valores alternados via checkedValue e uncheckedValue.`,example:(0,a.jsx)(c,{}),code:`<CheckboxSNSeplag
  name="status"
  control={control}
  label="Habilitado"
  checkedValue="1"
  uncheckedValue="0"
/>`}],u=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário (react-hook-form).`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`label`,type:`string`,required:!0,description:`Texto exibido ao lado do checkbox.`},{name:`checkedValue`,type:`string`,defaultValue:`CheckboxSNValorSeplag.SIM`,required:!1,description:`Valor do campo quando marcado (padrão: CheckboxSNValorSeplag.SIM).`},{name:`uncheckedValue`,type:`string`,defaultValue:`CheckboxSNValorSeplag.NAO`,required:!1,description:`Valor do campo quando desmarcado (padrão: CheckboxSNValorSeplag.NAO).`},{name:`isDisabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita a interação com o checkbox.`}];function d(){return(0,a.jsx)(i,{title:`Checkbox S/N`,description:`Checkbox controlado via react-hook-form que persiste os valores "S" (Sim) e "N" (Não) — padrão amplamente utilizado nas telas SEPLAG.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { CheckboxSNSeplag, CheckboxSNValorSeplag } from "@seplag/ui-lib-react-18";`,sections:l,props:u})}export{d as default};