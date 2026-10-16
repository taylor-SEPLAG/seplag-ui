// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { certamesMock } from '../controlePss/certame/mock';
import type { Certame } from '../controlePss/certame/types';
import { controlePssStore } from '../controlePss/controlePssStore';
import { persistirDadoIngresso, persistirSituacaoDoEdital, lerRegistrosIngresso, quantitativosIngresso } from './ingressoDados';
import { ingressoConcursosProcessosMock } from '../PrototiposPage';
import { lerDadosDashboard, type RegistroDashboard } from './dashboardIngressoModel';
import { consultarDashboardNomeados, totaisNomeadosPorEdital, atualizarSaldoCandidatos, consolidarNomeadosDaGestao, contarEditaisHomologados, consolidarNomeados, filtrarNomeados, filtrosNomeadosVazios, resumoNomeados } from './dashboardNomeadosModel';
import { criarExcelNomeados } from './exportarExcelNomeados';
import { DashboardNomeadosPage } from './DashboardNomeadosPage';
import { localizarCertameIngresso, quantitativosCertameIngresso, quantitativosEditalIngresso } from './certameIngresso';
import { consultarCertamesIngresso, sincronizarCertamesIngresso } from './sincronizarCertamesIngresso';

const certamesOriginais = controlePssStore.getState().certames;
const certame: Certame = { ...certamesMock[1], id:'teste-certame',setor:'SES',numeroEditalOrgao:'001/2026/SES',situacaoAtual:'HOMOLOGADO',
  cargos:[{...certamesMock[1].cargos[0],id:'cargo-a',cargoExistenteId:'cargo-analista',cargoNome:'Analista Administrativo',quantidadeVagas:5,quantidadeCandidatosPrevistos:5,aceitaCadastroReserva:true,quantidadeCadastroReserva:100,
    reservasCota:[{id:'cota',tipo:'PCD',quantidade:1}]},
    {...certamesMock[1].cargos[0],id:'cargo-b',cargoExistenteId:'cargo-professor',cargoNome:'Professor',quantidadeVagas:3,quantidadeCandidatosPrevistos:3}] };
function registro(id: string, extra: Partial<RegistroDashboard> = {}): RegistroDashboard {
  return {...lerDadosDashboard()[0],id,candidatoId:Number.isFinite(Number(id)) ? Number(id) : 999,cargo:'Analista Administrativo',edital:'Edital 001/2026 · SES',editalId:1,orgao:'SES',tipo:'Concurso',inicio:'2026-07-01',situacao:'Em analise',...extra};
}
beforeEach(() => {localStorage.clear();controlePssStore.set('certamesBasicosIngresso',[]);});
afterEach(() => { cleanup();localStorage.clear();controlePssStore.set('certames',certamesOriginais); });

it('soma vagas e reserva sem somar novamente cotas e deduplica nomeações', () => {
  const a=registro('1'); const b=registro('2',{situacao:'Ingresso Concluído'});
  const {linhas}=consolidarNomeados([certame],[a,a,b]);
  expect(resumoNomeados(linhas)).toEqual({vagas:8,nomeados:2,ingressados:1,aNomear:106,aguardandoIngresso:1,excedentes:0,ingressosPendentes:1,tomaramPosse:1,apresentaramServico:1,naoCompareceram:0,cadastroReserva:100});
  expect(linhas.find(l => l.cargo==='Professor')?.aNomear).toBe(3);
});
it('preserva nomeações históricas sem descontar encerrados do saldo de candidatos', () => {
  const invalidos=['Posse Negada','Tornado sem efeito','Exoneração de oficio','Ingresso Cancelado','Encerrado por desistência'] as const;
  const registros=invalidos.map((situacao,i) => registro(String(i),{situacao}));
  registros.push(registro('sem-data',{inicio:'',situacao:'Posse Negada'}));
  const {linhas}=consolidarNomeados([certame],registros);
  expect(resumoNomeados(linhas).nomeados).toBe(6);
  expect(resumoNomeados(linhas).aNomear).toBe(102);
});
it('mantém posse suspensa e não reduz o saldo de outros cargos quando há excedente', () => {
  const registros=Array.from({length:7},(_,i) => registro(String(i),{situacao:'Posse Suspensa'}));
  const resumo=resumoNomeados(consolidarNomeados([{...certame,cargos:certame.cargos.map(c => ({...c,aceitaCadastroReserva:false}))}],registros).linhas);
  expect(resumo.nomeados).toBe(7);
  expect(resumo.aNomear).toBe(3);
  expect(resumo.excedentes).toBe(2);
});
it('exige correspondência por número, ano, órgão, tipo e cargo, sem duplicar matches ambíguos', () => {
  const entradas=[registro('1',{edital:'Edital 002/2026 · SES'}),registro('2',{edital:'Edital 001/2025 · SES'}),
    registro('3',{edital:'Edital 001/2026 · SEPLAG'}),registro('4',{tipo:'Processo Seletivo'}),registro('5',{cargo:'Analista'})];
  const consolidado=consolidarNomeados([certame],entradas);
  expect(consolidado.semCorrespondencia).toHaveLength(5);
  expect(resumoNomeados(consolidado.linhas).nomeados).toBe(0);
  const ambiguo=consolidarNomeados([certame,{...certame,id:'duplicado'}],[registro('6')]);
  expect(ambiguo.semCorrespondencia).toHaveLength(1);
  expect(resumoNomeados(ambiguo.linhas).nomeados).toBe(0);
});
it('separa ofertas por polo e não conta a mesma nomeação duas vezes', () => {
  const polo={...certame,cargos:[{...certame.cargos[0],polo:'Capital',aceitaCadastroReserva:false},{...certame.cargos[0],id:'outro-polo',polo:'Interior',quantidadeVagas:2,aceitaCadastroReserva:false}]};
  const r=registro('1',{polo:'Interior'});
  const resultado=consolidarNomeados([polo],[r,r]);
  expect(resultado.linhas).toHaveLength(2);
  expect(resultado.linhas.find(l => l.polo==='Interior')).toMatchObject({vagas:2,nomeados:1,aNomear:1});
  expect(resumoNomeados(resultado.linhas)).toMatchObject({vagas:7,nomeados:1,aNomear:6});
});
it('aplica obrigatoriamente Homologação antes dos filtros opcionais', () => {
  const linhas=consolidarNomeados([certame,{...certame,id:'cancelado',situacaoAtual:'CANCELADO_ANULADO'}],[]).linhas;
  expect(linhas).toHaveLength(2);
  expect(filtrarNomeados(linhas,{...filtrosNomeadosVazios,edital:certame.id,cargo:'analista',orgao:'SES',tipo:'Concurso'})).toHaveLength(1);
  expect(filtrarNomeados(linhas,{...filtrosNomeadosVazios,tipo:'Processo Seletivo'})).toHaveLength(0);
});
it('renderiza o painel com vagas cadastradas, filtros, abas e navegação para certame', () => {
  controlePssStore.set('certames',[certame]);
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  expect(screen.getByRole('heading',{name:'Dashboard Nomeados'})).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Edital'),{target:{value:'gestao-1'}});
  const tabela=screen.getByRole('table',{name:'Vagas e nomeações'});
  expect(within(tabela).getAllByRole('row')).toHaveLength(5);
  expect(within(tabela).getAllByRole('link')[0].getAttribute('href')).toContain('/ingressos-teste/1?');
  fireEvent.change(screen.getByLabelText('Cargo/Função'),{target:{value:'Professor'}});
  expect(within(tabela).getAllByRole('row')).toHaveLength(4);
  fireEvent.click(screen.getByRole('tab',{name:'Processo Seletivo'}));
  expect(screen.getByText('Nenhum cargo/função cadastrado para os filtros selecionados.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Limpar filtros'}));
  expect(within(tabela).getAllByRole('row').length).toBeGreaterThan(4);
});
it('restringe as vagas do certame ao órgão do perfil setorial', () => {
  localStorage.setItem('prototype-ingresso-perfil-variacao','SETORIAL');
  localStorage.setItem('prototype-ingresso-orgao-atuacao','SEPLAG');
  controlePssStore.set('certames',[certame]);
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  const fonte = consolidarNomeadosDaGestao([],lerRegistrosIngresso());
  expect(fonte.editais.every(e => e.setor === 'SEPLAG' || lerRegistrosIngresso().some(r => r.edital.id === e.gestaoId))).toBe(true);
  const indicadores = screen.getByRole('region',{name:'Indicadores de nomeados'});
  expect(Number(within(indicadores).getAllByRole('heading')[1].closest('article')!.querySelector('strong')!.textContent)).toBe(lerRegistrosIngresso().length);
});

it('conta editais em Homologação uma vez por edital e respeita os filtros', () => {
  const aberto={...certame,id:'aberto',situacaoAtual:'ABERTO' as const};
  const parcial={...certame,id:'parcial',situacaoAtual:'HOMOLOGACAO_PARCIAL' as const};
  const pss={...certame,id:'pss',tipoCertame:'PSS' as const,setor:'SEDUC'};
  const dados=[certame,certame,aberto,parcial,pss];
  expect(contarEditaisHomologados(dados,filtrosNomeadosVazios)).toBe(2);
  expect(contarEditaisHomologados(dados,{...filtrosNomeadosVazios,tipo:'Concurso',cargo:'analista',orgao:'SES'})).toBe(1);
  expect(contarEditaisHomologados(dados,{...filtrosNomeadosVazios,edital:'aberto'})).toBe(0);
  expect(contarEditaisHomologados(dados,{...filtrosNomeadosVazios,cargo:'Inexistente'})).toBe(0);
});
it('calcula posse somente para concurso e conta não comparecimento pelo motivo correto', () => {
  const concurso=consolidarNomeados([certame],[
    registro('1',{situacao:'Aguardando Efetivo Exercicio'}),
    registro('2',{situacao:'Ingresso Concluído'}),
    registro('3',{situacao:'Exoneração de oficio',naoComparecimento:true}),
    registro('4',{situacao:'Posse Negada'}),
  ]);
  expect(resumoNomeados(concurso.linhas)).toMatchObject({nomeados:4,ingressosPendentes:3,ingressados:1,tomaramPosse:2,apresentaramServico:1,naoCompareceram:1,aNomear:104});
  const seletivo={...certame,tipoCertame:'PSS' as const};
  const pss=consolidarNomeados([seletivo],[
    registro('1',{tipo:'Processo Seletivo',situacao:'Aguardando Efetivo Exercicio'}),
    registro('2',{tipo:'Processo Seletivo',situacao:'Ingresso Concluído'}),
    registro('3',{tipo:'Processo Seletivo',situacao:'Ingresso Cancelado',naoComparecimento:true}),
    registro('4',{tipo:'Processo Seletivo',situacao:'Ingresso Cancelado',naoComparecimento:false}),
  ]);
  expect(resumoNomeados(pss.linhas)).toMatchObject({nomeados:4,ingressosPendentes:3,tomaramPosse:0,apresentaramServico:1,naoCompareceram:1});
});
it('filtra ano e situação do edital em todos os indicadores', () => {
  const outro={...certame,id:'outro',numeroEditalOrgao:'002/2025/SES',situacaoAtual:'ABERTO' as const};
  const consolidado=consolidarNomeados([certame,outro],[]);
  expect(filtrarNomeados(consolidado.linhas,{...filtrosNomeadosVazios,ano:'2026',situacao:'HOMOLOGADO'})).toHaveLength(2);
  expect(filtrarNomeados(consolidado.linhas,{...filtrosNomeadosVazios,ano:'2025',situacao:'HOMOLOGADO'})).toHaveLength(0);
  expect(contarEditaisHomologados([certame,outro],{...filtrosNomeadosVazios,ano:'2025'})).toBe(0);
  expect(contarEditaisHomologados([certame,outro],{...filtrosNomeadosVazios,situacao:'ABERTO'})).toBe(0);
});
it('exporta as colunas e os totais do recorte completo para Excel', async () => {
  const linhas=consolidarNomeados([certame],[registro('1',{situacao:'Aguardando Efetivo Exercicio'})]).linhas;
  const workbook=criarExcelNomeados(linhas,{...filtrosNomeadosVazios,tipo:'Concurso',ano:'2026',situacao:'HOMOLOGADO'},1);
  expect(workbook.worksheets.map(s => s.name)).toEqual(['Visão Geral','Vagas e nomeações']);
  const sheet=workbook.getWorksheet('Vagas e nomeações')!;
  expect(sheet.lastRow!.getCell(1).value).toBe('Total filtrado');
  expect(sheet.lastRow!.getCell(4).value).toBe(8);
  expect(sheet.lastRow!.getCell(9).value).toBe(1);
  expect(sheet.lastRow!.getCell(12).value).toBe(107);
  expect(sheet.autoFilter).toBeTruthy();
  const contexto:string[]=[];
  sheet.eachRow(r => contexto.push(String(r.getCell(2).value)));
  expect(contexto).toContain('Concurso');expect(contexto).toContain('2026');expect(contexto).toContain('Homologação');
  expect((await workbook.xlsx.writeBuffer()).byteLength).toBeGreaterThan(0);
});
it('exibe os cinco cards e treze colunas e sincroniza filtros e abas', () => {
  controlePssStore.set('certames',[certame,{...certame,id:'outro',numeroEditalOrgao:'002/2025/SES',tipoCertame:'PSS'}]);
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  const indicadores=screen.getByRole('region',{name:'Indicadores de nomeados'});
  expect(within(indicadores).getAllByRole('heading').map(h => h.textContent)).toEqual(['Editais em Homologação','Nomeados','Ingressados','Ingressos Pendentes','A nomear']);
  fireEvent.change(screen.getByLabelText('Edital'),{target:{value:'gestao-1'}});
  const tabela=screen.getByRole('table',{name:'Vagas e nomeações'});
  expect(within(tabela).getAllByRole('columnheader')).toHaveLength(13);
  expect(screen.getByRole('button',{name:'Exportar Excel'})).toBeTruthy();
  expect(screen.getAllByRole('note')[0].textContent).toContain('Tomaram posse considera');
  fireEvent.change(screen.getByLabelText('Tipo de Ingresso'),{target:{value:'Concurso'}});
  expect(within(indicadores).getAllByRole('heading')[0].closest('article')!.querySelector('strong')!.textContent).toBe('1');
  fireEvent.click(screen.getByRole('tab',{name:'Processo Seletivo'}));
  expect(within(tabela).getAllByRole('row')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button',{name:'Limpar filtros'}));
  expect(screen.getByRole('tab',{name:'Todos'}).getAttribute('aria-selected')).toBe('true');
  expect(within(tabela).getAllByRole('row').length).toBeGreaterThan(4);
});
it('lê o motivo persistido sem confundir outros cancelamentos com não comparecimento', () => {
  const destino='Processo Seletivo SES 2026';
  const base={id:2000,nome:'Nomeado',cargo:'Analista Administrativo',classificacao:'1º',tipoVaga:'AC',dataNomeacao:'01/07/2026',dataPosse:'-',dataEfetivoExercicio:'-'};
  localStorage.setItem('prototype-ingresso-registros-concursos',JSON.stringify({[destino]:[base,{...base,id:2001}]}));
  localStorage.setItem('prototype-ingresso-situacoes-concursos',JSON.stringify({[destino]:{'2000':'Ingresso Cancelado','2001':'Ingresso Cancelado'}}));
  localStorage.setItem('prototype-ingresso-cancelamentos',JSON.stringify({'2000':{motivo:'nao-comparecimento'},'2001':{motivo:'documentacao-obrigatoria'}}));
  localStorage.setItem('prototype-ingresso-cancelamentos-estagio-nao-comparecimento',JSON.stringify({[destino+'|2001']:true}));
  const dados=lerDadosDashboard().filter(r => r.candidatoId>=2000);
  expect(dados.find(r => r.candidatoId===2000)?.naoComparecimento).toBe(true);
  expect(dados.find(r => r.candidatoId===2001)?.naoComparecimento).toBe(false);
});
it('separa cargos iguais por órgão e mantém os totais e filtros de homologação consistentes', () => {
  const multi={...certame,cargos:[
    {...certame.cargos[0],orgaoDestino:'SES',quantidadeVagas:3,aceitaCadastroReserva:false},
    {...certame.cargos[0],id:'vaga-seplag',orgaoDestino:'SEPLAG',quantidadeVagas:2,aceitaCadastroReserva:false},
  ]};
  const dados=consolidarNomeados([multi],[registro('1',{orgao:'SES'}),registro('2',{orgao:'SEPLAG'})]);
  expect(dados.linhas).toHaveLength(2);
  expect(dados.linhas.find(l => l.orgao==='SES')).toMatchObject({vagas:3,nomeados:1,aNomear:2});
  expect(dados.linhas.find(l => l.orgao==='SEPLAG')).toMatchObject({vagas:2,nomeados:1,aNomear:1});
  expect(contarEditaisHomologados([multi],{...filtrosNomeadosVazios,orgao:'SEPLAG',cargo:'Analista'})).toBe(1);
  expect(resumoNomeados(filtrarNomeados(dados.linhas,{...filtrosNomeadosVazios,orgao:'SEPLAG'})).vagas).toBe(2);
});

it('alimenta todos os editais da Gestão mesmo sem correspondência no cadastro de certames', () => {
  controlePssStore.set('certames',[]);sincronizarCertamesIngresso();
  const registros=lerRegistrosIngresso();
  const dados=consolidarNomeadosDaGestao(consultarCertamesIngresso(),registros);
  expect(dados.editais.map(e => e.gestaoId)).toEqual(ingressoConcursosProcessosMock.map(e => e.id));
  const total=resumoNomeados(dados.linhas);
  const esperado=quantitativosIngresso(registros);
  expect(total.nomeados).toBe(esperado.nomeados);
  expect(total.ingressosPendentes).toBe(esperado.nomeados-esperado.ingressados);
  expect(total.ingressados).toBe(esperado.ingressados);
  ingressoConcursosProcessosMock.forEach(e => {
    const recorte=resumoNomeados(dados.linhas.filter(l => l.ingressoId===e.id));
    const origem=quantitativosIngresso(registros.filter(r => r.edital.id===e.id));
    expect(recorte.nomeados).toBe(origem.nomeados);
    expect(recorte.ingressosPendentes).toBe(origem.nomeados-origem.ingressados);
    expect(recorte.ingressados).toBe(origem.ingressados);
  });
});
it('informa candidatos não disponíveis sem depender da quantidade de vagas', () => {
  controlePssStore.set('certames',[]);sincronizarCertamesIngresso();
  const dados=consolidarNomeadosDaGestao(consultarCertamesIngresso(),lerRegistrosIngresso());
  const desconhecidas=dados.linhas.filter(l => l.candidatosInformados===false);
  expect(desconhecidas.length).toBeGreaterThan(0);
  expect(desconhecidas.every(l => l.aNomear===0 && l.excedentes===0)).toBe(true);
  const workbook=criarExcelNomeados(desconhecidas,filtrosNomeadosVazios,0);
  const sheet=workbook.getWorksheet('Vagas e nomeações')!;
  expect(sheet.lastRow!.getCell(12).value).toBe('Vagas e cadastro de reserva não disponíveis');
});
it('atualiza os campos do dashboard ao incluir ou concluir um ingresso manual', async () => {
  controlePssStore.set('certames',[certame]);
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Edital'),{target:{value:'gestao-1'}});
  const cards=screen.getByRole('region',{name:'Indicadores de nomeados'});
  const valores=() => within(cards).getAllByRole('heading').map(h => h.closest('article')!.querySelector('strong')!.textContent);
  const antes=valores();
  const edital=ingressoConcursosProcessosMock[0];
  const novo={...edital.candidatos[0],id:9000,nome:'Ingresso manual',situacao:'Aguardando análise documento',dataNomeacao:'-'};
  await act(async () => persistirDadoIngresso('prototype-ingresso-registros-concursos',JSON.stringify({[edital.titulo]:[novo,novo]})));
  expect(Number(valores()[1])).toBe(Number(antes[1])+1);
  expect(Number(valores()[3])).toBe(Number(antes[3])+1);
  expect(Number(valores()[4])).toBe(Number(antes[4])-1);
  await act(async () => persistirSituacaoDoEdital(edital.titulo,9000,'Ingresso Concluído'));
  expect(Number(valores()[1])).toBe(Number(antes[1])+1);
  expect(Number(valores()[2])).toBe(Number(antes[2])+1);
  expect(Number(valores()[3])).toBe(Number(antes[3]));
  expect(Number(valores()[4])).toBe(Number(antes[4])-1);
  await act(async () => persistirSituacaoDoEdital(edital.titulo,9000,'Ingresso Cancelado'));
  expect(Number(valores()[4])).toBe(Number(antes[4])-1);
});
it('usa a situação atual do Controle de Certame quando há correspondência com o edital', () => {
  const dados=consolidarNomeadosDaGestao([{...certame,situacaoAtual:'ABERTO'}],lerRegistrosIngresso());
  expect(dados.editais.find(e => e.gestaoId===1)).toBeUndefined();
  expect(contarEditaisHomologados(dados.editais,filtrosNomeadosVazios)).toBe(0);
  expect(dados.linhas).toHaveLength(0);
});

it('desconta as seis situações pendentes uma vez e mantém o saldo ao concluir ingresso', () => {
  const situacoes=['Aguardando Analise','Aguardando análise documento','Em analise','Aguardando Efetivo Exercicio','Aguardando Termo Assinado','Posse Suspensa'];
  const edital={...certame,cargos:[{...certame.cargos[0],quantidadeVagas:15,quantidadeCadastroReserva:5}]};
  const entradas=situacoes.map((situacao,i) => registro(String(i+1),{situacao}));
  entradas.push(registro('7',{situacao:'Ingresso Concluído'}),registro('8',{situacao:'Ingresso Cancelado'}));
  const antes=consolidarNomeados([edital],[...entradas,entradas[0]]).linhas[0];
  expect(antes).toMatchObject({totalCandidatos:20,ingressados:1,ingressosPendentes:7,aNomear:12});
  const depois=consolidarNomeados([edital],entradas.map(r => r.id==='1' ? {...r,situacao:'Ingresso Concluído'} : r)).linhas[0];
  expect(depois).toMatchObject({ingressados:2,ingressosPendentes:6,aNomear:12});
});

it('limita saldo inconsistente a zero e informa ausência do total de candidatos', () => {
  const linha=consolidarNomeados([{...certame,cargos:[{...certame.cargos[0],quantidadeVagas:1,aceitaCadastroReserva:false}]}],
    [registro('1'),registro('2',{situacao:'Ingresso Concluído'})]).linhas[0];
  expect(linha).toMatchObject({aNomear:0,excedentes:1,candidatosInformados:true});
  expect(linha.alertas?.join()).toContain('excedem a soma de vagas');
  const semTotal={...linha,vagasInformadas:false};
  atualizarSaldoCandidatos([semTotal]);
  expect(semTotal.candidatosInformados).toBe(false);
  const sheet=criarExcelNomeados([semTotal],filtrosNomeadosVazios,1).getWorksheet('Vagas e nomeações')!;
  expect(sheet.lastRow!.getCell(12).value).toBe('Vagas e cadastro de reserva não disponíveis');
});

it('não usa as cem vagas estáticas da Gestão quando falta o cadastro do certame', () => {
  const registros=lerRegistrosIngresso();
  const dados=consolidarNomeadosDaGestao([],registros);
  expect(dados.linhas.every(l => l.candidatosInformados === false)).toBe(true);
  const recorte=filtrarNomeados(dados.linhas,{...filtrosNomeadosVazios,tipo:'Concurso',edital:'gestao-1'});
  const sheet=criarExcelNomeados(recorte,filtrosNomeadosVazios,1).getWorksheet('Vagas e nomeações')!;
  expect(sheet.lastRow!.getCell(12).value).toBe(0);
});

it('calcula o exemplo oficial de 100 vagas, 5 de reserva, 11 nomeados, 4 ingressados e 7 pendentes como 94', () => {
  const edital={...certame,cargos:[{...certame.cargos[0],quantidadeVagas:100,quantidadeCadastroReserva:5}]};
  const candidatos=Array.from({length:10},(_,i) => registro(String(i+1),{situacao:i<4 ? 'Ingresso Concluído' : 'Em analise'}));
  candidatos.push(registro('11',{situacao:'Posse Negada'}));
  const linhas=consolidarNomeados([edital],[...candidatos,candidatos[0]]).linhas;
  expect(linhas[0]).toMatchObject({vagas:100,cadastroReserva:5,nomeados:11,ingressados:4,ingressosPendentes:7,aNomear:94});
  const sheet=criarExcelNomeados(linhas,filtrosNomeadosVazios,1).getWorksheet('Vagas e nomeações')!;
  expect(sheet.lastRow!.getCell(12).value).toBe(94);
});

it('considera reserva ausente como zero e exibe saldo numérico zero', () => {
  const edital={...certame,cargos:[{...certame.cargos[0],quantidadeVagas:2,aceitaCadastroReserva:true,quantidadeCadastroReserva:undefined}]};
  const linha=consolidarNomeados([edital],[registro('1'),registro('2',{situacao:'Ingresso Concluído'})]).linhas[0];
  expect(linha).toMatchObject({cadastroReserva:0,candidatosInformados:true,aNomear:0});
  const sheet=criarExcelNomeados([linha],filtrosNomeadosVazios,1).getWorksheet('Vagas e nomeações')!;
  expect(sheet.lastRow!.getCell(12).value).toBe(0);
});

it('informa indisponibilidade quando o edital ainda não possui cargos e vagas cadastrados', () => {
  const dados=consolidarNomeados([{...certame,cargos:[]}],[]);
  expect(dados.linhas).toHaveLength(1);
  expect(dados.linhas[0]).toMatchObject({candidatosInformados:false,vagasInformadas:false});
  expect(dados.linhas[0].alertas?.join()).toContain('não disponíveis');
});

it('usa a mesma origem dos detalhes e não duplica ofertas reprocessadas na integração', () => {
  const cadastro={...certame,cargos:[certame.cargos[0],certame.cargos[0],certame.cargos[1]]};
  const detalhes=quantitativosCertameIngresso(localizarCertameIngresso(ingressoConcursosProcessosMock[0],[cadastro]));
  const linhas=consolidarNomeadosDaGestao([cadastro],lerRegistrosIngresso()).linhas.filter(l => l.certameId==='gestao-1');
  const resumo=resumoNomeados(linhas);
  expect(detalhes).toEqual({vagas:8,cadastroReserva:100});
  expect(resumo.vagas).toBe(detalhes.vagas);
  expect(resumo.cadastroReserva).toBe(detalhes.cadastroReserva);
});

it('conta certames homologados ainda sem nomeações e atualiza sua situação', () => {
  const cadastro={...certame,id:'novo-certame',numeroEditalOrgao:'900/2026/SES'};
  controlePssStore.set('certames',[cadastro]);
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Edital'),{target:{value:'novo-certame'}});
  const cards=screen.getByRole('region',{name:'Indicadores de nomeados'});
  const valores=() => within(cards).getAllByRole('heading').map(h => h.closest('article')!.querySelector('strong')!.textContent);
  expect(valores()).toEqual(['1','0','0','0','108']);
  act(() => controlePssStore.set('certames',[{...cadastro,situacaoAtual:'ABERTO'}]));
  expect(valores()[0]).toBe('0');
});

it('separa tipos de vaga quando as ofertas possuem quantitativos próprios', () => {
  const edital={...certame,cargos:[{...certame.cargos[0],tipoVaga:'AC',quantidadeVagas:8,aceitaCadastroReserva:false},
    {...certame.cargos[0],id:'pcd',tipoVaga:'PCD',quantidadeVagas:2,aceitaCadastroReserva:false}]};
  const linhas=consolidarNomeados([edital],[registro('1',{tipoVaga:'PCD'})]).linhas;
  expect(linhas.find(l => l.tipoVaga==='PCD')).toMatchObject({nomeados:1,ingressosPendentes:1,aNomear:1});
  expect(linhas.find(l => l.tipoVaga==='AC')).toMatchObject({nomeados:0,aNomear:8});
});

it('exibe as vagas e reserva de Ver detalhes uma vez no total do edital e no rodapé', () => {
  controlePssStore.set('certames',[]);
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Edital'),{target:{value:'gestao-1'}});
  const tabela=screen.getByRole('table',{name:'Vagas e nomeações'});
  const totais=tabela.querySelectorAll('tbody .dn-edital-total');
  expect(totais).toHaveLength(1);
  const detalhes=quantitativosEditalIngresso(ingressoConcursosProcessosMock[0],[]);
  const celulas=within(totais[0] as HTMLElement).getAllByRole('cell');
  expect(celulas[2].textContent).toBe(String(detalhes.vagas));
  expect(celulas[3].textContent).toBe(String(detalhes.cadastroReserva));
  const rodape=within(tabela.querySelector('tfoot')!).getAllByRole('cell');
  expect(rodape[0].textContent).toBe(String(detalhes.vagas));
  expect(rodape[1].textContent).toBe(String(detalhes.cadastroReserva));
});

it('não distribui o total do edital entre cargos sem quantidade cadastrada e exporta o total correto', () => {
  controlePssStore.set('certames',[]);sincronizarCertamesIngresso();
  const dados=consolidarNomeadosDaGestao(consultarCertamesIngresso(),lerRegistrosIngresso());
  const linhas=filtrarNomeados(dados.linhas,{...filtrosNomeadosVazios,edital:'gestao-1'});
  const totais=totaisNomeadosPorEdital(linhas,dados.editais,dados.linhas);
  expect(totais[0]).toMatchObject({vagas:100,cadastroReserva:5,candidatosInformados:true});
  expect(linhas.every(l => l.vagasInformadas===false)).toBe(true);
  const parcial=totaisNomeadosPorEdital(linhas.filter(l => l.cargo==='Analista Administrativo'),dados.editais,dados.linhas);
  expect(parcial[0].vagasInformadas).toBe(false);
  const sheet=criarExcelNomeados(linhas,filtrosNomeadosVazios,0,totais).getWorksheet('Vagas e nomeações')!;
  expect(sheet.lastRow!.getCell(4).value).toBe(100);
  expect(sheet.lastRow!.getCell(5).value).toBe(5);
  expect(sheet.lastRow!.getCell(12).value).toBe(105-totais[0].nomeados);
});

it('prioriza identificador da oferta e recupera o nome do cargo mesmo quando o ingresso informa traço', () => {
  const edital=ingressoConcursosProcessosMock[0];
  const r={id:'1:9000',edital,candidato:{...edital.candidatos[0],id:9000,cargo:'-',cargoVagaCertameId:'cargo-a'},situacao:'Em analise' as const};
  const dados=consultarDashboardNomeados([certame],[r],filtrosNomeadosVazios);
  const linha=dados.linhas.find(l => l.nomeados===1)!;
  expect(linha).toMatchObject({cargo:'Analista Administrativo',cargoId:'cargo-analista',ingressosPendentes:1,vagas:5});
  expect(linha.relacionamentoPendente).not.toBe(true);
  expect(dados.resumo.aNomear).toBe(dados.totaisEditais[0].aNomear);
  expect(dados.porCargo.reduce((s,c) => s+c.aNomear,0)).toBe(dados.resumo.aNomear);
});

it('não usa descrição semelhante para encobrir identificador de cargo inválido', () => {
  const edital=ingressoConcursosProcessosMock[0];
  const r={id:'1:9000',edital,candidato:{...edital.candidatos[0],id:9000,cargo:'Analista Administrativo',cargoId:'id-inexistente'},situacao:'Em analise' as const};
  const dados=consultarDashboardNomeados([certame],[r],filtrosNomeadosVazios);
  const semVinculo=dados.linhas.find(l => l.nomeados===1)!;
  expect(semVinculo).toMatchObject({relacionamentoPendente:true,vagasInformadas:false,candidatosInformados:false});
  expect(semVinculo.alertas?.join()).toContain('sem vínculo inequívoco');
  expect(dados.linhas.find(l => l.cargoId==='cargo-analista')?.nomeados).toBe(0);
});

it('soma saldos por polo sem compensar uma combinação excedida com a disponibilidade de outra', () => {
  const cadastro={...certame,cargos:[{...certame.cargos[0],polo:'Capital',quantidadeVagas:1,aceitaCadastroReserva:false},
    {...certame.cargos[0],id:'oferta-interior',polo:'Interior',quantidadeVagas:10,aceitaCadastroReserva:false}]};
  const edital=ingressoConcursosProcessosMock[0];
  const registros=[9000,9001].map(id => ({id:`1:${id}`,edital,candidato:{...edital.candidatos[0],id,cargoId:'cargo-analista',polo:'Capital'},situacao:'Em analise' as const}));
  const dados=consultarDashboardNomeados([cadastro],registros,filtrosNomeadosVazios);
  expect(dados.resumo).toMatchObject({aNomear:10,excedentes:1,nomeados:2,ingressosPendentes:2});
  expect(dados.porEdital[0].aNomear).toBe(10);
  expect(dados.porCargo).toHaveLength(1);
  expect(dados.porCargo[0].aNomear).toBe(10);
  const sheet=criarExcelNomeados(dados.linhas,filtrosNomeadosVazios,1,dados.totaisEditais).getWorksheet('Vagas e nomeações')!;
  expect(sheet.lastRow!.getCell(12).value).toBe(10);
});

it('mantém cargos de mesmo nome separados quando seus identificadores são diferentes', () => {
  const cadastro={...certame,cargos:certame.cargos.map((c,i) => ({...c,cargoNome:'Analista',cargoExistenteId:`cargo-${i}`}))};
  const dados=consultarDashboardNomeados([cadastro],[],filtrosNomeadosVazios);
  expect(dados.porCargo).toHaveLength(2);
  expect(new Set(dados.porCargo.map(c => c.id)).size).toBe(2);
});

it('não aplica o total geral ao filtrar o único cargo sem distribuição de vagas', () => {
  controlePssStore.set('certames',[]);sincronizarCertamesIngresso();
  const edital=ingressoConcursosProcessosMock.find(e => new Set(e.candidatos.map(c => c.cargo)).size === 1)!;
  const filtros={...filtrosNomeadosVazios,edital:`gestao-${edital.id}`,cargo:edital.candidatos[0].cargo};
  const dados=consultarDashboardNomeados(consultarCertamesIngresso(),lerRegistrosIngresso(),filtros);
  expect(dados.totaisEditais).toHaveLength(1);
  expect(dados.totaisEditais[0].candidatosInformados).toBe(false);
  expect(dados.porCargo.every(c => c.incompletas)).toBe(true);
});

it('consolida o mesmo cargo entre editais somente após calcular cada saldo e respeita o filtro do edital', () => {
  const origem1=ingressoConcursosProcessosMock[0],origem2=ingressoConcursosProcessosMock[1];
  const c1={...certame,cargos:[{...certame.cargos[0],quantidadeVagas:1,aceitaCadastroReserva:false}]};
  const c2={...certame,id:'segundo',setor:origem2.orgao,numeroEditalOrgao:`${origem2.edital.replace(/^Edital\s*/i,'')}/${origem2.orgao}`,
    cargos:[{...certame.cargos[0],id:'oferta-segundo',cargoNome:'Nome atualizado do cargo',quantidadeVagas:10,aceitaCadastroReserva:false}]};
  const registros=[9000,9001].map(id => ({id:`1:${id}`,edital:origem1,candidato:{...origem1.candidatos[0],id,cargoId:'cargo-analista'},situacao:'Em analise' as const}));
  const dados=consultarDashboardNomeados([c1,c2],registros,filtrosNomeadosVazios);
  expect(dados.porCargo).toHaveLength(1);
  expect(dados.porCargo[0]).toMatchObject({nomeados:2,aNomear:10});
  expect(dados.resumo).toMatchObject({aNomear:10,excedentes:1});
  const filtrado=consultarDashboardNomeados([c1,c2],registros,{...filtrosNomeadosVazios,edital:`gestao-${origem2.id}`});
  expect(filtrado.resumo).toMatchObject({nomeados:0,ingressosPendentes:0,aNomear:10});
  expect(filtrado.porEdital).toHaveLength(1);
});

it('apresenta 19 nomeados como 4 ingressados e 15 pendentes, com 86 a nomear em 105 vagas', () => {
  const edital={...certame,cargos:[{...certame.cargos[0],quantidadeVagas:100,aceitaCadastroReserva:true,quantidadeCadastroReserva:5}]};
  const registros=Array.from({length:19},(_,i) => registro(String(i+1),{situacao:i<4 ? 'Ingresso Concluído' : i<14 ? 'Em analise' : 'Ingresso Cancelado'}));
  const {linhas}=consolidarNomeados([edital],[...registros,registros[0]]);
  expect(resumoNomeados(linhas)).toMatchObject({nomeados:19,ingressados:4,ingressosPendentes:15,aNomear:86});
  expect(linhas[0].ingressados+linhas[0].ingressosPendentes+linhas[0].aNomear).toBe(105);
});

it('mantem cinco indicadores visiveis nas roscas e atualiza a selecao com os filtros gerais', () => {
  controlePssStore.set('certames',[certame]);
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  const grafico=screen.getByRole('region',{name:'Distribuição por Edital'});
  const seletor=within(grafico).getByRole('combobox');
  expect(within(grafico).getAllByRole('term').map(t => t.textContent)).toEqual(['Total de Vagas','Nomeados','Ingressados','Pendentes','A nomear']);
  expect(within(grafico).getAllByRole('definition')).toHaveLength(5);
  const opcoes=within(seletor).getAllByRole('option');
  expect(opcoes.length).toBeGreaterThan(1);
  fireEvent.change(seletor,{target:{value:(opcoes[1] as HTMLOptionElement).value}});
  expect((seletor as HTMLSelectElement).value).toBe((opcoes[1] as HTMLOptionElement).value);
  fireEvent.change(screen.getByLabelText('Edital'),{target:{value:'gestao-1'}});
  expect(within(seletor).getAllByRole('option')).toHaveLength(1);
  expect((seletor as HTMLSelectElement).value).toBe('gestao-1');
  expect(within(grafico).getAllByRole('definition')).toHaveLength(5);
});

it('alterna os segmentos verde e laranja para a soma roxa e restaura ao clicar novamente', () => {
  controlePssStore.set('certames',[certame]);
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  const grafico=screen.getByRole('region',{name:"Distribuição por Edital"});
  const valores=within(grafico).getAllByRole('definition').map(n => n.textContent);
  const soma=Number(valores[2])+Number(valores[3]);
  fireEvent.click(within(grafico).getByRole('button',{name:/Ingressados:/}));
  const agrupado=within(grafico).getByRole('button',{name:/Ingressados \+ Pendentes:/});
  expect(agrupado.getAttribute('aria-pressed')).toBe('true');
  expect(agrupado.getAttribute('aria-label')).toContain('Ingressados + Pendentes: '+soma);
  expect(agrupado.querySelector('circle')!.getAttribute('stroke')).toBe('#7C3AED');
  expect(within(grafico).getAllByRole('definition').map(n => n.textContent)).toEqual(valores);
  fireEvent.click(agrupado);
  expect(within(grafico).getByRole('button',{name:/Ingressados:/}).querySelector('circle')!.getAttribute('stroke')).toBe('#15945D');
  const laranja=within(grafico).getByRole('button',{name:/Pendentes:/});
  expect(laranja.querySelector('circle')!.getAttribute('stroke')).toBe('#FF812B');
  fireEvent.keyDown(laranja,{key:'Enter'});
  expect(within(grafico).getByRole('button',{name:/Ingressados \+ Pendentes:/})).toBeTruthy();
  fireEvent.change(within(grafico).getByRole('combobox'),{target:{value:'gestao-2'}});
  expect(within(grafico).queryByRole('button',{name:/Ingressados \+ Pendentes:/})).toBeNull();
});
