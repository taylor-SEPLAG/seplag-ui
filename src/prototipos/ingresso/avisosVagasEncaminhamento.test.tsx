// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PrototiposNovoIngressoPage } from "../PrototiposPage";

const distribuicao = "Este órgão não possui uma distribuição cadastrada. Ao prosseguir, o sistema criará uma distribuição automaticamente.";
const vaga = "Este órgão não possui vagas cadastradas. Ao prosseguir, o sistema criará uma vaga automaticamente.";
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

it("exibe os avisos de distribuição e vaga abaixo do encaminhamento do concurso", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Concurso&orgao=SES&cargo=Cargo+sem+quadro&etapa=analise-provimento"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  const destino = screen.getByRole("combobox", { name: /Encaminhar para/ }) as HTMLSelectElement;
  fireEvent.change(destino, { target: { value: destino.options[1].value } });
  expect(screen.getByText(distribuicao)).toBeTruthy();
  expect(screen.getByText(vaga)).toBeTruthy();
  expect(screen.queryByText("Não existe Quadro Autorizado compatível para o cargo e vínculo do ingresso. Corrija o enquadramento antes de prosseguir.")).toBeNull();
  fireEvent.change(destino, { target: { value: "" } });
  expect(screen.queryByText(distribuicao)).toBeNull();
  expect(screen.queryByText(vaga)).toBeNull();
});

it("não apresenta os novos avisos no processo seletivo", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo+Seletivo&concurso=Processo+Seletivo+SES+2026&orgao=SES&cargo=Enfermeiro&etapa=analise-provimento"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(screen.queryByText(distribuicao)).toBeNull();
  expect(screen.queryByText(vaga)).toBeNull();
});

it("exibe os avisos para DETRAN no fluxo do edital mesmo sem cargo na URL", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Concurso&concurso=Concurso+SES+2026&orgao=SES&origem=edital&etapa=analise-provimento"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  const destino = screen.getByRole("combobox", { name: /Encaminhar para/ }) as HTMLSelectElement;
  const detran = Array.from(destino.options).find(o => o.textContent?.includes("DETRAN"));
  expect(detran).toBeTruthy();
  fireEvent.change(destino, { target: { value: detran!.value } });
  expect(screen.getByText(distribuicao)).toBeTruthy();
  expect(screen.getByText(vaga)).toBeTruthy();
});
