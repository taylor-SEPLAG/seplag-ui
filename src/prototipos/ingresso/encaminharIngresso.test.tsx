// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PrototiposIngressosTesteDetalhePage } from "../PrototiposPage";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

const abrirEdital = (id: number, query = "") => render(
  <MemoryRouter initialEntries={[`/prototipos/sigep/ingressos-teste/${id}${query}`]}>
    <Routes><Route path="/prototipos/sigep/ingressos-teste/:id" element={<PrototiposIngressosTesteDetalhePage />} /></Routes>
  </MemoryRouter>,
);

const menuCandidato = (nome: string) => {
  const linha = screen.getByText(nome).closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(linha).getByRole("button", { name: "Mais ações" }));
  return within(linha);
};

it("encaminha somente a etapa atual de um processo seletivo e mantém o órgão designado", () => {
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ 41: "Aguardando Efetivo Exercicio" }));
  localStorage.setItem("prototype-ingresso-registros-concursos", JSON.stringify({
    "Processo Seletivo SES 2026": [{ id: 41, nome: "Marcos Vinícius Lima", classificacao: "1º", cargo: "Enfermeiro", tipoVaga: "PCD", dataNomeacao: "18/07/2026", dataPosse: "12/08/2026", dataEfetivoExercicio: "-", orgaoDesignado: "SES" }],
  }));
  abrirEdital(4);
  const menu = menuCandidato("Marcos Vinícius Lima");
  fireEvent.click(menu.getByRole("menuitem", { name: "Encaminhar Ingresso" }));
  expect(screen.getByText("Esta funcionalidade permite encaminhar a responsabilidade da etapa atual do ingresso para outro órgão.")).toBeTruthy();
  expect(screen.getByText("O Órgão Designado do candidato não será alterado.")).toBeTruthy();
  expect(screen.getByRole("region", { name: "Dados do ingresso" }).textContent).toContain("Marcos Vinícius Lima");
  expect(screen.getByRole("region", { name: "Dados do ingresso" }).textContent).toContain("Aguardando Efetivo Exercício");
  const destino = screen.getByRole("combobox", { name: /Novo órgão responsável/ }) as HTMLSelectElement;
  expect(Array.from(destino.options).map((option) => option.value)).toEqual(["", "SEPLAG"]);
  const confirmar = screen.getByRole("button", { name: "Confirmar encaminhamento" }) as HTMLButtonElement;
  expect(confirmar.disabled).toBe(true);
  fireEvent.change(destino, { target: { value: "SEPLAG" } });
  expect(screen.getAllByRole("note")[1].textContent).toContain("O Órgão Designado do candidato permanecerá inalterado.");
  expect(confirmar.disabled).toBe(true);
  fireEvent.change(screen.getByRole("textbox", { name: /Motivo/ }), { target: { value: "Redistribuição da equipe" } });
  expect(confirmar.disabled).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Confirmar encaminhamento" }));
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-orgaos-encaminhados") ?? "{}")["41"]).toBe("SEPLAG");
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-registros-concursos") ?? "{}")["Processo Seletivo SES 2026"][0].orgaoDesignado).toBe("SES");
  const historico = JSON.parse(localStorage.getItem("prototype-ingresso-historico-encaminhamentos") ?? "{}")["41"];
  expect(historico[0]).toMatchObject({ etapa: "Efetivo Exercício", orgaoAnterior: "SES", novoOrgaoResponsavel: "SEPLAG", operador: "Roberto Junior", motivo: "Redistribuição da equipe" });
  fireEvent.click(menuCandidato("Marcos Vinícius Lima").getByRole("menuitem", { name: "Histórico do ingresso" }));
  expect(screen.getByText("Ingresso encaminhado — Efetivo Exercício")).toBeTruthy();
  expect(screen.getByText("Motivo: Redistribuição da equipe")).toBeTruthy();
});

it("não oferece encaminhamento para Concurso Público nem para Estagiário", () => {
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ 65: "Em analise" }));
  const concurso = abrirEdital(1, "?encaminhar=14");
  const menuConcurso = menuCandidato("João Silva");
  expect(menuConcurso.queryByRole("menuitem", { name: "Encaminhar Ingresso" })).toBeNull();
  expect(screen.queryByText("Esta funcionalidade permite encaminhar a responsabilidade da etapa atual do ingresso para outro órgão.")).toBeNull();
  concurso.unmount();
  abrirEdital(9);
  const menuEstagio = menuCandidato("Gabriela Mendes");
  expect(menuEstagio.queryByRole("menuitem", { name: "Encaminhar Ingresso" })).toBeNull();
});
it("encaminha a documentação sem alterar a responsabilidade do efetivo exercício", () => {
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ 41: "Em analise" }));
  abrirEdital(4);
  fireEvent.click(menuCandidato("Marcos Vinícius Lima").getByRole("menuitem", { name: "Encaminhar Ingresso" }));
  fireEvent.change(screen.getByRole("combobox", { name: /Novo órgão responsável/ }), { target: { value: "SEPLAG" } });
  fireEvent.change(screen.getByRole("textbox", { name: /Motivo/ }), { target: { value: "Análise pela equipe participante" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirmar encaminhamento" }));
  const direcionamento = JSON.parse(localStorage.getItem("prototype-ingresso-direcionamentos-analise") ?? "{}")["41"];
  expect(direcionamento.responsavelAnalise).toBe("SEPLAG");
  expect(direcionamento.movimentacoes[0]).toMatchObject({ orgaoAnterior: "SES", novoOrgaoResponsavel: "SEPLAG", operador: "Roberto Junior", motivo: "Análise pela equipe participante" });
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-orgaos-encaminhados") ?? "{}")["41"]).toBeUndefined();
  fireEvent.click(menuCandidato("Marcos Vinícius Lima").getByRole("menuitem", { name: "Histórico do ingresso" }));
  expect(screen.getByText("Órgão responsável pelo ingresso alterado")).toBeTruthy();
  expect(screen.getByText("Motivo: Análise pela equipe participante")).toBeTruthy();
});

it("não oferece encaminhamento a um bolsista do processo seletivo", () => {
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ 41: "Em analise" }));
  localStorage.setItem("prototype-ingresso-registros-concursos", JSON.stringify({
    "Processo Seletivo SES 2026": [{ id: 41, nome: "Marcos Vinícius Lima", classificacao: "1º", cargo: "Enfermeiro", tipoVaga: "PCD", tipoVinculo: "Bolsista", dataNomeacao: "18/07/2026", dataPosse: "12/08/2026", dataEfetivoExercicio: "-" }],
  }));
  abrirEdital(4);
  expect(menuCandidato("Marcos Vinícius Lima").queryByRole("menuitem", { name: "Encaminhar Ingresso" })).toBeNull();
});
it("exibe encaminhamento somente em análise e aguardando efetivo exercício", () => {
  for (const [situacao, esperado] of [
    ["Em analise", true],
    ["Aguardando Efetivo Exercicio", true],
    ["Aguardando Analise", false],
    ["Aguardando Termo Assinado", false],
    ["Ingresso Concluído", false],
  ] as const) {
    localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ 41: situacao }));
    const tela = abrirEdital(4);
    const acao = menuCandidato("Marcos Vinícius Lima").queryByRole("menuitem", { name: "Encaminhar Ingresso" });
    expect(Boolean(acao)).toBe(esperado);
    tela.unmount();
  }
});