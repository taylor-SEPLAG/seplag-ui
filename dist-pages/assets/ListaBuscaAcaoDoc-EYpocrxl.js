import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";import{t as r}from"./ListaBuscaAcao-CWsrDvQV.js";import{t as i}from"./DocPage-DfNa9OED.js";var a=e(t(),1),o=n(),s=[{id:`1`,nome:`Maria Silva`,cpf:`123.456.789-00`,matricula:`MAT-000001`},{id:`2`,nome:`Joao Souza`,cpf:`987.654.321-00`,matricula:`MAT-000002`},{id:`3`,nome:`Ana Costa`,cpf:`111.222.333-44`,matricula:`MAT-000003`}];function c(){let[e,t]=(0,a.useState)(``),[n,i]=(0,a.useState)(null),c=(0,a.useMemo)(()=>{let t=e.trim().toLowerCase();return t?s.filter(e=>[e.nome,e.cpf,e.matricula].join(` `).toLowerCase().includes(t)):s},[e]);return(0,o.jsxs)(`div`,{style:{width:`100%`},children:[(0,o.jsxs)(`div`,{style:{marginBottom:`0.75rem`},children:[(0,o.jsx)(`label`,{htmlFor:`lista-busca-acao-playground-input`,style:{display:`block`,fontWeight:600,marginBottom:`0.25rem`},children:`Buscar servidor (nome, CPF ou matricula)`}),(0,o.jsx)(`input`,{id:`lista-busca-acao-playground-input`,type:`text`,value:e,onChange:e=>t(e.target.value),placeholder:`Digite um termo para buscar`,style:{width:`100%`,maxWidth:`520px`,border:`1px solid #cbd5e1`,borderRadius:`6px`,padding:`0.5rem 0.75rem`,fontSize:`0.9rem`}})]}),(0,o.jsx)(r,{items:c,getKey:e=>e.id,getTitle:e=>e.nome,getDescription:e=>`CPF: ${e.cpf} - Matricula: ${e.matricula}`,onAction:e=>i(e),actionLabel:`Selecionar`,emptyMessage:`Nenhum servidor encontrado para este termo.`,maxItems:8}),(0,o.jsx)(`div`,{style:{marginTop:`0.75rem`,border:`1px solid #e2e8f0`,borderRadius:`6px`,background:`#f8fafc`,padding:`0.75rem`,maxWidth:`520px`},children:n?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(`div`,{style:{fontWeight:600,marginBottom:`0.25rem`},children:`Informacoes selecionadas`}),(0,o.jsxs)(`div`,{children:[`Nome: `,n.nome]}),(0,o.jsxs)(`div`,{children:[`CPF: `,n.cpf]}),(0,o.jsxs)(`div`,{children:[`Matricula: `,n.matricula]})]}):(0,o.jsx)(`div`,{style:{color:`#64748b`},children:`Nenhum servidor selecionado.`})})]})}var l=[{title:`Playground`,description:`Exemplo interativo com busca em tempo real e retorno dos dados do item selecionado.`,example:(0,o.jsx)(c,{}),code:`import { useMemo, useState } from "react";
import { ListaBuscaAcaoSeplag } from "@seplag/ui-lib-react-18";

const [termoBusca, setTermoBusca] = useState("");
const [selecionado, setSelecionado] = useState<Servidor | null>(null);

const resultados = useMemo(() => {
  const termo = termoBusca.trim().toLowerCase();
  if (!termo) return [];
  return servidores.filter((item) =>
    [item.nome, item.cpf, item.matricula].join(" ").toLowerCase().includes(termo),
  );
}, [termoBusca]);

<>
  <input value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />

  <ListaBuscaAcaoSeplag
    items={resultados}
    getKey={(item) => item.id}
    getTitle={(item) => item.nome}
    getDescription={(item) =>
      \`CPF: \${item.cpf ?? "-"} - Matricula: \${item.matricula ?? "-"}\`
    }
    onAction={(item) => setSelecionado(item)}
    actionLabel="Selecionar"
  />

  {selecionado && <div>Nome: {selecionado.nome}</div>}
</>`},{title:`Uso basico`,description:`Lista resultados de busca com botao de acao por item. Ideal para fluxos de adicionar/remover itens em dialogs e formularios.`,example:(0,o.jsx)(r,{items:s,getKey:e=>e.id,getTitle:e=>e.nome,getDescription:e=>`CPF: ${e.cpf} - Matricula: ${e.matricula}`,onAction:e=>alert(`Adicionar: ${e.nome}`),actionLabel:`Adicionar`,maxItems:5}),code:`import { ListaBuscaAcaoSeplag } from "@seplag/ui-lib-react-18";

type Servidor = {
  id: string;
  nome: string;
  cpf?: string;
  matricula?: string;
};

<ListaBuscaAcaoSeplag<Servidor>
  items={resultados}
  getKey={(item) => item.id}
  getTitle={(item) => item.nome}
  getDescription={(item) =>
    \`CPF: \${item.cpf ?? "-"} - Matricula: \${item.matricula ?? "-"}\`
  }
  onAction={handleAdicionar}
  actionLabel="Adicionar"
/>`},{title:`Acao customizada`,description:`Use renderAction para substituir o botao padrao por qualquer elemento React.`,example:(0,o.jsx)(r,{items:s.slice(0,2),getKey:e=>e.id,getTitle:e=>e.nome,onAction:()=>{},renderAction:(e,t)=>(0,o.jsx)(`button`,{type:`button`,onClick:()=>t(e),style:{border:`1px solid #cbd5e1`,borderRadius:6,background:`#fff`,padding:`0.35rem 0.7rem`,cursor:`pointer`},children:`Selecionar`})}),code:`<ListaBuscaAcaoSeplag
  items={resultados}
  getKey={(item) => item.id}
  getTitle={(item) => item.nome}
  onAction={handleSelecionar}
  renderAction={(item, action) => (
    <button type="button" onClick={() => action(item)}>
      Selecionar
    </button>
  )}
/>`}],u=[{name:`items`,type:`readonly T[]`,required:!0,description:`Lista de itens que sera exibida.`},{name:`getKey`,type:`(item: T) => string | number`,required:!0,description:`Funcao para obter a chave unica de cada item.`},{name:`getTitle`,type:`(item: T) => ReactNode`,required:!0,description:`Renderiza o titulo principal de cada linha.`},{name:`getDescription`,type:`(item: T) => ReactNode`,description:`Renderiza uma descricao secundaria abaixo do titulo.`},{name:`onAction`,type:`(item: T) => void`,required:!0,description:`Callback executado ao acionar um item.`},{name:`renderAction`,type:`(item: T, action: (item: T) => void) => ReactNode`,description:`Permite substituir o botao padrao por acao customizada.`},{name:`actionLabel`,type:`string`,description:`Texto do botao padrao de acao.`},{name:`emptyMessage`,type:`string`,description:`Mensagem exibida quando nao ha resultados.`},{name:`maxHeight`,type:`string`,description:`Altura maxima da lista com scroll vertical.`},{name:`maxItems`,type:`number`,description:`Limite maximo de itens renderizados.`},{name:`style`,type:`CSSProperties`,description:`Estilo inline do container da lista.`},{name:`itemStyle`,type:`CSSProperties`,description:`Estilo inline aplicado a cada item da lista.`},{name:`keepInfoInOneLine`,type:`boolean`,description:`Quando true, titulo e descricao ficam em uma unica linha com ellipsis.`}];function d(){return(0,o.jsx)(i,{title:`ListaBuscaAcao`,badge:`Estavel`,since:`v0.0.1`,description:`Componente generico para listar resultados de busca com uma acao por linha.`,importStatement:`import { ListaBuscaAcaoSeplag } from "@seplag/ui-lib-react-18";
import type { ListaBuscaAcaoSeplagProps } from "@seplag/ui-lib-react-18";`,sections:l,props:u})}export{d as default};