// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { V2MatrixEditor } from "./V2Fields";

afterEach(cleanup);

it("exibe nível 001 e classe A para matriz de uma célula já cadastrada", () => {
  const matrix = { columns: ["Valor"], rows: [{ name: "Fixo", values: ["R$ 5.000,00"] }] };
  render(<V2MatrixEditor matrix={matrix} readOnly />);
  const table = screen.getByRole("table");
  expect([...table.querySelectorAll("thead th")].map((cell) => cell.textContent)).toEqual(["Nível / Classe", "A"]);
  expect(table.querySelector("tbody th")?.textContent).toBe("001");
  expect(screen.getByText("R$ 5.000,00")).toBeTruthy();
});

it("mantém nível 001 e classe A ao editar o único valor", () => {
  const onChange = vi.fn();
  render(<V2MatrixEditor matrix={{ columns: ["Valor"], rows: [{ name: "Fixo", values: ["R$ 5.000,00"] }] }} onChange={onChange} />);
  expect((screen.getByRole("textbox", { name: "Nível 1" }) as HTMLInputElement).value).toBe("001");
  expect((screen.getByRole("textbox", { name: "Classe 1" }) as HTMLInputElement).value).toBe("A");
  fireEvent.change(screen.getByRole("textbox", { name: "001 / A" }), { target: { value: "5200,00" } });
  expect(onChange).toHaveBeenCalledWith({ columns: ["A"], rows: [{ name: "001", values: ["5200,00"] }] });
});
