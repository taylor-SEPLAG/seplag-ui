import { compareAsc, isValid, parse, startOfDay } from "date-fns";
import type {
  DocumentoLegalApiSeplag,
  DocumentoLegalSeplag,
  DocumentoLegalTipoCorMapSeplag,
  DocumentoLegalTipoMapSeplag,
  NormalizedDocumentoSeplag,
} from "../types";
import {
  TIPO_COR_MAP_DEFAULT_SEPLAG,
  TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG,
} from "../types";

export const truncateText = (text: string, maxLength: number = 150): string => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const isDocumentoAtivo = (
  dataVigencia: string | null | undefined,
  dataFim: string | null | undefined,
): boolean => {
  const hoje = startOfDay(new Date());
  const fimStr = dataFim?.trim();
  const inicioStr = dataVigencia?.trim();

  if (!fimStr) return true;

  const dataFimDate = startOfDay(parse(fimStr, "dd/MM/yyyy", new Date()));
  if (!isValid(dataFimDate)) return true;

  const fimMaiorQueHoje = compareAsc(dataFimDate, hoje) > 0;

  if (inicioStr) {
    const dataInicioDate = startOfDay(parse(inicioStr, "dd/MM/yyyy", new Date()));
    if (isValid(dataInicioDate)) {
      const inicioMenorQueFim = compareAsc(dataInicioDate, dataFimDate) < 0;
      return fimMaiorQueHoje && inicioMenorQueFim;
    }
  }

  return fimMaiorQueHoje;
};

export const getDocumentoTipo = (
  documento: DocumentoLegalSeplag,
  tipoMap: DocumentoLegalTipoMapSeplag = TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG,
): string => {
  if (Array.isArray(documento.valores)) {
    const tipoField = documento.valores.find((v) => v.nomeCampo === "tipoDocLegalId");
    if (tipoField?.valorCampo) {
      return tipoMap[tipoField.valorCampo] || "Documento";
    }
  }

  if (documento.siglaTipoDocumento) {
    return documento.siglaTipoDocumento === "DOCLEGAL"
      ? "Documento Legal"
      : documento.siglaTipoDocumento;
  }

  return "Documento";
};

export const normalizeDocumento = (
  documento: DocumentoLegalSeplag,
  tipoMap?: DocumentoLegalTipoMapSeplag,
): NormalizedDocumentoSeplag => {
  const tipo = getDocumentoTipo(documento, tipoMap);
  const numero = documento.numrDocumentoLegal || "";
  const ano = documento.anoVigencia || "";
  const nome = documento.nomeDocumentoLegal || "";

  const anoFormatado = ano.includes("/") ? ano.split("/")[2] : ano;

  const arquivoRaw = documento.arquivo;
  const arquivo = arquivoRaw
    ? {
        conteudoEmBase64: arquivoRaw.conteudoEmBase64 || "",
        contentType: arquivoRaw.contentType || "application/pdf",
        nome: arquivoRaw.nome || nome,
      }
    : undefined;

  return {
    id: documento.id,
    label: truncateText(nome, 150),
    fullName: nome,
    description: `[${tipo}] ${numero} - ${anoFormatado}`,
    tipo,
    numrDocumentoLegal: numero,
    anoVigencia: anoFormatado,
    nomeDocumentoLegal: nome,
    dataFim: documento.dataFim,
    dataVigencia: documento.dataVigencia,
    arquivo,
  };
};

export const filterDocumentos = (
  documentos: ReadonlyArray<DocumentoLegalSeplag>,
  searchTerm: string = "",
  tipoMap?: DocumentoLegalTipoMapSeplag,
): NormalizedDocumentoSeplag[] => {
  const q = (searchTerm || "").toLowerCase();

  return documentos
    .filter((doc) => {
      if (!isDocumentoAtivo(doc.dataVigencia, doc.dataFim)) {
        return false;
      }

      if (q) {
        const tipo = getDocumentoTipo(doc, tipoMap).toLowerCase();
        const numero = (doc.numrDocumentoLegal || "").toLowerCase();
        const ano = (doc.anoVigencia || "").toLowerCase();
        const nome = (doc.nomeDocumentoLegal || "").toLowerCase();

        return (
          tipo.includes(q) ||
          numero.includes(q) ||
          ano.includes(q) ||
          nome.includes(q)
        );
      }

      return true;
    })
    .map((doc) => normalizeDocumento(doc, tipoMap));
};

export const isDuplicado = (
  documentoId: number,
  selected: NormalizedDocumentoSeplag[],
): boolean => {
  return selected.some((doc) => doc.id === documentoId);
};

export const getCorByTipo = (
  tipo: string,
  corMap: DocumentoLegalTipoCorMapSeplag = TIPO_COR_MAP_DEFAULT_SEPLAG,
): { color: string; bg: string } => {
  return corMap[tipo] || { color: "#333", bg: "#eee" };
};

const TIPO_VARIANT_MAP: Record<
  string,
  "success" | "warning" | "error" | "info" | "neutral"
> = {
  Lei: "info",
  Decreto: "error",
  Norma: "success",
  Portaria: "warning",
  "Lei Complementar": "neutral",
  Resolução: "info",
};

export const getVariantByTipo = (
  tipo: string,
): "success" | "warning" | "error" | "info" | "neutral" => {
  return TIPO_VARIANT_MAP[tipo] || "neutral";
};

/**
 * Converte a resposta bruta da API (`valores[].nomeCampo` opcional) para o
 * shape `DocumentoLegalSeplag` esperado pelo `DropdownBaseLegalSeplag`,
 * descartando entradas de `valores` sem `nomeCampo`.
 */
export const mapToDocumentoLegalSeplag = (
  documento: DocumentoLegalApiSeplag,
): DocumentoLegalSeplag => ({
  ...documento,
  valores: (documento.valores ?? [])
    .filter((valor): valor is { nomeCampo: string; valorCampo?: string | null } =>
      typeof valor.nomeCampo === "string",
    )
    .map((valor) => ({
      nomeCampo: valor.nomeCampo,
      valorCampo: valor.valorCampo,
    })),
});

/**
 * Aplica `mapToDocumentoLegalSeplag` a uma lista de documentos.
 */
export const mapToDocumentosLegaisSeplag = (
  documentos: ReadonlyArray<DocumentoLegalApiSeplag> | null | undefined,
): DocumentoLegalSeplag[] => (documentos ?? []).map(mapToDocumentoLegalSeplag);

/**
 * Formata o título de um documento legal no mesmo padrão usado pelo
 * `DropdownBaseLegalSeplag` (ex.: "Lei nº 123/2024"), para exibição fora do
 * próprio dropdown — por exemplo, em uma coluna de tabela ou célula de grid
 * que referencia o documento apenas pelo id.
 */
export const formatarTituloDocumentoLegalSeplag = (
  documento: DocumentoLegalApiSeplag,
  tipoMap?: DocumentoLegalTipoMapSeplag,
): string => {
  const normalizado = normalizeDocumento(mapToDocumentoLegalSeplag(documento), tipoMap);
  return `${normalizado.tipo} nº ${normalizado.numrDocumentoLegal}/${normalizado.anoVigencia}`;
};

/**
 * Normaliza um documento legal e já resolve a variante de cor do badge por tipo — o mesmo
 * resultado usado internamente pelo `DropdownBaseLegalSeplag` para exibir título, descrição e
 * badge de um documento selecionado. Útil para reproduzir esse mesmo cartão fora do dropdown
 * (ex.: numa célula de tabela que referencia um documento legal apenas pelo id).
 */
export const normalizarDocumentoLegalSeplag = (
  documento: DocumentoLegalApiSeplag,
  tipoMap?: DocumentoLegalTipoMapSeplag,
): NormalizedDocumentoSeplag & { variant: ReturnType<typeof getVariantByTipo> } => {
  const normalizado = normalizeDocumento(mapToDocumentoLegalSeplag(documento), tipoMap);
  return { ...normalizado, variant: getVariantByTipo(normalizado.tipo) };
};
