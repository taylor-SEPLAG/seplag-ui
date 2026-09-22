export const SistemaSeplagId = {
  GESTAO_DE_PESSOAS: "GESTÃO DE PESSOAS",
  FOLHA: "FOLHA",
  PERICIA: "PERÍCIA",
  CONSIGNADO: "CONSIGNADO",
  CONTAGEM_DE_TEMPO: "CONTAGEM DE TEMPO",
  E_SOCIAL: "E-SOCIAL",
  APOSENTADORIA: "APOSENTADORIA",
  CONFORMIDADE: "CONFORMIDADE",
  AUDITORIA: "AUDITORIA",
} as const;

export type SistemaSeplagId = (typeof SistemaSeplagId)[keyof typeof SistemaSeplagId];
