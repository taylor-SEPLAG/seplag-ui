// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FluxoAnalise from "./FluxoAnalise";
import type { ContextoProjeto } from "./AbasProjeto";
import type { DadosProjeto } from "./types";
import { filtrosIniciais, primeirasAparicoes, resumir } from "./modelo";
import { CHAVE_FLUXO, novoFluxo, type MovimentoFluxo } from "./fluxoModelo";
import type { PropsGraficoFluxo } from "./GraficoFluxo";
import base from "./dados-iniciais.json";
vi.mock("./GraficoFluxo", () => ({
  GraficoFluxo: ({
    titulo,
    labels,
    series,
    onSelecionar,
  }: PropsGraficoFluxo) => (
    <article>
      <h3>{titulo}</h3>
      {series.flatMap((s, j) =>
        s.valores.map((v, i) =>
          v === null ? null : (
            <button
              key={`${j}-${i}`}
              onClick={() => onSelecionar(i, j)}
              aria-label={`${titulo} · ${s.nome} · ${labels[i] ?? i}`}
            >
              {typeof v === "object" ? v.us : v}
            </button>
          ),
        ),
      )}
    </article>
  ),
}));
vi.mock("./GraficoProjeto", () => ({ GraficoProjeto: () => null }));
vi.mock("./RoscaAnalise", () => ({ RoscaAnalise: () => null }));
const h = base.historias.find((h) => h.sprint === 18 && h.analistas.length)!;
const ms: MovimentoFluxo[] = [
  {
    id: "1",
    us: h.codigo,
    origem: null,
    destino: "Levantamento",
    instante: "2026-07-20T09:00:00-04:00",
    analista: h.analistas[0],
    motivo: "",
    precisao: "instante",
    fonte: "Registro WIP",
  },
  {
    id: "2",
    us: h.codigo,
    origem: "Levantamento",
    destino: "Validação com Cliente",
    instante: "2026-07-22T10:00:00-04:00",
    analista: h.analistas[0],
    motivo: "",
    precisao: "instante",
    fonte: "Registro WIP",
  },
];
beforeEach(() => {
  localStorage.clear();
  vi.setSystemTime(new Date("2026-11-18T12:00:00Z"));
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  vi.stubGlobal("requestAnimationFrame", (f: FrameRequestCallback) =>
    setTimeout(() => f(performance.now() + 1000), 0),
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const montar = () => {
  const dados = base as DadosProjeto,
    primeiras = primeirasAparicoes(dados.historias);
  const ctx: ContextoProjeto = {
    dados,
    historias: dados.historias,
    filtros: filtrosIniciais(dados),
    primeiras,
    periodo: "Sprints 18 a 23",
    resumo: resumir(dados.historias, primeiras),
    anterior: null,
    sprints: [],
    foco: null,
    abrir: () => {},
    destacar: () => {},
    filtrarModulo: () => {},
  };
  render(
    <MemoryRouter>
      <h1>Gestão do Fluxo de Análise</h1>
      <button
        onClick={() => window.dispatchEvent(new Event("sigep:fluxo-relatorio"))}
      >
        Exportar relatório
      </button>
      <FluxoAnalise ctx={ctx} />
    </MemoryRouter>,
  );
};
const card = (nome: string) =>
  screen.getByRole("button", { name: `Detalhar ${nome}` });
it("preserva módulo WIP fora da navegação simplificada e mantém lacunas sem histórico", () => {
  montar();
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    "Gestão do Fluxo de Análise",
  );
  expect(card("WIP atual").textContent).toContain("Não informado");
  expect(card("Throughput").textContent).toContain("Não informado");
  expect(card("Cycle Time P85").textContent).toContain("Não informado");
});
it("mantém validação no WIP, abre origem e não cria bloqueio automático", async () => {
  const f = novoFluxo();
  f.movimentos = ms;
  localStorage.setItem(CHAVE_FLUXO, JSON.stringify(f));
  montar();
  await waitFor(() => expect(card("WIP atual").textContent).toContain("1"));
  expect(card("Histórias bloqueadas").textContent).toContain("0");
  fireEvent.click(card("WIP atual"));
  expect(
    screen.getByRole("heading", { name: "Histórico de movimentações" }),
  ).toBeTruthy();
  expect(screen.getByLabelText("Analista no detalhamento")).toBeTruthy();
});
it("registra aprovação com horário sem modificar a planilha ou apagar transições anteriores", async () => {
  const f = novoFluxo();
  f.movimentos = ms;
  localStorage.setItem(CHAVE_FLUXO, JSON.stringify(f));
  montar();
  fireEvent.click(
    screen.getByRole("button", { name: "Registrar movimentação" }),
  );
  const d = within(screen.getByRole("dialog"));
  fireEvent.change(d.getByLabelText("História (US)"), {
    target: { value: h.codigo },
  });
  fireEvent.change(d.getByLabelText("Etapa de destino"), {
    target: { value: "Pronta para Desenvolvimento" },
  });
  fireEvent.change(d.getByLabelText("Data e hora da movimentação"), {
    target: { value: "2026-07-24T15:00" },
  });
  fireEvent.change(d.getByLabelText("Analista responsável"), {
    target: { value: h.analistas[0] },
  });
  fireEvent.click(d.getByRole("button", { name: "Salvar registro do fluxo" }));
  await waitFor(() => expect(card("Throughput").textContent).toContain("1"));
  const salvo = JSON.parse(localStorage.getItem(CHAVE_FLUXO)!);
  expect(salvo.movimentos).toHaveLength(3);
  expect(salvo.movimentos[2]).toMatchObject({
    origem: "Validação com Cliente",
    destino: "Pronta para Desenvolvimento",
    instante: "2026-07-24T15:00:00-04:00",
  });
  expect(localStorage.getItem("sigep:indicadores-projeto:v1")).toBeNull();
  expect(localStorage.getItem("sigep:analise:v1")).toBeNull();
});
it("simula limites sem alterar o histórico real e abre relatório específico pelo botão global", () => {
  const f = novoFluxo();
  f.movimentos = ms;
  localStorage.setItem(CHAVE_FLUXO, JSON.stringify(f));
  montar();
  const antes = localStorage.getItem(CHAVE_FLUXO);
  fireEvent.click(
    screen.getByRole("button", { name: "Simular Limite de WIP" }),
  );
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("Limite simulado da equipe"), {
    target: { value: "0" },
  });
  expect(dialog.textContent).toContain("1 US acima do limite simulado");
  expect(localStorage.getItem(CHAVE_FLUXO)).toBe(antes);
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  fireEvent.click(screen.getByRole("button", { name: "Exportar relatório" }));
  expect(
    screen.getByRole("button", { name: "Gerar PDF de fluxo" }),
  ).toBeTruthy();
});
