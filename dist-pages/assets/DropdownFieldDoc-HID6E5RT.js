import{t as e}from"./jsx-runtime-ChuIQw48.js";import{K as t,j as n}from"./index-DyeHa39m.js";import{t as r}from"./DocPage-CHgTh2J-.js";var i=e(),a=()=>null,o=[{label:`Mato Grosso`,value:`MT`},{label:`São Paulo`,value:`SP`},{label:`Rio de Janeiro`,value:`RJ`},{label:`Minas Gerais`,value:`MG`},{label:`Bahia`,value:`BA`}];function s(){let{control:e}=t({defaultValues:{uf:null,status:null}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`uf`,control:e,label:`UF`,options:o,optionLabel:`label`,optionValue:`value`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`status`,control:e,label:`Status (obrigatório)`,options:[{label:`Ativo`,value:`A`},{label:`Inativo`,value:`I`}],optionLabel:`label`,optionValue:`value`,cols:`12 6`,required:!0,getFormErrorMessage:a})]})}var c=[{title:`Uso básico`,description:`Dropdown com filtro embutido e botão de limpar, integrado com react-hook-form.`,example:(0,i.jsx)(s,{}),code:`import { useForm } from "react-hook-form";
import { DropdownFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

const ufs = [
  { label: "Mato Grosso", value: "MT" },
  { label: "São Paulo", value: "SP" },
];

<DropdownFieldSeplag
  name="uf"
  control={control}
  label="UF"
  options={ufs}
  optionLabel="label"
  optionValue="value"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],l=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`options`,type:`object[]`,required:!0,description:`Lista de opções do dropdown.`},{name:`optionLabel`,type:`string`,required:!0,description:`Propriedade da opção usada como texto exibido.`},{name:`optionValue`,type:`string`,required:!0,description:`Propriedade da opção usada como valor.`},{name:`label`,type:`string`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12 6"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`placeholder`,type:`string`,defaultValue:`"Selecione..."`,required:!1,description:`Texto exibido quando nenhum item está selecionado.`},{name:`showClear`,type:`boolean`,defaultValue:`true`,required:!1,description:`Exibe botão para limpar a seleção.`},{name:`filter`,type:`boolean`,defaultValue:`true`,required:!1,description:`Habilita o filtro interno do dropdown.`},{name:`isLoading`,type:`boolean`,defaultValue:`false`,required:!1,description:`Exibe indicador de carregamento.`},{name:`onChange`,type:`(value: any) => void`,required:!1,description:`Callback disparado ao mudar a seleção.`},{name:`rules`,type:`RegisterOptions`,required:!1,description:`Regras de validação extras do react-hook-form.`},{name:`virtualScrollerOptions`,type:`object`,required:!1,description:`Opções do virtual scroll (ativado automaticamente com >50 itens).`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function u(){return(0,i.jsx)(r,{title:`DropdownField`,description:`Campo de seleção única com filtro embutido, botão de limpar e virtual scroll automático para listas grandes. Integrado com react-hook-form.`,badge:`Estável`,since:`v0.0.1`,sections:c,props:l})}export{u as default};