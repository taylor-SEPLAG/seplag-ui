import { useEffect, useId, useRef, useState } from "react";
import {
  Chart,
  type ChartConfiguration,
  type ChartDataset,
} from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  FiBarChart2,
  FiDownload,
  FiMinus,
  FiPlus,
  FiRotateCcw,
} from "react-icons/fi";
import { graficosAtivos, type InstanciaGrafico } from "./registroGraficos";
import { exportarPNG } from "./exportacoes";
import { numero } from "./modelo";

Chart.register(zoomPlugin);
export interface SerieProjeto {
  nome: string;
  valores: (number | null)[];
  cor: string;
  tipo?: "bar" | "line";
  eixo?: "quantidade" | "percentual";
  tracejada?: boolean;
}
export interface GraficoProjetoProps {
  id: string;
  titulo: string;
  descricao?: string;
  periodo: string;
  labels: string[];
  series: SerieProjeto[];
  tipo?: "bar" | "line";
  horizontal?: boolean;
  empilhado?: boolean;
  selecionado?: number | null;
  altura?: number;
  alternavel?: boolean;
  onSelecionar: (indice: number, serie: number) => void;
}
export function GraficoProjeto({
  id,
  titulo,
  descricao,
  periodo,
  labels,
  series,
  tipo = "bar",
  horizontal = false,
  empilhado = false,
  selecionado = null,
  altura = 300,
  alternavel = false,
  onSelecionar,
}: GraficoProjetoProps) {
  const canvas = useRef<HTMLCanvasElement>(null),
    instancia = useRef<InstanciaGrafico | null>(null),
    callback = useRef(onSelecionar);
  const [pronto, setPronto] = useState(false),
    [modo, setModo] = useState(tipo),
    [ocultas, setOcultas] = useState<number[]>([]),
    [foco, setFoco] = useState(0),
    [erro, setErro] = useState("");
  const ajuda = useId();
  useEffect(() => {
    callback.current = onSelecionar;
  }, [onSelecionar]);
  useEffect(() => {
    if (!canvas.current) return;
    const chart = new Chart<"bar" | "line", (number | null)[], string>(
      canvas.current,
      {
        type: "bar",
        data: { labels: [], datasets: [] },
        options: { responsive: true, maintainAspectRatio: false },
      },
    );
    instancia.current = chart;
    const frame = requestAnimationFrame(() => setPronto(true));
    return () => {
      cancelAnimationFrame(frame);
      graficosAtivos.delete(id);
      instancia.current = null;
      chart.destroy();
    };
  }, [id]);
  useEffect(() => {
    const chart = instancia.current;
    if (!pronto || !chart) return;
    const reduzido =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    (
      chart.config as ChartConfiguration<
        "bar" | "line",
        (number | null)[],
        string
      >
    ).type = modo;
    chart.data = {
      labels,
      datasets: series.map(
        (s, i) =>
          ({
            label: s.nome,
            data: s.valores,
            type: s.tipo ?? modo,
            yAxisID: s.eixo === "percentual" ? "percentual" : "y",
            backgroundColor:
              modo === "line"
                ? `${s.cor}18`
                : labels.map((_, j) =>
                    selecionado === null || j === selecionado
                      ? `${s.cor}dc`
                      : `${s.cor}35`,
                  ),
            borderColor: s.cor,
            borderWidth: modo === "line" ? 2 : 0,
            borderRadius: modo === "bar" ? 4 : 0,
            borderDash: s.tracejada ? [6, 5] : [],
            tension: 0.28,
            pointRadius: labels.map((_, j) => (j === selecionado ? 6 : 3)),
            pointHoverRadius: 6,
            pointBackgroundColor: s.cor,
            fill: modo === "line" && !s.tracejada,
            hidden: ocultas.includes(i),
            maxBarThickness: 40,
          }) as ChartDataset<"bar" | "line", (number | null)[]>,
      ),
    };
    chart.options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? "y" : "x",
      animation: reduzido ? false : { duration: 650, easing: "easeOutQuart" },
      interaction: { mode: "nearest", intersect: true },
      layout: { padding: { top: 8, right: 14 } },
      onClick: (_evento, elementos) => {
        if (elementos[0])
          callback.current(elementos[0].index, elementos[0].datasetIndex);
      },
      onHover: (_evento, elementos) => {
        if (canvas.current)
          canvas.current.style.cursor = elementos.length
            ? "pointer"
            : "default";
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${numero(Number(horizontal ? ctx.parsed.x : ctx.parsed.y), modo === "line" ? 2 : 0)}`,
            afterBody: () => periodo,
          },
        },
        zoom: {
          pan: {
            enabled: true,
            mode: horizontal ? "y" : "x",
            modifierKey: "shift",
          },
          zoom: {
            wheel: { enabled: true, modifierKey: "ctrl" },
            pinch: { enabled: true },
            mode: horizontal ? "y" : "x",
          },
          limits: {
            x: { min: "original", max: "original" },
            y: { min: "original", max: "original" },
          },
        },
      },
      scales: {
        x: {
          stacked: empilhado,
          grid: { display: horizontal, color: "#edf2f7" },
          ticks: {
            color: "#526a82",
            font: { size: 11 },
            maxRotation: 0,
            autoSkip: !horizontal,
          },
        },
        y: {
          stacked: empilhado,
          beginAtZero: true,
          grid: { display: !horizontal, color: "#edf2f7" },
          ticks: { color: "#526a82", precision: 0, font: { size: 11 } },
        },
        ...(series.some((s) => s.eixo === "percentual")
          ? {
              percentual: {
                type: "linear" as const,
                position: "right" as const,
                min: 0,
                max: 100,
                grid: { drawOnChartArea: false },
                ticks: { callback: (valor: string | number) => `${valor}%` },
              },
            }
          : {}),
      },
    };
    chart.update();
    graficosAtivos.set(id, { chart, titulo, periodo });
  }, [
    pronto,
    id,
    titulo,
    periodo,
    labels,
    series,
    modo,
    horizontal,
    empilhado,
    selecionado,
    ocultas,
  ]);
  const abrir = (indice: number) => {
    const serie = series.findIndex(
      (s, i) => !ocultas.includes(i) && s.valores[indice] !== null,
    );
    if (serie >= 0) onSelecionar(indice, serie);
  };
  return (
    <article className="ind-chart-card" aria-labelledby={`${id}-titulo`}>
      <div className="ind-chart-heading">
        <div>
          <h3 id={`${id}-titulo`}>{titulo}</h3>
          <span className="ind-chart-period">{periodo}</span>
        </div>
        <div className="ind-chart-tools">
          {alternavel && (
            <button
              type="button"
              className="ind-icon-button"
              title="Alternar barras e linha"
              aria-label={`Alternar visualização de ${titulo}`}
              onClick={() => setModo((m) => (m === "bar" ? "line" : "bar"))}
            >
              <FiBarChart2 aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="ind-icon-button"
            title="Ampliar"
            aria-label={`Ampliar ${titulo}`}
            onClick={() => instancia.current?.zoom(1.25)}
          >
            <FiPlus aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ind-icon-button"
            title="Reduzir"
            aria-label={`Reduzir ${titulo}`}
            onClick={() => instancia.current?.zoom(0.8)}
          >
            <FiMinus aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ind-icon-button"
            title="Restaurar visualização"
            aria-label={`Restaurar ${titulo}`}
            onClick={() => instancia.current?.resetZoom()}
          >
            <FiRotateCcw aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ind-icon-button"
            title="Exportar PNG"
            aria-label={`Exportar ${titulo} como PNG`}
            onClick={() => {
              try {
                exportarPNG(id);
              } catch (e) {
                setErro(
                  e instanceof Error ? e.message : "Falha na exportação.",
                );
              }
            }}
          >
            <FiDownload aria-hidden="true" />
          </button>
        </div>
      </div>
      {descricao && <p className="ind-chart-description">{descricao}</p>}
      <div className="ind-chart-legend" aria-label={`Séries de ${titulo}`}>
        {series.map((s, i) => (
          <button
            key={s.nome}
            type="button"
            aria-pressed={!ocultas.includes(i)}
            onClick={() =>
              setOcultas((o) =>
                o.includes(i) ? o.filter((v) => v !== i) : [...o, i],
              )
            }
          >
            <span style={{ background: s.cor }} />
            {s.nome}
          </button>
        ))}
      </div>
      {series.every((s) => s.valores.every((v) => v === null)) ? (
        <p className="ind-no-data">
          Dados não informados na fonte para este recorte.
        </p>
      ) : null}
      <div className="ind-chart-canvas" style={{ height: altura }}>
        <canvas
          ref={canvas}
          tabIndex={0}
          role="img"
          aria-label={`${titulo}. Use as setas para escolher um item e Enter para detalhar.`}
          aria-describedby={ajuda}
          onKeyDown={(e) => {
            if (
              ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(
                e.key,
              )
            ) {
              e.preventDefault();
              setFoco((i) =>
                Math.max(
                  0,
                  Math.min(
                    labels.length - 1,
                    i + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1),
                  ),
                ),
              );
            }
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              abrir(foco);
            }
          }}
        />
      </div>
      <span id={ajuda} className="ind-chart-keyboard" aria-live="polite">
        {labels[foco] ? `${labels[foco]} · Enter para detalhar. ` : ""}Ctrl +
        rolagem para zoom; Shift para mover.
      </span>
      <details className="ind-chart-data">
        <summary>Explorar dados do gráfico</summary>
        <div>
          {labels.map((label, i) => (
            <button
              type="button"
              key={`${label}-${i}`}
              onClick={() => abrir(i)}
            >
              {label}
              <span>
                {series
                  .filter((_, j) => !ocultas.includes(j))
                  .map(
                    (s) =>
                      `${s.nome}: ${numero(s.valores[i], modo === "line" ? 2 : 0)}`,
                  )
                  .join(" · ")}
              </span>
            </button>
          ))}
        </div>
      </details>
      {erro && (
        <p role="alert" className="ind-error">
          {erro}
        </p>
      )}
    </article>
  );
}
