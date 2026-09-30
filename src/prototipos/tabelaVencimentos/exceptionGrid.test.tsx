// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { TabelaVencimentosFeaturePage } from "./TabelaVencimentosFeaturePage";

const BASE = "/prototipos/sigep/tabelas-vencimentos";

beforeEach(() => {
  window.sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

it("inicia as jornadas sem tabela cadastrada", () => {
  render(
    <MemoryRouter initialEntries={[BASE]}>
      <TabelaVencimentosFeaturePage />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getAllByRole("button", { name: "Expandir cargo" })[0]);
  expect(screen.getAllByText("Sem tabela cadastrada")).toHaveLength(3);
  expect(screen.getByText("Nenhuma exceção cadastrada para este cargo.")).toBeTruthy();
});

it("mantém as Jornadas e Exceções em grids separadas no Cargo expandido", () => {
  window.sessionStorage.setItem(
    "sigep-tabelas-vencimentos-excecoes-v2",
    JSON.stringify([{
      id: "ex-1",
      cargoId: 1,
      perfil: "Tecnologia da Informação",
      localId: "org:sefaz",
      version: 1,
      start: "2026-01-01",
      matrix: { columns: ["A"], rows: [{ name: "001", values: ["R$ 1.000,00"] }] },
      baseLegal: ["Lei 1/2026"],
      observacao: "",
      responsavel: "Teste",
      registradoEm: "2026-01-01T12:00:00.000Z",
    }]),
  );

  render(
    <MemoryRouter initialEntries={[BASE]}>
      <TabelaVencimentosFeaturePage />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getAllByRole("button", { name: "Expandir cargo" })[0]);

  expect(screen.getByRole("heading", { name: "Tabelas por Jornada" })).toBeTruthy();
  const exceptions = screen.getByRole("region", { name: "Exceções cadastradas" });
  expect(within(exceptions).getByRole("columnheader", { name: "Perfil Profissional" })).toBeTruthy();
  expect(within(exceptions).queryByRole("columnheader", { name: "Jornada" })).toBeNull();
  expect(within(exceptions).getByText("SEFAZ")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Cadastrar Exceção" })).toBeTruthy();
  fireEvent.click(within(exceptions).getByRole("button", { name: "Mais ações" }));
  expect(within(exceptions).getByRole("button", { name: "Versionar" })).toBeTruthy();
  fireEvent.click(within(exceptions).getByRole("button", { name: "Histórico" }));
  const history = screen.getByRole("dialog", { name: "Histórico da exceção" });
  expect(within(history).getByRole("columnheader", { name: "Origem da alteração" })).toBeTruthy();
  expect(within(history).getByRole("columnheader", { name: "Última alteração" })).toBeTruthy();
  fireEvent.click(within(history).getByRole("button", { name: "Expandir tabela" }));
  const detailTabs = within(history).getByRole("navigation", { name: "Detalhes da versão V1" });
  expect(within(detailTabs).getByRole("button", { name: "Tabela de valores" })).toBeTruthy();
  fireEvent.click(within(detailTabs).getByRole("button", { name: "Informações adicionais" }));
  expect(within(history).getByText("Lei 1/2026")).toBeTruthy();
  fireEvent.click(within(history).getByRole("button", { name: "Fechar" }));
  fireEvent.click(screen.getByRole("button", { name: "Visualizar exceção" }));
  const steps = screen.getByRole("navigation", { name: "Etapas da Tabela de Exceção" });
  expect(within(steps).getAllByRole("button")).toHaveLength(2);
  expect(within(steps).queryByRole("button", { name: "Confirmação" })).toBeNull();
  fireEvent.click(within(steps).getByRole("button", { name: "Valores por Nível e Classe" }));
  expect(screen.getByText(/A Tabela de Exceção terá prioridade sobre a Tabela por Jornada/)).toBeTruthy();
});


it("abre o cadastro da exceção com o Cargo de origem e sem campo de Jornada", () => {
  render(
    <MemoryRouter initialEntries={[BASE]}>
      <TabelaVencimentosFeaturePage />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getAllByRole("button", { name: "Expandir cargo" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar Exceção" }));

  expect(screen.getByText("Nova Tabela de Vencimentos — Exceção")).toBeTruthy();
  expect(screen.getByRole("navigation", { name: "Etapas da Tabela de Exceção" })).toBeTruthy();
  expect(screen.queryAllByDisplayValue("Auditor Fiscal").length).toBeGreaterThan(0);
  expect(screen.queryByText("Jornada*")).toBeNull();
  expect(screen.getAllByText("Perfil Profissional").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Local de Lotação").length).toBeGreaterThan(0);
  expect(screen.getByText("Data início da vigência*")).toBeTruthy();
  expect(screen.getByText("Cargo*")).toBeTruthy();
  expect(screen.getAllByText("Horas trabalhadas").length).toBeGreaterThan(0);
  expect(screen.getByRole("option", { name: "6 horas" })).toBeTruthy();
  expect(screen.getByRole("option", { name: "4 horas" })).toBeTruthy();
  expect(screen.getByRole("option", { name: "17 horas" })).toBeTruthy();
  expect(within(screen.getByRole("navigation", { name: "Etapas da Tabela de Exceção" })).getAllByRole("button")).toHaveLength(2);
});
