import{t as e}from"./jsx-runtime--AOyvnT1.js";import{t}from"./AppFooter-DknZyPjO.js";import{t as n}from"./DocPage-DfNa9OED.js";var r=e(),i=[{title:`Uso básico`,description:"Rodapé com texto simples via prop `text`.",example:(0,r.jsx)(t,{text:`© 2026 SEPLAG – MT. Todos os direitos reservados.`}),code:`import { AppFooterSeplag } from "@seplag/ui-lib-react-18";

<AppFooterSeplag text="© 2026 SEPLAG – MT. Todos os direitos reservados." />`},{title:`Com conteúdo customizado`,description:"Passe qualquer elemento como `children` para substituir o texto padrão.",example:(0,r.jsx)(t,{children:(0,r.jsxs)(`span`,{children:[(0,r.jsx)(`strong`,{children:`SEPLAG`}),` — Secretaria de Estado de Planejamento e Gestão \xA0|\xA0 v1.0.0`]})}),code:`import { AppFooterSeplag } from "@seplag/ui-lib-react-18";

<AppFooterSeplag>
  <span>
    <strong>SEPLAG</strong> — Secretaria de Estado de Planejamento e Gestão | v1.0.0
  </span>
</AppFooterSeplag>`}],a=[{name:`text`,type:`string`,description:"Texto exibido no rodapé. Ignorado quando `children` é fornecido."},{name:`children`,type:`ReactNode`,description:"Conteúdo personalizado do rodapé. Substitui o `text` quando presente."}];function o(){return(0,r.jsx)(n,{title:`AppFooter`,description:`Componente de rodapé do layout principal da aplicação. Exibe um texto de copyright ou conteúdo customizado via children.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { AppFooterSeplag } from "@seplag/ui-lib-react-18";`,sections:i,props:a})}export{o as default};