import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { loaderSeplag } from "../../../componentes/Loader/loaderContent";
import "primereact/resources/themes/saga-blue/theme.css";

// ─── Playground ─────────────────────────────────────────────────────────────

function LoaderPreview() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("Buscando dados...");

  function simular(customMessage?: string) {
    if (customMessage !== undefined) {
      setMessage(customMessage);
    }

    setVisible(true);
    setTimeout(() => setVisible(false), 2500);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        width: "100%",
      }}
    >
      {visible && loaderSeplag(message)}
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={visible}
        placeholder="Digite a mensagem do loader"
        style={{
          width: "min(360px, 90%)",
          padding: "0.55rem 0.75rem",
          borderRadius: 6,
          border: "1px solid #d1d5db",
          fontSize: "0.9rem",
        }}
      />
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={() => simular("Carregando")}
          disabled={visible}
          style={{
            padding: "0.5rem 1rem",
            background: visible ? "#6c757d" : "#0f766e",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: visible ? "not-allowed" : "pointer",
            fontSize: "0.9rem",
          }}
        >
          {visible ? "Carregando..." : "Simular padrão"}
        </button>
        <button
          onClick={() => simular()}
          disabled={visible}
          style={{
            padding: "0.5rem 1rem",
            background: visible ? "#6c757d" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: visible ? "not-allowed" : "pointer",
            fontSize: "0.9rem",
          }}
        >
          {visible ? "Carregando..." : "Simular personalizada"}
        </button>
      </div>
    </div>
  );
}

function LoaderPlayground() {
  return (
    <div className="botao-playground">
      <div className="botao-playground-preview" style={{ flexDirection: "column" }}>
        <LoaderPreview />
      </div>
      <PlaygroundCode
        code={`// 1. Coloque o Loader na raiz da aplicação (uma única vez)
import { LoaderSeplag } from "@seplag/ui-lib-react-18";

<LoaderSeplag text="Buscando dados..." />
<LoaderSeplag /> // fallback: "Carregando"

// 2. Controle via Redux — incremente/decremente o contador
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "@seplag/ui-lib-react-18";

const dispatch = useDispatch();

async function salvar() {
  dispatch(showLoader());
  try {
    await api.post("/registros", dados);
  } finally {
    dispatch(hideLoader());
  }
}`}
      />
    </div>
  );
}

// ─── Seções ──────────────────────────────────────────────────────────────────

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Visualize o overlay de carregamento.",
    example: <LoaderPlayground />,
    code: "",
  },
  {
    title: "Configuração",
    description:
      "Adicione o LoaderSeplag uma única vez na raiz da aplicação. Ele se conecta ao Redux e exibe o overlay automaticamente sempre que houver operações pendentes. Opcionalmente, personalize a mensagem exibida.",
    example: null,
    code: `// App.tsx ou layout principal
import { LoaderSeplag } from "@seplag/ui-lib-react-18";

export default function App() {
  return (
    <>
      <LoaderSeplag text="Carregando dados iniciais..." />
      {/* resto da aplicação */}
    </>
  );
}`,
  },
  {
    title: "Mensagem personalizada",
    description:
      "A prop text permite trocar a mensagem padrão Carregando por qualquer texto de contexto da operação atual.",
    example: null,
    code: `import { LoaderSeplag } from "@seplag/ui-lib-react-18";

// Exibe: Processando solicitação...
<LoaderSeplag text="Processando solicitação..." />

// Sem a prop text, o padrão continua: Carregando
<LoaderSeplag />`,
  },
  {
    title: "Controle via Redux",
    description:
      "Use showLoader e hideLoader para controlar a visibilidade. O LoaderSeplag usa um contador interno — múltiplas chamadas paralelas são suportadas; o overlay só desaparece quando todas terminam.",
    example: null,
    code: `import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "@seplag/ui-lib-react-18";

function MeuComponente() {
  const dispatch = useDispatch();

  async function buscarDados() {
    dispatch(showLoader());
    try {
      const dados = await api.get("/endpoint");
      setDados(dados);
    } finally {
      dispatch(hideLoader()); // sempre executado
    }
  }
}`,
  },
  {
    title: "Múltiplas requisições paralelas",
    description:
      "O contador garante que o overlay permaneça visível até que todas as operações sejam concluídas.",
    example: null,
    code: `// Requisição A e B em paralelo
dispatch(showLoader()); // contador: 1
dispatch(showLoader()); // contador: 2

await Promise.all([requisicaoA(), requisicaoB()]);

dispatch(hideLoader()); // contador: 1 — overlay ainda visível
dispatch(hideLoader()); // contador: 0 — overlay removido`,
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

const props: DocProp[] = [
  {
    name: "text",
    type: "string",
    required: false,
    description: "Mensagem exibida abaixo da animação. Padrão: Carregando.",
  },
];

// ─── Página ──────────────────────────────────────────────────────────────────

export default function LoaderDoc() {
  return (
    <DocPage
      title="LoaderSeplag"
      description="Overlay de carregamento que cobre toda a tela enquanto há operações pendentes. Controlado via Redux com contador de requisições — suporta chamadas paralelas sem piscar."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { LoaderSeplag } from "@seplag/ui-lib-react-18";\nimport { showLoader, hideLoader } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
