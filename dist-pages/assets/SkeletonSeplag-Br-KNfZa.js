import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";import{P as r,s as i,x as a}from"./hooks.esm-DR260yFp.js";import{n as o,t as s}from"./componentbase.esm-Bg3bXvUu.js";var c=e(t());function l(e){"@babel/helpers - typeof";return l=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},l(e)}function u(e,t){if(l(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(l(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function d(e){var t=u(e,`string`);return l(t)==`symbol`?t:t+``}function f(e,t,n){return(t=d(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var p=s.extend({defaultProps:{__TYPE:`Skeleton`,shape:`rectangle`,size:null,width:`100%`,height:`1rem`,borderRadius:null,animation:`wave`,style:null,className:null},css:{classes:{root:function(e){var t=e.props;return r(`p-skeleton p-component`,{"p-skeleton-circle":t.shape===`circle`,"p-skeleton-none":t.animation===`none`})}},inlineStyles:{root:{position:`relative`}},styles:`
@layer primereact {
    .p-skeleton {
        position: relative;
        overflow: hidden;
    }
    
    .p-skeleton::after {
        content: "";
        animation: p-skeleton-animation 1.2s infinite;
        height: 100%;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(-100%);
        z-index: 1;
    }
    
    .p-skeleton-circle {
        border-radius: 50%;
    }
    
    .p-skeleton-none::after {
        animation: none;
    }
}

@keyframes p-skeleton-animation {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(100%);
    }
}
`}});function m(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function h(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?m(Object(n),!0).forEach(function(t){f(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):m(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var g=c.memo(c.forwardRef(function(e,t){var n=i(),s=c.useContext(a),l=p.getProps(e,s),u=p.setMetaData({props:l}),d=u.ptm,f=u.cx,m=u.sx,g=u.isUnstyled;o(p.css.styles,g,{name:`skeleton`});var _=c.useRef(null);c.useImperativeHandle(t,function(){return{props:l,getElement:function(){return _.current}}});var v=l.size?{width:l.size,height:l.size,borderRadius:l.borderRadius}:{width:l.width,height:l.height,borderRadius:l.borderRadius},y=n({ref:_,className:r(l.className,f(`root`)),style:h(h({},v),m(`root`)),"aria-hidden":!0},p.getOtherProps(l),d(`root`));return c.createElement(`div`,y)}));g.displayName=`Skeleton`;var _=n();function v({variant:e=`text`,lines:t=1,gap:n=`0.5rem`,className:r=``,containerClassName:i=``,width:a,height:o,shape:s,size:c,borderRadius:l,children:u,...d}){let f=Array.from({length:t},(e,n)=>`skeleton-${t}-${n}`);if(u)return(0,_.jsx)(`div`,{className:i,children:u});let p=(()=>{switch(e){case`title`:return{height:o??`20px`,width:a??`60%`};case`text`:return{height:o??`14px`,width:a??`100%`};case`avatar`:return{shape:`circle`,size:c??`2.5rem`};case`button`:return{height:o??`32px`,width:a??`100px`,borderRadius:l??`6px`};case`card`:return{height:o??`80px`,borderRadius:l??`12px`};default:return{}}})();return t>1?(0,_.jsx)(`div`,{className:i,style:{display:`flex`,flexDirection:`column`,gap:n},children:f.map(e=>(0,_.jsx)(g,{...p,...d,className:`mb-0 ${r}`.trim()},e))}):(0,_.jsx)(g,{...p,...d,className:`mb-2 ${r}`.trim()})}var y=e=>(0,_.jsx)(g,{...e}),b=e=>(0,_.jsx)(v,{...e});b.Item=y;export{b as t};