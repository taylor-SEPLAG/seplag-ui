import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { ToastProviderSeplag } from "../../../provider/printToast";
import { useToastSeplag } from "../../../hooks/toast";
import { useState } from "react";

// PermissaoNegadaRedirectSeplag sempre retorna <Navigate>, que aqui dentro da doc navegaria
// DE VERDADE (a doc roda em uma rota real, /seplagui/docs/:id — não há como isolar isso como
// um MemoryRouter, que o react-router recusa aninhar). Redirecionar para a própria página causa
// um ciclo de remontagem que quebra a renderização. Por isso o playground abaixo NÃO monta o
// componente real: ele dispara o mesmo toast (via useToastSeplag, que é o efeito colateral que
// o componente executa antes do <Navigate>) e descreve textualmente o redirecionamento.

function PermissaoNegadaRedirectPlaygroundInterno() {
  const { toastAtencao } = useToastSeplag();
  const [redirecionamentos, setRedirecionamentos] = useState(0);
  const [mensagem, setMensagem] = useState("Você não tem permissão para acessar esta página.");
  const redirectTo = "/app/bemvindo";

  function simular() {
    toastAtencao(mensagem);
    setRedirecionamentos((atual) => atual + 1);
  }

  return (
    <div>
      <div style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 480 }}>
        <label htmlFor="pnr-msg" style={{ fontWeight: 600 }}>
          Mensagem do toast
        </label>
        <input
          id="pnr-msg"
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "0.5rem 0.75rem" }}
        />
      </div>

      <button
        type="button"
        onClick={simular}
        style={{ border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        Simular acesso a uma rota sem permissão
      </button>

      <div style={{ marginTop: "0.75rem", color: "#64748b" }}>
        Redirecionamentos disparados nesta página de doc: {redirecionamentos}
        {redirecionamentos > 0 && (
          <> — o usuário seria enviado para <code>{redirectTo}</code> (via <code>{"<Navigate replace />"}</code>, não simulado aqui para não navegar a doc de verdade).</>
        )}
      </div>
    </div>
  );
}

function PermissaoNegadaRedirectPlayground() {
  return (
    <ToastProviderSeplag>
      <PermissaoNegadaRedirectPlaygroundInterno />
    </ToastProviderSeplag>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "PermissaoNegadaRedirectSeplag sempre retorna <Navigate>, que aqui navegaria de verdade dentro desta página de docs (não é possível isolar isso, como não é possível isolar o AppRouterSeplag — ver a nota naquela doc). Por isso o botão abaixo simula só o efeito colateral do componente: o toast de aviso, disparado com useToastSeplag antes do redirecionamento real.",
    example: <PermissaoNegadaRedirectPlayground />,
    code: `import { PermissaoNegadaRedirectSeplag } from "@seplag/ui-lib-react-18";

// Usado tipicamente como elemento de uma <Route> cujo acesso foi negado
// (dentro de um único <BrowserRouter> raiz — ver nota da doc do AppRouter):
<Route
  path="/app/cadastro/restrito"
  element={<PermissaoNegadaRedirectSeplag redirectTo="/app/bemvindo" />}
/>`,
  },
  {
    title: "Mensagem customizada",
    description: "Use mensagem para adaptar o texto do toast de aviso ao contexto da rota negada.",
    example: (
      <div style={{ color: "#64748b" }}>
        Veja o campo de mensagem no Playground acima — ele é repassado diretamente para a prop mensagem.
      </div>
    ),
    code: `<PermissaoNegadaRedirectSeplag
  redirectTo="/app/bemvindo"
  mensagem="Você não tem permissão para editar certames deste polo."
/>`,
  },
];

const props: DocProp[] = [
  { name: "redirectTo", type: "string", required: true, description: "Rota para onde o usuário é redirecionado (via <Navigate replace>)." },
  { name: "mensagem", type: "string", defaultValue: '"Você não tem permissão para acessar esta página."', description: "Mensagem exibida no toast de aviso, disparada uma única vez ao montar o componente." },
];

export default function PermissaoNegadaRedirectDoc() {
  return (
    <DocPage
      title="PermissaoNegadaRedirect"
      badge="Estável"
      since="v0.1.153"
      description="Componente de rota usado para redirecionar o usuário e avisá-lo (via toast) quando ele tenta acessar uma rota para a qual não tem permissão. Usado internamente pelo AppRouterSeplag para as rotas negadas (deniedRoutes)."
      importStatement={`import { PermissaoNegadaRedirectSeplag } from "@seplag/ui-lib-react-18";
import type { PermissaoNegadaRedirectSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
