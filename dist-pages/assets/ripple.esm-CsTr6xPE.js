import{a as e,n as t}from"./jsx-runtime-ChuIQw48.js";import{O as n,P as r,b as i,c as a,g as o,h as s,j as c,p as l,s as u,x as d}from"./hooks.esm-VKHbiLGd.js";import{t as f}from"./componentbase.esm-DBhW0MYQ.js";var p=e(t());function m(){return m=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},m.apply(null,arguments)}function h(e){"@babel/helpers - typeof";return h=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},h(e)}function g(e,t){if(h(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(h(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function _(e){var t=g(e,`string`);return h(t)==`symbol`?t:t+``}function v(e,t,n){return(t=_(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function y(e){if(Array.isArray(e))return e}function b(e,t){var n=e==null?null:typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n!=null){var r,i,a,o,s=[],c=!0,l=!1;try{if(a=(n=n.call(e)).next,t===0){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=a.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){l=!0,i=e}finally{try{if(!c&&n.return!=null&&(o=n.return(),Object(o)!==o))return}finally{if(l)throw i}}return s}}function x(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function S(e,t){if(e){if(typeof e==`string`)return x(e,t);var n={}.toString.call(e).slice(8,-1);return n===`Object`&&e.constructor&&(n=e.constructor.name),n===`Map`||n===`Set`?Array.from(e):n===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?x(e,t):void 0}}function C(){throw TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function w(e,t){return y(e)||b(e,t)||S(e,t)||C()}var T=f.extend({defaultProps:{__TYPE:`Ripple`,children:void 0},css:{styles:`
@layer primereact {
    .p-ripple {
        overflow: hidden;
        position: relative;
    }
    
    .p-ink {
        display: block;
        position: absolute;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 100%;
        transform: scale(0);
    }
    
    .p-ink-active {
        animation: ripple 0.4s linear;
    }
    
    .p-ripple-disabled .p-ink {
        display: none;
    }
}

@keyframes ripple {
    100% {
        opacity: 0;
        transform: scale(2.5);
    }
}

`,classes:{root:`p-ink`}},getProps:function(e){return c.getMergedProps(e,T.defaultProps)},getOtherProps:function(e){return c.getDiffProps(e,T.defaultProps)}});function E(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function D(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?E(Object(n),!0).forEach(function(t){v(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):E(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var O=p.memo(p.forwardRef(function(e,t){var c=w(p.useState(!1),2),f=c[0],h=c[1],g=p.useRef(null),_=p.useRef(null),v=u(),y=p.useContext(d),b=T.getProps(e,y),x=y&&y.ripple||i.ripple,S={props:b};l(T.css.styles,{name:`ripple`,manual:!x});var C=T.setMetaData(D({},S)),E=C.ptm,O=C.cx,k=function(){return g.current&&g.current.parentElement},A=function(){_.current&&_.current.addEventListener(`pointerdown`,M)},j=function(){_.current&&_.current.removeEventListener(`pointerdown`,M)},M=function(e){var t=n.getOffset(_.current);N(e.pageX-t.left+document.body.scrollTop-n.getWidth(g.current)/2,e.pageY-t.top+document.body.scrollLeft-n.getHeight(g.current)/2)},N=function(e,t){!g.current||getComputedStyle(g.current,null).display===`none`||(n.removeClass(g.current,`p-ink-active`),F(),g.current.style.top=t+`px`,g.current.style.left=e+`px`,n.addClass(g.current,`p-ink-active`))},P=function(e){n.removeClass(e.currentTarget,`p-ink-active`)},F=function(){if(g.current&&!n.getHeight(g.current)&&!n.getWidth(g.current)){var e=Math.max(n.getOuterWidth(_.current),n.getOuterHeight(_.current));g.current.style.height=e+`px`,g.current.style.width=e+`px`}};if(p.useImperativeHandle(t,function(){return{props:b,getInk:function(){return g.current},getTarget:function(){return _.current}}}),a(function(){h(!0)}),o(function(){f&&g.current&&(_.current=k(),F(),A())},[f]),o(function(){g.current&&!_.current&&(_.current=k(),F(),A())}),s(function(){g.current&&(_.current=null,j())}),!x)return null;var I=v({"aria-hidden":!0,className:r(O(`root`))},T.getOtherProps(b),E(`root`));return p.createElement(`span`,m({role:`presentation`,ref:g},I,{onAnimationEnd:P}))}));O.displayName=`Ripple`;export{O as t};