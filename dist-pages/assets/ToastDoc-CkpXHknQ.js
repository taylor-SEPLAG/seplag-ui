import{r as e}from"./rolldown-runtime-W7wSyTde.js";import{n as t,t as n}from"./jsx-runtime-DKzPl2sw.js";import{O as r,t as i}from"./index-PkcwLRE3.js";import{n as a,t as o}from"./DocPage-DnAaK-Th.js";var s=e(t(),1),c=n(),l=[{value:`sucesso`,label:`toastSucesso`},{value:`erro`,label:`toastErro`},{value:`atencao`,label:`toastAtencao`},{value:`custom`,label:`printToast (custom)`}],u=[`success`,`error`,`warn`,`info`],d={sucesso:`toastSucesso`,erro:`toastErro`,atencao:`toastAtencao`,custom:`printToast`},f={sucesso:`Sucesso (padrão)`,erro:`Erro (padrão)`,atencao:`Atenção (padrão)`,custom:`ex: Aviso`},p={sucesso:`Operação realizada com sucesso!`,erro:`Ocorreu um erro inesperado.`,atencao:`Verifique os dados antes de continuar.`};function m(e,t,n){return`${d[e]}("${t}"${n?`, "${n}"`:``});`}function h(){let{toastSucesso:e,toastErro:t,toastAtencao:n,printToast:i}=r(),[o,d]=(0,s.useState)(`sucesso`),[h,g]=(0,s.useState)(`Operação realizada com sucesso!`),[_,v]=(0,s.useState)(``),[y,b]=(0,s.useState)(`success`),[x,S]=(0,s.useState)(`5000`),[C,w]=(0,s.useState)(!1);function T(){o===`sucesso`?e(h,_||void 0):o===`erro`?t(h,_||void 0):o===`atencao`?n(h,_||void 0):i({severity:y,summary:_||y,detail:h,life:C?void 0:Number(x)||5e3,sticky:C})}let E=(o===`custom`?[`printToast({`,`  severity: "${y}",`,`  summary: "${_||y}",`,`  detail: "${h}",`,...C?[`  sticky: true,`]:[`  life: ${x||5e3},`],`});`]:[`// Chamada direta`,m(o,h,_)]).join(`
`);return(0,c.jsxs)(`div`,{className:`botao-playground`,children:[(0,c.jsxs)(`div`,{className:`botao-playground-preview`,style:{flexDirection:`column`,gap:`0.75rem`},children:[(0,c.jsx)(`p`,{style:{margin:0,fontSize:`0.85rem`,color:`#6b7280`},children:`Clique no botão para disparar o toast configurado abaixo.`}),(0,c.jsxs)(`button`,{onClick:T,style:{padding:`0.5rem 1.5rem`,background:`#2563eb`,color:`#fff`,border:`none`,borderRadius:6,fontWeight:600,cursor:`pointer`,fontSize:`0.9rem`},children:[(0,c.jsx)(`i`,{className:`pi pi-bell`}),` Disparar Toast`]})]}),(0,c.jsxs)(`div`,{className:`botao-playground-controls`,children:[(0,c.jsxs)(`div`,{className:`pg-field`,children:[(0,c.jsx)(`span`,{className:`pg-label`,children:`tipo`}),(0,c.jsx)(`div`,{className:`pg-radio-group`,children:l.map(e=>(0,c.jsx)(`button`,{className:`pg-radio-btn${o===e.value?` selected`:``}`,onClick:()=>{d(e.value);let t=p[e.value];t!==void 0&&(g(t),v(``)),e.value===`custom`&&b(`info`)},children:e.label},e.value))})]}),o===`custom`&&(0,c.jsxs)(`div`,{className:`pg-field`,children:[(0,c.jsx)(`span`,{className:`pg-label`,children:`severity`}),(0,c.jsx)(`div`,{className:`pg-radio-group`,children:u.map(e=>(0,c.jsx)(`button`,{className:`pg-radio-btn${y===e?` selected`:``}`,onClick:()=>b(e),children:e},e))})]}),(0,c.jsxs)(`div`,{className:`pg-field`,children:[(0,c.jsx)(`span`,{className:`pg-label`,children:`detail`}),(0,c.jsx)(`input`,{className:`pg-input`,value:h,onChange:e=>g(e.target.value),style:{maxWidth:400}})]}),(0,c.jsxs)(`div`,{className:`pg-field`,children:[(0,c.jsx)(`span`,{className:`pg-label`,children:`summary`}),(0,c.jsx)(`input`,{className:`pg-input`,value:_,onChange:e=>v(e.target.value),placeholder:f[o],style:{maxWidth:300}})]}),o===`custom`&&(0,c.jsxs)(c.Fragment,{children:[(0,c.jsxs)(`div`,{className:`pg-field`,children:[(0,c.jsx)(`span`,{className:`pg-label`,children:`life (ms)`}),(0,c.jsx)(`input`,{className:`pg-input`,value:x,onChange:e=>S(e.target.value),disabled:C,style:{maxWidth:120}})]}),(0,c.jsxs)(`div`,{className:`pg-field`,children:[(0,c.jsx)(`span`,{className:`pg-label`,children:`sticky`}),(0,c.jsx)(`div`,{className:`pg-checkbox-group`,children:(0,c.jsx)(`button`,{className:`pg-checkbox-btn${C?` selected`:``}`,onClick:()=>w(e=>!e),children:`sticky`})})]})]})]}),(0,c.jsx)(a,{code:E})]})}function g(){return(0,c.jsx)(i,{children:(0,c.jsx)(h,{})})}var _=[{title:`Playground`,description:`Experimente os métodos do hook em tempo real.`,example:(0,c.jsx)(g,{}),code:`// Em qualquer componente dentro do ToastProviderSeplag:
const { toastSucesso, toastErro, toastAtencao, printToast } = useToastSeplag();

toastSucesso("Registro salvo com sucesso!");
toastErro("Falha ao carregar os dados.");
toastAtencao("Verifique os campos obrigatórios.");`},{title:`Configuração do Provider`,description:`Envolva a raiz da aplicação (ou o layout principal) com ToastProviderSeplag para que o hook funcione em qualquer componente filho.`,example:null,code:`import { ToastProviderSeplag } from "@seplag/ui-lib-react-18";

// main.tsx ou App.tsx
<ToastProviderSeplag>
  <App />
</ToastProviderSeplag>`},{title:`Métodos atalho`,description:`toastSucesso, toastErro e toastAtencao possuem summary padrão pré-definido e tempo de exibição de 5 segundos.`,example:null,code:`const { toastSucesso, toastErro, toastAtencao } = useToastSeplag();

// Apenas detail — summary padrão é usado
toastSucesso("Cadastro realizado!");
toastErro("Não foi possível salvar.");
toastAtencao("Existem campos inválidos.");

// Sobrescrevendo o summary
toastSucesso("Senha alterada com sucesso!", "Senha atualizada");
toastErro("Sessão expirada.", "Autenticação necessária");`},{title:`printToast (mensagem customizada)`,description:`Use printToast para controle total sobre todas as propriedades do Toast do PrimeReact.`,example:null,code:`const { printToast } = useToastSeplag();

// Toast informativo que some após 8 segundos
printToast({
  severity: "info",
  summary: "Dica",
  detail: "Use Ctrl+S para salvar rapidamente.",
  life: 8000,
});

// Toast persistente (não some automaticamente)
printToast({
  severity: "warn",
  summary: "Atenção",
  detail: "Há alterações não salvas.",
  sticky: true,
});`}],v=[{name:`toastSucesso`,type:`(detail: string, summary?: string) => void`,required:!1,description:`Exibe toast de sucesso. Summary padrão: "Sucesso". Life: 5000ms.`},{name:`toastErro`,type:`(detail: string, summary?: string) => void`,required:!1,description:`Exibe toast de erro. Summary padrão: "Erro". Life: 5000ms.`},{name:`toastAtencao`,type:`(detail: string, summary?: string) => void`,required:!1,description:`Exibe toast de atenção (warn). Summary padrão: "Atenção". Life: 5000ms.`},{name:`printToast`,type:`(arg: ToastMessage) => void`,required:!1,description:`Exibe toast com controle total. Aceita todas as props de ToastMessage do PrimeReact (severity, summary, detail, life, sticky, etc.).`}];function y(){return(0,c.jsx)(o,{title:`useToastSeplag`,description:`Hook para exibir notificações toast. Requer ToastProviderSeplag na árvore de componentes. Disponibiliza atalhos para as severidades mais comuns e acesso direto ao Toast do PrimeReact via printToast.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { ToastProviderSeplag } from "@seplag/ui-lib-react-18";
import { useToastSeplag } from "@seplag/ui-lib-react-18";`,sections:_,props:v})}export{y as default};