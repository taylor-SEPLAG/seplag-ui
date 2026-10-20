// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { GlobalSearch, indexarFuncionalidades } from './GlobalSearch';
import type { IMenuSeplag } from '../Config/menu';
const items:IMenuSeplag[]=[{label:'Vínculos Funcionais',icon:'',items:[
  {label:'Histórico Funcional',icon:'',to:'/historico',visibleOnMenu:true,visibleOnRouter:true},
  {label:'Restrito',icon:'',to:'/restrito',visibleOnRouter:false},
  {label:'Indisponível',icon:'',to:'/indisponivel',disabled:true},
]},{label:'Oculto',icon:'',visibleOnMenu:false,items:[{label:'Filho oculto',icon:'',to:'/oculto'}]}];
afterEach(cleanup);
function Rota(){return <output aria-label="Rota">{useLocation().pathname}</output>;}
it('indexa apenas funcionalidades disponíveis no menu, respeitando pais ocultos',()=>{
  expect(indexarFuncionalidades(items)).toEqual([{nome:'Histórico Funcional',rota:'/historico',contexto:'Vínculos Funcionais'}]);
});
it('pesquisa sem acentos, navega com Enter e apresenta mensagem para busca vazia de resultados',()=>{
  render(<MemoryRouter><GlobalSearch items={items}/><Rota/></MemoryRouter>);
  const campo=screen.getByRole('combobox',{name:'Buscar funcionalidade'});
  fireEvent.change(campo,{target:{value:'historico vinculos'}});
  expect(screen.getByRole('option',{name:/Histórico Funcional/})).toBeTruthy();
  fireEvent.keyDown(campo,{key:'Enter'});
  expect(screen.getByLabelText('Rota').textContent).toBe('/historico');
  expect((campo as HTMLInputElement).value).toBe('');
  fireEvent.change(campo,{target:{value:'inexistente'}});
  expect(screen.getByText('Nenhuma funcionalidade encontrada.')).toBeTruthy();
  fireEvent.keyDown(campo,{key:'Escape'});
  expect(screen.queryByRole('listbox')).toBeNull();
});
