// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrototiposFeriasPage } from './FeriasPages';
import { AprovacoesFerias } from './AprovacoesFerias';
import { registrosBase, STORAGE_KEY } from './feriasMockDados';
import { filtrosAprovacaoVazios, filtrarAprovacoes, ordenarAprovacoes } from './aprovacoesModel';
import { criarExcelAprovacoes } from './exportarAprovacoes';

beforeEach(() => {localStorage.clear();localStorage.setItem('prototype-ferias-perfil','Chefia Imediata');localStorage.setItem(STORAGE_KEY,JSON.stringify(registrosBase.map(r => r.id === 9 || r.id === 11 ? {...r,dataLimiteValidacaoChefia:'2099-11-15'} : r)));});
afterEach(() => {cleanup();vi.useRealTimers();vi.restoreAllMocks();localStorage.clear();});
const pendentes=registrosBase.filter(r => [9,10,11].includes(r.id));
function montar() {render(<MemoryRouter><PrototiposFeriasPage /></MemoryRouter>);fireEvent.click(screen.getByRole('button',{name:/Aprovações/}));}
it('mostra os três exemplos e as dez colunas na ordem solicitada, com alerta de validade', () => {
  montar();
  const tabela=screen.getByRole('table',{name:'Solicitações de férias para aprovação'});
  expect(within(tabela).getAllByRole('columnheader').map(c => c.textContent)).toEqual(['Servidor','Matrícula / Vínculo','Órgão / Entidade','Lotação','Período','Dias','Tipo','Situação atual','Validade da solicitação','Ações']);
  expect(within(tabela).getAllByRole('row')).toHaveLength(3);
  expect(within(tabela).getByText('Marina Costa Alves')).toBeTruthy();
  expect(screen.getByText('Mostrando 2 de 2 solicitações')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/Rejeitadas/}));
  const linha=within(tabela).getByText('Rodrigo Nunes Ferraz').closest('tr')!;
  expect(within(linha).getByText('778899 / 2')).toBeTruthy();
  expect(within(linha).queryByRole('button',{name:/Validar/})).toBeNull();
  expect(within(linha).getByText('Rejeitada')).toBeTruthy();
});
it('aplica filtros automaticamente, combina critérios e limpa a pesquisa', () => {
  montar();
  fireEvent.change(screen.getByLabelText('Servidor ou matrícula'),{target:{value:'418920'}});
  const tabela=screen.getByRole('table',{name:'Solicitações de férias para aprovação'});
  expect(within(tabela).getAllByRole('row')).toHaveLength(2);
  expect(within(tabela).queryByText('Rodrigo Nunes Ferraz')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Limpar filtro'}));
  fireEvent.change(screen.getByLabelText('Tipo'),{target:{value:'Remunerado'}});
  fireEvent.change(screen.getByLabelText('Órgão/Entidade'),{target:{value:'SES/MT'}});
  expect(within(tabela).getAllByRole('row')).toHaveLength(2);
  expect(within(tabela).getByText('Beatriz Andrade Correia')).toBeTruthy();
});
it('rejeita com justificativa e mantém apenas Visualizar no resultado rejeitado', () => {
  montar();
  fireEvent.click(screen.getByRole('button',{name:'Rejeitar Marina Costa Alves'}));
  const modal=screen.getByRole('dialog',{name:'Rejeitar solicitação'});
  fireEvent.click(within(modal).getByRole('button',{name:'Rejeitar'}));
  expect(within(modal).getByText('Informe a justificativa antes de confirmar.')).toBeTruthy();
  fireEvent.change(within(modal).getByRole('textbox'),{target:{value:'Período não autorizado'}});
  fireEvent.click(within(modal).getByRole('button',{name:'Rejeitar'}));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).find((r:{id:number}) => r.id===9)).toMatchObject({justificativaAvaliacao:'Período não autorizado',resultadoAvaliacao:'Rejeitada'});
  fireEvent.click(screen.getByRole('button',{name:/Rejeitadas/}));
  const linha=screen.getByRole('table',{name:'Solicitações de férias para aprovação'}).querySelector('tbody tr')!;
  expect(within(linha as HTMLElement).getAllByRole('button')).toHaveLength(1);
  expect(within(linha as HTMLElement).getByRole('button',{name:'Visualizar Marina Costa Alves'})).toBeTruthy();
});
it('valida mediante confirmação e preserva a integração de benefícios do recesso', () => {
  montar();
  fireEvent.click(screen.getByRole('button',{name:'Validar Beatriz Andrade Correia'}));
  const modal=screen.getByRole('dialog',{name:'Validar solicitação (chefia)'});
  fireEvent.click(within(modal).getByRole('button',{name:'Validar'}));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).find((r:{id:number}) => r.id===11)).toMatchObject({situacao:'EM ABERTO',auxilioTransporteEfetivado:true,sigpasIntegrado:true});
  expect(screen.queryByRole('button',{name:'Validar Beatriz Andrade Correia'})).toBeNull();
});
it('respeita a avaliação em bloco ao acionar uma linha de lote', () => {
  const grupo=pendentes.slice(0,2).map(r => ({...r,tipo:'Lote' as const,loteId:'LOTE-TESTE',orgaoColetivo:'SEDUC' as const,dataLimiteValidacaoChefia:'2026-11-15'}));
  localStorage.setItem('prototype-ferias-perfil','DRE / RH Central');
  localStorage.setItem(STORAGE_KEY,JSON.stringify(grupo));
  montar();
  fireEvent.click(screen.getByRole('button',{name:'Validar lote de Marina Costa Alves'}));
  const modal=screen.getByRole('dialog',{name:'Validar solicitação (chefia)'});
  expect(within(modal).getByRole('note').textContent).toContain('lote completo');
  fireEvent.click(within(modal).getByRole('button',{name:'Validar'}));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).every((r:{situacao:string}) => r.situacao==='EM ABERTO')).toBe(true);
});
it('exporta o recorte inteiro, mesmo quando a grid tem mais de uma página', () => {
  const registros=Array.from({length:23},(_,i) => ({...pendentes[0],id:900+i,servidorNome:`Pessoa ${i}`}));
  render(<AprovacoesFerias registros={registros} onVisualizar={vi.fn()} onAlterarStatus={vi.fn()} onAlterarStatusLote={vi.fn()} />);
  expect(screen.getByText('Mostrando 10 de 23 solicitações')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Próxima'}));
  expect(screen.getByRole('button',{name:'2'}).getAttribute('aria-current')).toBe('page');
  const recorte=ordenarAprovacoes(filtrarAprovacoes(registros,{...filtrosAprovacaoVazios,situacao:'Pendente'}),'nome',false);
  const planilha=criarExcelAprovacoes(recorte).worksheets[0];
  expect(planilha.rowCount).toBe(24);
  expect(planilha.getRow(2).getCell(6).value).toBe(15);
});
it('ordena por data sem confundir datas brasileiras com os registros ISO existentes', () => {
  const dados=[{...pendentes[0],id:1,lancadoEm:'01/11/2026, 08:00:00'},{...pendentes[0],id:2,lancadoEm:'2026-10-13 18:00'},{...pendentes[0],id:3,lancadoEm:'30/09/2026, 12:00:00'}];
  expect(ordenarAprovacoes(dados,'solicitacao',true).map(r => r.id)).toEqual([1,2,3]);
  expect(ordenarAprovacoes(dados,'solicitacao',false).map(r => r.id)).toEqual([3,2,1]);
});
