export const CheckboxSNValorSeplag = {
  SIM: "S",
  NAO: "N",
} as const;

export type CheckboxSNValorSeplagValue =
  (typeof CheckboxSNValorSeplag)[keyof typeof CheckboxSNValorSeplag];
