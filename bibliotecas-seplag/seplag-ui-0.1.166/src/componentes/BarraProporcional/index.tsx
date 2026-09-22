import type { CSSProperties } from "react";
import styles from "./style.module.css";

export interface BarraProporcionalSegmentoSeplag {
  readonly id: string | number;
  readonly valor: number;
  readonly cor: string;
  readonly titulo?: string;
}

export interface BarraProporcionalSeplagProps {
  readonly segmentos: readonly BarraProporcionalSegmentoSeplag[];
  readonly total?: number;
  readonly altura?: CSSProperties["height"];
  readonly corFundo?: string;
  readonly className?: string;
  readonly ariaLabel?: string;
}

function normalizarValor(valor: number | undefined) {
  return Number.isFinite(valor) && (valor ?? 0) > 0 ? (valor as number) : 0;
}

function montarClasseRaiz(className?: string) {
  return [styles.bar, className].filter(Boolean).join(" ");
}

export function BarraProporcionalSeplag({
  segmentos,
  total,
  altura = "0.75rem",
  corFundo = "#e5e7eb",
  className,
  ariaLabel = "Distribuição proporcional",
}: Readonly<BarraProporcionalSeplagProps>) {
  const segmentosVisiveis = segmentos
    .map((segmento) => ({ ...segmento, valor: normalizarValor(segmento.valor) }))
    .filter((segmento) => segmento.valor > 0);
  const somaSegmentos = segmentosVisiveis.reduce((soma, segmento) => soma + segmento.valor, 0);
  const baseProporcional = Math.max(normalizarValor(total), somaSegmentos);

  return (
    <div
      className={montarClasseRaiz(className)}
      role="img"
      aria-label={ariaLabel}
      style={{ height: altura, backgroundColor: corFundo }}
    >
      {baseProporcional > 0 &&
        segmentosVisiveis.map((segmento) => (
          <span
            key={segmento.id}
            className={styles.segment}
            data-barra-segmento={segmento.id}
            title={segmento.titulo}
            style={{
              backgroundColor: segmento.cor,
              width: `${(segmento.valor / baseProporcional) * 100}%`,
            }}
            aria-hidden="true"
          />
        ))}
    </div>
  );
}
