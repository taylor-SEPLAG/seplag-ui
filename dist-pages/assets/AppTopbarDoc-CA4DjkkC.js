import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{t as r}from"./AppTopbar-l-7f6sWX.js";import{n as i,t as a}from"./DocPage-DfNa9OED.js";var o=e(t(),1),s=n(),c=[{id:`sgi`,label:`SGI`,url:`#`,icon:`pi pi-briefcase`},{id:`siagro`,label:`SIAGRO`,url:`#`,icon:`pi pi-chart-bar`},{id:`portal`,label:`Portal`,url:`#`,icon:`pi pi-globe`}];function l(){let[e,t]=(0,o.useState)(!1),[n,a]=(0,o.useState)(`SGI`),[l,u]=(0,o.useState)(`HOMOLOGAÇÃO`),d=`import { AppTopbarSeplag } from "@seplag/ui-lib-react-18";

const sistemas = [
  { id: "sgi",    label: "SGI",    url: "/sgi",    icon: "pi pi-briefcase" },
  { id: "siagro", label: "SIAGRO", url: "/siagro", icon: "pi pi-chart-bar" },
];

<AppTopbarSeplag
  nomeSistema="${n}"
  ambienteSistema="${l}"
  isSidebarVisible={isSidebarVisible}
  systemas={sistemas}
  onToggleMenu={() => setIsSidebarVisible(v => !v)}
/>`;return(0,s.jsxs)(`div`,{className:`botao-playground`,children:[(0,s.jsxs)(`div`,{className:`botao-playground-preview`,style:{padding:0,overflow:`hidden`,borderRadius:8},children:[(0,s.jsx)(r,{nomeSistema:n,ambienteSistema:l,isSidebarVisible:e,systemas:c,onToggleMenu:()=>t(e=>!e)}),e&&(0,s.jsx)(`div`,{style:{background:`#f4f6f8`,padding:`1rem 1.5rem`,fontSize:`0.875rem`,color:`#555`,borderTop:`1px solid #ddd`},children:`← Sidebar visível (simulação)`})]}),(0,s.jsxs)(`div`,{className:`botao-playground-controls`,children:[(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`pg-nome`,children:`nomeSistema`}),(0,s.jsx)(`input`,{id:`pg-nome`,className:`pg-input`,type:`text`,value:n,onChange:e=>a(e.target.value),placeholder:`Ex: SGI`})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`pg-ambiente`,children:`ambienteSistema`}),(0,s.jsxs)(`select`,{id:`pg-ambiente`,className:`pg-select`,value:l,onChange:e=>u(e.target.value),children:[(0,s.jsx)(`option`,{children:`PRODUÇÃO`}),(0,s.jsx)(`option`,{children:`HOMOLOGAÇÃO`}),(0,s.jsx)(`option`,{children:`DESENVOLVIMENTO`})]})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`span`,{className:`pg-label`,children:`isSidebarVisible`}),(0,s.jsx)(`div`,{className:`pg-radio-group`,children:[!0,!1].map(n=>(0,s.jsxs)(`label`,{className:`pg-radio-btn${e===n?` selected`:``}`,children:[(0,s.jsx)(`input`,{type:`radio`,name:`pg-sidebar`,checked:e===n,onChange:()=>t(n)}),String(n)]},String(n)))})]})]}),(0,s.jsx)(i,{code:d})]})}var u=[{title:`Playground`,description:`Experimente o AppTopbar. Clique no botão hambúrguer dentro do preview para alternar o estado da sidebar.`,example:(0,s.jsx)(l,{}),code:``},{title:`Uso básico`,description:`Exemplo completo com gerenciamento de estado da sidebar.`,example:(0,s.jsx)(`div`,{style:{borderRadius:8,overflow:`hidden`},children:(0,s.jsx)(r,{nomeSistema:`SGI`,ambienteSistema:`PRODUÇÃO`,isSidebarVisible:!1,systemas:c,onToggleMenu:()=>{}})}),code:`import { AppTopbarSeplag } from "@seplag/ui-lib-react-18";
import { useState } from "react";

const sistemas = [
  { id: "sgi",    label: "SGI",    url: "/sgi",    icon: "pi pi-briefcase" },
  { id: "siagro", label: "SIAGRO", url: "/siagro", icon: "pi pi-chart-bar" },
];

function Layout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <>
      <AppTopbarSeplag
        nomeSistema="SGI"
        ambienteSistema="PRODUÇÃO"
        isSidebarVisible={sidebarVisible}
        systemas={sistemas}
        onToggleMenu={() => setSidebarVisible(v => !v)}
      />
      {/* resto do layout */}
    </>
  );
}`}],d=[{name:`nomeSistema`,type:`string`,required:!0,description:`Nome do sistema exibido na topbar. Também é usado para destacar o sistema ativo no AppSwitcher.`},{name:`ambienteSistema`,type:`string`,required:!0,description:`Ambiente do sistema (ex: "PRODUÇÃO", "HOMOLOGAÇÃO"). Exibido ao lado do nome.`},{name:`systemas`,type:`AppSystemItemSeplag[]`,required:!0,description:`Lista de sistemas disponíveis para o AppSwitcher.`},{name:`isSidebarVisible`,type:`boolean`,required:!0,description:`Controla o estado visual do botão hambúrguer (aberto/fechado).`},{name:`onToggleMenu`,type:`(event: any) => void`,required:!0,description:`Callback disparado ao clicar no botão hambúrguer para alternar a sidebar.`}];function f(){return(0,s.jsx)(a,{title:`AppTopbar`,badge:`Estável`,since:`v0.0.1`,description:`Barra superior de navegação padrão do ecossistema SEPLAG. Exibe o nome e ambiente do sistema, o botão hambúrguer para controle da sidebar e o AppSwitcher para troca de sistemas.`,importStatement:`import { AppTopbarSeplag } from "@seplag/ui-lib-react-18";
import type { AppTopbarSeplagProps } from "@seplag/ui-lib-react-18";`,sections:u,props:d})}export{f as default};