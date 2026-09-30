// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PrototiposIngressosTesteDetalhePage, PrototiposNovoIngressoPage } from "../PrototiposPage";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

it("mantém o direcionamento da análise na primeira etapa", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEPLAG%202027&orgao=SEPLAG"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Direcionamento da Análise" })).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "Direcionamento do Efetivo Exercício" })).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: /Encaminhar para outro órgão/ }));
  const destino = screen.getByRole("combobox", { name: "Encaminhar para" }) as HTMLSelectElement;
  expect(Array.from(destino.options).map((option) => option.value)).not.toContain("SEPLAG");
  expect(screen.getByText("Selecione o órgão que receberá o ingresso para análise da documentação.")).toBeTruthy();
});

it("direciona o efetivo exercício na segunda etapa, exclui o órgão atual e atualiza o aviso", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEPLAG%202027&orgao=SEPLAG&etapa=documentacao"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Direcionamento do Efetivo Exercício" })).toBeTruthy();
  const direcionamento = document.querySelector(".prototype-direcionamento-analise") as HTMLElement;
  const documentos = document.querySelector(".prototype-documentos-gerados") as HTMLElement;
  expect(Boolean(direcionamento.compareDocumentPosition(documentos) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  expect(document.querySelector(".prototype-termo-compromisso-dados select")).toBeNull();
  const current = screen.getByRole("radio", { name: /Continuar com o órgão atual/ }) as HTMLInputElement;
  const other = screen.getByRole("radio", { name: /Encaminhar para outro órgão/ }) as HTMLInputElement;
  expect(current.checked).toBe(true);
  expect(screen.queryByRole("combobox", { name: "Encaminhar para" })).toBeNull();
  expect(screen.getByText("O ingresso permanecerá sob responsabilidade do órgão atual para registro do efetivo exercício.")).toBeTruthy();
  fireEvent.click(other);
  const destination = screen.getByRole("combobox", { name: "Encaminhar para" }) as HTMLSelectElement;
  expect(destination.required).toBe(true);
  expect(Array.from(destination.options).map(option => option.value)).not.toContain("SEPLAG");
  expect(Array.from(destination.options).map(option => option.textContent)).toContain("Secretaria de Estado de Saúde (SES-MT)");
  expect(screen.getByText("Selecione o órgão que receberá o ingresso para registro do efetivo exercício.")).toBeTruthy();
  fireEvent.change(destination, { target: { value: "SES" } });
  expect(screen.getByText("Após a confirmação, o ingresso será encaminhado ao órgão selecionado para efetivo exercício.")).toBeTruthy();
  fireEvent.click(current);
  expect(screen.queryByRole("combobox", { name: "Encaminhar para" })).toBeNull();
  fireEvent.click(other);
  expect((screen.getByRole("combobox", { name: "Encaminhar para" }) as HTMLSelectElement).value).toBe("");
});

it("não apresenta direcionamento nos demais tipos de ingresso", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Concurso"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(screen.queryByRole("heading", { name: "Direcionamento do Efetivo Exercício" })).toBeNull();
});

it("mostra o ingresso encaminhado nas pendências do órgão destinatário", () => {
  localStorage.setItem("prototype-ingresso-perfil-variacao", "SETORIAL");
  localStorage.setItem("prototype-ingresso-direcionamentos-analise", JSON.stringify({
    "65": { orgaoOrigem: "SEPLAG", responsavelAnalise: "SES", operador: "Roberto Junior", dataHora: "29/09/2026 10:00" },
  }));
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos-teste/9"]}>
    <Routes><Route path="/prototipos/sigep/ingressos-teste/:id" element={<PrototiposIngressosTesteDetalhePage />} /></Routes>
  </MemoryRouter>);
  const table = document.querySelector(".prototype-ingressos-operational-table") as HTMLTableElement;
  expect(table.textContent).toContain("Gabriela Mendes");
  fireEvent.change(screen.getByRole("combobox", { name: "Órgão de atuação" }), { target: { value: "SES" } });
  expect(table.textContent).toContain("Gabriela Mendes");
  expect(table.textContent).not.toContain("Lucas Ribeiro");
});

it("reserva a análise documental ao órgão destinatário", () => {
  localStorage.setItem("prototype-ingresso-perfil-variacao", "SETORIAL");
  localStorage.setItem("prototype-ingresso-direcionamentos-analise", JSON.stringify({
    "65": { orgaoOrigem: "SEPLAG", responsavelAnalise: "SES", operador: "Roberto Junior", dataHora: "29/09/2026 10:00" },
  }));
  const route = "/prototipos/sigep/ingressos/novo?candidato=65&tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEPLAG%202027&orgao=SEPLAG&etapa=documentacao";
  const page = render(<MemoryRouter initialEntries={[route]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(document.querySelector(".prototype-novo-ingresso-readonly")).toBeTruthy();
  page.unmount();
  localStorage.setItem("prototype-ingresso-orgao-atuacao", "SES");
  render(<MemoryRouter initialEntries={[route]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(document.querySelector(".prototype-novo-ingresso-readonly")).toBeNull();
});
