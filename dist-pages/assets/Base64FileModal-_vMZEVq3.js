import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";import{A as r,P as i,j as a,s as o,x as s}from"./hooks.esm-DR260yFp.js";import{n as c,t as l}from"./componentbase.esm-Bg3bXvUu.js";import{t as u}from"./button.esm-CxeDfezL.js";import{t as d}from"./index.esm-DMJCJHxy.js";import{n as f,t as p}from"./index.esm-DF3acsZi.js";import{t as m}from"./index.esm-C2MySAtr.js";import{t as h}from"./dialog.esm-BvC7cMJS.js";var g=e(t()),_=l.extend({defaultProps:{__TYPE:`ProgressSpinner`,id:null,style:null,className:null,strokeWidth:`2`,fill:`none`,animationDuration:`2s`,children:void 0},css:{classes:{root:`p-progress-spinner`,spinner:`p-progress-spinner-svg`,circle:`p-progress-spinner-circle`},styles:`
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
`,inlineStyles:{spinner:function(e){return{animationDuration:e.props.animationDuration}}}}}),v=g.memo(g.forwardRef(function(e,t){var n=o(),r=g.useContext(s),a=_.getProps(e,r),l=g.useRef(null),u=_.setMetaData({props:a}),d=u.ptm,f=u.cx,p=u.sx,m=u.isUnstyled;c(_.css.styles,m,{name:`progressspinner`}),g.useImperativeHandle(t,function(){return{props:a,getElement:function(){return l.current}}});var h=n({id:a.id,ref:l,style:a.style,className:i(a.className,f(`root`)),role:`progressbar`,"aria-busy":!0},_.getOtherProps(a),d(`root`)),v=n({className:f(`spinner`),viewBox:`25 25 50 50`,style:p(`spinner`)},d(`spinner`)),y=n({className:f(`circle`),cx:`50`,cy:`50`,r:`20`,fill:a.fill,strokeWidth:a.strokeWidth,strokeMiterlimit:`10`},d(`circle`));return g.createElement(`div`,h,g.createElement(`svg`,v,g.createElement(`circle`,y)))}));v.displayName=`ProgressSpinner`;function y(){return y=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},y.apply(null,arguments)}function b(e){"@babel/helpers - typeof";return b=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},b(e)}function x(e,t){if(b(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(b(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function S(e){var t=x(e,`string`);return b(t)==`symbol`?t:t+``}function C(e,t,n){return(t=S(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var w=l.extend({defaultProps:{__TYPE:`Message`,id:null,className:null,style:null,text:null,icon:null,severity:`info`,content:null,children:void 0},css:{classes:{root:function(e){var t=e.props.severity;return i(`p-inline-message p-component`,C({},`p-inline-message-${t}`,t))},icon:`p-inline-message-icon`,text:`p-inline-message-text`},styles:`
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
        `}});function T(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function E(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?T(Object(n),!0).forEach(function(t){C(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):T(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var D=g.memo(g.forwardRef(function(e,t){var n=o(),l=g.useContext(s),u=w.getProps(e,l),h=g.useRef(null),_=w.setMetaData({props:u}),v=_.ptm,b=_.cx,x=_.isUnstyled;c(w.css.styles,x,{name:`message`});var S=function(){if(u.content)return a.getJSXElement(u.content,u);var e=a.getJSXElement(u.text,u),t=n({className:b(`icon`)},v(`icon`)),i=u.icon;if(!i)switch(u.severity){case`info`:i=g.createElement(p,t);break;case`warn`:i=g.createElement(f,t);break;case`error`:i=g.createElement(m,t);break;case`success`:i=g.createElement(d,t);break}var o=r.getJSXIcon(i,E({},t),{props:u}),s=n({className:b(`text`)},v(`text`));return g.createElement(g.Fragment,null,o,g.createElement(`span`,s,e))};g.useImperativeHandle(t,function(){return{props:u,getElement:function(){return h.current}}});var C=S(),T=n({className:i(u.className,b(`root`)),style:u.style,role:`alert`,"aria-live":`polite`,"aria-atomic":`true`},w.getOtherProps(u),v(`root`));return g.createElement(`div`,y({id:u.id,ref:h},T),C)}));D.displayName=`Message`;var O=n(),k=(e,t)=>{let n=e.replaceAll(/\s/g,``),r=atob(n),i=new Uint8Array(r.length);for(let e=0;e<r.length;e++)i[e]=r.codePointAt(e)??0;return new Blob([i],{type:t})},A=({visible:e,onHide:t,base64:n,mimeType:r,fileName:i=`arquivo`,header:a=`Visualização do arquivo`,modalWidth:o=`80vw`})=>{let[s,c]=(0,g.useState)(null),[l,d]=(0,g.useState)(!1),[f,p]=(0,g.useState)(null),m=(0,g.useMemo)(()=>r.startsWith(`image/`)||r===`application/pdf`||r.startsWith(`text/`),[r]);(0,g.useEffect)(()=>{if(!e||!n){c(e=>(e&&URL.revokeObjectURL(e),null));return}d(!0),p(null);try{let e=k(n,r),t=URL.createObjectURL(e);return c(t),()=>URL.revokeObjectURL(t)}catch{p(`Erro ao decodificar o arquivo.`)}finally{d(!1)}},[e,n,r]);let _=(0,g.useCallback)(()=>{if(!n)return;let e=s??URL.createObjectURL(k(n,r)),t=document.createElement(`a`);t.href=e,t.download=i,t.click(),s||URL.revokeObjectURL(e)},[n,r,i,s]);return(0,O.jsxs)(h,{visible:e,onHide:t,header:a,modal:!0,maximizable:!0,dismissableMask:!0,style:{width:o},footer:(0,O.jsxs)(`div`,{className:`flex gap-2 justify-content-end`,children:[(0,O.jsx)(u,{label:`Baixar`,icon:`pi pi-download`,severity:`secondary`,onClick:_,disabled:!(n&&!f)}),(0,O.jsx)(u,{label:`Fechar`,icon:`pi pi-times`,onClick:t})]}),children:[l&&(0,O.jsx)(`div`,{className:`flex justify-content-center p-4`,children:(0,O.jsx)(v,{})}),!l&&f&&(0,O.jsx)(D,{severity:`error`,text:f}),!l&&!n&&(0,O.jsx)(D,{severity:`warn`,text:`Nenhum arquivo disponível para exibição.`}),!l&&n&&!m&&(0,O.jsx)(D,{severity:`info`,text:`Este tipo de arquivo não suporta visualização. Use o botão Baixar.`}),!l&&n&&m&&s&&(0,O.jsxs)(`div`,{style:{height:`70vh`},children:[r===`application/pdf`&&(0,O.jsx)(`iframe`,{src:s,title:`Visualização de ${i}`,style:{width:`100%`,height:`100%`,border:`none`}}),r.startsWith(`image/`)&&(0,O.jsx)(`img`,{src:s,alt:i,style:{maxWidth:`100%`,maxHeight:`100%`,display:`block`,margin:`0 auto`}}),r.startsWith(`text/`)&&(0,O.jsx)(j,{base64:n,mimeType:r})]})]})},j=({base64:e,mimeType:t})=>{let[n,r]=(0,g.useState)({text:null,error:!1});return(0,g.useEffect)(()=>{new Blob([Uint8Array.from(atob(e),e=>e.codePointAt(0)??0)],{type:t}).text().then(e=>r({text:e,error:!1})).catch(()=>r({text:null,error:!0}))},[e,t]),n.error?(0,O.jsx)(D,{severity:`error`,text:`Erro ao exibir o conteúdo do arquivo.`}):n.text===null?(0,O.jsx)(`div`,{className:`flex justify-content-center p-4`,children:(0,O.jsx)(v,{})}):(0,O.jsx)(`pre`,{style:{whiteSpace:`pre-wrap`,height:`100%`,overflow:`auto`},children:n.text})};export{A as t};