import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";import{P as r,s as i,x as a}from"./hooks.esm-DR260yFp.js";import{n as o,t as s}from"./componentbase.esm-Bg3bXvUu.js";import{t as c}from"./Grid-5H5sOpDb.js";var l=e(t()),u=s.extend({defaultProps:{__TYPE:`Divider`,align:null,layout:`horizontal`,type:`solid`,style:null,className:null,children:void 0},css:{classes:{root:function(e){var t=e.props,n=e.horizontal,i=e.vertical;return r(`p-divider p-component p-divider-${t.layout} p-divider-${t.type}`,{"p-divider-left":n&&(!t.align||t.align===`left`),"p-divider-right":n&&t.align===`right`,"p-divider-center":n&&t.align===`center`||i&&(!t.align||t.align===`center`),"p-divider-top":i&&t.align===`top`,"p-divider-bottom":i&&t.align===`bottom`},t.className)},content:`p-divider-content`},styles:`
@layer primereact {
    .p-divider-horizontal {
        display: flex;
        width: 100%;
        position: relative;
        align-items: center;
    }
    
    .p-divider-horizontal:before {
        position: absolute;
        display: block;
        top: 50%;
        left: 0;
        width: 100%;
        content: "";
    }
    
    .p-divider-horizontal.p-divider-left {
        justify-content: flex-start;
    }
    
    .p-divider-horizontal.p-divider-right {
        justify-content: flex-end;
    }
    
    .p-divider-horizontal.p-divider-center {
        justify-content: center;
    }
    
    .p-divider-content {
        z-index: 1;
    }
    
    .p-divider-vertical {
        min-height: 100%;
        margin: 0 1rem;
        display: flex;
        position: relative;
        justify-content: center;
    }
    
    .p-divider-vertical:before {
        position: absolute;
        display: block;
        top: 0;
        left: 50%;
        height: 100%;
        content: "";
    }
    
    .p-divider-vertical.p-divider-top {
        align-items: flex-start;
    }
    
    .p-divider-vertical.p-divider-center {
        align-items: center;
    }
    
    .p-divider-vertical.p-divider-bottom {
        align-items: flex-end;
    }
    
    .p-divider-solid.p-divider-horizontal:before {
        border-top-style: solid;
    }
    
    .p-divider-solid.p-divider-vertical:before {
        border-left-style: solid;
    }
    
    .p-divider-dashed.p-divider-horizontal:before {
        border-top-style: dashed;
    }
    
    .p-divider-dashed.p-divider-vertical:before {
        border-left-style: dashed;
    }
    
    .p-divider-dotted.p-divider-horizontal:before {
        border-top-style: dotted;
    }
    
    .p-divider-dotted.p-divider-horizontal:before {
        border-left-style: dotted;
    }
}
`,inlineStyles:{root:function(e){var t=e.props;return{justifyContent:t.layout===`horizontal`?t.align===`center`||t.align===null?`center`:t.align===`left`?`flex-start`:t.align===`right`?`flex-end`:null:null,alignItems:t.layout===`vertical`?t.align===`center`||t.align===null?`center`:t.align===`top`?`flex-start`:t.align===`bottom`?`flex-end`:null:null}}}}}),d=l.forwardRef(function(e,t){var n=i(),r=l.useContext(a),s=u.getProps(e,r),c=u.setMetaData({props:s}),d=c.ptm,f=c.cx,p=c.sx,m=c.isUnstyled;o(u.css.styles,m,{name:`divider`});var h=l.useRef(null),g=s.layout===`horizontal`,_=s.layout===`vertical`;l.useImperativeHandle(t,function(){return{props:s,getElement:function(){return h.current}}});var v=n({ref:h,style:p(`root`),className:f(`root`,{horizontal:g,vertical:_}),"aria-orientation":s.layout,role:`separator`},u.getOtherProps(s),d(`root`)),y=n({className:f(`content`)},d(`content`));return l.createElement(`div`,v,l.createElement(`div`,y,s.children))});d.displayName=`Divider`;var f=n(),p=e=>{let{cols:t=`12`,className:n=``}=e,r=c(t);return(0,f.jsx)(d,{className:n?`${r} ${n}`:r})};export{p as t};