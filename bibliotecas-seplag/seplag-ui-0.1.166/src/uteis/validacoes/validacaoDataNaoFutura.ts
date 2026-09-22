import { isDateAfterSeplag } from "../manipulaData";

/** * Retorna uma função de validação pronta para o prop `customValidation` do DateField.
 * Rejeita datas futuras em relação à data atual (hoje).
 *
 * @param mensagem - Mensagem de erro customizada. Se omitida, usa a mensagem padrão.
 *
 * @example
 * // mensagem padrão
 * customValidation={validacaoDataNaoFutura()}
 */
export function validacaoDataNaoFuturaSeplag(
  mensagem = "A data informada não pode ser uma data futura",
): (valor: string) => string | boolean {
  return (valor) => !isDateAfterSeplag(valor, new Date()) || mensagem;
}
