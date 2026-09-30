// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PrototiposNovoIngressoPage } from "../PrototiposPage";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });
it.each(["Concurso", "Processo Seletivo", "Exclusivo Comissionado"])("valida os documentos de decisão judicial no ingresso %s", (type) => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=" + encodeURIComponent(type)]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText(/^Decisão Judicial/), { target: { value: "Sim" } });
  const input = screen.getByLabelText("Anexar documento da decisão judicial") as HTMLInputElement;
  expect(input.accept).toBe(".pdf,.doc,.docx");
  expect(screen.getByText("Formatos aceitos: PDF, DOC, DOCX (Máx. 2MB)")).toBeTruthy();
  const pdf = new File([new Uint8Array(2 * 1024 * 1024)], "decisao.PDF", { type: "application/pdf" });
  fireEvent.change(input, { target: { files: [pdf] } });
  expect(screen.getByText(pdf.name, { selector: "strong" })).toBeTruthy();
  const doc = new File(["documento"], "decisao.doc", { type: "application/msword" });
  fireEvent.change(input, { target: { files: [doc] } });
  expect(screen.getByText(doc.name, { selector: "strong" })).toBeTruthy();
  const docx = new File(["documento"], "decisao.DOCX");
  fireEvent.drop(input.nextElementSibling!, { dataTransfer: { files: [docx] } });
  expect(screen.getByText(docx.name, { selector: "strong" })).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  fireEvent.change(input, { target: { files: [new File(["imagem"], "decisao.jpg", { type: "image/jpeg" })] } });
  expect(screen.getByRole("alert").textContent).toContain("PDF, DOC ou DOCX");
  fireEvent.drop(input.nextElementSibling!, { dataTransfer: { files: [new File([new Uint8Array(2 * 1024 * 1024 + 1)], "grande.pdf", { type: "application/pdf" })] } });
  expect(screen.getByRole("alert").textContent).toContain("2 MB");
  expect(screen.getByText(docx.name, { selector: "strong" })).toBeTruthy();
  expect(screen.queryByText("grande.pdf", { selector: "strong" })).toBeNull();
});
