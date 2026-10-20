// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LayoutSeplag } from './Layout';
import type { IMenuSeplag } from '../Config/menu';

const menus: IMenuSeplag[] = [
  {label:'Página Inicial',icon:'pi pi-home',to:'/sigep/inicial',visibleOnMenu:true,visibleOnRouter:true},
  {label:'Cadastro',icon:'pi pi-file-edit',visibleOnMenu:true,visibleOnRouter:true,items:[
    {label:'Pessoas',icon:'pi pi-users',to:'/sigep/pessoas',visibleOnMenu:true,visibleOnRouter:true},
    {label:'Oculto',icon:'pi pi-file',to:'/sigep/oculto',visibleOnMenu:false,visibleOnRouter:false},
  ]},
  {label:'Documentação',icon:'pi pi-folder',visibleOnMenu:true,visibleOnRouter:true,items:[
    {label:'Documentos',icon:'pi pi-file',to:'/sigep/documentos',visibleOnMenu:true,visibleOnRouter:true},
  ]},
];
const props = {nomeSistema:'SIGEP',ambienteSistema:'Teste',sistemas:[],logoSrc:'/logo.png',compactLogoSrc:'/compacto.png',menuItems:menus,nomeApresentacao:'Operador',numrVinculoAtual:2,vinculos:[],onLogout:vi.fn(),onAlterarSenha:vi.fn(),onSelecionarVinculo:vi.fn(),compactNavigation:true};
const larguraOriginal = window.innerWidth;
function largura(value:number) { Object.defineProperty(window,'innerWidth',{value,writable:true,configurable:true}); }
function montar(rota='/sigep/inicial') { return render(<MemoryRouter initialEntries={[rota]}><LayoutSeplag {...props}><h1>Conteúdo do sistema</h1></LayoutSeplag></MemoryRouter>); }
afterEach(()=>{cleanup();localStorage.clear();largura(larguraOriginal);});

it('recolhe mantendo a navegação, tooltips e menu ativo; restaura a preferência',()=>{
  largura(1440); const {container,unmount}=montar();
  fireEvent.click(screen.getByRole('button',{name:'Recolher menu'}));
  expect(container.querySelector('.layout-navigation-collapsed')).toBeTruthy();
  expect(screen.getByRole('button',{name:'Expandir menu'}).getAttribute('title')).toBe('Expandir menu');
  expect(screen.getByRole('link',{name:'Página Inicial'}).getAttribute('title')).toBe('Página Inicial');
  expect(screen.getByRole('link',{name:'Página Inicial'}).closest('li')?.getAttribute('data-route-active')).toBe('true');
  expect(screen.getByRole('heading',{name:'Conteúdo do sistema'})).toBeTruthy();
  expect(localStorage.getItem('sigep-sidebar-collapsed')).toBe('true');
  unmount(); const segunda=montar();
  expect(segunda.container.querySelector('.layout-navigation-collapsed')).toBeTruthy();
});

it('expande automaticamente um menu recolhido, inclusive quando sua rota já está ativa',()=>{
  largura(1440); localStorage.setItem('sigep-sidebar-collapsed','true');
  const {container}=montar('/sigep/pessoas');
  fireEvent.click(screen.getByRole('link',{name:'Cadastro'}));
  expect(container.querySelector('.layout-navigation-collapsed')).toBeNull();
  expect(screen.getByRole('link',{name:'Cadastro'}).getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('link',{name:'Pessoas'})).toBeTruthy();
  expect(screen.queryByRole('link',{name:'Oculto'})).toBeNull();
});

it('mantém as configurações de perfil acessíveis pelo avatar recolhido',()=>{
  largura(1440);localStorage.setItem('sigep-sidebar-collapsed','true');montar();
  fireEvent.click(screen.getByRole('button',{name:'Configurações de Operador — Vínculo 2'}));
  expect(screen.getByRole('button',{name:'Alterar Senha'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Alterar Vínculo'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Recolher menu'})).toBeTruthy();
});

it('expande menus independentemente e permite recolher apenas um deles pelos chevrons',()=>{
  largura(1440);montar();
  fireEvent.click(screen.getByRole('button',{name:'Expandir Cadastro'}));
  fireEvent.click(screen.getByRole('button',{name:'Expandir Documentação'}));
  expect(screen.getByRole('button',{name:'Recolher Cadastro'}).getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('button',{name:'Recolher Documentação'}).getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(screen.getByRole('button',{name:'Recolher Cadastro'}));
  expect(screen.getByRole('button',{name:'Expandir Cadastro'}).getAttribute('aria-expanded')).toBe('false');
  expect(screen.getByRole('button',{name:'Recolher Documentação'}).getAttribute('aria-expanded')).toBe('true');
});

it('abre em sobreposição no celular e fecha com Escape ou navegação',()=>{
  largura(390);const {container}=montar();
  const abrir=screen.getByRole('button',{name:'Expandir menu'});
  fireEvent.click(abrir);
  expect(container.querySelector('.layout-mobile-sidebar-active')).toBeTruthy();
  fireEvent.keyDown(document,{key:'Escape'});
  expect(container.querySelector('.layout-mobile-sidebar-active')).toBeNull();
  expect(document.activeElement).toBe(abrir);
  fireEvent.click(abrir);
  fireEvent.click(screen.getByRole('link',{name:'Página Inicial'}));
  expect(container.querySelector('.layout-mobile-sidebar-active')).toBeNull();
});
