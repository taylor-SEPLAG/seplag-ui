import{a as e,n as t,t as n}from"./jsx-runtime-ChuIQw48.js";import{A as r,M as i,N as a,O as o,P as s,a as c,b as l,c as u,h as d,l as f,r as ee,s as te,t as p,w as ne,x as m}from"./hooks.esm-VKHbiLGd.js";import{n as re,t as h}from"./componentbase.esm-DBhW0MYQ.js";import{t as g}from"./button.esm-CpRXJc7C.js";import{t as _}from"./ripple.esm-CsTr6xPE.js";import{t as ie}from"./portal.esm-B8Ven5Tj.js";import{t as ae}from"./index.esm-CMV0FRgA.js";import{t as oe}from"./csstransition.esm-D2I7vZ8x.js";import{t as v}from"./overlayservice.esm-BgO7XReq.js";var y=e(t(),1),b={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},x=y.createContext&&y.createContext(b),S=[`attr`,`size`,`title`];function C(e,t){if(e==null)return{};var n,r,i=w(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)===-1&&{}.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}function w(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function T(){return T=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},T.apply(null,arguments)}function E(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function D(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?E(Object(n),!0).forEach(function(t){O(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):E(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function O(e,t,n){return(t=k(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function k(e){var t=A(e,`string`);return typeof t==`symbol`?t:t+``}function A(e,t){if(typeof e!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(typeof r!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function j(e){return e&&e.map((e,t)=>y.createElement(e.tag,D({key:t},e.attr),j(e.child)))}function M(e){return t=>y.createElement(N,T({attr:D({},e.attr)},t),j(e.child))}function N(e){var t=t=>{var n=e.attr,r=e.size,i=e.title,a=C(e,S),o=r||t.size||`1em`,s;return t.className&&(s=t.className),e.className&&(s=(s?s+` `:``)+e.className),y.createElement(`svg`,T({stroke:`currentColor`,fill:`currentColor`,strokeWidth:`0`},t.attr,n,a,{className:s,style:D(D({color:e.color||t.color},t.style),e.style),height:o,width:o,xmlns:`http://www.w3.org/2000/svg`}),i&&y.createElement(`title`,null,i),e.children)};return x===void 0?t(b):y.createElement(x.Consumer,null,e=>t(e))}function P(){return P=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},P.apply(null,arguments)}function F(e){"@babel/helpers - typeof";return F=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},F(e)}function I(e,t){if(F(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(F(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function L(e){var t=I(e,`string`);return F(t)==`symbol`?t:t+``}function R(e,t,n){return(t=L(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function z(e){if(Array.isArray(e))return e}function B(e,t){var n=e==null?null:typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n!=null){var r,i,a,o,s=[],c=!0,l=!1;try{if(a=(n=n.call(e)).next,t===0){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=a.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){l=!0,i=e}finally{try{if(!c&&n.return!=null&&(o=n.return(),Object(o)!==o))return}finally{if(l)throw i}}return s}}function V(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function H(e,t){if(e){if(typeof e==`string`)return V(e,t);var n={}.toString.call(e).slice(8,-1);return n===`Object`&&e.constructor&&(n=e.constructor.name),n===`Map`||n===`Set`?Array.from(e):n===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?V(e,t):void 0}}function U(){throw TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function W(e,t){return z(e)||B(e,t)||H(e,t)||U()}var G=h.extend({defaultProps:{__TYPE:`OverlayPanel`,id:null,dismissable:!0,showCloseIcon:!1,closeIcon:null,style:null,className:null,appendTo:null,breakpoints:null,ariaCloseLabel:null,transitionOptions:null,onShow:null,onHide:null,children:void 0,closeOnEscape:!0},css:{classes:{root:function(e){e.props;var t=e.context;return s(`p-overlaypanel p-component`,{"p-input-filled":t&&t.inputStyle===`filled`||l.inputStyle===`filled`,"p-ripple-disabled":t&&t.ripple===!1||l.ripple===!1})},closeIcon:`p-overlaypanel-close-icon`,closeButton:`p-overlaypanel-close p-link`,content:`p-overlaypanel-content`,transition:`p-overlaypanel`},styles:`
@layer primereact {
    .p-overlaypanel {
        position: absolute;
        margin-top: 10px;
        /* Github #3122: Prevent animation flickering  */
        top: -9999px;
        left: -9999px;
    }
    
    .p-overlaypanel-flipped {
        margin-top: -10px;
        margin-bottom: 10px;
    }
    
    .p-overlaypanel-close {
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        position: relative;
    }
    
    /* Animation */
    .p-overlaypanel-enter {
        opacity: 0;
        transform: scaleY(0.8);
    }
    
    .p-overlaypanel-enter-active {
        opacity: 1;
        transform: scaleY(1);
        transition: transform .12s cubic-bezier(0, 0, 0.2, 1), opacity .12s cubic-bezier(0, 0, 0.2, 1);
    }
    
    .p-overlaypanel-enter-done {
        transform: none;
    }
    
    .p-overlaypanel-exit {
        opacity: 1;
    }
    
    .p-overlaypanel-exit-active {
        opacity: 0;
        transition: opacity .1s linear;
    }
    
    .p-overlaypanel:after, .p-overlaypanel:before {
        bottom: 100%;
        left: calc(var(--overlayArrowLeft, 0) + 1.25rem);
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
    }
    
    .p-overlaypanel:after {
        border-width: 8px;
        margin-left: -8px;
    }
    
    .p-overlaypanel:before {
        border-width: 10px;
        margin-left: -10px;
    }
    
    .p-overlaypanel-flipped:after, .p-overlaypanel-flipped:before {
        bottom: auto;
        top: 100%;
    }
    
    .p-overlaypanel.p-overlaypanel-flipped:after {
        border-bottom-color: transparent;
    }
    
    .p-overlaypanel.p-overlaypanel-flipped:before {
        border-bottom-color: transparent
    }
}
`}});function K(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function se(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?K(Object(n),!0).forEach(function(t){R(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):K(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var q=y.forwardRef(function(e,t){var n=te(),h=y.useContext(m),g=G.getProps(e,h),b=W(y.useState(!1),2),x=b[0],S=b[1],C=G.setMetaData({props:g,state:{visible:x}}),w=C.ptm,T=C.cx;C.sx;var E=C.isUnstyled;re(G.css.styles,E,{name:`overlaypanel`});var D=y.useRef(``),O=y.useRef(null),k=y.useRef(null),A=y.useRef(!1),j=y.useRef(null),M=y.useRef(null),N=W(f({target:k,overlay:O,listener:function(e,t){var n=t.type;t.valid&&(n===`outside`?(g.dismissable&&!A.current&&J(),A.current=!1):h.hideOverlaysOnDocumentScrolling?J():o.isDocument(e.target)||$())},when:x}),2),F=N[0],I=N[1],L=x&&g.closeOnEscape,R=ee(`overlay-panel`,L);c({callback:function(){J()},when:L&&R,priority:[p.OVERLAY_PANEL,R]});var z=function(e){return O&&O.current&&!(O.current.isSameNode(e)||O.current.contains(e))},B=function(e,t){return k.current!=null&&k.current!==(t||e.currentTarget||e.target)},V=function(e){J(),e.preventDefault()},H=function(e){A.current=!0,v.emit(`overlay-click`,{originalEvent:e,target:k.current})},U=function(){A.current=!0},K=function(e,t){x?(J(),B(e,t)&&(k.current=t||e.currentTarget||e.target,setTimeout(function(){q(e,k.current)},200))):q(e,t)},q=function(e,t){k.current=t||e.currentTarget||e.target,x?$():(S(!0),M.current=function(e){!z(e.target)&&(A.current=!0)},v.on(`overlay-click`,M.current))},J=function(){S(!1),v.off(`overlay-click`,M.current),M.current=null},Y=function(){O.current.setAttribute(D.current,``),a.set(`overlay`,O.current,h&&h.autoZIndex||l.autoZIndex,h&&h.zIndex.overlay||l.zIndex.overlay),o.addStyles(O.current,{position:`absolute`,top:`0`,left:`0`}),$()},X=null,Z=function(){Q(),X=setTimeout(function(){F()}),g.onShow&&g.onShow()},ce=function(){Q(),I()},Q=function(){X&&=(clearTimeout(X),null)},le=function(){a.clear(O.current),g.onHide&&g.onHide()},$=function(){if(k.current&&O.current){o.absolutePosition(O.current,k.current);var e=o.getOffset(O.current),t=o.getOffset(k.current),n=0;e.left<t.left&&(n=t.left-e.left),O.current.style.setProperty(`--overlayArrowLeft`,`${n}px`),e.top<t.top?(O.current.setAttribute(`data-p-overlaypanel-flipped`,`true`),E&&o.addClass(O.current,`p-overlaypanel-flipped`)):(O.current.setAttribute(`data-p-overlaypanel-flipped`,`false`),E&&o.removeClass(O.current,`p-overlaypanel-flipped`))}},ue=function(){if(!j.current){j.current=o.createInlineStyle(h&&h.nonce||l.nonce,h&&h.styleContainer);var e=``;for(var t in g.breakpoints)e+=`
                    @media screen and (max-width: ${t}) {
                        .p-overlaypanel[${D.current}] {
                            width: ${g.breakpoints[t]};
                        }
                    }
                `;j.current.innerHTML=e}};u(function(){D.current=i(),g.breakpoints&&ue()}),d(function(){j.current=o.removeInlineStyle(j.current),M.current&&=(v.off(`overlay-click`,M.current),null),a.clear(O.current)}),y.useImperativeHandle(t,function(){return{props:g,toggle:K,show:q,hide:J,align:$,isVisible:function(){return x},getElement:function(){return O.current}}});var de=function(){var e=n({className:T(`closeIcon`),"aria-hidden":!0},w(`closeIcon`)),t=g.closeIcon||y.createElement(ae,e),i=r.getJSXIcon(t,se({},e),{props:g}),a=n({type:`button`,className:T(`closeButton`),onClick:function(e){return V(e)},"aria-label":g.ariaCloseLabel||ne(`close`)},w(`closeButton`));return g.showCloseIcon?y.createElement(`button`,a,i,y.createElement(_,null)):null},fe=function(){var e=de(),t=n({id:g.id,className:s(g.className,T(`root`,{context:h})),style:g.style,onClick:function(e){return H(e)}},G.getOtherProps(g),w(`root`)),r=n({className:T(`content`),onClick:function(e){return U()},onMouseDown:U},G.getOtherProps(g),w(`content`)),i=n({classNames:T(`transition`),in:x,timeout:{enter:120,exit:100},options:g.transitionOptions,unmountOnExit:!0,onEnter:Y,onEntered:Z,onExit:ce,onExited:le},w(`transition`));return y.createElement(oe,P({nodeRef:O},i),y.createElement(`div`,P({ref:O},t),y.createElement(`div`,r,g.children),e))}();return y.createElement(ie,{element:fe,appendTo:g.appendTo})});q.displayName=`OverlayPanel`;function J(e){return M({tag:`svg`,attr:{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`},child:[{tag:`path`,attr:{d:`M4 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M11 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M18 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M4 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M11 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M18 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]}]})(e)}var Y={"app-switcher":`_app-switcher_1ux87_1`,"app-switcher__btn":`_app-switcher__btn_1ux87_11`,"app-switcher__panel":`_app-switcher__panel_1ux87_25`,"app-switcher__grid":`_app-switcher__grid_1ux87_51`,"app-switcher__item":`_app-switcher__item_1ux87_69`,"app-switcher__item_selected":`_app-switcher__item_selected_1ux87_103`,"app-switcher__iconWrap":`_app-switcher__iconWrap_1ux87_137`,"app-switcher__img":`_app-switcher__img_1ux87_157`,"app-switcher__label":`_app-switcher__label_1ux87_173`},X=n(),Z=({currentSystem:e,items:t,className:n})=>{let r=(0,y.useRef)(null),i=(0,y.useMemo)(()=>(t??[]).filter(e=>e?.id&&e?.label&&e?.url).slice(),[t]);function a(e){r.current?.toggle(e)}function o(e){r.current?.hide(),(e.target??`_self`)===`_blank`?globalThis.open(e.url,`_blank`,`noopener,noreferrer`):globalThis.location.assign(e.url)}return(0,X.jsxs)(`div`,{className:`${Y[`app-switcher`]} ${n??``}`,children:[(0,X.jsx)(g,{type:`button`,className:`${Y[`app-switcher__btn`]}`,icon:(0,X.jsx)(J,{size:32}),tooltipOptions:{position:`bottom`},onClick:a}),(0,X.jsx)(q,{ref:r,className:Y[`app-switcher__panel`],dismissable:!0,appendTo:document.body,children:(0,X.jsx)(`div`,{className:Y[`app-switcher__grid`],role:`menu`,children:i.map(t=>(0,X.jsxs)(`button`,{type:`button`,className:`${Y[`app-switcher__item`]} ${t.label===e?Y[`app-switcher__item_selected`]:``}`,onClick:()=>o(t),children:[(0,X.jsx)(`div`,{className:Y[`app-switcher__iconWrap`],children:typeof t.icon==`string`?(0,X.jsx)(`i`,{className:`${Y[`app-switcher__img`]} ${t.icon}`}):t.icon}),(0,X.jsx)(`div`,{className:Y[`app-switcher__label`],children:t.label})]},t.id))})})]})};export{M as n,Z as t};