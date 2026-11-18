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
vi.mock("./RoscaAnalise", () => ({
  RoscaAnalise: () => <div>Distribuição do esforço registrado</div>,
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
const montar = (secaoAnalise = false) =>
  render(
    <MemoryRouter>
      <DashboardProjeto secaoAnalise={secaoAnalise} />
    </MemoryRouter>,
  );
const card = (nome: string) =>
  screen.getByRole("button", { name: `Detalhar ${nome}` });

it("integra produtividade sem confundir a conclusão do desenvolvimento com análise e abre o relatório próprio", async () => {
  montar(true);
  fireEvent.click(
    screen.getByRole("tab", { name: "Produtividade da Análise" }),
  );
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    "Produtividade e Capacidade da Análise",
  );
  await waitFor(() =>
    expect(card("Histórias atribuídas").textContent).toContain("144"),
  );
  expect(card("Histórias com análise concluída").textContent).toContain(
    "Não informado",
  );
  expect(card("Capacity da equipe").textContent).toContain("Não informado");
  fireEvent.click(screen.getByRole("button", { name: "Exportar relatório" }));
  const dialog = screen.getByRole("dialog");
  expect(
    within(dialog).getByRole("button", { name: "Exportar PDF" }),
  ).toBeTruthy();
  expect(
    within(dialog).getByRole("button", { name: "Exportar Excel" }),
  ).toBeTruthy();
});

it("salva atividade com datas e captura a conclusão explícita da especificação sem alterar a base importada", async () => {
  montar(true);
  fireEvent.click(
    screen.getByRole("tab", { name: "Produtividade da Análise" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Registrar atividade" }));
  const dialog = screen.getByRole("dialog"),
    form = within(dialog);
  const h = base.historias.find((h) => h.analistas.length)!;
  fireEvent.change(form.getByLabelText("Analista"), {
    target: { value: h.analistas[0] },
  });
  fireEvent.change(form.getByLabelText("Sprint"), {
    target: { value: String(h.sprint) },
  });
  fireEvent.change(form.getByLabelText(/História \(US\)/), {
    target: { value: h.codigo },
  });
  fireEvent.change(form.getByLabelText("Tipo de atividade"), {
    target: { value: "Especificação" },
  });
  fireEvent.change(form.getByLabelText("Data de início"), {
    target: { value: "2026-11-02" },
  });
  fireEvent.change(form.getByLabelText("Data de conclusão"), {
    target: { value: "2026-11-04" },
  });
  fireEvent.change(form.getByLabelText("Horas dedicadas"), {
    target: { value: "6" },
  });
  fireEvent.change(form.getByLabelText("Situação"), {
    target: { value: "Concluída" },
  });
  fireEvent.click(form.getByRole("button", { name: "Salvar registro" }));
  await waitFor(() =>
    expect(card("Histórias com análise concluída").textContent).toContain("1"),
  );
  const salvo = JSON.parse(localStorage.getItem("sigep:analise:v1")!);
  expect(salvo.atividades[0].horas).toBe(6);
  expect(salvo.transicoes.map((t: { etapa: string }) => t.etapa)).toEqual([
    "Especificação",
    "Conclusão da especificação",
  ]);
  expect(localStorage.getItem("sigep:indicadores-projeto:v1")).toBeNull();
  expect(card("Tempo médio de análise").textContent).toContain("Não informado");
});

it("mantém simulação separada e permite filtrar analistas no drawer de origem", async () => {
  montar(true);
  fireEvent.click(
    screen.getByRole("tab", { name: "Produtividade da Análise" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Simular Capacity" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("Quantidade de analistas"), {
    target: { value: "4" },
  });
  expect(dialog.textContent).toContain("240,0 h");
  expect(localStorage.getItem("sigep:analise:v1")).toBeNull();
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  fireEvent.click(card("Histórias atribuídas"));
  expect(screen.getByLabelText("Analista do detalhamento")).toBeTruthy();
  expect(screen.getByLabelText("Sprint do detalhamento")).toBeTruthy();
});

it("abre na Visão Geral, mostra os dados reais e permite navegar pelas abas com teclado", async () => {
  montar();
  expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
    "Visão Geral",
    "Evolução das Sprints",
    "Capacity e Equipe",
    "Analistas e Desenvolvedores",
    "Complexidade",
    "Squads e Módulos",
    "Riscos e Insights",
  ]);
  expect(
    screen
      .getByRole("tab", { name: "Visão Geral" })
      .getAttribute("aria-selected"),
  ).toBe("true");
  await waitFor(() =>
    expect(card("Histórias distintas").textContent).toContain("144"),
  );
  expect(card("Registros nas sprints").textContent).toContain("172");
  expect(card("Histórias concluídas").textContent).toContain("99");
  expect(card("Pontos estimados").textContent).toContain("1.087");
  expect(card("Histórias reaparecidas").textContent).toContain("28");
  expect(
    card("Desenvolvedores disponíveis").querySelector("strong")?.textContent,
  ).toBe("12");
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
    arquivo: "PROJETO SIGEP - CONTROLE US (5).xlsx",
    importadoEm: new Date(Date.parse(base.importadoEm) - 60000).toISOString(),
    historias: base.historias.slice(0, 1),
  };
  localStorage.setItem("sigep:indicadores-projeto:v1", JSON.stringify(antiga));
  montar();
  await waitFor(() =>
    expect(card("Histórias concluídas").textContent).toContain("99"),
  );
  expect(card("Histórias distintas").textContent).toContain("144");
  expect(screen.getByText("PROJETO SIGEP - CONTROLE US (6).xlsx")).toBeTruthy();
});
it("exibe os desenvolvedores distintos de cada sprint no card e no gráfico de equipe", async () => {
  montar();
  const equipe = [
    [18, 7],
    [19, 7],
    [20, 7],
    [21, 7],
    [22, 12],
    [23, 11],
  ];
  for (const [sprint, quantidade] of equipe) {
    fireEvent.change(screen.getByLabelText("Sprint inicial"), {
      target: { value: String(sprint) },
    });
    fireEvent.change(screen.getByLabelText("Sprint final"), {
      target: { value: String(sprint) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
    await waitFor(() =>
      expect(
        card("Desenvolvedores disponíveis").querySelector("strong")
          ?.textContent,
      ).toBe(String(quantidade)),
    );
  }
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  fireEvent.click(screen.getByRole("tab", { name: "Capacity e Equipe" }));
  for (const [sprint, quantidade] of equipe) {
    expect(
      screen.getByRole("button", {
        name: `Desenvolvedores disponíveis por sprint — Sprint ${sprint} — Desenvolvedores disponíveis`,
      }).textContent,
    ).toBe(String(quantidade));
  }
  fireEvent.click(
    screen.getByRole("button", {
      name: "Desenvolvedores disponíveis por sprint — Sprint 23 — Desenvolvedores disponíveis",
    }),
  );
  const heading = await screen.findByRole("heading", {
    name: "Desenvolvedores disponíveis — Sprint 23",
  });
  const drawer = heading.closest(".ind-detail-drawer") as HTMLElement;
  expect(within(drawer).getByText("11 desenvolvedores")).toBeTruthy();
});
it("usa os nomes atribuídos também na métrica de desenvolvedores disponíveis por squad", () => {
  montar();
  fireEvent.click(screen.getByRole("tab", { name: "Squads e Módulos" }));
  fireEvent.change(screen.getByLabelText("Métrica da squad"), {
    target: { value: "disponiveis" },
  });
  expect(
    screen.getByRole("button", {
      name: "Comparativo por squad registrada — Squad 2 — Desenvolvedores disponíveis",
    }).textContent,
  ).toBe("5");
  expect(
    screen.getByRole("button", {
      name: "Comparativo por squad registrada — Squad 4 — Desenvolvedores disponíveis",
    }).textContent,
  ).toBe("2");
});
it("exibe capacity de 8 horas por desenvolvedor e atualiza o total ao selecionar uma sprint", async () => {
  montar();
  fireEvent.click(screen.getByRole("tab", { name: "Capacity e Equipe" }));
  expect(
    screen.getByText("Capacity bruta planejada").parentElement?.textContent,
  ).toContain("4.880 h");
  const jornada = screen.getByLabelText("Horas por dia") as HTMLInputElement;
  expect(jornada.value).toBe("8");
  fireEvent.change(screen.getByLabelText("Sprint inicial"), {
    target: { value: "23" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  expect(
    screen.getByText("Capacity bruta planejada").parentElement?.textContent,
  ).toContain("1.056 h");
  expect(
    screen.getByRole("button", {
      name: "Capacity bruta por sprint — Sprint 23 — Capacity bruta (h)",
    }).textContent,
  ).toBe("1056");
  const tabela = screen.getByRole("table", {
    name: /Capacity planejada por sprint/,
  });
  expect(
    within(tabela)
      .getAllByRole("row")
      .slice(1)
      .map((linha) =>
        within(linha)
          .getAllByRole("cell")
          .map((celula) => celula.textContent),
      ),
  ).toEqual([["Sprint 23", "11", "12", "8 h", "88 h", "1.056 h"]]);
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
  expect(within(drawer).getByText("4 registros relacionados")).toBeTruthy();
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
  expect(card("Registros nas sprints").textContent).toContain("172");
});
it("mantém a remanescência da Sprint 22 ao filtrar apenas a Sprint 23 e a analista Danielle", async () => {
  montar();
  fireEvent.change(screen.getByLabelText("Sprint inicial"), {
    target: { value: "23" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() =>
    expect(
      card("Histórias reaparecidas").querySelector("strong")?.textContent,
    ).toBe("4"),
  );
  fireEvent.change(screen.getByLabelText("Analista", { exact: true }), {
    target: { value: "Danielle" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() =>
    expect(
      card("Histórias reaparecidas").querySelector("strong")?.textContent,
    ).toBe("3"),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Histórias registradas por sprint — Sprint 23 — Reaparições",
    }),
  );
  const heading = await screen.findByRole("heading", {
    name: "Histórias reaparecidas — Sprint 23",
  });
  const drawer = heading.closest(".ind-detail-drawer") as HTMLElement;
  expect(
    within(drawer)
      .getAllByRole("button", { name: /^US\d+$/ })
      .map((b) => b.textContent),
  ).toEqual(["US319", "US321", "US322"]);
  fireEvent.click(within(drawer).getByRole("button", { name: "US319" }));
  const dialog = await screen.findByRole("dialog", { name: "US319" });
  const tabela = within(dialog).getByRole("table");
  expect(
    within(tabela)
      .getAllByRole("row")
      .slice(1)
      .map((linha) => within(linha).getAllByRole("cell")[0].textContent),
  ).toEqual(["22", "23"]);
});
it("corrige uma importação salva com férias na Sprint 22 e adiadas para a Sprint 24", async () => {
  const ferias = base.historias.filter(
    (h) => h.sprint === 23 && /Férias/i.test(h.titulo),
  );
  const salva = {
    ...base,
    arquivo: "reimportacao.xlsx",
    importadoEm: new Date(Date.parse(base.importadoEm) + 60000).toISOString(),
    historias: [
      ...base.historias.filter((h) => !ferias.includes(h)),
      ...base.replanejadas.map((r) => r.historia),
    ],
    replanejadas: ferias.map((historia) => ({ historia, sprintDestino: 24 })),
  };
  localStorage.setItem("sigep:indicadores-projeto:v1", JSON.stringify(salva));
  montar();
  fireEvent.change(screen.getByLabelText("Sprint inicial"), {
    target: { value: "23" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() =>
    expect(
      card("Histórias distintas").querySelector("strong")?.textContent,
    ).toBe("43"),
  );
  expect(
    card("Registros nas sprints").querySelector("strong")?.textContent,
  ).toBe("43");
  expect(card("Pontos estimados").querySelector("strong")?.textContent).toBe(
    "311",
  );
  expect(screen.getByText("reimportacao.xlsx")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Sprint inicial"), {
    target: { value: "22" },
  });
  fireEvent.change(screen.getByLabelText("Sprint final"), {
    target: { value: "22" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() =>
    expect(
      card("Histórias distintas").querySelector("strong")?.textContent,
    ).toBe("33"),
  );
});
