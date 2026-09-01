import { useMemo, useSyncExternalStore } from "react";
import type { ArquivoAnexadoSeplag } from "../../componentes/AnexarDocumento";
import type { DocumentoLegalAssociadoSeplag } from "../../componentes/DocumentosLegaisAssociados";

export type SituacaoDocumentoLegal =
  | "Vigente"
  | "Revogada"
  | "Parcialmente revogada";

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
  arquivos: ArquivoAnexadoSeplag[];
  natureza: string;
  abrangencia: string;
  veiculoPublicacao: string;
  aplicacoes: string[];
  normasAlteradas: string[];
  normasRevogadas: string[];
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
  return start && start <= reference && (!end || end >= reference)
    ? "Vigente"
    : "Revogada";
}

function createInitial(id: string, tipo: string, numero: string, ano: number, nome: string): DocumentoLegal {
  return {
    id, tipo, numero, ano, nome,
    titulo: `${tipo === "Lei Complementar" ? "LC" : tipo} nº ${numero}/${ano}`,
    categoria: tipo,
    descricao: nome,
    ementa: nome,
    dataVigencia: `01/01/${ano}`,
    arquivos: [],
    natureza: "Criação",
    abrangencia: "ESTADUAL",
    veiculoPublicacao: "Diário Oficial do Estado - DOE",
    aplicacoes: ["Carreira"],
    normasAlteradas: [],
    normasRevogadas: [],
    situacao: "Vigente",
  };
}

const lc500 = createInitial("lc-500-2026", "Lei Complementar", "500", 2026, "Plano de Cargos e Carreiras");
lc500.dataVigencia = "10/08/2026";
lc500.aplicacoes = ["Cargo", "Carreira"];
lc500.normasRevogadas = ["lei-100-2015"];
const lei100 = createInitial("lei-100-2015", "Lei Ordinária", "100", 2015, "Estrutura da Carreira X");
lei100.dataFim = "09/08/2026";
lei100.situacao = "Revogada";
const decreto455 = createInitial("decreto-455-2020", "Decreto Estadual", "455", 2020, "Regulamentação de ingresso");
decreto455.veiculoPublicacao = "IOB";
decreto455.aplicacoes = ["Concurso", "Cargo"];
decreto455.situacao = "Parcialmente revogada";
let documents: DocumentoLegal[] = [lc500, lei100, decreto455];

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
  const documentos = useDocumentosLegais();

  return useMemo(
    () => documentos.filter((document) => getSituacaoDocumentoLegal(document) === "Vigente"),
    [documentos],
  );
}
