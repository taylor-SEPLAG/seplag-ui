import type { IngressoSituacao } from "../PrototiposPage";
import { categoriaIngresso, naoComparecimentoIngresso, posseRegistradaIngresso, lerRegistrosIngresso } from "./ingressoDados";

export const BASE_DASHBOARD = '/prototipos/sigep/ingressos/dashboard';
export const SITUACOES: { value: IngressoSituacao; label: string; color: string; icon: string; description: string; tipo?: string }[] = [
  { value: 'Aguardando Analise', label: 'Aguardando Análise', color: '#FF6A00', icon: 'pi-clock', description: 'Documentação aguardando avaliação.' },
  { value: 'Em analise', label: 'Em Análise', color: '#0D6EFD', icon: 'pi-search', description: 'Ingresso em avaliação pela equipe.' },
  { value: 'Aguardando análise documento', label: 'Aguardando análise documento', color: '#7B1FE0', icon: 'pi-file-check', description: 'Aguardando análise da documentação do concurso.', tipo: 'Concurso' },
  { value: 'Aguardando Efetivo Exercicio', label: 'Aguardando Efetivo Exercício', color: '#E6007E', icon: 'pi-briefcase', description: 'Aguardando o início do exercício.' },
  { value: 'Aguardando Termo Assinado', label: 'Aguardando Termo Assinado', color: '#00A6B2', icon: 'pi-file-edit', description: 'Documento pendente de assinatura.' },
  { value: 'Ingresso Concluído', label: 'Ingresso Concluído', color: '#0B6B3A', icon: 'pi-check-circle', description: 'Ingresso finalizado no sistema.' },
  { value: 'Posse Suspensa', label: 'Posse Suspensa', color: '#7B2FD8', icon: 'pi-pause-circle', description: 'Prazo pausado; processo pode continuar.', tipo: 'Concurso' },
  { value: 'Posse Negada', label: 'Posse Negada', color: '#DC3545', icon: 'pi-ban', description: 'Posse negada; processo encerrado.', tipo: 'Concurso' },
  { value: 'Tornado sem efeito', label: 'Tornado sem Efeito', color: '#929AA3', icon: 'pi-minus-circle', description: 'Ato tornado sem efeito.', tipo: 'Concurso' },
  { value: 'Exoneração de oficio', label: 'Exoneração de Ofício', color: '#344B63', icon: 'pi-sign-out', description: 'Encerrado por exoneração de ofício.', tipo: 'Concurso' },
  { value: 'Ingresso Cancelado', label: 'Ingresso Cancelado', color: '#E63946', icon: 'pi-times-circle', description: 'Ingresso encerrado por cancelamento.', tipo: 'Processo Seletivo' },
  { value: 'Encerrado por desistência', label: 'Encerrado por desistência', color: '#995042', icon: 'pi-times', description: 'Processo encerrado por desistência.' },
];
export interface RegistroDashboard {
  cargoId?: string; cargoVagaCertameId?: string;
  polo?: string; tipoVaga?: string;
  naoComparecimento?: boolean; posseRegistrada?: boolean;
  id: string; candidatoId: number; nome: string; cargo: string; orgao: string; edital: string; editalId: number;
  processo: string; tipo: 'Concurso' | 'Processo Seletivo'; situacao: IngressoSituacao;
  inicio: string; conclusao: string; limitePosse: string; limiteEfetivoExercicio: string; url: string;
}
export type FiltrosDashboard = { tipo: string; edital: string; orgao: string; cargo: string; inicio: string; fim: string; situacao: string; pendentes: string };
export const filtrosIniciais: FiltrosDashboard = { tipo: '', edital: '', orgao: '', cargo: '', inicio: '', fim: '', situacao: '', pendentes: '' };
export const pendente = (r: RegistroDashboard) => categoriaIngresso(r.situacao) === 'pendente';
export const dataIso = (value?: string) => {
  if (!value || value === '-') return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};
function ler<T>(key: string): T { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {} as T; } }
export function lerDadosDashboard(): RegistroDashboard[] {
  const datas = ler<Record<string, string>>('prototype-ingresso-datas-efetivo-exercicio');
  const orgaos = ler<Record<string, string>>('prototype-ingresso-orgaos-encaminhados');
  const historicos = ler<Record<string, { titulo: string; dataHora: string }[]>>('prototype-ingresso-historico-efetivo-exercicio');
  return lerRegistrosIngresso().flatMap(({edital:processo,candidato:c,situacao}) => {
    if (!situacao || !categoriaIngresso(situacao)) return [];
    const inicio = dataIso(c.dataNomeacao);
    const conclusaoHistorico = (historicos[c.id] || []).findLast(e => /conclu[ií]do|termo assinado/i.test(e.titulo));
    const conclusao = situacao === 'Ingresso Concluído' ? dataIso(conclusaoHistorico?.dataHora) || dataIso(datas[c.id]) || dataIso(c.dataEfetivoExercicio) : '';
    const limite = inicio ? new Date(`${inicio}T12:00:00Z`) : null;
    if (limite) limite.setUTCDate(limite.getUTCDate()+30);
    const posse = dataIso(c.dataPosse);
    const limiteEfetivo = posse ? new Date(`${posse}T12:00:00Z`) : null;
    if (limiteEfetivo) limiteEfetivo.setUTCDate(limiteEfetivo.getUTCDate()+15);
    return [{
      id: `${processo.id}:${c.id}`, candidatoId:c.id, nome:c.nome, cargo:c.cargo,
      cargoId:c.cargoId,cargoVagaCertameId:c.cargoVagaCertameId,polo:c.polo,tipoVaga:c.tipoVaga,
      orgao:orgaos[c.id] || c.orgaoDesignado || processo.orgao,
      edital:`${processo.edital} · ${processo.orgao}`, editalId:processo.id, processo:processo.titulo, tipo:processo.tipo,
      situacao, inicio, conclusao, limitePosse:limite?.toISOString().slice(0,10) || '', limiteEfetivoExercicio:limiteEfetivo?.toISOString().slice(0,10) || '',
      naoComparecimento: naoComparecimentoIngresso(processo,c,situacao), posseRegistrada: posseRegistradaIngresso(processo,c,situacao),
      url:`/prototipos/sigep/ingressos-teste/${processo.id}?candidato=${c.id}`,
    }];
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
    registros.filter(r => categoriaIngresso(r.situacao) === 'encerrado').length, count('Posse Suspensa'), count('Posse Negada'), count('Tornado sem efeito'), count('Exoneração de oficio'), count('Ingresso Cancelado')];
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
