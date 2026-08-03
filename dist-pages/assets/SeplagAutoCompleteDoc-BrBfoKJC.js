import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{t as r}from"./AutoComplete-DWQPbsI2.js";import{t as i}from"./DocPage-DfNa9OED.js";var a=e(t(),1),o=n(),s=[{id:1,nome:`Ana Beatriz Oliveira`,cpf:`123.456.789-00`,matricula:`874521`,dataNascimento:`12/03/1989`},{id:2,nome:`Ana Carolina Lima`,cpf:`987.654.321-00`,matricula:`741258`,dataNascimento:`27/09/1991`},{id:3,nome:`Ana Clara Souza`,cpf:`456.123.789-55`,matricula:`963852`,dataNascimento:`05/11/1985`},{id:4,nome:`Ana Luiza Martins`,cpf:`741.852.963-11`,matricula:`159357`,dataNascimento:`18/01/1993`},{id:5,nome:`Ana Paula Rocha`,cpf:`258.369.147-22`,matricula:`456123`,dataNascimento:`21/06/1990`},{id:6,nome:`Bruno Henrique Costa`,cpf:`369.258.147-33`,matricula:`852741`,dataNascimento:`14/02/1988`},{id:7,nome:`Ana Clara Silva`,cpf:`111.222.333-44`,matricula:`874531`,dataNascimento:`03/08/1992`},{id:8,nome:`Ana Maria Braga`,cpf:`222.333.444-55`,matricula:`874532`,dataNascimento:`17/10/1987`},{id:9,nome:`Ana Paula Souza`,cpf:`333.444.555-66`,matricula:`874533`,dataNascimento:`29/05/1991`}];function c(e){return(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`div`,{className:`font-medium`,children:e.nome}),(0,o.jsxs)(`small`,{className:`text-600`,children:[e.cpf,` • Matrícula `,e.matricula]})]})}function l(e){return e.normalize(`NFD`).replaceAll(/[^\w\s]/g,``).toLowerCase().trim()}function u(e){let t=l(e);return t.length<3?[]:s.filter(e=>[e.nome,e.cpf,e.matricula].map(l).join(` `).includes(t))}function d(){let[e,t]=(0,a.useState)(void 0),[n,i]=(0,a.useState)([]);return(0,o.jsx)(`div`,{className:`grid`,style:{width:`100%`},children:(0,o.jsx)(`div`,{className:`col-12 md:col-8`,children:(0,o.jsx)(r,{value:e,suggestions:n,completeMethod:e=>{i(u(e))},componentSize:`md`,helpText:`teste texto de ajuda`,maxRenderedItems:10,minWidth:`25rem`,onChange:e=>{t(e.value??void 0)},field:`nome`,dropdown:!0,dropdownMode:`current`,placeholder:`Digite nome, CPF ou matrícula`,emptyMessage:`Nenhum registro localizado`,showEmptyMessage:!0,itemTemplate:c})})})}var f=[{title:`Uso básico`,description:`Wrapper leve do AutoComplete do PrimeReact. A estratégia de busca fica com o consumidor: você implementa a consulta no completeMethod e controla as sugestões retornadas.`,example:(0,o.jsx)(d,{}),code:`import { useState } from "react";
import { SeplagAutoComplete } from "@seplag/ui-lib-react-18";

type Pessoa = {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
};

const pessoasMock = [
  { id: 1, nome: "Ana Beatriz Oliveira", cpf: "109.876.543-21", matricula: "874521" },
  { id: 2, nome: "Ana Carolina Mendes", cpf: "210.987.654-32", matricula: "874522" },
  { id: 3, nome: "Ana Júlia Vasconcelos", cpf: "321.098.765-43", matricula: "874523" },
  { id: 5, nome: "Ana Luísa Guimarães", cpf: "543.210.987-65", matricula: "874525" },
  { id: 6, nome: "Bruno Henrique Costa", cpf: "234.567.890-12", matricula: "741258" },
  { id: 7, nome: "Carlos Eduardo Santos", cpf: "345.678.901-23", matricula: "159357" },
  { id: 8, nome: "Daniela Souza Lima", cpf: "456.789.012-34", matricula: "951753" },
  { id: 9, nome: "Eduardo Ribeiro Silva", cpf: "567.890.123-45", matricula: "357951" },
  { id: 10, nome: "Fernanda Alves Pereira", cpf: "678.901.234-56", matricula: "258147" } 
];

const renderPessoaItem = (pessoa: Pessoa) => (
  <div>
    <div className="font-medium">{pessoa.nome}</div>
    <small className="text-600">
      {pessoa.cpf} • Matrícula {pessoa.matricula}
    </small>
  </div>
);



const [value, setValue] = useState<Pessoa | string | null>(null);
const [items, setItems] = useState<typeof pessoasMock>([]);

const search = (query: string) => {
  const termo = query.trim().toLowerCase();

  if (termo.length < 3) {
    setItems([]);
    return;
  }

  setItems(
    pessoasMock.filter((pessoa) =>
      [pessoa.nome, pessoa.cpf, pessoa.matricula]
        .join(" ")
        .toLowerCase()
        .includes(termo),
    ),
  );
};

const helpText =  "teste texto de ajuda";

<SeplagAutoComplete
  value={value}
  suggestions={items}
  completeMethod={search}
  componentSize="lg"
  helpText={helpText}
  maxRenderedItems={30}
  minWidth="28rem"
  onChange={(e) => {
    setValue(e.value ?? null);
  }}
  field="nome"
  dropdown
  dropdownMode="current"
  placeholder="Digite nome, CPF ou matrícula"
  itemTemplate={renderPessoaItem}
/>`}],p=[{name:`value`,type:`T | string | null`,required:!1,description:`Valor controlado do campo.`},{name:`suggestions`,type:`T[]`,required:!1,description:`Lista de sugestões exibida no painel.`},{name:`completeMethod`,type:`(query: string) => void | Promise<void>`,required:!1,description:`Callback para consultas manuais, inclusive no clique do botão dropdown.`},{name:`onChange`,type:`(event) => void`,required:!1,description:`Evento de mudança controlado pelo consumidor. É o lugar recomendado para decidir quando buscar ou limpar sugestões.`},{name:`field`,type:`string`,required:!1,description:`Campo do objeto de sugestão usado como texto padrão.`},{name:`dropdown`,type:`boolean`,defaultValue:`false`,required:!1,description:`Exibe o botão lateral do AutoComplete.`},{name:`dropdownMode`,type:`"blank" | "current"`,defaultValue:`"blank"`,required:!1,description:`Define se o botão lateral consulta vazio ou com o valor atual do input.`},{name:`componentSize`,type:`"sm" | "md" | "lg"`,defaultValue:`"md"`,required:!1,description:`Controla o tamanho visual do input e do botão dropdown.`},{name:`helpText`,type:`ReactNode`,required:!1,description:`Texto de ajuda exibido abaixo do componente. Pode ser string vazia para não renderizar nada.`},{name:`minWidth`,type:`string | number`,required:!1,description:`Define a largura mínima do componente na raiz, preservando outros estilos passados em style.`},{name:`maxRenderedItems`,type:`number`,defaultValue:`50`,required:!1,description:`Limita quantas sugestões são repassadas ao componente por render para evitar travamentos com listas muito grandes.`},{name:`itemTemplate`,type:`(item: T) => ReactNode`,required:!1,description:`Template opcional para customizar cada sugestão.`},{name:`placeholder`,type:`string`,required:!1,description:`Texto exibido enquanto o campo está vazio.`},{name:`emptyMessage`,type:`string`,required:!1,description:`Mensagem exibida quando não há sugestões.`},{name:`showEmptyMessage`,type:`boolean`,defaultValue:`false`,required:!1,description:`Controla a exibição da mensagem de lista vazia.`}];function m(){return(0,o.jsx)(i,{title:`SeplagAutoComplete`,description:`Autocomplete reutilizável para cenários controlados pelo consumidor, sem acoplamento com react-hook-form.`,badge:`Novo`,since:`v0.0.17`,sections:f,props:p})}export{m as default};