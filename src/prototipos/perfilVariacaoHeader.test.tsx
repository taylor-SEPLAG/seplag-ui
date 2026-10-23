// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { PrototypeSystemPage, PrototiposIngressosTestePage, PrototiposIngressoGeralPage } from './PrototiposPage';

afterEach(() => { cleanup(); localStorage.clear(); });

it('coloca o seletor entre a busca e o sistema, sem duplicá-lo no conteúdo', () => {
  render(<MemoryRouter><PrototiposIngressosTestePage /></MemoryRouter>);
  const seletor = screen.getByLabelText('Perfil da variação');
  const destino = document.querySelector('.sigep-profile-slot')!;
  expect(destino.contains(seletor)).toBe(true);
  expect(document.querySelector('.layout-content')!.contains(seletor)).toBe(false);
  expect(destino.previousElementSibling?.classList.contains('sigep-global-search')).toBe(true);
  expect(destino.nextElementSibling?.classList.contains('layout-topbar-module')).toBe(true);
  expect(screen.queryByLabelText('Órgão de atuação')).toBeNull();
  fireEvent.change(seletor, { target: { value: 'SETORIAL' } });
  expect(within(destino as HTMLElement).getByLabelText('Órgão de atuação')).toBeTruthy();
});

it('remove e restaura o seletor ao navegar para a tela inicial do mesmo módulo', () => {
  render(<MemoryRouter initialEntries={['/gestao']}>
    <Link to="/menu">Menu do ingresso</Link><Link to="/gestao">Gestão</Link>
    <Routes>
      <Route path="/gestao" element={<PrototiposIngressosTestePage />} />
      <Route path="/menu" element={<PrototiposIngressoGeralPage />} />
    </Routes>
  </MemoryRouter>);
  expect(screen.getAllByLabelText('Perfil da variação')).toHaveLength(1);
  fireEvent.click(screen.getByRole('link', { name: 'Menu do ingresso' }));
  expect(screen.queryByLabelText('Perfil da variação')).toBeNull();
  expect(document.querySelector('.sigep-profile-slot')!.childElementCount).toBe(0);
  fireEvent.click(screen.getByRole('link', { name: 'Gestão' }));
  expect(screen.getAllByLabelText('Perfil da variação')).toHaveLength(1);
});

it('não adiciona controles ao header de uma tela sem variação', () => {
  render(<MemoryRouter><PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={[]}>
    <p>Tela sem variação</p>
  </PrototypeSystemPage></MemoryRouter>);
  expect(screen.queryByLabelText('Perfil da variação')).toBeNull();
  expect(document.querySelector('.sigep-profile-slot')!.childElementCount).toBe(0);
});
