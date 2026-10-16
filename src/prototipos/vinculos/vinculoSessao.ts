import { useSyncExternalStore } from 'react';

export const USUARIOS_VINCULOS = [
  { login: 'gestor.vinculos', nome: 'Maria Oliveira', perfil: 'Gestor de Vínculos', editar: false, excluir: false },
  { login: 'admin.vinculos', nome: 'Carlos Souza', perfil: 'Administrador de Vínculos', editar: true, excluir: true },
] as const;
const CHAVE = 'sigep:vinculos:usuario-demonstracao';
const EVENTO = 'sigep:vinculos:sessao';
export function usuarioVinculos() {
  return USUARIOS_VINCULOS.find(u => u.login === localStorage.getItem(CHAVE));
}
export function alternarUsuarioVinculos(login: string) {
  if (login && !USUARIOS_VINCULOS.some(u => u.login === login)) throw new Error('Usuário de demonstração inválido.');
  if (login) localStorage.setItem(CHAVE, login); else localStorage.removeItem(CHAVE);
  window.dispatchEvent(new Event(EVENTO));
}
export function exigirPermissaoVinculo(operacao: 'editar' | 'historico' | 'excluir') {
  const usuario = usuarioVinculos();
  if (!usuario || (operacao === 'editar' && !usuario.editar) || (operacao === 'excluir' && !usuario.excluir)) throw new Error('Seu perfil não possui permissão para esta operação.');
  return usuario;
}
export const observarSessaoVinculos = (listener: () => void) => {
  window.addEventListener(EVENTO, listener); window.addEventListener('storage', listener);
  return () => {window.removeEventListener(EVENTO, listener);window.removeEventListener('storage', listener);};
};
export function useUsuarioVinculos() {
  useSyncExternalStore(observarSessaoVinculos, () => localStorage.getItem(CHAVE) || '');
  return usuarioVinculos();
}
