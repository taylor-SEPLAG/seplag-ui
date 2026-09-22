import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { ListaSimplesSeplag } from "@componentes/ListaSimples";
import { useMemo, useState } from "react";

type CandidatoDemo = {
  id: string;
  nome: string;
  situacao: string;
  pontuacao: number;
};

const candidatosDemo: CandidatoDemo[] = [
  { id: "1", nome: "Maria Silva", situacao: "Classificado", pontuacao: 87.5 },
  { id: "2", nome: "Joao Souza", situacao: "Classificado", pontuacao: 82.1 },
  { id: "3", nome: "Ana Costa", situacao: "Desclassificado", pontuacao: 45.0 },
  { id: "4", nome: "Pedro Lima", situacao: "Classificado", pontuacao: 79.4 },
];

function ListaSimplesPlayground() {
  const [termo, setTermo] = useState("");
  const [showHeader, setShowHeader] = useState(true);

  const filtrados = useMemo(() => {
    const t = termo.trim().toLowerCase();
    if (!t) return candidatosDemo;
    return candidatosDemo.filter((c) => c.nome.toLowerCase().includes(t));
  }, [termo]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Filtrar por nome"
          style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.9rem" }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <input type="checkbox" checked={showHeader} onChange={(e) => setShowHeader(e.target.checked)} />
          showHeader
        </label>
      </div>

      <ListaSimplesSeplag<CandidatoDemo>
        items={filtrados}
        getKey={(item) => item.id}
        showHeader={showHeader}
        columns={[
          { header: "Nome", field: "nome" },
          { header: "Situação", field: "situacao", width: "140px" },
          {
            header: "Pontuação",
            body: (item) => item.pontuacao.toFixed(1),
            width: "100px",
          },
        ]}
        emptyMessage="Nenhum candidato encontrado."
        maxHeight="14rem"
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Filtre a lista digitando um nome e alterne a exibição do cabeçalho de colunas.",
    example: <ListaSimplesPlayground />,
    code: `import { useMemo, useState } from "react";
import { ListaSimplesSeplag } from "@seplag/ui-lib-react-18";

const [termo, setTermo] = useState("");

const filtrados = useMemo(
  () => candidatos.filter((c) => c.nome.toLowerCase().includes(termo.toLowerCase())),
  [termo],
);

<ListaSimplesSeplag
  items={filtrados}
  getKey={(item) => item.id}
  columns={[
    { header: "Nome", field: "nome" },
    { header: "Situação", field: "situacao", width: "140px" },
    { header: "Pontuação", body: (item) => item.pontuacao.toFixed(1), width: "100px" },
  ]}
  emptyMessage="Nenhum candidato encontrado."
/>`,
  },
  {
    title: "Modo lista simples (renderItem)",
    description:
      "Sem columns, use renderItem para controle total do conteúdo de cada linha — útil para listas sem estrutura tabular.",
    example: (
      <ListaSimplesSeplag<CandidatoDemo>
        items={candidatosDemo}
        getKey={(item) => item.id}
        renderItem={(item) => (
          <div>
            <strong>{item.nome}</strong>
            <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
              {item.situacao} · {item.pontuacao.toFixed(1)} pontos
            </div>
          </div>
        )}
        maxHeight="12rem"
      />
    ),
    code: `<ListaSimplesSeplag
  items={candidatos}
  getKey={(item) => item.id}
  renderItem={(item) => (
    <div>
      <strong>{item.nome}</strong>
      <div>{item.situacao} · {item.pontuacao.toFixed(1)} pontos</div>
    </div>
  )}
/>`,
  },
  {
    title: "Lista vazia",
    description: "Quando items está vazio, exibe emptyMessage.",
    example: (
      <ListaSimplesSeplag<CandidatoDemo>
        items={[]}
        getKey={(item) => item.id}
        columns={[{ header: "Nome", field: "nome" }]}
        emptyMessage="Nenhum candidato cadastrado."
      />
    ),
    code: `<ListaSimplesSeplag
  items={[]}
  getKey={(item) => item.id}
  columns={[{ header: "Nome", field: "nome" }]}
  emptyMessage="Nenhum candidato cadastrado."
/>`,
  },
];

const props: DocProp[] = [
  { name: "id", type: "string", defaultValue: '"lista-simples"', description: "Identificador HTML do container (e base de data-testid)." },
  { name: "items", type: "readonly T[]", required: true, description: "Lista de itens exibida." },
  { name: "getKey", type: "(item: T) => string | number", required: true, description: "Função para obter a chave única de cada item." },
  { name: "renderItem", type: "(item: T) => ReactNode", description: "Renderiza o conteúdo de cada linha quando columns não é informado." },
  {
    name: "columns",
    type: "ColumnMetaListaSimplesSeplag<T>[]",
    description:
      "Define colunas em grid (header, field, body, width). Quando informado, tem prioridade sobre renderItem e ativa o layout em grid com cabeçalho opcional.",
  },
  { name: "showHeader", type: "boolean", defaultValue: "true", description: "Exibe o cabeçalho de colunas (somente quando columns é informado)." },
  { name: "emptyMessage", type: "string", defaultValue: '"Nenhum registro encontrado."', description: "Mensagem exibida quando items está vazio." },
  { name: "minHeight", type: "string", description: "Altura mínima da área de itens." },
  { name: "maxHeight", type: "string", defaultValue: '"16rem"', description: "Altura máxima da área de itens, com scroll vertical." },
  { name: "style", type: "CSSProperties", description: "Estilo inline do container principal." },
  { name: "itemStyle", type: "CSSProperties", description: "Estilo inline aplicado a cada linha." },
];

export default function ListaSimplesDoc() {
  return (
    <DocPage
      title="ListaSimples"
      badge="Estável"
      since="v0.1.153"
      description="Lista genérica leve para exibir coleções de itens, em modo colunas (grid com cabeçalho) ou modo livre via renderItem. Sem paginação, ordenação ou seleção — para isso use TablePaginado."
      importStatement={`import { ListaSimplesSeplag } from "@seplag/ui-lib-react-18";
import type { ListaSimplesSeplagProps, ColumnMetaListaSimplesSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
