// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { AvisosPage } from "./AvisosPage";

vi.mock("../PrototiposPage", () => ({
  menuGestaoPessoas: [
    {
      label: "Painel Informativo",
      icon: "pi pi-home",
      to: "/painel",
      permissionKeys: ["painel"],
    },
  ],
  PrototypeSystemPage: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
afterEach(() => {
  cleanup();
  localStorage.removeItem("permissions");
});

it("impede a consulta direta quando o usuário não tem acesso ao Painel", () => {
  localStorage.setItem("permissions", JSON.stringify([]));
  render(
    <MemoryRouter>
      <AvisosPage />
    </MemoryRouter>,
  );
  expect(screen.getByRole("alert").textContent).toContain(
    "não possui permissão",
  );
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(screen.queryByLabelText("Buscar comunicado")).toBeNull();
});

it("permite a consulta com as mesmas permissões do Painel Informativo", () => {
  localStorage.setItem("permissions", JSON.stringify(["painel"]));
  render(
    <MemoryRouter>
      <AvisosPage />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "Avisos importantes" }),
  ).toBeTruthy();
  expect(screen.getAllByRole("article")).toHaveLength(3);
});
