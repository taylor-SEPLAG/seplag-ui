import { useSyncExternalStore } from "react";

export interface TipoDocumento {
  id: number;
  nome: string;
  ativo: boolean;
}

let tipos: TipoDocumento[] = [
  { id: 1, nome: "Constituição Federal", ativo: true },
  { id: 2, nome: "Constituição Estadual", ativo: true },
  { id: 3, nome: "Lei Ordinária", ativo: true },
  { id: 4, nome: "Lei Complementar", ativo: true },
  { id: 5, nome: "Decreto Estadual", ativo: true },
  { id: 6, nome: "Portaria", ativo: true },
  { id: 7, nome: "Resolução", ativo: true },
  { id: 8, nome: "Instrução Normativa", ativo: true },
  { id: 9, nome: "Edital de Abertura", ativo: false },
  { id: 10, nome: "Medida Provisória", ativo: true },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

export const tiposDocumentosStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => tipos,
  isDuplicate(nome: string, ignoredId?: number) {
    return tipos.some((item) => item.id !== ignoredId && normalize(item.nome) === normalize(nome));
  },
  create(nome: string) {
    const created = { id: Math.max(0, ...tipos.map((item) => item.id)) + 1, nome: nome.trim(), ativo: true };
    tipos = [created, ...tipos];
    emit();
    return created;
  },
  update(id: number, nome: string) {
    tipos = tipos.map((item) => item.id === id ? { ...item, nome: nome.trim() } : item);
    emit();
  },
  toggle(id: number) {
    tipos = tipos.map((item) => item.id === id ? { ...item, ativo: !item.ativo } : item);
    emit();
  },
};

export function useTiposDocumentos() {
  return useSyncExternalStore(tiposDocumentosStore.subscribe, tiposDocumentosStore.getSnapshot);
}
