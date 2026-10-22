// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GestaoLicencasContent } from "./GestaoLicencasPage";
import { registrosLicencas } from "./model";
import { STORAGE_SOLICITACOES } from "./solicitacaoModel";

afterEach(() => { cleanup(); localStorage.clear(); });
it("abre o histórico do registro selecionado com alterações salvas em ordem e anexo", async () => {
  const registro = registrosLicencas[0];
  const documento = { nome: "comprovante.pdf", extensao: "pdf", contentType: "application/pdf", conteudoEmBase64: "YQ==", tamanho: 1024 };
  localStorage.setItem(STORAGE_SOLICITACOES, JSON.stringify([{ ...registro, alteracoes: [
    { justificativa: "Primeira justificativa", documento, data: "2026-10-21T12:00:00Z" },
    { justificativa: "Justificativa mais recente", documento, data: "2026-10-22T13:00:00Z" },
  ] }]));
  render(<MemoryRouter><GestaoLicencasContent /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: `Ações de ${registro.nome}` }));
  fireEvent.click(await screen.findByText("Histórico"));
  const modal = within(await screen.findByRole("dialog", { name: "Histórico de Lançamento" }));
  expect(modal.getByText(registro.nome)).toBeTruthy();
  expect(modal.getByText(registro.matricula)).toBeTruthy();
  const eventos = modal.getAllByRole("listitem");
  expect(eventos[0].textContent).toContain("Justificativa mais recente");
  expect(eventos[1].textContent).toContain("Primeira justificativa");
  expect(eventos[2].textContent).toContain("Lançamento Original");
  expect(modal.getAllByRole("button", { name: /comprovante.pdf/ })).toHaveLength(2);
  expect(modal.queryByText(registrosLicencas[1].nome)).toBeNull();
  fireEvent.click(modal.getByRole("button", { name: "Close" }));
});
it("exibe somente o lançamento original quando não existem alterações", async () => {
  const registro = registrosLicencas[1];
  render(<MemoryRouter><GestaoLicencasContent registros={[registro]} /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: `Ações de ${registro.nome}` }));
  fireEvent.click(await screen.findByText("Histórico"));
  const modal = within(await screen.findByRole("dialog", { name: "Histórico de Lançamento" }));
  expect(modal.getAllByRole("listitem")).toHaveLength(1);
  expect(modal.getByText("19/10/2026, 15:10")).toBeTruthy();
  expect(modal.queryByText("Edição de Dados")).toBeNull();
});
