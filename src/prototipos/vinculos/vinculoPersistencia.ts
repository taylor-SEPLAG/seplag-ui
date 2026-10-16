import { useSyncExternalStore } from 'react';
import type { Vinculo } from './vinculoDados';

export type MudancaVinculo = { campo: string; rotulo: string; anterior: string; novo: string };
export type AuditoriaVinculo = {
  id: string; vinculoId: string; registradoEm: string; usuario: string; login: string;
  operacao: string; origem: string; justificativa: string; mudancas: MudancaVinculo[];
  identificacao: { nome: string; matricula: string; numero: string; tipo: string };
};
type Estado = { alteracoes: Record<string, Vinculo>; excluidos: string[]; auditoria: AuditoriaVinculo[] };
export const CHAVE_ADMINISTRACAO = 'sigep:vinculos:administracao:v1';
const EVENTO = 'sigep:vinculos:atualizados';
export function lerEstadoAdministrativo(): Estado {
  const texto = localStorage.getItem(CHAVE_ADMINISTRACAO);
  if (!texto) return { alteracoes: {}, excluidos: [], auditoria: [] };
  const estado = JSON.parse(texto) as Estado;
  if (!estado || !estado.alteracoes || !Array.isArray(estado.excluidos) || !Array.isArray(estado.auditoria))
    throw new Error('Os dados administrativos dos vínculos não puderam ser lidos.');
  return estado;
}
// Uma única escrita confirma o registro operacional e sua auditoria juntos.
export function persistirEstadoAdministrativo(estado: Estado) {
  localStorage.setItem(CHAVE_ADMINISTRACAO, JSON.stringify(estado));
  window.dispatchEvent(new Event(EVENTO));
}
export const observarVinculos = (listener: () => void) => {
  window.addEventListener(EVENTO, listener); window.addEventListener('storage', listener); window.addEventListener('focus', listener);
  return () => {window.removeEventListener(EVENTO, listener);window.removeEventListener('storage', listener);window.removeEventListener('focus', listener);};
};
export function useAtualizacaoVinculos() {
  return useSyncExternalStore(observarVinculos, () => JSON.stringify([localStorage.getItem(CHAVE_ADMINISTRACAO),localStorage.getItem('prototype-vinculos-v2')]));
}
