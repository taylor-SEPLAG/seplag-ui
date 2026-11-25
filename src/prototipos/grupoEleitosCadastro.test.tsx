// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PrototiposFolhaGrupoEleitoFormPage, PrototiposFolhaGrupoEleitosPage } from './PrototiposPage';
afterEach(cleanup);
vi.stubGlobal('matchMedia', vi.fn(() => ({matches:false,addListener:vi.fn(),removeListener:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn()})));
it('inicia sem eleitos e permite transferir uma pessoa e devolvê-la', () => {
  render(<MemoryRouter><PrototiposFolhaGrupoEleitoFormPage /></MemoryRouter>);
  const origem = screen.getByRole('region', {name:'Disponíveis'});
  const destino = screen.getByRole('region', {name:'Eleitos'});
  expect(within(origem).getAllByRole('row')).toHaveLength(57);
  expect(within(destino).getByText('Nenhuma pessoa selecionada.')).toBeTruthy();
  fireEvent.click(within(origem).getAllByRole('checkbox')[1]);
  fireEvent.click(screen.getByRole('button', {name:'Adicionar pessoas selecionadas'}));
  expect(within(destino).getByText('139151')).toBeTruthy();
  expect(within(origem).queryByText('139151')).toBeNull();
  fireEvent.click(screen.getByRole('button', {name:'Remover todos os eleitos'}));
  expect(within(destino).getByText('Nenhuma pessoa selecionada.')).toBeTruthy();
  expect(within(origem).getByText('139151')).toBeTruthy();
});
it('consulta por CPF sem pontuação e limpa o filtro', () => {
  render(<MemoryRouter><PrototiposFolhaGrupoEleitoFormPage /></MemoryRouter>);
  const origem = screen.getByRole('region', {name:'Disponíveis'});
  const quantidade = within(origem).getAllByRole('row').length;
  fireEvent.change(screen.getByLabelText('Nome, CPF ou Matrícula'), {target:{value:'01201402502'}});
  fireEvent.click(screen.getByRole('button', {name:'Consultar'}));
  expect(within(origem).getAllByRole('row')).toHaveLength(4);
  expect(within(origem).getByText('139151')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', {name:'Limpar'}));
  expect(within(origem).getAllByRole('row')).toHaveLength(quantidade);
});

it('avança e retorna às páginas dos grupos encontrados', () => {
  const {container} = render(<MemoryRouter><PrototiposFolhaGrupoEleitosPage /></MemoryRouter>);
  expect(screen.queryByText('Grupo de Temporários')).toBeNull();
  fireEvent.click(container.querySelector('button.p-paginator-next')!);
  expect(screen.getByText('Grupo de Temporários')).toBeTruthy();
  expect(screen.queryByText('Grupo 15 pessoas')).toBeNull();
  fireEvent.click(container.querySelector('button.p-paginator-prev')!);
  expect(screen.getByText('Grupo 15 pessoas')).toBeTruthy();
  expect(screen.queryByText('Grupo de Temporários')).toBeNull();
});

it('exibe Agendado automaticamente para início futuro sem oferecer essa opção', () => {
  render(<MemoryRouter><PrototiposFolhaGrupoEleitoFormPage /></MemoryRouter>);
  expect(screen.queryByRole('radio', {name:'AGENDADO'})).toBeNull();
  const data = screen.getByPlaceholderText('dd/mm/aaaa');
  fireEvent.input(data, {target:{value:'31/12/2099'}});
  fireEvent.blur(data);
  expect(screen.getByText('Agendado')).toBeTruthy();
  expect(screen.getByRole('radio', {name:'ATIVO'}).getAttribute('aria-checked') ?? (screen.getByRole('radio', {name:'ATIVO'}) as HTMLInputElement).checked).toBeTruthy();
  fireEvent.input(data, {target:{value:'01/01/2020'}});
  fireEvent.blur(data);
  expect(screen.queryByText('Agendado')).toBeNull();
  expect(screen.getByText('Ativo')).toBeTruthy();
});

it('abre o cadastro com os integrantes em modo de visualização sem permitir alterações', () => {
  render(<MemoryRouter initialEntries={['/prototipos/folha/grupo-eleitos']}><Routes>
    <Route path="/prototipos/folha/grupo-eleitos" element={<PrototiposFolhaGrupoEleitosPage />} />
    <Route path="/prototipos/folha/grupo-eleitos/:id/visualizar" element={<PrototiposFolhaGrupoEleitoFormPage somenteLeitura />} />
  </Routes></MemoryRouter>);
  const linha = screen.getByText('Grupo 15 pessoas').closest('tr')!;
  expect(within(linha).getByText('15')).toBeTruthy();
  fireEvent.click(linha.querySelector('.p-splitbutton-defaultbutton')!);
  expect(screen.getByText('Visualizar - Grupo de Eleitos')).toBeTruthy();
  expect(screen.getByDisplayValue('Grupo 15 pessoas').matches(':disabled')).toBe(true);
  const eleitos = screen.getByRole('region', {name:'Eleitos'});
  expect(within(eleitos).getAllByRole('row')).toHaveLength(16);
  expect(within(eleitos).getByText('João Silva')).toBeTruthy();
  expect(screen.getByRole('button', {name:'Remover todos os eleitos'}).matches(':disabled')).toBe(true);
  expect(screen.queryByRole('button', {name:'Salvar'})).toBeNull();
  const voltar = screen.getByRole('button', {name:'Voltar'});
  expect(voltar.matches(':disabled')).toBe(false);
  fireEvent.click(voltar);
  expect(screen.getByText('Grupo 15 pessoas')).toBeTruthy();
});
