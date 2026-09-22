import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { EntityInfoCardSeplag } from "@componentes/EntityInfoCard";
import "primereact/resources/themes/saga-blue/theme.css";

function EntityInfoCardPlayground() {
  const [titulo, setTitulo] = useState("Dados do Contribuinte");
  const [nameValue, setNameValue] = useState("João Silva");
  const [documentValue, setDocumentValue] = useState("123.456.789-00");

  const generatedCode = `import { EntityInfoCardSeplag } from "@seplag/ui-lib-react-18";\n\n<EntityInfoCardSeplag\n  titulo="${titulo}"\n  nameLabel="Nome"\n  nameValue="${nameValue}"\n  documentLabel="CPF"\n  documentValue="${documentValue}"\n/>`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview" style={{ padding: "1rem", borderRadius: 8 }}>
        <EntityInfoCardSeplag
          titulo={titulo}
          nameLabel="Nome"
          nameValue={nameValue}
          documentLabel="CPF"
          documentValue={documentValue}
        />
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-titulo">
            titulo
          </label>
          <input
            id="pg-titulo"
            className="pg-input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-name">
            nameValue
          </label>
          <input
            id="pg-name"
            className="pg-input"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
          />
        </div>
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-document">
            documentValue
          </label>
          <input
            id="pg-document"
            className="pg-input"
            value={documentValue}
            onChange={(e) => setDocumentValue(e.target.value)}
          />
        </div>
      </div>

      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Visualize rapidamente as informações básicas da entidade.",
    example: <EntityInfoCardPlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Componente simples para exibir nome e documento.",
    example: (
      <EntityInfoCardSeplag
        titulo="Dados do Usuário"
        nameLabel="Nome"
        nameValue="Maria Oliveira"
        documentLabel="CNPJ"
        documentValue="12.345.678/0001-99"
      />
    ),
    code: `import { EntityInfoCardSeplag } from "@seplag/ui-lib-react-18";\n\n<EntityInfoCardSeplag\n  titulo="Dados do Usuário"\n  nameLabel="Nome"\n  nameValue="Maria Oliveira"\n  documentLabel="CNPJ"\n  documentValue="12.345.678/0001-99"\n/>`,
  },
];

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"entity-info-card"',
    description: "Identificador do card, usado como data-testid.",
  },
  {
    name: "titulo",
    type: "string",
    description: "Título opcional exibido acima das informações.",
  },
  {
    name: "nameLabel",
    type: "string | null",
    required: true,
    description: "Rótulo para o campo nome.",
  },
  {
    name: "nameValue",
    type: "string | null",
    required: true,
    description: "Valor do nome.",
  },
  {
    name: "documentLabel",
    type: "string | null",
    required: true,
    description: "Rótulo para o documento (CPF/CNPJ).",
  },
  {
    name: "documentValue",
    type: "string | null",
    required: true,
    description: "Valor do documento.",
  },
];

export default function EntityInfoCardDoc() {
  return (
    <DocPage
      title="EntityInfoCard"
      badge="Estável"
      since="v0.0.1"
      description="Componente compacto para exibir informações básicas de uma entidade (nome + documento)."
      importStatement={`import { EntityInfoCardSeplag } from "@seplag/ui-lib-react-18";\nimport type { EntityInfoCardProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
