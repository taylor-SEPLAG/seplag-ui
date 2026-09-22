import { useState } from "react";
import { useForm } from "react-hook-form";
import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { SearchFieldSeplag } from "@componentes/Fields";
import "primereact/resources/themes/saga-blue/theme.css";

const pessoas = [
  { id: 1, nome: "Ana Silva" },
  { id: 2, nome: "Bruno Costa" },
  { id: 3, nome: "Carlos Souza" },
  { id: 4, nome: "Diana Ferreira" },
  { id: 5, nome: "Eduardo Lima" },
  { id: 6, nome: "Fernanda Oliveira" },
  { id: 7, nome: "Gabriel Santos" },
  { id: 8, nome: "Helena Rocha" },
];

function BasicExample() {
  const { control } = useForm({ defaultValues: { pessoa: "" } });
  const [sugestoes, setSugestoes] = useState<typeof pessoas>([]);

  const buscar = (query: string) => {
    const q = query.toLowerCase();
    setSugestoes(pessoas.filter((p) => p.nome.toLowerCase().includes(q)));
  };

  return (
    <div className="grid" style={{ width: "100%"}}>
      <SearchFieldSeplag
        name="pessoa"
        control={control}
        label="Pesquisar Pessoa"
        placeholder="Digite ao menos 1 caractere..."
        fieldLabel="nome"
        items={sugestoes}
        minLength={1}
        search={buscar}
        cols="12"
      />
    </div>
  );
}

function DelayExample() {
  const { control } = useForm({ defaultValues: { servidor: "" } });
  const [sugestoes, setSugestoes] = useState<typeof pessoas>([]);
  const [chamadas, setChamadas] = useState(0);

  const buscar = (query: string) => {
    setChamadas((n) => n + 1);
    const q = query.toLowerCase();
    setSugestoes(pessoas.filter((p) => p.nome.toLowerCase().includes(q)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      <div className="grid" style={{ width: "100%" }}>
        <SearchFieldSeplag
          name="servidor"
          control={control}
          label="Buscar Servidor"
          placeholder="Digite para buscar..."
          fieldLabel="nome"
          items={sugestoes}
          minLength={1}
          search={buscar}
          cols="12"
        />
      </div>
      <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
        Chamadas à função <code>search</code>: <strong>{chamadas}</strong> — o debounce de 300ms evita disparos a cada tecla.
      </p>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      "AutoComplete com busca assíncrona. A função search é chamada com debounce de 300ms após o usuário parar de digitar, evitando requisições excessivas à API.",
    example: <BasicExample />,
    code: `import { useState } from "react";
import { useForm } from "react-hook-form";
import { SearchFieldSeplag } from "@seplag/ui-lib-react-18";

const { control } = useForm();
const [sugestoes, setSugestoes] = useState([]);

const buscar = async (query: string) => {
  const resultado = await api.buscarPessoas(query);
  setSugestoes(resultado);
};

<SearchFieldSeplag
  name="pessoa"
  control={control}
  label="Pesquisar Pessoa"
  placeholder="Digite para buscar..."
  fieldLabel="nome"
  items={sugestoes}
  minLength={3}
  search={buscar}
  cols="12 6"
/>`,
  },
  {
    title: "Debounce automático",
    description:
      "O componente aguarda 300ms após a última tecla antes de chamar search. Digite rapidamente e observe que o contador de chamadas não incrementa a cada tecla.",
    example: <DelayExample />,
    code: `// Não é necessário configurar nada — o debounce de 300ms é aplicado automaticamente.
// Sem debounce, digitar "João" dispararia 4 chamadas à API.
// Com debounce, dispara apenas 1 (quando o usuário para de digitar).

<SearchFieldSeplag
  name="servidor"
  control={control}
  label="Buscar Servidor"
  fieldLabel="nome"
  items={sugestoes}
  minLength={1}
  search={async (query) => {
    const resultado = await api.buscarServidores(query);
    setSugestoes(resultado);
  }}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "name",
    type: "Path<TForm>",
    required: true,
    description: "Nome do campo no formulário.",
  },
  {
    name: "control",
    type: "Control<TForm>",
    required: false,
    description: "Objeto control do useForm. Quando omitido, funciona como input simples.",
  },
  {
    name: "rules",
    type: "RegisterOptions<TForm, Path<TForm>>",
    required: false,
    description: "Validações customizadas (required, minLength, validate, etc).",
  },
  {
    name: "items",
    type: "SuggestionSeplag<TItem>[]",
    required: true,
    description: "Lista de sugestões retornadas pela busca e exibidas no dropdown.",
  },
  {
    name: "search",
    type: "(query: string) => void",
    required: true,
    description: "Função chamada quando o usuário digita (com debounce de 300ms). Deve atualizar items com os resultados.",
  },
  {
    name: "fieldLabel",
    type: "string",
    required: false,
    description: "Propriedade do objeto de sugestão usada como texto exibido no campo e na lista.",
  },
  {
    name: "onSelect",
    type: "(item: TItem) => void",
    required: false,
    description: "Callback disparado quando o usuário seleciona um item da lista.",
  },
  {
    name: "label",
    type: "string",
    required: false,
    description: "Rótulo exibido acima do campo.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12 6"',
    required: false,
    description: "Largura via grid SEPLAG (ex: \"12 6\" → 12 colunas mobile, 6 desktop).",
  },
  {
    name: "required",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Torna o campo obrigatório.",
  },
  {
    name: "disabled",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Desabilita o campo.",
  },
  {
    name: "visible",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Quando false, oculta o campo.",
  },
  {
    name: "placeholder",
    type: "string",
    defaultValue: '""',
    required: false,
    description: "Texto de placeholder.",
  },
  {
    name: "minLength",
    type: "number",
    defaultValue: "3",
    required: false,
    description: "Número mínimo de caracteres para disparar a busca.",
  },
  {
    name: "maxLength",
    type: "number",
    required: false,
    description: "Número máximo de caracteres permitidos no input.",
  },
  {
    name: "forceSelection",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Quando true, limpa o campo se o usuário não selecionar um item da lista.",
  },
  {
    name: "itemTemplate",
    type: "(item: TItem) => ReactNode",
    required: false,
    description: "Template customizado para cada item da lista de sugestões.",
  },
  {
    name: "getFormErrorMessage",
    type: "(name: string) => ReactNode",
    required: false,
    deprecated: true,
    deprecationMessage:
      "DEPRECATED — Use react-hook-form error handling (fieldState.error) ou passe validações via `rules`",
    description:
      "Compatibilidade legada: quando retorna um nó válido, tem prioridade sobre o erro interno do react-hook-form.",
  },
  {
    name: "autoComplete",
    type: "string",
    required: false,
    description:
      "Atributo HTML autocomplete repassado ao input. Por padrão o autocomplete do navegador " +
      "fica ativo; passe autoComplete=\"off\" para desativá-lo.",
  },
];

export default function SearchFieldDoc() {
  return (
    <DocPage
      title="SearchField"
      description="Campo de busca com autocompletar (AutoComplete do PrimeReact). Ideal para buscar registros via API enquanto o usuário digita. O debounce de 300ms é aplicado automaticamente para evitar chamadas excessivas."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
