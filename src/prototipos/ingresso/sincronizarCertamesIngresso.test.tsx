// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { controlePssStore } from '../controlePss/controlePssStore';
import { certamesMock } from '../controlePss/certame/mock';
import { CHAVE_CERTAMES_BASICOS_INGRESSO, lerCertamesBasicosIngresso } from '../controlePss/certame/certameBasicoIngresso';
import { CertamesListContent } from '../controlePss/certame/CertamesListContent';
import { ingressoConcursosProcessosMock } from '../PrototiposPage';
import { lerRegistrosIngresso } from './ingressoDados';
import { DashboardNomeadosPage } from './DashboardNomeadosPage';
import { consultarCertamesIngresso, sincronizarCertamesIngresso } from './sincronizarCertamesIngresso';
import { consolidarNomeadosDaGestao, totaisNomeadosPorEdital } from './dashboardNomeadosModel';

const inicial=controlePssStore.getState();
beforeEach(() => {localStorage.clear();controlePssStore.set('certames',[]);controlePssStore.set('certamesBasicosIngresso',[]);});
afterEach(() => {cleanup();controlePssStore.update(() => inicial);localStorage.clear();});
const origem=ingressoConcursosProcessosMock[0];

it('persiste somente o cadastro básico homologado, sem inventar campos nem gerar candidatos', () => {
  const antes=JSON.stringify(lerRegistrosIngresso());
  const data=new Date('2026-10-15T12:30:00Z');
  const resultado=sincronizarCertamesIngresso([origem,{...origem,id:500,situacaoCertame:'ABERTO'}],data);
  expect(resultado.criados).toHaveLength(1);
  const [b]=controlePssStore.getState().certamesBasicosIngresso;
  expect(b).toMatchObject({gestaoIngressoId:origem.id,origem:'GESTAO_INGRESSO',criadoEm:data.toISOString(),
    vagasTotaisEdital:100,cadastroReservaEdital:5,pendenteComplementacao:true,distribuicaoVagasPendente:true,cargos:[]});
  expect('regimeJuridico' in b).toBe(false);
  expect('dataPublicacaoEdital' in b).toBe(false);
  expect(b.cargosConhecidos.length).toBeGreaterThan(0);
  expect(JSON.stringify(lerRegistrosIngresso())).toBe(antes);
  expect(lerCertamesBasicosIngresso()).toEqual([b]);
  expect(localStorage.getItem(CHAVE_CERTAMES_BASICOS_INGRESSO)).toBeTruthy();
});

it('não duplica na repetição e diferencia órgão, ano e tipo de ingresso', () => {
  const fontes=[origem,{...origem,id:501,orgao:'SEDUC'}, {...origem,id:502,tipo:'Processo Seletivo' as const},
    {...origem,id:503,edital:'Edital 001/2025'}];
  expect(sincronizarCertamesIngresso(fontes).criados).toHaveLength(4);
  const antes=JSON.stringify(controlePssStore.getState().certamesBasicosIngresso);
  expect(sincronizarCertamesIngresso(fontes,new Date('2027-01-01')).criados).toHaveLength(0);
  expect(JSON.stringify(controlePssStore.getState().certamesBasicosIngresso)).toBe(antes);
});

it('preserva cadastro oficial e não reativa edital que saiu da Homologação', () => {
  sincronizarCertamesIngresso([origem]);
  const oficial={...certamesMock[1],numeroEditalOrgao:'001/2026/SES',setor:'SES',tipoCertame:'CONCURSO_PUBLICO' as const,situacaoAtual:'ABERTO' as const};
  controlePssStore.set('certames',[oficial]);
  const antes=JSON.stringify(oficial);
  expect(sincronizarCertamesIngresso([origem]).criados).toHaveLength(0);
  expect(JSON.stringify(controlePssStore.getState().certames[0])).toBe(antes);
  expect(consultarCertamesIngresso()).toEqual([oficial]);
  expect(consolidarNomeadosDaGestao(consultarCertamesIngresso(),lerRegistrosIngresso()).linhas).toHaveLength(0);
});

it('sinaliza identificação ambígua em vez de criar um terceiro cadastro', () => {
  const oficial={...certamesMock[1],numeroEditalOrgao:'001/2026/SES',setor:'SES',tipoCertame:'CONCURSO_PUBLICO' as const};
  controlePssStore.set('certames',[oficial,{...oficial,id:'duplicado'}]);
  const resultado=sincronizarCertamesIngresso([origem]);
  expect(resultado.criados).toHaveLength(0);
  expect(resultado.ambiguos).toHaveLength(1);
});

it('atualiza quantitativos da origem mantendo reserva separada e sem distribuição inventada', () => {
  sincronizarCertamesIngresso([origem]);
  sincronizarCertamesIngresso([{...origem,quantidadeVagas:120,quantidadeCadastroReserva:8}]);
  const dados=consolidarNomeadosDaGestao(consultarCertamesIngresso(),lerRegistrosIngresso());
  const [total]=totaisNomeadosPorEdital(dados.linhas,dados.editais,dados.linhas);
  expect(total).toMatchObject({vagas:120,cadastroReserva:8});
  expect(total.aNomear).toBe(128-total.nomeados);
  expect(dados.linhas.every(l => l.vagasInformadas===false)).toBe(true);
});

it('mostra o cadastro integrado com rastreabilidade no Controle de Certame', () => {
  sincronizarCertamesIngresso([origem]);
  render(<MemoryRouter><CertamesListContent /></MemoryRouter>);
  expect(screen.getByText(/Origem: Gestão de Ingresso/)).toBeTruthy();
  expect(screen.getByText('Cadastro básico pendente de complementação')).toBeTruthy();
  expect(screen.getByText('CERT-INGRESSO-1')).toBeTruthy();
});

it('mantém o estado vazio e a restrição de Homologação ao limpar filtros', () => {
  sincronizarCertamesIngresso();
  controlePssStore.set('certamesBasicosIngresso',atuais => atuais.map(b => ({...b,situacaoAtual:'CANCELADO_ANULADO'})));
  render(<MemoryRouter><DashboardNomeadosPage /></MemoryRouter>);
  expect(screen.getByText('Nenhum edital em homologação encontrado.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Limpar filtros'}));
  expect(screen.getByText('Nenhum edital em homologação encontrado.')).toBeTruthy();
  expect(screen.getByRole('table',{name:'Vagas e nomeações'}).querySelectorAll('tbody tr')).toHaveLength(0);
});
