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
import { DomHandler } from "primereact/utils";
import { PrototiposFolhaPagamentoFormPage } from "../PrototiposPage";
import { folhaPagamentoService } from "./folhaPagamentoService";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(DomHandler, "absolutePosition").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
const montar = () =>
  render(
    <MemoryRouter>
      <PrototiposFolhaPagamentoFormPage />
    </MemoryRouter>,
  );
const abrir = async (campo: string) => {
  fireEvent.click(document.getElementById(campo)!);
  return within(await screen.findByRole("listbox"));
};
const fechar = (campo: string) =>
  fireEvent.click(document.getElementById(campo)!);

it("organiza os dados em seções e exibe os seis critérios na ordem solicitada, mantendo o grupo de eleitos", () => {
  montar();
  expect(screen.getByRole("region", { name: "Dados da Folha" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "Observação" })).toBeTruthy();
  const abrangencia = screen.getByRole("region", { name: "Abrangência" });
  expect(
    [...abrangencia.querySelectorAll(".p-multiselect")].map((e) => e.id),
  ).toEqual([
    "abrangenciaRegimeJuridico",
    "abrangenciaTipoVinculo",
    "orgaos",
    "abrangenciaUnidades",
    "abrangenciaCarreiras",
    "abrangenciaCargos",
  ]);
  expect(within(abrangencia).getByText("Grupo de eleitos")).toBeTruthy();
  for (const label of ["Instituição", "Setor", "Categoria", "Subcategoria"])
    expect(within(abrangencia).queryByText(label)).toBeNull();
});

it("salva a folha com regime como único critério de abrangência", async () => {
  const salvar = vi
    .spyOn(folhaPagamentoService, "criarFolha")
    .mockReturnValue(folhaPagamentoService.listarFolhas()[0]);
  montar();
  fireEvent.change(document.getElementById("nome")!, {
    target: { value: "Folha de teste" },
  });
  fireEvent.change(document.getElementById("numero")!, {
    target: { value: "987654" },
  });
  let opcoes = await abrir("abrangenciaRegimeJuridico");
  fireEvent.click(opcoes.getByRole("option", { name: "REGIME ESPECIAL" }));
  fechar("abrangenciaRegimeJuridico");
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  await waitFor(() => expect(salvar).toHaveBeenCalled());
  expect(salvar).toHaveBeenCalledWith(
    expect.objectContaining({
      abrangenciaRegimeJuridico: ["REGIME ESPECIAL"],
      orgaos: [],
      abrangenciaCarreiras: [],
      abrangenciaUnidades: [],
      abrangenciaCargos: [],
    }),
  );
});

it("atualiza as unidades conforme o órgão e limpa todos os critérios", async () => {
  montar();
  expect(
    document
      .getElementById("abrangenciaUnidades")
      ?.classList.contains("p-disabled"),
  ).toBe(true);
  let opcoes = await abrir("orgaos");
  fireEvent.click(opcoes.getByRole("option", { name: /^SEDUC —/ }));
  fechar("orgaos");
  expect(
    document
      .getElementById("abrangenciaUnidades")
      ?.classList.contains("p-disabled"),
  ).toBe(false);
  opcoes = await abrir("abrangenciaUnidades");
  expect(
    opcoes.getByRole("option", {
      name: "Gabinete do Secretário de Estado de Educação",
    }),
  ).toBeTruthy();
  expect(
    opcoes.queryByRole("option", {
      name: "Gabinete do Secretário de Estado de Planejamento e Gestão",
    }),
  ).toBeNull();
  fireEvent.click(
    opcoes.getByRole("option", {
      name: "Gabinete do Secretário de Estado de Educação",
    }),
  );
  fechar("abrangenciaUnidades");
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  expect(
    document
      .getElementById("abrangenciaUnidades")
      ?.classList.contains("p-disabled"),
  ).toBe(true);
  expect(
    document.getElementById("abrangenciaUnidades")?.textContent,
  ).not.toContain("Gabinete do Secretário de Estado de Educação");
  opcoes = await abrir("orgaos");
  fireEvent.click(opcoes.getByRole("option", { name: /^SEPLAG —/ }));
  fechar("orgaos");
  opcoes = await abrir("abrangenciaUnidades");
  expect(
    opcoes.getByRole("option", {
      name: "Gabinete do Secretário de Estado de Planejamento e Gestão",
    }),
  ).toBeTruthy();
});

it("persiste os novos critérios ao criar e atualizar uma folha", () => {
  const folha = folhaPagamentoService.criarFolha({
    nome: "Folha critérios",
    abrangenciaCarreiras: ["CARREIRA"],
    abrangenciaUnidades: ["UNIDADE"],
    abrangenciaCargos: ["CARGO"],
    grupoEleitos: "ELEITOS",
  });
  try {
    expect(folhaPagamentoService.buscarFolhaPorId(folha.id)).toEqual(
      expect.objectContaining({
        abrangenciaCarreiras: ["CARREIRA"],
        abrangenciaUnidades: ["UNIDADE"],
        abrangenciaCargos: ["CARGO"],
        grupoEleitos: "ELEITOS",
      }),
    );
    folhaPagamentoService.atualizarFolha(folha.id, {
      abrangenciaUnidades: ["NOVA_UNIDADE"],
    });
    expect(folhaPagamentoService.buscarFolhaPorId(folha.id)).toEqual(
      expect.objectContaining({
        abrangenciaCarreiras: ["CARREIRA"],
        abrangenciaUnidades: ["NOVA_UNIDADE"],
        abrangenciaCargos: ["CARGO"],
        grupoEleitos: "ELEITOS",
      }),
    );
  } finally {
    folhaPagamentoService.excluirFolha(folha.id);
  }
});

it("mantém o Grupo de Eleitos disponível e permite salvar usando somente esse público", async () => {
  const salvar = vi
    .spyOn(folhaPagamentoService, "criarFolha")
    .mockReturnValue(folhaPagamentoService.listarFolhas()[0]);
  montar();
  fireEvent.change(document.getElementById("nome")!, {
    target: { value: "Folha eleitos" },
  });
  fireEvent.change(document.getElementById("numero")!, {
    target: { value: "987655" },
  });
  const opcoes = await abrir("grupoEleitos");
  fireEvent.click(opcoes.getByRole("option", { name: "Grupo Teste" }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  await waitFor(() =>
    expect(salvar).toHaveBeenCalledWith(
      expect.objectContaining({
        grupoEleitos: "Grupo Teste",
        abrangenciaRegimeJuridico: [],
        abrangenciaCargos: [],
      }),
    ),
  );
});
