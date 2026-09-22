export function formatarParaCNPJComPaddingSeplag(cnpjString: string): string {
  let cnpjLimpo = cnpjString.replaceAll(/\D/g, "");
  const tamanhoEsperado = 14;

  if (cnpjLimpo.length < tamanhoEsperado) {
    const zerosParaAdicionar = tamanhoEsperado - cnpjLimpo.length;
    cnpjLimpo = "0".repeat(zerosParaAdicionar) + cnpjLimpo;
  } else if (cnpjLimpo.length > tamanhoEsperado) {
    return "CNPJ inválido (mais de 14 dígitos)";
  }
  return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export const formatCPFSeplag = (cpf: string) =>
  cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

export const formatCNPJSeplag = (cnpj: string) =>
  cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

export const unmaskedSeplag = (unmask: string) => unmask.replaceAll(/\D/g, "");

/** Remove apenas os separadores de formatação do CNPJ (pontos, barra e hífen). */
export const unmaskedCNPJSeplag = (cnpj: string) => cnpj.replaceAll(/[.\-/]/g, "").toUpperCase();

// Valor do caractere conforme especificação SERPRO: ASCII - 48
// '0'=0, '1'=1, ..., '9'=9, 'A'=17, 'B'=18, ..., 'Z'=42
const charValue = (c: string): number => c.charCodeAt(0) - 48;

// Pesos de 2 a 9 da direita para a esquerda, reiniciando após o 8º caractere
const buildWeights = (length: number): number[] =>
  Array.from({ length }, (_, i) => ((length - 1 - i) % 8) + 2);

export function validarCNPJSeplag(cnpj: string): boolean {
  const raw = unmaskedCNPJSeplag(cnpj);

  if (raw.length !== 14) return false;
  if (/^(.)\1{13}$/.test(raw)) return false;

  const calcDigit = (base: string): number => {
    const weights = buildWeights(base.length);
    const sum = base.split("").reduce((acc, c, i) => acc + charValue(c) * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const d1 = calcDigit(raw.slice(0, 12));
  const d2 = calcDigit(raw.slice(0, 13));

  return Number(raw[12]) === d1 && Number(raw[13]) === d2;
}
