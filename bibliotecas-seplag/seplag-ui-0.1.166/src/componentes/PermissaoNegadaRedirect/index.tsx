import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useToastSeplag } from "../../hooks/toast/useToast";

export interface PermissaoNegadaRedirectSeplagProps {
  /** Rota para onde o usuário é redirecionado. */
  readonly redirectTo: string;
  /** Mensagem exibida no toast de aviso. */
  readonly mensagem?: string;
}

export function PermissaoNegadaRedirectSeplag({
  redirectTo,
  mensagem = "Você não tem permissão para acessar esta página.",
}: PermissaoNegadaRedirectSeplagProps) {
  const { toastAtencao } = useToastSeplag();
  const avisadoRef = useRef(false);

  useEffect(() => {
    if (avisadoRef.current) return;
    avisadoRef.current = true;
    toastAtencao(mensagem);
  }, [mensagem]);

  return <Navigate to={redirectTo} replace />;
}
