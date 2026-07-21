import{a as e,n as t,t as n}from"./jsx-runtime-ChuIQw48.js";import{g as r}from"./colors-U-UCv8-3.js";import{c as i}from"./Botao-D0JOC08D.js";import{t as a}from"./Modal-ooeCkcDQ.js";import{K as o,N as s}from"./index-DyeHa39m.js";import{t as c}from"./DocPage-CHgTh2J-.js";var l=e(t(),1),u=(0,l.createContext)(null);function d(){let e=(0,l.useContext)(u);if(!e)throw Error(`useUnsavedChanges deve ser usado dentro de um <UnsavedChangesProvider>.`);return e}function f(e){let{setDirty:t}=d();(0,l.useEffect)(()=>(t(e),()=>t(!1)),[e,t])}var p=n(),m=`Você possui alterações não salvas. Se sair agora, os dados serão perdidos.`;function h(e,t=m){let[n,o]=(0,l.useState)(!1),s=(0,l.useRef)(null),c=(0,l.useRef)(null),u=(0,l.useRef)(!1),d=(0,l.useRef)(globalThis.history.pushState.bind(globalThis.history)),f=(0,l.useRef)(globalThis.history.replaceState.bind(globalThis.history));(0,l.useEffect)(()=>{let t=e=>{e.preventDefault()};return e&&globalThis.addEventListener(`beforeunload`,t),()=>globalThis.removeEventListener(`beforeunload`,t)},[e,t]),(0,l.useEffect)(()=>{if(!e)return;d.current=globalThis.history.pushState.bind(globalThis.history),f.current=globalThis.history.replaceState.bind(globalThis.history);let t=e=>(t,n,r)=>{if(u.current){e(t,n,r);return}if((r?new URL(r.toString(),globalThis.location.href).pathname:globalThis.location.pathname)===globalThis.location.pathname){e(t,n,r);return}s.current={state:t,title:n,url:r},c.current=null,o(!0)};globalThis.history.pushState=t(d.current),globalThis.history.replaceState=t(f.current);let n=()=>{u.current||(d.current(globalThis.history.state,``,globalThis.location.href),s.current=null,c.current=null,o(!0))};return globalThis.addEventListener(`popstate`,n),()=>{globalThis.history.pushState=d.current,globalThis.history.replaceState=f.current,globalThis.removeEventListener(`popstate`,n)}},[e]);let h=t=>{if(!e){t();return}c.current=t,s.current=null,o(!0)},g=()=>{o(!1),s.current=null,c.current=null};return{guard:h,Modal:(0,p.jsx)(a,{visible:n,titulo:`Alterações não salvas`,fechar:g,customFooter:(0,p.jsxs)(`div`,{className:`modalSeplag-botoes-footer modalSeplag-botoes-footer-right`,children:[(0,p.jsx)(i,{label:`Sim`,onClick:()=>{let e=c.current,t=s.current;c.current=null,s.current=null,o(!1),e?e():t?(u.current=!0,d.current(t.state,t.title,t.url),globalThis.dispatchEvent(new PopStateEvent(`popstate`,{state:t.state})),setTimeout(()=>{u.current=!1},0)):(u.current=!0,globalThis.history.go(-1),setTimeout(()=>{u.current=!1},0))},style:{color:r,backgroundColor:`white`,border:`1px solid ${r}`,minWidth:120}}),(0,p.jsx)(i,{label:`Cancelar`,onClick:g,style:{minWidth:120},autoFocus:!0})]}),alignFooter:`right`,children:(0,p.jsxs)(`div`,{children:[t,(0,p.jsx)(`p`,{children:`Deseja continuar?`})]})})}}function g({children:e}){let[t,n]=(0,l.useState)(!1),{guard:r,Modal:i}=h(t),a=(0,l.useMemo)(()=>({setDirty:n,guard:r}),[r]);return(0,p.jsxs)(u.Provider,{value:a,children:[i,e]})}var _=()=>null;function v(){let{control:e,formState:t}=o({defaultValues:{nome:``}});f(t.isDirty);let{guard:n}=d();return(0,p.jsxs)(`div`,{className:`flex flex-column gap-3`,style:{width:`100%`},children:[(0,p.jsx)(`div`,{className:`grid`,style:{width:`100%`},children:(0,p.jsx)(s,{name:`nome`,control:e,label:`Nome (edite para marcar como dirty)`,placeholder:`Digite algo...`,cols:`12`,getFormErrorMessage:_})}),(0,p.jsx)(`div`,{className:`flex gap-2`,children:(0,p.jsx)(i,{label:`Navegar (protegido)`,icon:`pi pi-arrow-right`,onClick:()=>n(()=>alert(`Navegação permitida!`))})}),(0,p.jsxs)(`small`,{className:`text-500`,children:[`Estado do formulário:`,` `,(0,p.jsx)(`strong`,{children:t.isDirty?`com alterações`:`sem alterações`})]})]})}function y(){return(0,p.jsx)(g,{children:(0,p.jsx)(v,{})})}function b(){let{setDirty:e,guard:t}=d(),[n,r]=(0,l.useState)(!1);return(0,p.jsxs)(`div`,{className:`flex flex-column gap-3`,children:[(0,p.jsxs)(`div`,{className:`flex gap-2 align-items-center`,children:[(0,p.jsx)(i,{label:n?`Limpar alterações`:`Simular alteração`,icon:n?`pi pi-times`:`pi pi-pencil`,onClick:()=>{let t=!n;r(t),e(t)}}),(0,p.jsx)(i,{label:`Ação protegida`,icon:`pi pi-shield`,onClick:()=>t(()=>alert(`Ação executada!`))})]}),(0,p.jsxs)(`small`,{className:`text-500`,children:[`Estado:`,` `,(0,p.jsx)(`strong`,{children:n?`com alterações`:`sem alterações`})]})]})}function x(){return(0,p.jsx)(g,{children:(0,p.jsx)(b,{})})}var S=[{title:`Com formulário react-hook-form`,description:`Use useUnsavedChangesSyncSeplag para sincronizar automaticamente o isDirty do useForm com o provider. Edite o campo e clique no botão para ver o modal de confirmação.`,example:(0,p.jsx)(y,{}),code:`// 1. Envolva a aplicação (ou a rota) com o Provider
import {
  UnsavedChangesProviderSeplag,
  useUnsavedChangesSyncSeplag,
  useUnsavedChangesSeplag,
} from "@seplag/ui-lib-react-18";

function App() {
  return (
    <UnsavedChangesProviderSeplag>
      <Router />
    </UnsavedChangesProviderSeplag>
  );
}

// 2. Dentro do formulário, sincronize o estado
function MeuFormulario() {
  const { control, formState } = useForm();

  useUnsavedChangesSyncSeplag(formState.isDirty);

  const { guard } = useUnsavedChangesSeplag();

  return (
    <>
      <TextFieldSeplag name="nome" control={control} label="Nome" ... />
      <button onClick={() => guard(() => navigate("/outra-rota"))}>
        Voltar
      </button>
    </>
  );
}`},{title:`Controle manual com setDirty`,description:`Use setDirty diretamente para cenários fora de formulários react-hook-form. O guard protege qualquer ação customizada.`,example:(0,p.jsx)(x,{}),code:`function MeuComponente() {
  const { setDirty, guard } = useUnsavedChangesSeplag();

  // Marcar como sujo após qualquer alteração
  const handleChange = () => setDirty(true);

  // Proteger uma ação/navegação
  const handleVoltar = () => guard(() => navigate("/lista"));

  return (
    <>
      <button onClick={handleChange}>Fazer alteração</button>
      <button onClick={handleVoltar}>Voltar</button>
    </>
  );
}`}],C=[{name:`children`,type:`ReactNode`,required:!0,description:`Árvore de componentes protegida pelo provider.`}],w=[{name:`isDirty`,type:`boolean`,required:!0,description:`Estado de sujidade do formulário. Quando true, ativa a proteção de navegação.`}],T=[{name:`setDirty`,type:`(dirty: boolean) => void`,required:!1,description:`Define manualmente se há alterações não salvas.`},{name:`guard`,type:`(action: () => void) => void`,required:!1,description:`Envolve uma ação: se isDirty, exibe o modal de confirmação antes de executá-la.`}];function E(){return(0,p.jsx)(c,{title:`UnsavedChangesWarning`,description:`Sistema de proteção contra perda de dados não salvos. Combina um Provider (contexto), interceptação de navegação (pushState / popstate) e um Modal de confirmação. Integra-se nativamente com react-hook-form via useUnsavedChangesSyncSeplag.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import {
  UnsavedChangesProviderSeplag,
  useUnsavedChangesSyncSeplag,
  useUnsavedChangesSeplag,
} from "@seplag/ui-lib-react-18";`,sections:S,props:[...C.map(e=>({...e,name:`[Provider] ${e.name}`})),...w.map(e=>({...e,name:`[useUnsavedChangesSyncSeplag] ${e.name}`})),...T.map(e=>({...e,name:`[useUnsavedChangesSeplag] ${e.name}`}))]})}export{E as default};