import type { RouteMixingResp } from "../../uteis/RouteMixins";

export interface RoutesPermissionResultSeplag {
  allowedRoutes: RouteMixingResp[];
  deniedRoutes: RouteMixingResp[];
}

/**
 * Separa rotas em liberadas/negadas conforme as permissões do usuário.
 * Enquanto `permissions` for `null` (ex.: permissões ainda não carregadas),
 * todas as rotas são consideradas liberadas para não expulsar o usuário antes da hora.
 */
export function useRoutesPermissionSeplag(
  routes: RouteMixingResp[],
  permissions: string[] | null,
  hasPermissionByKeys: (
    keys: string[] | null,
    permissions: string[] | null,
  ) => boolean,
): RoutesPermissionResultSeplag {
  const allowedRoutes: RouteMixingResp[] = [];
  const deniedRoutes: RouteMixingResp[] = [];

  for (const route of routes) {
    const semRestricao =
      !route.permissionKeys || route.permissionKeys.length === 0;
    const permitido =
      semRestricao ||
      permissions === null ||
      hasPermissionByKeys(route.permissionKeys, permissions);

    if (permitido) {
      allowedRoutes.push(route);
    } else {
      deniedRoutes.push(route);
    }
  }

  return { allowedRoutes, deniedRoutes };
}
