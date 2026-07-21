import{a as e,n as t,t as n}from"./jsx-runtime-ChuIQw48.js";import{f as r}from"./index-DyeHa39m.js";import{n as i,t as a}from"./DocPage-CHgTh2J-.js";var o=e(t(),1),s={"loader-overlay":`_loader-overlay_tnn7s_1`,text:`_text_tnn7s_37`,"loader-overlay-bounceSeplag":`_loader-overlay-bounceSeplag_tnn7s_1`,msg:`_msg_tnn7s_51`,"lds-ellipsis":`_lds-ellipsis_tnn7s_93`,"lds-ellipsis1Seplag":`_lds-ellipsis1Seplag_tnn7s_1`,"lds-ellipsis2Seplag":`_lds-ellipsis2Seplag_tnn7s_1`,"lds-ellipsis3Seplag":`_lds-ellipsis3Seplag_tnn7s_1`},c=n();function l(e=`Carregando`){let t=[`first`,`second`,`third`,`fourth`],n=e.trim()||`Carregando`;return(0,c.jsxs)(`div`,{className:s[`loader-overlay`],children:[(0,c.jsx)(`img`,{className:s.text,src:r,alt:`loader`}),(0,c.jsx)(`div`,{className:s[`lds-ellipsis`],children:t.map(e=>(0,c.jsx)(`div`,{},`loader-dot-${e}`))}),(0,c.jsx)(`span`,{className:s.msg,children:n})]})}function u(){let[e,t]=(0,o.useState)(!1),[n,r]=(0,o.useState)(`Buscando dados...`);function i(e){e!==void 0&&r(e),t(!0),setTimeout(()=>t(!1),2500)}return(0,c.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`1rem`,width:`100%`},children:[e&&l(n),(0,c.jsx)(`input`,{type:`text`,value:n,onChange:e=>r(e.target.value),disabled:e,placeholder:`Digite a mensagem do loader`,style:{width:`min(360px, 90%)`,padding:`0.55rem 0.75rem`,borderRadius:6,border:`1px solid #d1d5db`,fontSize:`0.9rem`}}),(0,c.jsxs)(`div`,{style:{display:`flex`,gap:`0.75rem`,flexWrap:`wrap`},children:[(0,c.jsx)(`button`,{onClick:()=>i(`Carregando`),disabled:e,style:{padding:`0.5rem 1rem`,background:e?`#6c757d`:`#0f766e`,color:`#fff`,border:`none`,borderRadius:6,fontWeight:600,cursor:e?`not-allowed`:`pointer`,fontSize:`0.9rem`},children:e?`Carregando...`:`Simular padrão`}),(0,c.jsx)(`button`,{onClick:()=>i(),disabled:e,style:{padding:`0.5rem 1rem`,background:e?`#6c757d`:`#2563eb`,color:`#fff`,border:`none`,borderRadius:6,fontWeight:600,cursor:e?`not-allowed`:`pointer`,fontSize:`0.9rem`},children:e?`Carregando...`:`Simular personalizada`})]})]})}function d(){return(0,c.jsxs)(`div`,{className:`botao-playground`,children:[(0,c.jsx)(`div`,{className:`botao-playground-preview`,style:{flexDirection:`column`},children:(0,c.jsx)(u,{})}),(0,c.jsx)(i,{code:`// 1. Coloque o Loader na raiz da aplicação (uma única vez)
import { LoaderSeplag } from "@seplag/ui-lib-react-18";

<LoaderSeplag text="Buscando dados..." />
<LoaderSeplag /> // fallback: "Carregando"

// 2. Controle via Redux — incremente/decremente o contador
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "@seplag/ui-lib-react-18";

const dispatch = useDispatch();

async function salvar() {
  dispatch(showLoader());
  try {
    await api.post("/registros", dados);
  } finally {
    dispatch(hideLoader());
  }
}`})]})}var f=[{title:`Playground`,description:`Visualize o overlay de carregamento.`,example:(0,c.jsx)(d,{}),code:``},{title:`Configuração`,description:`Adicione o LoaderSeplag uma única vez na raiz da aplicação. Ele se conecta ao Redux e exibe o overlay automaticamente sempre que houver operações pendentes. Opcionalmente, personalize a mensagem exibida.`,example:null,code:`// App.tsx ou layout principal
import { LoaderSeplag } from "@seplag/ui-lib-react-18";

export default function App() {
  return (
    <>
      <LoaderSeplag text="Carregando dados iniciais..." />
      {/* resto da aplicação */}
    </>
  );
}`},{title:`Mensagem personalizada`,description:`A prop text permite trocar a mensagem padrão Carregando por qualquer texto de contexto da operação atual.`,example:null,code:`import { LoaderSeplag } from "@seplag/ui-lib-react-18";

// Exibe: Processando solicitação...
<LoaderSeplag text="Processando solicitação..." />

// Sem a prop text, o padrão continua: Carregando
<LoaderSeplag />`},{title:`Controle via Redux`,description:`Use showLoader e hideLoader para controlar a visibilidade. O LoaderSeplag usa um contador interno — múltiplas chamadas paralelas são suportadas; o overlay só desaparece quando todas terminam.`,example:null,code:`import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "@seplag/ui-lib-react-18";

function MeuComponente() {
  const dispatch = useDispatch();

  async function buscarDados() {
    dispatch(showLoader());
    try {
      const dados = await api.get("/endpoint");
      setDados(dados);
    } finally {
      dispatch(hideLoader()); // sempre executado
    }
  }
}`},{title:`Múltiplas requisições paralelas`,description:`O contador garante que o overlay permaneça visível até que todas as operações sejam concluídas.`,example:null,code:`// Requisição A e B em paralelo
dispatch(showLoader()); // contador: 1
dispatch(showLoader()); // contador: 2

await Promise.all([requisicaoA(), requisicaoB()]);

dispatch(hideLoader()); // contador: 1 — overlay ainda visível
dispatch(hideLoader()); // contador: 0 — overlay removido`}],p=[{name:`text`,type:`string`,required:!1,description:`Mensagem exibida abaixo da animação. Padrão: Carregando.`}];function m(){return(0,c.jsx)(a,{title:`LoaderSeplag`,description:`Overlay de carregamento que cobre toda a tela enquanto há operações pendentes. Controlado via Redux com contador de requisições — suporta chamadas paralelas sem piscar.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { LoaderSeplag } from "@seplag/ui-lib-react-18";
import { showLoader, hideLoader } from "@seplag/ui-lib-react-18";`,sections:f,props:p})}export{m as default};