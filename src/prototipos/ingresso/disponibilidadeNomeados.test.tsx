// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { controleVagasStore } from '../controleVagas/controleVagasStore';
import { controlePssStore } from '../controlePss/controlePssStore';
import { ingressoConcursosProcessosMock } from '../PrototiposPage';
import { DashboardNomeadosPage } from './DashboardNomeadosPage';
import { criarExcelNomeados } from './exportarExcelNomeados';
import { certamesMock } from '../controlePss/certame/mock';
import { consolidarNomeados, consolidarNomeadosDaGestao } from './dashboardNomeadosModel';
import { atualizarDisponibilidadeNomeados, nomeacaoLiberada, type ControleDisponibilidade, type NomeacaoDisponibilidade } from './disponibilidadeNomeados';
import { lerRegistrosIngresso, persistirDadoIngresso, persistirSituacaoDoEdital } from './ingressoDados';
import { consultarCertamesIngresso, sincronizarCertamesIngresso } from './sincronizarCertamesIngresso';

const controleOriginal=controleVagasStore.getState();
const certamesOriginais=controlePssStore.getState().certames;
beforeEach(() => {localStorage.clear();controlePssStore.set('certamesBasicosIngresso',[]);});
afterEach(() => {cleanup();localStorage.clear();controleVagasStore.update(() => controleOriginal);controlePssStore.set('certames',certamesOriginais);});
function cenario() {
  const base=controleVagasStore.getState();
  const quadro={...base.quadros[0],id:990,codigo:'QA-TESTE',cargo:'Analista Administrativo',orgao:'SES',autorizadas:30,ocupadas:12,comprometidas:6,bloqueadas:0,situacao:'Vigente' as const,situacaoVigencia:'ATIVO' as const};
  const vagas=Array.from({length:30},(_,i) => ({...base.vagas[0],id:`vaga-${i}`,quadroAutorizadoId:990,quadroCodigo:quadro.codigo,cargo:quadro.cargo,orgaoTitular:'SES',estado:i<12?'OCUPADA' as const:'DISPONIVEL' as const,situacaoLegal:'REGULAR' as const}));
  const comprometimentos=Array.from({length:6},(_,i) => ({...base.comprometimentos[0],id:`comp-${i+12}`,vagaId:`vaga-${i+12}`,natureza:'OCUPACAO' as const,situacao:'ATIVO' as const}));
  const controle: ControleDisponibilidade={quadros:[quadro],vagas,comprometimentos,ocupacoes:[]};
  const certame={...certamesMock[1],setor:'SES',numeroEditalOrgao:'001/2026/SES',cargos:[{...certamesMock[1].cargos[0],cargoNome:quadro.cargo,quantidadeVagas:30,quantidadeCandidatosPrevistos:30,aceitaCadastroReserva:true,quantidadeCadastroReserva:20,quadroCodigo:quadro.codigo}]};
  const linha=consolidarNomeados([certame],[]).linhas[0];
  linha.nomeados=18;linha.ingressados=12;linha.ingressosPendentes=6;
  const registros: NomeacaoDisponibilidade[]=Array.from({length:18},(_,i) => ({id:`nomeacao-${i}`,situacao:i<12?'Ingresso Concluído':'Em analise',
    candidato:{id:i,nome:`Pessoa ${i}`,cargo:quadro.cargo,classificacao:'1º',tipoVaga:'AC',dataNomeacao:'01/07/2026',dataPosse:'-',dataEfetivoExercicio:'-',vagaId:`vaga-${i}`,comprometimentoVagaId:i>=12?`comp-${i}`:undefined}}));
  return {controle,linha,registros,certame};
}
it('calcula 30 imediatas menos 18 comprometidas sem somar as 20 de reserva', () => {
  const {controle,linha,registros}=cenario();
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  expect(linha).toMatchObject({vagas:30,cadastroReserva:20,nomeacoesComprometidas:18,aNomear:12,disponibilidadeInformada:true,aguardandoIngresso:6});
  linha.cadastroReserva=2000;
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  expect(linha.aNomear).toBe(12);
});
it('encerramento, suspensão e conclusão não liberam vaga automaticamente', () => {
  const {controle,linha,registros}=cenario();
  for(const situacao of ['Posse Negada','Tornado sem efeito','Ingresso Cancelado','Exoneração de oficio','Posse Suspensa','Ingresso Concluído']) {
    registros[17].situacao=situacao;
    expect(nomeacaoLiberada(registros[17],controle)).toBe(false);
    atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
    expect(linha.aNomear).toBe(12);
  }
});
it('libera para 13 apenas após ato confirmado e atualização válida do Controle', () => {
  const {controle,linha,registros}=cenario();
  registros[17].situacao='Posse Negada';
  controle.comprometimentos[5]={...controle.comprometimentos[5],situacao:'CANCELADO',eventoDefinitivo:'Nomeação desconstituída',concluidoEm:'15/10/2026'};
  controle.quadros[0]={...controle.quadros[0],comprometidas:5};
  expect(nomeacaoLiberada(registros[17],controle)).toBe(true);
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  expect(linha).toMatchObject({nomeados:18,nomeacoesComprometidas:17,aNomear:13});
  controle.vagas[17]={...controle.vagas[17],situacaoLegal:'EXTINTA'};
  expect(nomeacaoLiberada(registros[17],controle)).toBe(true);
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  expect(linha.aNomear).toBe(12);
});
it('respeita bloqueios e limites e nunca apresenta saldo negativo', () => {
  const {controle,linha,registros}=cenario();
  controle.quadros[0]={...controle.quadros[0],bloqueadas:3};
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  expect(linha.aNomear).toBe(9);expect(linha.alertas?.length).toBeGreaterThan(0);
  linha.vagas=10;
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  expect(linha.aNomear).toBe(0);expect(linha.excedentes).toBe(8);
});
it('reconhece vacância efetiva de vínculo sem apagar o histórico do ingresso concluído', () => {
  const {controle,linha,registros}=cenario();
  const base=controleOriginal.ocupacoes[0];
  registros[0].candidato.vinculoId='vinculo-encerrado';
  controle.vagas[0]={...controle.vagas[0],estado:'DISPONIVEL'};
  controle.quadros[0]={...controle.quadros[0],ocupadas:11};
  controle.ocupacoes=[{...base,vagaId:'vaga-0',vinculoId:'vinculo-encerrado',situacao:'ENCERRADA',encerradaEm:'2026-10-15',eventos:[{...base.eventos[0],tipo:'ENCERRAMENTO'}]}];
  expect(nomeacaoLiberada(registros[0],controle)).toBe(true);
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  expect(linha).toMatchObject({nomeados:18,ingressados:12,nomeacoesComprometidas:17,aNomear:13});
});
it('não oferece o mesmo saldo do quadro duas vezes em editais diferentes', () => {
  const {controle,linha,registros}=cenario();
  const outra={...linha,id:'outro-edital',nomeados:0};
  atualizarDisponibilidadeNomeados([linha,outra],new Map([[linha.id,registros]]),controle);
  expect(linha.aNomear+outra.aNomear).toBe(12);
});
it('sem ligação segura com o Controle, indica disponibilidade pendente em vez de inventar saldo', () => {
  const {controle,linha,registros}=cenario();
  controle.quadros=[];
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  expect(linha.disponibilidadeInformada).toBe(false);expect(linha.aNomear).toBe(0);
});
it('não confirma saldo de quadro com nomeações ainda sem espelhamento individual', () => {
  const {controle,linha,registros}=cenario();
  registros[17].candidato.vagaId=undefined;
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  expect(linha.disponibilidadeInformada).toBe(false);expect(linha.aNomear).toBe(0);
  expect(linha.nomeacoesComprometidas).toBe(18);
});
it('preserva a ocorrência da posse após concluir ou encerrar o ingresso', () => {
  const edital='Concurso SES 2026';
  persistirDadoIngresso('prototype-ingresso-registros-concursos',JSON.stringify({[edital]:[{id:3000,nome:'Posse registrada',cargo:'Analista Administrativo',classificacao:'1º',tipoVaga:'AC',dataNomeacao:'01/07/2026',dataPosse:'-',dataEfetivoExercicio:'-'}]}));
  persistirSituacaoDoEdital(edital,3000,'Aguardando Efetivo Exercicio');
  persistirSituacaoDoEdital(edital,3000,'Ingresso Concluído');
  persistirSituacaoDoEdital(edital,3000,'Posse Negada');
  controlePssStore.set('certames',[]);sincronizarCertamesIngresso();
  const dados=consolidarNomeadosDaGestao(consultarCertamesIngresso(),lerRegistrosIngresso());
  const registros=lerRegistrosIngresso().filter(r => r.candidato.id===3000);
  expect(registros).toHaveLength(1);
  expect(JSON.parse(localStorage.getItem('prototype-ingresso-posses-confirmadas')!)[`${edital}|3000`]).toBe(true);
  expect(dados.linhas.find(l => l.ingressoId===1)?.tomaramPosse).toBeGreaterThan(0);
});
it('recalcula vagas e reserva na tela sem depender dos bloqueios do Controle de Vagas', () => {
  const demaisEditais=ingressoConcursosProcessosMock.splice(1);
  try {
  const {controle,registros,certame}=cenario();
  const edital=ingressoConcursosProcessosMock[0];
  // Isola o quadro conciliado: outros editais agora também possuem vagas cadastradas.
  localStorage.setItem('prototype-ingresso-exclusoes-concursos',JSON.stringify(Object.fromEntries(
    ingressoConcursosProcessosMock.map(e => [e.titulo,e.candidatos.map(c => c.id)]),
  )));
  localStorage.setItem('prototype-ingresso-registros-concursos',JSON.stringify({[edital.titulo]:registros.map((r,i) => ({...r.candidato,id:1000+i,situacao:r.situacao}))}));
  controleVagasStore.update(s => ({...s,...controle}));
  controlePssStore.set('certames',[certame]);
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Edital'),{target:{value:'gestao-1'}});
  fireEvent.change(screen.getByLabelText('Cargo/Função'),{target:{value:'Analista Administrativo'}});
  const cards=screen.getByRole('region',{name:'Indicadores de nomeados'});
  const total=() => within(cards).getAllByRole('heading')[4].closest('article')!.querySelector('strong')!.textContent;
  expect(total()).toBe('32');
  expect(screen.getAllByRole('img',{name:/: Total de Vagas: 50$/})).toHaveLength(2);
  expect(screen.getAllByRole('img',{name:/: Nomeados: 18$/})).toHaveLength(2);
  expect(screen.getAllByRole('img',{name:/: Ingressados: 12$/})).toHaveLength(2);
  expect(screen.getAllByRole('img',{name:/: Pendentes de ingresso: 6$/})).toHaveLength(2);
  expect(screen.getAllByRole('img',{name:/: A nomear: 32$/})).toHaveLength(2);
  act(() => controleVagasStore.set('quadros',[{...controle.quadros[0],bloqueadas:1}]));
  expect(total()).toBe('32');
  act(() => controlePssStore.set('certames',[{...certame,cargos:[{...certame.cargos[0],quantidadeCadastroReserva:200}]}]));
  expect(total()).toBe('212');
  const tabela=screen.getByRole('table',{name:'Vagas e nomeações'});
  const dados=tabela.querySelector('tbody tr:not(.dn-edital-total)') as HTMLElement;
  expect(within(dados).getAllByRole('cell')[4].textContent).toBe('200');
  act(() => controlePssStore.set('certames',[{...certame,cargos:[{...certame.cargos[0],quantidadeVagas:31}]}]));
  expect(total()).toBe('33');
  } finally {
    ingressoConcursosProcessosMock.push(...demaisEditais);
  }
});
it('exporta todas as linhas e totaliza imediatas e reserva em colunas distintas', async () => {
  const {controle,linha,registros}=cenario();
  atualizarDisponibilidadeNomeados([linha],new Map([[linha.id,registros]]),controle);
  const linhas=Array.from({length:15},(_,i) => ({...linha,id:String(i),edital:`${i+1}/2026/SES`}));
  const workbook=criarExcelNomeados(linhas,{tipo:'Concurso',orgao:'SES',cargo:'',edital:''},15);
  const sheet=workbook.getWorksheet('Vagas e nomeações')!;
  const dados:string[]=[];sheet.eachRow(r => dados.push(String(r.getCell(1).value)));
  expect(dados.filter(d => /\/2026\/SES$/.test(d))).toHaveLength(15);
  expect(sheet.lastRow!.getCell(4).value).toBe(450);
  expect(sheet.lastRow!.getCell(5).value).toBe(300);
  expect(sheet.lastRow!.getCell(8).value).toBe(90);
  expect(sheet.lastRow!.getCell(12).value).toBe(180);
  expect((await workbook.xlsx.writeBuffer()).byteLength).toBeGreaterThan(0);
});
