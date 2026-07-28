import { useSyncExternalStore } from "react";
import type { ArquivoAnexadoSeplag } from "../../componentes/AnexarDocumento";
import type { DocumentoLegalAssociadoSeplag } from "../../componentes/DocumentosLegaisAssociados";

export type SituacaoDocumentoLegal = "ATIVO" | "INATIVO";

export interface DocumentoLegal extends DocumentoLegalAssociadoSeplag {
  tipo: string;
  numero: string;
  ano: number;
  nome: string;
  ementa?: string;
  dataPublicacao?: string;
  dataVigencia: string;
  dataFim?: string;
  observacao?: string;
  arquivo?: ArquivoAnexadoSeplag;
  substituiOuAltera: boolean;
  situacao: SituacaoDocumentoLegal;
}

export type DocumentoLegalInput = Omit<DocumentoLegal, "id" | "titulo" | "categoria" | "descricao" | "situacao">;

function parseDate(value?: string) {
  if (!value) return undefined;
  const parts = value.includes("/") ? value.split("/").reverse() : value.split("-");
  if (parts.length !== 3) return undefined;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function getSituacaoDocumentoLegal(
  document: Pick<DocumentoLegal, "dataVigencia" | "dataFim">,
  referenceDate = new Date(),
): SituacaoDocumentoLegal {
  const start = parseDate(document.dataVigencia);
  const end = parseDate(document.dataFim);
  const reference = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return start && start <= reference && (!end || end >= reference) ? "ATIVO" : "INATIVO";
}

function createInitial(id: string, tipo: string, numero: string, ano: number, nome: string): DocumentoLegal {
  return { id, tipo, numero, ano, nome, titulo: `${tipo === "Lei Complementar" ? "LC" : tipo} nº ${numero}/${ano}`, categoria: tipo, descricao: nome, ementa: nome, dataVigencia: `01/01/${ano}`, substituiOuAltera: false, situacao: "ATIVO" };
}

let documents: DocumentoLegal[] = [
  createInitial("lc-4-1990", "Lei Complementar", "4", 1990, "Estatuto dos Servidores Públicos do Estado de Mato Grosso"),
  createInitial("lei-7554-2001", "Lei", "7.554", 2001, "Carreira dos Profissionais de Desenvolvimento Econômico e Social"),
  createInitial("lei-8321-2005", "Lei", "8.321", 2005, "Carreira dos profissionais da POLITEC"),
  createInitial("lei-10050-2014", "Lei", "10.050", 2014, "Alterações da carreira de Desenvolvimento Econômico e Social"),
  createInitial("lei-10052-2014", "Lei", "10.052", 2014, "Carreira dos Profissionais da Área Meio"),
  createInitial("lei-10884-2019", "Lei", "10.884", 2019, "Perfis profissionais e vinculações quantitativas"),
  createInitial("decreto-1447-2022", "Decreto", "1.447", 2022, "Redistribuição de cargos entre órgãos e entidades"),
  createInitial("lc-846-2026", "Lei Complementar", "846", 2026, "Alterações na organização e estrutura da POLITEC"),
  createInitial("lc-851-2026", "Lei Complementar", "851", 2026, "Criação e extinção de cargos e outras alterações"),
  createInitial("lei-13428-2026", "Lei", "13.428", 2026, "Alteração recente de carreira da POLITEC"),
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const normalizeNumber = (value: string) => value.replace(/\D/g, "").replace(/^0+/, "");
const buildTitle = (input: Pick<DocumentoLegalInput, "tipo" | "numero" | "ano">) => `${input.tipo === "Lei Complementar" ? "LC" : input.tipo} nº ${input.numero}/${input.ano}`;

export const documentosLegaisStore = {
  subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); },
  getSnapshot: () => documents,
  findById: (id: string) => documents.find((document) => document.id === id),
  isDuplicate(input: Pick<DocumentoLegalInput, "tipo" | "numero" | "ano">, ignoredId?: string) {
    return documents.some((document) => document.id !== ignoredId && document.tipo === input.tipo && normalizeNumber(document.numero) === normalizeNumber(input.numero) && Number(document.ano) === Number(input.ano));
  },
  create(input: DocumentoLegalInput) {
    const document: DocumentoLegal = { ...input, id: `documento-${Date.now()}`, titulo: buildTitle(input), categoria: input.tipo, descricao: input.nome, situacao: getSituacaoDocumentoLegal(input) };
    documents = [document, ...documents]; emit(); return document;
  },
  update(id: string, input: DocumentoLegalInput) {
    documents = documents.map((document) => document.id === id ? { ...document, ...input, titulo: buildTitle(input), categoria: input.tipo, descricao: input.nome, situacao: getSituacaoDocumentoLegal(input) } : document); emit();
  },
};

export function useDocumentosLegais() {
  return useSyncExternalStore(documentosLegaisStore.subscribe, documentosLegaisStore.getSnapshot);
}

export function useDocumentosLegaisAssociaveis() {
  return useDocumentosLegais().filter((document) => getSituacaoDocumentoLegal(document) === "ATIVO");
}
