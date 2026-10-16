// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ingressoConcursosProcessosMock, PrototiposIngressosTestePage, type IngressoCandidatoRow, type IngressoSituacao } from '../PrototiposPage';
import { DashboardIngressoPage } from './DashboardIngressoPage';
import { lerDadosDashboard } from './dashboardIngressoModel';
import { candidatosAtuaisEdital, categoriaIngresso, lerRegistrosIngresso, persistirDadoIngresso, persistirSituacaoDoEdital, quantitativosIngresso } from './ingressoDados';

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup();localStorage.clear(); });
const edital = ingressoConcursosProcessosMock[0];
const candidato = (id: number, situacao?: IngressoSituacao): IngressoCandidatoRow => ({id,nome:`Candidato ${id}`,cpf:'123.456.789-00',classificacao:'1º',cargo:'Analista Administrativo',tipoVaga:'AC',dataNomeacao:'-',dataPosse:'-',dataEfetivoExercicio:'-',situacao});
function salvar(candidatos: IngressoCandidatoRow[], titulo = edital.titulo) {
  persistirDadoIngresso('prototype-ingresso-registros-concursos',JSON.stringify({[titulo]:candidatos}));
}
const daAmostra = () => lerRegistrosIngresso().filter(r => r.edital.id === edital.id && r.candidato.id >= 1000);

it('classifica exclusivamente as situações atuais previstas, sem transformar desconhecidos em pendentes', () => {
  ['Aguardando Analise','Aguardando análise documento','Em analise','Aguardando Efetivo Exercicio','Aguardando Termo Assinado','Posse Suspensa'].forEach(s => expect(categoriaIngresso(s)).toBe('pendente'));
  ['Posse Negada','Tornado sem efeito','Exoneração de oficio','Ingresso Cancelado'].forEach(s => expect(categoriaIngresso(s)).toBe('encerrado'));
  expect(categoriaIngresso('Ingresso Concluído')).toBe('ingressado');
  expect(categoriaIngresso()).toBeUndefined();expect(categoriaIngresso('Situação desconhecida')).toBeUndefined();
});
it('reproduz o cenário de vinte nomeados com dois sem ingresso iniciado', () => {
  const entradas=Array.from({length:20},(_,i) => candidato(1000+i,i<8?'Aguardando análise documento':i<15?'Ingresso Concluído':i<18?'Posse Negada':undefined));
  salvar(entradas);
  expect(quantitativosIngresso(daAmostra())).toEqual({nomeados:20,pendentes:8,ingressados:7,encerradosSemIngresso:3});
  const dashboard=lerDadosDashboard().filter(r => r.editalId === edital.id && r.candidatoId >=1000);
  expect(dashboard).toHaveLength(18);
  expect(quantitativosIngresso(dashboard)).toEqual({nomeados:18,pendentes:8,ingressados:7,encerradosSemIngresso:3});
});
it('atualiza a categoria após cada transição sem alterar Nomeados ou somar o histórico', () => {
  salvar([candidato(1000,'Em analise')]);
  const conferir = (esperado: number[]) => {
    const r=quantitativosIngresso(daAmostra());
    expect([r.nomeados,r.pendentes,r.ingressados,r.encerradosSemIngresso]).toEqual(esperado);
  };
  conferir([1,1,0,0]);
  persistirSituacaoDoEdital(edital.titulo,1000,'Aguardando Termo Assinado');conferir([1,1,0,0]);
  persistirSituacaoDoEdital(edital.titulo,1000,'Ingresso Concluído');conferir([1,0,1,0]);
  persistirSituacaoDoEdital(edital.titulo,1000,'Posse Negada');conferir([1,0,0,1]);
  persistirSituacaoDoEdital(edital.titulo,1000,'Posse Suspensa');conferir([1,1,0,0]);
  localStorage.setItem('prototype-ingresso-historico-efetivo-exercicio',JSON.stringify({'1000':[{titulo:'Ingresso concluído'},{titulo:'Posse Negada'}]}));
  conferir([1,1,0,0]);
});
it('deduplica por identificador e mantém ingressos legítimos distintos com o mesmo CPF', () => {
  salvar([candidato(1000,'Em analise'),candidato(1001,'Em analise'),candidato(1000,'Ingresso Concluído')]);
  expect(quantitativosIngresso(daAmostra())).toEqual({nomeados:2,pendentes:1,ingressados:1,encerradosSemIngresso:0});
  const base=edital.candidatos[0];
  salvar([{...base,nome:'Atualizado por integração',situacao:'Ingresso Concluído'}]);
  expect(candidatosAtuaisEdital(edital).filter(c => c.id===base.id)).toHaveLength(1);
  expect(lerRegistrosIngresso().find(r => r.edital.id===edital.id && r.candidato.id===base.id)?.situacao).toBe('Ingresso Concluído');
});
it('situações persistidas substituem a situação inicial inclusive nos candidatos antes fixados', () => {
  persistirSituacaoDoEdital(edital.titulo,1,'Ingresso Concluído');
  expect(lerRegistrosIngresso().find(r => r.id===`${edital.id}:1`)?.situacao).toBe('Ingresso Concluído');
  persistirSituacaoDoEdital(edital.titulo,14,'Posse Negada');
  expect(lerRegistrosIngresso().find(r => r.id===`${edital.id}:14`)?.situacao).toBe('Posse Negada');
});
it('a situação de um edital não altera o ingresso com o mesmo ID em outro edital', () => {
  const outro=ingressoConcursosProcessosMock.find(e => e.id!==edital.id && e.candidatos.some(c => c.id===2))!;
  const antes=lerRegistrosIngresso().find(r => r.edital.id===outro.id && r.candidato.id===2)?.situacao;
  persistirDadoIngresso('prototype-ingresso-situacoes',JSON.stringify({'2':'Posse Negada'}));
  persistirSituacaoDoEdital(edital.titulo,2,'Posse Negada');
  expect(lerRegistrosIngresso().find(r => r.edital.id===outro.id && r.candidato.id===2)?.situacao).toBe(antes);
});
it('inclui cadastro manual mesmo quando a integração do edital ainda não recebeu candidatos', () => {
  const destino=ingressoConcursosProcessosMock.find(e => e.candidatosRecebidos === false)!;
  salvar([candidato(1000,'Aguardando Analise')],destino.titulo);
  expect(candidatosAtuaisEdital(destino)).toHaveLength(1);
  expect(lerDadosDashboard().filter(r => r.editalId===destino.id)).toHaveLength(1);
});
it('recalcula a grid automaticamente após persistir inclusão, reprocessamento e conclusão', async () => {
  render(<MemoryRouter><PrototiposIngressosTestePage /></MemoryRouter>);
  const tabela=document.querySelector('.prototype-ingressos-teste-table') as HTMLElement;
  const valores=() => {
    const linha=within(tabela).getByText('001/2026/SES').closest('tr')!;
    const colunas=within(linha).getAllByRole('cell');
    return colunas.slice(3,7).map(c => Number(c.textContent));
  };
  const antes=valores();
  await act(async () => salvar([candidato(1000,'Aguardando análise documento')]));
  expect(valores()).toEqual([antes[0]+1,antes[1]+1,antes[2],antes[3]]);
  await act(async () => salvar([candidato(1000,'Aguardando análise documento'),candidato(1000,'Aguardando análise documento')]));
  expect(valores()[0]).toBe(antes[0]+1);
  await act(async () => persistirSituacaoDoEdital(edital.titulo,1000,'Ingresso Concluído'));
  expect(valores()).toEqual([antes[0]+1,antes[1],antes[2]+1,antes[3]]);
  fireEvent(window,new Event('focus'));
  expect(valores()).toEqual([antes[0]+1,antes[1],antes[2]+1,antes[3]]);
});
it('atualiza o dashboard na mesma aba e mantém os totais equivalentes à Gestão', async () => {
  salvar([candidato(1000,'Aguardando Analise')]);
  await act(async () => {});
  render(<MemoryRouter><DashboardIngressoPage /></MemoryRouter>);
  const indicadores=screen.getByRole('region',{name:'Indicadores gerais'});
  const numeros=() => [...indicadores.querySelectorAll('strong')].map(el => Number(el.textContent));
  const antes=numeros();
  await act(async () => persistirSituacaoDoEdital(edital.titulo,1000,'Ingresso Concluído'));
  expect(numeros()[2]).toBe(antes[2]+1);expect(numeros()[3]).toBe(antes[3]-1);
  const fonte=quantitativosIngresso(lerRegistrosIngresso());
  expect(numeros().slice(2,5)).toEqual([fonte.ingressados,fonte.pendentes,fonte.encerradosSemIngresso]);
});
