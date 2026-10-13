import { ingressoConcursosProcessosMock, ingressosMock, integracoesIngressoMock, type IngressoSituacao, type IngressoCandidatoRow } from '../PrototiposPage';
import { getPerfilVariacaoIngresso, getOrgaoAtuacaoIngresso, podeConsultarIngresso } from './perfilVariacao';

export const BASE_DASHBOARD = '/prototipos/sigep/ingressos/dashboard';
export const SITUACOES: { value: IngressoSituacao; label: string; color: string; icon: string; description: string; tipo?: string }[] = [
  { value: 'Aguardando Analise', label: 'Aguardando Análise', color: '#df7908', icon: 'pi-clock', description: 'Documentação aguardando avaliação.' },
  { value: 'Em analise', label: 'Em Análise', color: '#1976d2', icon: 'pi-search', description: 'Ingresso em avaliação pela equipe.' },
  { value: 'Aguardando Efetivo Exercicio', label: 'Aguardando Efetivo Exercício', color: '#b32e98', icon: 'pi-briefcase', description: 'Aguardando o início do exercício.' },
  { value: 'Aguardando Termo Assinado', label: 'Aguardando Termo Assinado', color: '#07849e', icon: 'pi-file-edit', description: 'Documento pendente de assinatura.' },
  { value: 'Ingresso Concluído', label: 'Ingresso Concluído', color: '#15834f', icon: 'pi-check-circle', description: 'Ingresso finalizado no sistema.' },
  { value: 'Posse Suspensa', label: 'Posse Suspensa', color: '#753ac4', icon: 'pi-pause-circle', description: 'Prazo pausado; processo pode continuar.', tipo: 'Concurso' },
  { value: 'Posse Negada', label: 'Posse Negada', color: '#c92e42', icon: 'pi-ban', description: 'Posse negada; processo encerrado.', tipo: 'Concurso' },
  { value: 'Tornado sem efeito', label: 'Tornado sem Efeito', color: '#63758a', icon: 'pi-minus-circle', description: 'Ato tornado sem efeito.', tipo: 'Concurso' },
  { value: 'Exoneração de oficio', label: 'Exoneração de Ofício', color: '#43667d', icon: 'pi-sign-out', description: 'Encerrado por exoneração de ofício.', tipo: 'Concurso' },
  { value: 'Ingresso Cancelado', label: 'Ingresso Cancelado', color: '#dc3545', icon: 'pi-times-circle', description: 'Ingresso encerrado por cancelamento.', tipo: 'Processo Seletivo' },
  { value: 'Encerrado por desistência', label: 'Encerrado por desistência', color: '#995042', icon: 'pi-times', description: 'Processo encerrado por desistência.' },
];
export interface RegistroDashboard {
  id: string; candidatoId: number; nome: string; cargo: string; orgao: string; edital: string; editalId: number;
  processo: string; tipo: 'Concurso' | 'Processo Seletivo'; situacao: IngressoSituacao;
  inicio: string; conclusao: string; limitePosse: string; url: string;
}
export type FiltrosDashboard = { tipo: string; edital: string; orgao: string; cargo: string; inicio: string; fim: string; situacao: string; pendentes: string };
export const filtrosIniciais: FiltrosDashboard = { tipo: '', edital: '', orgao: '', cargo: '', inicio: '', fim: '', situacao: '', pendentes: '' };
const definitivos = new Set(['Posse Negada', 'Tornado sem efeito', 'Exoneração de oficio', 'Ingresso Cancelado', 'Encerrado por desistência']);
export const pendente = (r: RegistroDashboard) => r.situacao !== 'Ingresso Concluído' && !definitivos.has(r.situacao);
export const dataIso = (value?: string) => {
  if (!value || value === '-') return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};
function ler<T>(key: string): T { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {} as T; } }
const demo: Record<number, IngressoSituacao> = { 1: 'Tornado sem efeito', 2: 'Tornado sem efeito', 3: 'Tornado sem efeito', 4: 'Tornado sem efeito', 5: 'Tornado sem efeito', 6: 'Exoneração de oficio', 7: 'Posse Negada', 8: 'Ingresso Concluído', 14: 'Em analise', 15: 'Em analise', 16: 'Ingresso Concluído', 17: 'Aguardando Analise', 18: 'Aguardando Analise', 19: 'Aguardando Analise' };
export function lerDadosDashboard(): RegistroDashboard[] {
  const salvas = ler<Record<string, string>>('prototype-ingresso-situacoes');
  const porConcurso = ler<Record<string, Record<string, string>>>('prototype-ingresso-situacoes-concursos');
  const criados = ler<Record<string, IngressoCandidatoRow[]>>('prototype-ingresso-registros-concursos');
  const excluidos = ler<Record<string, number[]>>('prototype-ingresso-exclusoes-concursos');
  const destinos = ler<Record<string, { responsavelAnalise: string }>>('prototype-ingresso-direcionamentos-analise');
  const orgaos = ler<Record<string, string>>('prototype-ingresso-orgaos-encaminhados');
  const datas = ler<Record<string, string>>('prototype-ingresso-datas-efetivo-exercicio');
  const historicos = ler<Record<string, { titulo: string; dataHora: string }[]>>('prototype-ingresso-historico-efetivo-exercicio');
  const perfil = getPerfilVariacaoIngresso();
  const orgao = getOrgaoAtuacaoIngresso();
  return ingressoConcursosProcessosMock.flatMap(processo => {
    const identificador = `${processo.edital.replace(/^Edital\s*/i, '')}/${processo.orgao}`;
    if (processo.titulo === 'Processo Seletivo SEFAZ 2026' && !integracoesIngressoMock.some(i => i.edital === identificador && ['Concluída','Concluída com alertas'].includes(i.situacao))) return [];
    const candidatos = new Map(processo.candidatos.map(c => [c.id, c]));
    (criados[processo.titulo] || []).forEach(c => candidatos.set(c.id, c));
    return [...candidatos.values()].filter(c => !(excluidos[processo.titulo] || []).includes(c.id)
      && podeConsultarIngresso(perfil, orgao, processo.orgao, processo.tipo === 'Processo Seletivo' ? destinos[c.id]?.responsavelAnalise : undefined, orgaos[c.id])
      && (Boolean(dataIso(c.dataNomeacao)) || Boolean(salvas[c.id]) || Boolean(porConcurso[processo.titulo]?.[c.id]))).map(c => {
      let status = porConcurso[processo.titulo]?.[c.id] ?? salvas[c.id];
      if (status === 'Ingresso cancelado') status = 'Ingresso Cancelado';
      if (processo.tipo === 'Processo Seletivo' && status === 'Exoneração de oficio') status = 'Ingresso Cancelado';
      const situacao = (processo.id === 1 && [1,2,3,4,5].includes(c.id) ? 'Tornado sem efeito' : processo.id === 1 && c.id === 14 ? 'Posse Suspensa' : status
        ?? (c.id === 52 ? 'Ingresso Cancelado' : undefined) ?? (processo.tipo === 'Concurso' ? demo[c.id] : undefined)
        ?? ingressosMock.find(i => i.id === c.id)?.situacao ?? (c.id === 40 ? 'Ingresso Concluído' : 'Aguardando Analise')) as IngressoSituacao;
      const inicio = dataIso(c.dataNomeacao);
      const conclusaoHistorico = (historicos[c.id] || []).findLast(e => /conclu[ií]do|termo assinado/i.test(e.titulo));
      const conclusao = situacao === 'Ingresso Concluído' ? dataIso(conclusaoHistorico?.dataHora) || dataIso(datas[c.id]) || dataIso(c.id === 40 ? '10/08/2026' : c.dataEfetivoExercicio) : '';
      const limite = inicio ? new Date(`${inicio}T12:00:00Z`) : null;
      if (limite) limite.setUTCDate(limite.getUTCDate() + 30);
      return { id: `${processo.id}:${c.id}`, candidatoId: c.id, nome: c.nome, cargo: c.cargo, orgao: orgaos[c.id] || c.orgaoDesignado || processo.orgao,
        edital: `${processo.edital} · ${processo.orgao}`, editalId: processo.id, processo: processo.titulo, tipo: processo.tipo,
        situacao, inicio, conclusao, limitePosse: limite?.toISOString().slice(0,10) || '',
        url: `/prototipos/sigep/ingressos-teste/${processo.id}?candidato=${c.id}` };
    });
  });
}
export function filtrarDados(registros: RegistroDashboard[], filtros: FiltrosDashboard) {
  if (filtros.inicio && filtros.fim && filtros.inicio > filtros.fim) return [];
  return registros.filter(r => {
    const data = r.situacao === 'Ingresso Concluído' ? r.conclusao : r.inicio;
    return (!filtros.tipo || r.tipo === filtros.tipo) && (!filtros.edital || String(r.editalId) === filtros.edital)
      && (!filtros.orgao || r.orgao === filtros.orgao) && (!filtros.cargo || r.cargo === filtros.cargo)
      && (!filtros.situacao || r.situacao === filtros.situacao) && (!filtros.pendentes || pendente(r))
      && (!filtros.inicio || Boolean(data) && data >= filtros.inicio) && (!filtros.fim || Boolean(data) && data <= filtros.fim);
  });
}
export function resumirDados(registros: RegistroDashboard[]) {
  const count = (status: string) => registros.filter(r => r.situacao === status).length;
  const emAndamento = (tipo: string) => new Set(registros.filter(r => r.tipo === tipo && pendente(r)).map(r => r.editalId)).size;
  return [emAndamento('Concurso'), emAndamento('Processo Seletivo'), count('Ingresso Concluído'), registros.filter(pendente).length,
    registros.filter(r => definitivos.has(r.situacao)).length, count('Posse Suspensa'), count('Posse Negada'), count('Tornado sem efeito'), count('Exoneração de oficio'), count('Ingresso Cancelado')];
}
export function agrupar(registros: RegistroDashboard[], campo: 'cargo' | 'orgao' | 'edital' | 'conclusao') {
  const grupos = new Map<string, RegistroDashboard[]>();
  registros.forEach(r => { const chave = campo === 'conclusao' ? r.conclusao.slice(0,4) : r[campo]; if (chave) grupos.set(chave, [...(grupos.get(chave) || []), r]); });
  return [...grupos].map(([nome, itens]) => ({ nome, itens, concurso: itens.filter(r => r.tipo === 'Concurso').length, seletivo: itens.filter(r => r.tipo === 'Processo Seletivo').length, total: itens.length })).sort((a,b) => b.total-a.total || a.nome.localeCompare(b.nome,'pt-BR'));
}
export function urlConsulta(filtros: FiltrosDashboard, extras: Partial<FiltrosDashboard> = {}) {
  const query = new URLSearchParams({ view: 'consulta' });
  Object.entries({ ...filtros, ...extras }).forEach(([k,v]) => { if (v) query.set(k,v); });
  return `${BASE_DASHBOARD}?${query}`;
}
