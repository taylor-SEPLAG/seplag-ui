// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormularioRecesso } from "./FeriasPages";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
});

it("usa os campos padrão do formulário individual e bloqueia etapa sem antecedência mínima", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 15, 12));
  render(<FormularioRecesso onCancelar={vi.fn()} onSalvar={vi.fn()} />);

  fireEvent.change(screen.getByLabelText("Buscar Servidor (Matrícula, CPF ou Nome)"), {
    target: { value: "310021" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Buscar servidor" }));

  expect(screen.getByText("Duração desta parcela")).toBeTruthy();
  const inicioEtapa = screen.getByPlaceholderText("dd/mm/aaaa") as HTMLInputElement;
  fireEvent.change(inicioEtapa, { target: { value: "16/10/2026" } });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar esta etapa" }));

  expect(screen.getByText("Informe a data de início desta etapa.")).toBeTruthy();
  expect(screen.queryByText(/16\/10\/2026 a/)).toBeNull();
});

it("oferece ao residente somente as durações dos parcelamentos permitidos", () => {
  render(<FormularioRecesso onCancelar={vi.fn()} onSalvar={vi.fn()} />);

  fireEvent.change(screen.getByLabelText("Buscar Servidor (Matrícula, CPF ou Nome)"), {
    target: { value: "310021" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Buscar servidor" }));

  const dropdown = document.querySelector(".prototype-ferias-gozo-grid .p-dropdown");
  expect(dropdown).toBeTruthy();
  fireEvent.click(dropdown as Element);

  expect(Array.from(document.querySelectorAll(".p-dropdown-panel .p-dropdown-item"), (option) => option.textContent?.trim())).toEqual([
    "Integral (30 dias)",
    "Parcela (20 dias)",
    "Parcela (15 dias)",
    "Parcela (10 dias)",
  ]);
});

it("permite agendar 20 dias primeiro e os 10 dias restantes como segunda parcela", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2027, 2, 1, 12));
  const onSalvar = vi.fn();
  render(<FormularioRecesso onCancelar={vi.fn()} onSalvar={onSalvar} />);

  fireEvent.change(screen.getByLabelText("Buscar Servidor (Matrícula, CPF ou Nome)"), {
    target: { value: "310021" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Buscar servidor" }));

  const dropdown = document.querySelector(".prototype-ferias-gozo-grid .p-dropdown");
  expect(dropdown).toBeTruthy();
  fireEvent.click(dropdown as Element);
  fireEvent.click(screen.getByText("Parcela (20 dias)"));
  fireEvent.input(screen.getByPlaceholderText("dd/mm/aaaa"), { target: { value: "01/05/2027" } });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar esta etapa" }));

  expect(screen.getByText(/20 de 30 dias parcelados/)).toBeTruthy();
  fireEvent.click(dropdown as Element);
  expect(Array.from(document.querySelectorAll(".p-dropdown-panel .p-dropdown-item"), (option) => option.textContent?.trim())).toEqual([
    "Parcela (10 dias)",
  ]);

  fireEvent.input(screen.getByPlaceholderText("dd/mm/aaaa"), { target: { value: "01/07/2027" } });
  fireEvent.click(screen.getByRole("button", { name: "Adicionar esta etapa" }));
  expect(screen.getByText(/30 de 30 dias parcelados/)).toBeTruthy();

  vi.useRealTimers();
  fireEvent.change(screen.getByLabelText(/Documento \/ despacho formal do recesso/), {
    target: { files: [new File(["despacho"], "despacho.pdf", { type: "application/pdf" })] },
  });
  await waitFor(() => expect(screen.getByText("despacho.pdf")).toBeTruthy());

  fireEvent.click(screen.getByRole("button", { name: "Salvar solicitação" }));
  expect(onSalvar).toHaveBeenCalledWith(expect.objectContaining({
    parcelas: expect.arrayContaining([
      expect.objectContaining({ dias: 20, inicio: "2027-05-01" }),
      expect.objectContaining({ dias: 10, inicio: "2027-07-01" }),
    ]),
  }));
});
