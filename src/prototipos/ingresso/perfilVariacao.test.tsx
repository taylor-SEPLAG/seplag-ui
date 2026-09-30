// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PrototiposIngressosTestePage, PrototiposNovoIngressoPage } from "../PrototiposPage";
import { podeAnalisarIngresso, podeConsultarIngresso, podeRegistrarEfetivo } from "./perfilVariacao";

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); localStorage.clear(); });

it("aplica a matriz de permissões por perfil, etapa e órgão", () => {
  expect(podeConsultarIngresso("CENTRAL", "SEPLAG", "SES")).toBe(true);
  expect(podeConsultarIngresso("SETORIAL", "SEPLAG", "SES", "SEPLAG")).toBe(true);
  expect(podeConsultarIngresso("SETORIAL", "SEPLAG", "SES", "SEDUC")).toBe(false);
  expect(podeAnalisarIngresso("SETORIAL", "Concurso", "SES", "SES")).toBe(false);
  expect(podeAnalisarIngresso("SETORIAL", "Processo Seletivo", "SES", "SES")).toBe(true);
  expect(podeAnalisarIngresso("SETORIAL", "Processo Seletivo", "SES", "SEDUC")).toBe(false);
  expect(podeRegistrarEfetivo("CENTRAL", "SES", "SES")).toBe(false);
  expect(podeRegistrarEfetivo("SETORIAL", "SES", "SES")).toBe(true);
});

it("troca o perfil na Gestão de Ingresso e limita os editais e indicadores setoriais", () => {
  render(<MemoryRouter><PrototiposIngressosTestePage /></MemoryRouter>);
  const tabela = document.querySelector(".prototype-ingressos-teste-table") as HTMLElement;
  const indicadores = () => Array.from(document.querySelectorAll(".prototype-ingressos-teste-indicator strong")).map((item) => Number(item.textContent));
  const central = indicadores();
  expect(tabela.textContent).toContain("001/2026/SES");
  fireEvent.change(screen.getByRole("combobox", { name: "Perfil da variação" }), { target: { value: "SETORIAL" } });
  expect(localStorage.getItem("prototype-ingresso-perfil-variacao")).toBe("SETORIAL");
  expect(tabela.textContent).not.toContain("001/2026/SES");
  expect(indicadores()[2]).toBeLessThan(central[2]);
  fireEvent.change(screen.getByRole("combobox", { name: "Órgão de atuação" }), { target: { value: "SES" } });
  expect(tabela.textContent).toContain("001/2026/SES");
});

it("habilita a escolha de comparecimento e mantém a confirmação sujeita às permissões", () => {
  const route = "/prototipos/sigep/ingressos/novo?candidato=65&tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEPLAG%202027&orgao=SEPLAG&etapa=efetivo-exercicio";
  const page = render(<MemoryRouter initialEntries={[route]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect((screen.getByLabelText(/Servidor compareceu/) as HTMLSelectElement).disabled).toBe(false);
  expect((screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement).disabled).toBe(true);
  page.unmount();
  localStorage.setItem("prototype-ingresso-perfil-variacao", "SETORIAL");
  render(<MemoryRouter initialEntries={[route]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(document.querySelector(".prototype-novo-ingresso-readonly")).toBeNull();
});


it("permite iniciar cadastro setorial somente no pr?prio ?rg?o", () => {
  localStorage.setItem("prototype-ingresso-perfil-variacao", "SETORIAL");
  localStorage.setItem("prototype-ingresso-orgao-atuacao", "SEPLAG");
  const propria = render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEPLAG%202027&orgao=SEPLAG&origem=edital"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(document.querySelector(".prototype-novo-ingresso-readonly")).toBeNull();
  expect(screen.getByText("Dados do Servidor")).toBeTruthy();
  propria.unmount();
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SES%202026&orgao=SES&origem=edital"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(document.querySelector(".prototype-novo-ingresso-readonly")).toBeTruthy();
});

it("lista CPFs cadastrados e preenche nome e nascimento somente para leitura", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  const cpf = screen.getByRole("combobox", { name: "CPF*" });
  fireEvent.click(cpf);
  expect(screen.getByRole("listbox", { name: "CPFs cadastrados" })).toBeTruthy();
  fireEvent.change(cpf, { target: { value: "Maria" } });
  expect(screen.getAllByRole("option")).toHaveLength(1);
  fireEvent.click(screen.getByRole("option", { name: /111\.111\.111-11/ }));
  expect((cpf as HTMLInputElement).value).toBe("111.111.111-11");
  const nome = screen.getByRole("textbox", { name: "Nome Completo*" }) as HTMLInputElement;
  const nascimento = screen.getByRole("textbox", { name: "Data de Nascimento*" }) as HTMLInputElement;
  expect(nome.value).toBe("Maria Souza");
  expect(nascimento.value).toBe("18/06/1992");
  expect(nome.readOnly).toBe(true);
  expect(nascimento.readOnly).toBe(true);
  fireEvent.change(cpf, { target: { value: "333.333.333-33" } });
  expect(nome.value).toBe("Ana Costa");
  expect(nascimento.value).toBe("22/09/1988");
});
