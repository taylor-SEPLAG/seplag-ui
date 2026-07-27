import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";import{A as r,N as i,O as a,P as o,b as s,g as c,h as l,j as u,m as d,s as f,w as p,x as m}from"./hooks.esm-DR260yFp.js";/* empty css              */import{n as h,t as g}from"./componentbase.esm-Bg3bXvUu.js";import{t as _}from"./ripple.esm-C5OmFqcM.js";import{t as v}from"./portal.esm-Blcf6D9g.js";import{t as y}from"./index.esm-BreMkWr1.js";import{t as b}from"./csstransition.esm-BI_o9ntn.js";import{t as x}from"./TransitionGroup-BsEzPP9Q.js";import{t as S}from"./index.esm-DMJCJHxy.js";import{n as C,t as w}from"./index.esm-DF3acsZi.js";import{t as T}from"./index.esm-C2MySAtr.js";import{n as E,t as D}from"./toast-Bg1rk8Eh.js";import{n as O,t as k}from"./DocPage-DNS5xyAT.js";var A=e(t());function j(){return j=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},j.apply(null,arguments)}function M(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function N(e){if(Array.isArray(e))return M(e)}function P(e){if(typeof Symbol<`u`&&e[Symbol.iterator]!=null||e[`@@iterator`]!=null)return Array.from(e)}function F(e,t){if(e){if(typeof e==`string`)return M(e,t);var n={}.toString.call(e).slice(8,-1);return n===`Object`&&e.constructor&&(n=e.constructor.name),n===`Map`||n===`Set`?Array.from(e):n===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?M(e,t):void 0}}function I(){throw TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function L(e){return N(e)||P(e)||F(e)||I()}function R(e){if(Array.isArray(e))return e}function z(e,t){var n=e==null?null:typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n!=null){var r,i,a,o,s=[],c=!0,l=!1;try{if(a=(n=n.call(e)).next,t===0){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=a.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){l=!0,i=e}finally{try{if(!c&&n.return!=null&&(o=n.return(),Object(o)!==o))return}finally{if(l)throw i}}return s}}function B(){throw TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function V(e,t){return R(e)||z(e,t)||F(e,t)||B()}function H(e){"@babel/helpers - typeof";return H=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},H(e)}function U(e,t){if(H(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(H(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function W(e){var t=U(e,`string`);return H(t)==`symbol`?t:t+``}function G(e,t,n){return(t=W(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var K=g.extend({defaultProps:{__TYPE:`Toast`,id:null,className:null,content:null,style:null,baseZIndex:0,position:`top-right`,transitionOptions:null,appendTo:`self`,onClick:null,onRemove:null,onShow:null,onHide:null,onMouseEnter:null,onMouseLeave:null,children:void 0},css:{classes:{root:function(e){var t=e.props,n=e.context;return o(`p-toast p-component p-toast-`+t.position,t.className,{"p-input-filled":n&&n.inputStyle===`filled`||s.inputStyle===`filled`,"p-ripple-disabled":n&&n.ripple===!1||s.ripple===!1})},message:{message:function(e){var t=e.severity;return o(`p-toast-message`,G({},`p-toast-message-${t}`,t))},content:`p-toast-message-content`,buttonicon:`p-toast-icon-close-icon`,closeButton:`p-toast-icon-close p-link`,icon:`p-toast-message-icon`,text:`p-toast-message-text`,summary:`p-toast-summary`,detail:`p-toast-detail`},transition:`p-toast-message`},styles:`
@layer primereact {
    .p-toast {
        width: calc(100% - var(--toast-indent, 0px));
        max-width: 25rem;
    }
    
    .p-toast-message-icon {
        flex-shrink: 0;
    }
    
    .p-toast-message-content {
        display: flex;
        align-items: flex-start;
    }
    
    .p-toast-message-text {
        flex: 1 1 auto;
    }
    
    .p-toast-summary {
        overflow-wrap: anywhere;
    }
    
    .p-toast-detail {
        overflow-wrap: anywhere;
    }
    
    .p-toast-top-center {
        transform: translateX(-50%);
    }
    
    .p-toast-bottom-center {
        transform: translateX(-50%);
    }
    
    .p-toast-center {
        min-width: 20vw;
        transform: translate(-50%, -50%);
    }
    
    .p-toast-icon-close {
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
    }
    
    .p-toast-icon-close.p-link {
        cursor: pointer;
    }
    
    /* Animations */
    .p-toast-message-enter {
        opacity: 0;
        transform: translateY(50%);
    }
    
    .p-toast-message-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: transform 0.3s, opacity 0.3s;
    }
    
    .p-toast-message-enter-done {
        transform: none;
    }
    
    .p-toast-message-exit {
        opacity: 1;
        max-height: 1000px;
    }
    
    .p-toast .p-toast-message.p-toast-message-exit-active {
        opacity: 0;
        max-height: 0;
        margin-bottom: 0;
        overflow: hidden;
        transition: max-height 0.45s cubic-bezier(0, 1, 0, 1), opacity 0.3s, margin-bottom 0.3s;
    }
}
`,inlineStyles:{root:function(e){var t=e.props;return{position:`fixed`,top:t.position===`top-right`||t.position===`top-left`||t.position===`top-center`?`20px`:t.position===`center`?`50%`:null,right:(t.position===`top-right`||t.position===`bottom-right`)&&`20px`,bottom:(t.position===`bottom-left`||t.position===`bottom-right`||t.position===`bottom-center`)&&`20px`,left:t.position===`top-left`||t.position===`bottom-left`?`20px`:t.position===`center`||t.position===`top-center`||t.position===`bottom-center`?`50%`:null}}}}});function q(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function J(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?q(Object(n),!0).forEach(function(t){G(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):q(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var Y=A.memo(A.forwardRef(function(e,t){var n=f(),i=e.messageInfo,s=e.metaData,c=e.ptCallbacks,l=c.ptm,m=c.ptmo,h=c.cx,g=e.index,v=i.message,b=v.severity,x=v.content,E=v.summary,D=v.detail,O=v.closable,k=v.life,j=v.sticky,M=v.className,N=v.style,P=v.contentClassName,F=v.contentStyle,I=v.icon,L=v.closeIcon,R=v.pt,z={index:g},B=J(J({},s),z),H=V(A.useState(!1),2),U=H[0],W=H[1],G=V(d(function(){q()},k||3e3,!j&&!U),1)[0],K=function(t,n){return l(t,J({hostName:e.hostName},n))},q=function(){G(),e.onClose&&e.onClose(i)},Y=function(t){e.onClick&&!(a.hasClass(t.target,`p-toast-icon-close`)||a.hasClass(t.target,`p-toast-icon-close-icon`))&&e.onClick(i.message)},X=function(t){e.onMouseEnter&&e.onMouseEnter(t),!t.defaultPrevented&&(j||(G(),W(!0)))},Z=function(t){e.onMouseLeave&&e.onMouseLeave(t),!t.defaultPrevented&&(j||W(!1))},Q=function(){var t=n({className:h(`message.buttonicon`)},K(`buttonicon`,B),m(R,`buttonicon`,J(J({},z),{},{hostName:e.hostName}))),i=L||A.createElement(y,t),a=r.getJSXIcon(i,J({},t),{props:e}),o=n({type:`button`,className:h(`message.closeButton`),onClick:q,"aria-label":e.ariaCloseLabel||p(`close`)},K(`closeButton`,B),m(R,`closeButton`,J(J({},z),{},{hostName:e.hostName})));return O===!1?null:A.createElement(`div`,null,A.createElement(`button`,o,a,A.createElement(_,null)))},$=function(){if(i){var t=u.getJSXElement(x,{message:i.message,onClick:Y,onClose:q}),a=n({className:h(`message.icon`)},K(`icon`,B),m(R,`icon`,J(J({},z),{},{hostName:e.hostName}))),o=I;if(!I)switch(b){case`info`:o=A.createElement(w,a);break;case`warn`:o=A.createElement(C,a);break;case`error`:o=A.createElement(T,a);break;case`success`:o=A.createElement(S,a);break}var s=r.getJSXIcon(o,J({},a),{props:e}),c=n({className:h(`message.text`)},K(`text`,B),m(R,`text`,J(J({},z),{},{hostName:e.hostName}))),l=n({className:h(`message.summary`)},K(`summary`,B),m(R,`summary`,J(J({},z),{},{hostName:e.hostName}))),d=n({className:h(`message.detail`)},K(`detail`,B),m(R,`detail`,J(J({},z),{},{hostName:e.hostName})));return t||A.createElement(A.Fragment,null,s,A.createElement(`div`,c,A.createElement(`span`,l,E),D&&A.createElement(`div`,d,D)))}return null}(),ee=Q(),te=n({ref:t,className:o(M,h(`message.message`,{severity:b})),style:N,role:`alert`,"aria-live":`assertive`,"aria-atomic":`true`,onClick:Y,onMouseEnter:X,onMouseLeave:Z},K(`message`,B),m(R,`root`,J(J({},z),{},{hostName:e.hostName}))),ne=n({className:o(P,h(`message.content`)),style:F},K(`content`,B),m(R,`content`,J(J({},z),{},{hostName:e.hostName})));return A.createElement(`div`,te,A.createElement(`div`,ne,$,ee))}));Y.displayName=`ToastMessage`;var X=0,Z=A.memo(A.forwardRef(function(e,t){var n=f(),r=A.useContext(m),a=K.getProps(e,r),o=V(A.useState([]),2),d=o[0],p=o[1],g=A.useRef(null),_={props:a,state:{messages:d}},y=K.setMetaData(_);h(K.css.styles,y.isUnstyled,{name:`toast`});var S=function(e){e&&p(function(t){return C(t,e,!0)})},C=function(e,t,n){var r;if(Array.isArray(t)){var i=t.reduce(function(e,t){return e.push({_pId:X++,message:t}),e},[]);r=n&&e?[].concat(L(e),L(i)):i}else{var a={_pId:X++,message:t};r=n&&e?[].concat(L(e),[a]):[a]}return r},w=function(){i.clear(g.current),p([])},T=function(e){p(function(t){return C(t,e,!1)})},E=function(e){var t=u.isNotEmpty(e._pId)?e._pId:e.message||e;p(function(n){return n.filter(function(n){return n._pId!==e._pId&&!u.deepEquals(n.message,t)})}),a.onRemove&&a.onRemove(e.message||t)},D=function(e){E(e)},O=function(){a.onShow&&a.onShow()},k=function(){d.length===1&&i.clear(g.current),a.onHide&&a.onHide()};c(function(){i.set(`toast`,g.current,r&&r.autoZIndex||s.autoZIndex,a.baseZIndex||r&&r.zIndex.toast||s.zIndex.toast)},[d,a.baseZIndex]),l(function(){i.clear(g.current)}),A.useImperativeHandle(t,function(){return{props:a,show:S,replace:T,remove:E,clear:w,getElement:function(){return g.current}}});var M=function(){var t=n({ref:g,id:a.id,className:y.cx(`root`,{context:r}),style:y.sx(`root`)},K.getOtherProps(a),y.ptm(`root`)),i=n({classNames:y.cx(`transition`),timeout:{enter:300,exit:300},options:a.transitionOptions,unmountOnExit:!0,onEntered:O,onExited:k},y.ptm(`transition`));return A.createElement(`div`,t,A.createElement(x,null,d&&d.map(function(t,n){var r=A.createRef();return A.createElement(b,j({nodeRef:r,key:t._pId},i),e.content?u.getJSXElement(e.content,{message:t.message}):A.createElement(Y,{hostName:`Toast`,ref:r,messageInfo:t,index:n,onClick:a.onClick,onClose:D,onMouseEnter:a.onMouseEnter,onMouseLeave:a.onMouseLeave,closeIcon:a.closeIcon,ptCallbacks:y,metaData:_}))})))}();return A.createElement(v,{element:M,appendTo:a.appendTo})}));Z.displayName=`Toast`;var Q=n();function $({children:e}){let t=(0,A.useRef)(null),n=(0,A.useMemo)(()=>({toastRef:t}),[]);return(0,Q.jsxs)(E.Provider,{value:n,children:[(0,Q.jsx)(Z,{ref:t}),e]})}var ee=[{value:`sucesso`,label:`toastSucesso`},{value:`erro`,label:`toastErro`},{value:`atencao`,label:`toastAtencao`},{value:`custom`,label:`printToast (custom)`}],te=[`success`,`error`,`warn`,`info`],ne={sucesso:`toastSucesso`,erro:`toastErro`,atencao:`toastAtencao`,custom:`printToast`},re={sucesso:`Sucesso (padrão)`,erro:`Erro (padrão)`,atencao:`Atenção (padrão)`,custom:`ex: Aviso`},ie={sucesso:`Operação realizada com sucesso!`,erro:`Ocorreu um erro inesperado.`,atencao:`Verifique os dados antes de continuar.`};function ae(e,t,n){return`${ne[e]}("${t}"${n?`, "${n}"`:``});`}function oe(){let{toastSucesso:e,toastErro:t,toastAtencao:n,printToast:r}=D(),[i,a]=(0,A.useState)(`sucesso`),[o,s]=(0,A.useState)(`Operação realizada com sucesso!`),[c,l]=(0,A.useState)(``),[u,d]=(0,A.useState)(`success`),[f,p]=(0,A.useState)(`5000`),[m,h]=(0,A.useState)(!1);function g(){i===`sucesso`?e(o,c||void 0):i===`erro`?t(o,c||void 0):i===`atencao`?n(o,c||void 0):r({severity:u,summary:c||u,detail:o,life:m?void 0:Number(f)||5e3,sticky:m})}let _=(i===`custom`?[`printToast({`,`  severity: "${u}",`,`  summary: "${c||u}",`,`  detail: "${o}",`,...m?[`  sticky: true,`]:[`  life: ${f||5e3},`],`});`]:[`// Chamada direta`,ae(i,o,c)]).join(`
`);return(0,Q.jsxs)(`div`,{className:`botao-playground`,children:[(0,Q.jsxs)(`div`,{className:`botao-playground-preview`,style:{flexDirection:`column`,gap:`0.75rem`},children:[(0,Q.jsx)(`p`,{style:{margin:0,fontSize:`0.85rem`,color:`#6b7280`},children:`Clique no botão para disparar o toast configurado abaixo.`}),(0,Q.jsxs)(`button`,{onClick:g,style:{padding:`0.5rem 1.5rem`,background:`#2563eb`,color:`#fff`,border:`none`,borderRadius:6,fontWeight:600,cursor:`pointer`,fontSize:`0.9rem`},children:[(0,Q.jsx)(`i`,{className:`pi pi-bell`}),` Disparar Toast`]})]}),(0,Q.jsxs)(`div`,{className:`botao-playground-controls`,children:[(0,Q.jsxs)(`div`,{className:`pg-field`,children:[(0,Q.jsx)(`span`,{className:`pg-label`,children:`tipo`}),(0,Q.jsx)(`div`,{className:`pg-radio-group`,children:ee.map(e=>(0,Q.jsx)(`button`,{className:`pg-radio-btn${i===e.value?` selected`:``}`,onClick:()=>{a(e.value);let t=ie[e.value];t!==void 0&&(s(t),l(``)),e.value===`custom`&&d(`info`)},children:e.label},e.value))})]}),i===`custom`&&(0,Q.jsxs)(`div`,{className:`pg-field`,children:[(0,Q.jsx)(`span`,{className:`pg-label`,children:`severity`}),(0,Q.jsx)(`div`,{className:`pg-radio-group`,children:te.map(e=>(0,Q.jsx)(`button`,{className:`pg-radio-btn${u===e?` selected`:``}`,onClick:()=>d(e),children:e},e))})]}),(0,Q.jsxs)(`div`,{className:`pg-field`,children:[(0,Q.jsx)(`span`,{className:`pg-label`,children:`detail`}),(0,Q.jsx)(`input`,{className:`pg-input`,value:o,onChange:e=>s(e.target.value),style:{maxWidth:400}})]}),(0,Q.jsxs)(`div`,{className:`pg-field`,children:[(0,Q.jsx)(`span`,{className:`pg-label`,children:`summary`}),(0,Q.jsx)(`input`,{className:`pg-input`,value:c,onChange:e=>l(e.target.value),placeholder:re[i],style:{maxWidth:300}})]}),i===`custom`&&(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`div`,{className:`pg-field`,children:[(0,Q.jsx)(`span`,{className:`pg-label`,children:`life (ms)`}),(0,Q.jsx)(`input`,{className:`pg-input`,value:f,onChange:e=>p(e.target.value),disabled:m,style:{maxWidth:120}})]}),(0,Q.jsxs)(`div`,{className:`pg-field`,children:[(0,Q.jsx)(`span`,{className:`pg-label`,children:`sticky`}),(0,Q.jsx)(`div`,{className:`pg-checkbox-group`,children:(0,Q.jsx)(`button`,{className:`pg-checkbox-btn${m?` selected`:``}`,onClick:()=>h(e=>!e),children:`sticky`})})]})]})]}),(0,Q.jsx)(O,{code:_})]})}function se(){return(0,Q.jsx)($,{children:(0,Q.jsx)(oe,{})})}var ce=[{title:`Playground`,description:`Experimente os métodos do hook em tempo real.`,example:(0,Q.jsx)(se,{}),code:`// Em qualquer componente dentro do ToastProviderSeplag:
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
});`}],le=[{name:`toastSucesso`,type:`(detail: string, summary?: string) => void`,required:!1,description:`Exibe toast de sucesso. Summary padrão: "Sucesso". Life: 5000ms.`},{name:`toastErro`,type:`(detail: string, summary?: string) => void`,required:!1,description:`Exibe toast de erro. Summary padrão: "Erro". Life: 5000ms.`},{name:`toastAtencao`,type:`(detail: string, summary?: string) => void`,required:!1,description:`Exibe toast de atenção (warn). Summary padrão: "Atenção". Life: 5000ms.`},{name:`printToast`,type:`(arg: ToastMessage) => void`,required:!1,description:`Exibe toast com controle total. Aceita todas as props de ToastMessage do PrimeReact (severity, summary, detail, life, sticky, etc.).`}];function ue(){return(0,Q.jsx)(k,{title:`useToastSeplag`,description:`Hook para exibir notificações toast. Requer ToastProviderSeplag na árvore de componentes. Disponibiliza atalhos para as severidades mais comuns e acesso direto ao Toast do PrimeReact via printToast.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { ToastProviderSeplag } from "@seplag/ui-lib-react-18";
import { useToastSeplag } from "@seplag/ui-lib-react-18";`,sections:ce,props:le})}export{ue as default};