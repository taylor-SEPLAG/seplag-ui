import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";import{A as r,M as i,N as a,O as o,P as s,a as c,b as l,c as u,h as d,l as f,r as ee,s as te,t as p,w as ne,x as m}from"./hooks.esm-DR260yFp.js";import{n as h,t as g}from"./componentbase.esm-Bg3bXvUu.js";import{t as _}from"./button.esm-CxeDfezL.js";import{t as v}from"./ripple.esm-C5OmFqcM.js";import{t as re}from"./portal.esm-Blcf6D9g.js";import{t as ie}from"./index.esm-BreMkWr1.js";import{t as ae}from"./csstransition.esm-BI_o9ntn.js";import{t as y}from"./overlayservice.esm-Bd380qI2.js";var b=e(t(),1),x={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},S=b.createContext&&b.createContext(x),C=[`attr`,`size`,`title`];function w(e,t){if(e==null)return{};var n,r,i=T(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)===-1&&{}.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}function T(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function E(){return E=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},E.apply(null,arguments)}function D(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function O(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?D(Object(n),!0).forEach(function(t){k(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):D(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function k(e,t,n){return(t=A(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function A(e){var t=j(e,`string`);return typeof t==`symbol`?t:t+``}function j(e,t){if(typeof e!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(typeof r!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function M(e){return e&&e.map((e,t)=>b.createElement(e.tag,O({key:t},e.attr),M(e.child)))}function N(e){return t=>b.createElement(P,E({attr:O({},e.attr)},t),M(e.child))}function P(e){var t=t=>{var{attr:n,size:r,title:i}=e,a=w(e,C),o=r||t.size||`1em`,s;return t.className&&(s=t.className),e.className&&(s=(s?s+` `:``)+e.className),b.createElement(`svg`,E({stroke:`currentColor`,fill:`currentColor`,strokeWidth:`0`},t.attr,n,a,{className:s,style:O(O({color:e.color||t.color},t.style),e.style),height:o,width:o,xmlns:`http://www.w3.org/2000/svg`}),i&&b.createElement(`title`,null,i),e.children)};return S===void 0?t(x):b.createElement(S.Consumer,null,e=>t(e))}function F(){return F=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},F.apply(null,arguments)}function I(e){"@babel/helpers - typeof";return I=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},I(e)}function L(e,t){if(I(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(I(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function R(e){var t=L(e,`string`);return I(t)==`symbol`?t:t+``}function z(e,t,n){return(t=R(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function B(e){if(Array.isArray(e))return e}function V(e,t){var n=e==null?null:typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n!=null){var r,i,a,o,s=[],c=!0,l=!1;try{if(a=(n=n.call(e)).next,t===0){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=a.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){l=!0,i=e}finally{try{if(!c&&n.return!=null&&(o=n.return(),Object(o)!==o))return}finally{if(l)throw i}}return s}}function H(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function U(e,t){if(e){if(typeof e==`string`)return H(e,t);var n={}.toString.call(e).slice(8,-1);return n===`Object`&&e.constructor&&(n=e.constructor.name),n===`Map`||n===`Set`?Array.from(e):n===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?H(e,t):void 0}}function W(){throw TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function G(e,t){return B(e)||V(e,t)||U(e,t)||W()}var K=g.extend({defaultProps:{__TYPE:`OverlayPanel`,id:null,dismissable:!0,showCloseIcon:!1,closeIcon:null,style:null,className:null,appendTo:null,breakpoints:null,ariaCloseLabel:null,transitionOptions:null,onShow:null,onHide:null,children:void 0,closeOnEscape:!0},css:{classes:{root:function(e){e.props;var t=e.context;return s(`p-overlaypanel p-component`,{"p-input-filled":t&&t.inputStyle===`filled`||l.inputStyle===`filled`,"p-ripple-disabled":t&&t.ripple===!1||l.ripple===!1})},closeIcon:`p-overlaypanel-close-icon`,closeButton:`p-overlaypanel-close p-link`,content:`p-overlaypanel-content`,transition:`p-overlaypanel`},styles:`
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
`}});function q(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function oe(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?q(Object(n),!0).forEach(function(t){z(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):q(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var J=b.forwardRef(function(e,t){var n=te(),g=b.useContext(m),_=K.getProps(e,g),x=G(b.useState(!1),2),S=x[0],C=x[1],w=K.setMetaData({props:_,state:{visible:S}}),T=w.ptm,E=w.cx;w.sx;var D=w.isUnstyled;h(K.css.styles,D,{name:`overlaypanel`});var O=b.useRef(``),k=b.useRef(null),A=b.useRef(null),j=b.useRef(!1),M=b.useRef(null),N=b.useRef(null),P=G(f({target:A,overlay:k,listener:function(e,t){var n=t.type;t.valid&&(n===`outside`?(_.dismissable&&!j.current&&Y(),j.current=!1):g.hideOverlaysOnDocumentScrolling?Y():o.isDocument(e.target)||$())},when:S}),2),I=P[0],L=P[1],R=S&&_.closeOnEscape,z=ee(`overlay-panel`,R);c({callback:function(){Y()},when:R&&z,priority:[p.OVERLAY_PANEL,z]});var B=function(e){return k&&k.current&&!(k.current.isSameNode(e)||k.current.contains(e))},V=function(e,t){return A.current!=null&&A.current!==(t||e.currentTarget||e.target)},H=function(e){Y(),e.preventDefault()},U=function(e){j.current=!0,y.emit(`overlay-click`,{originalEvent:e,target:A.current})},W=function(){j.current=!0},q=function(e,t){S?(Y(),V(e,t)&&(A.current=t||e.currentTarget||e.target,setTimeout(function(){J(e,A.current)},200))):J(e,t)},J=function(e,t){A.current=t||e.currentTarget||e.target,S?$():(C(!0),N.current=function(e){!B(e.target)&&(j.current=!0)},y.on(`overlay-click`,N.current))},Y=function(){C(!1),y.off(`overlay-click`,N.current),N.current=null},X=function(){k.current.setAttribute(O.current,``),a.set(`overlay`,k.current,g&&g.autoZIndex||l.autoZIndex,g&&g.zIndex.overlay||l.zIndex.overlay),o.addStyles(k.current,{position:`absolute`,top:`0`,left:`0`}),$()},Z=function(){I(),_.onShow&&_.onShow()},Q=function(){L()},se=function(){a.clear(k.current),_.onHide&&_.onHide()},$=function(){if(A.current&&k.current){o.absolutePosition(k.current,A.current);var e=o.getOffset(k.current),t=o.getOffset(A.current),n=0;e.left<t.left&&(n=t.left-e.left),k.current.style.setProperty(`--overlayArrowLeft`,`${n}px`),e.top<t.top?(k.current.setAttribute(`data-p-overlaypanel-flipped`,`true`),D&&o.addClass(k.current,`p-overlaypanel-flipped`)):(k.current.setAttribute(`data-p-overlaypanel-flipped`,`false`),D&&o.removeClass(k.current,`p-overlaypanel-flipped`))}},ce=function(){if(!M.current){M.current=o.createInlineStyle(g&&g.nonce||l.nonce,g&&g.styleContainer);var e=``;for(var t in _.breakpoints)e+=`
                    @media screen and (max-width: ${t}) {
                        .p-overlaypanel[${O.current}] {
                            width: ${_.breakpoints[t]};
                        }
                    }
                `;M.current.innerHTML=e}};u(function(){O.current=i(),_.breakpoints&&ce()}),d(function(){M.current=o.removeInlineStyle(M.current),N.current&&=(y.off(`overlay-click`,N.current),null),a.clear(k.current)}),b.useImperativeHandle(t,function(){return{props:_,toggle:q,show:J,hide:Y,align:$,isVisible:function(){return S},getElement:function(){return k.current}}});var le=function(){var e=n({className:E(`closeIcon`),"aria-hidden":!0},T(`closeIcon`)),t=_.closeIcon||b.createElement(ie,e),i=r.getJSXIcon(t,oe({},e),{props:_}),a=n({type:`button`,className:E(`closeButton`),onClick:function(e){return H(e)},"aria-label":_.ariaCloseLabel||ne(`close`)},T(`closeButton`));return _.showCloseIcon?b.createElement(`button`,a,i,b.createElement(v,null)):null},ue=function(){var e=le(),t=n({id:_.id,className:s(_.className,E(`root`,{context:g})),style:_.style,onClick:function(e){return U(e)}},K.getOtherProps(_),T(`root`)),r=n({className:E(`content`),onClick:function(e){return W()},onMouseDown:W},K.getOtherProps(_),T(`content`)),i=n({classNames:E(`transition`),in:S,timeout:{enter:120,exit:100},options:_.transitionOptions,unmountOnExit:!0,onEnter:X,onEntered:Z,onExit:Q,onExited:se},T(`transition`));return b.createElement(ae,F({nodeRef:k},i),b.createElement(`div`,F({ref:k},t),b.createElement(`div`,r,_.children),e))}();return b.createElement(re,{element:ue,appendTo:_.appendTo})});J.displayName=`OverlayPanel`;function Y(e){return N({tag:`svg`,attr:{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`},child:[{tag:`path`,attr:{d:`M5 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M19 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M5 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]},{tag:`path`,attr:{d:`M19 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0`},child:[]}]})(e)}var X={"app-switcher":`_app-switcher_1ux87_1`,"app-switcher__btn":`_app-switcher__btn_1ux87_11`,"app-switcher__panel":`_app-switcher__panel_1ux87_25`,"app-switcher__grid":`_app-switcher__grid_1ux87_51`,"app-switcher__item":`_app-switcher__item_1ux87_69`,"app-switcher__item_selected":`_app-switcher__item_selected_1ux87_103`,"app-switcher__iconWrap":`_app-switcher__iconWrap_1ux87_137`,"app-switcher__img":`_app-switcher__img_1ux87_157`,"app-switcher__label":`_app-switcher__label_1ux87_173`},Z=n(),Q=({currentSystem:e,items:t,className:n})=>{let r=(0,b.useRef)(null),i=(0,b.useMemo)(()=>(t??[]).filter(e=>e?.id&&e?.label&&e?.url).slice(),[t]);function a(e){r.current?.toggle(e)}function o(e){r.current?.hide(),(e.target??`_self`)===`_blank`?globalThis.open(e.url,`_blank`,`noopener,noreferrer`):globalThis.location.assign(e.url)}return(0,Z.jsxs)(`div`,{className:`${X[`app-switcher`]} ${n??``}`,children:[(0,Z.jsx)(_,{type:`button`,className:`${X[`app-switcher__btn`]}`,icon:(0,Z.jsx)(Y,{size:32}),tooltipOptions:{position:`bottom`},onClick:a}),(0,Z.jsx)(J,{ref:r,className:X[`app-switcher__panel`],dismissable:!0,appendTo:document.body,children:(0,Z.jsx)(`div`,{className:X[`app-switcher__grid`],role:`menu`,children:i.map(t=>(0,Z.jsxs)(`button`,{type:`button`,className:`${X[`app-switcher__item`]} ${t.label===e?X[`app-switcher__item_selected`]:``}`,onClick:()=>o(t),children:[(0,Z.jsx)(`div`,{className:X[`app-switcher__iconWrap`],children:typeof t.icon==`string`?(0,Z.jsx)(`i`,{className:`${X[`app-switcher__img`]} ${t.icon}`}):t.icon}),(0,Z.jsx)(`div`,{className:X[`app-switcher__label`],children:t.label})]},t.id))})})]})};export{N as n,Q as t};