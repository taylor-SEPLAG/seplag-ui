import{a as e,n as t,t as n}from"./jsx-runtime-ChuIQw48.js";import{P as r,s as i,x as a}from"./hooks.esm-VKHbiLGd.js";import{n as o,t as s}from"./componentbase.esm-DBhW0MYQ.js";import{t as c}from"./Grid-Bp42twmu.js";import"./index-DyeHa39m.js";import{t as l}from"./DocPage-CHgTh2J-.js";var u=e(t()),d=s.extend({defaultProps:{__TYPE:`Divider`,align:null,layout:`horizontal`,type:`solid`,style:null,className:null,children:void 0},css:{classes:{root:function(e){var t=e.props,n=e.horizontal,i=e.vertical;return r(`p-divider p-component p-divider-${t.layout} p-divider-${t.type}`,{"p-divider-left":n&&(!t.align||t.align===`left`),"p-divider-right":n&&t.align===`right`,"p-divider-center":n&&t.align===`center`||i&&(!t.align||t.align===`center`),"p-divider-top":i&&t.align===`top`,"p-divider-bottom":i&&t.align===`bottom`},t.className)},content:`p-divider-content`},styles:`
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
`,inlineStyles:{root:function(e){var t=e.props;return{justifyContent:t.layout===`horizontal`?t.align===`center`||t.align===null?`center`:t.align===`left`?`flex-start`:t.align===`right`?`flex-end`:null:null,alignItems:t.layout===`vertical`?t.align===`center`||t.align===null?`center`:t.align===`top`?`flex-start`:t.align===`bottom`?`flex-end`:null:null}}}}}),f=u.forwardRef(function(e,t){var n=i(),r=u.useContext(a),s=d.getProps(e,r),c=d.setMetaData({props:s}),l=c.ptm,f=c.cx,p=c.sx,m=c.isUnstyled;o(d.css.styles,m,{name:`divider`});var h=u.useRef(null),g=s.layout===`horizontal`,_=s.layout===`vertical`;u.useImperativeHandle(t,function(){return{props:s,getElement:function(){return h.current}}});var v=n({ref:h,style:p(`root`),className:f(`root`,{horizontal:g,vertical:_}),"aria-orientation":s.layout,role:`separator`},d.getOtherProps(s),l(`root`)),y=n({className:f(`content`)},l(`content`));return u.createElement(`div`,v,u.createElement(`div`,y,s.children))});f.displayName=`Divider`;var p=n(),m=e=>{let{cols:t=`12`,className:n=``}=e,r=c(t);return(0,p.jsx)(f,{className:n?`${r} ${n}`:r})},h=[{title:`Uso básico`,description:`Linha separadora horizontal que ocupa toda a largura da grade (cols="12" por padrão). Ideal para dividir seções de formulários ou grupos de conteúdo.`,example:(0,p.jsxs)(`div`,{className:`p-grid`,style:{width:`100%`},children:[(0,p.jsx)(`div`,{style:{padding:`0.5rem 0`,color:`#495057`},children:`Seção superior`}),(0,p.jsx)(m,{}),(0,p.jsx)(`div`,{style:{padding:`0.5rem 0`,color:`#495057`},children:`Seção inferior`})]}),code:`import { DividerSeplag } from "@seplag/ui-lib-react-18";

<DividerSeplag />`},{title:`Largura parcial (cols)`,description:`A prop "cols" segue o sistema de grid de 12 colunas. Use valores menores para divisores parciais.`,example:(0,p.jsxs)(`div`,{style:{width:`100%`},children:[(0,p.jsx)(`div`,{style:{padding:`0.25rem 0`,color:`#6c757d`,fontSize:`0.85rem`},children:`cols="12" (padrão)`}),(0,p.jsx)(m,{cols:`12`}),(0,p.jsx)(`div`,{style:{padding:`0.25rem 0`,color:`#6c757d`,fontSize:`0.85rem`},children:`cols="6"`}),(0,p.jsx)(m,{cols:`6`}),(0,p.jsx)(`div`,{style:{padding:`0.25rem 0`,color:`#6c757d`,fontSize:`0.85rem`},children:`cols="4"`}),(0,p.jsx)(m,{cols:`4`})]}),code:`<DividerSeplag cols="12" />
<DividerSeplag cols="6" />
<DividerSeplag cols="4" />`},{title:`Dentro de um formulário`,description:`Exemplo de uso típico separando blocos de campos em um formulário.`,example:(0,p.jsxs)(`div`,{style:{width:`100%`,display:`flex`,flexDirection:`column`,gap:`0.5rem`},children:[(0,p.jsx)(`div`,{style:{fontWeight:600,color:`#343a40`},children:`Dados Pessoais`}),(0,p.jsx)(`div`,{style:{color:`#6c757d`,fontSize:`0.9rem`},children:`Nome, CPF, data de nascimento…`}),(0,p.jsx)(m,{}),(0,p.jsx)(`div`,{style:{fontWeight:600,color:`#343a40`},children:`Endereço`}),(0,p.jsx)(`div`,{style:{color:`#6c757d`,fontSize:`0.9rem`},children:`Logradouro, bairro, município…`}),(0,p.jsx)(m,{}),(0,p.jsx)(`div`,{style:{fontWeight:600,color:`#343a40`},children:`Contato`}),(0,p.jsx)(`div`,{style:{color:`#6c757d`,fontSize:`0.9rem`},children:`E-mail, telefone…`})]}),code:`<DividerSeplag />`}],g=[{name:`cols`,type:`string`,defaultValue:`"12"`,required:!1,description:`Número de colunas do grid (1–12) que o divisor deve ocupar. Segue o sistema de grid de 12 colunas da biblioteca.`},{name:`className`,type:`string`,defaultValue:`""`,required:!1,description:`Classe CSS adicional aplicada ao divisor.`}];function _(){return(0,p.jsx)(l,{title:`DividerSeplag`,description:`Linha separadora horizontal baseada no Divider do PrimeReact, integrada ao sistema de grid SEPLAG. Utilizada para separar visualmente seções de formulários ou blocos de conteúdo.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { DividerSeplag } from "@seplag/ui-lib-react-18";`,sections:h,props:g})}export{_ as default};