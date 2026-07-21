import{a as e,n as t,t as n}from"./jsx-runtime-ChuIQw48.js";import{A as r,P as i,j as a,s as o,x as s}from"./hooks.esm-VKHbiLGd.js";import{n as c,t as l}from"./componentbase.esm-DBhW0MYQ.js";import{t as u}from"./button.esm-CpRXJc7C.js";import{c as d}from"./Botao-D0JOC08D.js";import{t as f}from"./index.esm-2sRBwv2g.js";import{t as p}from"./index.esm-D2NUmjc9.js";import{t as m}from"./dialog.esm-AU3RWUSv.js";import{H as h,U as g,t as _}from"./index-DyeHa39m.js";import{n as v,t as y}from"./DocPage-CHgTh2J-.js";var b=e(t()),x=l.extend({defaultProps:{__TYPE:`ProgressSpinner`,id:null,style:null,className:null,strokeWidth:`2`,fill:`none`,animationDuration:`2s`,children:void 0},css:{classes:{root:`p-progress-spinner`,spinner:`p-progress-spinner-svg`,circle:`p-progress-spinner-circle`},styles:`
@layer primereact {
    .p-progress-spinner {
        position: relative;
        margin: 0 auto;
        width: 100px;
        height: 100px;
        display: inline-block;
    }
    
    .p-progress-spinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }
    
    .p-progress-spinner-svg {
        animation: p-progress-spinner-rotate 2s linear infinite;
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
    }
    
    .p-progress-spinner-circle {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        stroke: #d62d20;
        animation: p-progress-spinner-dash 1.5s ease-in-out infinite, p-progress-spinner-color 6s ease-in-out infinite;
        stroke-linecap: round;
    }
}

@keyframes p-progress-spinner-rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes p-progress-spinner-dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124px;
    }
}

@keyframes p-progress-spinner-color {
    100%,
    0% {
        stroke: #d62d20;
    }
    40% {
        stroke: #0057e7;
    }
    66% {
        stroke: #008744;
    }
    80%,
    90% {
        stroke: #ffa700;
    }
}
`,inlineStyles:{spinner:function(e){return{animationDuration:e.props.animationDuration}}}}}),S=b.memo(b.forwardRef(function(e,t){var n=o(),r=b.useContext(s),a=x.getProps(e,r),l=b.useRef(null),u=x.setMetaData({props:a}),d=u.ptm,f=u.cx,p=u.sx,m=u.isUnstyled;c(x.css.styles,m,{name:`progressspinner`}),b.useImperativeHandle(t,function(){return{props:a,getElement:function(){return l.current}}});var h=n({id:a.id,ref:l,style:a.style,className:i(a.className,f(`root`)),role:`progressbar`,"aria-busy":!0},x.getOtherProps(a),d(`root`)),g=n({className:f(`spinner`),viewBox:`25 25 50 50`,style:p(`spinner`)},d(`spinner`)),_=n({className:f(`circle`),cx:`50`,cy:`50`,r:`20`,fill:a.fill,strokeWidth:a.strokeWidth,strokeMiterlimit:`10`},d(`circle`));return b.createElement(`div`,h,b.createElement(`svg`,g,b.createElement(`circle`,_)))}));S.displayName=`ProgressSpinner`;function C(){return C=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},C.apply(null,arguments)}function w(e){"@babel/helpers - typeof";return w=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},w(e)}function T(e,t){if(w(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(w(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function E(e){var t=T(e,`string`);return w(t)==`symbol`?t:t+``}function D(e,t,n){return(t=E(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var O=l.extend({defaultProps:{__TYPE:`Message`,id:null,className:null,style:null,text:null,icon:null,severity:`info`,content:null,children:void 0},css:{classes:{root:function(e){var t=e.props.severity;return i(`p-inline-message p-component`,D({},`p-inline-message-${t}`,t))},icon:`p-inline-message-icon`,text:`p-inline-message-text`},styles:`
        @layer primereact {
            .p-inline-message {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                vertical-align: top;
            }

            .p-inline-message-icon {
                flex-shrink: 0;
            }
            
            .p-inline-message-icon-only .p-inline-message-text {
                visibility: hidden;
                width: 0;
            }
            
            .p-fluid .p-inline-message {
                display: flex;
            }        
        }
        `}});function k(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function A(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?k(Object(n),!0).forEach(function(t){D(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):k(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var j=b.memo(b.forwardRef(function(e,t){var n=o(),l=b.useContext(s),u=O.getProps(e,l),d=b.useRef(null),m=O.setMetaData({props:u}),_=m.ptm,v=m.cx,y=m.isUnstyled;c(O.css.styles,y,{name:`message`});var x=function(){if(u.content)return a.getJSXElement(u.content,u);var e=a.getJSXElement(u.text,u),t=n({className:v(`icon`)},_(`icon`)),i=u.icon;if(!i)switch(u.severity){case`info`:i=b.createElement(h,t);break;case`warn`:i=b.createElement(g,t);break;case`error`:i=b.createElement(p,t);break;case`success`:i=b.createElement(f,t);break}var o=r.getJSXIcon(i,A({},t),{props:u}),s=n({className:v(`text`)},_(`text`));return b.createElement(b.Fragment,null,o,b.createElement(`span`,s,e))};b.useImperativeHandle(t,function(){return{props:u,getElement:function(){return d.current}}});var S=x(),w=n({className:i(u.className,v(`root`)),style:u.style,role:`alert`,"aria-live":`polite`,"aria-atomic":`true`},O.getOtherProps(u),_(`root`));return b.createElement(`div`,C({id:u.id,ref:d},w),S)}));j.displayName=`Message`;var M=n(),N=(e,t)=>{let n=e.replaceAll(/\s/g,``),r=atob(n),i=new Uint8Array(r.length);for(let e=0;e<r.length;e++)i[e]=r.codePointAt(e)??0;return new Blob([i],{type:t})},P=({visible:e,onHide:t,base64:n,mimeType:r,fileName:i=`arquivo`,header:a=`Visualização do arquivo`,modalWidth:o=`80vw`})=>{let[s,c]=(0,b.useState)(null),[l,d]=(0,b.useState)(!1),[f,p]=(0,b.useState)(null),h=(0,b.useMemo)(()=>r.startsWith(`image/`)||r===`application/pdf`||r.startsWith(`text/`),[r]);(0,b.useEffect)(()=>{if(!e||!n){c(e=>(e&&URL.revokeObjectURL(e),null));return}d(!0),p(null);try{let e=N(n,r),t=URL.createObjectURL(e);return c(t),()=>URL.revokeObjectURL(t)}catch{p(`Erro ao decodificar o arquivo.`)}finally{d(!1)}},[e,n,r]);let g=(0,b.useCallback)(()=>{if(!n)return;let e=s??URL.createObjectURL(N(n,r)),t=document.createElement(`a`);t.href=e,t.download=i,t.click(),s||URL.revokeObjectURL(e)},[n,r,i,s]);return(0,M.jsxs)(m,{visible:e,onHide:t,header:a,modal:!0,maximizable:!0,dismissableMask:!0,style:{width:o},footer:(0,M.jsxs)(`div`,{className:`flex gap-2 justify-content-end`,children:[(0,M.jsx)(u,{label:`Baixar`,icon:`pi pi-download`,severity:`secondary`,onClick:g,disabled:!(n&&!f)}),(0,M.jsx)(u,{label:`Fechar`,icon:`pi pi-times`,onClick:t})]}),children:[l&&(0,M.jsx)(`div`,{className:`flex justify-content-center p-4`,children:(0,M.jsx)(S,{})}),!l&&f&&(0,M.jsx)(j,{severity:`error`,text:f}),!l&&!n&&(0,M.jsx)(j,{severity:`warn`,text:`Nenhum arquivo disponível para exibição.`}),!l&&n&&!h&&(0,M.jsx)(j,{severity:`info`,text:`Este tipo de arquivo não suporta visualização. Use o botão Baixar.`}),!l&&n&&h&&s&&(0,M.jsxs)(`div`,{style:{height:`70vh`},children:[r===`application/pdf`&&(0,M.jsx)(`iframe`,{src:s,title:`Visualização de ${i}`,style:{width:`100%`,height:`100%`,border:`none`}}),r.startsWith(`image/`)&&(0,M.jsx)(`img`,{src:s,alt:i,style:{maxWidth:`100%`,maxHeight:`100%`,display:`block`,margin:`0 auto`}}),r.startsWith(`text/`)&&(0,M.jsx)(F,{base64:n,mimeType:r})]})]})},F=({base64:e,mimeType:t})=>{let[n,r]=(0,b.useState)({text:null,error:!1});return(0,b.useEffect)(()=>{new Blob([Uint8Array.from(atob(e),e=>e.codePointAt(0)??0)],{type:t}).text().then(e=>r({text:e,error:!1})).catch(()=>r({text:null,error:!0}))},[e,t]),n.error?(0,M.jsx)(j,{severity:`error`,text:`Erro ao exibir o conteúdo do arquivo.`}):n.text===null?(0,M.jsx)(`div`,{className:`flex justify-content-center p-4`,children:(0,M.jsx)(S,{})}):(0,M.jsx)(`pre`,{style:{whiteSpace:`pre-wrap`,height:`100%`,overflow:`auto`},children:n.text})},I=`iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=`,L=`SGVsbG8gV29ybGQh`,R=[{title:`Playground`,description:`Abra um modal com diferentes tipos de base64 para testar preview e download.`,example:(0,M.jsx)(V,{}),code:``},{title:`Uso básico`,description:"Abra o modal passando o conteúdo base64, `mimeType` e um `fileName` opcional.",example:(0,M.jsx)(`div`,{children:(0,M.jsx)(P,{visible:!1,onHide:()=>{},base64:L,mimeType:`text/plain`,fileName:`exemplo.txt`})}),code:`import Base64FileModal from "@componentes/Base64FileModal";

<Base64FileModal
  visible={true}
  onHide={() => {}}
  base64="${L}"
  mimeType="text/plain"
  fileName="exemplo.txt"
/>`},{title:`Quando não há preview`,description:`Alguns tipos (ex.: arquivos binários não suportados) não tem visualização — o componente mostra uma mensagem e permite baixar.`,example:(0,M.jsx)(P,{visible:!1,onHide:()=>{},base64:``,mimeType:`application/zip`,fileName:`arquivo.zip`}),code:``}],z=[{name:`visible`,type:`boolean`,required:!0,description:`Mostra/oculta o modal.`},{name:`onHide`,type:`() => void`,required:!0,description:`Callback para fechar o modal.`},{name:`base64`,type:`string | null | undefined`,required:!1,description:"String Base64 (pura, sem prefixo `data:`)."},{name:`mimeType`,type:`string`,required:!0,description:"Mime type do conteúdo (ex: `image/png`, `application/pdf`, `text/plain`)."},{name:`fileName`,type:`string`,required:!1,defaultValue:`"arquivo"`,description:`Nome sugerido para download.`},{name:`header`,type:`string`,required:!1,defaultValue:`"Visualização do arquivo"`,description:`Título do modal.`},{name:`modalWidth`,type:`string`,required:!1,defaultValue:`"80vw"`,description:`Largura do modal (CSS).`}];function B(){return(0,M.jsx)(y,{title:`Base64FileModal`,description:`Modal para visualizar arquivos representados como base64 (imagem, PDF, texto) e permitir download.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { default as Base64FileModalSeplag } from "@seplag/ui-lib-react-18";
import type { Base64FileModalSeplagProps } from "@seplag/ui-lib-react-18";`,sections:R,props:z})}function V(){let[e,t]=(0,b.useState)(!1),[n,r]=(0,b.useState)(`image`),[i,a]=(0,b.useState)(`arquivo`),[o,s]=(0,b.useState)(``);(0,b.useEffect)(()=>{let e=!1;async function t(){try{if(n===`image`){let t=await(await fetch(_)).blob(),n=new FileReader;n.onloadend=()=>{if(e)return;let t=n.result,r=t.indexOf(`,`);s(t.slice(r+1))},n.readAsDataURL(t)}else s(n===`text`?L:``)}catch{s(I)}}return t(),()=>{e=!0}},[n]);let c=(0,b.useMemo)(()=>n===`image`?`image/png`:n===`text`?`text/plain`:`application/zip`,[n]),l=o?`"${o}"`:`undefined`,u=[`import { default as Base64FileModalSeplag } from "@seplag/ui-lib-react-18";`,``,`<Base64FileModalSeplag`,`  visible={${String(e)}}`,`  onHide={() => { /* fechar */ }}`,`  base64={${l}}`,`  mimeType="${c}"`,`  fileName="${i}"`,`/>`].join(`
`);return(0,M.jsxs)(`div`,{className:`botao-playground`,children:[(0,M.jsxs)(`div`,{className:`botao-playground-preview`,children:[(0,M.jsx)(d,{label:`Abrir modal`,onClick:()=>t(!0)}),(0,M.jsx)(P,{visible:e,onHide:()=>t(!1),base64:o||void 0,mimeType:c,fileName:i||void 0})]}),(0,M.jsxs)(`div`,{className:`botao-playground-controls`,children:[(0,M.jsxs)(`div`,{className:`pg-field`,children:[(0,M.jsx)(`span`,{className:`pg-label`,children:`Tipo`}),(0,M.jsxs)(`select`,{value:n,onChange:e=>r(e.target.value),children:[(0,M.jsx)(`option`,{value:`image`,children:`Imagem (PNG)`}),(0,M.jsx)(`option`,{value:`text`,children:`Texto`}),(0,M.jsx)(`option`,{value:`unsupported`,children:`Não suportado`})]})]}),(0,M.jsxs)(`div`,{className:`pg-field`,children:[(0,M.jsx)(`span`,{className:`pg-label`,children:`fileName`}),(0,M.jsx)(`input`,{className:`pg-input`,value:i,onChange:e=>a(e.target.value)})]}),(0,M.jsx)(v,{code:u})]})]})}export{B as default};