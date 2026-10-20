// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  FolhaPaginaInicialPage,
  FolhaAvisosPage,
  FolhaCronogramaConsultaPage,
} from "./FolhaPaginaInicialPage";
import {
  FOLHA_PAGINA_INICIAL_PATH,
  FOLHA_AVISOS_PATH,
  FOLHA_CALENDARIO_PATH,
  acessosPaginaInicialFolha,
} from "./folhaModel";
import { menuFolha, menuGestaoPessoas } from "../PrototiposPage";
import { funcionalidades, menuDisponivel } from "./model";

afterEach(() => {
  cleanup();
  localStorage.clear();
});
function montar() {
  render(
    <MemoryRouter initialEntries={[FOLHA_PAGINA_INICIAL_PATH]}>
      <Routes>
        <Route
          path={FOLHA_PAGINA_INICIAL_PATH}
          element={<FolhaPaginaInicialPage />}
        />
        <Route path={FOLHA_AVISOS_PATH} element={<FolhaAvisosPage />} />
        <Route
          path={FOLHA_CALENDARIO_PATH}
          element={<FolhaCronogramaConsultaPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}
function acessos() {
  return within(
    screen.getByRole("region", { name: "Acesso rápido" }),
  ).getAllByRole("link");
}

it("exibe o modelo da página inicial com somente acessos da Folha e menu próprio", () => {
  montar();
  expect(screen.getByRole("heading", { name: "Olá, Roberto!" })).toBeTruthy();
  expect(
    screen.getByRole("heading", { name: "Avisos importantes" }),
  ).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Cronograma" })).toBeTruthy();
  expect(document.querySelector("time")?.textContent).toContain(
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeZone: "America/Cuiaba",
    }).format(new Date()),
  );
  expect(
    screen.getByRole("navigation", { name: "Menu principal do SIGEP" }),
  ).toBeTruthy();
  expect(menuFolha[0]).toMatchObject({
    label: "Página Inicial",
    to: FOLHA_PAGINA_INICIAL_PATH,
  });
  const rotas = funcionalidades(menuDisponivel(menuFolha));
  expect(acessos()).toHaveLength(acessosPaginaInicialFolha.length);
  for (const link of acessos())
    expect(rotas.some((r) => link.getAttribute("href") === r.caminho)).toBe(
      true,
    );
  expect(screen.queryByRole("heading", { name: "Pessoas" })).toBeNull();
  expect(menuGestaoPessoas[0].to).toBe("/prototipos/sigep/pagina-inicial");
});
it("abre avisos e retorna à página inicial mantendo o contexto da Folha", () => {
  montar();
  const link = screen.getByRole("link", { name: "Ver detalhes" });
  expect(link.getAttribute("href")).toBe(FOLHA_AVISOS_PATH);
  fireEvent.click(link);
  expect(
    screen.getByRole("heading", { name: "Avisos importantes" }),
  ).toBeTruthy();
  expect(
    screen
      .getAllByRole("link", { name: "Página Inicial" })
      .every((l) => l.getAttribute("href") === FOLHA_PAGINA_INICIAL_PATH),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
  expect(screen.getByRole("heading", { name: "Olá, Roberto!" })).toBeTruthy();
});
it("abre a consulta de cronograma da Folha sem acessar a configuração ou trocar de módulo", () => {
  montar();
  const link = screen.getByRole("link", { name: "Cronograma — Ver detalhes" });
  expect(link.getAttribute("href")).toBe(FOLHA_CALENDARIO_PATH);
  fireEvent.click(link);
  expect(screen.getByRole("heading", { name: "Cronograma da Folha" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Salvar" })).toBeNull();
  expect(
    screen
      .getAllByRole("link", { name: "Página Inicial" })
      .every((l) => l.getAttribute("href") === FOLHA_PAGINA_INICIAL_PATH),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
  expect(screen.getByRole("heading", { name: "Olá, Roberto!" })).toBeTruthy();
});
it("prioriza favoritos da Folha sem navegar nem inserir cards de Gestão de Pessoas", () => {
  montar();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Adicionar aos favoritos: Ficha Financeira",
    }),
  );
  expect(acessos()[0].getAttribute("aria-label")).toBe(
    "Acessar Ficha Financeira",
  );
  expect(screen.getByRole("heading", { name: "Olá, Roberto!" })).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Remover dos favoritos: Ficha Financeira",
    }),
  );
  expect(acessos()[0].getAttribute("aria-label")).toBe(
    "Acessar Painel Informativo",
  );
});
