// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VidaFuncionalPage } from './VidaFuncionalPage';
import { exportarHistoricoPdf } from './exportarHistorico';
import { pesquisarEventos } from './model';

vi.mock('./exportarHistorico', () => ({ exportarHistoricoPdf: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
function montar() {
  render(<MemoryRouter initialEntries={['/vida/5/beatriz-1']}><Routes>
    <Route path="/vida/:pessoaId/:vinculoId" element={<VidaFuncionalPage />} />
  </Routes></MemoryRouter>);
}
it('exporta o vínculo selecionado com todas as ocorrências e sem documentos comprobatórios', async () => {
  vi.mocked(exportarHistoricoPdf).mockResolvedValue();
  montar();
  fireEvent.click(screen.getByRole('button', { name: 'Exportar Histórico' }));
  await waitFor(() => expect(exportarHistoricoPdf).toHaveBeenCalledOnce());
  const [pessoa, vinculo, eventos, detalhes] = vi.mocked(exportarHistoricoPdf).mock.calls[0];
  expect(pessoa.nome).toBe('Beatriz Costa Lima');
  expect(vinculo.matricula).toBe('630218');
  expect(eventos).toEqual(pesquisarEventos('beatriz-1'));
  for (const evento of eventos) {
    expect(Object.values(detalhes(evento)).flatMap(Object.keys).some(campo => /^documento/i.test(campo))).toBe(false);
  }
  await waitFor(() => expect(screen.getByRole('button', { name: 'Exportar Histórico' }).hasAttribute('disabled')).toBe(false));
});
it('informa falha na geração e permite tentar novamente', async () => {
  vi.mocked(exportarHistoricoPdf).mockRejectedValue(new Error('Falha'));
  montar();
  fireEvent.click(screen.getByRole('button', { name: 'Exportar Histórico' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Não foi possível gerar o PDF'));
  expect(screen.getByRole('button', { name: 'Exportar Histórico' }).hasAttribute('disabled')).toBe(false);
});
