// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PrototiposFeriasPage } from "./FeriasPages";

afterEach(() => { cleanup(); localStorage.clear(); });
it("renderiza a concessão de férias com registros, tags de situação e paginação", () => {
  localStorage.clear();
  render(<MemoryRouter><PrototiposFeriasPage /></MemoryRouter>);
  expect(screen.getAllByRole("table").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Agendada", { selector: ".prototype-ferias-badge" }).length).toBeGreaterThan(0);
  expect(document.querySelector(".p-paginator")).toBeTruthy();
});

// CA09: lançar uma nova solicitação é ação exclusiva do perfil Gestor — o Aprovador só
// valida/reprova/exclui, nunca lança (mesma regra do painel de calendário).
it("CA09 — oculta 'Nova solicitação de férias' para o perfil Aprovador", () => {
  localStorage.clear();
  render(<MemoryRouter><PrototiposFeriasPage /></MemoryRouter>);

  expect(screen.getByRole("button", { name: /Nova solicitação de férias/i })).toBeTruthy();

  fireEvent.change(screen.getByLabelText("Visualizando como"), { target: { value: "DRE / RH Central" } });

  expect(screen.queryByRole("button", { name: /Nova solicitação de férias/i })).toBeNull();
});
