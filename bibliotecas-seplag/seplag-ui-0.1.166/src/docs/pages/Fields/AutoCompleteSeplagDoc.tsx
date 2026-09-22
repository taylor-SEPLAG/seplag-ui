import { useState } from "react";
import { DocPage, type DocProp, type DocSection } from "../../components/DocPage";
import { AutoCompleteSeplag } from "@componentes/AutoComplete";
import "primereact/resources/themes/saga-blue/theme.css";

type PessoaMock = {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  dataNascimento: string;
};

const pessoasMock: PessoaMock[] = [
  {
    id: 1,
    nome: "Ana Beatriz Oliveira",
    cpf: "123.456.789-00",
    matricula: "874521",
    dataNascimento: "12/03/1989",
  },
  {
    id: 2,
    nome: "Ana Carolina Lima",
    cpf: "987.654.321-00",
    matricula: "741258",
    dataNascimento: "27/09/1991",
  },
  {
    id: 3,
    nome: "Ana Clara Souza",
    cpf: "456.123.789-55",
    matricula: "963852",
    dataNascimento: "05/11/1985",
  },
  {
    id: 4,
    nome: "Ana Luiza Martins",
    cpf: "741.852.963-11",
    matricula: "159357",
    dataNascimento: "18/01/1993",
  },
  {
    id: 5,
    nome: "Ana Paula Rocha",
    cpf: "258.369.147-22",
    matricula: "456123",
    dataNascimento: "21/06/1990",
  },
  {
    id: 6,
    nome: "Bruno Henrique Costa",
    cpf: "369.258.147-33",
    matricula: "852741",
    dataNascimento: "14/02/1988",
  },
  {
    id: 7,
    nome: "Ana Clara Silva",
    cpf: "111.222.333-44",
    matricula: "874531",
    dataNascimento: "03/08/1992",
  },
  {
    id: 8,
    nome: "Ana Maria Braga",
    cpf: "222.333.444-55",
    matricula: "874532",
    dataNascimento: "17/10/1987",
  },
  {
    id: 9,
    nome: "Ana Paula Souza",
    cpf: "333.444.555-66",
    matricula: "874533",
    dataNascimento: "29/05/1991",
  },
];

function renderPessoaItem(pessoa: PessoaMock) {
  return (
    <div>
      <div className="font-medium">{pessoa.nome}</div>
      <small className="text-600">
        {pessoa.cpf} • Matrícula {pessoa.matricula}
      </small>
    </div>
  );
}

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replaceAll(/[^\w\s]/g, "")
    .toLowerCase()
    .trim();
}

function filtrarPessoasMock(query: string) {
  const termo = normalizarTexto(query);

  if (termo.length < 3) {
    return [];
  }

  return pessoasMock.filter((pessoa) => {
    const indiceBusca = [pessoa.nome, pessoa.cpf, pessoa.matricula].map(normalizarTexto).join(" ");

    return indiceBusca.includes(termo);
  });
}

function BasicExample() {
  const [value, setValue] = useState<PessoaMock | string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<PessoaMock[]>([]);

  const helpText = "teste texto de ajuda";

  const buscarPessoas = (query: string) => {
    setSuggestions(filtrarPessoasMock(query));
  };

  return (
    <div className="grid" style={{ width: "100%" }}>
      <div className="col-12 md:col-8">
        <AutoCompleteSeplag<PessoaMock>
          value={value}
          suggestions={suggestions}
          completeMethod={buscarPessoas}
          ShowClearSelection
          componentSize="md"
          helpText={helpText}
          maxRenderedItems={10}
          minWidth="25rem"
          onChange={(event) => {
            setValue(event.value ?? undefined);
          }}
          field="nome"
          dropdown
          dropdownMode="current"
          placeholder="Digite nome, CPF ou matrícula"
          emptyMessage="Nenhum registro localizado"
          showEmptyMessage
          itemTemplate={renderPessoaItem}
        />
      </div>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "Wrapper leve do AutoComplete do PrimeReact. A estratégia de busca fica com o consumidor: você implementa a consulta no completeMethod e controla as sugestões retornadas.",
    example: <BasicExample />,
    code: `import { useState } from "react";
import { AutoCompleteSeplag } from "@seplag/ui-lib-react-18";

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

<AutoCompleteSeplag
  value={value}
  suggestions={items}
  completeMethod={search}
  ShowClearSelection
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
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "value",
    type: "T | string | null",
    required: false,
    description: "Valor controlado do campo.",
  },
  {
    name: "suggestions",
    type: "T[]",
    required: false,
    description: "Lista de sugestões exibida no painel.",
  },
  {
    name: "completeMethod",
    type: "(query: string) => void | Promise<void>",
    required: false,
    description: "Callback para consultas manuais, inclusive no clique do botão dropdown.",
  },
  {
    name: "onChange",
    type: "(event) => void",
    required: false,
    description:
      "Evento de mudança controlado pelo consumidor. É o lugar recomendado para decidir quando buscar ou limpar sugestões.",
  },
  {
    name: "field",
    type: "string",
    required: false,
    description: "Campo do objeto de sugestão usado como texto padrão.",
  },
  {
    name: "dropdown",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Exibe o botão lateral do AutoComplete.",
  },
  {
    name: "dropdownMode",
    type: '"blank" | "current"',
    defaultValue: '"blank"',
    required: false,
    description: "Define se o botão lateral consulta vazio ou com o valor atual do input.",
  },
  {
    name: "ShowClearSelection",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Exibe o botão x para limpar o item selecionado quando houver um valor selecionado.",
  },
  {
    name: "componentSize",
    type: '"sm" | "md" | "lg"',
    defaultValue: '"md"',
    required: false,
    description: "Controla o tamanho visual do input e do botão dropdown.",
  },
  {
    name: "helpText",
    type: "ReactNode",
    required: false,
    description:
      "Texto de ajuda exibido abaixo do componente. Pode ser string vazia para não renderizar nada.",
  },
  {
    name: "minWidth",
    type: "string | number",
    required: false,
    description:
      "Define a largura mínima do componente na raiz, preservando outros estilos passados em style.",
  },
  {
    name: "maxRenderedItems",
    type: "number",
    defaultValue: "50",
    required: false,
    description:
      "Limita quantas sugestões são repassadas ao componente por render para evitar travamentos com listas muito grandes.",
  },
  {
    name: "itemTemplate",
    type: "(item: T) => ReactNode",
    required: false,
    description: "Template opcional para customizar cada sugestão.",
  },
  {
    name: "placeholder",
    type: "string",
    required: false,
    description: "Texto exibido enquanto o campo está vazio.",
  },
  {
    name: "emptyMessage",
    type: "string",
    required: false,
    description: "Mensagem exibida quando não há sugestões.",
  },
  {
    name: "showEmptyMessage",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Controla a exibição da mensagem de lista vazia.",
  },
];

export default function AutoCompleteSeplagDoc() {
  return (
    <DocPage
      title="AutoCompleteSeplag"
      description="Autocomplete reutilizável para cenários controlados pelo consumidor, sem acoplamento com react-hook-form."
      badge="Novo"
      since="v0.0.17"
      sections={sections}
      props={props}
    />
  );
}
