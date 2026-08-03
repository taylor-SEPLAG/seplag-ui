import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{t as r}from"./SkeletonSeplag-Br-KNfZa.js";import{n as i,t as a}from"./DocPage-DfNa9OED.js";var o=e(t(),1),s=n(),c=[`text`,`title`,`avatar`,`button`,`card`,`custom`];function l(){let[e,t]=(0,o.useState)(`text`),[n,a]=(0,o.useState)(3),[l,u]=(0,o.useState)(``),[d,f]=(0,o.useState)(``),[p,m]=(0,o.useState)(``),[h,g]=(0,o.useState)(``),[_,v]=(0,o.useState)(`0.5rem`),y=`import { SkeletonSeplag } from "@seplag/ui-lib-react-18";\n\n<SkeletonSeplag\n  ${[`variant="${e}"`,n===1?``:`lines={${n}}`,l?`width="${l}"`:``,d?`height="${d}"`:``,p?`size="${p}"`:``,h?`borderRadius="${h}"`:``,_===`0.5rem`?``:`gap="${_}"`].filter(Boolean).join(`
  `)}\n/>`;return(0,s.jsxs)(`div`,{className:`botao-playground`,children:[(0,s.jsx)(`div`,{className:`botao-playground-preview`,style:{minHeight:140},children:(0,s.jsx)(`div`,{style:{width:`100%`,maxWidth:420},children:(0,s.jsx)(r,{variant:e,lines:n,width:l||void 0,height:d||void 0,size:p||void 0,borderRadius:h||void 0,gap:_})})}),(0,s.jsxs)(`div`,{className:`botao-playground-controls`,children:[(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`span`,{className:`pg-label`,children:`variant`}),(0,s.jsx)(`div`,{className:`pg-radio-group`,children:c.map(n=>(0,s.jsxs)(`label`,{className:`pg-radio-btn${e===n?` selected`:``}`,children:[(0,s.jsx)(`input`,{type:`radio`,name:`skeleton-variant`,checked:e===n,onChange:()=>t(n)}),n]},n))})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-lines`,children:`lines`}),(0,s.jsx)(`input`,{id:`skeleton-lines`,className:`pg-input`,type:`number`,min:1,max:8,value:n,onChange:e=>a(Number(e.target.value)||1)})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-width`,children:`width`}),(0,s.jsx)(`input`,{id:`skeleton-width`,className:`pg-input`,type:`text`,value:l,onChange:e=>u(e.target.value),placeholder:`ex: 100%, 240px`})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-height`,children:`height`}),(0,s.jsx)(`input`,{id:`skeleton-height`,className:`pg-input`,type:`text`,value:d,onChange:e=>f(e.target.value),placeholder:`ex: 14px`})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-size`,children:`size`}),(0,s.jsx)(`input`,{id:`skeleton-size`,className:`pg-input`,type:`text`,value:p,onChange:e=>m(e.target.value),placeholder:`ex: 2.5rem (avatar)`})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-radius`,children:`borderRadius`}),(0,s.jsx)(`input`,{id:`skeleton-radius`,className:`pg-input`,type:`text`,value:h,onChange:e=>g(e.target.value),placeholder:`ex: 12px`})]}),(0,s.jsxs)(`div`,{className:`pg-field`,children:[(0,s.jsx)(`label`,{className:`pg-label`,htmlFor:`skeleton-gap`,children:`gap`}),(0,s.jsx)(`input`,{id:`skeleton-gap`,className:`pg-input`,type:`text`,value:_,onChange:e=>v(e.target.value),placeholder:`ex: 0.5rem`})]})]}),(0,s.jsx)(i,{code:y})]})}var u=[{title:`Playground`,description:`Monte o skeleton ao vivo escolhendo o preset e as dimensões. O código é gerado automaticamente.`,example:(0,s.jsx)(l,{}),code:`// Use o playground acima para gerar o código do seu SkeletonSeplag`},{title:`Variações de preset`,description:`Use a prop variant para escolher entre presets prontos de loading placeholders.`,example:(0,s.jsxs)(`div`,{style:{display:`grid`,gap:12,width:`100%`,maxWidth:480},children:[(0,s.jsx)(r,{variant:`title`}),(0,s.jsx)(r,{variant:`text`,lines:3}),(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12},children:[(0,s.jsx)(r,{variant:`avatar`}),(0,s.jsx)(r,{variant:`button`})]}),(0,s.jsx)(r,{variant:`card`})]}),code:`<SkeletonSeplag variant="title" />
<SkeletonSeplag variant="text" lines={3} />
<SkeletonSeplag variant="avatar" />
<SkeletonSeplag variant="button" />
<SkeletonSeplag variant="card" />`},{title:`Customização`,description:`No variant custom, você controla manualmente largura, altura e borda para montar qualquer placeholder.`,example:(0,s.jsx)(`div`,{style:{width:`100%`,maxWidth:420},children:(0,s.jsx)(r,{variant:`custom`,lines:4,height:`10px`,width:`100%`,borderRadius:`6px`,gap:`0.6rem`})}),code:`<SkeletonSeplag
  variant="custom"
  lines={4}
  height="10px"
  width="100%"
  borderRadius="6px"
  gap="0.6rem"
/>`},{title:`Cards em grade`,description:`Use SkeletonSeplag com children para compor cards em grade com itens de tamanho variado.`,example:(0,s.jsx)(`div`,{className:`grid`,style:{width:`100%`},children:[`a`,`b`,`c`,`d`].map(e=>(0,s.jsx)(`div`,{className:`col-12 md:col-3`,children:(0,s.jsxs)(r,{containerClassName:`p-3 border-round surface-100 flex flex-column gap-2`,children:[(0,s.jsx)(r.Item,{width:`40%`,height:`12px`}),(0,s.jsx)(r.Item,{width:`60%`,height:`20px`})]})},e))}),code:`<div className="grid">
  {["a", "b", "c", "d"].map((key) => (
    <div key={key} className="col-12 md:col-3">
      <SkeletonSeplag containerClassName="p-3 border-round surface-100 flex flex-column gap-2">
        <SkeletonSeplag.Item width="40%" height="12px" />
        <SkeletonSeplag.Item width="60%" height="20px" />
      </SkeletonSeplag>
    </div>
  ))}
</div>`},{title:`Tabela simulada`,description:`Simule linhas de uma tabela usando SkeletonSeplag.Item em layout flex por linha.`,example:(0,s.jsx)(r,{containerClassName:`flex flex-column gap-2`,style:{width:`100%`,maxWidth:600},children:[`1`,`2`,`3`,`4`,`5`].map(e=>(0,s.jsxs)(`div`,{className:`flex gap-3 align-items-center`,children:[(0,s.jsx)(r.Item,{width:`10%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`30%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`25%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`20%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`15%`,height:`14px`})]},e))}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-2">
  {["1", "2", "3", "4", "5"].map((row) => (
    <div key={row} className="flex gap-3 align-items-center">
      <SkeletonSeplag.Item width="10%" height="14px" />
      <SkeletonSeplag.Item width="30%" height="14px" />
      <SkeletonSeplag.Item width="25%" height="14px" />
      <SkeletonSeplag.Item width="20%" height="14px" />
      <SkeletonSeplag.Item width="15%" height="14px" />
    </div>
  ))}
</SkeletonSeplag>`},{title:`Tabela com ações`,description:`Linhas de tabela com botões de ação no final, simulando listagens com controles.`,example:(0,s.jsx)(r,{containerClassName:`flex flex-column gap-2`,style:{width:`100%`,maxWidth:600},children:[`1`,`2`,`3`].map(e=>(0,s.jsxs)(`div`,{className:`flex gap-3 align-items-center`,children:[(0,s.jsx)(r.Item,{width:`35%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`30%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`60px`,height:`28px`,borderRadius:`6px`}),(0,s.jsx)(r.Item,{width:`60px`,height:`28px`,borderRadius:`6px`})]},e))}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-2">
  {["1", "2", "3"].map((row) => (
    <div key={row} className="flex gap-3 align-items-center">
      <SkeletonSeplag.Item width="35%" height="14px" />
      <SkeletonSeplag.Item width="30%" height="14px" />
      <SkeletonSeplag.Item width="60px" height="28px" borderRadius="6px" />
      <SkeletonSeplag.Item width="60px" height="28px" borderRadius="6px" />
    </div>
  ))}
</SkeletonSeplag>`},{title:`Lista simples com ação`,description:`Lista de itens com linha de texto e um botão à direita.`,example:(0,s.jsx)(r,{containerClassName:`flex flex-column gap-3`,style:{width:`100%`,maxWidth:480},children:[`1`,`2`,`3`,`4`].map(e=>(0,s.jsxs)(`div`,{className:`flex justify-content-between align-items-center gap-3`,children:[(0,s.jsx)(r.Item,{width:`70%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`80px`,height:`28px`,borderRadius:`6px`})]},e))}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-3">
  {["1", "2", "3", "4"].map((row) => (
    <div key={row} className="flex justify-content-between align-items-center gap-3">
      <SkeletonSeplag.Item width="70%" height="14px" />
      <SkeletonSeplag.Item width="80px" height="28px" borderRadius="6px" />
    </div>
  ))}
</SkeletonSeplag>`},{title:`Lista de usuários com avatar`,description:`Simule uma lista de usuários com avatar circular e linhas de texto ao lado.`,example:(0,s.jsx)(r,{containerClassName:`flex flex-column gap-3`,style:{width:`100%`,maxWidth:400},children:[`1`,`2`,`3`].map(e=>(0,s.jsxs)(`div`,{className:`flex align-items-center gap-3`,children:[(0,s.jsx)(r.Item,{shape:`circle`,size:`2.5rem`}),(0,s.jsxs)(`div`,{className:`flex flex-column gap-1`,style:{flex:1},children:[(0,s.jsx)(r.Item,{width:`50%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`75%`,height:`12px`})]})]},e))}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-3">
  {["1", "2", "3"].map((row) => (
    <div key={row} className="flex align-items-center gap-3">
      <SkeletonSeplag.Item shape="circle" size="2.5rem" />
      <div className="flex flex-column gap-1" style={{ flex: 1 }}>
        <SkeletonSeplag.Item width="50%" height="14px" />
        <SkeletonSeplag.Item width="75%" height="12px" />
      </div>
    </div>
  ))}
</SkeletonSeplag>`},{title:`Perfil de entidade`,description:`Skeleton para uma página de perfil com avatar grande e linhas de informação.`,example:(0,s.jsxs)(r,{containerClassName:`p-4 flex flex-column gap-3`,style:{width:`100%`,maxWidth:440,background:`var(--surface-100)`,borderRadius:12},children:[(0,s.jsxs)(`div`,{className:`flex align-items-center gap-3`,children:[(0,s.jsx)(r.Item,{shape:`circle`,size:`4rem`}),(0,s.jsxs)(`div`,{className:`flex flex-column gap-2`,style:{flex:1},children:[(0,s.jsx)(r.Item,{width:`55%`,height:`18px`}),(0,s.jsx)(r.Item,{width:`40%`,height:`14px`})]})]}),(0,s.jsx)(r.Item,{width:`100%`,height:`1px`}),(0,s.jsx)(r.Item,{width:`80%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`65%`,height:`14px`}),(0,s.jsx)(r.Item,{width:`70%`,height:`14px`})]}),code:`<SkeletonSeplag containerClassName="p-4 flex flex-column gap-3">
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
</SkeletonSeplag>`},{title:`Formulário`,description:`Simule um formulário com campos e botões de ação no rodapé.`,example:(0,s.jsxs)(r,{containerClassName:`flex flex-column gap-3`,style:{width:`100%`,maxWidth:480},children:[(0,s.jsxs)(`div`,{className:`flex flex-column gap-1`,children:[(0,s.jsx)(r.Item,{width:`30%`,height:`12px`}),(0,s.jsx)(r.Item,{width:`100%`,height:`36px`,borderRadius:`6px`})]}),(0,s.jsxs)(`div`,{className:`flex flex-column gap-1`,children:[(0,s.jsx)(r.Item,{width:`25%`,height:`12px`}),(0,s.jsx)(r.Item,{width:`100%`,height:`36px`,borderRadius:`6px`})]}),(0,s.jsxs)(`div`,{className:`flex flex-column gap-1`,children:[(0,s.jsx)(r.Item,{width:`35%`,height:`12px`}),(0,s.jsx)(r.Item,{width:`100%`,height:`70px`,borderRadius:`6px`})]}),(0,s.jsxs)(`div`,{className:`flex gap-2 justify-content-end`,children:[(0,s.jsx)(r.Item,{width:`90px`,height:`36px`,borderRadius:`6px`}),(0,s.jsx)(r.Item,{width:`120px`,height:`36px`,borderRadius:`6px`})]})]}),code:`<SkeletonSeplag containerClassName="flex flex-column gap-3">
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
</SkeletonSeplag>`},{title:`Card com mídia`,description:`Card com título no topo e bloco de imagem abaixo, típico de conteúdo com thumbnail.`,example:(0,s.jsx)(`div`,{style:{maxWidth:320},children:(0,s.jsxs)(r,{containerClassName:`p-3 flex flex-column gap-2 border-round surface-100`,children:[(0,s.jsx)(r.Item,{width:`60%`,height:`16px`}),(0,s.jsx)(r.Item,{width:`40%`,height:`12px`}),(0,s.jsx)(r.Item,{width:`100%`,height:`140px`,borderRadius:`8px`})]})}),code:`<SkeletonSeplag containerClassName="p-3 flex flex-column gap-2 border-round surface-100">
  <SkeletonSeplag.Item width="60%" height="16px" />
  <SkeletonSeplag.Item width="40%" height="12px" />
  <SkeletonSeplag.Item width="100%" height="140px" borderRadius="8px" />
</SkeletonSeplag>`}],d=[{name:`variant`,type:`"text" | "title" | "avatar" | "button" | "card" | "custom"`,defaultValue:`"text"`,required:!1,description:`Preset visual aplicado ao skeleton.`},{name:`lines`,type:`number`,defaultValue:`1`,required:!1,description:`Quantidade de linhas renderizadas quando lines > 1.`},{name:`gap`,type:`string`,defaultValue:`"0.5rem"`,required:!1,description:`Espaçamento vertical entre linhas do skeleton múltiplo.`},{name:`containerClassName`,type:`string`,required:!1,description:`Classe CSS aplicada no container externo.`},{name:`width`,type:`string`,required:!1,description:`Largura do placeholder (prop herdada do PrimeReact Skeleton).`},{name:`height`,type:`string`,required:!1,description:`Altura do placeholder (prop herdada do PrimeReact Skeleton).`},{name:`size`,type:`string`,required:!1,description:`Tamanho do skeleton, útil no preset avatar.`},{name:`borderRadius`,type:`string`,required:!1,description:`Raio da borda do skeleton.`},{name:`className`,type:`string`,required:!1,description:`Classe CSS aplicada no elemento skeleton.`},{name:`children`,type:`React.ReactNode`,required:!1,description:`Quando informado, renderiza o conteúdo children dentro do container (modo custom manual).`}];function f(){return(0,s.jsx)(a,{title:`SkeletonSeplag`,description:`Componente de placeholders para estados de carregamento, com presets prontos e opções de customização para layouts específicos.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { SkeletonSeplag } from "@seplag/ui-lib-react-18";`,sections:u,props:d})}export{f as default};