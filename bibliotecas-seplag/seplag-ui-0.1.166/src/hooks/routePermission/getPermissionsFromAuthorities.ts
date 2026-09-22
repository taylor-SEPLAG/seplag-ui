export interface AutorizacaoSeplag {
  nomeRole: string;
  authority?: string;
}

/**
 * Converte a lista de authorities do usuário (Redux) em `permissions` para
 * hasPermissionByKeysSeplag/useRoutesPermissionSeplag. Retorna `null` enquanto
 * as authorities ainda não chegaram, para manter as rotas liberadas até lá.
 */
export function getPermissionsFromAuthoritiesSeplag(
  authorities: AutorizacaoSeplag[] | null | undefined,
): string[] | null {
  if (!authorities?.length) return null;
  return authorities.map((e) => `${e.authority ?? e.nomeRole}`.toUpperCase());
}
