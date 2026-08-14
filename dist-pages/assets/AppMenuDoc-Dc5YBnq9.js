import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              *//* empty css               */import{t}from"./AppMenu-Dh6qYnGs.js";import{t as n}from"./DocPage-DfNa9OED.js";var r=e(),i=[{title:`Playground`,description:`Clique nos itens com seta para expandir os submenus.`,example:(0,r.jsx)(`div`,{className:`layout-sidebar layout-sidebar-dark`,style:{position:`relative`,width:250,minHeight:300,borderRadius:8},children:(0,r.jsx)(t,{items:[{label:`Início`,icon:`pi pi-home`,to:`#`,visibleOnMenu:!0,visibleOnRouter:!0},{label:`Cadastro`,icon:`pi pi-file-edit`,visibleOnMenu:!0,visibleOnRouter:!0,items:[{label:`Pessoas`,icon:`pi pi-users`,to:`#pessoas`,visibleOnMenu:!0,visibleOnRouter:!0},{label:`Empresas`,icon:`pi pi-building`,to:`#empresas`,visibleOnMenu:!0,visibleOnRouter:!0}]},{label:`Relatórios`,icon:`pi pi-chart-bar`,visibleOnMenu:!0,visibleOnRouter:!0,items:[{label:`Mensal`,icon:`pi pi-circle-on`,to:`#mensal`,visibleOnMenu:!0,visibleOnRouter:!0}]}],onMenuItemClick:e=>console.log(e)})}),code:`import { AppMenuSeplag } from "@seplag/ui-lib-react-18";
import type { IMenuSeplag } from "@seplag/ui-lib-react-18";

const menu: IMenuSeplag[] = [
  {
    label: "Início",
    icon: "pi pi-home",
    to: "/",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Cadastro",
    icon: "pi pi-file-edit",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      { label: "Pessoas", icon: "pi pi-users", to: "/pessoas", visibleOnMenu: true, visibleOnRouter: true },
    ],
  },
];

<AppMenuSeplag
  items={menu}
  onMenuItemClick={(e) => console.log(e)}
/>`}],a=[{name:`items`,type:`IMenuSeplag[]`,required:!0,description:`Lista de itens do menu. Itens sem rotas filhas visíveis são filtrados automaticamente.`},{name:`onMenuItemClick`,type:`(event: any) => void`,required:!0,description:`Callback disparado ao clicar em um item do menu.`}];function o(){return(0,r.jsx)(n,{title:`AppMenu`,description:`Menu lateral da aplicação. Recebe um array de IMenuSeplag e renderiza os itens filtrados pelo campo visibleOnRouter via AppSubmenuSeplag.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { AppMenuSeplag } from "@seplag/ui-lib-react-18";
import type { IMenuSeplag } from "@seplag/ui-lib-react-18";`,sections:i,props:a})}export{o as default};