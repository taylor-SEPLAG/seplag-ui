// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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
