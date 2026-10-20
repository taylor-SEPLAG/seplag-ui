// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { FolhaAreaPage } from "./FolhaAreaPage";
import {
  areasNavegacaoFolha,
  type AreaNavegacaoFolha,
} from "./folhaNavigation";
import { menuFolha } from "../PrototiposPage";
import { FolhaPaginaInicialPage } from "../paginaInicial/FolhaPaginaInicialPage";
import { FOLHA_PAGINA_INICIAL_PATH } from "../paginaInicial/folhaModel";

afterEach(() => {
  cleanup();
  localStorage.clear();
});
function montar(rota = FOLHA_PAGINA_INICIAL_PATH) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route
          path={FOLHA_PAGINA_INICIAL_PATH}
          element={<FolhaPaginaInicialPage />}
        />
        {(Object.keys(areasNavegacaoFolha) as AreaNavegacaoFolha[]).map(
          (area) => (
            <Route
              key={area}
              path={areasNavegacaoFolha[area].rota}
              element={<FolhaAreaPage area={area} />}
            />
          ),
        )}
        <Route
          path="/prototipos/folha/catalogo-rubricas"
          element={<h1>Consulta de Rubricas preservada</h1>}
        />
        <Route
          path="/prototipos/folha/penhora-judicial"
          element={<h1>Consulta de Penhoras preservada</h1>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

it.each(Object.keys(areasNavegacaoFolha) as AreaNavegacaoFolha[])(
  "abre os cards dos submenus em %s",
  (area) => {
    const config = areasNavegacaoFolha[area];
    montar(config.rota);
    expect(
      screen.getByRole("heading", { level: 1, name: config.nome }),
    ).toBeTruthy();
    const cards = within(
      screen.getByRole("region", { name: `Áreas de ${config.nome}` }),
    );
    const grupo = [
      ...menuFolha,
      ...menuFolha.flatMap((m) => m.items ?? []),
    ].find((m) => m.label === config.nome)!;
    expect(grupo.to).toBe(config.rota);
    for (const filho of grupo.items ?? []) {
      expect(cards.getByRole("heading", { name: filho.label! })).toBeTruthy();
      if (filho.to)
        expect(
          cards
            .getByRole("link", { name: `Acessar ${filho.label}` })
            .getAttribute("href"),
        ).toBe(filho.to);
      else
        expect(
          cards
            .getByRole("heading", { name: filho.label! })
            .closest("article")
            ?.getAttribute("aria-disabled"),
        ).toBe("true");
    }
  },
);
it("clicar em Rubricas abre o agrupador; clicar no card abre a consulta existente", () => {
  montar();
  fireEvent.click(screen.getByRole("link", { name: "Rubricas" }));
  expect(
    screen.getByRole("heading", { level: 1, name: "Rubricas" }),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("heading", { name: "Solicitação de Rubrica" })
      .closest("article")?.textContent,
  ).toContain("Em definição");
  fireEvent.click(
    screen.getByRole("link", { name: "Acessar Catálogo de Rubricas" }),
  );
  expect(
    screen.getByRole("heading", { name: "Consulta de Rubricas preservada" }),
  ).toBeTruthy();
});
it("permite navegar pelos cards de Retenções Judiciais até Penhora Judicial", () => {
  montar(areasNavegacaoFolha.financeiro.rota);
  fireEvent.click(
    screen.getByRole("link", { name: "Acessar Retenções Judiciais" }),
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "Retenções Judiciais" }),
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("link", { name: "Acessar Penhora Judicial" }),
  );
  expect(
    screen.getByRole("heading", { name: "Consulta de Penhoras preservada" }),
  ).toBeTruthy();
});
