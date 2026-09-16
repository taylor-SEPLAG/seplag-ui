import { useLocation } from "react-router-dom";
import { NovoQuadroComissionadoContent } from "./NovoQuadroComissionadoContent";
import { QuadroAutorizadoComissionadoLista } from "./QuadroAutorizadoComissionadoLista";

/**
 * Roteador exclusivo do quadro comissionado.
 * A tela não utiliza mais o fluxo, as regras nem os estilos legados de efetivos.
 */
export function QuadroAutorizadoContent() {
  const { pathname } = useLocation();
  const exibeFormulario =
    pathname.endsWith("/novo") ||
    pathname.endsWith("/editar") ||
    pathname.endsWith("/nova-versao");

  return exibeFormulario
    ? <NovoQuadroComissionadoContent />
    : <QuadroAutorizadoComissionadoLista />;
}
