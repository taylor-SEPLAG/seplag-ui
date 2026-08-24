import { useSyncExternalStore } from "react";

export type SituacaoLocal = "ATIVO" | "INATIVO";

export interface Local {
 id:string;
 estado:string; // sigla da UF
 cidade:string;
 nomeLocal:string;
 situacao:SituacaoLocal;
}

export type LocalInput = Pick<Local, "estado" | "cidade" | "nomeLocal">;

function criar(id:string, nomeLocal:string, cidade:string, estado = "MT"):Local {
 return { id, nomeLocal, cidade, estado, situacao:"ATIVO" };
}

let locais:Local[] = [
 criar("local-001", "1° NÚCLEO BOMBEIRO MILITAR", "Alto Araguaia"),
 criar("local-002", "10º NBM", "Tapurah"),
 criar("local-003", "11° NBM", "Paranatinga"),
 criar("local-004", "11º NBM", "Paranatinga"),
 criar("local-005", "13ª COMPANHIA INDEPENDENTE BOMBEIRO MILITAR", "Lucas do Rio Verde"),
 criar("local-006", "14ª CIBM", "Juína"),
 criar("local-007", "14ª CIBM", "Nova Xavantina"),
 criar("local-008", "1º BATALHÃO BOMBEIRO MILITAR", "Cuiabá"),
 criar("local-009", "1º PELOTÃO INDEPENDENTE BOMBEIRO MILITAR", "Poconé"),
 criar("local-010", "2º BATALHÃO BOMBEIRO MILITAR", "Várzea Grande"),
 criar("local-011", "3º BATALHÃO BOMBEIRO MILITAR", "Rondonópolis"),
 criar("local-012", "4º BATALHÃO BOMBEIRO MILITAR", "Sinop"),
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const locaisStore = {
 subscribe(listener:() => void) { listeners.add(listener); return () => listeners.delete(listener); },
 getSnapshot: () => locais,
 findById: (id:string) => locais.find((local) => local.id === id),
 isDuplicate(input:LocalInput, ignoredId?:string) {
  return locais.some((local) => local.id !== ignoredId && local.estado === input.estado && local.cidade === input.cidade && local.nomeLocal.trim().toLocaleLowerCase("pt-BR") === input.nomeLocal.trim().toLocaleLowerCase("pt-BR"));
 },
 create(input:LocalInput) {
  const local:Local = { ...input, id:`local-${Date.now()}`, situacao:"ATIVO" };
  locais = [local, ...locais];
  emit();
  return local;
 },
 update(id:string, input:LocalInput) {
  locais = locais.map((local) => local.id === id ? { ...local, ...input } : local);
  emit();
 },
 toggleSituacao(id:string) {
  locais = locais.map((local) => local.id === id ? { ...local, situacao: local.situacao === "ATIVO" ? "INATIVO" : "ATIVO" } : local);
  emit();
 },
};

export function useLocais() {
 return useSyncExternalStore(locaisStore.subscribe, locaisStore.getSnapshot);
}
