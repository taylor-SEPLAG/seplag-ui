import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { EstadoVazio } from "./ComponentesProjeto";
import { numero } from "./modelo";

export function RoscaAnalise({
  labels,
  valores,
  cores,
  periodo,
  onSelecionar,
}: {
  labels: string[];
  valores: (number | null)[];
  cores: string[];
  periodo: string;
  onSelecionar: (i: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    selecionar = useRef(onSelecionar);
  const [ocultas, setOcultas] = useState<number[]>([]);
  useEffect(() => {
    selecionar.current = onSelecionar;
  }, [onSelecionar]);
  useEffect(() => {
    if (!canvas.current || valores.every((v) => v === null)) return;
    const chart = new Chart(canvas.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: valores.map((v, i) => (ocultas.includes(i) ? 0 : v)),
            backgroundColor: labels.map((_, i) => cores[i % cores.length]),
            hoverOffset: 12,
            borderWidth: 3,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: window.matchMedia?.("(prefers-reduced-motion: reduce)")
            .matches
            ? 0
            : 650,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) =>
                `${item.label}: ${numero(Number(item.raw), 1)} h`,
            },
          },
        },
        onClick: (_e, items) => {
          if (items[0]) selecionar.current(items[0].index);
        },
      },
    });
    return () => chart.destroy();
  }, [labels, valores, cores, ocultas]);
  const total = valores.reduce<number>((s, v) => s + (v ?? 0), 0);
  return (
    <article className="ind-chart-card">
      <h3>Distribuição do esforço registrado</h3>
      <p className="ind-chart-period">{periodo} · horas de trabalho ativo</p>
      {valores.every((v) => v === null) ? (
        <EstadoVazio titulo="Aguardando informações">
          Registre horas por categoria para visualizar a distribuição.
        </EstadoVazio>
      ) : (
        <div style={{ height: 280 }}>
          <canvas
            ref={canvas}
            role="img"
            aria-label="Distribuição das horas por atividade; explore os botões abaixo"
          />
        </div>
      )}
      <div className="analise-rosca-legenda">
        {labels.map((l, i) => (
          <div key={l}>
            <button
              type="button"
              className="ind-text-button"
              onClick={() => onSelecionar(i)}
            >
              <span style={{ background: cores[i % cores.length] }} />
              {l} ·{" "}
              {valores[i] === null
                ? "Dados não disponíveis"
                : `${numero(valores[i], 1)} h · ${total ? numero(((valores[i] ?? 0) / total) * 100, 1) : "0"}%`}
            </button>
            <button
              type="button"
              aria-label={`Alternar categoria ${l}`}
              aria-pressed={!ocultas.includes(i)}
              onClick={() =>
                setOcultas((o) =>
                  o.includes(i) ? o.filter((v) => v !== i) : [...o, i],
                )
              }
            >
              {ocultas.includes(i) ? "Mostrar" : "Ocultar"}
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}
