import { useState, type ReactNode } from "react";
import "./DocPage.css";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface DocProp {
  name: string;
  type: string;
  defaultValue?: string;
  required?: boolean;
  /** Quando true, indica que a prop está depreciada. */
  deprecated?: boolean;
  /** Mensagem curta explicando a depreciação ou migração. */
  deprecationMessage?: string;
  description: string;
}

export interface DocSection {
  /** Título da seção de exemplo */
  title: string;
  /** Descrição opcional abaixo do título */
  description?: string;
  /** Elemento React renderizado ao vivo como exemplo */
  example: ReactNode;
  /** Código-fonte exibido no bloco de código */
  code: string;
}

export interface DocPageProps {
  title: string;
  description: string;
  /** Ex: "Estável" | "Beta" | "Legado" */
  badge?: string;
  /** Versão de introdução do componente, ex: "v0.0.1" */
  since?: string;
  /** Linha(s) de import exibida logo abaixo da descrição */
  importStatement?: string;
  sections: DocSection[];
  /** Lista de props exibida na tabela de API */
  props?: DocProp[];
}

// ---------------------------------------------------------------------------
// PlaygroundCode — bloco de código colapsável para playgrounds
// ---------------------------------------------------------------------------

export function PlaygroundCode({ code }: Readonly<{ code: string }>) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pg-code-wrapper">
      <button type="button" className="pg-code-toggle" onClick={() => setOpen((v) => !v)}>
        <i className={`pi pi-chevron-${open ? "down" : "right"}`} />
        {open ? " Ocultar código" : " Ver código"}
      </button>
      {open && <pre className="pg-code-body">{code}</pre>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CodeBlock — bloco de código com botão de copiar
// ---------------------------------------------------------------------------

function CodeBlock({
  code,
  standalone = false,
}: Readonly<{
  code: string;
  standalone?: boolean;
}>) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className={`doc-code-block${standalone ? " standalone" : ""}`}>
      <button className="doc-code-copy-btn" onClick={handleCopy} aria-label="Copiar código">
        {copied ? "Copiado!" : "Copiar"}
      </button>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PropsTable — tabela de API do componente
// ---------------------------------------------------------------------------

function PropsTable({ props }: Readonly<{ props: DocProp[] }>) {
  return (
    <div className="doc-props-table-wrapper">
      <table className="doc-props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Tipo</th>
            <th>Padrão</th>
            <th>Obrig.</th>
            <th>Deprecated</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <td>
                <span className="doc-prop-name">{p.name}</span>
              </td>
              <td>
                <span className="doc-prop-type">{p.type}</span>
              </td>
              <td>
                <span className="doc-prop-default">{p.defaultValue ?? "—"}</span>
              </td>
              <td>
                {p.required ? (
                  <span className="doc-prop-required">Sim</span>
                ) : (
                  <span className="doc-prop-optional">Não</span>
                )}
              </td>
              <td>
                {p.deprecated ? (
                  <span className="doc-prop-deprecated">Sim</span>
                ) : (
                  <span className="doc-prop-optional">Não</span>
                )}
              </td>
              <td>
                <div>{p.description}</div>
                {p.deprecationMessage && (
                  <div className="doc-prop-deprecation-message">{p.deprecationMessage}</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DocPage — template reutilizável para páginas de documentação
// ---------------------------------------------------------------------------

export function DocPage({
  title,
  description,
  badge,
  since,
  importStatement,
  sections,
  props,
}: Readonly<DocPageProps>) {
  return (
    <article className="doc-page">
      {/* Header */}
      <header className="doc-page-header">
        {(badge || since) && (
          <div className="doc-page-kicker">
            {badge && <span className="doc-page-badge">{badge}</span>}
            {since && <span className="doc-page-since">desde {since}</span>}
          </div>
        )}
        <h1 className="doc-page-title">{title}</h1>
        <p className="doc-page-description">{description}</p>
        {importStatement && (
          <div className="doc-import-block">
            <span className="doc-import-label">Importação</span>
            <pre>{importStatement}</pre>
          </div>
        )}
      </header>

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.title} className="doc-section">
          <h2 className="doc-section-title">{section.title}</h2>
          {section.description && <p className="doc-section-description">{section.description}</p>}
          {section.example != null && <div className="doc-preview">{section.example}</div>}
          {section.code !== "" && (
            <CodeBlock code={section.code} standalone={section.example == null} />
          )}
        </section>
      ))}

      {/* Props Table */}
      {props && props.length > 0 && (
        <section className="doc-section">
          <h2 className="doc-section-title">API</h2>
          <PropsTable props={props} />
        </section>
      )}
    </article>
  );
}
