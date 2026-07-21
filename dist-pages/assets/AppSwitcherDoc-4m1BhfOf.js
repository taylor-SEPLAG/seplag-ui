import{a as e,n as t,t as n}from"./jsx-runtime-ChuIQw48.js";import{t as r}from"./AppSwitcher-ICsl3LDF.js";import"./index-DyeHa39m.js";import{n as i,t as a}from"./DocPage-CHgTh2J-.js";var o=e(t(),1),s=n(),c=[{id:`sgi`,label:`SGI`,url:`#`,icon:`pi pi-briefcase`},{id:`siagro`,label:`SIAGRO`,url:`#`,icon:`pi pi-chart-bar`},{id:`seplag`,label:`SEPLAG`,url:`#`,icon:`pi pi-building`}];function l(){let[e,t]=(0,o.useState)(`SGI`),[n,a]=(0,o.useState)(3),l=c.slice(0,n),u=`import { AppSwitcherSeplag } from "@seplag/ui-lib-react-18";

const items = [
${l.map(e=>`  { id: "${e.id}", label: "${e.label}", url: "/app/${e.id}", icon: "${e.icon}" }`).join(`,
`)}
];

<AppSwitcherSeplag
  items={items}
  currentSystem="${e}"
/>`;return(0,s.jsxs)(`div`,{className:`botao-playground`,children:[(0,s.jsx)(`div`,{className:`botao-playground-preview`,style:{background:`#005494`,padding:`1rem 1.5rem`,borderRadius:8},children:(0,s.jsx)(r,{items:l,currentSystem:e})}),(0,s.jsxs)(`div`,{className:`botao-playground-controls`,children:[(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`pg-current`,children:`currentSystem`}),(0,s.jsx)(`select`,{id:`pg-current`,className:`pg-select`,value:e,onChange:e=>t(e.target.value),children:c.map(e=>(0,s.jsx)(`option`,{value:e.label,children:e.label},e.id))})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`pg-numItems`,children:`número de sistemas`}),(0,s.jsxs)(`select`,{id:`pg-numItems`,className:`pg-select`,value:n,onChange:e=>a(Number(e.target.value)),children:[(0,s.jsx)(`option`,{value:1,children:`1`}),(0,s.jsx)(`option`,{value:2,children:`2`}),(0,s.jsx)(`option`,{value:3,children:`3`})]})]})]}),(0,s.jsx)(i,{code:u})]})}var u=[{title:`Playground`,description:`Experimente o AppSwitcher interativamente. O sistema selecionado como ativo fica destacado no painel.`,example:(0,s.jsx)(l,{}),code:``},{title:`Com ícones customizados (ReactNode)`,description:`O campo icon aceita tanto uma string de classe CSS (ex: PrimeIcons) quanto um ReactNode como componente.`,example:(0,s.jsx)(`div`,{style:{background:`#005494`,padding:`1rem 1.5rem`,borderRadius:8,display:`inline-flex`},children:(0,s.jsx)(r,{currentSystem:`SGI`,items:[{id:`s1`,label:`SGI`,url:`#`,icon:`pi pi-star`},{id:`s2`,label:`Portal`,url:`#`,icon:`pi pi-globe`}]})}),code:`import { AppSwitcherSeplag } from "@seplag/ui-lib-react-18";

<AppSwitcherSeplag
  currentSystem="SGI"
  items={[
    { id: "s1", label: "SGI",    url: "/sgi",    icon: "pi pi-star"  },
    { id: "s2", label: "Portal", url: "/portal", icon: "pi pi-globe" },
  ]}
/>`},{title:`Abrindo em nova aba`,description:`Defina target: "_blank" para abrir o sistema em uma nova aba com segurança (noopener, noreferrer).`,example:(0,s.jsx)(`div`,{style:{background:`#005494`,padding:`1rem 1.5rem`,borderRadius:8,display:`inline-flex`},children:(0,s.jsx)(r,{items:[{id:`ext`,label:`Externo`,url:`#`,target:`_blank`,icon:`pi pi-external-link`}]})}),code:`<AppSwitcherSeplag
  items={[
    {
      id: "ext",
      label: "Sistema Externo",
      url: "https://www.mt.gov.br",
      target: "_blank",
      icon: "pi pi-external-link",
    },
  ]}
/>`}],d=[{name:`items`,type:`AppSystemItemSeplag[]`,required:!0,description:`Lista de sistemas disponíveis para navegação.`},{name:`currentSystem`,type:`string`,description:`Label do sistema atual. O item correspondente fica destacado no painel.`},{name:`className`,type:`string`,description:`Classe CSS adicional aplicada ao wrapper externo.`}],f={title:`Interface: AppSystemItemSeplag`,description:`Estrutura de cada item da lista de sistemas passada para a prop items.`,example:(0,s.jsxs)(`table`,{className:`doc-props-table`,children:[(0,s.jsx)(`thead`,{children:(0,s.jsxs)(`tr`,{children:[(0,s.jsx)(`th`,{children:`Prop`}),(0,s.jsx)(`th`,{children:`Tipo`}),(0,s.jsx)(`th`,{children:`Obrigatório`}),(0,s.jsx)(`th`,{children:`Padrão`}),(0,s.jsx)(`th`,{children:`Descrição`})]})}),(0,s.jsx)(`tbody`,{children:[{name:`id`,type:`string`,required:!0,description:`Identificador único do sistema.`},{name:`label`,type:`string`,required:!0,description:`Nome exibido abaixo do ícone no painel.`},{name:`url`,type:`string`,required:!0,description:`URL de destino ao clicar no sistema.`},{name:`target`,type:`"_self" | "_blank"`,defaultValue:`"_self"`,description:`Define se a navegação ocorre na mesma aba ou em uma nova.`},{name:`icon`,type:`string | ReactNode`,description:`Ícone do sistema. String = classe CSS (ex: PrimeIcons). ReactNode = componente React.`}].map(e=>(0,s.jsxs)(`tr`,{children:[(0,s.jsx)(`td`,{children:(0,s.jsx)(`code`,{children:e.name})}),(0,s.jsx)(`td`,{children:(0,s.jsx)(`code`,{children:e.type})}),(0,s.jsx)(`td`,{children:e.required?`✓`:`—`}),(0,s.jsx)(`td`,{children:e.defaultValue?(0,s.jsx)(`code`,{children:e.defaultValue}):`—`}),(0,s.jsx)(`td`,{children:e.description})]},e.name))})]}),code:``};function p(){return(0,s.jsx)(a,{title:`AppSwitcher`,badge:`Estável`,since:`v0.0.1`,description:`Botão de alternância entre sistemas do ecossistema SEPLAG. Exibe um painel com os sistemas cadastrados ao clicar no ícone de grid.`,importStatement:`import { AppSwitcherSeplag } from "@seplag/ui-lib-react-18";
import type { AppSystemItemSeplag } from "@seplag/ui-lib-react-18";`,sections:[...u,f],props:d})}export{p as default};