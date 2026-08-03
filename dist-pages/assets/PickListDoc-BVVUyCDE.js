import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{t as r}from"./PickList-DM3eIvEs.js";import{n as i,t as a}from"./DocPage-DfNa9OED.js";var o=e(t(),1),s=n(),c=[{id:1,nome:`Maçã`},{id:2,nome:`Banana`},{id:3,nome:`Laranja`},{id:4,nome:`Uva`},{id:5,nome:`Manga`}],l=`Maçã
Banana
Laranja
Uva
Manga`;function u(e){return e.split(`
`).map(e=>e.trim()).filter(e=>e.length>0).map((e,t)=>({id:t+1,nome:e}))}function d(){let[e,t]=(0,o.useState)(l),[n,a]=(0,o.useState)(()=>u(l)),[c,d]=(0,o.useState)([]),[f,p]=(0,o.useState)(`Frutas`),[m,h]=(0,o.useState)(`Disponíveis`),[g,_]=(0,o.useState)(`Selecionados`),[v,y]=(0,o.useState)(`Buscar...`),[b,x]=(0,o.useState)(!1);function S(e){t(e),a(u(e)),d([])}let C=`<PickListSeplag\n${[`  title="${f}"`,`  dataKey="id"`,`  dataLabel="nome"`,...m===`Disponíveis`?[]:[`  titleNaoSelecionados="${m}"`],...g===`Selecionados`?[]:[`  titleSelecionados="${g}"`],...v===`Buscar...`?[]:[`  filterPlaceholder="${v}"`],...b?[`  isView`]:[],`  naoSelecionados={disponiveis}`,`  selecionados={selecionados}`,`  setNaoSelecionados={setDisponiveis}`,`  setSelecionados={setSelecionados}`].join(`
`)}\n/>`;return(0,s.jsxs)(`div`,{className:`botao-playground`,children:[(0,s.jsx)(`div`,{className:`botao-playground-preview`,style:{alignItems:`flex-start`,padding:`1rem`},children:(0,s.jsx)(r,{title:f,dataKey:`id`,dataLabel:`nome`,titleNaoSelecionados:m,titleSelecionados:g,filterPlaceholder:v,isView:b,naoSelecionados:n,selecionados:c,setNaoSelecionados:a,setSelecionados:d})}),(0,s.jsxs)(`div`,{className:`botao-playground-controls`,children:[(0,s.jsxs)(`div`,{className:`pg-field`,style:{alignItems:`flex-start`},children:[(0,s.jsx)(`span`,{className:`pg-label`,style:{paddingTop:`0.25rem`},children:`itens`}),(0,s.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.25rem`},children:[(0,s.jsx)(`textarea`,{rows:5,style:{fontFamily:`inherit`,fontSize:`0.85rem`,padding:`0.4rem 0.6rem`,borderRadius:6,border:`1px solid #d1d5db`,resize:`vertical`,minWidth:200},value:e,onChange:e=>S(e.target.value)}),(0,s.jsx)(`span`,{style:{fontSize:`0.75rem`,color:`#6b7280`},children:`Um item por linha. Alterar reinicia as listas.`})]})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`span`,{className:`pg-label`,children:`title`}),(0,s.jsx)(`input`,{className:`pg-input`,value:f,onChange:e=>p(e.target.value)})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`span`,{className:`pg-label`,children:`titleNaoSelecionados`}),(0,s.jsx)(`input`,{className:`pg-input`,value:m,onChange:e=>h(e.target.value)})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`span`,{className:`pg-label`,children:`titleSelecionados`}),(0,s.jsx)(`input`,{className:`pg-input`,value:g,onChange:e=>_(e.target.value)})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`span`,{className:`pg-label`,children:`filterPlaceholder`}),(0,s.jsx)(`input`,{className:`pg-input`,value:v,onChange:e=>y(e.target.value)})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`span`,{className:`pg-label`,children:`modificadores`}),(0,s.jsx)(`div`,{className:`pg-checkbox-group`,children:(0,s.jsx)(`button`,{className:`pg-checkbox-btn${b?` selected`:``}`,onClick:()=>x(e=>!e),children:`isView`})})]})]}),(0,s.jsx)(i,{code:C})]})}function f(){let[e,t]=(0,o.useState)(c),[n,i]=(0,o.useState)([]);return(0,s.jsx)(`div`,{style:{width:`100%`},children:(0,s.jsx)(r,{title:`Frutas`,dataKey:`id`,dataLabel:`nome`,naoSelecionados:e,selecionados:n,setNaoSelecionados:t,setSelecionados:i})})}function p(){let[e,t]=(0,o.useState)([{id:1,nome:`React`},{id:2,nome:`TypeScript`}]),[n,i]=(0,o.useState)([{id:3,nome:`PrimeReact`}]);return(0,s.jsx)(`div`,{style:{width:`100%`},children:(0,s.jsx)(r,{title:`Tecnologias`,dataKey:`id`,dataLabel:`nome`,naoSelecionados:e,selecionados:n,setNaoSelecionados:t,setSelecionados:i,isView:!0})})}function m(){let[e,t]=(0,o.useState)([{id:1,pessoa:{nome:`Ana`}},{id:2,pessoa:{nome:`Bruno`}},{id:3,pessoa:{nome:`Carlos`}}]),[n,i]=(0,o.useState)([]);return(0,s.jsx)(`div`,{style:{width:`100%`},children:(0,s.jsx)(r,{title:`Participantes`,dataKey:`id`,dataLabel:`pessoa.nome`,filterBy:`pessoa.nome`,naoSelecionados:e,selecionados:n,setNaoSelecionados:t,setSelecionados:i})})}var h=[{title:`Playground`,description:`Experimente as props em tempo real.`,example:(0,s.jsx)(d,{}),code:`import { useState } from "react";
import { PickListSeplag } from "@seplag/ui-lib-react-18";

const [disponiveis, setDisponiveis] = useState(items);
const [selecionados, setSelecionados] = useState([]);

<PickListSeplag
  title="Frutas"
  dataKey="id"
  dataLabel="nome"
  naoSelecionados={disponiveis}
  selecionados={selecionados}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
/>`},{title:`Uso básico`,description:`Mova itens entre a lista de disponíveis e selecionados usando os controles centrais.`,example:(0,s.jsx)(f,{}),code:`import { useState } from "react";
import { PickListSeplag } from "@seplag/ui-lib-react-18";

const [disponiveis, setDisponiveis] = useState(items);
const [selecionados, setSelecionados] = useState([]);

<PickListSeplag
  title="Frutas"
  dataKey="id"
  dataLabel="nome"
  naoSelecionados={disponiveis}
  selecionados={selecionados}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
/>`},{title:`Modo somente leitura`,description:`Com isView, os controles de movimentação ficam desabilitados.`,example:(0,s.jsx)(p,{}),code:`<PickListSeplag
  title="Tecnologias"
  dataKey="id"
  dataLabel="nome"
  naoSelecionados={disponiveis}
  selecionados={selecionados}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
  isView
/>`},{title:`dataLabel aninhado`,description:`Você pode usar caminho com ponto para exibir propriedades internas, como pessoa.nome.`,example:(0,s.jsx)(m,{}),code:`<PickListSeplag
  title="Participantes"
  dataKey="id"
  dataLabel="pessoa.nome"
  filterBy="pessoa.nome"
  naoSelecionados={disponiveis}
  selecionados={selecionados}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
/>`},{title:`Fallback de item inválido`,description:`Quando o caminho de dataLabel não existe no item, o componente exibe Item inválido para facilitar diagnóstico de mapeamento.`,example:null,code:`// Exemplo: dataLabel aponta para um campo inexistente
<PickListSeplag
  title="Exemplo"
  dataKey="id"
  dataLabel="pessoa.nome"
  naoSelecionados={[{ id: 1, nome: "Sem pessoa" }]}
  selecionados={[]}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
/>`}],g=[{name:`title`,type:`string`,required:!0,description:`Título exibido acima do componente de picklist.`},{name:`naoSelecionados`,type:`T[]`,required:!0,description:`Lista de itens disponíveis (lado esquerdo).`},{name:`selecionados`,type:`T[]`,required:!0,description:`Lista de itens selecionados (lado direito).`},{name:`setNaoSelecionados`,type:`(items: T[]) => void`,required:!0,description:`Setter para a lista de disponíveis.`},{name:`setSelecionados`,type:`(items: T[]) => void`,required:!0,description:`Setter para a lista de selecionados.`},{name:`dataKey`,type:`string`,required:!1,description:`Propriedade usada como chave única dos itens.`},{name:`dataLabel`,type:`string`,required:!1,description:`Propriedade exibida como label de cada item (aceita caminho aninhado, ex.: pessoa.nome).`},{name:`isView`,type:`boolean`,defaultValue:`false`,required:!1,description:`Modo somente leitura — desabilita os controles de movimentação.`},{name:`filterBy`,type:`string`,required:!1,description:`Propriedade usada para filtrar itens na busca.`},{name:`filterPlaceholder`,type:`string`,required:!1,description:`Placeholder do campo de busca.`}];function _(){return(0,s.jsx)(a,{title:`PickList`,description:`Componente de seleção dual (picklist) padrão SEPLAG para transferência de itens entre duas listas. Suporta filtro, modo de visualização e templates customizados.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { PickListSeplag } from "@seplag/ui-lib-react-18";`,sections:h,props:g})}export{_ as default};