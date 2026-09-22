import { PanelSeplag } from "@componentes/PanelSeplag";
import "primereact/resources/themes/saga-blue/theme.css";
import { useState } from "react";
import { DocPage, PlaygroundCode, type DocProp, type DocSection } from "../../components/DocPage";

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

function PanelPlayground() {
  const [cols, setCols] = useState("12");
  const [title, setTitle] = useState("Dados pessoais");
  const [description, setDescription] = useState("Preencha as informações do cadastro.");
  const [gap, setGap] = useState("2");

  const propsSnippet = [
    cols === "12" ? null : `cols="${cols}"`,
    title ? `title="${title}"` : null,
    description ? `description="${description}"` : null,
    gap === "2" ? null : `gap="${gap}"`,
  ]
    .filter(Boolean)
    .join("\n  ");

  const propsBlock = propsSnippet ? `\n  ${propsSnippet}\n` : "";
  const generatedCode = `import { PanelSeplag } from "@seplag/ui-lib-react-18";\n\n<PanelSeplag${propsBlock}>\n  {/* conteúdo */}\n</PanelSeplag>`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview">
        <PanelSeplag
          cols={cols}
          title={title || undefined}
          description={description || undefined}
          gap={gap}
        >
          <p style={{ margin: 0 }}>Conteúdo de exemplo dentro do painel.</p>
        </PanelSeplag>
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <label htmlFor="panel-cols" className="pg-label">
            cols
          </label>
          <input
            id="panel-cols"
            className="pg-input"
            value={cols}
            onChange={(e) => setCols(e.target.value)}
            placeholder="ex: 12 6 4"
          />
        </div>

        <div className="pg-field">
          <label htmlFor="panel-title" className="pg-label">
            title
          </label>
          <input
            id="panel-title"
            className="pg-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <label htmlFor="panel-description" className="pg-label">
            description
          </label>
          <input
            id="panel-description"
            className="pg-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <label htmlFor="panel-gap" className="pg-label">
            gap
          </label>
          <input
            id="panel-gap"
            className="pg-input"
            value={gap}
            onChange={(e) => setGap(e.target.value)}
            placeholder="ex: 2"
          />
        </div>
      </div>

      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Experimente o PanelSeplag interativamente.",
    example: <PanelPlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Painel simples com título e descrição agrupando campos.",
    example: (
      <PanelSeplag title="Endereço" description="Informe o endereço completo.">
        <p style={{ margin: 0 }}>Campos de endereço aqui.</p>
      </PanelSeplag>
    ),
    code: `import { PanelSeplag } from "@seplag/ui-lib-react-18";\n\n<PanelSeplag title="Endereço" description="Informe o endereço completo.">\n  {/* campos */}\n</PanelSeplag>`,
  },
  {
    title: "Sem cabeçalho",
    description:
      "Quando `title` e `description` são omitidos, apenas a borda e o grid são exibidos.",
    example: (
      <PanelSeplag>
        <p style={{ margin: 0 }}>Conteúdo sem título.</p>
      </PanelSeplag>
    ),
    code: `<PanelSeplag>\n  {/* campos */}\n</PanelSeplag>`,
  },
  {
    title: "Grid responsivo",
    description:
      "Use `cols` com até três valores (col / md:col / lg:col) para controlar a largura em diferentes breakpoints.",
    example: (
      <div className="grid">
        <PanelSeplag cols="12 6" title="Meia largura (md+)">
          <p style={{ margin: 0 }}>50% a partir de md.</p>
        </PanelSeplag>
      </div>
    ),
    code: `<PanelSeplag cols="12 6" title="Meia largura (md+)">\n  {/* campos */}\n</PanelSeplag>`,
  },
  {
    title: "Com ícone no lado esquerdo",
    description:
      'Use a propriedade `icon` com `iconPosition="left"` (padrão) para exibir um ícone à esquerda do título.',
    example: (
      <PanelSeplag
        title="Informações Pessoais"
        description="Dados do cadastro"
        icon="pi pi-user"
        iconPosition="left"
      >
        <p style={{ margin: 0 }}>Conteúdo com ícone no lado esquerdo.</p>
      </PanelSeplag>
    ),
    code: `import { PanelSeplag } from "@seplag/ui-lib-react-18";\n\n<PanelSeplag\n  title="Informações Pessoais"\n  description="Dados do cadastro"\n  icon="pi pi-user"\n  iconPosition="left"\n>\n  {/* campos */}\n</PanelSeplag>`,
  },
  {
    title: "Com ícone no lado direito",
    description: 'Use `iconPosition="right"` para exibir o ícone à direita do título e descrição.',
    example: (
      <PanelSeplag
        title="Endereço"
        description="Informações de localização"
        icon="pi pi-map-marker"
        iconPosition="right"
      >
        <p style={{ margin: 0 }}>Conteúdo com ícone no lado direito.</p>
      </PanelSeplag>
    ),
    code: `<PanelSeplag\n  title="Endereço"\n  description="Informações de localização"\n  icon="pi pi-map-marker"\n  iconPosition="right"\n>\n  {/* campos */}\n</PanelSeplag>`,
  },
  {
    title: "Customizando o ícone",
    description:
      "Use `iconClassName` para adicionar estilos customizados ao ícone (tamanho, cor, etc).",
    example: (
      <PanelSeplag
        title="Ícone Grande"
        description="Com tamanho e cor customizados"
        icon="pi pi-heart-fill"
        iconClassName="text-red-500"
        iconPosition="left"
      >
        <p style={{ margin: 0 }}>Ícone com estilos personalizados.</p>
      </PanelSeplag>
    ),
    code: `<PanelSeplag\n  title="Ícone Grande"\n  icon="pi pi-heart-fill"\n  iconClassName="text-red-500"\n>\n  {/* campos */}\n</PanelSeplag>`,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props: DocProp[] = [
  {
    name: "children",
    type: "ReactNode",
    required: false,
    description: "Conteúdo interno do painel.",
  },
  {
    name: "cols",
    type: "string",
    required: false,
    defaultValue: '"12"',
    description:
      'Colunas do grid responsivo. Aceita 1 a 3 valores separados por espaço: `"col"`, `"col md:col"` ou `"col md:col lg:col"`. Exemplo: `"12 6 4"`.',
  },
  {
    name: "title",
    type: "string",
    required: false,
    description: "Título exibido no cabeçalho do painel.",
  },
  {
    name: "description",
    type: "string",
    required: false,
    description: "Texto descritivo exibido abaixo do título.",
  },
  {
    name: "gap",
    type: "string",
    required: false,
    defaultValue: '"2"',
    description:
      'Espaçamento entre os filhos. Mapeia para a classe `gap-{n}` do PrimeFlex. Exemplo: `"3"` → `gap-3`.',
  },
  {
    name: "className",
    type: "string",
    required: false,
    description: "Classes CSS adicionais aplicadas ao contêiner interno (borda, flex).",
  },
  {
    name: "classNameHeader",
    type: "string",
    required: false,
    description: "Classes CSS adicionais aplicadas à área do cabeçalho (título + descrição).",
  },
  {
    name: "id",
    type: "string",
    required: false,
    description: "Identificador HTML do elemento raiz, útil para acessibilidade e testes.",
  },
  {
    name: "icon",
    type: "string",
    required: false,
    description:
      "Classe CSS do ícone a ser exibido no cabeçalho. Exemplo: `'pi pi-user'`, `'pi pi-map-marker'`.",
  },
  {
    name: "iconPosition",
    type: "'left' | 'right'",
    required: false,
    defaultValue: "'left'",
    description:
      "Posição do ícone em relação ao título e descrição. 'left' exibe o ícone antes do texto, 'right' exibe após.",
  },
  {
    name: "iconClassName",
    type: "string",
    required: false,
    description:
      "Classes CSS adicionais para estilizar o ícone. Útil para controlar tamanho, cor e outros estilos.",
  },
  {
    name: "ariaLabel",
    type: "string",
    required: false,
    description:
      "Rótulo ARIA para acessibilidade. Se omitido, utiliza o valor de `title`. Melhora a compreensão para leitores de tela.",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PanelSeplagDoc() {
  return (
    <DocPage
      title="PanelSeplag"
      badge="Estável"
      since="v0.0.1"
      description="Container visual para agrupar campos e conteúdo dentro de um grid responsivo, com suporte a título e descrição."
      importStatement={`import { PanelSeplag } from "@seplag/ui-lib-react-18";\nimport type { PanelSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
