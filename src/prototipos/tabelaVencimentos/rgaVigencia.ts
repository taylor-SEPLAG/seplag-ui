export const RGA_VIGENCIA_FORA_TABELA =
  "A vigência do RGA deve estar contida no período de vigência da Tabela de Vencimentos.";

export function isRgaVigenciaWithinTable(
  tabelaInicio: string,
  tabelaFim: string | undefined,
  rgaInicio: string,
  rgaFim: string | undefined,
) {
  if (!tabelaInicio || !rgaInicio) return false;
  if (rgaInicio < tabelaInicio) return false;
  if (tabelaFim && rgaInicio > tabelaFim) return false;
  if (rgaFim && rgaFim < rgaInicio) return false;
  if (rgaFim && rgaFim < tabelaInicio) return false;
  if (tabelaFim && rgaFim && rgaFim > tabelaFim) return false;
  return true;
}