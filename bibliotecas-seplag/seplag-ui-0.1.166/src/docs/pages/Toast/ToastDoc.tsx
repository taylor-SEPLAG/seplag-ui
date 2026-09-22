import { useState } from "react";
import { ToastProviderSeplag } from "../../../provider/printToast";
import { useToastSeplag } from "../../../hooks/toast";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import "primereact/resources/themes/saga-blue/theme.css";

// ─── Playground ─────────────────────────────────────────────────────────────

type ToastType = "sucesso" | "erro" | "atencao" | "custom";

const TOAST_TYPES: { value: ToastType; label: string }[] = [
  { value: "sucesso", label: "toastSucesso" },
  { value: "erro", label: "toastErro" },
  { value: "atencao", label: "toastAtencao" },
  { value: "custom", label: "printToast (custom)" },
];

const SEVERITY_OPTIONS = ["success", "error", "warn", "info"] as const;
type Severity = (typeof SEVERITY_OPTIONS)[number];

const METHOD_NAME: Record<ToastType, string> = {
  sucesso: "toastSucesso",
  erro: "toastErro",
  atencao: "toastAtencao",
  custom: "printToast",
};

const SUMMARY_PLACEHOLDER: Record<ToastType, string> = {
  sucesso: "Sucesso (padrão)",
  erro: "Erro (padrão)",
  atencao: "Atenção (padrão)",
  custom: "ex: Aviso",
};

const TYPE_DEFAULT_DETAIL: Partial<Record<ToastType, string>> = {
  sucesso: "Operação realizada com sucesso!",
  erro: "Ocorreu um erro inesperado.",
  atencao: "Verifique os dados antes de continuar.",
};

function buildSimpleCodeLine(type: ToastType, detail: string, summary: string): string {
  const methodName = METHOD_NAME[type];
  const summaryArg = summary ? `, "${summary}"` : "";
  return `${methodName}("${detail}"${summaryArg});`;
}

function ToastPlaygroundInner() {
  const { toastSucesso, toastErro, toastAtencao, printToast } = useToastSeplag();

  const [type, setType] = useState<ToastType>("sucesso");
  const [detail, setDetail] = useState("Operação realizada com sucesso!");
  const [summary, setSummary] = useState("");
  const [severity, setSeverity] = useState<Severity>("success");
  const [life, setLife] = useState("5000");
  const [sticky, setSticky] = useState(false);

  function dispararToast() {
    if (type === "sucesso") {
      toastSucesso(detail, summary || undefined);
    } else if (type === "erro") {
      toastErro(detail, summary || undefined);
    } else if (type === "atencao") {
      toastAtencao(detail, summary || undefined);
    } else {
      printToast({
        severity,
        summary: summary || severity,
        detail,
        life: sticky ? undefined : Number(life) || 5000,
        sticky,
      });
    }
  }

  const isSimple = type !== "custom";

  const propsLines = isSimple
    ? [`// Chamada direta`, buildSimpleCodeLine(type, detail, summary)]
    : [
        `printToast({`,
        `  severity: "${severity}",`,
        `  summary: "${summary || severity}",`,
        `  detail: "${detail}",`,
        ...(sticky ? [`  sticky: true,`] : [`  life: ${life || 5000},`]),
        `});`,
      ];

  const code = propsLines.join("\n");

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview" style={{ flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
          Clique no botão para disparar o toast configurado abaixo.
        </p>
        <button
          onClick={dispararToast}
          style={{
            padding: "0.5rem 1.5rem",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          <i className="pi pi-bell" /> Disparar Toast
        </button>
      </div>

      <div className="botao-playground-controls">
        {/* Tipo */}
        <div className="pg-field">
          <span className="pg-label">tipo</span>
          <div className="pg-radio-group">
            {TOAST_TYPES.map((t) => (
              <button
                key={t.value}
                className={`pg-radio-btn${type === t.value ? " selected" : ""}`}
                onClick={() => {
                  setType(t.value);
                  const defaultDetail = TYPE_DEFAULT_DETAIL[t.value];
                  if (defaultDetail !== undefined) {
                    setDetail(defaultDetail);
                    setSummary("");
                  }
                  if (t.value === "custom") {
                    setSeverity("info");
                  }
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity — só para custom */}
        {type === "custom" && (
          <div className="pg-field">
            <span className="pg-label">severity</span>
            <div className="pg-radio-group">
              {SEVERITY_OPTIONS.map((s) => (
                <button
                  key={s}
                  className={`pg-radio-btn${severity === s ? " selected" : ""}`}
                  onClick={() => setSeverity(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detail */}
        <div className="pg-field">
          <span className="pg-label">detail</span>
          <input
            className="pg-input"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        {/* Summary */}
        <div className="pg-field">
          <span className="pg-label">summary</span>
          <input
            className="pg-input"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={SUMMARY_PLACEHOLDER[type]}
            style={{ maxWidth: 300 }}
          />
        </div>

        {/* Life + sticky — só para custom */}
        {type === "custom" && (
          <>
            <div className="pg-field">
              <span className="pg-label">life (ms)</span>
              <input
                className="pg-input"
                value={life}
                onChange={(e) => setLife(e.target.value)}
                disabled={sticky}
                style={{ maxWidth: 120 }}
              />
            </div>
            <div className="pg-field">
              <span className="pg-label">sticky</span>
              <div className="pg-checkbox-group">
                <button
                  className={`pg-checkbox-btn${sticky ? " selected" : ""}`}
                  onClick={() => setSticky((v) => !v)}
                >
                  sticky
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <PlaygroundCode code={code} />
    </div>
  );
}

function ToastPlayground() {
  return (
    <ToastProviderSeplag>
      <ToastPlaygroundInner />
    </ToastProviderSeplag>
  );
}

// ─── Seções ──────────────────────────────────────────────────────────────────

const sections: DocSection[] = [
  {
    title: "Playground",
    description: "Experimente os métodos do hook em tempo real.",
    example: <ToastPlayground />,
    code: `// Em qualquer componente dentro do ToastProviderSeplag:
const { toastSucesso, toastErro, toastAtencao, printToast } = useToastSeplag();

toastSucesso("Registro salvo com sucesso!");
toastErro("Falha ao carregar os dados.");
toastAtencao("Verifique os campos obrigatórios.");`,
  },
  {
    title: "Configuração do Provider",
    description:
      "Envolva a raiz da aplicação (ou o layout principal) com ToastProviderSeplag para que o hook funcione em qualquer componente filho.",
    example: null,
    code: `import { ToastProviderSeplag } from "@seplag/ui-lib-react-18";

// main.tsx ou App.tsx
<ToastProviderSeplag>
  <App />
</ToastProviderSeplag>`,
  },
  {
    title: "Métodos atalho",
    description:
      "toastSucesso, toastErro e toastAtencao possuem summary padrão pré-definido e tempo de exibição de 5 segundos.",
    example: null,
    code: `const { toastSucesso, toastErro, toastAtencao } = useToastSeplag();

// Apenas detail — summary padrão é usado
toastSucesso("Cadastro realizado!");
toastErro("Não foi possível salvar.");
toastAtencao("Existem campos inválidos.");

// Sobrescrevendo o summary
toastSucesso("Senha alterada com sucesso!", "Senha atualizada");
toastErro("Sessão expirada.", "Autenticação necessária");`,
  },
  {
    title: "printToast (mensagem customizada)",
    description:
      "Use printToast para controle total sobre todas as propriedades do Toast do PrimeReact.",
    example: null,
    code: `const { printToast } = useToastSeplag();

// Toast informativo que some após 8 segundos
printToast({
  severity: "info",
  summary: "Dica",
  detail: "Use Ctrl+S para salvar rapidamente.",
  life: 8000,
});

// Toast persistente (não some automaticamente)
printToast({
  severity: "warn",
  summary: "Atenção",
  detail: "Há alterações não salvas.",
  sticky: true,
});`,
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

const props: DocProp[] = [
  {
    name: "toastSucesso",
    type: "(detail: string, summary?: string) => void",
    required: false,
    description: 'Exibe toast de sucesso. Summary padrão: "Sucesso". Life: 5000ms.',
  },
  {
    name: "toastErro",
    type: "(detail: string, summary?: string) => void",
    required: false,
    description: 'Exibe toast de erro. Summary padrão: "Erro". Life: 5000ms.',
  },
  {
    name: "toastAtencao",
    type: "(detail: string, summary?: string) => void",
    required: false,
    description: 'Exibe toast de atenção (warn). Summary padrão: "Atenção". Life: 5000ms.',
  },
  {
    name: "printToast",
    type: "(arg: ToastMessage) => void",
    required: false,
    description:
      "Exibe toast com controle total. Aceita todas as props de ToastMessage do PrimeReact (severity, summary, detail, life, sticky, etc.).",
  },
];

// ─── Página ──────────────────────────────────────────────────────────────────

export default function ToastDoc() {
  return (
    <DocPage
      title="useToastSeplag"
      description="Hook para exibir notificações toast. Requer ToastProviderSeplag na árvore de componentes. Disponibiliza atalhos para as severidades mais comuns e acesso direto ao Toast do PrimeReact via printToast."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { ToastProviderSeplag } from "@seplag/ui-lib-react-18";
import { useToastSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
