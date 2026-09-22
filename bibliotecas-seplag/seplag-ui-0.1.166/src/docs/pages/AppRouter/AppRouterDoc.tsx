import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { useState } from "react";

// AppRouterSeplag renderiza <Routes>/<Route> do react-router-dom diretamente — ele espera
// estar dentro de UM router já existente (o BrowserRouter da aplicação hospedeira). Como esta
// própria doc já roda dentro do BrowserRouter do app de docs, não é possível aninhar aqui um
// segundo <Router> (nem MemoryRouter) só para isolar um playground: o react-router recusa
// qualquer <Router> dentro de outro <Router>, sempre. Por isso o playground abaixo simula a
// decisão de allowedRoutes vs. deniedRoutes com estado local, sem montar rotas reais.

function AppRouterPlayground() {
  const [temPermissaoAuditoria, setTemPermissaoAuditoria] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <input
          type="checkbox"
          checked={temPermissaoAuditoria}
          onChange={(e) => setTemPermissaoAuditoria(e.target.checked)}
        />
        Usuário tem permissão AUDITORIA_VISUALIZAR
      </label>
      <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 0 }}>
        Simulação do resultado de navegar para <code>/app/auditoria</code> — não é um router de
        verdade (ver nota acima), só o mesmo cálculo de allowedRoutes/deniedRoutes que o
        AppRouterSeplag faz internamente.
      </p>

      <div style={{ border: "1px dashed #94a3b8", borderRadius: 6, padding: "0.75rem" }}>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#475569" }}>
          Layout do app (rota: /app/auditoria)
        </div>
        {temPermissaoAuditoria ? (
          <div style={{ padding: "1rem", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc" }}>
            Conteúdo da página <strong>Auditoria</strong>
          </div>
        ) : (
          <div style={{ padding: "1rem", border: "1px solid #fecaca", borderRadius: 6, background: "#fef2f2", color: "#991b1b" }}>
            <strong>PermissaoNegadaRedirectSeplag</strong> — sem AUDITORIA_VISUALIZAR, o usuário é
            redirecionado para welcomePath ("/app/bemvindo") com um toast de aviso.
          </div>
        )}
      </div>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "AppRouterSeplag precisa estar dentro de um único <Router> raiz (BrowserRouter da aplicação) para funcionar — não é possível isolar um router de verdade dentro desta página de docs. A simulação abaixo reproduz o resultado (liberado vs. negado) com o mesmo dado de entrada (allowedRoutes/deniedRoutes) que o componente real usa.",
    example: <AppRouterPlayground />,
    code: `import { AppRouterSeplag } from "@seplag/ui-lib-react-18";
import Route from "@uteis/RouteMixins";

const allowedRoutes = [
  Route("cargos", "Cargos", "/app/cargos", CargosPage, null),
  ...(temPermissaoAuditoria
    ? [Route("auditoria", "Auditoria", "/app/auditoria", AuditoriaPage, ["AUDITORIA_VISUALIZAR"])]
    : []),
];

const deniedRoutes = temPermissaoAuditoria
  ? []
  : [Route("auditoria", "Auditoria", "/app/auditoria", AuditoriaPage, ["AUDITORIA_VISUALIZAR"])];

// no bootstrap da aplicação, dentro de um único <BrowserRouter>:
<AppRouterSeplag
  layout={AppLayout}
  paginaInicial={PaginaInicialSeplag}
  allowedRoutes={allowedRoutes}
  deniedRoutes={deniedRoutes}
  welcomePath="/app/bemvindo"
/>`,
  },
  {
    title: "Estrutura de rotas gerada",
    description:
      "Internamente, o AppRouterSeplag monta: redirecionamento de \"/\" para \"/app\", o Layout em \"/app\" com uma <Route> por item de allowedRoutes, uma <Route> de redirecionamento (via PermissaoNegadaRedirectSeplag) por item de deniedRoutes, redirecionamento de \"/app\" para welcomePath, a rota welcomePath apontando para paginaInicial, e um catch-all \"*\" apontando para notFound.",
    example: (
      <pre style={{ background: "#0f172a", color: "#e2e8f0", padding: "1rem", borderRadius: 6, overflowX: "auto", fontSize: "0.8rem" }}>
{`<Routes>
  <Route path="/" element={<Navigate to="/app" replace />} />
  <Route path="/app" element={<Layout />}>
    {allowedRoutes.map((r) => <Route path={r.to} Component={r.component} />)}
    {deniedRoutes.map((r) => (
      <Route path={r.to} element={<PermissaoNegadaRedirectSeplag redirectTo={welcomePath} />} />
    ))}
    <Route path="/app" element={<Navigate to={welcomePath} replace />} />
    <Route path={welcomePath} element={<PaginaInicial />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>`}
      </pre>
    ),
    code: "",
  },
];

const props: DocProp[] = [
  { name: "layout", type: "ComponentType", required: true, description: "Layout que envolve as rotas liberadas (renderizado em \"/app\", com as rotas filhas via <Outlet />)." },
  { name: "notFound", type: "ComponentType", defaultValue: "NotFoundSeplag", description: "Página exibida para rotas inexistentes (\"*\")." },
  { name: "paginaInicial", type: "ComponentType", required: true, description: "Página inicial, exibida em welcomePath." },
  { name: "allowedRoutes", type: "RouteMixingResp[]", required: true, description: "Rotas liberadas para o usuário — cada uma vira uma <Route> normal dentro do layout." },
  { name: "deniedRoutes", type: "RouteMixingResp[]", required: true, description: "Rotas sem permissão — o caminho é registrado, mas renderiza PermissaoNegadaRedirectSeplag (redireciona para welcomePath com toast)." },
  { name: "welcomePath", type: "string", defaultValue: '"/app/bemvindo"', description: "Rota de boas-vindas, usada como destino padrão (\"/app\") e de redirecionamento para deniedRoutes." },
];

export default function AppRouterDoc() {
  return (
    <DocPage
      title="AppRouter"
      badge="Estável"
      since="v0.1.153"
      description="Monta a árvore de rotas padrão do sistema (react-router-dom): redirecionamentos de raiz, layout autenticado, rotas liberadas, rotas negadas (com redirecionamento e aviso) e página 404. Centraliza o padrão de roteamento usado por todos os sistemas baseados na SeplagUi."
      importStatement={`import { AppRouterSeplag } from "@seplag/ui-lib-react-18";
import type { AppRouterSeplagProps } from "@seplag/ui-lib-react-18";
import type { RouteMixingResp } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
