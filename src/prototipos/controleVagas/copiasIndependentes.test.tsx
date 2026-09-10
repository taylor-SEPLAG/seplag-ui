// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { controleVagasStore as efetivos } from "./controleVagasStore";
import { controleVagasStore as temporarios } from "../controleVagasTemporarios/controleVagasStore";
import { controleVagasStore as comissionados } from "../controleVagasComissionados/controleVagasStore";
import { controleVagasStore as residentes } from "../controleVagasResidentes/controleVagasStore";
import { VagasTemporariosContent } from "../controleVagasTemporarios/VagasTemporariosContent";
import { VagasComissionadosContent } from "../controleVagasComissionados/VagasComissionadosContent";
import { VagasResidentesContent } from "../controleVagasResidentes/VagasResidentesContent";
import { QuadroAutorizadoContent as QuadroTemporarios } from "../controleVagasTemporarios/QuadroAutorizadoContent";
import { QuadroAutorizadoContent as QuadroComissionados } from "../controleVagasComissionados/QuadroAutorizadoContent";
import { QuadroAutorizadoContent as QuadroResidentes } from "../controleVagasResidentes/QuadroAutorizadoContent";
import { VagasIndividualizadasContent as VagasTemporarios } from "../controleVagasTemporarios/VagasIndividualizadasContent";
import { VagasIndividualizadasContent as VagasComissionados } from "../controleVagasComissionados/VagasIndividualizadasContent";
import { VagasIndividualizadasContent as VagasResidentes } from "../controleVagasResidentes/VagasIndividualizadasContent";
afterEach(cleanup);
const stores = [efetivos, temporarios, comissionados, residentes];
describe("cópias independentes de vagas", () => {
  it("isola alterações de quadros e vagas entre as quatro categorias", () => {
    const snapshots = stores.map(store => store.getState());
    try {
      stores.forEach((store, index) => {
        stores.filter(other => other !== store).forEach(other => {
          expect(store.getState().quadros[0]).not.toBe(other.getState().quadros[0]);
          expect(store.getState().vagas[0].historico).not.toBe(other.getState().vagas[0].historico);
        });
        store.set("quadros", []);
        store.set("vagas", []);
        stores.forEach((other, otherIndex) => {
          if (otherIndex !== index) expect(other.getState()).toBe(snapshots[otherIndex]);
        });
        store.update(() => snapshots[index]);
      });
    } finally { stores.forEach((store, index) => store.update(() => snapshots[index])); }
  });
  it.each([
    ["temporarios", VagasTemporariosContent],
    ["comissionados", VagasComissionadosContent],
    ["residentes", VagasResidentesContent],
  ] as const)("mantém os dois acessos dentro de %s", (slug, Component) => {
    const view = render(<MemoryRouter><Component /></MemoryRouter>);
    expect(view.getAllByRole("link").map(link => link.getAttribute("href"))).toEqual([
      "/prototipos/sigep/controle-vagas/" + slug + "/quadro-autorizado",
      "/prototipos/sigep/controle-vagas/" + slug + "/vagas",
    ]);
  });
  it.each([QuadroTemporarios, QuadroComissionados, QuadroResidentes, VagasTemporarios, VagasComissionados, VagasResidentes])("renderiza a tela copiada %s", Component => {
    const view = render(<MemoryRouter><Component /></MemoryRouter>);
    expect(view.container.firstElementChild).not.toBeNull();
  });
});
