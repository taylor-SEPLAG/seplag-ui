import{a as e,n as t,t as n}from"./jsx-runtime-ChuIQw48.js";import{P as r,s as i,x as a}from"./hooks.esm-VKHbiLGd.js";import{n as o,t as s}from"./componentbase.esm-DBhW0MYQ.js";import"./index-DyeHa39m.js";import{n as c,t as l}from"./DocPage-CHgTh2J-.js";var u=e(t());function d(e){"@babel/helpers - typeof";return d=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},d(e)}function f(e,t){if(d(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(d(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function p(e){var t=f(e,`string`);return d(t)==`symbol`?t:t+``}function m(e,t,n){return(t=p(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var h=s.extend({defaultProps:{__TYPE:`Skeleton`,shape:`rectangle`,size:null,width:`100%`,height:`1rem`,borderRadius:null,animation:`wave`,style:null,className:null},css:{classes:{root:function(e){var t=e.props;return r(`p-skeleton p-component`,{"p-skeleton-circle":t.shape===`circle`,"p-skeleton-none":t.animation===`none`})}},inlineStyles:{root:{position:`relative`}},styles:`
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
`}});function g(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function _(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?g(Object(n),!0).forEach(function(t){m(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):g(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var v=u.memo(u.forwardRef(function(e,t){var n=i(),s=u.useContext(a),c=h.getProps(e,s),l=h.setMetaData({props:c}),d=l.ptm,f=l.cx,p=l.sx,m=l.isUnstyled;o(h.css.styles,m,{name:`skeleton`});var g=u.useRef(null);u.useImperativeHandle(t,function(){return{props:c,getElement:function(){return g.current}}});var v=c.size?{width:c.size,height:c.size,borderRadius:c.borderRadius}:{width:c.width,height:c.height,borderRadius:c.borderRadius},y=n({ref:g,className:r(c.className,f(`root`)),style:_(_({},v),p(`root`)),"aria-hidden":!0},h.getOtherProps(c),d(`root`));return u.createElement(`div`,y)}));v.displayName=`Skeleton`;var y=n();function b({variant:e=`text`,lines:t=1,gap:n=`0.5rem`,className:r=``,containerClassName:i=``,width:a,height:o,shape:s,size:c,borderRadius:l,children:u,...d}){let f=Array.from({length:t},(e,n)=>`skeleton-${t}-${n}`);if(u)return(0,y.jsx)(`div`,{className:i,children:u});let p=(()=>{switch(e){case`title`:return{height:o??`20px`,width:a??`60%`};case`text`:return{height:o??`14px`,width:a??`100%`};case`avatar`:return{shape:`circle`,size:c??`2.5rem`};case`button`:return{height:o??`32px`,width:a??`100px`,borderRadius:l??`6px`};case`card`:return{height:o??`80px`,borderRadius:l??`12px`};default:return{}}})();return t>1?(0,y.jsx)(`div`,{className:i,style:{display:`flex`,flexDirection:`column`,gap:n},children:f.map(e=>(0,y.jsx)(v,{...p,...d,className:`mb-0 ${r}`.trim()},e))}):(0,y.jsx)(v,{...p,...d,className:`mb-2 ${r}`.trim()})}var x=e=>(0,y.jsx)(v,{...e}),S=e=>(0,y.jsx)(b,{...e});S.Item=x;var C=[`text`,`title`,`avatar`,`button`,`card`,`custom`];function w(){let[e,t]=(0,u.useState)(`text`),[n,r]=(0,u.useState)(3),[i,a]=(0,u.useState)(``),[o,s]=(0,u.useState)(``),[l,d]=(0,u.useState)(``),[f,p]=(0,u.useState)(``),[m,h]=(0,u.useState)(`0.5rem`),g=`import { SkeletonSeplag } from "@seplag/ui-lib-react-18";\n\n<SkeletonSeplag\n  ${[`variant="${e}"`,n===1?``:`lines={${n}}`,i?`width="${i}"`:``,o?`height="${o}"`:``,l?`size="${l}"`:``,f?`borderRadius="${f}"`:``,m===`0.5rem`?``:`gap="${m}"`].filter(Boolean).join(`
  `)}\n/>`;return(0,y.jsxs)(`div`,{className:`botao-playground`,children:[(0,y.jsx)(`div`,{className:`botao-playground-preview`,style:{minHeight:140},children:(0,y.jsx)(`div`,{style:{width:`100%`,maxWidth:420},children:(0,y.jsx)(S,{variant:e,lines:n,width:i||void 0,height:o||void 0,size:l||void 0,borderRadius:f||void 0,gap:m})})}),(0,y.jsxs)(`div`,{className:`botao-playground-controls`,children:[(0,y.jsxs)(`div`,{className:`pg-field`,children:[(0,y.jsx)(`span`,{className:`pg-label`,children:`variant`}),(0,y.jsx)(`div`,{className:`pg-radio-group`,children:C.map(n=>(0,y.jsxs)(`label`,{className:`pg-radio-btn${e===n?` selected`:``}`,children:[(0,y.jsx)(`input`,{type:`radio`,name:`skeleton-variant`,checked:e===n,onChange:()=>t(n)}),n]},n))})]}),(0,y.jsxs)(`div`,{className:`pg-field`,children:[(0,y.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-lines`,children:`lines`}),(0,y.jsx)(`input`,{id:`skeleton-lines`,className:`pg-input`,type:`number`,min:1,max:8,value:n,onChange:e=>r(Number(e.target.value)||1)})]}),(0,y.jsxs)(`div`,{className:`pg-field`,children:[(0,y.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-width`,children:`width`}),(0,y.jsx)(`input`,{id:`skeleton-width`,className:`pg-input`,type:`text`,value:i,onChange:e=>a(e.target.value),placeholder:`ex: 100%, 240px`})]}),(0,y.jsxs)(`div`,{className:`pg-field`,children:[(0,y.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-height`,children:`height`}),(0,y.jsx)(`input`,{id:`skeleton-height`,className:`pg-input`,type:`text`,value:o,onChange:e=>s(e.target.value),placeholder:`ex: 14px`})]}),(0,y.jsxs)(`div`,{className:`pg-field`,children:[(0,y.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-size`,children:`size`}),(0,y.jsx)(`input`,{id:`skeleton-size`,className:`pg-input`,type:`text`,value:l,onChange:e=>d(e.target.value),placeholder:`ex: 2.5rem (avatar)`})]}),(0,y.jsxs)(`div`,{className:`pg-field`,children:[(0,y.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-radius`,children:`borderRadius`}),(0,y.jsx)(`input`,{id:`skeleton-radius`,className:`pg-input`,type:`text`,value:f,onChange:e=>p(e.target.value),placeholder:`ex: 12px`})]}),(0,y.jsxs)(`div`,{className:`pg-field`,children:[(0,y.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-gap`,children:`gap`}),(0,y.jsx)(`input`,{id:`skeleton-gap`,className:`pg-input`,type:`text`,value:m,onChange:e=>h(e.target.value),placeholder:`ex: 0.5rem`})]})]}),(0,y.jsx)(c,{code:g})]})}var T=[{title:`Playground`,description:`Monte o skeleton ao vivo escolhendo o preset e as dimensões. O código é gerado automaticamente.`,example:(0,y.jsx)(w,{}),code:`// Use o playground acima para gerar o código do seu SkeletonSeplag`},{title:`Variações de preset`,description:`Use a prop variant para escolher entre presets prontos de loading placeholders.`,example:(0,y.jsxs)(`div`,{style:{display:`grid`,gap:12,width:`100%`,maxWidth:480},children:[(0,y.jsx)(S,{variant:`title`}),(0,y.jsx)(S,{variant:`text`,lines:3}),(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12},children:[(0,y.jsx)(S,{variant:`avatar`}),(0,y.jsx)(S,{variant:`button`})]}),(0,y.jsx)(S,{variant:`card`})]}),code:`<SkeletonSeplag variant="title" />
<SkeletonSeplag variant="text" lines={3} />
<SkeletonSeplag variant="avatar" />
<SkeletonSeplag variant="button" />
<SkeletonSeplag variant="card" />`},{title:`Customização`,description:`No variant custom, você controla manualmente largura, altura e borda para montar qualquer placeholder.`,example:(0,y.jsx)(`div`,{style:{width:`100%`,maxWidth:420},children:(0,y.jsx)(S,{variant:`custom`,lines:4,height:`10px`,width:`100%`,borderRadius:`6px`,gap:`0.6rem`})}),code:`<SkeletonSeplag
  variant="custom"
  lines={4}
  height="10px"
  width="100%"
  borderRadius="6px"
  gap="0.6rem"
/>`},{title:`Cards em grade`,description:`Use SkeletonSeplag com children para compor cards em grade com itens de tamanho variado.`,example:(0,y.jsx)(`div`,{className:`grid`,style:{width:`100%`},children:[`a`,`b`,`c`,`d`].map(e=>(0,y.jsx)(`div`,{className:`col-12 md:col-3`,children:(0,y.jsxs)(S,{containerClassName:`p-3 border-round surface-100 flex flex-column gap-2`,children:[(0,y.jsx)(S.Item,{width:`40%`,height:`12px`}),(0,y.jsx)(S.Item,{width:`60%`,height:`20px`})]})},e))}),code:`<div className="grid">
  {["a", "b", "c", "d"].map((key) => (
    <div key={key} className="col-12 md:col-3">
      <SkeletonSeplag containerClassName="p-3 border-round surface-100 flex flex-column gap-2">
        <SkeletonSeplag.Item width="40%" height="12px" />
        <SkeletonSeplag.Item width="60%" height="20px" />
      </SkeletonSeplag>
    </div>
  ))}
</div>`},{title:`Tabela simulada`,description:`Simule linhas de uma tabela usando SkeletonSeplag.Item em layout flex por linha.`,example:(0,y.jsx)(S,{containerClassName:`flex flex-column gap-2`,style:{width:`100%`,maxWidth:600},children:[`1`,`2`,`3`,`4`,`5`].map(e=>(0,y.jsxs)(`div`,{className:`flex gap-3 align-items-center`,children:[(0,y.jsx)(S.Item,{width:`10%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`30%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`25%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`20%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`15%`,height:`14px`})]},e))}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-2">
  {["1", "2", "3", "4", "5"].map((row) => (
    <div key={row} className="flex gap-3 align-items-center">
      <SkeletonSeplag.Item width="10%" height="14px" />
      <SkeletonSeplag.Item width="30%" height="14px" />
      <SkeletonSeplag.Item width="25%" height="14px" />
      <SkeletonSeplag.Item width="20%" height="14px" />
      <SkeletonSeplag.Item width="15%" height="14px" />
    </div>
  ))}
</SkeletonSeplag>`},{title:`Tabela com ações`,description:`Linhas de tabela com botões de ação no final, simulando listagens com controles.`,example:(0,y.jsx)(S,{containerClassName:`flex flex-column gap-2`,style:{width:`100%`,maxWidth:600},children:[`1`,`2`,`3`].map(e=>(0,y.jsxs)(`div`,{className:`flex gap-3 align-items-center`,children:[(0,y.jsx)(S.Item,{width:`35%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`30%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`60px`,height:`28px`,borderRadius:`6px`}),(0,y.jsx)(S.Item,{width:`60px`,height:`28px`,borderRadius:`6px`})]},e))}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-2">
  {["1", "2", "3"].map((row) => (
    <div key={row} className="flex gap-3 align-items-center">
      <SkeletonSeplag.Item width="35%" height="14px" />
      <SkeletonSeplag.Item width="30%" height="14px" />
      <SkeletonSeplag.Item width="60px" height="28px" borderRadius="6px" />
      <SkeletonSeplag.Item width="60px" height="28px" borderRadius="6px" />
    </div>
  ))}
</SkeletonSeplag>`},{title:`Lista simples com ação`,description:`Lista de itens com linha de texto e um botão à direita.`,example:(0,y.jsx)(S,{containerClassName:`flex flex-column gap-3`,style:{width:`100%`,maxWidth:480},children:[`1`,`2`,`3`,`4`].map(e=>(0,y.jsxs)(`div`,{className:`flex justify-content-between align-items-center gap-3`,children:[(0,y.jsx)(S.Item,{width:`70%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`80px`,height:`28px`,borderRadius:`6px`})]},e))}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-3">
  {["1", "2", "3", "4"].map((row) => (
    <div key={row} className="flex justify-content-between align-items-center gap-3">
      <SkeletonSeplag.Item width="70%" height="14px" />
      <SkeletonSeplag.Item width="80px" height="28px" borderRadius="6px" />
    </div>
  ))}
</SkeletonSeplag>`},{title:`Lista de usuários com avatar`,description:`Simule uma lista de usuários com avatar circular e linhas de texto ao lado.`,example:(0,y.jsx)(S,{containerClassName:`flex flex-column gap-3`,style:{width:`100%`,maxWidth:400},children:[`1`,`2`,`3`].map(e=>(0,y.jsxs)(`div`,{className:`flex align-items-center gap-3`,children:[(0,y.jsx)(S.Item,{shape:`circle`,size:`2.5rem`}),(0,y.jsxs)(`div`,{className:`flex flex-column gap-1`,style:{flex:1},children:[(0,y.jsx)(S.Item,{width:`50%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`75%`,height:`12px`})]})]},e))}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-3">
  {["1", "2", "3"].map((row) => (
    <div key={row} className="flex align-items-center gap-3">
      <SkeletonSeplag.Item shape="circle" size="2.5rem" />
      <div className="flex flex-column gap-1" style={{ flex: 1 }}>
        <SkeletonSeplag.Item width="50%" height="14px" />
        <SkeletonSeplag.Item width="75%" height="12px" />
      </div>
    </div>
  ))}
</SkeletonSeplag>`},{title:`Perfil de entidade`,description:`Skeleton para uma página de perfil com avatar grande e linhas de informação.`,example:(0,y.jsxs)(S,{containerClassName:`p-4 flex flex-column gap-3`,style:{width:`100%`,maxWidth:440,background:`var(--surface-100)`,borderRadius:12},children:[(0,y.jsxs)(`div`,{className:`flex align-items-center gap-3`,children:[(0,y.jsx)(S.Item,{shape:`circle`,size:`4rem`}),(0,y.jsxs)(`div`,{className:`flex flex-column gap-2`,style:{flex:1},children:[(0,y.jsx)(S.Item,{width:`55%`,height:`18px`}),(0,y.jsx)(S.Item,{width:`40%`,height:`14px`})]})]}),(0,y.jsx)(S.Item,{width:`100%`,height:`1px`}),(0,y.jsx)(S.Item,{width:`80%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`65%`,height:`14px`}),(0,y.jsx)(S.Item,{width:`70%`,height:`14px`})]}),code:`<SkeletonSeplag containerClassName="p-4 flex flex-column gap-3">
  <div className="flex align-items-center gap-3">
    <SkeletonSeplag.Item shape="circle" size="4rem" />
    <div className="flex flex-column gap-2" style={{ flex: 1 }}>
      <SkeletonSeplag.Item width="55%" height="18px" />
      <SkeletonSeplag.Item width="40%" height="14px" />
    </div>
  </div>
  <SkeletonSeplag.Item width="100%" height="1px" />
  <SkeletonSeplag.Item width="80%" height="14px" />
  <SkeletonSeplag.Item width="65%" height="14px" />
  <SkeletonSeplag.Item width="70%" height="14px" />
</SkeletonSeplag>`},{title:`Formulário`,description:`Simule um formulário com campos e botões de ação no rodapé.`,example:(0,y.jsxs)(S,{containerClassName:`flex flex-column gap-3`,style:{width:`100%`,maxWidth:480},children:[(0,y.jsxs)(`div`,{className:`flex flex-column gap-1`,children:[(0,y.jsx)(S.Item,{width:`30%`,height:`12px`}),(0,y.jsx)(S.Item,{width:`100%`,height:`36px`,borderRadius:`6px`})]}),(0,y.jsxs)(`div`,{className:`flex flex-column gap-1`,children:[(0,y.jsx)(S.Item,{width:`25%`,height:`12px`}),(0,y.jsx)(S.Item,{width:`100%`,height:`36px`,borderRadius:`6px`})]}),(0,y.jsxs)(`div`,{className:`flex flex-column gap-1`,children:[(0,y.jsx)(S.Item,{width:`35%`,height:`12px`}),(0,y.jsx)(S.Item,{width:`100%`,height:`70px`,borderRadius:`6px`})]}),(0,y.jsxs)(`div`,{className:`flex gap-2 justify-content-end`,children:[(0,y.jsx)(S.Item,{width:`90px`,height:`36px`,borderRadius:`6px`}),(0,y.jsx)(S.Item,{width:`120px`,height:`36px`,borderRadius:`6px`})]})]}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-3">
  <div className="flex flex-column gap-1">
    <SkeletonSeplag.Item width="30%" height="12px" />
    <SkeletonSeplag.Item width="100%" height="36px" borderRadius="6px" />
  </div>
  <div className="flex flex-column gap-1">
    <SkeletonSeplag.Item width="25%" height="12px" />
    <SkeletonSeplag.Item width="100%" height="36px" borderRadius="6px" />
  </div>
  <div className="flex flex-column gap-1">
    <SkeletonSeplag.Item width="35%" height="12px" />
    <SkeletonSeplag.Item width="100%" height="70px" borderRadius="6px" />
  </div>
  <div className="flex gap-2 justify-content-end">
    <SkeletonSeplag.Item width="90px" height="36px" borderRadius="6px" />
    <SkeletonSeplag.Item width="120px" height="36px" borderRadius="6px" />
  </div>
</SkeletonSeplag>`},{title:`Card com mídia`,description:`Card com título no topo e bloco de imagem abaixo, típico de conteúdo com thumbnail.`,example:(0,y.jsx)(`div`,{style:{maxWidth:320},children:(0,y.jsxs)(S,{containerClassName:`p-3 flex flex-column gap-2 border-round surface-100`,children:[(0,y.jsx)(S.Item,{width:`60%`,height:`16px`}),(0,y.jsx)(S.Item,{width:`40%`,height:`12px`}),(0,y.jsx)(S.Item,{width:`100%`,height:`140px`,borderRadius:`8px`})]})}),code:`<SkeletonSeplag containerClassName="p-3 flex flex-column gap-2 border-round surface-100">
  <SkeletonSeplag.Item width="60%" height="16px" />
  <SkeletonSeplag.Item width="40%" height="12px" />
  <SkeletonSeplag.Item width="100%" height="140px" borderRadius="8px" />
</SkeletonSeplag>`}],E=[{name:`variant`,type:`"text" | "title" | "avatar" | "button" | "card" | "custom"`,defaultValue:`"text"`,required:!1,description:`Preset visual aplicado ao skeleton.`},{name:`lines`,type:`number`,defaultValue:`1`,required:!1,description:`Quantidade de linhas renderizadas quando lines > 1.`},{name:`gap`,type:`string`,defaultValue:`"0.5rem"`,required:!1,description:`Espaçamento vertical entre linhas do skeleton múltiplo.`},{name:`containerClassName`,type:`string`,required:!1,description:`Classe CSS aplicada no container externo.`},{name:`width`,type:`string`,required:!1,description:`Largura do placeholder (prop herdada do PrimeReact Skeleton).`},{name:`height`,type:`string`,required:!1,description:`Altura do placeholder (prop herdada do PrimeReact Skeleton).`},{name:`size`,type:`string`,required:!1,description:`Tamanho do skeleton, útil no preset avatar.`},{name:`borderRadius`,type:`string`,required:!1,description:`Raio da borda do skeleton.`},{name:`className`,type:`string`,required:!1,description:`Classe CSS aplicada no elemento skeleton.`},{name:`children`,type:`React.ReactNode`,required:!1,description:`Quando informado, renderiza o conteúdo children dentro do container (modo custom manual).`}];function D(){return(0,y.jsx)(l,{title:`SkeletonSeplag`,description:`Componente de placeholders para estados de carregamento, com presets prontos e opções de customização para layouts específicos.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { SkeletonSeplag } from "@seplag/ui-lib-react-18";`,sections:T,props:E})}export{D as default};