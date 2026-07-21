import{a as e,n as t}from"./jsx-runtime-ChuIQw48.js";import{N as n,O as r,P as i,a,b as o,c as s,f as c,g as l,h as u,j as d,r as f,s as ee,t as te,u as ne,x as re}from"./hooks.esm-VKHbiLGd.js";import{n as ie,t as p}from"./componentbase.esm-DBhW0MYQ.js";import{t as ae}from"./portal.esm-B8Ven5Tj.js";var m=e(t());function h(){return h=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},h.apply(null,arguments)}function g(e){"@babel/helpers - typeof";return g=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},g(e)}function _(e,t){if(g(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(g(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function v(e){var t=_(e,`string`);return g(t)==`symbol`?t:t+``}function y(e,t,n){return(t=v(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function b(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function x(e){if(Array.isArray(e))return b(e)}function S(e){if(typeof Symbol<`u`&&e[Symbol.iterator]!=null||e[`@@iterator`]!=null)return Array.from(e)}function C(e,t){if(e){if(typeof e==`string`)return b(e,t);var n={}.toString.call(e).slice(8,-1);return n===`Object`&&e.constructor&&(n=e.constructor.name),n===`Map`||n===`Set`?Array.from(e):n===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?b(e,t):void 0}}function w(){throw TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function oe(e){return x(e)||S(e)||C(e)||w()}function T(e){if(Array.isArray(e))return e}function E(e,t){var n=e==null?null:typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n!=null){var r,i,a,o,s=[],c=!0,l=!1;try{if(a=(n=n.call(e)).next,t===0){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=a.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){l=!0,i=e}finally{try{if(!c&&n.return!=null&&(o=n.return(),Object(o)!==o))return}finally{if(l)throw i}}return s}}function D(){throw TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function O(e,t){return T(e)||E(e,t)||C(e,t)||D()}var k=p.extend({defaultProps:{__TYPE:`Tooltip`,appendTo:null,at:null,autoHide:!0,autoZIndex:!0,baseZIndex:0,className:null,closeOnEscape:!1,content:null,disabled:!1,event:null,hideDelay:0,hideEvent:`mouseleave`,id:null,mouseTrack:!1,mouseTrackLeft:5,mouseTrackTop:5,my:null,onBeforeHide:null,onBeforeShow:null,onHide:null,onShow:null,position:`right`,showDelay:0,showEvent:`mouseenter`,showOnDisabled:!1,style:null,target:null,updateDelay:0,children:void 0},css:{classes:{root:function(e){var t=e.positionState,n=e.classNameState;return i(`p-tooltip p-component`,y({},`p-tooltip-${t}`,!0),n)},arrow:`p-tooltip-arrow`,text:`p-tooltip-text`},styles:`
@layer primereact {
    .p-tooltip {
        position: absolute;
        padding: .25em .5rem;
        /* #3687: Tooltip prevent scrollbar flickering */
        top: -9999px;
        left: -9999px;
    }
    
    .p-tooltip.p-tooltip-right,
    .p-tooltip.p-tooltip-left {
        padding: 0 .25rem;
    }
    
    .p-tooltip.p-tooltip-top,
    .p-tooltip.p-tooltip-bottom {
        padding:.25em 0;
    }
    
    .p-tooltip .p-tooltip-text {
       white-space: pre-line;
       word-break: break-word;
    }
    
    .p-tooltip-arrow {
        position: absolute;
        width: 0;
        height: 0;
        border-color: transparent;
        border-style: solid;
    }
    
    .p-tooltip-right .p-tooltip-arrow {
        top: 50%;
        left: 0;
        margin-top: -.25rem;
        border-width: .25em .25em .25em 0;
    }
    
    .p-tooltip-left .p-tooltip-arrow {
        top: 50%;
        right: 0;
        margin-top: -.25rem;
        border-width: .25em 0 .25em .25rem;
    }
    
    .p-tooltip.p-tooltip-top {
        padding: .25em 0;
    }
    
    .p-tooltip-top .p-tooltip-arrow {
        bottom: 0;
        left: 50%;
        margin-left: -.25rem;
        border-width: .25em .25em 0;
    }
    
    .p-tooltip-bottom .p-tooltip-arrow {
        top: 0;
        left: 50%;
        margin-left: -.25rem;
        border-width: 0 .25em .25rem;
    }

    .p-tooltip-target-wrapper {
        display: inline-flex;
    }
}
`,inlineStyles:{arrow:function(e){var t=e.context;return{top:t.bottom?`0`:t.right||t.left||!t.right&&!t.left&&!t.top&&!t.bottom?`50%`:null,bottom:t.top?`0`:null,left:t.right||!t.right&&!t.left&&!t.top&&!t.bottom?`0`:t.top||t.bottom?`50%`:null,right:t.left?`0`:null}}}}});function A(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function se(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?A(Object(n),!0).forEach(function(t){y(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):A(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var j=m.memo(m.forwardRef(function(e,t){var p=ee(),g=m.useContext(re),_=k.getProps(e,g),v=O(m.useState(!1),2),y=v[0],b=v[1],x=O(m.useState(_.position||`right`),2),S=x[0],C=x[1],w=O(m.useState(``),2),T=w[0],E=w[1],D=O(m.useState(!1),2),A=D[0],j=D[1],ce=y&&_.closeOnEscape,le=f(`tooltip`,ce),ue={props:_,state:{visible:y,position:S,className:T},context:{right:S===`right`,left:S===`left`,top:S===`top`,bottom:S===`bottom`}},M=k.setMetaData(ue),N=M.ptm,P=M.cx,de=M.sx,fe=M.isUnstyled;ie(k.css.styles,fe,{name:`tooltip`}),a({callback:function(){Y()},when:ce,priority:[te.TOOLTIP,le]});var F=m.useRef(null),I=m.useRef(null),L=m.useRef(null),R=m.useRef(null),z=m.useRef(!0),B=m.useRef({}),V=m.useRef(null),pe=O(c({listener:function(e){!r.isTouchDevice()&&Y(e)}}),2),me=pe[0],he=pe[1],ge=O(ne({target:L.current,listener:function(e){Y(e)},when:y}),2),_e=ge[0],ve=ge[1],ye=function(e){return!(_.content||K(e,`tooltip`))},be=function(e){return!(_.content||K(e,`tooltip`)||_.children)},H=function(e){return K(e,`mousetrack`)||_.mouseTrack},U=function(e){return K(e,`disabled`)===`true`||q(e,`disabled`)||_.disabled},W=function(e){return K(e,`showondisabled`)||_.showOnDisabled},G=function(){return K(L.current,`autohide`)||_.autoHide},K=function(e,t){return q(e,`data-pr-${t}`)?e.getAttribute(`data-pr-${t}`):null},q=function(e,t){return e&&e.hasAttribute(t)},xe=function(e){var t=[K(e,`showevent`)||_.showEvent],n=[K(e,`hideevent`)||_.hideEvent];if(H(e))t=[`mousemove`],n=[`mouseleave`];else{var r=K(e,`event`)||_.event;r===`focus`&&(t=[`focus`],n=[`blur`]),r===`both`&&(t=[`focus`,`mouseenter`],n=A?[`blur`]:[`mouseleave`,`blur`])}return{showEvents:t,hideEvents:n}},Se=function(e){return K(e,`position`)||S},Ce=function(e){return{top:K(e,`mousetracktop`)||_.mouseTrackTop,left:K(e,`mousetrackleft`)||_.mouseTrackLeft}},we=function(e,t){if(I.current){var n=K(e,`tooltip`)||_.content;n?(I.current.innerHTML=``,I.current.appendChild(document.createTextNode(n)),t()):_.children&&t()}},Te=function(e){we(L.current,function(){var t=V.current,i=t.pageX,a=t.pageY;_.autoZIndex&&!n.get(F.current)&&n.set(`tooltip`,F.current,g&&g.autoZIndex||o.autoZIndex,_.baseZIndex||g&&g.zIndex.tooltip||o.zIndex.tooltip),F.current.style.left=``,F.current.style.top=``,G()&&(F.current.style.pointerEvents=`none`);var s=H(L.current)||e===`mouse`;(s&&!R.current||s)&&(R.current={width:r.getOuterWidth(F.current),height:r.getOuterHeight(F.current)}),Ee(L.current,{x:i,y:a},e)})},J=function(e){e.type&&e.type===`focus`&&j(!0),L.current=e.currentTarget;var t=U(L.current);be(W(L.current)&&t?L.current.firstChild:L.current)||t||(V.current=e,y?X(`updateDelay`,Te):Z(_.onBeforeShow,{originalEvent:e,target:L.current})&&X(`showDelay`,function(){b(!0),Z(_.onShow,{originalEvent:e,target:L.current})}))},Y=function(e){e&&e.type===`blur`&&j(!1),Ne(),y?Z(_.onBeforeHide,{originalEvent:e,target:L.current})&&X(`hideDelay`,function(){!G()&&z.current===!1||(n.clear(F.current),r.removeClass(F.current,`p-tooltip-active`),b(!1),Z(_.onHide,{originalEvent:e,target:L.current}))}):!_.onBeforeHide&&!Me(`hideDelay`)&&b(!1)},Ee=function(e,t,n){var i=0,a=0,o=n||S;if((H(e)||o==`mouse`)&&t){var s={width:r.getOuterWidth(F.current),height:r.getOuterHeight(F.current)};i=t.x,a=t.y;var c=Ce(e),l=c.top,u=c.left;switch(o){case`left`:i-=s.width+u,a-=s.height/2-l;break;case`right`:case`mouse`:i+=u,a-=s.height/2-l;break;case`top`:i-=s.width/2-u,a-=s.height+l;break;case`bottom`:i-=s.width/2-u,a+=l;break}i<=0||R.current.width>s.width?(F.current.style.left=`0px`,F.current.style.right=window.innerWidth-s.width-i+`px`):(F.current.style.right=``,F.current.style.left=i+`px`),F.current.style.top=a+`px`,r.addClass(F.current,`p-tooltip-active`)}else{var d=r.findCollisionPosition(o),f=K(e,`my`)||_.my||d.my,ee=K(e,`at`)||_.at||d.at;F.current.style.padding=`0px`,r.flipfitCollision(F.current,e,f,ee,function(e){var t=e.at,n=t.x,i=t.y,a=e.my.x,o=_.at?n!==`center`&&n!==a?n:i:e.at[`${d.axis}`];F.current.style.padding=``,C(o),De(o),r.addClass(F.current,`p-tooltip-active`)})}},De=function(e){if(F.current){var t=getComputedStyle(F.current);e===`left`?F.current.style.left=parseFloat(t.left)-parseFloat(t.paddingLeft)*2+`px`:e===`top`&&(F.current.style.top=parseFloat(t.top)-parseFloat(t.paddingTop)*2+`px`)}},Oe=function(){G()||(z.current=!1)},ke=function(e){G()||(z.current=!0,Y(e))},Ae=function(e){if(e){var t=xe(e),n=t.showEvents,r=t.hideEvents,i=Pe(e);n.forEach(function(e){return i?.addEventListener(e,J)}),r.forEach(function(e){return i?.addEventListener(e,Y)})}},je=function(e){if(e){var t=xe(e),n=t.showEvents,r=t.hideEvents,i=Pe(e);n.forEach(function(e){return i?.removeEventListener(e,J)}),r.forEach(function(e){return i?.removeEventListener(e,Y)})}},Me=function(e){return K(L.current,e.toLowerCase())||_[e]},X=function(e,t){Ne();var n=Me(e);n?B.current[`${e}`]=setTimeout(function(){return t()},n):t()},Z=function(e){if(e){var t=[...arguments].slice(1),n=e.apply(void 0,t);return n===void 0&&(n=!0),n}return!0},Ne=function(){Object.values(B.current).forEach(function(e){return clearTimeout(e)})},Pe=function(e){if(e){if(W(e)){if(!e.hasWrapper){var t=document.createElement(`div`);return e.nodeName===`INPUT`?r.addMultipleClasses(t,`p-tooltip-target-wrapper p-inputwrapper`):r.addClass(t,`p-tooltip-target-wrapper`),e.parentNode.insertBefore(t,e),t.appendChild(e),e.hasWrapper=!0,t}return e.parentElement}else if(e.hasWrapper){var n;(n=e.parentElement).replaceWith.apply(n,oe(e.parentElement.childNodes)),delete e.hasWrapper}return e}return null},Fe=function(e){$(e),Q(e)},Q=function(e){Ie(e||_.target,Ae)},$=function(e){Ie(e||_.target,je)},Ie=function(e,t){if(e=d.getRefElement(e),e)if(r.isElement(e))t(e);else{var n=function(e){r.find(document,e).forEach(function(e){t(e)})};e instanceof Array?e.forEach(function(e){n(e)}):n(e)}};s(function(){y&&L.current&&U(L.current)&&Y()}),l(function(){return Q(),function(){$()}},[J,Y,_.target]),l(function(){if(y){var e=Se(L.current),t=K(L.current,`classname`);e!==S&&C(e),t!==T&&E(t),Te(e),me(),_e()}else C(_.position||`right`),E(``),L.current=null,R.current=null,z.current=!0;return function(){he(),ve()}},[y]),l(function(){var e=Se(L.current);y&&e!==`mouse`&&X(`updateDelay`,function(){we(L.current,function(){Ee(L.current)})})},[_.content]),u(function(){Y(),n.clear(F.current)}),m.useImperativeHandle(t,function(){return{props:_,updateTargetEvents:Fe,loadTargetEvents:Q,unloadTargetEvents:$,show:J,hide:Y,getElement:function(){return F.current},getTarget:function(){return L.current}}});var Le=function(){var e=ye(L.current),t=p({id:_.id,className:i(_.className,P(`root`,{positionState:S,classNameState:T})),style:_.style,role:`tooltip`,"aria-hidden":y,onMouseEnter:function(e){return Oe()},onMouseLeave:function(e){return ke(e)}},k.getOtherProps(_),N(`root`)),n=p({className:P(`arrow`),style:de(`arrow`,se({},ue))},N(`arrow`)),r=p({className:P(`text`)},N(`text`));return m.createElement(`div`,h({ref:F},t),m.createElement(`div`,n),m.createElement(`div`,h({ref:I},r),e&&_.children))};if(y){var Re=Le();return m.createElement(ae,{element:Re,appendTo:_.appendTo,visible:!0})}return null}));j.displayName=`Tooltip`;export{j as t};