import { useEffect, useId, useRef, useState } from "react";
import {
  Chart,
  type ChartConfiguration,
  type ChartDataset,
} from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import { FiDownload, FiMaximize, FiRotateCcw } from "react-icons/fi";
import { baixarArquivo } from "./exportacoes";
import { numero } from "./modelo";
import { EstadoVazio } from "./ComponentesProjeto";
import { graficosFluxo } from "./registroFluxo";

Chart.register(zoomPlugin);
export interface PontoFluxo {
  x: number;
  y: number;
  us?: string;
  label?: string;
}
export interface SerieFluxo {
  nome: string;
  cor: string;
  valores: (number | null)[] | PontoFluxo[];
  tipo?: "bar" | "line";
  tracejada?: boolean;
}
type Instancia = Chart<"bar" | "line" | "scatter">;
export interface PropsGraficoFluxo {
  id: string;
  titulo: string;
  periodo: string;
  labels: string[];
  series: SerieFluxo[];
  tipo?: "bar" | "line" | "scatter";
  empilhado?: boolean;
  horizontal?: boolean;
  area?: boolean;
  unidade: string;
  datas?: boolean;
  descricao?: string;
  onSelecionar: (indice: number, serie: number) => void;
}
export function GraficoFluxo({
  id,
  titulo,
  periodo,
  labels,
  series,
  tipo = "bar",
  empilhado = false,
  horizontal = false,
  area = false,
  unidade,
  datas = false,
  descricao,
  onSelecionar,
}: PropsGraficoFluxo) {
  const canvas = useRef<HTMLCanvasElement>(null),
    instancia = useRef<Instancia | null>(null),
    callback = useRef(onSelecionar),
    ajuda = useId();
  const [ocultas, setOcultas] = useState<string[]>([]),
    [selecao, setSelecao] = useState<{ i: number; s: number } | null>(null),
    [erro, setErro] = useState("");
  useEffect(() => {
    callback.current = onSelecionar;
  }, [onSelecionar]);
  const selecionar = (i: number, s: number) => {
    setSelecao({ i, s });
    callback.current(i, s);
  };
  const selecionarRef = useRef(selecionar);
  useEffect(() => {
    selecionarRef.current = selecionar;
  });
  useEffect(() => {
    if (!canvas.current) return;
    const config: ChartConfiguration<"bar" | "line" | "scatter"> = {
      type: tipo,
      data: {
        labels,
        datasets: series.map(
          (s, j) =>
            ({
              label: s.nome,
              data: s.valores,
              type: s.tipo,
              stack: s.tracejada ? "referencia" : "dados",
              backgroundColor: area
                ? `${s.cor}cc`
                : tipo === "bar"
                  ? s.valores.map((_, i) =>
                      selecao && (selecao.i !== i || selecao.s !== j)
                        ? `${s.cor}55`
                        : s.cor,
                    )
                  : s.cor,
              borderColor: s.cor,
              borderWidth: tipo === "bar" && s.tipo !== "line" ? 0 : 2,
              borderDash: s.tracejada ? [6, 5] : [],
              pointRadius: s.valores.map((_, i) =>
                selecao?.i === i && selecao.s === j
                  ? 9
                  : tipo === "scatter"
                    ? 5
                    : 3,
              ),
              pointHoverRadius: 8,
              tension: area ? 0.15 : 0.25,
              cubicInterpolationMode: "monotone",
              fill: area ? (j === 0 ? "origin" : "-1") : false,
              hidden: ocultas.includes(s.nome),
            }) as ChartDataset<"bar" | "line" | "scatter">,
        ),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? "y" : "x",
        animation: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? false
          : { duration: 650, easing: "easeOutQuart" },
        interaction: { mode: "nearest", intersect: true },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => {
                const raw = c.raw as PontoFluxo | number | null;
                return `${typeof raw === "object" && raw ? `${raw.us ?? ""} ${raw.label ?? ""} · ` : ""}${c.dataset.label}: ${numero(Number(horizontal ? c.parsed.x : c.parsed.y), 1)} ${unidade}`;
              },
              afterBody: () => periodo,
            },
          },
          zoom: {
            pan: { enabled: true, modifierKey: "shift", mode: "x" },
            zoom: {
              wheel: { enabled: true, modifierKey: "ctrl" },
              pinch: { enabled: true },
              mode: "x",
            },
          },
        },
        scales: {
          x: {
            type: tipo === "scatter" ? "linear" : undefined,
            stacked: empilhado,
            grid: { display: horizontal },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              ...(datas
                ? {
                    callback: (v) =>
                      new Date(Number(v)).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                      }),
                  }
                : {}),
            },
          },
          y: {
            stacked: empilhado,
            beginAtZero: true,
            title: { display: !horizontal, text: unidade },
            ticks: { precision: 0 },
            grid: { color: "#edf2f7" },
          },
        },
        onClick: (_e, items) => {
          const item = items[0];
          if (item) selecionarRef.current(item.index, item.datasetIndex);
        },
      },
    };
    const chart = new Chart(canvas.current, config);
    instancia.current = chart;
    graficosFluxo.set(id, { chart, titulo });
    return () => {
      graficosFluxo.delete(id);
      instancia.current = null;
      chart.destroy();
    };
  }, [
    id,
    titulo,
    periodo,
    labels,
    series,
    tipo,
    empilhado,
    horizontal,
    area,
    unidade,
    datas,
    ocultas,
    selecao,
  ]);
  const vazio = series.every(
    (s) => !s.valores.length || s.valores.every((v) => v === null),
  );
  const png = () => {
    try {
      const chart = instancia.current;
      if (!chart) throw Error("Gráfico indisponível.");
      const fonte = chart.canvas;
      const c = document.createElement("canvas");
      c.width = fonte.width;
      c.height = fonte.height + 85;
      const ctx = c.getContext("2d");
      if (!ctx) throw Error("Exportação indisponível.");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#123354";
      ctx.font = "600 16px Arial";
      ctx.fillText(titulo, 16, 24, c.width - 32);
      ctx.font = "12px Arial";
      ctx.fillText(`${periodo} · ${unidade} · SIGEP`, 16, 48, c.width - 32);
      ctx.drawImage(fonte, 0, 70);
      c.toBlob((blob) => {
        if (blob) baixarArquivo(blob, `sigep-fluxo-${id}.png`);
        else setErro("Não foi possível exportar a imagem.");
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao exportar.");
    }
  };
  return (
    <article className="ind-chart-card fluxo-grafico">
      <div className="ind-chart-heading">
        <div>
          <h3>{titulo}</h3>
          <span className="ind-chart-period">
            {periodo} · {unidade}
          </span>
        </div>
        <div className="ind-chart-tools">
          <button
            type="button"
            className="ind-icon-button"
            aria-label={`Ampliar ${titulo}`}
            onClick={() => instancia.current?.zoom(1.25)}
          >
            <FiMaximize />
          </button>
          <button
            type="button"
            className="ind-icon-button"
            aria-label={`Restaurar ${titulo}`}
            onClick={() => instancia.current?.resetZoom()}
          >
            <FiRotateCcw />
          </button>
          <button
            type="button"
            className="ind-icon-button"
            aria-label={`Exportar ${titulo} em PNG`}
            onClick={png}
          >
            <FiDownload />
          </button>
        </div>
      </div>
      {descricao && <p className="ind-chart-description">{descricao}</p>}
      <div className="ind-chart-legend">
        {series.map((s) => (
          <button
            type="button"
            key={s.nome}
            aria-pressed={!ocultas.includes(s.nome)}
            onClick={() =>
              setOcultas((o) =>
                o.includes(s.nome)
                  ? o.filter((v) => v !== s.nome)
                  : [...o, s.nome],
              )
            }
          >
            <span style={{ background: s.cor }} />
            {s.nome}
          </button>
        ))}
      </div>
      {vazio && (
        <EstadoVazio titulo="Aguardando histórico">
          Registre ou importe movimentações e os campos necessários. Nenhuma
          data foi inferida da sprint ou do status de desenvolvimento.
        </EstadoVazio>
      )}
      <div className="ind-chart-canvas" style={{ height: vazio ? 120 : 310 }}>
        <canvas
          ref={canvas}
          role="img"
          aria-label={`${titulo}. Dados acessíveis em Explorar dados do gráfico.`}
          aria-describedby={ajuda}
        />
      </div>
      <small id={ajuda}>
        Ctrl + rolagem para zoom. Explore cada ponto por teclado abaixo.
      </small>
      <details className="ind-chart-data">
        <summary>Explorar dados do gráfico</summary>
        <div>
          {series
            .filter((s) => !ocultas.includes(s.nome))
            .flatMap((s) =>
              s.valores.map((v, i) =>
                v === null ? null : (
                  <button
                    type="button"
                    key={`${s.nome}-${i}`}
                    aria-pressed={
                      selecao?.i === i && series[selecao.s]?.nome === s.nome
                    }
                    onClick={() => selecionar(i, series.indexOf(s))}
                  >
                    {typeof v === "object"
                      ? (v.us ?? v.label ?? labels[i])
                      : labels[i]}{" "}
                    · {s.nome}
                    <span>
                      {numero(typeof v === "object" ? v.y : v, 1)} {unidade}
                    </span>
                  </button>
                ),
              ),
            )}
        </div>
      </details>
      {selecao && (
        <p className="fluxo-selecao">
          Selecionado: {series[selecao.s]?.nome} ·{" "}
          {labels[selecao.i] ??
            (series[selecao.s]?.valores[selecao.i] as PontoFluxo | undefined)
              ?.us}
        </p>
      )}
      {erro && <p role="alert">{erro}</p>}
    </article>
  );
}
