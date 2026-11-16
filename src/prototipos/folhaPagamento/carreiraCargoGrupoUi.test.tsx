// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DomHandler } from "primereact/utils";
import { PrototiposFolhaGrupoCalculoFormPage } from "../PrototiposPage";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(DomHandler, "absolutePosition").mockImplementation(() => {});
});
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
const montar = () => render(<MemoryRouter><PrototiposFolhaGrupoCalculoFormPage /></MemoryRouter>);
const abrir = async (id: string) => {
  fireEvent.click(document.getElementById(id)!);
  return within(await screen.findByRole("listbox"));
};
const fechar = (id: string) => fireEvent.click(document.getElementById(id)!);

it("preenche carreira ao escolher cargo e limpa somente as seleções relacionadas", async () => {
  montar();
  let opcoes = await abrir("abrangenciaOrgao");
  fireEvent.click(opcoes.getByRole("option", { name: /^SEPLAG —/ }));
  fechar("abrangenciaOrgao");
  opcoes = await abrir("abrangenciaCargos");
  expect(opcoes.getByRole("option", { name: "Médico" })).toBeTruthy();
  fireEvent.click(opcoes.getByRole("option", { name: "Administrador Público Efetivo", exact: true }));
  fechar("abrangenciaCargos");
  expect(document.getElementById("abrangenciaCarreiras")?.textContent).toContain("Profissionais da Administração");
  const grupo = screen.getByRole("group", { name: /Carreira e Cargo/ });
  expect(within(grupo).queryByRole("status")).toBeNull();
  expect(within(grupo).queryByRole("button", { name: "Limpar seleção" })).toBeNull();
  expect(within(grupo).getByText("Filtra os cargos pela carreira. Cargos sem carreira continuam disponíveis.")).toBeTruthy();
  opcoes = await abrir("abrangenciaCargos");
  expect(opcoes.queryByRole("option", { name: "Médico" })).toBeNull();
  fechar("abrangenciaCargos");
  opcoes = await abrir("abrangenciaCarreiras");
  fireEvent.click(opcoes.getByRole("option", { name: "Profissionais da Administração" }));
  fechar("abrangenciaCarreiras");
  opcoes = await abrir("abrangenciaCargos");
  fireEvent.click(opcoes.getByRole("option", { name: "Administrador Público Efetivo", exact: true }));
  fechar("abrangenciaCargos");
  expect(document.getElementById("abrangenciaCarreiras")?.textContent).not.toContain("Profissionais da Administração");
  expect(document.getElementById("abrangenciaOrgao")?.textContent).toContain("SEPLAG");
  expect(document.getElementById("abrangenciaCargos")?.textContent).toContain("Selecione um cargo...");
  opcoes = await abrir("abrangenciaCargos");
  fireEvent.click(opcoes.getByRole("option", { name: "Médico" }));
  fechar("abrangenciaCargos");
  expect(document.getElementById("abrangenciaCargos")?.textContent).toContain("Médico");
  expect(document.getElementById("abrangenciaCarreiras")?.textContent).not.toContain("Profissionais");
});

it("remove o cargo incompatível ao trocar de carreira e permite consultar todos ao limpar", async () => {
  montar();
  let opcoes = await abrir("abrangenciaCargos");
  fireEvent.click(opcoes.getByRole("option", { name: "Administrador Público Efetivo", exact: true }));
  fechar("abrangenciaCargos");
  opcoes = await abrir("abrangenciaCarreiras");
  fireEvent.click(opcoes.getByRole("option", { name: "Profissionais da Administração" }));
  fireEvent.click(opcoes.getByRole("option", { name: "Profissionais da Educação", exact: true }));
  fechar("abrangenciaCarreiras");
  expect(document.getElementById("abrangenciaCargos")?.textContent).not.toContain("Administrador Público Efetivo");
  expect(document.getElementById("abrangenciaCargos")?.textContent).toContain("Selecione um cargo desta carreira...");
  opcoes = await abrir("abrangenciaCargos");
  expect(opcoes.getByRole("option", { name: "Professor da Educação Básica Efetivo" })).toBeTruthy();
  expect(opcoes.queryByRole("option", { name: "Médico" })).toBeNull();
  fechar("abrangenciaCargos");
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  opcoes = await abrir("abrangenciaCargos");
  expect(opcoes.getByRole("option", { name: "Médico" })).toBeTruthy();
});
