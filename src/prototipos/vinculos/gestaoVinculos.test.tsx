// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { VinculoV2ConsultaPage } from './VinculoV2Page';
afterEach(() => { cleanup(); localStorage.clear(); });
it('combines person, type and status filters in the main table', () => {
  render(<MemoryRouter><VinculoV2ConsultaPage /></MemoryRouter>);
  const filters = within(screen.getByRole('region', { name: 'Filtros de consulta' }));
  const person = filters.getByRole('combobox', { name: 'Nome, CPF ou matr\u00edcula' });
  expect(screen.getByRole('columnheader', { name: 'Tipo de V\u00ednculo' })).toBeTruthy();
  fireEvent.change(person, { target: { value: 'joao' } });
  expect(screen.getByRole('listbox')).toBeTruthy();
  fireEvent.keyDown(person, { key: 'ArrowDown' });
  fireEvent.keyDown(person, { key: 'Enter' });
  expect(screen.queryByRole('listbox')).toBeNull();
  fireEvent.change(filters.getByLabelText('Tipo de V\u00ednculo'), { target: { value: 'Nomeado Efetivo' } });
  fireEvent.change(filters.getByLabelText('Situa\u00e7\u00e3o'), { target: { value: 'Ativo' } });
  expect(screen.getAllByRole('button', { name: 'Ver detalhes' })).toHaveLength(1);
  fireEvent.change(filters.getByLabelText('Situa\u00e7\u00e3o'), { target: { value: 'Encerrado' } });
  expect(screen.queryByRole('button', { name: 'Ver detalhes' })).toBeNull();
  fireEvent.click(filters.getByRole('button', { name: 'Limpar filtro' }));
  expect(screen.getAllByRole('button', { name: 'Ver detalhes' })).toHaveLength(10);
  expect((person as HTMLInputElement).value).toBe('');
});

it('shows the create button with all types and opens type selection', async () => {
  render(<MemoryRouter><VinculoV2ConsultaPage /></MemoryRouter>);
  const button = screen.getByRole('button', { name: 'Cadastrar V\u00ednculo' });
  expect(button.closest('.v2v-grid-toolbar')).toBeTruthy();
  fireEvent.click(button);
  const dialog = within(screen.getByRole('dialog', { name: 'Cadastrar V\u00ednculo' }));
  const type = dialog.getByRole('combobox');
  expect(dialog.getByRole('button', { name: 'Continuar' }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(type.closest('.p-dropdown')!);
  const options = within(await screen.findByRole('listbox', { hidden: true }));
  expect((options.getByRole('option', { hidden: true, name: 'Nomeado Efetivo' })).classList.contains('p-disabled')).toBe(true);
  fireEvent.click(options.getByRole('option', { hidden: true, name: 'Nomeado Efetivo' }));
  expect(dialog.getByRole('button', { name: 'Continuar' }).hasAttribute('disabled')).toBe(true);
  expect(options.getByRole('option', { hidden: true, name: 'Aposentado' }).classList.contains('p-disabled')).toBe(true);
  expect(options.getByRole('option', { hidden: true, name: 'Provis\u00f3rio' }).classList.contains('p-disabled')).toBe(false);
  expect(dialog.getByRole('note').textContent).toBe('Tipos de V\u00ednculo gerados automaticamente pelo Ingresso, Aposentadoria ou por outras funcionalidades do sistema n\u00e3o podem ser cadastrados manualmente.');
  fireEvent.click(options.getByRole('option', { hidden: true, name: 'Provis\u00f3rio' }));
  expect(dialog.getByRole('button', { name: 'Continuar' }).hasAttribute('disabled')).toBe(false);
});

