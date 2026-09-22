export const StatusKeySeplag = {
  ATIVO: "ATIVO",
  INATIVO: "INATIVO",
  EXTINTO: "EXTINTO",
  PENDENTE: "PENDENTE",
} as const;

export type StatusKeySeplag = (typeof StatusKeySeplag)[keyof typeof StatusKeySeplag];

export const StatusLabels: Record<StatusKeySeplag, string> = {
  [StatusKeySeplag.ATIVO]: "Ativo",
  [StatusKeySeplag.INATIVO]: "Inativo",
  [StatusKeySeplag.EXTINTO]: "Extinto",
  [StatusKeySeplag.PENDENTE]: "Pendente",
};
