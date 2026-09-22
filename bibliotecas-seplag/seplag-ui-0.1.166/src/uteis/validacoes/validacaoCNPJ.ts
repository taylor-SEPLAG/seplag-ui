import { unmaskedCNPJSeplag, validarCNPJSeplag } from "../cpfCnpj/manipulaCNPJAndCPF";

/**
 * Retorna uma função de validação pronta para o prop `rules.validate` do CNPJField
 * ou qualquer campo RHF que receba um CNPJ (com ou sem máscara).
 *
 * @param label - Nome do campo exibido nas mensagens de erro. Padrão: "CNPJ"
 *
 * @example
 * rules={{ validate: validacaoCNPJ() }}
 * rules={{ validate: validacaoCNPJ("CNPJ do responsável") }}
 */
export function validacaoCNPJSeplag(
  label = "CNPJ",
): (value: string | undefined | null) => string | true {
  return (value) => {
    const raw = unmaskedCNPJSeplag(value ?? "");
    if (!raw) return true;
    if (raw.length < 14) return `${label} incompleto`;
    return validarCNPJSeplag(raw) || `${label} inválido`;
  };
}
