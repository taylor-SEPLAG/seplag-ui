import type { Chart } from "chart.js";
export type InstanciaFluxo = Chart<"bar" | "line" | "scatter">;
export const graficosFluxo = new Map<
  string,
  { chart: InstanciaFluxo; titulo: string }
>();
