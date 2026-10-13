// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CadastroGeralContent } from "./CadastroGeralContent";
import { estiloCorModulo } from "../coresModulos";
import { modulosPaginaInicial } from "../paginaInicial/model";

afterEach(cleanup);

it("todos os módulos da Página Inicial possuem token cromático compartilhado", () => {
  expect(modulosPaginaInicial).toHaveLength(14);
  for (const modulo of modulosPaginaInicial) {
    expect(estiloCorModulo(modulo.nome)).toHaveProperty("--sigep-cor-modulo");
  }
  expect(estiloCorModulo("Pessoas")).toEqual({
    "--sigep-cor-modulo": "var(--sigep-modulo-pessoas)",
  });
  expect(estiloCorModulo("Documentação")).toEqual({
    "--sigep-cor-modulo": "var(--sigep-modulo-documentacao)",
  });
});

it("Cadastro mantém ordem, descrições, ícones e destinos existentes com a paleta compartilhada", () => {
  render(
    <MemoryRouter>
      <CadastroGeralContent />
    </MemoryRouter>,
  );
  const cards = screen.getAllByRole("link");
  expect(cards).toHaveLength(10);
  expect(cards[0].querySelector("h2")?.textContent).toBe("Pessoas");
  expect(cards[0].getAttribute("href")).toBe(
    "/prototipos/sigep/pessoas/327305/vinculos",
  );
  expect(cards[0].querySelector("p")?.textContent).toBe(
    "Consulte e mantenha os dados cadastrais das pessoas.",
  );
  expect(cards[0].querySelector("i")?.className).toBe("pi pi-users");
  for (const card of cards) {
    const titulo = card.querySelector("h2")?.textContent ?? "";
    expect(card.style.getPropertyValue("--sigep-cor-modulo")).toBe(
      (estiloCorModulo(titulo) as Record<string, string>)["--sigep-cor-modulo"],
    );
  }
});
