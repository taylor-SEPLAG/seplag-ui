import type { CriteriosAbrangencia } from "./abrangenciaGrupoCalculo";
import type { VersaoPesosAbrangencia } from "./pesosAbrangenciasStore";

export type PesosAplicadosAbrangencia = { versao: number; total: number };

// A ordem corresponde aos índices persistidos na parametrização global de pesos.
const criteriosPorPeso: (keyof CriteriosAbrangencia)[] = [
  "orgaos",
  "regimes",
  "tipos",
  "carreiras",
  "unidades",
  "cargos",
];

export function calcularSomatoriaPesosAbrangencia(
  criterios: CriteriosAbrangencia,
  versao?: VersaoPesosAbrangencia,
): PesosAplicadosAbrangencia | undefined {
  if (!versao) return undefined;
  const total = criteriosPorPeso.reduce(
    (soma, criterio, indice) =>
      soma + (criterios[criterio].length ? (versao.pesos[indice] ?? 0) : 0),
    0,
  );
  return { versao: versao.numero, total: Number(total.toFixed(10)) };
}
