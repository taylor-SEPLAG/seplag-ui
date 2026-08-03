import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              *//* empty css               */import{t}from"./AppSubmenu-D_zd6poF.js";import{t as n}from"./DocPage-DfNa9OED.js";var r=e(),i=[{title:`Playground`,description:"O AppSubmenuSeplag renderiza recursivamente os itens do menu. Itens com `visibleOnMenu: false` são ocultados. Clique nos itens com seta para expandir submenus.",example:(0,r.jsx)(`div`,{className:`layout-sidebar layout-sidebar-dark`,style:{position:`relative`,width:250,minHeight:300,borderRadius:8},children:(0,r.jsx)(t,{items:[{label:`Início`,icon:`pi pi-home`,to:`#`,visibleOnMenu:!0,visibleOnRouter:!0},{label:`Cadastro`,icon:`pi pi-file-edit`,visibleOnMenu:!0,visibleOnRouter:!0,items:[{label:`Pessoas`,icon:`pi pi-users`,to:`#pessoas`,visibleOnMenu:!0,visibleOnRouter:!0},{label:`Empresas`,icon:`pi pi-building`,to:`#empresas`,visibleOnMenu:!0,visibleOnRouter:!0}]},{label:`Relatórios`,icon:`pi pi-chart-bar`,visibleOnMenu:!0,visibleOnRouter:!0,items:[{label:`Mensal`,icon:`pi pi-circle-on`,to:`#mensal`,visibleOnMenu:!0,visibleOnRouter:!0}]}],className:`layout-menu`,root:!0,onMenuItemClick:e=>console.log(e)})}),code:`import { AppSubmenuSeplag } from "@seplag/ui-lib-react-18";
import type { IMenuSeplag } from "@seplag/ui-lib-react-18";

// Geralmente usado via AppMenuSeplag, mas pode ser usado diretamente:

const items: IMenuSeplag[] = [
  {
    label: "Início",
    icon: "pi pi-home",
    to: "/",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
];

<AppSubmenuSeplag
  items={items}
  className="layout-menu"
  root={true}
  onMenuItemClick={(e) => console.log(e)}
/>`}],a=[{name:`items`,type:`IMenuSeplag[] | null | undefined`,required:!0,description:`Lista de itens do submenu a renderizar.`},{name:`onMenuItemClick`,type:`(event: { originalEvent: any; item: IMenuSeplag[] }) => void`,required:!0,description:`Callback disparado ao clicar em um item.`},{name:`root`,type:`boolean`,defaultValue:`false`,description:`Indica se é o nível raiz do menu (altera estilos de abertura).`},{name:`className`,type:`string`,description:"Classe CSS aplicada ao `<ul>` gerado."}];function o(){return(0,r.jsx)(n,{title:`AppSubmenu`,description:`Renderiza recursivamente os itens de menu, filtrando por visibleOnMenu e detectando a rota ativa automaticamente. Usado internamente pelo AppMenuSeplag.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { AppSubmenuSeplag } from "@seplag/ui-lib-react-18";`,sections:i,props:a})}export{o as default};