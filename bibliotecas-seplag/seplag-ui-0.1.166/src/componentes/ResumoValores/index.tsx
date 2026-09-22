import type { ReactNode } from "react";
import {
  SEPLAG_ERROR_TEXT,
  SEPLAG_GRAY_600,
  SEPLAG_GRAY_800,
  SEPLAG_INFO_TEXT,
  SEPLAG_SUCCESS_TEXT,
  SEPLAG_WARNING_TEXT,
} from "../../tokens/colors";
import styles from "./style.module.css";

export type ResumoValorSeveridadeSeplag = "neutro" | "info" | "sucesso" | "alerta" | "erro";

export interface ResumoValorSeplag {
  /** Chave única do item e sufixo do `data-testid`. */
  readonly id: string | number;
  /** Texto descritivo à esquerda do valor. Omitido, o valor aparece sozinho. */
  readonly rotulo?: ReactNode;
  /** O número ou expressão em destaque. */
  readonly valor: ReactNode;
  /**
   * Cor do valor, vinda de `tokens/colors`.
   * @default "info"
   */
  readonly severidade?: ResumoValorSeveridadeSeplag;
}

export interface ResumoValoresSeplagProps {
  /** `id` do elemento raiz e base dos `data-testid`. */
  readonly id?: string;
  readonly itens: readonly ResumoValorSeplag[];
  /**
   * - `"inline"` (padrão) — não ocupa a linha inteira; para o `trailing` do `PanelSeplag`.
   * - `"barra"` — largura total com respiro vertical; para faixas acima ou abaixo de uma tabela.
   *
   * @default "inline"
   */
  readonly variante?: "inline" | "barra";
  /**
   * Distribuição horizontal dos itens. Totalizadores são convencionalmente alinhados à direita.
   * @default "direita"
   */
  readonly alinhamento?: "esquerda" | "direita" | "entre";
  readonly className?: string;
  /**
   * Nome acessível do grupo.
   * @default "Resumo"
   */
  readonly ariaLabel?: string;
}

const CORES_POR_SEVERIDADE: Record<ResumoValorSeveridadeSeplag, string> = {
  neutro: SEPLAG_GRAY_800,
  info: SEPLAG_INFO_TEXT,
  sucesso: SEPLAG_SUCCESS_TEXT,
  alerta: SEPLAG_WARNING_TEXT,
  erro: SEPLAG_ERROR_TEXT,
};

/**
 * Faixa de totalizadores: pares rótulo/valor com o valor em destaque.
 *
 * É puramente apresentacional — não soma, não formata e não conhece a origem dos números.
 * O consumidor entrega cada valor pronto, inclusive a unidade ("25 vagas") e a severidade.
 */
export function ResumoValoresSeplag({
  id,
  itens,
  variante = "inline",
  alinhamento = "direita",
  className,
  ariaLabel = "Resumo",
}: Readonly<ResumoValoresSeplagProps>) {
  if (itens.length === 0) return null;

  const classeRaiz = [styles.resumo, styles[variante], styles[alinhamento], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div id={id} data-testid={id} className={classeRaiz} role="group" aria-label={ariaLabel}>
      {itens.map((item) => (
        <span
          key={item.id}
          className={styles.item}
          data-testid={id ? `${id}-${item.id}` : undefined}
        >
          {item.rotulo != null && (
            <span className={styles.rotulo} style={{ color: SEPLAG_GRAY_600 }}>
              {item.rotulo}
            </span>
          )}
          <strong
            className={styles.valor}
            style={{ color: CORES_POR_SEVERIDADE[item.severidade ?? "info"] }}
          >
            {item.valor}
          </strong>
        </span>
      ))}
    </div>
  );
}

export default ResumoValoresSeplag;
