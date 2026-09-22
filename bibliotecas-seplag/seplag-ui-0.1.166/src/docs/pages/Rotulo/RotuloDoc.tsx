import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { useState } from "react";
import { RotuloSeplag } from "@componentes/Rotulo";
import "primereact/resources/themes/saga-blue/theme.css";

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Teste interativo do rótulo e associação com o input.",
    example: <RotuloPlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Envolve qualquer campo de formulário com um rótulo padrão SEPLAG.",
    example: (
      <RotuloSeplag nome="Nome completo">
        <input
          type="text"
          placeholder="Digite o nome"
          style={{
            width: "100%",
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: "0.9rem",
          }}
        />
      </RotuloSeplag>
    ),
    code: `import { RotuloSeplag } from "@seplag/ui-lib-react-18";

<RotuloSeplag nome="Nome completo">
  <input type="text" placeholder="Digite o nome" />
</RotuloSeplag>`,
  },
  {
    title: "Campo obrigatório",
    description: "A prop obrigatorio adiciona o asterisco vermelho (*) ao lado do rótulo.",
    example: (
      <RotuloSeplag nome="E-mail" obrigatorio>
        <input
          type="email"
          placeholder="usuario@seplag.mt.gov.br"
          style={{
            width: "100%",
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: "0.9rem",
          }}
        />
      </RotuloSeplag>
    ),
    code: `<RotuloSeplag nome="E-mail" obrigatorio>
  <input type="email" placeholder="usuario@seplag.mt.gov.br" />
</RotuloSeplag>`,
  },
  {
    title: "Associação com input (htmlFor)",
    description:
      "Use `htmlFor` para associar o rótulo ao campo via id — o componente renderiza `<label>` quando `htmlFor` é informado.",
    example: (
      <RotuloSeplag nome="Nome" htmlFor="nome-input">
        <input
          id="nome-input"
          type="text"
          placeholder="Digite o nome"
          style={{
            width: "100%",
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: "0.9rem",
          }}
        />
      </RotuloSeplag>
    ),
    code: `<RotuloSeplag nome="Nome" htmlFor="nome-input">
  <input id="nome-input" type="text" />
</RotuloSeplag>`,
  },
  {
    title: "Layout horizontal",
    description: "Com horizontal, rótulo e campo ficam lado a lado em vez de empilhados.",
    example: (
      <RotuloSeplag nome="CPF" horizontal>
        <input
          type="text"
          placeholder="000.000.000-00"
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: "0.9rem",
            width: 200,
          }}
        />
      </RotuloSeplag>
    ),
    code: `<RotuloSeplag nome="CPF" horizontal>
  <input type="text" placeholder="000.000.000-00" />
</RotuloSeplag>`,
  },
  {
    title: "Sem moldura (semMoldura)",
    description:
      "Todo campo de Fields/ delega ao RotuloSeplag, que sempre emite a classe de grid derivada de cols e sempre renderiza a caixa de rótulo — mesmo com nome vazio. Dentro de uma célula de tabela isso injeta um contexto de grid indevido e um rótulo vazio ocupando espaço. semMoldura desliga as duas coisas: o rótulo passa a ser responsabilidade do contexto (o <th> da coluna). Compare as bordas tracejadas abaixo — elas marcam o que cada modo realmente renderiza.",
    example: <SemMolduraExample />,
    code: `// Padrão: emite classe de grid + caixa de rótulo
<RotuloSeplag nome="Quantidade" cols="12 6">
  <input />
</RotuloSeplag>

// semMoldura: devolve apenas children
<td>
  <NumberFieldSeplag
    name={\`itens.\${indice}.quantidade\`}
    control={control}
    semMoldura
  />
</td>

// nome, obrigatorio, info, iconLeft, iconRight e horizontal
// são ignorados neste modo — todos descrevem a moldura.
// hidden continua valendo: hidden + semMoldura ainda retorna null.`,
  },
];

const props: DocProp[] = [
  {
    name: "nome",
    type: "string | ReactNode",
    required: true,
    description: "Texto ou elemento React usado como rótulo do campo.",
  },
  {
    name: "children",
    type: "ReactNode",
    required: true,
    description: "Campo de formulário ou qualquer elemento a ser rotulado.",
  },
  {
    name: "obrigatorio",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Exibe asterisco (*) indicando campo obrigatório.",
  },
  {
    name: "horizontal",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Posiciona rótulo e campo lado a lado.",
  },
  {
    name: "cols",
    type: "string",
    defaultValue: '"12"',
    required: false,
    description: "Largura via grid SEPLAG (1–12).",
  },
  {
    name: "hidden",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description: "Quando true, o componente inteiro não é renderizado.",
  },
  {
    name: "semMoldura",
    type: "boolean",
    defaultValue: "false",
    required: false,
    description:
      "Quando true, devolve apenas children: sem a classe de grid derivada de cols, sem a " +
      "caixa de rótulo e sem o wrapper content-rotulo. Use quando o campo é renderizado em " +
      "um contexto que já controla posição e largura — célula de tabela, barra de ações ou " +
      "grupo inline. As props de rótulo (nome, obrigatorio, info, iconLeft, iconRight, " +
      "horizontal) passam a ser ignoradas.",
  },
  {
    name: "htmlFor",
    type: "string",
    required: false,
    description:
      "Id do elemento associado. Quando informado, o rótulo é renderizado como <label> com o atributo for.",
  },
  {
    name: "style",
    type: "CSSProperties",
    required: false,
    description: "Estilos inline aplicados ao container externo.",
  },
];

export default function RotuloDoc() {
  return (
    <DocPage
      title="Rótulo"
      description="Wrapper de campo de formulário padrão SEPLAG. Aplica layout e estilo consistente ao rótulo (label) e ao seu campo associado, com suporte a indicação de obrigatoriedade e orientação horizontal."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { RotuloSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}

const inputExemploStyle = {
  width: "100%",
  padding: "6px 10px",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: "0.9rem",
} as const;

function SemMolduraExample() {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <p style={{ fontSize: "0.8125rem", margin: "0 0 0.5rem", color: "#6b7280" }}>
          Padrão — o tracejado mostra a classe de grid (<code>col-12 md:col-6</code>, com o padding
          do PrimeFlex) e a caixa de rótulo:
        </p>
        <div className="grid" style={{ outline: "1px dashed #f59e0b", width: "100%" }}>
          <RotuloSeplag nome="Quantidade" cols="12 6" htmlFor="doc-com-moldura">
            <input id="doc-com-moldura" type="text" defaultValue="2" style={inputExemploStyle} />
          </RotuloSeplag>
        </div>
      </div>

      <div>
        <p style={{ fontSize: "0.8125rem", margin: "0 0 0.5rem", color: "#6b7280" }}>
          Com <code>semMoldura</code> — só o campo, dentro de uma célula de tabela onde o{" "}
          <code>&lt;th&gt;</code> é o rótulo:
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--surface-border)" }}>
              <th style={{ padding: "0.5rem" }}>Órgão</th>
              <th style={{ padding: "0.5rem", width: "12rem" }}>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
              <td style={{ padding: "0.5rem", fontWeight: 600 }}>SEMA</td>
              <td style={{ padding: "0.5rem", outline: "1px dashed #f59e0b" }}>
                <RotuloSeplag nome="Quantidade" cols="12 6" semMoldura>
                  <input type="text" defaultValue="2" style={inputExemploStyle} />
                </RotuloSeplag>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RotuloPlayground() {
  const [nome, setNome] = useState("Nome completo");
  const [obrigatorio, setObrigatorio] = useState(false);
  const [horizontal, setHorizontal] = useState(false);
  const [htmlFor, setHtmlFor] = useState("");

  const inputId = htmlFor.trim() || "nome-input";

  const code = `<RotuloSeplag nome="${nome}"${obrigatorio ? " obrigatorio" : ""}$
${horizontal ? " horizontal" : ""}${htmlFor ? ` htmlFor="${inputId}"` : ""}>
  <input id="${inputId}" />
</RotuloSeplag>`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview">
        <RotuloSeplag
          nome={nome}
          obrigatorio={obrigatorio}
          horizontal={horizontal}
          htmlFor={htmlFor || undefined}
        >
          <input
            id={inputId}
            placeholder="Digite aqui"
            style={{
              width: "100%",
              padding: "6px 10px",
              fontSize: "0.9rem",
            }}
          />
        </RotuloSeplag>
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <span className="pg-label">nome</span>
          <input
            className="pg-input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>

        <div className="pg-field">
          <span className="pg-label">htmlFor (id)</span>
          <input
            className="pg-input"
            value={htmlFor}
            onChange={(e) => setHtmlFor(e.target.value)}
            placeholder="ex: nome-input"
            style={{ maxWidth: 200 }}
          />
        </div>

        <div className="pg-field">
          <span className="pg-label">obrigatorio</span>
          <div className="pg-checkbox-group">
            <button
              className={`pg-checkbox-btn${obrigatorio ? " selected" : ""}`}
              onClick={() => setObrigatorio((v) => !v)}
            >
              {obrigatorio ? "Sim" : "Não"}
            </button>
          </div>
        </div>

        <div className="pg-field">
          <span className="pg-label">horizontal</span>
          <div className="pg-checkbox-group">
            <button
              className={`pg-checkbox-btn${horizontal ? " selected" : ""}`}
              onClick={() => setHorizontal((v) => !v)}
            >
              {horizontal ? "Sim" : "Não"}
            </button>
          </div>
        </div>
      </div>

      <PlaygroundCode code={code} />
    </div>
  );
}
