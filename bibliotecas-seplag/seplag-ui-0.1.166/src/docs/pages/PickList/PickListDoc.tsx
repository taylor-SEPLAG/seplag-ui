import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { PickListSeplag } from "@componentes/PickList";
import "primereact/resources/themes/saga-blue/theme.css";

interface Fruta {
  id: number;
  nome: string;
}

interface PessoaItem {
  id: number;
  pessoa: {
    nome: string;
  };
}

const frutasIniciais: Fruta[] = [
  { id: 1, nome: "Maçã" },
  { id: 2, nome: "Banana" },
  { id: 3, nome: "Laranja" },
  { id: 4, nome: "Uva" },
  { id: 5, nome: "Manga" },
];

const itensIniciais = "Maçã\nBanana\nLaranja\nUva\nManga";

function parseItens(texto: string): Fruta[] {
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0)
    .map((nome, index) => ({ id: index + 1, nome }));
}

function PickListPlayground() {
  const [itensTexto, setItensTexto] = useState(itensIniciais);
  const [source, setSource] = useState<Fruta[]>(() => parseItens(itensIniciais));
  const [target, setTarget] = useState<Fruta[]>([]);
  const [title, setTitle] = useState("Frutas");
  const [titleNaoSelecionados, setTitleNaoSelecionados] = useState("Disponíveis");
  const [titleSelecionados, setTitleSelecionados] = useState("Selecionados");
  const [filterPlaceholder, setFilterPlaceholder] = useState("Buscar...");
  const [isView, setIsView] = useState(false);

  function handleItensChange(texto: string) {
    setItensTexto(texto);
    setSource(parseItens(texto));
    setTarget([]);
  }

  const propsLines = [
    `  title="${title}"`,
    `  dataKey="id"`,
    `  dataLabel="nome"`,
    ...(titleNaoSelecionados === "Disponíveis"
      ? []
      : [`  titleNaoSelecionados="${titleNaoSelecionados}"`]),
    ...(titleSelecionados === "Selecionados" ? [] : [`  titleSelecionados="${titleSelecionados}"`]),
    ...(filterPlaceholder === "Buscar..." ? [] : [`  filterPlaceholder="${filterPlaceholder}"`]),
    ...(isView ? [`  isView`] : []),
    `  naoSelecionados={disponiveis}`,
    `  selecionados={selecionados}`,
    `  setNaoSelecionados={setDisponiveis}`,
    `  setSelecionados={setSelecionados}`,
  ];

  const code = `<PickListSeplag\n${propsLines.join("\n")}\n/>`;

  return (
    <div className="botao-playground">
      <div
        className="botao-playground-preview"
        style={{ alignItems: "flex-start", padding: "1rem" }}
      >
        <PickListSeplag
          title={title}
          dataKey="id"
          dataLabel="nome"
          titleNaoSelecionados={titleNaoSelecionados}
          titleSelecionados={titleSelecionados}
          filterPlaceholder={filterPlaceholder}
          isView={isView}
          naoSelecionados={source}
          selecionados={target}
          setNaoSelecionados={setSource}
          setSelecionados={setTarget}
        />
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field" style={{ alignItems: "flex-start" }}>
          <span className="pg-label" style={{ paddingTop: "0.25rem" }}>
            itens
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <textarea
              rows={5}
              style={{
                fontFamily: "inherit",
                fontSize: "0.85rem",
                padding: "0.4rem 0.6rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                resize: "vertical",
                minWidth: 200,
              }}
              value={itensTexto}
              onChange={(e) => handleItensChange(e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              Um item por linha. Alterar reinicia as listas.
            </span>
          </div>
        </div>

        <div className="pg-field">
          <span className="pg-label">title</span>
          <input className="pg-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="pg-field">
          <span className="pg-label">titleNaoSelecionados</span>
          <input
            className="pg-input"
            value={titleNaoSelecionados}
            onChange={(e) => setTitleNaoSelecionados(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <span className="pg-label">titleSelecionados</span>
          <input
            className="pg-input"
            value={titleSelecionados}
            onChange={(e) => setTitleSelecionados(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <span className="pg-label">filterPlaceholder</span>
          <input
            className="pg-input"
            value={filterPlaceholder}
            onChange={(e) => setFilterPlaceholder(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <span className="pg-label">modificadores</span>
          <div className="pg-checkbox-group">
            <button
              className={`pg-checkbox-btn${isView ? " selected" : ""}`}
              onClick={() => setIsView((v) => !v)}
            >
              isView
            </button>
          </div>
        </div>
      </div>

      <PlaygroundCode code={code} />
    </div>
  );
}

function PickListBasicExample() {
  const [disponiveis, setDisponiveis] = useState<Fruta[]>(frutasIniciais);
  const [selecionados, setSelecionados] = useState<Fruta[]>([]);

  return (
    <div style={{ width: "100%" }}>
      <PickListSeplag
        title="Frutas"
        dataKey="id"
        dataLabel="nome"
        naoSelecionados={disponiveis}
        selecionados={selecionados}
        setNaoSelecionados={setDisponiveis}
        setSelecionados={setSelecionados}
      />
    </div>
  );
}

function PickListViewExample() {
  const [disponiveis, setDisponiveis] = useState<Fruta[]>([
    { id: 1, nome: "React" },
    { id: 2, nome: "TypeScript" },
  ]);
  const [selecionados, setSelecionados] = useState<Fruta[]>([{ id: 3, nome: "PrimeReact" }]);

  return (
    <div style={{ width: "100%" }}>
      <PickListSeplag
        title="Tecnologias"
        dataKey="id"
        dataLabel="nome"
        naoSelecionados={disponiveis}
        selecionados={selecionados}
        setNaoSelecionados={setDisponiveis}
        setSelecionados={setSelecionados}
        isView
      />
    </div>
  );
}

function PickListNestedLabelExample() {
  const [disponiveis, setDisponiveis] = useState<PessoaItem[]>([
    { id: 1, pessoa: { nome: "Ana" } },
    { id: 2, pessoa: { nome: "Bruno" } },
    { id: 3, pessoa: { nome: "Carlos" } },
  ]);
  const [selecionados, setSelecionados] = useState<PessoaItem[]>([]);

  return (
    <div style={{ width: "100%" }}>
      <PickListSeplag
        title="Participantes"
        dataKey="id"
        dataLabel="pessoa.nome"
        filterBy="pessoa.nome"
        naoSelecionados={disponiveis}
        selecionados={selecionados}
        setNaoSelecionados={setDisponiveis}
        setSelecionados={setSelecionados}
      />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Experimente as props em tempo real.",
    example: <PickListPlayground />,
    code: `import { useState } from "react";
import { PickListSeplag } from "@seplag/ui-lib-react-18";

const [disponiveis, setDisponiveis] = useState(items);
const [selecionados, setSelecionados] = useState([]);

<PickListSeplag
  title="Frutas"
  dataKey="id"
  dataLabel="nome"
  naoSelecionados={disponiveis}
  selecionados={selecionados}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
/>`,
  },
  {
    title: "Uso básico",
    description:
      "Mova itens entre a lista de disponíveis e selecionados usando os controles centrais.",
    example: <PickListBasicExample />,
    code: `import { useState } from "react";
import { PickListSeplag } from "@seplag/ui-lib-react-18";

const [disponiveis, setDisponiveis] = useState(items);
const [selecionados, setSelecionados] = useState([]);

<PickListSeplag
  title="Frutas"
  dataKey="id"
  dataLabel="nome"
  naoSelecionados={disponiveis}
  selecionados={selecionados}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
/>`,
  },
  {
    title: "Modo somente leitura",
    description: "Com isView, os controles de movimentação ficam desabilitados.",
    example: <PickListViewExample />,
    code: `<PickListSeplag
  title="Tecnologias"
  dataKey="id"
  dataLabel="nome"
  naoSelecionados={disponiveis}
  selecionados={selecionados}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
  isView
/>`,
  },
  {
    title: "dataLabel aninhado",
    description:
      "Você pode usar caminho com ponto para exibir propriedades internas, como pessoa.nome.",
    example: <PickListNestedLabelExample />,
    code: `<PickListSeplag
  title="Participantes"
  dataKey="id"
  dataLabel="pessoa.nome"
  filterBy="pessoa.nome"
  naoSelecionados={disponiveis}
  selecionados={selecionados}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
/>`,
  },
  {
    title: "Fallback de item inválido",
    description:
      "Quando o caminho de dataLabel não existe no item, o componente exibe Item inválido para facilitar diagnóstico de mapeamento.",
    example: null,
    code: `// Exemplo: dataLabel aponta para um campo inexistente
<PickListSeplag
  title="Exemplo"
  dataKey="id"
  dataLabel="pessoa.nome"
  naoSelecionados={[{ id: 1, nome: "Sem pessoa" }]}
  selecionados={[]}
  setNaoSelecionados={setDisponiveis}
  setSelecionados={setSelecionados}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "title",
    type: "string",
    required: true,
    description: "Título exibido acima do componente de picklist.",
  },
  {
    name: "name",
    type: "string",
    required: false,
    description:
      "Identificador usado para gerar id/data-testid únicos no PickList e em cada item (source/target/view). Quando omitido, usa \"picklist\" como base.",
  },
  {
    name: "naoSelecionados",
    type: "T[]",
    required: true,
    description: "Lista de itens disponíveis (lado esquerdo).",
  },
  {
    name: "selecionados",
    type: "T[]",
    required: true,
    description: "Lista de itens selecionados (lado direito).",
  },
  {
    name: "setNaoSelecionados",
    type: "(items: T[]) => void",
    required: true,
    description: "Setter para a lista de disponíveis.",
  },
  {
    name: "setSelecionados",
    type: "(items: T[]) => void",
    required: true,
    description: "Setter para a lista de selecionados.",
  },
  {
    name: "dataKey",
    type: "string",
    required: false,
    description: "Propriedade usada como chave única dos itens.",
  },
  {
    name: "dataLabel",
    type: "string",
    required: false,
    description:
      "Propriedade exibida como label de cada item (aceita caminho aninhado, ex.: pessoa.nome).",
  },
  {
    name: "isView",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Modo somente leitura — desabilita os controles de movimentação.",
  },
  {
    name: "filterBy",
    type: "string",
    required: false,
    description: "Propriedade usada para filtrar itens na busca.",
  },
  {
    name: "filterPlaceholder",
    type: "string",
    required: false,
    description: "Placeholder do campo de busca.",
  },
];

export default function PickListDoc() {
  return (
    <DocPage
      title="PickList"
      description="Componente de seleção dual (picklist) padrão SEPLAG para transferência de itens entre duas listas. Suporta filtro, modo de visualização e templates customizados."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { PickListSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
