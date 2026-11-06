// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrototiposFeriasPage } from './FeriasPages';
import { AprovacoesFerias } from './AprovacoesFerias';
import { registrosBase, STORAGE_KEY } from './feriasMockDados';
import { filtrosAprovacaoVazios, filtrarAprovacoes, ordenarAprovacoes } from './aprovacoesModel';
import { criarExcelAprovacoes } from './exportarAprovacoes';

beforeEach(() => {localStorage.clear();localStorage.setItem('prototype-ferias-perfil','DRE / RH Central');localStorage.setItem(STORAGE_KEY,JSON.stringify(registrosBase.map(r => r.id === 9 || r.id === 11 ? {...r,dataLimiteValidacaoChefia:'2099-11-15'} : r)));});
afterEach(() => {cleanup();vi.useRealTimers();vi.restoreAllMocks();localStorage.clear();});
const pendentes=registrosBase.filter(r => [9,10,11].includes(r.id));
function montar() {render(<MemoryRouter><PrototiposFeriasPage /></MemoryRouter>);fireEvent.click(screen.getByRole('button',{name:/Aprovações/}));}
it('mostra os três exemplos e as colunas na ordem solicitada, com alerta de validade', () => {
  montar();
  const tabela=screen.getByRole('table',{name:'Solicitações de férias para aprovação'});
  expect(within(tabela).getAllByRole('columnheader').map(c => c.textContent)).toEqual(['Servidor','Matrícula / Vínculo','Órgão / Entidade','Lotação','Período','Dias','Tipo','Origem','Situação atual','Validade da solicitação','Ações']);
  // Perfil Aprovador unificado (regras-perfis-ferias.md) vê Individual/Recesso do Portal
  // (9, 11, 35, 36, 37, 38 = 6) e os grupos de Coletivo/Lote pendentes (cada loteId vira uma
  // única linha, agrupada): LOTE-UNEMAT-2026, LOTE-SEDUC-2026-APOIO, LOTE-SECITEC-2026-B,
  // LOTE-UNEMAT-2026-APOIO-B (4 grupos) = 10 solicitações. A grid pagina em 10 por página.
  expect(within(tabela).getAllByRole('row')).toHaveLength(11);
  expect(within(tabela).getByText('Marina Costa Alves')).toBeTruthy();
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
function abrirAcoes(linha:HTMLElement) { fireEvent.click(within(linha).getByRole('button',{name:'Mais ações'})); }
it('rejeita com justificativa e mantém apenas Visualizar no resultado rejeitado', () => {
  montar();
  const tabela=screen.getByRole('table',{name:'Solicitações de férias para aprovação'});
  const linhaMarina=within(tabela).getByText('Marina Costa Alves').closest('tr')! as HTMLElement;
  abrirAcoes(linhaMarina);
  fireEvent.click(within(linhaMarina).getByRole('button',{name:'Rejeitar'}));
  const modal=screen.getByRole('dialog',{name:'Rejeitar solicitação'});
  fireEvent.click(within(modal).getByRole('button',{name:'Rejeitar'}));
  expect(within(modal).getByText('Informe a justificativa antes de confirmar.')).toBeTruthy();
  fireEvent.change(within(modal).getByRole('textbox'),{target:{value:'Período não autorizado'}});
  fireEvent.click(within(modal).getByRole('button',{name:'Rejeitar'}));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).find((r:{id:number}) => r.id===9)).toMatchObject({justificativaAvaliacao:'Período não autorizado',resultadoAvaliacao:'Rejeitada'});
  fireEvent.click(screen.getByRole('button',{name:/Rejeitadas/}));
  const linha=screen.getByRole('table',{name:'Solicitações de férias para aprovação'}).querySelector('tbody tr')! as HTMLElement;
  abrirAcoes(linha);
  // No resultado rejeitado, o menu só oferece "Visualizar" (sem Validar/Rejeitar).
  expect(within(linha).getByRole('button',{name:'Visualizar'})).toBeTruthy();
  expect(within(linha).queryByRole('button',{name:'Validar'})).toBeNull();
  expect(within(linha).queryByRole('button',{name:'Rejeitar'})).toBeNull();
});
it('valida mediante confirmação e preserva a integração de benefícios do recesso', () => {
  montar();
  const tabela=screen.getByRole('table',{name:'Solicitações de férias para aprovação'});
  const linhaBeatriz=within(tabela).getByText('Beatriz Andrade Correia').closest('tr')! as HTMLElement;
  abrirAcoes(linhaBeatriz);
  fireEvent.click(within(linhaBeatriz).getByRole('button',{name:'Validar'}));
  const modal=screen.getByRole('dialog',{name:'Validar solicitação (chefia)'});
  fireEvent.click(within(modal).getByRole('button',{name:'Validar'}));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).find((r:{id:number}) => r.id===11)).toMatchObject({situacao:'EM ABERTO',auxilioTransporteEfetivado:true,sigpasIntegrado:true});
  expect(within(screen.getByRole('table',{name:'Solicitações de férias para aprovação'})).queryByText('Beatriz Andrade Correia')).toBeNull();
});
it('respeita a avaliação em bloco ao acionar uma linha de lote', () => {
  const grupo=pendentes.slice(0,2).map(r => ({...r,tipo:'Lote' as const,loteId:'LOTE-TESTE',orgaoColetivo:'SEDUC' as const,dataLimiteValidacaoChefia:'2026-11-15'}));
  localStorage.setItem('prototype-ferias-perfil','DRE / RH Central');
  localStorage.setItem(STORAGE_KEY,JSON.stringify(grupo));
  montar();
  const tabela=screen.getByRole('table',{name:'Solicitações de férias para aprovação'});
  const linhaLote=within(tabela).getByText(/Avaliação em bloco/).closest('tr')! as HTMLElement;
  abrirAcoes(linhaLote);
  fireEvent.click(within(linhaLote).getByRole('button',{name:'Validar lote'}));
  const modal=screen.getByRole('dialog',{name:'Validar solicitação (chefia)'});
  expect(within(modal).getByRole('note').textContent).toContain('lote completo');
  fireEvent.click(within(modal).getByRole('button',{name:'Validar'}));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).every((r:{situacao:string}) => r.situacao==='EM ABERTO')).toBe(true);
});
it('exporta o recorte inteiro, mesmo quando a grid tem mais de uma página', () => {
  const registros=Array.from({length:23},(_,i) => ({...pendentes[0],id:900+i,servidorNome:`Pessoa ${i}`}));
  render(<AprovacoesFerias registros={registros} onVisualizar={vi.fn()} onAlterarStatus={vi.fn()} onAlterarStatusLote={vi.fn()} />);
  const botaoPagina2=screen.getByText('2',{selector:'.p-paginator-page'});
  fireEvent.click(botaoPagina2);
  expect(botaoPagina2.classList.contains('p-highlight')).toBe(true);
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
