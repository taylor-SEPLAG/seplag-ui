import type { ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import type { RouteMixingResp } from "../../uteis/RouteMixins";
import { NotFoundSeplag } from "../NotFound/NotFound";
import { PermissaoNegadaRedirectSeplag } from "../PermissaoNegadaRedirect";

export interface AppRouterSeplagProps {
  /** Layout que envolve as rotas liberadas (renderizado em "/app"). */
  readonly layout: ComponentType;
  /** Página exibida para rotas inexistentes ("*"). @default NotFoundSeplag */
  readonly notFound?: ComponentType;
  /** Página inicial, exibida em `welcomePath`. */
  readonly paginaInicial: ComponentType;
  /** Rotas liberadas para o usuário. */
  readonly allowedRoutes: RouteMixingResp[];
  /** Rotas sem permissão — renderizadas com redirecionamento para `welcomePath`. */
  readonly deniedRoutes: RouteMixingResp[];
  /** Rota de boas-vindas, usada como destino padrão e de redirecionamento. Default: "/app/bemvindo". */
  readonly welcomePath?: string;
}

export function AppRouterSeplag({
  layout: Layout,
  notFound: NotFound = NotFoundSeplag,
  paginaInicial: PaginaInicial,
  allowedRoutes,
  deniedRoutes,
  welcomePath = "/app/bemvindo",
}: AppRouterSeplagProps) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/app" element={<Layout />}>
        {allowedRoutes.map((route) => (
          <Route key={route.to} path={`${route.to}`} Component={route.component} />
        ))}

        {deniedRoutes.map((route) => (
          <Route
            key={route.to}
            path={`${route.to}`}
            element={<PermissaoNegadaRedirectSeplag redirectTo={welcomePath} />}
          />
        ))}

        <Route path="/app" element={<Navigate to={welcomePath} replace />} />
        <Route path={welcomePath} element={<PaginaInicial />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
