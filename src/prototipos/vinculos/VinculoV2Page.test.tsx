// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { VinculoV2CadastroPage, VinculoV2ConsultaPage, VinculoV2DetalhesPage } from "./VinculoV2Page";

const montar = (inicio = "/prototipos/sigep/vinculos-v2") => render(<MemoryRouter initialEntries={[inicio]}><Routes>
  <Route path="/prototipos/sigep/vinculos-v2" element={<VinculoV2ConsultaPage />} />
  <Route path="/prototipos/sigep/vinculos-v2/novo" element={<VinculoV2CadastroPage />} />
  <Route path="/prototipos/sigep/vinculos-v2/:id" element={<VinculoV2DetalhesPage />} />
</Routes></MemoryRouter>);
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); localStorage.clear(); });

it("lista os 20 tipos, inclusive os vazios, e conta vínculos ativos distintos", () => {
  montar();
  const tabela = screen.getByRole("region", { name: "Tipos de vínculo" });
  expect(within(tabela).getAllByRole("button", { name: "Visualizar" })).toHaveLength(20);
  expect(within(tabela).getByText("Contrato Temporário Vínculo Único")).toBeTruthy();
  const kpis = screen.getByRole("region", { name: "Indicadores de vínculos" });
  expect(kpis.textContent).toContain("Vínculos Ativos4");
  expect(kpis.textContent).toContain("Tipos com Vínculos Ativos4");
});

it("cadastra no tipo escolhido e preserva o número funcional do próximo vínculo", () => {
  montar();
  const linha = screen.getByRole("region", { name: "Tipos de vínculo" }).querySelector("tbody > tr") as HTMLTableRowElement;
  fireEvent.click(within(linha).getByRole("button", { name: "Visualizar" }));
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar Vínculo" }));
  expect((screen.getByDisplayValue("Nomeado Efetivo") as HTMLInputElement).readOnly).toBe(true);
  fireEvent.change(screen.getByPlaceholderText("000.000.000-00"), { target: { value: "000.000.000-00" } });
  fireEvent.click(screen.getByRole("button", { name: "Pesquisar" }));
  expect((screen.getByDisplayValue("3") as HTMLInputElement).readOnly).toBe(true);
  fireEvent.change(screen.getByLabelText(/Órgão/), { target: { value: "SEPLAG" } });
  fireEvent.change(screen.getByLabelText(/Unidade\/Setor de Lotação/), { target: { value: "Gabinete" } });
  fireEvent.change(screen.getByLabelText(/Data de Início/), { target: { value: "2026-10-08" } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar Vínculo" }));
  const salvos = JSON.parse(localStorage.getItem("prototype-vinculos-v2") ?? "[]");
  expect(salvos[0]).toMatchObject({ tipo: "Nomeado Efetivo", cpf: "000.000.000-00", numero: "3", orgao: "SEPLAG", situacao: "Ativo" });
  expect(screen.getByRole("heading", { name: "Consulta de Vínculos" })).toBeTruthy();
  const tabela = screen.getByRole("region", { name: "Tipos de vínculo" });
  expect(within(tabela).getAllByRole("button", { name: "Ver detalhes" })).toHaveLength(2);
  expect(screen.getByRole("region", { name: "Indicadores de vínculos" }).textContent).toContain("Vínculos Ativos5");
});

it("aplica filtros e abre detalhes sem permitir edição", () => {
  montar();
  fireEvent.change(screen.getByLabelText("Órgão"), { target: { value: "SES" } });
  fireEvent.click(screen.getByRole("button", { name: "Pesquisar" }));
  expect(screen.getByRole("region", { name: "Tipos de vínculo" }).querySelectorAll("tbody > tr")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Visualizar" }));
  fireEvent.click(screen.getByRole("button", { name: "Ver detalhes" }));
  expect(screen.getByRole("heading", { name: "Detalhes do Vínculo" })).toBeTruthy();
  expect(screen.getByText("418920")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Salvar Vínculo" })).toBeNull();
});