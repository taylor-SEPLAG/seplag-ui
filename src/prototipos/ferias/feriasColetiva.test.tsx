// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { FormularioColetiva } from "./FeriasPages";
import type { FeriasRegistro } from './FeriasPages';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it("mantém a grade coletiva distinta da grade de seleção do lote", () => {
  const { rerender } = render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} />);

  expect(screen.getByText("Corpo docente da coletiva")).toBeTruthy();
  expect(screen.getByRole("columnheader", { name: "Situação de validação" })).toBeTruthy();
  expect(screen.getAllByText(/Saldo de 30 dias em escola/).length).toBeGreaterThan(0);
  // Apoio/gestão (público do Lote) nunca aparece na grade da Coletiva — exclusiva de professor.
  expect(screen.queryByText("Ana Lúcia Ferreira")).toBeNull();
  // Professor com cargo de gestão também nunca aparece na Coletiva (CA01) — é exclusão da
  // listagem, não um erro de linha.
  expect(screen.queryByText("Elisângela Rocha")).toBeNull();

  rerender(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} modoAgendamentoLote />);

  expect(screen.getByText("Servidores do lote (gestão/apoio)")).toBeTruthy();
  // Cargo "Professor" (ex.: Elisângela Rocha) é exclusivo da Coletiva — não aparece no Lote.
  expect(screen.queryByText("Elisângela Rocha")).toBeNull();
  const apoioComSaldoInvalido = screen.getByText("Ana Lúcia Ferreira").closest("tr");
  expect(apoioComSaldoInvalido).toBeTruthy();
  expect((within(apoioComSaldoInvalido as HTMLTableRowElement).getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
  expect(screen.getByRole("columnheader", { name: "Situação de validação" })).toBeTruthy();
  expect(screen.getAllByRole("columnheader").map((header) => header.textContent?.trim())).toEqual([
    "",
    "Servidor",
    "Vínculo",
    "Cargo / Função",
    "Lotação",
    "Situação",
    "Saldo",
    "Situação de validação",
  ]);
});

it("separa alertas da situação de lotação na grade do lote", () => {
  render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} modoAgendamentoLote />);

  // Apoio/gestão não tem direito aos 45 dias (benefício exclusivo de professor) — erro bloqueante.
  const alerta = screen.getByText(/Saldo de 45 dias não se aplica a cargo de gestão\/apoio/);
  const linha = alerta.closest("tr");
  expect(linha).toBeTruthy();

  const celulas = within(linha as HTMLTableRowElement).getAllByRole("cell");
  expect(celulas[5].textContent).toBe("Em escola");
  expect(celulas[7].textContent).toContain("Saldo de 45 dias não se aplica");
});

it("permite usufruto antecipado com portaria obrigatória na UNEMAT", async () => {
  const onSalvar = vi.fn();
  render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={onSalvar} modoAgendamentoLote />);

  fireEvent.change(screen.getByLabelText("Perfil de demonstração *"), {
    target: { value: "GESTAO_UNEMAT" },
  });

  expect(screen.getAllByText("Todos (todas as unidades)").length).toBeGreaterThan(0);
  expect(screen.getByText(/Regra UNEMAT:/)).toBeTruthy();
  // Apoio/gestão não tem direito aos 45 dias — na UNEMAT o saldo varia (10 a 30) e fica "a confirmar".
  expect(screen.getAllByText(/30 dias · a confirmar/).length).toBeGreaterThan(0);

  const primeiraLinha = screen.getAllByRole("row")[1];
  expect(within(primeiraLinha).getByRole("checkbox").hasAttribute("disabled")).toBe(false);

  fireEvent.click(screen.getByRole("tab", { name: /Parcelas & Alertas/ }));
  fireEvent.click(screen.getByRole("checkbox", { name: /30 dias/ }));
  fireEvent.click(screen.getByRole("button", { name: "Lançar Férias Coletivas do Lote" }));
  expect(onSalvar).not.toHaveBeenCalled();
  expect(screen.getByText('Anexe a Portaria da Escala de Férias.')).toBeTruthy();
  fireEvent.change(screen.getByLabelText(/Portaria da Escala de Férias/),{target:{files:[new File(['portaria'],'portaria.pdf',{type:'application/pdf'})]}});
  await waitFor(() => expect(screen.queryByText('Armazenando documento...')).toBeNull());
  fireEvent.click(screen.getByRole("button", { name: "Lançar Férias Coletivas do Lote" }));

  expect(onSalvar).toHaveBeenCalledTimes(1);
  const registros = onSalvar.mock.calls[0][0] as FeriasRegistro[];
  expect(registros.length).toBeGreaterThan(1);
  expect(registros.every((registro) =>
    registro.regraAquisitivo === "USUFRUTO_ANTECIPADO" && registro.saldoFeriasConfirmado === false,
  )).toBe(true);
  expect(new Set(registros.map((registro) => registro.setor)).size).toBeGreaterThan(1);
});

it("desabilita inconsistências SEDUC e mantém decisão individual para LTS", () => {
  render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} modoAgendamentoLote />);

  const saldoInconsistente = screen.getAllByText(/Saldo de 45 dias não se aplica a cargo de gestão\/apoio/)[0].closest("tr");
  expect(saldoInconsistente).toBeTruthy();
  expect(within(saldoInconsistente as HTMLTableRowElement).getByRole("checkbox").hasAttribute("disabled")).toBe(true);

  const lts = screen.getByText("Juliana Barbosa Moraes").closest("tr");
  expect(lts).toBeTruthy();
  const ltsCheckbox = within(lts as HTMLTableRowElement).getByRole("checkbox") as HTMLInputElement;
  expect(ltsCheckbox.disabled).toBe(false);
  expect(ltsCheckbox.checked).toBe(false);
});

it("mantém visíveis e desabilitados os professores com bloqueios cadastrais", () => {
  render(<FormularioColetiva onCancelar={vi.fn()} onSalvar={vi.fn()} modoAgendamentoLote />);

  const bloqueios = [
    /Saldo de 45 dias não se aplica a cargo de gestão\/apoio/,
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
