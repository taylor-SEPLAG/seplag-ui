// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { STORAGE, todos } from './vinculoDados';
import { agruparAnalise, escolaridadeVinculo, sexoVinculo } from './dashboardAbasModel';

afterEach(() => localStorage.clear());

it('completa o perfil de exemplos antigos salvos sem alterar os registros persistidos ou totais', () => {
  const iniciais = todos();
  const antigos = iniciais.map(({ sexo, escolaridade, ...registro }) => registro);
  const texto = JSON.stringify(antigos);
  localStorage.setItem(STORAGE, texto);
  const atualizados = todos();
  expect(atualizados).toHaveLength(iniciais.length);
  expect(agruparAnalise(atualizados, sexoVinculo).map(g => g.nome)).toEqual(expect.arrayContaining(['Feminino', 'Masculino', 'Não informado']));
  expect(agruparAnalise(atualizados, escolaridadeVinculo)).toHaveLength(9);
  expect(localStorage.getItem(STORAGE)).toBe(texto);
});

it('preserva o perfil informado e não atribui exemplos a vínculos criados pelo usuário', () => {
  const exemplo = todos().find(v => v.id === 'demo-extra-1')!;
  localStorage.setItem(STORAGE, JSON.stringify([
    {...exemplo, sexo: '', escolaridade: 'Mestrado'},
    {...exemplo, id: 'cadastro-usuario', sexo: undefined, escolaridade: undefined},
  ]));
  const registros = todos();
  expect(registros.find(v => v.id === exemplo.id)).toMatchObject({sexo: '', escolaridade: 'Mestrado'});
  const usuario = registros.find(v => v.id === 'cadastro-usuario')!;
  expect(sexoVinculo(usuario)).toBe('Não informado');
  expect(escolaridadeVinculo(usuario)).toBe('Não informado');
});
