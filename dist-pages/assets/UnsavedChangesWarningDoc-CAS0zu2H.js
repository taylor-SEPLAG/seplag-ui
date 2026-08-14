import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{r}from"./checkbox.esm-4xavqYZ-.js";import{c as i}from"./Botao-HMAspibd.js";import{v as a}from"./Fields-Zarl6JUN.js";import{n as o,r as s,t as c}from"./UnsavedChangesWarning-Cslk5ij-.js";import{t as l}from"./DocPage-DfNa9OED.js";var u=e(t(),1),d=n(),f=()=>null;function p(){let{control:e,formState:t}=r({defaultValues:{nome:``}});s(t.isDirty);let{guard:n}=o();return(0,d.jsxs)(`div`,{className:`flex flex-column gap-3`,style:{width:`100%`},children:[(0,d.jsx)(`div`,{className:`grid`,style:{width:`100%`},children:(0,d.jsx)(a,{name:`nome`,control:e,label:`Nome (edite para marcar como dirty)`,placeholder:`Digite algo...`,cols:`12`,getFormErrorMessage:f})}),(0,d.jsx)(`div`,{className:`flex gap-2`,children:(0,d.jsx)(i,{label:`Navegar (protegido)`,icon:`pi pi-arrow-right`,onClick:()=>n(()=>alert(`Navegação permitida!`))})}),(0,d.jsxs)(`small`,{className:`text-500`,children:[`Estado do formulário:`,` `,(0,d.jsx)(`strong`,{children:t.isDirty?`com alterações`:`sem alterações`})]})]})}function m(){return(0,d.jsx)(c,{children:(0,d.jsx)(p,{})})}function h(){let{setDirty:e,guard:t}=o(),[n,r]=(0,u.useState)(!1);return(0,d.jsxs)(`div`,{className:`flex flex-column gap-3`,children:[(0,d.jsxs)(`div`,{className:`flex gap-2 align-items-center`,children:[(0,d.jsx)(i,{label:n?`Limpar alterações`:`Simular alteração`,icon:n?`pi pi-times`:`pi pi-pencil`,onClick:()=>{let t=!n;r(t),e(t)}}),(0,d.jsx)(i,{label:`Ação protegida`,icon:`pi pi-shield`,onClick:()=>t(()=>alert(`Ação executada!`))})]}),(0,d.jsxs)(`small`,{className:`text-500`,children:[`Estado:`,` `,(0,d.jsx)(`strong`,{children:n?`com alterações`:`sem alterações`})]})]})}function g(){return(0,d.jsx)(c,{children:(0,d.jsx)(h,{})})}var _=[{title:`Com formulário react-hook-form`,description:`Use useUnsavedChangesSyncSeplag para sincronizar automaticamente o isDirty do useForm com o provider. Edite o campo e clique no botão para ver o modal de confirmação.`,example:(0,d.jsx)(m,{}),code:`// 1. Envolva a aplicação (ou a rota) com o Provider
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
}`},{title:`Controle manual com setDirty`,description:`Use setDirty diretamente para cenários fora de formulários react-hook-form. O guard protege qualquer ação customizada.`,example:(0,d.jsx)(g,{}),code:`function MeuComponente() {
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
}`}],v=[{name:`children`,type:`ReactNode`,required:!0,description:`Árvore de componentes protegida pelo provider.`}],y=[{name:`isDirty`,type:`boolean`,required:!0,description:`Estado de sujidade do formulário. Quando true, ativa a proteção de navegação.`}],b=[{name:`setDirty`,type:`(dirty: boolean) => void`,required:!1,description:`Define manualmente se há alterações não salvas.`},{name:`guard`,type:`(action: () => void) => void`,required:!1,description:`Envolve uma ação: se isDirty, exibe o modal de confirmação antes de executá-la.`}];function x(){return(0,d.jsx)(l,{title:`UnsavedChangesWarning`,description:`Sistema de proteção contra perda de dados não salvos. Combina um Provider (contexto), interceptação de navegação (pushState / popstate) e um Modal de confirmação. Integra-se nativamente com react-hook-form via useUnsavedChangesSyncSeplag.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import {
  UnsavedChangesProviderSeplag,
  useUnsavedChangesSyncSeplag,
  useUnsavedChangesSeplag,
} from "@seplag/ui-lib-react-18";`,sections:_,props:[...v.map(e=>({...e,name:`[Provider] ${e.name}`})),...y.map(e=>({...e,name:`[useUnsavedChangesSyncSeplag] ${e.name}`})),...b.map(e=>({...e,name:`[useUnsavedChangesSeplag] ${e.name}`}))]})}export{x as default};