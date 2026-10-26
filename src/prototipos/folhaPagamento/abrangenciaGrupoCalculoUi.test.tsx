// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DomHandler } from "primereact/utils";
import { PrototiposFolhaGrupoCalculoFormPage } from "../PrototiposPage";
import { lerAbrangenciaGrupo } from "./abrangenciaGrupoCalculo";

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
      <PrototiposFolhaGrupoCalculoFormPage />
    </MemoryRouter>,
  );
const abrir = async (campo: string) => {
  fireEvent.click(document.getElementById(campo)!);
  return within(await screen.findByRole("listbox"));
};
const fechar = (campo: string) =>
  fireEvent.click(document.getElementById(campo)!);

it("exibe apenas os seis filtros na ordem solicitada e preserva as demais seções", () => {
  montar();
  const secao = screen.getByRole("region", { name: "Abrangência" });
  expect(
    Array.from(secao.querySelectorAll(".p-multiselect")).map((e) => e.id),
  ).toEqual([
    "abrangenciaRegimeJuridico",
    "abrangenciaTipoVinculo",
    "abrangenciaCarreiras",
    "abrangenciaOrgao",
    "abrangenciaUnidades",
    "abrangenciaCargos",
  ]);
  for (const label of [
    "Regime Jurídico",
    "Tipo de Vínculo",
    "Carreira",
    "Órgão/Entidade",
    "Unidade",
    "Cargo",
  ])
    expect(within(secao).getByText(label)).toBeTruthy();
  for (const label of ["Instituição", "Categoria", "Subcategoria", "Setor"])
    expect(within(secao).queryByText(label)).toBeNull();
  expect(
    within(secao).getByText(
      "Defina os critérios de abrangência para identificar os vínculos funcionais que serão considerados neste Grupo de Cálculo.",
    ),
  ).toBeTruthy();
  expect(screen.getByText("Relacionar Rubricas")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));
  expect(screen.getByRole("alert").textContent).toContain(
    "Ao menos um campo ativo de abrangência deve ser preenchido para aprovar.",
  );
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("filtra os tipos pelo regime, salva a abrangência e limpa somente os critérios", async () => {
  montar();
  let opcoes = await abrir("abrangenciaRegimeJuridico");
  fireEvent.click(opcoes.getByRole("option", { name: "REGIME ESPECIAL" }));
  fechar("abrangenciaRegimeJuridico");
  opcoes = await abrir("abrangenciaTipoVinculo");
  expect(opcoes.queryByRole("option", { name: "Nomeado Efetivo" })).toBeNull();
  expect(
    opcoes.getByRole("option", { name: "Contrato Temporário" }),
  ).toBeTruthy();
  fireEvent.click(opcoes.getByRole("option", { name: "Contrato Temporário" }));
  fechar("abrangenciaTipoVinculo");
  fireEvent.click(screen.getByRole("button", { name: "Salvar Rascunho" }));
  expect(lerAbrangenciaGrupo("novo").regimes).toEqual(["REGIME ESPECIAL"]);
  expect(lerAbrangenciaGrupo("novo").tipos).toEqual(["TV003"]);
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  opcoes = await abrir("abrangenciaTipoVinculo");
  expect(opcoes.getByRole("option", { name: "Nomeado Efetivo" })).toBeTruthy();
});

it("atualiza unidades quando o órgão é alterado", async () => {
  montar();
  let opcoes = await abrir("abrangenciaOrgao");
  fireEvent.click(opcoes.getByRole("option", { name: /^SEDUC —/ }));
  fechar("abrangenciaOrgao");
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
  opcoes = await abrir("abrangenciaUnidades");
  expect(
    opcoes.getByRole("option", {
      name: "Gabinete do Secretário de Estado de Planejamento e Gestão",
    }),
  ).toBeTruthy();
});
