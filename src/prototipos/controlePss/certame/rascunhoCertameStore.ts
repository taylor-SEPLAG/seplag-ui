import type { ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import type { Aba, CertameFormValues } from "./CertameFormContent";
import type { CargoVagaCertame, CotaCertame, FaseCertame, TipoDocumentoCertame } from "./types";

// Rascunho do cadastro de um NOVO certame (fase "Abertura/Cadastro" — ainda não salvo). Ao sair do
// formulário por qualquer caminho (atalho "Cadastrar nova lei", navegação para outra tela, fechar a
// aba) o progresso é recuperado automaticamente na próxima visita a "Novo certame"; o rascunho é
// descartado somente quando o certame é efetivamente salvo. Não se aplica à edição de um certame já
// existente, cujos dados já ficam persistidos no controlePssStore a cada alteração salva.
// Compartilhado entre o formulário (grava/restaura) e a listagem (sinaliza "em andamento").
export const RASCUNHO_CERTAME_CHAVE = "controlePss:certame:rascunhoNovo";

export interface RascunhoCertame {
 tipoConfirmado:boolean; aba:Aba; valores:CertameFormValues;
 cotas:CotaCertame[]; cargos:CargoVagaCertame[]; fases:FaseCertame[];
 arquivos:Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>;
}

export function lerRascunhoCertame():RascunhoCertame | null {
 try {
  const bruto = window.localStorage.getItem(RASCUNHO_CERTAME_CHAVE);
  return bruto ? JSON.parse(bruto) as RascunhoCertame : null;
 } catch { return null; }
}

export function salvarRascunhoCertame(rascunho:RascunhoCertame) {
 try { window.localStorage.setItem(RASCUNHO_CERTAME_CHAVE, JSON.stringify(rascunho)); } catch { /* localStorage indisponível (modo privado/quota) — segue sem persistir */ }
}

export function limparRascunhoCertame() {
 try { window.localStorage.removeItem(RASCUNHO_CERTAME_CHAVE); } catch { /* noop */ }
}
