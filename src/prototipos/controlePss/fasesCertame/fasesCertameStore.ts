import { useSyncExternalStore } from "react";
import { FASES_TCE_FIXAS, TIPOS_FASE_CONCURSO_TCE } from "../certame/dominios";

export type SituacaoFaseCertame = "ATIVO" | "INATIVO";

export interface FaseCertameCatalogo {
 id:string;
 nome:string;
 // Referência ao catálogo de Tipos de Prova/Etapa do TCE-MT (tabela TFCONC) — quando ausente,
 // a fase é uma classificação personalizada, sem correspondência na tabela do tribunal.
 tipoTceId?:string;
 situacao:SituacaoFaseCertame;
}

export type FaseCertameCatalogoInput = Pick<FaseCertameCatalogo, "nome" | "tipoTceId">;

function criar(id:string, nome:string, tipoTceId?:string):FaseCertameCatalogo {
 return { id, nome, tipoTceId, situacao:"ATIVO" };
}

// Seed inicial: o catálogo de Tipos de Prova/Etapa do TCE-MT já vem referenciado à própria tabela
// (tipoTceId = value do TCE) — novas fases cadastradas pelo usuário podem ou não referenciar um tipo.
// Também inclui as 12 fases padrão do cronograma (FASES_TCE_FIXAS — Publicação do Edital,
// Período de Inscrições etc.), sem tipoTceId: são marcos do processo, não classificações do
// TFCONC, mas precisam estar no catálogo porque são o valor pré-selecionado de cada certame novo
// (ver CertameFormContent) e o campo "Nome da fase" só aceita valores já cadastrados aqui (RN005).
let fases:FaseCertameCatalogo[] = [
 ...TIPOS_FASE_CONCURSO_TCE.map((tipo) => criar(`fase-tce-${tipo.value}`, tipo.label, tipo.value)),
 ...FASES_TCE_FIXAS.map((item) => criar(`fase-padrao-${item.ordem}`, item.nome)),
 // Fase personalizada usada no certame mock "Auditor Fiscal" (mock.ts) — exemplo de fase
 // adicionada pelo usuário além das 12 padrão + 17 do TCE-MT.
 criar("fase-custom-curso-formacao-seplag", "Curso de Formação (SEPLAG)"),
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const fasesCertameStore = {
 subscribe(listener:() => void) { listeners.add(listener); return () => listeners.delete(listener); },
 getSnapshot: () => fases,
 findById: (id:string) => fases.find((fase) => fase.id === id),
 isDuplicate(input:FaseCertameCatalogoInput, ignoredId?:string) {
  return fases.some((fase) => fase.id !== ignoredId && fase.nome.trim().toLocaleLowerCase("pt-BR") === input.nome.trim().toLocaleLowerCase("pt-BR"));
 },
 create(input:FaseCertameCatalogoInput) {
  const fase:FaseCertameCatalogo = { ...input, id:`fase-${Date.now()}`, situacao:"ATIVO" };
  fases = [fase, ...fases];
  emit();
  return fase;
 },
 update(id:string, input:FaseCertameCatalogoInput) {
  fases = fases.map((fase) => fase.id === id ? { ...fase, ...input } : fase);
  emit();
 },
 toggleSituacao(id:string) {
  fases = fases.map((fase) => fase.id === id ? { ...fase, situacao: fase.situacao === "ATIVO" ? "INATIVO" : "ATIVO" } : fase);
  emit();
 },
};

export function useFasesCertame() {
 return useSyncExternalStore(fasesCertameStore.subscribe, fasesCertameStore.getSnapshot);
}
