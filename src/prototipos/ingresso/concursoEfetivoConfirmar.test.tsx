// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PrototiposNovoIngressoPage } from "../PrototiposPage";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ "1": "Aguardando Analise" }));
  localStorage.setItem("prototype-analise-provimento-rascunho-1", JSON.stringify({ campos: {}, dataEfetivoExercicio: "2026-02-12" }));
});
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

it("habilita Confirmar no Efetivo Exercício do concurso com dados completos", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Concurso&concurso=Concurso%20SES%202026&candidato=1&orgao=SES&etapa=efetivo-exercicio"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.change(screen.getByRole("combobox", { name: /Servidor compareceu/ }), { target: { value: "Sim" } });
  fireEvent.change(screen.getByRole("combobox", { name: /Setor\/Lotação/ }), { target: { value: "Unidade Central" } });
  const confirmar = screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement;
  expect(confirmar.disabled).toBe(false);
  fireEvent.click(confirmar);
  expect(screen.getByText("Efetivo Exercício registrado")).toBeTruthy();
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["1"]).toBe("Aguardando Termo Assinado");
});
