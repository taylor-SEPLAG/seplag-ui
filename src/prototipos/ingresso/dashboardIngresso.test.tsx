// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardIngressoPage } from './DashboardIngressoPage';
import { BASE_DASHBOARD, SITUACOES, lerDadosDashboard, filtrarDados, filtrosIniciais, resumirDados, pendente, urlConsulta } from './dashboardIngressoModel';
beforeEach(() => localStorage.clear());
afterEach(() => {cleanup();localStorage.clear();});
it('consolida ingressos uma única vez e mantém suspensos pendentes e encerrados fora das pendências', () => {
  const registros = lerDadosDashboard();
  expect(registros.length).toBeGreaterThan(0);
  expect(new Set(registros.map(r => r.id)).size).toBe(registros.length);
  const resumo = resumirDados(registros);
  expect(resumo[2]+resumo[3]+resumo[4]).toBe(registros.length);
  const suspenso = registros.find(r => r.situacao === 'Posse Suspensa')!;
  expect(suspenso).toBeTruthy();
  expect(pendente(suspenso)).toBe(true);
  expect(registros.filter(r => ['Posse Negada','Tornado sem efeito','Exoneração de oficio','Ingresso Cancelado'].includes(r.situacao)).every(r => !pendente(r))).toBe(true);
  expect(SITUACOES.reduce((total,s) => total+registros.filter(r => r.situacao===s.value).length,0)).toBe(registros.length);
});
it('aplica filtros combinados e usa a data de conclusão dos ingressados', () => {
  const registros=lerDadosDashboard();
  const concluido=registros.find(r => r.situacao==='Ingresso Concluído' && r.conclusao)!;
  expect(concluido).toBeTruthy();
  const filtros={...filtrosIniciais,tipo:concluido.tipo,cargo:concluido.cargo,orgao:concluido.orgao,edital:String(concluido.editalId),inicio:concluido.conclusao,fim:concluido.conclusao};
  expect(filtrarDados(registros,filtros)).toContain(concluido);
  expect(filtrarDados(registros,{...filtros,inicio:'2999-01-01',fim:'2999-12-31'})).toEqual([]);
  expect(filtrarDados(registros,{...filtros,inicio:'2027-01-01',fim:'2026-01-01'})).toEqual([]);
});
it('atualiza situações persistidas, normaliza cancelamento e exclui registros removidos', () => {
  const alvo=lerDadosDashboard().find(r => r.tipo==='Processo Seletivo' && r.candidatoId!==52)!;
  expect(alvo).toBeTruthy();
  localStorage.setItem('prototype-ingresso-situacoes-concursos',JSON.stringify({[alvo.processo]:{[alvo.candidatoId]:'Exoneração de oficio'}}));
  expect(lerDadosDashboard().find(r => r.id===alvo.id)?.situacao).toBe('Ingresso Cancelado');
  localStorage.setItem('prototype-ingresso-exclusoes-concursos',JSON.stringify({[alvo.processo]:[alvo.candidatoId]}));
  expect(lerDadosDashboard().some(r => r.id===alvo.id)).toBe(false);
});
it('limita a fonte à visibilidade do perfil setorial', () => {
  const total=lerDadosDashboard().length;
  localStorage.setItem('prototype-ingresso-perfil-variacao','SETORIAL');
  localStorage.setItem('prototype-ingresso-orgao-atuacao','SES');
  const registros=lerDadosDashboard();
  expect(registros.length).toBeGreaterThan(0);
  expect(registros.length).toBeLessThan(total);
  expect(registros.every(r => r.orgao==='SES')).toBe(true);
});
it('exibe os dez indicadores, gráficos, filtros automáticos, estados vazios e navegação por situação', () => {
  render(<MemoryRouter><DashboardIngressoPage /></MemoryRouter>);
  expect(screen.getByRole('heading',{name:'Dashboard do Ingresso'})).toBeTruthy();
  expect(within(screen.getByRole('region',{name:'Indicadores gerais'})).getAllByRole('heading')).toHaveLength(10);
  expect(screen.getByRole('heading',{name:'Ingressados por Ano'})).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Alertas do Ingresso'})).toBeTruthy();
  const andamento=screen.getByRole('region',{name:'Situações dos ingressos'});
  const link=within(andamento).getAllByRole('link').find(l => l.textContent?.includes('Ingresso Concluído'))!;
  expect(link.getAttribute('href')).toContain('situacao=Ingresso+Conclu');
  fireEvent.change(screen.getByLabelText('Cargo/Especialidade'),{target:{value:'Cargo inexistente'}});
  expect(screen.getAllByText('Nenhum ingresso concluído para os filtros selecionados.').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button',{name:'Limpar filtros'}));
  expect((screen.getByLabelText('Cargo/Especialidade') as HTMLInputElement).value).toBe('');
  fireEvent.click(screen.getByRole('button',{name:'Atualizar dados'}));
});
it('abre a consulta com filtros preservados e links para os ingressos existentes', () => {
  const r=lerDadosDashboard().find(r => r.situacao==='Ingresso Concluído')!;
  const url=urlConsulta({...filtrosIniciais,cargo:r.cargo,edital:String(r.editalId)},{situacao:'Ingresso Concluído'});
  expect(url.startsWith(BASE_DASHBOARD)).toBe(true);
  render(<MemoryRouter initialEntries={[url]}><DashboardIngressoPage /></MemoryRouter>);
  expect(screen.getByRole('heading',{name:'Consulta de ingressos'})).toBeTruthy();
  expect(screen.getAllByRole('link',{name:'Consultar ingresso'}).some(l => l.getAttribute('href')===r.url)).toBe(true);
});
