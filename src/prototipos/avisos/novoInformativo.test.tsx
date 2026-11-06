// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NovoInformativoModal } from "./NovoInformativoModal";
import { atualizarInformativosPaginaInicial, informativosIniciais, listarInformativosPaginaInicial } from "../paginaInicial/informativos";
afterEach(() => { cleanup(); atualizarInformativosPaginaInicial(informativosIniciais); });
it("adiciona um comunicado com título, texto e ícone selecionado à fonte compartilhada", () => {
  const adicionado = vi.fn();
  render(<NovoInformativoModal fechar={vi.fn()} adicionado={adicionado} />);
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: " Novo aviso " } });
  fireEvent.change(screen.getByLabelText("Texto"), { target: { value: " Texto do comunicado " } });
  fireEvent.click(screen.getByRole("button", { name: "Atualização" }));
  fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
  expect(listarInformativosPaginaInicial()[0]).toMatchObject({ titulo: "Novo aviso", texto: "Texto do comunicado", icon: "pi pi-refresh", destaque: "is-update" });
  expect(listarInformativosPaginaInicial()).toHaveLength(informativosIniciais.length + 1);
  expect(adicionado).toHaveBeenCalledOnce();
});
it("cancela sem adicionar um comunicado", () => {
  const fechar = vi.fn();
  render(<NovoInformativoModal fechar={fechar} adicionado={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(fechar).toHaveBeenCalledOnce();
  expect(listarInformativosPaginaInicial()).toHaveLength(informativosIniciais.length);
});

it("salva o conteúdo do documento opcional junto do comunicado", async () => {
  render(<NovoInformativoModal fechar={vi.fn()} adicionado={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Aviso com documento" } });
  fireEvent.change(screen.getByLabelText("Texto"), { target: { value: "Consulte o anexo" } });
  fireEvent.change(screen.getByLabelText("Documentos (opcional)"), { target: { files: [new File(["conteudo"], "aviso.pdf", { type: "application/pdf" })] } });
  await waitFor(() => expect(screen.getByRole("button", { name: "Remover aviso.pdf" })).toBeTruthy());
  fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
  expect(listarInformativosPaginaInicial()[0].documentos?.[0]).toMatchObject({ nome: "aviso.pdf", contentType: "application/pdf", conteudoEmBase64: btoa("conteudo") });
});

it("rejeita documentos acima de 2 MB", async () => {
  render(<NovoInformativoModal fechar={vi.fn()} adicionado={vi.fn()} />);
  const arquivo = new File([new Uint8Array(2_000_001)], "grande.pdf", { type: "application/pdf" });
  fireEvent.change(screen.getByLabelText("Documentos (opcional)"), { target: { files: [arquivo] } });
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("2 MB"));
  expect(screen.queryByRole("button", { name: "Remover grande.pdf" })).toBeNull();
});
