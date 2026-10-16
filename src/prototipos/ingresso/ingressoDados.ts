import { useEffect, useState } from 'react';
import { ingressoConcursosProcessosMock, ingressosMock, integracoesIngressoMock, type IngressoCandidatoRow, type IngressoSituacao } from '../PrototiposPage';
import { getOrgaoAtuacaoIngresso, getPerfilVariacaoIngresso, podeConsultarIngresso, type PerfilVariacaoIngresso } from './perfilVariacao';

export const EVENTO_DADOS_INGRESSO = 'sigep:ingressos-atualizados';
let notificacaoPendente = false;
export function persistirDadoIngresso(chave: string, valor: string) {
  localStorage.setItem(chave, valor);
  if (!notificacaoPendente) {
    notificacaoPendente = true;
    queueMicrotask(() => { notificacaoPendente = false; window.dispatchEvent(new Event(EVENTO_DADOS_INGRESSO)); });
  }
}
export function useRevisaoDadosIngresso() {
  const [revisao, setRevisao] = useState(0);
  useEffect(() => {
    const atualizar = () => setRevisao(r => r + 1);
    window.addEventListener(EVENTO_DADOS_INGRESSO, atualizar);
    window.addEventListener('storage', atualizar);
    window.addEventListener('focus', atualizar);
    return () => { window.removeEventListener(EVENTO_DADOS_INGRESSO, atualizar); window.removeEventListener('storage', atualizar); window.removeEventListener('focus', atualizar); };
  }, []);
  return revisao;
}
export function lerDadoIngresso<T>(chave: string, padrao: T): T {
  try { return JSON.parse(localStorage.getItem(chave) || 'null') ?? padrao; } catch { return padrao; }
}
export function persistirSituacaoDoEdital(edital: string, id: number | string, situacao: IngressoSituacao) {
  const atuais = lerDadoIngresso<Record<string, Record<string, IngressoSituacao>>>('prototype-ingresso-situacoes-concursos', {});
  const origem = ingressoConcursosProcessosMock.find(e => e.titulo === edital);
  const candidato = origem && candidatosAtuaisEdital(origem).find(c => String(c.id) === String(id));
  const anterior = origem && candidato ? situacaoAtualIngresso(origem,candidato) : atuais[edital]?.[id];
  if (origem?.tipo === 'Concurso' && [situacao,anterior].some(s => s && ['Aguardando Efetivo Exercicio','Aguardando Termo Assinado','Ingresso Concluído'].includes(s))) {
    const posses = lerDadoIngresso<Record<string, boolean>>('prototype-ingresso-posses-confirmadas', {});
    persistirDadoIngresso('prototype-ingresso-posses-confirmadas',JSON.stringify({...posses,[`${edital}|${id}`]:true}));
  }
  persistirDadoIngresso('prototype-ingresso-situacoes-concursos', JSON.stringify({ ...atuais, [edital]: { ...atuais[edital], [id]: situacao } }));
}
const pendentes = new Set<string>(['Aguardando Analise', 'Aguardando análise documento', 'Em analise', 'Aguardando Efetivo Exercicio', 'Aguardando Termo Assinado', 'Posse Suspensa']);
const encerrados = new Set<string>(['Posse Negada', 'Tornado sem efeito', 'Exoneração de oficio', 'Ingresso Cancelado']);
export function categoriaIngresso(situacao?: string): 'pendente' | 'ingressado' | 'encerrado' | undefined {
  if (situacao === 'Ingresso Concluído') return 'ingressado';
  if (situacao && pendentes.has(situacao)) return 'pendente';
  if (situacao && encerrados.has(situacao)) return 'encerrado';
  return undefined;
}
type EditalFonte = typeof ingressoConcursosProcessosMock[number];
export function posseRegistradaIngresso(edital: EditalFonte, candidato: IngressoCandidatoRow, situacao?: string) {
  return edital.tipo === 'Concurso' && (candidato.posseConfirmada === true
    || Boolean(lerDadoIngresso<Record<string, boolean>>('prototype-ingresso-posses-confirmadas',{})[`${edital.titulo}|${candidato.id}`])
    || ['Aguardando Efetivo Exercicio','Aguardando Termo Assinado','Ingresso Concluído'].includes(situacao || ''));
}
export function naoComparecimentoIngresso(edital: EditalFonte, candidato: IngressoCandidatoRow, situacao?: string) {
  if (situacao !== 'Exoneração de oficio' && situacao !== 'Ingresso Cancelado') return false;
  const cancelamentos = lerDadoIngresso<Record<string,{motivo?:string}>>('prototype-ingresso-cancelamentos',{});
  const motivo = cancelamentos[`${edital.titulo}|${candidato.id}`]?.motivo ?? cancelamentos[candidato.id]?.motivo;
  if (motivo !== undefined) return motivo === 'nao-comparecimento';
  const confirmados = lerDadoIngresso<Record<string,boolean>>('prototype-ingresso-cancelamentos-estagio-nao-comparecimento',{});
  if (confirmados[`${edital.titulo}|${candidato.id}`]) return true;
  const historicos = lerDadoIngresso<Record<string,{titulo?:string;descricao?:string}[]>>('prototype-ingresso-historico-efetivo-exercicio',{});
  return (historicos[`${edital.titulo}|${candidato.id}`] || []).some(h => /n[aã]o comparec/i.test(`${h.titulo || ''} ${h.descricao || ''}`));
}
export function situacaoAtualIngresso(edital: EditalFonte, candidato: IngressoCandidatoRow): IngressoSituacao | undefined {
  const porEdital = lerDadoIngresso<Record<string, Record<string, IngressoSituacao>>>('prototype-ingresso-situacoes-concursos', {});
  const globais = lerDadoIngresso<Record<string, IngressoSituacao>>('prototype-ingresso-situacoes', {});
  const possuiEscopo = Object.values(porEdital).some(situacoes => situacoes[candidato.id] !== undefined);
  let situacao = porEdital[edital.titulo]?.[candidato.id] ?? (!possuiEscopo ? globais[candidato.id] : undefined) ?? candidato.situacao
    ?? ingressosMock.find(i => i.id === candidato.id)?.situacao;
  if ((situacao as string) === 'Ingresso cancelado') situacao = 'Ingresso Cancelado';
  if (edital.tipo === 'Processo Seletivo' && situacao === 'Exoneração de oficio') situacao = 'Ingresso Cancelado';
  return situacao;
}
export function candidatosAtuaisEdital(edital: EditalFonte) {
  const criados = lerDadoIngresso<Record<string, IngressoCandidatoRow[]>>('prototype-ingresso-registros-concursos', {});
  const excluidos = new Set(lerDadoIngresso<Record<string, number[]>>('prototype-ingresso-exclusoes-concursos', {})[edital.titulo] || []);
  const identificador = `${edital.edital.replace(/^Edital\s*/i, '')}/${edital.orgao}`;
  const recebido = edital.candidatosRecebidos !== false || integracoesIngressoMock.some(i => i.edital === identificador && ['Concluída', 'Concluída com alertas'].includes(i.situacao));
  const candidatos = new Map((recebido ? edital.candidatos : []).map(c => [c.id, c]));
  (criados[edital.titulo] || []).forEach(c => candidatos.set(c.id, c));
  return [...candidatos.values()].filter(c => !excluidos.has(c.id));
}
export function lerRegistrosIngresso(perfil: PerfilVariacaoIngresso = getPerfilVariacaoIngresso(), orgao = getOrgaoAtuacaoIngresso()) {
  const destinos = lerDadoIngresso<Record<string, { responsavelAnalise: string }>>('prototype-ingresso-direcionamentos-analise', {});
  const orgaos = lerDadoIngresso<Record<string, string>>('prototype-ingresso-orgaos-encaminhados', {});
  return ingressoConcursosProcessosMock.flatMap(edital => candidatosAtuaisEdital(edital).filter(c =>
    podeConsultarIngresso(perfil, orgao, edital.orgao, edital.tipo === 'Processo Seletivo' ? destinos[c.id]?.responsavelAnalise : undefined, orgaos[c.id]))
    .map(candidato => ({ id: `${edital.id}:${candidato.id}`, edital, candidato, situacao: situacaoAtualIngresso(edital, candidato) })));
}
export function quantitativosIngresso(registros: { id: string; situacao?: string }[]) {
  const unicos = [...new Map(registros.map(r => [r.id, r])).values()];
  const contar = (categoria: string) => unicos.filter(r => categoriaIngresso(r.situacao) === categoria).length;
  return { nomeados: unicos.length, pendentes: contar('pendente'), ingressados: contar('ingressado'), encerradosSemIngresso: contar('encerrado') };
}
