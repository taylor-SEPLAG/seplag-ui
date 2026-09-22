import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { CardSeplag } from "@componentes/Card";
import "primereact/resources/themes/saga-blue/theme.css";

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

function CardPlayground() {
  const [title, setTitle] = useState("Título do Card");
  const [withBack, setWithBack] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [footerText, setFooterText] = useState("Rodapé do card");

  const propsSnippet = [
    `title="${title}"`,
    withBack ? `handleVoltar={() => {}}` : null,
    showFooter ? `footer={<div>${footerText}</div>}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const generatedCode = `import { CardSeplag } from "@seplag/ui-lib-react-18";\n\n<CardSeplag ${propsSnippet}>\n  <p>Conteúdo do card</p>\n</CardSeplag>`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview" style={{ padding: "1rem", borderRadius: 8 }}>
        <CardSeplag
          title={title}
          handleVoltar={withBack ? () => alert("voltar") : undefined}
          footer={showFooter ? <div>{footerText}</div> : undefined}
        >
          <p>Este é um conteúdo de exemplo dentro do Card.</p>
        </CardSeplag>
        <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}></div>
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <label htmlFor="card-title-input" className="pg-label">
            title
          </label>
          <input
            id="card-title-input"
            className="pg-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="pg-field">
          <span className="pg-label">handleVoltar</span>
          <div className="pg-radio-group">
            {[true, false].map((v) => (
              <label key={String(v)} className={`pg-radio-btn${withBack === v ? " selected" : ""}`}>
                <input type="radio" checked={withBack === v} onChange={() => setWithBack(v)} />
                {String(v)}
              </label>
            ))}
          </div>
        </div>

        <div className="pg-field">
          <label className="pg-label">footer</label>
          <div className="pg-radio-group">
            {[true, false].map((v) => (
              <label
                key={String(v)}
                className={`pg-radio-btn${showFooter === v ? " selected" : ""}`}
              >
                <input type="radio" checked={showFooter === v} onChange={() => setShowFooter(v)} />
                {String(v)}
              </label>
            ))}
          </div>
        </div>
        {showFooter && (
          <div className="pg-field">
            <label htmlFor="card-footer-input" className="pg-label">
              footer text
            </label>
            <input
              id="card-footer-input"
              className="pg-input"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
            />
          </div>
        )}

        {/* className and dataTestId controls removed — not applicable */}
      </div>

      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sections & props
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Experimente o Card interativamente.",
    example: <CardPlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Card com título, legenda e ações.",
    example: (
      <CardSeplag
        title="Resumo"
        legenda={() => <small>Legenda</small>}
        cardHeaderClassNames={undefined}
        footer={<div>Rodapé do card</div>}
      >
        <p>Conteúdo do cartão</p>
      </CardSeplag>
    ),
    code: `import { CardSeplag } from "@seplag/ui-lib-react-18";\n\n<CardSeplag title="Resumo" footer={<div>Rodapé do card</div>}>\n  <p>Conteúdo do cartão</p>\n</CardSeplag>`,
  },
];

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    description:
      "Identificador do card, usado como data-testid do Card e para compor o id do botão Voltar (quando handleVoltar é informado).",
  },
  {
    name: "cols",
    type: "string",
    description: "Classe de grid para largura do card (ex: '6' para col-6).",
  },
  {
    name: "title",
    type: "string | ReactNode",
    description: "Título do card.",
  },
  {
    name: "handleVoltar",
    type: "() => void",
    description: "Callback para o botão de voltar (quando presente).",
  },
  {
    name: "legenda",
    type: "() => ReactNode",
    description: "Função que retorna a legenda abaixo do título.",
  },
  {
    name: "cardHeaderClassNames",
    type: "string",
    description: "Classes adicionais para o cabeçalho do card.",
  },
  {
    name: "style",
    type: "React.CSSProperties",
    description: "Estilos inline aplicados ao wrapper do card.",
  },
  {
    name: "footer",
    type: "ReactNode",
    description: "Conteúdo renderizado no rodapé do card.",
  },
  {
    name: "actions",
    type: "ReactNode",
    description: "Ações exibidas no canto superior direito do cabeçalho.",
  },
  {
    name: "children",
    type: "ReactNode",
    required: true,
    description: "Conteúdo do card.",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CardDoc() {
  return (
    <DocPage
      title="Card"
      badge="Estável"
      since="v0.0.1"
      description="Container visual para agrupar conteúdo e ações. Inclui suporte a título, legenda e botão de voltar."
      importStatement={`import { CardSeplag } from "@seplag/ui-lib-react-18";\nimport type { CardSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
