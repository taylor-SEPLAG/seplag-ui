import { useSelector } from "react-redux";

type Authority = { nomeRole: string };
type HostState = {
  userReducer?: { user?: { contaAcesso?: { authorities?: Authority[] } } };
};

export type PaginaInicialPermissionSet = {
  nome: string;
  visualizar: string;
  incluir: string;
  editar: string;
  deletar: string;
};

export const DefaultPermissionsInformativoSeplag: PaginaInicialPermissionSet = {
  nome: "ROLE_INFORMATIVO",
  visualizar: "ROLE_INFORMATIVO_VISUALIZAR",
  incluir: "ROLE_INFORMATIVO_INCLUIR",
  editar: "ROLE_INFORMATIVO_EDITAR",
  deletar: "ROLE_INFORMATIVO_DELETAR",
};

export const DefaultPermissionsCicloCronogramaSeplag: PaginaInicialPermissionSet = {
  nome: "ROLE_CICLO_PAGAMENTO",
  visualizar: "ROLE_CICLO_PAGAMENTO_VISUALIZAR",
  incluir: "ROLE_CICLO_PAGAMENTO_INCLUIR",
  editar: "ROLE_CICLO_PAGAMENTO_EDITAR",
  deletar: "ROLE_CICLO_PAGAMENTO_DELETAR",
};

export function usePaginaInicialPermissionsSeplag(permissions: PaginaInicialPermissionSet) {
  const auths = useSelector(
    (state: HostState) => state.userReducer?.user?.contaAcesso?.authorities ?? [],
  );
  const admin = auths.some(({ nomeRole }) => nomeRole === "ROLE_ADMIN");
  const authorities = new Set(
    auths
      .filter(({ nomeRole }) => nomeRole.includes(permissions.nome))
      .map(({ nomeRole }) => nomeRole),
  );
  return {
    podeVisualizar: authorities.has(permissions.visualizar) || admin,
    podeIncluir: authorities.has(permissions.incluir) || admin,
    podeEditar: authorities.has(permissions.editar) || admin,
    podeDeletar: authorities.has(permissions.deletar) || admin,
  };
}
