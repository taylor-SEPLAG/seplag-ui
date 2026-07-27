import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r}from"./checkbox.esm-4xavqYZ-.js";import{r as i}from"./Fields-C5oQemj6.js";import{t as a}from"./DocPage-DNS5xyAT.js";var o=e(t(),1),s=n(),c=()=>null,l=[{id:1,nome:`Ana Silva`},{id:2,nome:`Bruno Costa`},{id:3,nome:`Carlos Souza`},{id:4,nome:`Diana Ferreira`},{id:5,nome:`Eduardo Lima`}];function u(){let{control:e}=r({defaultValues:{pessoa:``}}),[t,n]=(0,o.useState)([]);return(0,s.jsx)(`div`,{className:`grid`,style:{width:`100%`},children:(0,s.jsx)(i,{name:`pessoa`,control:e,label:`Pesquisar Pessoa`,placeholder:`Digite ao menos 1 caractere...`,fieldLabel:`nome`,items:t,minLength:1,search:e=>{n(l.filter(t=>t.nome.toLowerCase().includes(e.toLowerCase())))},cols:`12 6`,getFormErrorMessage:c})})}var d=[{title:`Uso básico`,description:`AutoComplete com busca assíncrona. Chame search para carregar as sugestões.`,example:(0,s.jsx)(u,{}),code:`import { useState } from "react";
import { useForm } from "react-hook-form";
import { SearchFieldSeplag } from "@seplag/ui-lib-react-18";

const { control, formState: { errors } } = useForm();
const [sugestoes, setSugestoes] = useState([]);

const buscar = async (query: string) => {
  const resultado = await api.buscar(query);
  setSugestoes(resultado);
};

<SearchFieldSeplag
  name="pessoa"
  control={control}
  label="Pesquisar Pessoa"
  placeholder="Digite para buscar..."
  fieldLabel="nome"
  items={sugestoes}
  minLength={3}
  search={buscar}
  cols="12 6"
  getFormErrorMessage={(name) => errors[name]?.message}
/>`}],f=[{name:`name`,type:`Path<TForm>`,required:!0,description:`Nome do campo no formulário.`},{name:`control`,type:`Control<TForm>`,required:!0,description:`Objeto control do useForm.`},{name:`items`,type:`SuggestionSeplag<TItem>[]`,required:!0,description:`Lista de sugestões retornadas pela busca.`},{name:`search`,type:`(query: string) => void`,required:!0,description:`Função chamada quando o usuário digita.`},{name:`label`,type:`string`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12 6"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`required`,type:`boolean`,defaultValue:`false`,required:!1,description:`Torna o campo obrigatório.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,required:!1,description:`Desabilita o campo.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o campo.`},{name:`placeholder`,type:`string`,defaultValue:`""`,required:!1,description:`Texto de placeholder.`},{name:`fieldLabel`,type:`string`,required:!1,description:`Propriedade do objeto de sugestão usada como texto exibido.`},{name:`minLength`,type:`number`,defaultValue:`3`,required:!1,description:`Mínimo de caracteres para disparar a busca.`},{name:`forceSelection`,type:`boolean`,defaultValue:`false`,required:!1,description:`Força a seleção de um item da lista.`},{name:`itemTemplate`,type:`(item: TItem) => ReactNode`,required:!1,description:`Template customizado para cada item da lista de sugestões.`},{name:`getFormErrorMessage`,type:`(name: string) => ReactNode | null`,required:!1,description:`Função que retorna a mensagem de erro.`}];function p(){return(0,s.jsx)(a,{title:`SearchField`,description:`Campo de busca com autocompletar (AutoComplete do PrimeReact). Ideal para buscar registros via API enquanto o usuário digita.`,badge:`Estável`,since:`v0.0.1`,sections:d,props:f})}export{p as default};