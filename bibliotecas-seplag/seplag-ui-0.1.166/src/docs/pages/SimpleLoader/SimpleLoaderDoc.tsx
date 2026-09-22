import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { SimpleLoaderSeplag } from "@componentes/SimpleLoader";
import { useState } from "react";

function SimpleLoaderPlayground() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Carregando dados...");

  function simular() {
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 2000);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensagem do loader"
          style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.9rem", minWidth: 220 }}
        />
        <button
          type="button"
          onClick={simular}
          disabled={isLoading}
          style={{ border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", padding: "0.5rem 1rem", cursor: isLoading ? "default" : "pointer" }}
        >
          {isLoading ? "Carregando..." : "Simular carregamento (2s)"}
        </button>
      </div>

      {/*
        O componente renderiza um overlay `position: fixed` cobrindo a tela inteira
        (ver loader.css) — não pode ficar sempre montado na doc, senão bloqueia a
        navegação do site inteiro. Por isso a simulação acima é temporizada e
        sempre volta a isLoading=false sozinha.
      */}
      <div style={{ minHeight: 80, border: "1px dashed #cbd5e1", borderRadius: 6, position: "relative" }}>
        <SimpleLoaderSeplag isLoading={isLoading} message={message} />
        {!isLoading && (
          <div style={{ padding: "1.5rem", color: "#64748b", textAlign: "center" }}>
            Conteúdo da página (loader oculto)
          </div>
        )}
      </div>
    </div>
  );
}

function SimpleLoaderSemMensagemPlayground() {
  const [isLoading, setIsLoading] = useState(false);

  function simular() {
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 1500);
  }

  return (
    <div>
      <button
        type="button"
        onClick={simular}
        disabled={isLoading}
        style={{ border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", padding: "0.5rem 1rem", cursor: isLoading ? "default" : "pointer" }}
      >
        {isLoading ? "Carregando..." : "Simular carregamento sem mensagem (1.5s)"}
      </button>
      <SimpleLoaderSeplag isLoading={isLoading} />
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Digite uma mensagem e clique para simular um carregamento de 2 segundos. Quando isLoading é false, o componente não renderiza nada (retorna null).",
    example: <SimpleLoaderPlayground />,
    code: `import { useState } from "react";
import { SimpleLoaderSeplag } from "@seplag/ui-lib-react-18";

const [isLoading, setIsLoading] = useState(false);

<>
  <button onClick={() => carregarDados().finally(() => setIsLoading(false))}>
    Carregar
  </button>

  <SimpleLoaderSeplag isLoading={isLoading} message="Carregando dados..." />
</>`,
  },
  {
    title: "Sem mensagem",
    description:
      "message é opcional — sem ela, o loader padrão da biblioteca é exibido sem texto de apoio. Clique para simular (o overlay é fixed e cobre a tela inteira, então só é montado durante a simulação).",
    example: <SimpleLoaderSemMensagemPlayground />,
    code: `<SimpleLoaderSeplag isLoading={isLoading} />`,
  },
];

const props: DocProp[] = [
  { name: "isLoading", type: "boolean", required: true, description: "Quando true, renderiza o loader padrão da biblioteca (loaderSeplag). Quando false, o componente retorna null." },
  { name: "message", type: "string", description: "Mensagem de apoio exibida junto ao loader." },
];

export default function SimpleLoaderDoc() {
  return (
    <DocPage
      title="SimpleLoader"
      badge="Estável"
      since="v0.1.153"
      description="Wrapper condicional simples sobre o loader padrão da biblioteca: renderiza o indicador de carregamento quando isLoading é true, ou nada quando false. Útil para não precisar repetir `{isLoading && <Loader />}` em cada tela."
      importStatement={`import { SimpleLoaderSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
