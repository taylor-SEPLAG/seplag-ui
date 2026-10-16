import type { Certame } from '../controlePss/certame/types';
export type CertameConsultaIngresso = Pick<Certame,'id'|'tipoCertame'|'setor'|'setoresParticipantes'|'numeroEditalOrgao'|'nomeEdital'|'anoConcurso'|'situacaoAtual'|'cargos'> & {
  gestaoIngressoId?: number; vagasTotaisEdital?: number; cadastroReservaEdital?: number; distribuicaoVagasPendente?: boolean;
};

export interface IdentificacaoEditalIngresso {
  certameId?: string;
  edital: string;
  tipo: 'Concurso' | 'Processo Seletivo';
  orgao: string;
  id?: number;
}

export const normalizarIdentificacao = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
export function chaveEditalIngresso(numero: string, tipo: string, orgao: string) {
  const partes = numero.match(/(\d+)\s*\/\s*(\d{4})/);
  return partes ? `${tipo}|${Number(partes[1])}|${partes[2]}|${normalizarIdentificacao(orgao)}` : '';
}

/** Só relaciona um cadastro quando sua identificação é inequívoca. */
export function localizarCertameIngresso<T extends CertameConsultaIngresso>(edital: IdentificacaoEditalIngresso, certames: readonly T[]) {
  const vinculados=certames.filter(c => edital.certameId ? c.id === edital.certameId : edital.id !== undefined && c.gestaoIngressoId === edital.id);
  if (vinculados.length) return vinculados.length === 1 ? vinculados[0] : undefined;
  const correspondencias = certames.filter(c => chaveEditalIngresso(c.numeroEditalOrgao, c.tipoCertame === 'CONCURSO_PUBLICO' ? 'Concurso' : 'Processo Seletivo', c.setor)
      === chaveEditalIngresso(edital.edital, edital.tipo, edital.orgao));
  return correspondencias.length === 1 ? correspondencias[0] : undefined;
}

export const quantidadeValida = (valor: unknown): valor is number => typeof valor === 'number' && Number.isSafeInteger(valor) && valor >= 0;
export function quantitativosCertameIngresso(certame?: CertameConsultaIngresso) {
  if (certame?.distribuicaoVagasPendente) return {
    vagas: quantidadeValida(certame.vagasTotaisEdital) ? certame.vagasTotaisEdital : undefined,
    cadastroReserva: quantidadeValida(certame.cadastroReservaEdital ?? 0) ? certame.cadastroReservaEdital ?? 0 : undefined,
  };
  if (!certame || !certame.cargos.length) return { vagas: undefined, cadastroReserva: undefined };
  // O id do cargo identifica a oferta, mesmo se uma integração repetir a mesma linha.
  const cargos = [...new Map(certame.cargos.map(c => [c.id,c])).values()];
  const vagas = cargos.every(c => quantidadeValida(c.quantidadeVagas)) ? cargos.reduce((s,c) => s+c.quantidadeVagas,0) : undefined;
  const reservas = cargos.map(c => c.aceitaCadastroReserva === false ? 0 : c.quantidadeCadastroReserva ?? 0);
  const cadastroReserva = reservas.every(quantidadeValida) ? reservas.reduce((s,q) => s+q,0) : undefined;
  return { vagas, cadastroReserva };
}

/** Totais já cadastrados em Ver detalhes também atendem editais legados sem vínculo com o certame. */
export function quantitativosEditalIngresso(edital: IdentificacaoEditalIngresso & {quantidadeVagas?: number; quantidadeCadastroReserva?: number}, certames: readonly CertameConsultaIngresso[]) {
  const certame = localizarCertameIngresso(edital,certames);
  if (certame) return quantitativosCertameIngresso(certame);
  return {
    vagas: quantidadeValida(edital.quantidadeVagas) ? edital.quantidadeVagas : undefined,
    cadastroReserva: quantidadeValida(edital.quantidadeCadastroReserva ?? 0) ? edital.quantidadeCadastroReserva ?? 0 : undefined,
  };
}
