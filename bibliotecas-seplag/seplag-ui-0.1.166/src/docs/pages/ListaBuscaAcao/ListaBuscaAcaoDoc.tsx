import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { ListaBuscaAcaoSeplag } from "@componentes/ListaBuscaAcao";
import { useMemo, useState } from "react";

type ServidorDemo = {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
};

const servidoresDemo: ServidorDemo[] = [
  {
    id: "1",
    nome: "Maria Silva",
    cpf: "123.456.789-00",
    matricula: "MAT-000001",
  },
  {
    id: "2",
    nome: "Joao Souza",
    cpf: "987.654.321-00",
    matricula: "MAT-000002",
  },
  {
    id: "3",
    nome: "Ana Costa",
    cpf: "111.222.333-44",
    matricula: "MAT-000003",
  },
];

function ListaBuscaAcaoPlayground() {
  const [termoBusca, setTermoBusca] = useState("");
  const [selecionado, setSelecionado] = useState<ServidorDemo | null>(null);

  const resultados = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase();
    if (!termo) return servidoresDemo;

    return servidoresDemo.filter((item) =>
      [item.nome, item.cpf, item.matricula].join(" ").toLowerCase().includes(termo),
    );
  }, [termoBusca]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "0.75rem" }}>
        <label
          htmlFor="lista-busca-acao-playground-input"
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: "0.25rem",
          }}
        >
          Buscar servidor (nome, CPF ou matricula)
        </label>
        <input
          id="lista-busca-acao-playground-input"
          type="text"
          value={termoBusca}
          onChange={(event) => setTermoBusca(event.target.value)}
          placeholder="Digite um termo para buscar"
          style={{
            width: "100%",
            maxWidth: "520px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "0.5rem 0.75rem",
            fontSize: "0.9rem",
          }}
        />
      </div>

      <ListaBuscaAcaoSeplag<ServidorDemo>
        items={resultados}
        getKey={(item) => item.id}
        getTitle={(item) => item.nome}
        getDescription={(item) => `CPF: ${item.cpf} - Matricula: ${item.matricula}`}
        onAction={(item) => setSelecionado(item)}
        actionLabel="Selecionar"
        emptyMessage="Nenhum servidor encontrado para este termo."
        maxItems={8}
      />

      <div
        style={{
          marginTop: "0.75rem",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          background: "#f8fafc",
          padding: "0.75rem",
          maxWidth: "520px",
        }}
      >
        {selecionado ? (
          <>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Informacoes selecionadas</div>
            <div>Nome: {selecionado.nome}</div>
            <div>CPF: {selecionado.cpf}</div>
            <div>Matricula: {selecionado.matricula}</div>
          </>
        ) : (
          <div style={{ color: "#64748b" }}>Nenhum servidor selecionado.</div>
        )}
      </div>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Exemplo interativo com busca em tempo real e retorno dos dados do item selecionado.",
    example: <ListaBuscaAcaoPlayground />,
    code: `import { useMemo, useState } from "react";
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
</>`,
  },
  {
    title: "Uso basico",
    description:
      "Lista resultados de busca com botao de acao por item. Ideal para fluxos de adicionar/remover itens em dialogs e formularios.",
    example: (
      <ListaBuscaAcaoSeplag<ServidorDemo>
        items={servidoresDemo}
        getKey={(item) => item.id}
        getTitle={(item) => item.nome}
        getDescription={(item) => `CPF: ${item.cpf} - Matricula: ${item.matricula}`}
        onAction={(item) => alert(`Adicionar: ${item.nome}`)}
        actionLabel="Adicionar"
        maxItems={5}
      />
    ),
    code: `import { ListaBuscaAcaoSeplag } from "@seplag/ui-lib-react-18";

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
/>`,
  },
  {
    title: "Acao customizada",
    description: "Use renderAction para substituir o botao padrao por qualquer elemento React.",
    example: (
      <ListaBuscaAcaoSeplag<ServidorDemo>
        items={servidoresDemo.slice(0, 2)}
        getKey={(item) => item.id}
        getTitle={(item) => item.nome}
        onAction={() => {}}
        renderAction={(item, action) => (
          <button
            type="button"
            onClick={() => action(item)}
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              background: "#fff",
              padding: "0.35rem 0.7rem",
              cursor: "pointer",
            }}
          >
            Selecionar
          </button>
        )}
      />
    ),
    code: `<ListaBuscaAcaoSeplag
  items={resultados}
  getKey={(item) => item.id}
  getTitle={(item) => item.nome}
  onAction={handleSelecionar}
  renderAction={(item, action) => (
    <button type="button" onClick={() => action(item)}>
      Selecionar
    </button>
  )}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "items",
    type: "readonly T[]",
    required: true,
    description: "Lista de itens que sera exibida.",
  },
  {
    name: "getKey",
    type: "(item: T) => string | number",
    required: true,
    description: "Funcao para obter a chave unica de cada item.",
  },
  {
    name: "getTitle",
    type: "(item: T) => ReactNode",
    required: true,
    description: "Renderiza o titulo principal de cada linha.",
  },
  {
    name: "getDescription",
    type: "(item: T) => ReactNode",
    description: "Renderiza uma descricao secundaria abaixo do titulo.",
  },
  {
    name: "onAction",
    type: "(item: T) => void",
    required: true,
    description: "Callback executado ao acionar um item.",
  },
  {
    name: "renderAction",
    type: "(item: T, action: (item: T) => void) => ReactNode",
    description: "Permite substituir o botao padrao por acao customizada.",
  },
  {
    name: "actionLabel",
    type: "string",
    description: "Texto do botao padrao de acao.",
  },
  {
    name: "emptyMessage",
    type: "string",
    description: "Mensagem exibida quando nao ha resultados.",
  },
  {
    name: "maxHeight",
    type: "string",
    description: "Altura maxima da lista com scroll vertical.",
  },
  {
    name: "maxItems",
    type: "number",
    description: "Limite maximo de itens renderizados.",
  },
  {
    name: "style",
    type: "CSSProperties",
    description: "Estilo inline do container da lista.",
  },
  {
    name: "itemStyle",
    type: "CSSProperties",
    description: "Estilo inline aplicado a cada item da lista.",
  },
  {
    name: "keepInfoInOneLine",
    type: "boolean",
    description: "Quando true, titulo e descricao ficam em uma unica linha com ellipsis.",
  },
];

export default function ListaBuscaAcaoDoc() {
  return (
    <DocPage
      title="ListaBuscaAcao"
      badge="Estavel"
      since="v0.0.1"
      description="Componente generico para listar resultados de busca com uma acao por linha."
      importStatement={`import { ListaBuscaAcaoSeplag } from "@seplag/ui-lib-react-18";
import type { ListaBuscaAcaoSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
