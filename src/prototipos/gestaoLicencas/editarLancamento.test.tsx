// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GestaoLicencasContent } from "./GestaoLicencasPage";
import { registrosLicencas } from "./model";
import { carregarSolicitacoes } from "./solicitacaoModel";

afterEach(() => { cleanup(); localStorage.clear(); });
it("abre a justificativa ao editar e salva o motivo com o documento do registro", async () => {
  const registro = registrosLicencas[0];
  render(<MemoryRouter><GestaoLicencasContent registros={[registro]} /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: `Ações de ${registro.nome}` }));
  fireEvent.click(await screen.findByText("Editar"));
  const modal = await screen.findByRole("dialog", { name: "Editar Lançamento" });
  expect(modal.textContent).toContain(registro.nome);
  fireEvent.change(screen.getByLabelText(/Justificativa/), { target: { value: "Correção solicitada pelo servidor" } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(screen.getByRole("alert").textContent).toContain("anexe o documento");
  fireEvent.change(screen.getByLabelText(/Documento comprobatório/), {
    target: { files: [new File(["documento"], "comprovante.pdf", { type: "application/pdf" })] },
  });
  await screen.findByText("comprovante.pdf");
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  const salvo = carregarSolicitacoes().find((item) => item.id === registro.id)!;
  expect(salvo.alteracoes?.[0].justificativa).toBe("Correção solicitada pelo servidor");
  expect(salvo.alteracoes?.[0].documento.nome).toBe("comprovante.pdf");
  expect(salvo.inicio).toBe(registro.inicio);
});
