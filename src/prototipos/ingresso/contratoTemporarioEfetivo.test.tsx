// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PrototiposNovoIngressoPage } from "../PrototiposPage";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ "71": "Aguardando Efetivo Exercicio" }));
  localStorage.setItem("prototype-analise-provimento-rascunho-71", JSON.stringify({ campos: {}, dataEfetivoExercicio: "2026-02-12", dataFimEfetivoExercicio: "2027-02-12" }));
});
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

it("habilita Confirmar na última etapa do contrato temporário com dados completos", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SES%202026&candidato=71&orgao=SES&etapa=efetivo-exercicio"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.change(screen.getByRole("combobox", { name: /Servidor compareceu/ }), { target: { value: "Sim" } });
  fireEvent.change(screen.getByRole("combobox", { name: /Setor\/Lotação/ }), { target: { value: "Unidade Central" } });
  const confirmar = screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement;
  expect(confirmar.disabled).toBe(false);
  fireEvent.click(confirmar);
  expect(screen.getByText("Efetivo Exercício registrado")).toBeTruthy();
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["71"]).toBe("Aguardando Termo Assinado");
});
