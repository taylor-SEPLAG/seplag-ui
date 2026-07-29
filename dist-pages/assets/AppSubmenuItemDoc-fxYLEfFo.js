import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              *//* empty css               */import{t}from"./AppMenu-scSOOJVL.js";import{t as n}from"./DocPage-DfNa9OED.js";var r=e(),i=[{title:`Playground`,description:`O AppSubmenuItemSeplag é o componente interno que renderiza cada item do menu. Clique em 'Item com submenu' para ver a animação de abertura.`,example:(0,r.jsx)(`div`,{className:`layout-sidebar layout-sidebar-dark`,style:{position:`relative`,width:250,minHeight:200,borderRadius:8},children:(0,r.jsx)(t,{items:[{label:`Item simples`,icon:`pi pi-home`,to:`#`,visibleOnMenu:!0,visibleOnRouter:!0},{label:`Item com submenu`,icon:`pi pi-chart-bar`,visibleOnMenu:!0,visibleOnRouter:!0,items:[{label:`Sub-item 1`,icon:`pi pi-circle-on`,to:`#sub1`,visibleOnMenu:!0,visibleOnRouter:!0},{label:`Sub-item 2`,icon:`pi pi-circle-on`,to:`#sub2`,visibleOnMenu:!0,visibleOnRouter:!0}]}],onMenuItemClick:e=>console.log(e)})}),code:`// Componente de uso interno — normalmente não é instanciado diretamente.
// Para renderizar o menu, use AppMenuSeplag.

import { AppMenuSeplag } from "@seplag/ui-lib-react-18";
import type { IMenuSeplag } from "@seplag/ui-lib-react-18";

const menu: IMenuSeplag[] = [
  {
    label: "Relatórios",
    icon: "pi pi-chart-bar",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      {
        label: "Mensal",
        icon: "pi pi-circle-on",
        to: "/relatorios/mensal",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
    ],
  },
];

<AppMenuSeplag items={menu} onMenuItemClick={(e) => console.log(e)} />`}],a=[{name:`item`,type:`IMenuSeplag`,required:!0,description:`Dados do item de menu a renderizar.`},{name:`className`,type:`string`,required:!0,description:"Classes CSS aplicadas ao `<li>` (ex: active-menuitem)."},{name:`active`,type:`boolean`,defaultValue:`false`,description:`Indica se o item (ou algum filho) está ativo na rota atual.`},{name:`root`,type:`boolean`,defaultValue:`false`,description:`Indica se o item está no nível raiz do menu.`},{name:`onMenuClick`,type:`(event: { originalEvent: any; item: IMenuSeplag[] }) => void`,required:!0,description:`Callback propagado ao AppSubmenu filho.`},{name:`onMenuItemClick`,type:`(event: MouseEvent, item: IMenuSeplag) => void`,required:!0,description:`Callback disparado ao clicar no link do item.`}];function o(){return(0,r.jsx)(n,{title:`AppSubmenuItem`,description:`Item individual do menu lateral. Renderiza ícone, label e submenu colapsável com animação. Componente interno do AppSubmenuSeplag.`,badge:`Estável`,since:`v0.0.1`,importStatement:`// Componente interno — acesse via AppMenuSeplag`,sections:i,props:a})}export{o as default};