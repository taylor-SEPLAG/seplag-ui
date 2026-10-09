// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VidaFuncionalPage } from './VidaFuncionalPage';
import { filtrosVazios, pesquisarPessoas, pesquisarEventos, indicadores } from './model';
afterEach(cleanup);
it('localiza matrícula encerrada e aplica filtros ao mesmo vínculo', () => {
  expect(pesquisarPessoas({ ...filtrosVazios, matricula: '418920' }).map(p => p.id)).toEqual(['3']);
  expect(pesquisarPessoas({ ...filtrosVazios, matricula: '418920', situacao: 'Vigente' })).toEqual([]);
  expect(pesquisarPessoas({ ...filtrosVazios, nome: 'jose antonio' }).map(p => p.id)).toEqual(['4']);
});
it('separa aposentadoria e preserva eventos simultâneos e retroativos', () => {
  expect(pesquisarEventos('carlos-1').map(e => e.tipo)).toEqual(['Encerramento', 'Ingresso']);
  expect(pesquisarEventos('carlos-2').map(e => e.tipo)).toEqual(['Ingresso']);
  const lista = pesquisarEventos('ana-1');
  expect(lista.filter(e => e.data === '2026-10-01')).toHaveLength(2);
  expect(lista.map(e => e.data)).toEqual([...lista.map(e => e.data)].sort().reverse());
  expect(pesquisarEventos('ana-1', '', '2024-04-01', '2024-04-01')[0].registradoEm).toContain('2024-05-14');
  expect(indicadores(new Date('2026-10-09T12:00:00Z'))).toEqual([6, 4, 4, 2]);
});
it('navega pelas três telas e expande várias ocorrências sem modal', () => {
  render(<MemoryRouter initialEntries={['/prototipos/sigep/vida-funcional']}><Routes><Route path="/prototipos/sigep/vida-funcional" element={<VidaFuncionalPage />} /><Route path="/prototipos/sigep/vida-funcional/:pessoaId/vinculos" element={<VidaFuncionalPage />} /><Route path="/prototipos/sigep/vida-funcional/:pessoaId/vinculos/:vinculoId/historico" element={<VidaFuncionalPage />} /></Routes></MemoryRouter>);
  fireEvent.click(screen.getAllByRole('link', { name: 'Ver vínculos' })[0]);
  expect(screen.getByText('Quantidade total de vínculos')).toBeTruthy();
  fireEvent.click(screen.getByRole('link', { name: 'Ver vida funcional' }));
  const jornada = screen.getByRole('button', { name: /Jornada de 30 para 40/ });
  const cargo = screen.getByRole('button', { name: /Designação para função de coordenação/ });
  fireEvent.click(jornada); fireEvent.click(cargo);
  expect(jornada.getAttribute('aria-expanded')).toBe('true');
  expect(cargo.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByText('Jornada anterior')).toBeTruthy();
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(jornada);
  expect(screen.queryByText('Jornada anterior')).toBeNull();
  fireEvent.click(screen.getByRole('link', { name: 'Voltar aos vínculos' }));
  expect(screen.getByText('Quantidade total de vínculos')).toBeTruthy();
});
