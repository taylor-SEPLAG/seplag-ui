import { useSyncExternalStore } from "react";
import type { Comissao, MembroComissao } from "./types";
import { comissoesMock } from "./mock";

let comissoes:Comissao[] = [...comissoesMock];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const comissoesStore = {
 subscribe(listener:() => void) { listeners.add(listener); return () => listeners.delete(listener); },
 getSnapshot: () => comissoes,
 findById: (id:string) => comissoes.find((comissao) => comissao.id === id),
 create(comissao:Comissao) {
  comissoes = [comissao, ...comissoes];
  emit();
 },
 update(id:string, atualizacoes:Partial<Comissao>) {
  comissoes = comissoes.map((comissao) => comissao.id === id ? { ...comissao, ...atualizacoes } : comissao);
  emit();
 },
 remove(id:string) {
  comissoes = comissoes.filter((comissao) => comissao.id !== id);
  emit();
 },
 salvarMembro(comissaoId:string, membro:MembroComissao) {
  comissoes = comissoes.map((comissao) => {
   if (comissao.id !== comissaoId) return comissao;
   const jaExiste = comissao.membros.some((item) => item.id === membro.id);
   const membros = jaExiste ? comissao.membros.map((item) => item.id === membro.id ? membro : item) : [...comissao.membros, membro];
   return { ...comissao, membros };
  });
  emit();
 },
 removerMembro(comissaoId:string, membroId:string) {
  comissoes = comissoes.map((comissao) => comissao.id === comissaoId ? { ...comissao, membros:comissao.membros.filter((item) => item.id !== membroId) } : comissao);
  emit();
 },
};

export function useComissoes() {
 return useSyncExternalStore(comissoesStore.subscribe, comissoesStore.getSnapshot);
}
