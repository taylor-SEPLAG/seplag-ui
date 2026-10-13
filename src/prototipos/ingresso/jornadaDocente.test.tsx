// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { JornadaDocente, jornadaDocenteVazia, calcularJornadaDocente, jornadaDocenteValida } from './JornadaDocente';
import { PrototiposNovoIngressoPage } from '../PrototiposPage';
beforeEach(() => {localStorage.clear();sessionStorage.clear();});
afterEach(() => {cleanup();localStorage.clear();sessionStorage.clear();});
it('mantém hora-aula e hora-atividade e altera apenas os rótulos das datas', () => {
  function Formulario() { const [config,setConfig]=useState({...jornadaDocenteVazia,jornada:'30',inicio:'2026-10-01',fim:'2027-10-01'}); return <JornadaDocente value={config} onChange={setConfig} />; }
  render(<Formulario />);
  expect(screen.getByLabelText(/Data início da vigência/)).toBeTruthy();
  expect(screen.getByLabelText(/Data fim da vigência/)).toBeTruthy();
  expect(screen.getAllByRole('radio')).toHaveLength(2);
  expect(screen.queryByRole('checkbox')).toBeNull();
  fireEvent.click(screen.getByRole('radio',{name:'50 minutos'}));
  fireEvent.click(screen.getByRole('checkbox',{name:'Possui hora-atividade?'}));
  expect(screen.getByRole('status').textContent).toContain('Hora-atividade habilitada.');
  fireEvent.click(screen.getByRole('radio',{name:'60 minutos'}));
  expect(screen.queryByRole('checkbox')).toBeNull();
  fireEvent.click(screen.getByRole('radio',{name:'50 minutos'}));
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
});
it('valida vigência e preserva a precisão de jornadas não divisíveis por três', () => {
  const config={...jornadaDocenteVazia,duracao:'50' as const,possuiHoraAtividade:true,jornada:'40',inicio:'2026-10-01',fim:'2027-10-01'};
  expect(calcularJornadaDocente(config).atividade).toBeCloseTo(40/3);
  expect(jornadaDocenteValida(config)).toBe(true);
  expect(jornadaDocenteValida({...config,fim:'2026-01-01'})).toBe(false);
  expect(calcularJornadaDocente({...config,duracao:'60'}).atividade).toBe(0);
});
it.each(['Processo Seletivo SEDUC 2026','Processo Seletivo SES 2026'])('restringe a configuração ao edital SEDUC e salva os dados no rascunho: %s', (concurso) => {
  localStorage.setItem('prototype-ingresso-situacoes',JSON.stringify({'2':'Aguardando Efetivo Exercicio'}));
  localStorage.setItem('prototype-analise-provimento-rascunho-2',JSON.stringify({campos:{},dataEfetivoExercicio:'2026-10-01',dataFimEfetivoExercicio:'2027-10-01',jornadaEfetivo:'30 horas'}));
  render(<MemoryRouter initialEntries={[`/prototipos/sigep/ingressos/novo?tipo=Processo+Seletivo&concurso=${encodeURIComponent(concurso)}&candidato=2&orgao=${concurso.includes('SEDUC')?'SEDUC':'SES'}&etapa=efetivo-exercicio`]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.change(screen.getByRole('combobox',{name:/Servidor compareceu/}),{target:{value:'Sim'}});
  if (concurso.includes('SES ')) {expect(screen.queryByRole('heading',{name:'Configuração da Jornada Docente'})).toBeNull();return;}
  expect(screen.getByRole('heading',{name:'Configuração da Jornada Docente'})).toBeTruthy();
  fireEvent.click(screen.getByRole('radio',{name:'50 minutos'}));
  fireEvent.click(screen.getByRole('checkbox',{name:'Possui hora-atividade?'}));
  fireEvent.click(screen.getByRole('button',{name:'Salvar rascunho'}));
  const salvo=JSON.parse(localStorage.getItem('prototype-analise-provimento-rascunho-2')||'{}');
  expect(salvo.campos['docente-inicio']).toBe('2026-10-01');
  expect(salvo.campos['docente-fim']).toBe('2027-10-01');
  fireEvent.change(screen.getByRole('combobox',{name:/Setor\/Lotação/}),{target:{value:'Unidade Central'}});
  fireEvent.click(screen.getByRole('button',{name:'Confirmar'}));
  const configuracoes=JSON.parse(localStorage.getItem('prototype-ingresso-jornada-docente')||'{}');
  expect(configuracoes['Processo Seletivo SEDUC 2026|2']).toMatchObject({duracao:'50',possuiHoraAtividade:true,atividade:10,inicio:'2026-10-01',fim:'2027-10-01'});
});
