import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { ModalSeplag } from "@componentes/Modal";
import { BotaoAdicionarSeplag } from "@componentes/Botao";
import "primereact/resources/themes/saga-blue/theme.css";

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

function ModalPlayground() {
  const [visible, setVisible] = useState(false);
  const [titulo, setTitulo] = useState("Título do Modal");
  const [labelAcao, setLabelAcao] = useState("Confirmar");
  const [labelFechar, setLabelFechar] = useState("Fechar");
  const [tamanho, setTamanho] = useState("50vw");
  const [alignFooter, setAlignFooter] = useState<"left" | "right">("right");
  const [hideFooter, setHideFooter] = useState(false);
  const [draggable, setDraggable] = useState(true);
  const [conteudo, setConteudo] = useState("Conteúdo interno do modal.");

  const propsLines = [
    `visible={visible}`,
    `fechar={() => setVisible(false)}`,
    titulo ? `titulo="${titulo}"` : "",
    hideFooter ? "" : `funcAcao={() => setVisible(false)}`,
    hideFooter ? "" : `labelAcao="${labelAcao}"`,
    hideFooter || labelFechar === "Fechar" ? "" : `labelFechar="${labelFechar}"`,
    tamanho === "50vw" ? "" : `tamanho="${tamanho}"`,
    alignFooter === "right" ? `alignFooter="right"` : "",
    hideFooter ? "hideFooter" : "",
    draggable ? "" : "draggable={false}",
  ]
    .filter(Boolean)
    .join("\n  ");

  const generatedCode = `import { ModalSeplag } from "@seplag/ui-lib-react-18";\n\n<ModalSeplag\n  ${propsLines}\n>\n  <p>${conteudo}</p>\n</ModalSeplag>`;

  return (
    <div className="botao-playground">
      {/* Preview */}
      <div className="botao-playground-preview">
        <BotaoAdicionarSeplag label="Abrir Modal" onClick={() => setVisible(true)} />
        <ModalSeplag
          visible={visible}
          titulo={titulo}
          fechar={() => setVisible(false)}
          funcAcao={hideFooter ? undefined : () => setVisible(false)}
          labelAcao={labelAcao}
          labelFechar={labelFechar}
          tamanho={tamanho}
          alignFooter={alignFooter}
          hideFooter={hideFooter}
          draggable={draggable}
        >
          <p style={{ padding: "1rem 0" }}>{conteudo}</p>
        </ModalSeplag>
      </div>

      {/* Controles */}
      <div className="botao-playground-controls">
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-titulo">
            titulo
          </label>
          <input
            id="pg-titulo"
            className="pg-input"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título do modal"
          />
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-conteudo">
            conteúdo
          </label>
          <input
            id="pg-conteudo"
            className="pg-input"
            type="text"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Texto interno"
          />
        </div>

        {!hideFooter && (
          <>
            <div className="pg-field">
              <label className="pg-label" htmlFor="pg-labelAcao">
                labelAcao
              </label>
              <input
                id="pg-labelAcao"
                className="pg-input"
                type="text"
                value={labelAcao}
                onChange={(e) => setLabelAcao(e.target.value)}
                placeholder="Confirmar"
              />
            </div>

            <div className="pg-field">
              <label className="pg-label" htmlFor="pg-labelFechar">
                labelFechar
              </label>
              <input
                id="pg-labelFechar"
                className="pg-input"
                type="text"
                value={labelFechar}
                onChange={(e) => setLabelFechar(e.target.value)}
                placeholder="Fechar"
              />
            </div>

            <div className="pg-field">
              <span className="pg-label">alignFooter</span>
              <div className="pg-radio-group">
                {(["left", "right"] as const).map((v) => (
                  <label key={v} className={`pg-radio-btn${alignFooter === v ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="alignFooter"
                      value={v}
                      checked={alignFooter === v}
                      onChange={() => setAlignFooter(v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-tamanho">
            tamanho
          </label>
          <select
            id="pg-tamanho"
            className="pg-select"
            value={tamanho}
            onChange={(e) => setTamanho(e.target.value)}
          >
            {["30vw", "50vw", "70vw", "90vw"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="pg-field">
          <span className="pg-label">modificadores</span>
          <div className="pg-checkbox-group">
            {(
              [
                ["hideFooter", hideFooter, setHideFooter],
                ["draggable", draggable, setDraggable],
              ] as [string, boolean, (v: boolean) => void][]
            ).map(([name, val, setter]) => (
              <label key={name} className={`pg-checkbox-btn${val ? " selected" : ""}`}>
                <input type="checkbox" checked={val} onChange={(e) => setter(e.target.checked)} />
                {name}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Código gerado */}
      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exemplos fixos
// ---------------------------------------------------------------------------

function ModalBasicExample() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <BotaoAdicionarSeplag label="Abrir Modal" onClick={() => setVisible(true)} />
      <ModalSeplag
        visible={visible}
        titulo="Exemplo de Modal"
        fechar={() => setVisible(false)}
        funcAcao={() => setVisible(false)}
        labelAcao="Confirmar"
      >
        <p style={{ padding: "1rem 0" }}>Conteúdo interno do modal.</p>
      </ModalSeplag>
    </>
  );
}

function ModalCustomFooterExample() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <BotaoAdicionarSeplag label="Modal sem footer" onClick={() => setVisible(true)} />
      <ModalSeplag
        visible={visible}
        titulo="Somente visualização"
        fechar={() => setVisible(false)}
        hideFooter
      >
        <p style={{ padding: "1rem 0" }}>Este modal não exibe botões de ação.</p>
      </ModalSeplag>
    </>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Monte o modal escolhendo as props ao vivo. Clique em 'Abrir Modal' para visualizar o resultado.",
    example: <ModalPlayground />,
    code: `// Use o playground acima para gerar o código do seu modal`,
  },
  {
    title: "Uso básico",
    description: "Modal com título, botões de Fechar e Confirmar gerados automaticamente.",
    example: <ModalBasicExample />,
    code: `import { useState } from "react";
import { ModalSeplag, BotaoAdicionarSeplag } from "@seplag/ui-lib-react-18";

function ExemploModal() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <BotaoAdicionarSeplag label="Abrir Modal" onClick={() => setVisible(true)} />
      <ModalSeplag
        visible={visible}
        titulo="Título do Modal"
        fechar={() => setVisible(false)}
        funcAcao={() => setVisible(false)}
        labelAcao="Confirmar"
      >
        <p>Conteúdo interno do modal.</p>
      </ModalSeplag>
    </>
  );
}`,
  },
  {
    title: "Sem rodapé",
    description: "Use hideFooter para omitir completamente os botões de ação.",
    example: <ModalCustomFooterExample />,
    code: `<ModalSeplag
  visible={visible}
  titulo="Somente visualização"
  fechar={() => setVisible(false)}
  hideFooter
>
  <p>Este modal não exibe botões de ação.</p>
</ModalSeplag>`,
  },
];

const props: DocProp[] = [
  {
    name: "id",
    type: "string",
    defaultValue: '"modal-seplag"',
    required: false,
    description:
      "Identificador do modal, propagado como data-testid do Dialog e usado para compor o id dos botões do rodapé (fechar/ação).",
  },
  {
    name: "visible",
    type: "boolean",
    required: true,
    description: "Controla a visibilidade do modal.",
  },
  {
    name: "fechar",
    type: "() => void",
    required: true,
    description: "Callback chamado ao fechar o modal.",
  },
  {
    name: "titulo",
    type: "string",
    required: false,
    description: "Texto do cabeçalho do modal.",
  },
  {
    name: "funcAcao",
    type: "() => void",
    required: false,
    description: "Callback do botão de ação principal.",
  },
  {
    name: "labelAcao",
    type: "string",
    defaultValue: '"Enviar"',
    required: false,
    description: "Label do botão de ação principal.",
  },
  {
    name: "labelFechar",
    type: "string",
    defaultValue: '"Fechar"',
    required: false,
    description: "Label do botão de fechar.",
  },
  {
    name: "tamanho",
    type: "string",
    defaultValue: '"50vw"',
    required: false,
    description: 'Largura do modal, ex: "80vw".',
  },
  {
    name: "hideFooter",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Remove completamente o rodapé do modal.",
  },
  {
    name: "customFooter",
    type: "ReactNode",
    required: false,
    description: "Substitui o rodapé padrão por um conteúdo customizado.",
  },
  {
    name: "draggable",
    type: "boolean",
    defaultValue: "true",
    required: false,
    description: "Permite arrastar o modal pela tela.",
  },
];

export default function ModalDoc() {
  return (
    <DocPage
      title="Modal"
      description="Dialog modal padrão SEPLAG, baseado no Dialog do PrimeReact. Inclui cabeçalho com título, rodapé com botões de ação configuráveis e suporte a conteúdo customizado."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { ModalSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
