// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PrototiposTipoVinculoTestePage } from "../PrototiposPage";
import { TIPOS_VINCULO } from "./tiposVinculo";

afterEach(cleanup);

it("navega entre as duas páginas, mostra todos os tipos e reinicia a página ao filtrar", () => {
  const { container } = render(<MemoryRouter><PrototiposTipoVinculoTestePage /></MemoryRouter>);
  const tabela = screen.getByRole("table");
  TIPOS_VINCULO.slice(0, 10).forEach((nome) => expect(within(tabela).getByRole("cell", { name: nome })).toBeTruthy());
  expect(within(tabela).queryByRole("cell", { name: TIPOS_VINCULO[10] })).toBeNull();
  const paginador = container.querySelector(".p-paginator") as HTMLElement;
  fireEvent.click(within(paginador).getByText("2", { selector: "button" }));
  TIPOS_VINCULO.slice(10).forEach((nome) => expect(within(tabela).getByRole("cell", { name: nome })).toBeTruthy());
  expect(within(tabela).queryByRole("cell", { name: TIPOS_VINCULO[0] })).toBeNull();
  fireEvent.click(container.querySelector(".p-paginator-first") as HTMLElement);
  expect(within(tabela).getByRole("cell", { name: TIPOS_VINCULO[0] })).toBeTruthy();
  fireEvent.click(container.querySelector(".p-paginator-next") as HTMLElement);
  expect(within(tabela).getByRole("cell", { name: TIPOS_VINCULO[10] })).toBeTruthy();
  fireEvent.change(screen.getByPlaceholderText("Informe o código ou o nome"), { target: { value: "Nomeado Efetivo" } });
  expect(within(tabela).getByRole("cell", { name: "Nomeado Efetivo" })).toBeTruthy();
  expect(within(tabela).queryByRole("cell", { name: TIPOS_VINCULO[10] })).toBeNull();
  fireEvent.change(screen.getByPlaceholderText("Informe o código ou o nome"), { target: { value: "" } });
  expect(within(tabela).getByRole("cell", { name: TIPOS_VINCULO[0] })).toBeTruthy();
  fireEvent.click(container.querySelector(".p-paginator-last") as HTMLElement);
  expect(within(tabela).getByRole("cell", { name: TIPOS_VINCULO[19] })).toBeTruthy();
});
