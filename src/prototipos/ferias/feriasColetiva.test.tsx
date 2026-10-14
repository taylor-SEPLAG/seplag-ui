// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { FormularioColetiva } from "./FeriasPages";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it("mantém a grade coletiva distinta da grade de seleção do lote", () => {
  const { rerender } = render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} />);

  expect(screen.getByText("Corpo docente da coletiva")).toBeTruthy();
  expect(screen.getByRole("columnheader", { name: "Situação de validação" })).toBeTruthy();
  expect(screen.getAllByText(/Saldo de 30 dias em escola/).length).toBeGreaterThan(0);
  expect(screen.queryByText("Ana Lúcia Ferreira")).toBeNull();
  const gestoraColetiva = screen.getByText("Elisângela Rocha").closest("tr");
  expect(gestoraColetiva).toBeTruthy();
  expect((within(gestoraColetiva as HTMLTableRowElement).getByRole("checkbox") as HTMLInputElement).disabled).toBe(false);

  rerender(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} modoAgendamentoLote />);

  expect(screen.getByText("Corpo docente do lote")).toBeTruthy();
  expect(screen.queryByText("Ana Lúcia Ferreira")).toBeNull();
  const gestoraLote = screen.getByText("Elisângela Rocha").closest("tr");
  expect(gestoraLote).toBeTruthy();
  expect((within(gestoraLote as HTMLTableRowElement).getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
  expect(screen.getByRole("columnheader", { name: "Alertas" })).toBeTruthy();
  expect(screen.getAllByRole("columnheader").map((header) => header.textContent?.trim())).toEqual([
    "",
    "Servidor",
    "Vínculo",
    "Cargo / Função",
    "Lotação",
    "Situação",
    "Alertas",
    "Saldo",
  ]);
});

it("separa alertas da situação de lotação na grade do lote", () => {
  render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} modoAgendamentoLote />);

  const alerta = screen.getByText(/Servidor cedido — excluído do lote/);
  const linha = alerta.closest("tr");
  expect(linha).toBeTruthy();

  const celulas = within(linha as HTMLTableRowElement).getAllByRole("cell");
  expect(celulas[5].textContent).toBe("Em escola");
  expect(celulas[6].textContent).toContain("Servidor cedido");
  expect(celulas[6].textContent).toContain("Saldo de 30 dias em escola");
});

it("permite usufruto antecipado sem bloquear saldo não confirmado na UNEMAT", () => {
  const onSalvar = vi.fn();
  render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={onSalvar} modoAgendamentoLote />);

  fireEvent.change(screen.getByLabelText("Perfil de demonstração *"), {
    target: { value: "GESTAO_UNEMAT" },
  });

  expect(screen.getByText("Todos os professores da UNEMAT — todas as lotações")).toBeTruthy();
  expect(screen.getByText(/Regra UNEMAT:/)).toBeTruthy();
  expect(screen.getAllByText(/45 dias · a confirmar/).length).toBeGreaterThan(0);

  const primeiraLinha = screen.getAllByRole("row")[1];
  expect(within(primeiraLinha).getByRole("checkbox").hasAttribute("disabled")).toBe(false);

  fireEvent.click(screen.getByRole("tab", { name: /Parcelas & Alertas/ }));
  fireEvent.click(screen.getByRole("checkbox", { name: /Julho \(15 dias\)/ }));
  fireEvent.click(screen.getByRole("button", { name: "Lançar Férias Coletivas do Lote" }));

  expect(onSalvar).toHaveBeenCalledTimes(1);
  const registros = onSalvar.mock.calls[0][0];
  expect(registros.length).toBeGreaterThan(1);
  expect(registros.every((registro) =>
    registro.regraAquisitivo === "USUFRUTO_ANTECIPADO" && registro.saldoFeriasConfirmado === false,
  )).toBe(true);
  expect(new Set(registros.map((registro) => registro.setor)).size).toBeGreaterThan(1);
});

it("desabilita inconsistências SEDUC e mantém decisão individual para LTS", () => {
  render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} modoAgendamentoLote />);

  const saldoInconsistente = screen.getAllByText(/Saldo de 30 dias em escola/)[0].closest("tr");
  expect(saldoInconsistente).toBeTruthy();
  expect(within(saldoInconsistente as HTMLTableRowElement).getByRole("checkbox").hasAttribute("disabled")).toBe(true);

  const lts = screen.getByText("Lívia Rodrigues Martins").closest("tr");
  expect(lts).toBeTruthy();
  const ltsCheckbox = within(lts as HTMLTableRowElement).getByRole("checkbox") as HTMLInputElement;
  expect(ltsCheckbox.disabled).toBe(false);
  expect(ltsCheckbox.checked).toBe(false);
});

it("mantém visíveis e desabilitados os professores com bloqueios cadastrais", () => {
  render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} modoAgendamentoLote />);

  const bloqueios = [
    /Servidor cedido/,
    /Cargo de gestão/,
    /Fora de unidade escolar/,
    /Vínculo encerrado/,
    /Já possui férias no período/,
  ];

  bloqueios.forEach((motivo) => {
    const alerta = screen.getByText(motivo);
    const linha = alerta.closest("tr");
    expect(linha).toBeTruthy();
    expect((within(linha as HTMLTableRowElement).getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
  });

  cleanup();
  render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} />);

  const contratoSemAquisitivo = screen.getByText(/Contrato temporário sem período aquisitivo fechado/);
  const linhaTemporario = contratoSemAquisitivo.closest("tr");
  expect(linhaTemporario).toBeTruthy();
  expect((within(linhaTemporario as HTMLTableRowElement).getByRole("checkbox") as HTMLInputElement).disabled).toBe(false);
});
