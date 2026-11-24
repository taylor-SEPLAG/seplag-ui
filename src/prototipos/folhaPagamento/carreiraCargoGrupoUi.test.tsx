// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DomHandler } from "primereact/utils";
import { PrototiposFolhaGrupoCalculoFormPage } from "../PrototiposPage";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(DomHandler, "absolutePosition").mockImplementation(() => {});
});
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
const montar = () => {
  render(<MemoryRouter><PrototiposFolhaGrupoCalculoFormPage /></MemoryRouter>);
  const grupo = screen.getByRole("group", { name: "Carreira e Cargo" });
  return {
    carreiras: within(grupo).getByRole("combobox", { name: "Carreira" }) as HTMLInputElement,
    cargos: within(grupo).getByRole("combobox", { name: "Cargo" }) as HTMLInputElement,
  };
};
const abrir = async (id: string) => {
  fireEvent.click(document.getElementById(id)!);
  return within(await screen.findByRole("listbox"));
};
const fechar = async (id: string) => {
  fireEvent.click(document.getElementById(id)!);
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
};

it("mantém opções recolhidas e mostra a carreira do cargo ao abrir a seleção", async () => {
  const { carreiras, cargos } = montar();
  expect(carreiras.getAttribute("aria-expanded")).toBe("false");
  expect(cargos.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("listbox")).toBeNull();
  const opcoes = await abrir("abrangenciaCargos");
  const cargo = opcoes.getByRole("option", { name: /^Administrador Público Efetivo/ });
  expect(within(cargo).getByText("Profissionais da Administração")).toBeTruthy();
  fireEvent.click(cargo);
  await fechar("abrangenciaCargos");
  expect(carreiras.value).toBe("");
  expect(cargos.value).toContain("Administrador Público Efetivo");
  expect(cargos.getAttribute("aria-expanded")).toBe("false");
});

it("identifica cargos sem carreira e limpa as seleções pelo botão geral", async () => {
  const { carreiras, cargos } = montar();
  let opcoes = await abrir("abrangenciaCarreiras");
  fireEvent.click(opcoes.getByRole("option", { name: "Profissionais da Administração" }));
  await fechar("abrangenciaCarreiras");
  opcoes = await abrir("abrangenciaCargos");
  const cargo = opcoes.getByRole("option", { name: /^Médico sem carreira$/ });
  expect(within(cargo).getByText("sem carreira")).toBeTruthy();
  fireEvent.click(cargo);
  await fechar("abrangenciaCargos");
  expect(cargos.value).toContain("Médico");
  expect(carreiras.value).toBe("");
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  expect(cargos.value).toBe("");
  expect(carreiras.value).toBe("");
});

it("reabre as carreiras ao remover o cargo e preserva os demais campos", async () => {
  const { cargos } = montar();
  fireEvent.change(screen.getByPlaceholderText("Digite o nome do grupo"), { target: { value: "Grupo preservado" } });
  let opcoes = await abrir("abrangenciaCargos");
  fireEvent.click(opcoes.getByRole("option", { name: /^Administrador Público Efetivo/ }));
  await fechar("abrangenciaCargos");
  opcoes = await abrir("abrangenciaCarreiras");
  expect(opcoes.queryByRole("option", { name: "Profissionais da Educação", exact: true })).toBeNull();
  await fechar("abrangenciaCarreiras");
  opcoes = await abrir("abrangenciaCargos");
  fireEvent.click(opcoes.getByRole("option", { name: /^Administrador Público Efetivo/ }));
  await fechar("abrangenciaCargos");
  expect(cargos.value).toBe("");
  opcoes = await abrir("abrangenciaCarreiras");
  expect(opcoes.getByRole("option", { name: "Profissionais da Educação", exact: true })).toBeTruthy();
  expect((screen.getByPlaceholderText("Digite o nome do grupo") as HTMLInputElement).value).toBe("Grupo preservado");
});
