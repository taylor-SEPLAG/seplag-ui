import type { FeriasRegistro } from './FeriasPages';
export type SituacaoAprovacao = 'Pendente' | 'Aprovada' | 'Rejeitada';
export const tipoAprovacao = (r:FeriasRegistro) => r.tipo === 'Lote' ? 'Em lote' : r.tipo === 'Recesso' ? 'Remunerado' : r.tipo;
export type FiltrosAprovacao = {busca:string;inicio:string;fim:string;situacao:string;orgao:string;tipo:string};
export const filtrosAprovacaoVazios: FiltrosAprovacao = {busca:'',inicio:'',fim:'',situacao:'',orgao:'',tipo:''};
export function situacaoAprovacao(r: FeriasRegistro): SituacaoAprovacao | null {
  if (r.situacao === 'AGUARDANDO VALIDAÇÃO') return 'Pendente';
  if (r.situacao === 'REPROVADO' || r.situacao === 'PRAZO EXPIRADO' || (r.situacao === 'CANCELADO' && r.resultadoAvaliacao === 'Rejeitada')) return 'Rejeitada';
  if (['EM ABERTO','QUITADO','SUSPENSO'].includes(r.situacao)) return 'Aprovada';
  return null;
}
export const dataBrAprovacao = (data?:string) => data ? data.slice(0,10).split('-').reverse().join('/') : '—';
export const diasAprovacao = (r:FeriasRegistro) => r.parcelas.reduce((s,p) => s+p.dias,0);
export const periodoAprovacao = (r:FeriasRegistro) => r.parcelas.map(p => `${dataBrAprovacao(p.inicio)} a ${dataBrAprovacao(p.fim)}`).join('; ') || '—';
export const loteAprovacao = (r:FeriasRegistro) => (r.tipo==='Lote' || r.tipo==='Coletiva') && ['SEDUC','UNEMAT','SECITEC'].includes(r.orgaoColetivo) && !!r.loteId;
const normalizar=(s:string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
export function filtrarAprovacoes(registros:FeriasRegistro[],f:FiltrosAprovacao) {
  return registros.filter(r => situacaoAprovacao(r) && (!f.situacao || situacaoAprovacao(r)===f.situacao)
    && (!f.busca.trim() || normalizar(`${r.servidorNome} ${r.matricula}`).includes(normalizar(f.busca.trim())))
    && (!f.orgao || r.orgao===f.orgao) && (!f.tipo || tipoAprovacao(r)===f.tipo)
    && (!(f.inicio || f.fim) || r.parcelas.some(p => (!f.inicio || p.fim>=f.inicio) && (!f.fim || p.inicio<=f.fim))));
}
export type OrdemAprovacao = 'solicitacao' | 'validade' | 'nome' | 'matricula' | 'orgao' | 'lotacao' | 'periodo' | 'dias' | 'tipo' | 'situacao';
function dataOrdenavel(data:string) {
  const br=data.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:,?\s+(\d{2}:\d{2}(?::\d{2})?))?/);
  return br ? `${br[3]}-${br[2]}-${br[1]} ${br[4] || '00:00:00'}` : data.replace('T',' ').replace(/Z$/,'');
}
export function ordenarAprovacoes(registros:FeriasRegistro[],campo:OrdemAprovacao,desc:boolean) {
  const valor=(r:FeriasRegistro):string|number => ({solicitacao:dataOrdenavel(r.lancadoEm),validade:r.dataLimiteValidacaoChefia || '9999-12-31',nome:r.servidorNome,matricula:r.matricula,orgao:r.orgao,lotacao:r.setor,periodo:r.parcelas.map(p => p.inicio).sort()[0] || '',dias:diasAprovacao(r),tipo:tipoAprovacao(r),situacao:situacaoAprovacao(r)||''})[campo];
  return [...registros].sort((a,b) => {const x=valor(a),y=valor(b);return ((typeof x==='number' && typeof y==='number' ? x-y : String(x).localeCompare(String(y),'pt-BR',{numeric:true}))*(desc ? -1 : 1)) || a.id-b.id;});
}
