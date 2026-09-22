export const formatCPFSeplag = (cpf: string): string => {
  if (!cpf) return "";

  const apenasNumeros = String(cpf).replaceAll(/\D/g, "");

  return apenasNumeros
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};
