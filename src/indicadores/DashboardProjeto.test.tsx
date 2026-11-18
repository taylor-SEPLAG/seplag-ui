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
import type { GraficoProjetoProps } from "./GraficoProjeto";
import DashboardProjeto from "./DashboardProjeto";
import base from "./dados-iniciais.json";

vi.mock("./GraficoProjeto", () => ({
  GraficoProjeto: ({
    titulo,
    labels,
    series,
    onSelecionar,
  }: GraficoProjetoProps) => (
    <article>
      <h3>{titulo}</h3>
      {labels.map((label, i) =>
        series.map((s, j) => (
          <button
            type="button"
            key={`${label}-${j}`}
            onClick={() => onSelecionar(i, j)}
            aria-label={`${titulo} — ${label} — ${s.nome}`}
          >
            {s.valores[i] ?? "Não informado"}
          </button>
        )),
      )}
    </article>
  ),
}));
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("min-width") || query.includes("reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now() + 1000), 0),
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});
const montar = () =>
  render(
    <MemoryRouter>
      <DashboardProjeto />
    </MemoryRouter>,
  );
const card = (nome: string) =>
  screen.getByRole("button", { name: `Detalhar ${nome}` });

it("abre na Visão Geral, mostra os dados reais e permite navegar pelas abas com teclado", async () => {
  montar();
  expect(screen.getAllByRole("tab")).toHaveLength(8);
  expect(
    screen
      .getByRole("tab", { name: "Visão Geral" })
      .getAttribute("aria-selected"),
  ).toBe("true");
  await waitFor(() =>
    expect(card("Histórias distintas").textContent).toContain("144"),
  );
  expect(card("Registros nas sprints").textContent).toContain("181");
  expect(card("Histórias concluídas").textContent).toContain("99");
  expect(card("Pontos estimados").textContent).toContain("1.087");
  expect(card("Histórias reaparecidas").textContent).toContain("37");
  expect(card("Desenvolvedores disponíveis").textContent).toContain(
    "Não informado",
  );
  fireEvent.keyDown(screen.getByRole("tab", { name: "Visão Geral" }), {
    key: "ArrowRight",
  });
  expect(
    screen
      .getByRole("tab", { name: "Evolução das Sprints" })
      .getAttribute("aria-selected"),
  ).toBe("true");
  expect(
    screen.getByRole("heading", {
      name: "Planejado versus conclusão confirmada",
    }),
  ).toBeTruthy();
});
it("prioriza a nova base fornecida sobre a planilha anterior salva no navegador", async () => {
  const antiga = {
    ...base,
    arquivo: "PROJETO SIGEP - CONTROLE US (3).xlsx",
    importadoEm: new Date(Date.parse(base.importadoEm) - 60000).toISOString(),
    historias: base.historias.slice(0, 1),
  };
  localStorage.setItem("sigep:indicadores-projeto:v1", JSON.stringify(antiga));
  montar();
  await waitFor(() =>
    expect(card("Histórias concluídas").textContent).toContain("99"),
  );
  expect(card("Histórias distintas").textContent).toContain("144");
  expect(screen.getByText("PROJETO SIGEP - CONTROLE US (5).xlsx")).toBeTruthy();
});
it("preserva uma importação manual mais recente do que a base fornecida", async () => {
  const nova = {
    ...base,
    arquivo: "atualizacao-manual.xlsx",
    importadoEm: new Date(Date.parse(base.importadoEm) + 60000).toISOString(),
    historias: base.historias.slice(0, 1),
  };
  localStorage.setItem("sigep:indicadores-projeto:v1", JSON.stringify(nova));
  montar();
  await waitFor(() =>
    expect(
      card("Histórias distintas").querySelector("strong")?.textContent,
    ).toBe("1"),
  );
  expect(screen.getByText("atualizacao-manual.xlsx")).toBeTruthy();
  expect(localStorage.getItem("sigep:indicadores-projeto:v1")).toBe(
    JSON.stringify(nova),
  );
});
it("aplica filtros globalmente, preserva a seleção entre abas e restaura o recorte", async () => {
  montar();
  fireEvent.change(screen.getByLabelText("Analista", { exact: true }), {
    target: { value: "Isabeli" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() =>
    expect(card("Histórias distintas").textContent).toContain("53"),
  );
  fireEvent.click(
    screen.getByRole("tab", { name: "Analistas e Desenvolvedores" }),
  );
  expect(
    (screen.getByLabelText("Analista", { exact: true }) as HTMLSelectElement)
      .value,
  ).toBe("Isabeli");
  expect(
    screen.getByRole("heading", { name: "Histórias por analista" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  fireEvent.click(screen.getByRole("tab", { name: "Visão Geral" }));
  await waitFor(() =>
    expect(card("Histórias distintas").textContent).toContain("144"),
  );
  expect(
    (screen.getByLabelText("Analista", { exact: true }) as HTMLSelectElement)
      .value,
  ).toBe("");
});
it("abre o detalhamento da série correta e permite consultar a história original", async () => {
  montar();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Histórias registradas por sprint — Sprint 23 — Reaparições",
    }),
  );
  const heading = await screen.findByRole("heading", {
    name: "Histórias reaparecidas — Sprint 23",
  });
  const drawer = heading.closest(".ind-detail-drawer") as HTMLElement;
  expect(within(drawer).getByText("13 registros relacionados")).toBeTruthy();
  const botao = within(drawer).getAllByRole("button", { name: /^US\d+$/ })[0];
  const codigo = botao.textContent!;
  fireEvent.click(botao);
  const dialog = await screen.findByRole("dialog", { name: codigo });
  expect(
    within(dialog).getByRole("heading", { name: "Histórico de aparições" }),
  ).toBeTruthy();
  expect(within(dialog).getByText("Período original")).toBeTruthy();
});
it("rejeita intervalo invertido e arquivo inválido sem apagar a base atual", async () => {
  montar();
  fireEvent.change(screen.getByLabelText("Sprint inicial"), {
    target: { value: "23" },
  });
  fireEvent.change(screen.getByLabelText("Sprint final"), {
    target: { value: "18" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  expect(screen.getByRole("alert").textContent).toContain("menor ou igual");
  await waitFor(() =>
    expect(card("Histórias distintas").textContent).toContain("144"),
  );
  fireEvent.change(screen.getByLabelText("Selecionar planilha do projeto"), {
    target: {
      files: [new File(["invalido"], "arquivo.csv", { type: "text/csv" })],
    },
  });
  expect(screen.getByRole("alert").textContent).toContain(".xlsx");
  expect(localStorage.getItem("sigep:indicadores-projeto:v1")).toBeNull();
  expect(card("Registros nas sprints").textContent).toContain("181");
});
