import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";import{t as r}from"./Layout-2uVM9P0A.js";import{t as i}from"./LOGO SEPLAG - BRANCO VAZADO-B81kn_Ol.js";import{n as a,t as o}from"./DocPage-DfNa9OED.js";var s=e(t(),1),c=n(),l=[{id:`sgi`,label:`SGI`,url:`#`,icon:`pi pi-briefcase`},{id:`siagro`,label:`SIAGRO`,url:`#`,icon:`pi pi-chart-bar`},{id:`portal`,label:`Portal`,url:`#`,icon:`pi pi-globe`}],u=[{numrVinculo:`001`,statVinculo:`ATIVO`,unidade:{descUnidade:`STI`},orgao:{descOrgao:`SEPLAG`}},{numrVinculo:`002`,statVinculo:`ATIVO`,unidade:{descUnidade:`Coordenadoria de Sistemas`},orgao:{descOrgao:`SEPLAG`}}],d=[{label:`Início`,icon:`pi pi-home`,to:`#`,visibleOnMenu:!0,visibleOnRouter:!0},{label:`Cadastro`,icon:`pi pi-file-edit`,visibleOnMenu:!0,visibleOnRouter:!0,items:[{label:`Pessoas`,icon:`pi pi-users`,to:`#`,visibleOnMenu:!0,visibleOnRouter:!0},{label:`Cargos`,icon:`pi pi-briefcase`,to:`#`,visibleOnMenu:!0,visibleOnRouter:!0}]},{label:`Relatórios`,icon:`pi pi-chart-bar`,to:`#`,visibleOnMenu:!0,visibleOnRouter:!0},{label:`Configurações`,icon:`pi pi-cog`,to:`#`,visibleOnMenu:!0,visibleOnRouter:!0}],f=100;function p(e){return e.map(e=>({label:e.label,icon:e.icon,to:e.children.length===0?`#`:void 0,visibleOnMenu:!0,visibleOnRouter:!0,items:e.children.length>0?e.children.map(e=>({label:e.label,icon:e.icon,to:e.children.length===0?`#`:void 0,visibleOnMenu:!0,visibleOnRouter:!0,items:e.children.length>0?e.children.map(e=>({label:e.label,icon:e.icon,to:`#`,visibleOnMenu:!0,visibleOnRouter:!0})):void 0})):void 0}))}var m=[`pi pi-home`,`pi pi-file-edit`,`pi pi-users`,`pi pi-briefcase`,`pi pi-chart-bar`,`pi pi-cog`,`pi pi-bell`,`pi pi-star`,`pi pi-folder`,`pi pi-list`,`pi pi-search`,`pi pi-table`,`pi pi-calendar`,`pi pi-map-marker`,`pi pi-bookmark`,`pi pi-shield`];function h(e){return e.map(e=>({...e,children:e.children.map(e=>({...e,children:e.children.map(e=>({...e}))}))}))}function g(e,t,n,r){let i=h(e),a=i.find(e=>e.id===t);return a?(a[n]=r,i):e}function _(e,t,n,r,i){let a=h(e),o=a.find(e=>e.id===t)?.children.find(e=>e.id===n);return o?(o[r]=i,a):e}function v(e,t,n,r,i,a){let o=h(e),s=(o.find(e=>e.id===t)?.children.find(e=>e.id===n))?.children.find(e=>e.id===r);return s?(s[i]=a,o):e}function y({itemId:e,child:t,onUpdateChild:n,onAddGrandChild:r,onRemoveChild:i,onUpdateGrandChild:a,onRemoveGrandChild:o}){return(0,c.jsxs)(`div`,{className:`menu-editor-child-group`,children:[(0,c.jsxs)(`div`,{className:`menu-editor-row menu-editor-child`,children:[(0,c.jsx)(`span`,{className:`menu-editor-child-arrow`,children:`↳`}),(0,c.jsx)(`select`,{className:`pg-select menu-editor-icon-select`,value:t.icon,onChange:r=>n(e,t.id,`icon`,r.target.value),title:`Ícone`,children:m.map(e=>(0,c.jsx)(`option`,{value:e,children:e.replace(`pi pi-`,``)},e))}),(0,c.jsx)(`input`,{className:`pg-input menu-editor-label-input`,value:t.label,onChange:r=>n(e,t.id,`label`,r.target.value),placeholder:`Label`}),(0,c.jsx)(`button`,{type:`button`,className:`menu-editor-btn menu-editor-btn--add`,title:`Adicionar sub-sub-item`,onClick:()=>r(e,t.id),children:(0,c.jsx)(`i`,{className:`pi pi-plus`})}),(0,c.jsx)(`button`,{type:`button`,className:`menu-editor-btn menu-editor-btn--remove`,title:`Remover sub-item`,onClick:()=>i(e,t.id),children:(0,c.jsx)(`i`,{className:`pi pi-trash`})})]}),t.children.map(n=>(0,c.jsxs)(`div`,{className:`menu-editor-row menu-editor-grandchild`,children:[(0,c.jsx)(`span`,{className:`menu-editor-child-arrow`,style:{marginLeft:`1.5rem`},children:`↳`}),(0,c.jsx)(`select`,{className:`pg-select menu-editor-icon-select`,value:n.icon,onChange:r=>a(e,t.id,n.id,`icon`,r.target.value),title:`Ícone`,children:m.map(e=>(0,c.jsx)(`option`,{value:e,children:e.replace(`pi pi-`,``)},e))}),(0,c.jsx)(`input`,{className:`pg-input menu-editor-label-input`,value:n.label,onChange:r=>a(e,t.id,n.id,`label`,r.target.value),placeholder:`Label`}),(0,c.jsx)(`button`,{type:`button`,className:`menu-editor-btn menu-editor-btn--remove`,title:`Remover sub-sub-item`,onClick:()=>o(e,t.id,n.id),children:(0,c.jsx)(`i`,{className:`pi pi-trash`})})]},n.id))]})}function b({items:e,onChange:t}){let n=()=>t([...e,{id:f++,label:`Novo Item`,icon:`pi pi-circle`,children:[]}]),r=n=>t(e.filter(e=>e.id!==n)),i=(n,r,i)=>t(g(e,n,r,i)),a=n=>t(e.map(e=>e.id===n?{...e,children:[...e.children,{id:f++,label:`Sub-item`,icon:`pi pi-circle`,children:[]}]}:e)),o=(n,r)=>{let i=h(e),a=i.find(e=>e.id===n);a&&(a.children=a.children.filter(e=>e.id!==r),t(i))},s=(n,r,i,a)=>t(_(e,n,r,i,a)),l=(n,r)=>{let i=h(e),a=i.find(e=>e.id===n)?.children.find(e=>e.id===r);a&&(a.children.push({id:f++,label:`Sub-sub-item`,icon:`pi pi-circle`}),t(i))},u=(n,r,i)=>{let a=h(e),o=a.find(e=>e.id===n)?.children.find(e=>e.id===r);o&&(o.children=o.children.filter(e=>e.id!==i),t(a))},d=(n,r,i,a,o)=>t(v(e,n,r,i,a,o));return(0,c.jsxs)(`div`,{className:`menu-editor`,children:[e.map((e,t)=>(0,c.jsxs)(`div`,{className:`menu-editor-item`,children:[(0,c.jsxs)(`div`,{className:`menu-editor-row`,children:[(0,c.jsx)(`span`,{className:`menu-editor-index`,children:t+1}),(0,c.jsx)(`select`,{className:`pg-select menu-editor-icon-select`,value:e.icon,onChange:t=>i(e.id,`icon`,t.target.value),title:`Ícone`,children:m.map(e=>(0,c.jsx)(`option`,{value:e,children:e.replace(`pi pi-`,``)},e))}),(0,c.jsx)(`input`,{className:`pg-input menu-editor-label-input`,value:e.label,onChange:t=>i(e.id,`label`,t.target.value),placeholder:`Label`}),(0,c.jsx)(`button`,{type:`button`,className:`menu-editor-btn menu-editor-btn--add`,title:`Adicionar sub-item`,onClick:()=>a(e.id),children:(0,c.jsx)(`i`,{className:`pi pi-plus`})}),(0,c.jsx)(`button`,{type:`button`,className:`menu-editor-btn menu-editor-btn--remove`,title:`Remover item`,onClick:()=>r(e.id),children:(0,c.jsx)(`i`,{className:`pi pi-trash`})})]}),e.children.map(t=>(0,c.jsx)(y,{itemId:e.id,child:t,onUpdateChild:s,onAddGrandChild:l,onRemoveChild:o,onUpdateGrandChild:d,onRemoveGrandChild:u},t.id))]},e.id)),(0,c.jsxs)(`button`,{type:`button`,className:`menu-editor-btn menu-editor-btn--add-root`,onClick:n,children:[(0,c.jsx)(`i`,{className:`pi pi-plus`}),` Adicionar item de menu`]})]})}var x=d.map((e,t)=>({id:t+1,label:e.label??``,icon:e.icon??`pi pi-circle`,children:e.items?.map((e,n)=>({id:(t+1)*10+n,label:e.label??``,icon:e.icon??`pi pi-circle`,children:[]}))??[]}));function S(){let[e,t]=(0,s.useState)(`SGI`),[n,o]=(0,s.useState)(`HOMOLOGAÇÃO`),[d,f]=(0,s.useState)(`SEPLAG - STI - Coordenadoria de Sistemas`),[m,h]=(0,s.useState)(u[0]),[g,_]=(0,s.useState)(x),v=p(g),y=e=>{h(e)},S=`import { LayoutSeplag } from "@seplag/ui-lib-react-18";

<Route
  element={
    <LayoutSeplag
      nomeSistema="${e}"
      ambienteSistema="${n}"
      sistemas={sistemas}
      logoSrc={logoSrc}
      logoHref="/login"
      menuItems={menuItems}
      footerText="${d}"
      nomeApresentacao={user.nome}
      numrVinculoAtual={vinculo.numrVinculo}
      vinculos={user.vinculos}
      onLogout={handleLogout}
      onAlterarSenha={handleAlterarSenha}
      onSelecionarVinculo={handleSelecionarVinculo}
    />
  }
>
  <Route path="dashboard" element={<Dashboard />} />
</Route>`;return(0,c.jsxs)(`div`,{className:`botao-playground`,children:[(0,c.jsx)(`div`,{className:`botao-playground-preview`,style:{padding:0,display:`block`},children:(0,c.jsx)(`div`,{style:{height:560,overflow:`hidden`,borderRadius:`inherit`},children:(0,c.jsx)(r,{nomeSistema:e,ambienteSistema:n,sistemas:l,logoSrc:i,logoHref:`#`,menuItems:v,footerText:d,nomeApresentacao:`João da Silva`,numrVinculoAtual:m.numrVinculo,vinculos:u,onLogout:()=>{},onAlterarSenha:()=>{},onSelecionarVinculo:y,children:(0,c.jsxs)(`div`,{className:`layout-playground-content`,children:[(0,c.jsx)(`i`,{className:`pi pi-th-large`,style:{fontSize:`3rem`,color:`#ced4da`}}),(0,c.jsxs)(`div`,{style:{textAlign:`center`},children:[(0,c.jsx)(`p`,{style:{margin:0,fontWeight:600,color:`#495057`},children:`Área de Conteúdo`}),(0,c.jsxs)(`p`,{style:{margin:`0.25rem 0 0`,fontSize:`0.85rem`,color:`#6c757d`},children:[`Aqui será renderizado o`,` `,(0,c.jsx)(`code`,{style:{fontSize:`0.8rem`},children:`<Outlet />`}),` `,`com as páginas do sistema.`]})]})]})})})}),(0,c.jsxs)(`div`,{className:`botao-playground-controls`,children:[(0,c.jsxs)(`div`,{className:`pg-field`,children:[(0,c.jsx)(`label`,{htmlFor:`pg-layout-nome`,className:`pg-label`,children:`nomeSistema`}),(0,c.jsx)(`input`,{id:`pg-layout-nome`,className:`pg-input`,type:`text`,value:e,onChange:e=>t(e.target.value),placeholder:`Ex: SGI`})]}),(0,c.jsxs)(`div`,{className:`pg-field`,children:[(0,c.jsx)(`label`,{htmlFor:`pg-layout-ambiente`,className:`pg-label`,children:`ambienteSistema`}),(0,c.jsxs)(`select`,{id:`pg-layout-ambiente`,className:`pg-select`,value:n,onChange:e=>o(e.target.value),children:[(0,c.jsx)(`option`,{children:`PRODUÇÃO`}),(0,c.jsx)(`option`,{children:`HOMOLOGAÇÃO`}),(0,c.jsx)(`option`,{children:`DESENVOLVIMENTO`})]})]}),(0,c.jsxs)(`div`,{className:`pg-field`,children:[(0,c.jsx)(`label`,{htmlFor:`pg-layout-footer`,className:`pg-label`,children:`footerText`}),(0,c.jsx)(`input`,{id:`pg-layout-footer`,className:`pg-input`,type:`text`,value:d,onChange:e=>f(e.target.value),placeholder:`Texto do rodapé`})]}),(0,c.jsxs)(`div`,{className:`pg-field`,style:{alignItems:`flex-start`},children:[(0,c.jsx)(`span`,{className:`pg-label`,style:{paddingTop:`0.5rem`},children:`menuItems`}),(0,c.jsx)(`div`,{style:{flex:1},children:(0,c.jsx)(b,{items:g,onChange:_})})]})]}),(0,c.jsx)(a,{code:S})]})}var C=[{title:`Playground`,description:`Preview do layout completo. Clique no hambúrguer para abrir/fechar a sidebar. Edite os itens do menu, escolha o modo e veja o resultado em tempo real.`,example:(0,c.jsx)(S,{}),code:``},{title:`Integração com React Router`,description:`O Layout usa <Outlet /> internamente. Configure-o como element de uma rota pai e declare as rotas filhas normalmente.`,example:(0,c.jsx)(c.Fragment,{}),code:`import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LayoutSeplag } from "@seplag/ui-lib-react-18";

const router = createBrowserRouter([
  {
    path: "/app",
    element: (
      <LayoutSeplag
        nomeSistema="SGI"
        ambienteSistema="PRODUÇÃO"
        menuMode="static"
        sistemas={sistemas}
        logoSrc={logoSrc}
        logoHref="/login"
        menuItems={menuItems}
        footerText="SEPLAG - STI"
        nomeApresentacao={user.nome}
        numrVinculoAtual={vinculo.numrVinculo}
        vinculos={user.vinculos}
        onLogout={handleLogout}
        onAlterarSenha={handleAlterarSenha}
        onSelecionarVinculo={handleSelecionarVinculo}
      />
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "pessoas",   element: <Pessoas />   },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}`},{title:`Montando o menu com permissões`,description:`Use hasPermissionByRouteListSeplag para filtrar os itens com base nas permissões do usuário antes de passar para o Layout.`,example:(0,c.jsx)(c.Fragment,{}),code:`import { hasPermissionByRouteListSeplag, type IMenuSeplag } from "@seplag/ui-lib-react-18";

const menuBase: IMenuSeplag[] = [
  { label: "Início", icon: "pi pi-home", to: "/app/inicio" },
  {
    label: "Cadastro",
    icon: "pi pi-file-edit",
    items: [
      {
        label: "Pessoas",
        icon: "pi pi-users",
        to: "/app/pessoas",
        permissionKeys: ["PESSOAS_LISTAR"],
      },
    ],
  },
];

const menuFiltrado = hasPermissionByRouteListSeplag(menuBase);

<LayoutSeplag menuItems={menuFiltrado} menuMode="static" ... />`}],w=[{name:`nomeSistema`,type:`string`,required:!0,description:`Nome do sistema exibido na topbar.`},{name:`ambienteSistema`,type:`string`,required:!0,description:`Ambiente exibido na topbar, ex: "PRODUÇÃO".`},{name:`menuMode`,type:`"static" | "overlay"`,defaultValue:`"static"`,required:!1,description:`"static": sidebar empurra/recolhe o conteúdo com o hambúrguer. "overlay": sidebar flutua sobre o conteúdo, fechar ao clicar fora.`},{name:`sistemas`,type:`AppSystemItemSeplag[]`,required:!0,description:`Lista de sistemas para o AppSwitcher na topbar.`},{name:`logoSrc`,type:`string`,required:!0,description:`URL ou import da imagem do logo exibida no topo da sidebar.`},{name:`logoHref`,type:`string`,defaultValue:`"#"`,required:!1,description:`Destino do link ao clicar no logo.`},{name:`menuItems`,type:`IMenuSeplag[]`,required:!0,description:`Itens do menu lateral. Use hasPermissionByRouteListSeplag para filtrar por permissão.`},{name:`footerText`,type:`string`,required:!1,description:`Texto simples exibido no rodapé.`},{name:`footerChildren`,type:`ReactNode`,required:!1,description:`Conteúdo customizado para o rodapé (substitui footerText).`},{name:`children`,type:`ReactNode`,required:!1,description:`Conteúdo da área principal. Quando omitido usa <Outlet /> do react-router-dom.`},{name:`nomeApresentacao`,type:`string`,required:!0,description:`Nome do usuário exibido no perfil da sidebar.`},{name:`numrVinculoAtual`,type:`string | number`,required:!0,description:`Número do vínculo ativo exibido no perfil.`},{name:`vinculos`,type:`IVinculo[]`,required:!0,description:`Lista de vínculos disponíveis para troca no perfil.`},{name:`avatarSrc`,type:`string`,required:!1,description:`URL da foto de perfil. Usa avatar padrão se omitido.`},{name:`onLogout`,type:`() => void`,required:!0,description:`Callback chamado ao clicar em Sair.`},{name:`onAlterarSenha`,type:`(senhaAtual, senhaNova, confirmarSenha) => void`,required:!0,description:`Callback chamado ao confirmar a troca de senha.`},{name:`onSelecionarVinculo`,type:`(vinculo: IVinculo) => void`,required:!0,description:`Callback chamado ao trocar o vínculo ativo.`}];function T(){return(0,c.jsx)(o,{title:`Layout`,description:`Shell completo da aplicação SEPLAG — topbar, sidebar com menu e perfil, área de conteúdo via <Outlet /> e rodapé configurável. Integra todos os componentes de navegação em um único componente prop-driven.`,badge:`Estável`,since:`v0.0.1`,sections:C,props:w})}export{T as default};