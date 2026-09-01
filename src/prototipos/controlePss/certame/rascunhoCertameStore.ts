import type { ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import type { Aba, CertameFormValues } from "./CertameFormContent";
import type { CargoVagaCertame, CotaCertame, FaseCertame, TaxaInscricaoCertame, TipoDocumentoCertame } from "./types";

// Rascunhos de certames NOVOS ainda não salvos (fase "Abertura/Cadastro"). Vários concursos/PSS
// podem chegar simultaneamente, então mais de um rascunho pode existir ao mesmo tempo — cada um
// identificado por `id` (gerado ao abrir "Novo certame", carregado de volta via ?rascunho=<id> na
// URL ao clicar em "Continuar cadastro"). Descartado somente quando o certame correspondente é
// efetivamente salvo (vira um registro real) ou quando o usuário aciona "Descartar" na listagem.
// Não se aplica à edição de um certame já existente, cujos dados já ficam persistidos no
// controlePssStore a cada alteração salva. Compartilhado entre o formulário (grava/restaura) e a
// listagem (sinaliza "em andamento").
export const RASCUNHOS_CERTAME_CHAVE = "controlePss:certame:rascunhosNovo";

export interface RascunhoCertame {
 readonly id:string;
 tipoConfirmado:boolean; aba:Aba; valores:CertameFormValues;
 cotas:CotaCertame[]; cargos:CargoVagaCertame[]; fases:FaseCertame[]; taxasInscricao:TaxaInscricaoCertame[];
 arquivos:Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>;
}

export function novoRascunhoCertameId():string {
 return `RASCUNHO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function lerRascunhosCertame():RascunhoCertame[] {
 try {
  const bruto = window.localStorage.getItem(RASCUNHOS_CERTAME_CHAVE);
  return bruto ? JSON.parse(bruto) as RascunhoCertame[] : [];
 } catch { return []; }
}

export function lerRascunhoCertame(id:string):RascunhoCertame | null {
 return lerRascunhosCertame().find((item) => item.id === id) ?? null;
}

export function salvarRascunhoCertame(rascunho:RascunhoCertame) {
 try {
  const atuais = lerRascunhosCertame();
  const proximos = atuais.some((item) => item.id === rascunho.id)
   ? atuais.map((item) => item.id === rascunho.id ? rascunho : item)
   : [...atuais, rascunho];
  window.localStorage.setItem(RASCUNHOS_CERTAME_CHAVE, JSON.stringify(proximos));
 } catch { /* localStorage indisponível (modo privado/quota) — segue sem persistir */ }
}

export function limparRascunhoCertame(id:string) {
 try { window.localStorage.setItem(RASCUNHOS_CERTAME_CHAVE, JSON.stringify(lerRascunhosCertame().filter((item) => item.id !== id))); } catch { /* noop */ }
}
