import type { Chart } from "chart.js";
export type InstanciaGrafico = Chart<"bar" | "line", (number | null)[], string>;
export interface RegistroGrafico {
  chart: InstanciaGrafico;
  titulo: string;
  periodo: string;
}
export const graficosAtivos = new Map<string, RegistroGrafico>();
