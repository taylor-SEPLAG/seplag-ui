// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { alternarUsuarioVinculos } from './vinculoSessao';
import { todos, type Vinculo } from './vinculoDados';
import { prepararEdicaoVinculo, confirmarEdicaoVinculo, consultarAuditoriaVinculos, impedimentosExclusao, excluirVinculo } from './vinculoAdministracao';
import { CHAVE_ADMINISTRACAO } from './vinculoPersistencia';

const manual: Vinculo = {id:'manual-teste',nome:'Pessoa Teste',cpf:'987.654.321-00',nascimento:'01/01/1990',matricula:'991122',numero:'1',tipo:'Provisório',regime:'Regime Especial',carreira:'',cargo:'Provisório',perfil:'Administração',jornada:'30 horas',orgao:'SEPLAG',setor:'Unidade Central',inicio:'2026-01-01',termino:'2026-12-31',situacao:'Ativo',criacao:{titulo:'Vínculo cadastrado',responsavel:'Roberto Junior',registradoEm:'2026-01-01T10:00:00Z',dados:{'Lotação':'Unidade Central'}}};
beforeEach(() => {localStorage.clear();localStorage.setItem('prototype-vinculos-v2',JSON.stringify([manual]));});
afterEach(() => {vi.restoreAllMocks();localStorage.clear();});
it('não concede novas permissões ao usuário atual nem permite bypass por operação direta', () => {
  expect(() => prepararEdicaoVinculo(manual.id,{observacao:'teste'})).toThrow(/permissão/);
  expect(() => excluirVinculo(manual.id,'correção')).toThrow(/permissão/);
  expect(() => consultarAuditoriaVinculos(manual.id)).toThrow(/permissão/);
});
it('administrador edita com justificativa independentemente do criador e gestor consulta o histórico', () => {
  alternarUsuarioVinculos('admin.vinculos');
  const preparo=prepararEdicaoVinculo(manual.id,{observacao:'Cadastro conferido'});
  expect(preparo.mudancas).toEqual([{campo:'observacao',rotulo:'Observação',anterior:'',novo:'Cadastro conferido'}]);
  confirmarEdicaoVinculo(manual.id,preparo.novo,'Conferência documental',preparo.versao);
  expect(todos().find(v => v.id===manual.id)?.observacao).toBe('Cadastro conferido');
  expect(consultarAuditoriaVinculos(manual.id).find(e => e.operacao==='Edição Cadastral')).toMatchObject({usuario:'Carlos Souza',login:'admin.vinculos',justificativa:'Conferência documental',mudancas:preparo.mudancas});
  alternarUsuarioVinculos('gestor.vinculos');
  expect(consultarAuditoriaVinculos(manual.id).some(e => e.operacao === 'Edição Cadastral')).toBe(true);
  expect(() => excluirVinculo(manual.id,'correção')).toThrow(/permissão/);
});
it('revalida o perfil, a versão e a justificativa na confirmação', () => {
  alternarUsuarioVinculos('admin.vinculos');
  const preparo=prepararEdicaoVinculo(manual.id,{observacao:'Primeira edição'});
  expect(() => confirmarEdicaoVinculo(manual.id,preparo.novo,' ',preparo.versao)).toThrow(/Justificativa/);
  alternarUsuarioVinculos('');
  expect(() => confirmarEdicaoVinculo(manual.id,preparo.novo,'motivo',preparo.versao)).toThrow(/permissão/);
  alternarUsuarioVinculos('admin.vinculos');
  const concorrente=prepararEdicaoVinculo(manual.id,{observacao:'Outra edição'});
  confirmarEdicaoVinculo(manual.id,concorrente.novo,'Outro motivo',concorrente.versao);
  expect(() => confirmarEdicaoVinculo(manual.id,preparo.novo,'motivo',preparo.versao)).toThrow(/outra operação/);
});
it('gestor não edita nem o próprio cadastro e não confirma uma edição preparada pelo administrador', () => {
  localStorage.setItem('prototype-vinculos-v2',JSON.stringify([{...manual,criacao:{...manual.criacao!,responsavel:'Maria Oliveira'}}]));
  alternarUsuarioVinculos('admin.vinculos');
  const preparo=prepararEdicaoVinculo(manual.id,{observacao:'Alteração administrativa'});
  alternarUsuarioVinculos('gestor.vinculos');
  expect(() => prepararEdicaoVinculo(manual.id,{observacao:'Meu cadastro'})).toThrow(/permissão/);
  expect(() => confirmarEdicaoVinculo(manual.id,preparo.novo,'Justificativa',preparo.versao)).toThrow(/permissão/);
  expect(() => excluirVinculo(manual.id,'Meu cadastro')).toThrow(/permissão/);
  expect(consultarAuditoriaVinculos(manual.id)[0].usuario).toBe('Maria Oliveira');
  expect(todos().find(v => v.id===manual.id)?.observacao).toBeUndefined();
});
it.each(['tipo','nome','cpf','numero','matricula','situacao','vacanciaData','vacanciaForma'] as const)('rejeita alteração de %s na gravação', campo => {
  alternarUsuarioVinculos('admin.vinculos');
  expect(() => prepararEdicaoVinculo(manual.id,{[campo]:'alteração indevida'})).toThrow(/Não é permitido/);
  expect(localStorage.getItem(CHAVE_ADMINISTRACAO)).toBeNull();
});
it('rejeita alterações vazias, dependências inválidas e datas fora da vigência', () => {
  alternarUsuarioVinculos('admin.vinculos');
  expect(() => prepararEdicaoVinculo(manual.id,{})).toThrow(/Nenhum campo/);
  expect(() => prepararEdicaoVinculo(manual.id,{setor:'Outra unidade'})).toThrow(/lotação/);
  expect(() => prepararEdicaoVinculo(manual.id,{inicio:'2027-01-01'})).toThrow(/anterior/);
  expect(() => prepararEdicaoVinculo(manual.id,{criacao:{...manual.criacao!,responsavel:'Outro usuário'}})).toThrow(/Não é permitido/);
});
it.each(['Correção de Informações','Alteração automática','Integração'] as const)('audita %s pela mesma operação protegida', operacao => {
  alternarUsuarioVinculos('admin.vinculos');
  const preparo=prepararEdicaoVinculo(manual.id,{observacao:'Informação recebida'});
  confirmarEdicaoVinculo(manual.id,preparo.novo,'Atualização conferida',preparo.versao,'',{operacao,origem:'Módulo de origem'});
  expect(consultarAuditoriaVinculos(manual.id)[0]).toMatchObject({operacao,origem:'Módulo de origem',usuario:'Carlos Souza',mudancas:preparo.mudancas});
});
it('exige autorização para prorrogação e mantém histórico da data anterior', () => {
  alternarUsuarioVinculos('admin.vinculos');
  expect(() => prepararEdicaoVinculo(manual.id,{termino:'2027-12-31'})).toThrow(/não admite/);
  // Provisório não integra a lista de vínculos com prazo prorrogável.
  const contrato={...manual,tipo:'Contrato Temporário' as const,regime:'Regime Especial',cargo:'Professor',perfil:'Educação',jornada:'30 horas'};
  localStorage.setItem('prototype-vinculos-v2',JSON.stringify([contrato]));
  expect(() => prepararEdicaoVinculo(manual.id,{termino:'2027-12-31'})).toThrow(/autorização/);
  const preparo=prepararEdicaoVinculo(manual.id,{termino:'2027-12-31'},'Processo 123/2026');
  confirmarEdicaoVinculo(manual.id,preparo.novo,'Prorrogação autorizada',preparo.versao,'Processo 123/2026');
  expect(consultarAuditoriaVinculos(manual.id)[0]).toMatchObject({operacao:'Alteração de Data de Fim do Exercício',mudancas:[{campo:'termino',anterior:'2026-12-31',novo:'2027-12-31'}]});
});
it('exclui sem bloquear pela lotação inicial e preserva criação, edição e exclusão na auditoria', () => {
  alternarUsuarioVinculos('admin.vinculos');
  const preparo=prepararEdicaoVinculo(manual.id,{observacao:'Conferido'});
  confirmarEdicaoVinculo(manual.id,preparo.novo,'Conferência',preparo.versao);
  expect(impedimentosExclusao(manual.id)).toEqual([]);
  excluirVinculo(manual.id,'Cadastro indevido');
  expect(todos().some(v => v.id===manual.id)).toBe(false);
  expect(consultarAuditoriaVinculos().filter(e => e.vinculoId===manual.id).map(e => e.operacao).sort()).toEqual(['Criação do Vínculo','Edição Cadastral','Exclusão'].sort());
  expect(consultarAuditoriaVinculos().find(e => e.operacao==='Exclusão')).toMatchObject({usuario:'Carlos Souza',justificativa:'Cadastro indevido',identificacao:{matricula:manual.matricula}});
  alternarUsuarioVinculos('gestor.vinculos');
  expect(() => consultarAuditoriaVinculos(manual.id)).toThrow(/permissão/);
});
it.each(['folha','ferias','licencas','beneficios','aposentadoria','pensao','esocial','integracoes','documentos','movimentacoes','outros'])('bloqueia referências em %s e revalida ao excluir', modulo => {
  alternarUsuarioVinculos('admin.vinculos');
  expect(impedimentosExclusao(manual.id)).toEqual([]);
  localStorage.setItem(`prototype-${modulo}`,JSON.stringify([{vinculoId:manual.id}]));
  expect(impedimentosExclusao(manual.id).length).toBeGreaterThan(0);
  expect(() => excluirVinculo(manual.id,'Cadastro indevido')).toThrow(/referência/);
  expect(todos().some(v => v.id===manual.id)).toBe(true);
});
it('bloqueia vínculos de origem Ingresso e recomenda a retificação', () => {
  alternarUsuarioVinculos('admin.vinculos');
  expect(impedimentosExclusao('demo-1').join()).toContain('retificação');
});
it('falha de persistência não confirma edição nem gera auditoria parcial', () => {
  alternarUsuarioVinculos('admin.vinculos');
  const preparo=prepararEdicaoVinculo(manual.id,{observacao:'Não persistiu'});
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(() => {throw new Error('Sem espaço');});
  expect(() => confirmarEdicaoVinculo(manual.id,preparo.novo,'Conferência',preparo.versao)).toThrow('Sem espaço');
  expect(todos().find(v => v.id===manual.id)?.observacao).toBeUndefined();
  expect(localStorage.getItem(CHAVE_ADMINISTRACAO)).toBeNull();
});
