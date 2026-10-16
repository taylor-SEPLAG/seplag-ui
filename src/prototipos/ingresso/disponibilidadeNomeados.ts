import type { ControleVagasState } from '../controleVagas/controleVagasStore';
import type { IngressoCandidatoRow } from '../PrototiposPage';
import type { LinhaNomeados } from './dashboardNomeadosModel';
import { categoriaIngresso } from './ingressoDados';

export type ControleDisponibilidade = Pick<ControleVagasState,'quadros'|'vagas'|'comprometimentos'|'ocupacoes'>;
export type NomeacaoDisponibilidade = { id: string; candidato: IngressoCandidatoRow; situacao?: string };
const chave = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();

/** Uma situação terminal não equivale a um ato de liberação da vaga. */
export function nomeacaoLiberada(nomeacao: NomeacaoDisponibilidade, controle: ControleDisponibilidade) {
  if (!nomeacao.candidato.vagaId) return false;
  const c = nomeacao.candidato;
  const vaga = controle.vagas.find(v => v.id === c.vagaId);
  if (!vaga) return false;
  // Reutilização posterior da vaga não reativa uma nomeação já desconstituída.
  // A possibilidade de ofertar a vaga agora é validada separadamente no saldo do quadro.
  if (c.vinculoId && controle.ocupacoes.some(o => o.vagaId === vaga.id && o.vinculoId === c.vinculoId && o.situacao === 'ATIVA')) return false;
  if (c.vinculoId && controle.ocupacoes.some(o => o.vagaId === vaga.id && o.vinculoId === c.vinculoId
    && o.situacao === 'ENCERRADA' && o.encerradaEm && o.eventos.some(e => e.tipo === 'ENCERRAMENTO'))) return true;
  if (categoriaIngresso(nomeacao.situacao) !== 'encerrado') return false;
  const ato = c.comprometimentoVagaId && controle.comprometimentos.find(p => p.id === c.comprometimentoVagaId && p.vagaId === vaga.id);
  if (ato && ato.situacao === 'CANCELADO' && ato.eventoDefinitivo && ato.concluidoEm) return true;
  return false;
}

export function atualizarDisponibilidadeNomeados(linhas: LinhaNomeados[], nomeacoes: Map<string,NomeacaoDisponibilidade[]>, controle: ControleDisponibilidade) {
  const saldos = new Map<number,number>();
  const quadrosPendentes = new Set<number>();
  const quadrosPorLinha = new Map<string,typeof controle.quadros[number] | undefined>();
  linhas.forEach(l => {
    l.alertas = [];
    const registros = [...new Map((nomeacoes.get(l.id) || []).map(r => [r.id,r])).values()];
    const comprometidas = registros.filter(r => !nomeacaoLiberada(r,controle));
    l.nomeacoesComprometidas = comprometidas.length;
    l.aguardandoIngresso = comprometidas.filter(r => r.situacao !== 'Ingresso Concluído').length;
    l.aNomear = 0; l.disponibilidadeInformada = false;
    l.excedentes = l.vagasInformadas ? Math.max(0,comprometidas.length-l.vagas) : 0;
    if (l.excedentes) l.alertas.push('Nomeações comprometidas excedem as vagas imediatas do edital.');
    const codigos = l.quadrosCodigos || [];
    const todos = controle.quadros.filter(q => codigos.length ? codigos.includes(q.codigo)
      : chave(q.cargo) === chave(l.cargo) && chave(q.orgao) === chave(l.orgao));
    const vigentes = todos.filter(q => q.situacao === 'Vigente' && !['ENCERRADO','EXTINTO'].includes(q.situacaoVigencia || ''));
    const candidatos = vigentes.length ? vigentes : todos;
    const quadro = candidatos.length === 1 ? candidatos[0] : undefined;
    quadrosPorLinha.set(l.id,quadro);
    if (!quadro || l.vagasInformadas === false) { l.alertas.push('Disponibilidade depende da vinculação das vagas imediatas ao Controle de Vagas.'); return; }
    if (!saldos.has(quadro.id)) {
      const legal = Math.max(0,quadro.autorizadas-quadro.ocupadas-quadro.comprometidas-quadro.bloqueadas);
      if (quadro.ocupadas+quadro.comprometidas+quadro.bloqueadas > quadro.autorizadas) l.alertas.push('Ocupações, reservas e bloqueios excedem a autorização do quadro.');
      const vagas = controle.vagas.filter(v => v.quadroAutorizadoId === quadro.id);
      const livres = vagas.filter(v => v.estado === 'DISPONIVEL' && v.situacaoLegal === 'REGULAR'
        && !controle.comprometimentos.some(p => p.vagaId === v.id && p.situacao === 'ATIVO' && p.natureza === 'OCUPACAO')
        && !controle.ocupacoes.some(o => o.vagaId === v.id && o.situacao === 'ATIVA')).length;
      const ativo = !['ENCERRADO','EXTINTO'].includes(quadro.situacaoVigencia || '') && quadro.situacao === 'Vigente';
      saldos.set(quadro.id,ativo ? Math.min(legal,livres) : 0);
      if (legal !== livres) l.alertas.push('Saldo agregado e vagas individualizadas divergentes; aplicado o menor limite.');
    }
    // Reservas do ingresso ainda não espelhadas no Controle são abatidas uma única vez.
    const semEspelho = comprometidas.filter(r => {
      const v = r.candidato.vagaId && controle.vagas.find(v => v.id === r.candidato.vagaId && v.quadroAutorizadoId === quadro.id);
      return !v || (v.estado === 'DISPONIVEL' && !controle.comprometimentos.some(p => p.vagaId === v.id && p.situacao === 'ATIVO' && p.natureza === 'OCUPACAO')
        && !controle.ocupacoes.some(o => o.vagaId === v.id && o.situacao === 'ATIVA'));
    }).length;
    if (semEspelho) {
      quadrosPendentes.add(quadro.id);
      l.alertas.push('Nomeações sem espelhamento individual no Controle de Vagas exigem conciliação antes de confirmar a disponibilidade.');
    }
    saldos.set(quadro.id,Math.max(0,(saldos.get(quadro.id) || 0)-semEspelho));
    l.disponibilidadeInformada = true;
  });
  // O mesmo saldo do quadro não pode ser oferecido novamente em outro edital.
  linhas.forEach(l => {
    const quadro = quadrosPorLinha.get(l.id);
    if (!l.disponibilidadeInformada || !quadro) return;
    if (quadrosPendentes.has(quadro.id)) { l.disponibilidadeInformada = false; return; }
    const saldo = saldos.get(quadro.id) || 0;
    l.aNomear = Math.max(0,Math.min(l.vagas-(l.nomeacoesComprometidas || 0),saldo));
    saldos.set(quadro.id,saldo-l.aNomear);
  });
}
