import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r as t}from"./checkbox.esm-4xavqYZ-.js";import{a as n}from"./Fields-DvUfwV1i.js";import{t as r}from"./DocPage-DfNa9OED.js";var i=e(),a=()=>null,o=[{label:`Analista`,value:1},{label:`Técnico`,value:2},{label:`Assistente`,value:3},{label:`Coordenador`,value:4},{label:`Gerente`,value:5}];function s(){let{control:e}=t({defaultValues:{cargos:[],perfis:[]}});return(0,i.jsxs)(`div`,{className:`grid`,style:{width:`100%`},children:[(0,i.jsx)(n,{name:`cargos`,control:e,label:`Cargos`,options:o,optionLabel:`label`,optionValue:`value`,cols:`12 6`,getFormErrorMessage:a}),(0,i.jsx)(n,{name:`perfis`,control:e,label:`Perfis (chips)`,options:o,optionLabel:`label`,optionValue:`value`,display:`chip`,cols:`12 6`,getFormErrorMessage:a})]})}var c=[{title:`Uso básico`,description:`Seleção múltipla com filtro. Suporta display em texto separado por vírgula ou em chips.`,example:(0,i.jsx)(s,{}),code:`import { useForm } from "react-hook-form";
import { MultiSelectFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();

// Display padrão (vírgula)
<MultiSelectFieldSeplag
  name="cargos"
  control={control}
  label="Cargos"
  options={[{ label: "Analista", value: 1 }]}
  optionLabel="label"
  optionValue="value"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>

// Display em chips
<MultiSelectFieldSeplag
  name="perfis"
  control={control}
  label="Perfis"
  options={[{ label: "Admin", value: 1 }]}
  optionLabel="label"
  optionValue="value"
  display="chip"
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],l=[{name:`name`,type:`Path<T>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<T>`,required:!0,description:`Objeto control do useForm.`},{name:`options`,type:`object[]`,required:!0,description:`Lista de opções do multiselect.`},{name:`optionLabel`,type:`string`,required:!0,description:`Propriedade usada como texto exibido.`},{name:`optionValue`,type:`string`,required:!0,description:`Propriedade usada como valor.`},{name:`label`,type:`string`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12 4"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`placeholder`,type:`string`,defaultValue:`"Selecione..."`,required:!1,description:`Texto de placeholder.`},{name:`display`,type:`"comma" | "chip"`,defaultValue:`"comma"`,required:!1,description:`Exibe selecionados separados por vírgula ou como chips.`},{name:`maxSelectedLabels`,type:`number`,defaultValue:`3`,required:!1,description:`Máximo de rótulos exibidos antes de mostrar contagem.`},{name:`selectedItemsLabel`,type:`string`,required:!1,description:`Texto customizado quando ultrapassa maxSelectedLabels.`},{name:`dataKey`,type:`string`,defaultValue:`"id"`,required:!1,description:`Chave única de cada item para performance.`},{name:`readOnly`,type:`boolean`,defaultValue:`false`,required:!1,description:`Impede alteração dos itens selecionados.`},{name:`isLoading`,type:`boolean`,defaultValue:`false`,required:!1,description:`Exibe indicador de carregamento.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function u(){return(0,i.jsx)(r,{title:`MultiSelectField`,description:`Campo de seleção múltipla com filtro embutido e dois modos de exibição (vírgula ou chips). Integrado com react-hook-form.`,badge:`Estável`,since:`v0.0.1`,sections:c,props:l})}export{u as default};