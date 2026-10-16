import type { Certame, CargoVagaCertame } from './types';

/** Cadastro parcial: campos obrigatórios desconhecidos não recebem valores inventados. */
export interface CertameBasicoIngresso extends Pick<Certame,'id'|'tipoCertame'|'setor'|'setoresParticipantes'|'numeroEditalOrgao'|'nomeEdital'|'anoConcurso'|'situacaoAtual'> {
  origem: 'GESTAO_INGRESSO';
  gestaoIngressoId: number;
  criadoEm: string;
  atualizadoEm: string;
  pendenteComplementacao: true;
  camposPendentes: string[];
  vagasTotaisEdital?: number;
  cadastroReservaEdital?: number;
  distribuicaoVagasPendente: true;
  cargos: readonly CargoVagaCertame[];
  cargosConhecidos: {cargo: string; orgao: string; polo?: string; tipoVaga?: string}[];
}
export const CHAVE_CERTAMES_BASICOS_INGRESSO = 'sigep:certames:origem-gestao-ingresso';
export function lerCertamesBasicosIngresso(): CertameBasicoIngresso[] {
  try {const dados=JSON.parse(localStorage.getItem(CHAVE_CERTAMES_BASICOS_INGRESSO) || '[]');return Array.isArray(dados) ? dados : [];} catch {return [];}
}
