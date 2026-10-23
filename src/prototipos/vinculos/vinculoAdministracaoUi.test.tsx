// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VinculoV2CadastroPage, VinculoV2ConsultaPage, VinculoV2DetalhesPage, todos } from './VinculoV2Page';
import { USUARIO_SIGEP_LOGADO } from '../PrototiposPage';
import { alternarUsuarioVinculos } from './vinculoSessao';
import { consultarAuditoriaVinculos } from './vinculoAdministracao';

function montar(url='/prototipos/sigep/vinculos-v2?tipo=Provis%C3%B3rio&expand=Provis%C3%B3rio') {
  return render(<MemoryRouter initialEntries={[url]}><Routes>
    <Route path="/prototipos/sigep/vinculos-v2" element={<VinculoV2ConsultaPage />} />
    <Route path="/prototipos/sigep/vinculos-v2/:id/editar" element={<VinculoV2CadastroPage />} />
    <Route path="/prototipos/sigep/vinculos-v2/:id" element={<VinculoV2DetalhesPage />} />
  </Routes></MemoryRouter>);
}
beforeEach(() => localStorage.clear());
afterEach(() => {cleanup();localStorage.clear();});
it('alterna pelo seletor Perfil da variação sem modal e mostra o perfil selecionado em destaque', async () => {
  montar();
  expect(screen.queryByRole('button',{name:'Excluir'})).toBeNull();
  fireEvent.change(screen.getByLabelText('Perfil da variação'),{target:{value:'admin.vinculos'}});
  expect(screen.getByText('Administrador de Vínculos',{selector:'strong'})).toBeTruthy();
  fireEvent.click(screen.getAllByRole('button',{name:'Mais a\u00e7\u00f5es'})[0]);
  expect(await screen.findByRole('menuitem',{name:'Excluir', hidden:true})).toBeTruthy();
  expect(await screen.findByRole('menuitem',{name:'Editar', hidden:true})).toBeTruthy();
  expect(screen.getAllByRole('menuitem', { hidden: true })).toHaveLength(2);
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.change(screen.getByLabelText('Perfil da variação'),{target:{value:'gestor.vinculos'}});
  expect(screen.getByText('Gestor de Vínculos',{selector:'strong'})).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Excluir'})).toBeNull();
  expect(screen.queryByRole('button',{name:'Editar'})).toBeNull();
});
it('alterna os perfis pelo menu existente e atualiza as ações imediatamente', async () => {
  montar();
  expect(screen.queryByRole('button',{name:'Editar'})).toBeNull();
  expect(screen.queryByRole('button',{name:'Excluir'})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name: new RegExp('^' + USUARIO_SIGEP_LOGADO.nome)}));
  fireEvent.change(screen.getByLabelText('Usuário de demonstração'),{target:{value:'gestor.vinculos'}});
  expect(screen.queryByRole('button',{name:'Editar'})).toBeNull();
  expect(screen.queryByRole('button',{name:'Excluir'})).toBeNull();
  fireEvent.change(screen.getByLabelText('Usuário de demonstração'),{target:{value:'admin.vinculos'}});
  fireEvent.click(screen.getAllByRole('button',{name:'Mais a\u00e7\u00f5es'})[0]);
  expect(await screen.findByRole('menuitem',{name:'Excluir', hidden:true})).toBeTruthy();
  expect(screen.getByRole('button',{name:/^Carlos Souza/})).toBeTruthy();
});
it('bloqueia URL de edição sem perfil e preserva os campos protegidos para administrador', async () => {
  const ui=montar('/prototipos/sigep/vinculos-v2/demo-1/editar');
  expect(screen.getByRole('alert').textContent).toContain('permissão');
  ui.unmount();alternarUsuarioVinculos('admin.vinculos');
  montar('/prototipos/sigep/vinculos-v2/demo-1/editar');
  expect((screen.getByLabelText('Data de Encerramento') as HTMLInputElement).readOnly).toBe(true);
  expect((screen.getByLabelText('Formas de Encerramento') as HTMLSelectElement).disabled).toBe(true);
  expect((screen.getByLabelText('Classificação do Vínculo') as HTMLInputElement).readOnly).toBe(true);
});
it('gestor consulta dados e histórico sem botão Editar e não acessa a edição por URL', async () => {
  alternarUsuarioVinculos('gestor.vinculos');
  const ui=montar('/prototipos/sigep/vinculos-v2/demo-1');
  expect(screen.getByRole('heading',{name:/Detalhes do Vínculo/})).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Editar Vínculo'})).toBeNull();
  fireEvent.click(screen.getByRole('tab',{name:'Histórico de Alterações'}));
  expect(screen.getByRole('region',{name:'Histórico de Alterações'})).toBeTruthy();
  ui.unmount();
  montar('/prototipos/sigep/vinculos-v2/demo-1/editar');
  expect(screen.getByRole('alert').textContent).toContain('permissão');
  expect(screen.queryByRole('button',{name:'Salvar'})).toBeNull();
});
it('confirma os campos modificados, exige justificativa e consulta o histórico', async () => {
  alternarUsuarioVinculos('admin.vinculos');
  montar('/prototipos/sigep/vinculos-v2/demo-1/editar');
  fireEvent.click(screen.getByRole('button',{name:'Salvar'}));
  expect(screen.getByRole('alert').textContent).toContain('Nenhum campo');
  fireEvent.change(screen.getByRole('textbox',{name:'Observação'}),{target:{value:'Informação conferida'}});
  fireEvent.click(screen.getByRole('button',{name:'Salvar'}));
  const modal=screen.getByRole('dialog',{name:'Confirmar Alterações do Vínculo'});
  expect(within(modal).getByText('Informação conferida')).toBeTruthy();
  expect(within(modal).getByRole('button',{name:'Confirmar Alterações'}).hasAttribute('disabled')).toBe(true);
  fireEvent.change(within(modal).getByLabelText('Justificativa da Alteração'),{target:{value:'Conferência do cadastro'}});
  fireEvent.click(within(modal).getByRole('button',{name:'Confirmar Alterações'}));
  expect(screen.getByText(/Alterações do vínculo salvas com sucesso/).textContent).toContain('Histórico registrado');
  fireEvent.click(screen.getByRole('tab',{name:'Histórico de Alterações'}));
  expect(screen.getByText('Edição Cadastral',{selector:'strong'})).toBeTruthy();
  expect(within(screen.getByRole('region',{name:'Histórico de Alterações'})).getByText(/Carlos Souza.*admin.vinculos/)).toBeTruthy();
  fireEvent.click(screen.getByText('Ver detalhes'));
  expect(screen.getByRole('table').textContent).toContain('Informação conferida');
});
it('exclui um vínculo sem dependências, atualiza indicadores e mantém a auditoria', async () => {
  alternarUsuarioVinculos('admin.vinculos');
  montar();
  const totalAntes=todos().length;
  const ativosAntes=Number(screen.getByRole('region',{name:'Indicadores de vínculos'}).querySelector('strong')!.textContent);
  const alvo=todos().find(v => v.tipo==='Provisório' && !v.vacanciaData)!;
  const linha=screen.getByText(alvo.nome,{selector:'td'}).closest('tr')!;
  fireEvent.click(within(linha).getByRole('button',{name:'Mais a\u00e7\u00f5es'}));
  fireEvent.click((await screen.findByRole('menuitem',{name:'Excluir', hidden:true})).querySelector('a')!);
  const modal=screen.getByRole('dialog',{name:'Confirmar Exclusão do Vínculo'});
  fireEvent.change(within(modal).getByLabelText('Justificativa da Exclusão'),{target:{value:'Cadastro indevido'}});
  fireEvent.click(within(modal).getByRole('button',{name:'Confirmar Exclusão'}));
  expect(todos()).toHaveLength(totalAntes-1);
  expect(Number(screen.getByRole('region',{name:'Indicadores de vínculos'}).querySelector('strong')!.textContent)).toBe(ativosAntes-1);
  expect(screen.queryByRole('button',{name:'Auditoria administrativa'})).toBeNull();
  expect(consultarAuditoriaVinculos().some(e => e.vinculoId === alvo.id && e.operacao === 'Exclusão')).toBe(true);
});
it('bloqueia exclusão de origem Ingresso e revoga a edição quando o perfil muda', async () => {
  alternarUsuarioVinculos('admin.vinculos');
  const ui=montar('/prototipos/sigep/vinculos-v2?tipo=Nomeado%20Efetivo&expand=Nomeado%20Efetivo');
  fireEvent.click(screen.getAllByRole('button',{name:'Mais a\u00e7\u00f5es'})[0]);
  fireEvent.click((await screen.findByRole('menuitem',{name:'Excluir', hidden:true})).querySelector('a')!);
  expect(screen.getByRole('dialog',{name:'Não é possível excluir o vínculo'})).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Confirmar Exclusão'})).toBeNull();
  ui.unmount();
  montar('/prototipos/sigep/vinculos-v2/demo-1/editar');
  act(() => alternarUsuarioVinculos(''));
  expect(screen.getByRole('alert').textContent).toContain('permissão');
  expect(screen.queryByRole('button',{name:'Salvar'})).toBeNull();
});
