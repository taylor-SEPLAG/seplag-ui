// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TIPOS, todos, VinculoV2ConsultaPage } from './VinculoV2Page';
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

it('shows the create button with all types and opens type selection', () => {
  render(<MemoryRouter><VinculoV2ConsultaPage /></MemoryRouter>);
  const button = screen.getByRole('button', { name: 'Cadastrar V\u00ednculo' });
  expect(button.closest('.v2v-grid-toolbar')).toBeTruthy();
  fireEvent.click(button);
  const dialog = within(screen.getByRole('dialog', { name: 'Cadastrar V\u00ednculo' }));
  const type = dialog.getByRole('combobox');
  expect(dialog.getByRole('button', { name: 'Continuar' }).hasAttribute('disabled')).toBe(true);
  expect(within(type).queryByRole('option', { name: 'Nomeado Efetivo' })).toBeNull();
  fireEvent.change(type, { target: { value: 'Provis\u00f3rio' } });
  expect(dialog.getByRole('button', { name: 'Continuar' }).hasAttribute('disabled')).toBe(false);
});

it('counts all links by type, including types without records', () => {
  render(<MemoryRouter><VinculoV2ConsultaPage /></MemoryRouter>);
  const summary = within(screen.getByRole('region', { name: 'Quantitativos por tipo de v\u00ednculo' }));
  const toggle = summary.getByRole('button', { name: 'V\u00ednculos por tipo' });
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(summary.queryByRole('article')).toBeNull();
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  const cards = summary.getAllByRole('article');
  expect(cards).toHaveLength(TIPOS.length);
  for (const tipo of TIPOS) {
    const card = summary.getByText(tipo).closest('article')!;
    expect(Number(card.querySelector('strong')?.textContent)).toBe(todos().filter(v => v.tipo === tipo).length);
  }
  expect(cards.reduce((sum, card) => sum + Number(card.querySelector('strong')?.textContent), 0)).toBe(todos().length);
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(summary.queryByRole('article')).toBeNull();
});
