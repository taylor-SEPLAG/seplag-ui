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
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DomHandler } from "primereact/utils";
import { PrototiposFolhaGrupoCalculoFormPage } from "../PrototiposPage";
import {
  salvarVersoesPesosAbrangencia,
  type VersaoPesosAbrangencia,
} from "./pesosAbrangenciasStore";

const versao: VersaoPesosAbrangencia = {
  numero: 2,
  inicio: "2026-11-16T12:00:00Z",
  fim: null,
  pesos: [10, 4, 3, 2, 1, 6],
};
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(DomHandler, "absolutePosition").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function montar(
  rota = "/prototipos/folha/grupos-calculo/novo?competencia=2026-05",
) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route
          path="/prototipos/folha/grupos-calculo/novo"
          element={<PrototiposFolhaGrupoCalculoFormPage />}
        />
        <Route
          path="/prototipos/folha/grupos-calculo/:id/editar"
          element={<PrototiposFolhaGrupoCalculoFormPage />}
        />
        <Route
          path="/prototipos/folha/grupos-calculo"
          element={<p>Grupos cadastrados</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

async function selecionar(campo: string, nome: string | RegExp) {
  fireEvent.click(document.getElementById(campo)!);
  fireEvent.click(
    within(await screen.findByRole("listbox")).getByRole("option", {
      name: nome,
    }),
  );
  fireEvent.click(document.getElementById(campo)!);
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
}

it("salva os pesos aplicados e preserva o registro após mudar a parametrização global", async () => {
  salvarVersoesPesosAbrangencia([versao]);
  montar();
  await selecionar("abrangenciaRegimeJuridico", "REGIME ESPECIAL");
  fireEvent.change(screen.getByPlaceholderText("Digite o nome do grupo"), {
    target: { value: "Grupo com pesos" },
  });
  fireEvent.input(document.getElementById("dataAtivacao")!, {
    target: { value: "01/05/2026" },
  });
  fireEvent.blur(document.getElementById("dataAtivacao")!);
  fireEvent.click(screen.getByRole("button", { name: "Salvar Rascunho" }));
  const banco = JSON.parse(
    localStorage.getItem("sigep:grupos-calculo:competencias:v1")!,
  );
  const salvo = banco["2026-05"].grupos.find(
    (g: { grupo: string }) => g.grupo === "Grupo com pesos",
  );
  expect(salvo?.pesosAplicados).toEqual({ versao: 2, total: 4 });
  cleanup();
  salvarVersoesPesosAbrangencia([
    { ...versao, numero: 3, pesos: [10, 9, 3, 2, 1, 6] },
    { ...versao, fim: "2026-11-17T12:00:00Z" },
  ]);
  montar(
    `/prototipos/folha/grupos-calculo/${salvo.id}/editar?competencia=2026-05&modo=visualizar`,
  );
  const atualizado = JSON.parse(
    localStorage.getItem("sigep:grupos-calculo:competencias:v1")!,
  );
  expect(
    atualizado["2026-05"].grupos.find((g: { id: number }) => g.id === salvo.id)
      ?.pesosAplicados,
  ).toEqual({ versao: 2, total: 4 });
});
