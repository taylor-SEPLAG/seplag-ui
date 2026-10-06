// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PrototiposIngressosComissionadosPage, PrototiposNovoIngressoPage } from "../PrototiposPage";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

const abrirLista = () => render(<MemoryRouter><PrototiposIngressosComissionadosPage /></MemoryRouter>);
const linhaDe = (nome: string) => screen.getByText(nome, { selector: "td" }).closest("tr") as HTMLTableRowElement;
const abrirAcoes = (nome: string) => fireEvent.click(within(linhaDe(nome)).getByRole("button", { name: "Mais ações" }));

it.each([
  ["João Silva", "Em análise", ["Continuar análise do ingresso", "Cancelar ingresso", "Histórico do ingresso"]],
  ["Maria Souza", "Aguardando efetivo exercício", ["Atuar no Efetivo Exercício", "Histórico do ingresso"]],
  ["Carlos Pereira", "Aguardando termo assinado", ["Finalizar Efetivo Exercício", "Histórico do ingresso"]],
  ["Ana Costa", "Ingresso concluído", ["Histórico do ingresso"]],
  ["Fernanda Rocha", "Ingresso cancelado", ["Histórico do ingresso"]],
])("exibe %s na situação %s com as ações permitidas", (nome, situacao, acoes) => {
  abrirLista();
  const linha = linhaDe(nome);
  expect(linha.textContent).toContain(situacao);
  expect(within(linha).getByRole("button", { name: "Visualizar ingresso" })).toBeTruthy();
  abrirAcoes(nome);
  expect(within(linha).getAllByRole("menuitem").map((item) => item.textContent?.trim())).toEqual(acoes);
});

it.each([
  ["João Silva", "Ingresso comissionado criado"],
  ["Maria Souza", "Análise do ingresso concluída"],
  ["Carlos Pereira", "Termo de Efetivo Exercício gerado"],
  ["Ana Costa", "Termo de Efetivo Exercício assinado anexado"],
  ["Fernanda Rocha", "Ingresso cancelado"],
])("mostra no histórico de %s o evento %s", (nome, evento) => {
  abrirLista();
  abrirAcoes(nome);
  fireEvent.click(within(linhaDe(nome)).getByRole("menuitem", { name: "Histórico do ingresso" }));
  const timeline = document.querySelector(".prototype-ingressos-candidate-history-timeline") as HTMLElement;
  expect(within(timeline).getByText(evento, { selector: "strong" })).toBeTruthy();
});

it("persiste o cancelamento e deixa o ingresso somente para consulta", () => {
  abrirLista();
  abrirAcoes("João Silva");
  fireEvent.click(within(linhaDe("João Silva")).getByRole("menuitem", { name: "Cancelar ingresso" }));
  expect(linhaDe("João Silva").textContent).toContain("Ingresso cancelado");
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["1"]).toBe("Ingresso Cancelado");
  abrirAcoes("João Silva");
  expect(within(linhaDe("João Silva")).getAllByRole("menuitem").map((item) => item.textContent?.trim())).toEqual(["Histórico do ingresso"]);
});

it("exige termo assinado para concluir o efetivo exercício", () => {
  abrirLista();
  abrirAcoes("Carlos Pereira");
  fireEvent.click(within(linhaDe("Carlos Pereira")).getByRole("menuitem", { name: "Finalizar Efetivo Exercício" }));
  expect((screen.getByRole("button", { name: /Baixar termo gerado/ }) as HTMLButtonElement).disabled).toBe(false);
  const finalizar = screen.getByRole("button", { name: "Finalizar Efetivo Exercício" }) as HTMLButtonElement;
  expect(finalizar.disabled).toBe(true);
  const arquivo = new File(["termo assinado"], "termo-assinado.pdf", { type: "application/pdf" });
  fireEvent.change(document.querySelector("#termo-assinado-comissionado") as HTMLInputElement, { target: { files: [arquivo] } });
  expect(finalizar.disabled).toBe(false);
  fireEvent.click(finalizar);
  expect(linhaDe("Carlos Pereira").textContent).toContain("Ingresso concluído");
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["3"]).toBe("Ingresso Concluído");
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-termos-efetivo-assinados") ?? "{}")["Exclusivo Comissionado|3"].nome).toBe("termo-assinado.pdf");
});

it("abre escolha antes de concluir a Documentação e pode avançar ao Efetivo Exercício", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Exclusivo%20Comissionado&candidato=1&orgao=SEPLAG&etapa=documentacao"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Continuar Ingresso" }));
  expect(screen.getByText("Finalizar etapa de Documentação")).toBeTruthy();
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["1"]).toBeUndefined();
  fireEvent.click(screen.getByRole("button", { name: /Prosseguir para Efetivo Exercício/ }));
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["1"]).toBe("Aguardando Efetivo Exercicio");
  expect(screen.getByText("Dados do Efetivo Exercício")).toBeTruthy();
  const eventos = JSON.parse(localStorage.getItem("prototype-ingresso-historico-efetivo-exercicio") ?? "{}")["Exclusivo Comissionado|1"];
  expect(eventos.some((evento: { titulo: string }) => evento.titulo === "Análise do ingresso concluída")).toBe(true);
});

it("abre o modal para registro antigo salvo como Aguardando Análise", () => {
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ "1": "Aguardando Analise" }));
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Exclusivo%20Comissionado&candidato=1&orgao=SEPLAG&etapa=documentacao"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Continuar Ingresso" }));
  expect(screen.getByText("Finalizar etapa de Documentação")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Prosseguir para Efetivo Exercício/ }));
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["1"]).toBe("Aguardando Efetivo Exercicio");
});

it("pode concluir a Documentação e voltar à Gestão de Ingresso de Comissionados", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Exclusivo%20Comissionado&candidato=1&orgao=SEPLAG&etapa=documentacao"]}>
    <Routes>
      <Route path="/prototipos/sigep/ingressos/novo" element={<PrototiposNovoIngressoPage />} />
      <Route path="/prototipos/sigep/ingressos/comissionados" element={<PrototiposIngressosComissionadosPage />} />
    </Routes>
  </MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Continuar Ingresso" }));
  fireEvent.click(screen.getByRole("button", { name: /Finalizar etapa e voltar para Gestão de Ingresso de Comissionados/ }));
  expect(screen.getByText("Gestão de Ingresso de Comissionados")).toBeTruthy();
  expect(linhaDe("João Silva").textContent).toContain("Aguardando efetivo exercício");
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["1"]).toBe("Aguardando Efetivo Exercicio");
  abrirAcoes("João Silva");
  fireEvent.click(within(linhaDe("João Silva")).getByRole("menuitem", { name: "Atuar no Efetivo Exercício" }));
  expect(screen.getByText("Dados do Efetivo Exercício")).toBeTruthy();
});

it("reabre no Efetivo Exercício mesmo com link antigo para Documentação", () => {
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ "1": "Aguardando Efetivo Exercicio" }));
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Exclusivo%20Comissionado&candidato=1&orgao=SEPLAG&etapa=documentacao"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(screen.getByText("Dados do Efetivo Exercício")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Continuar Ingresso" })).toBeNull();
});

it("mantém Aguardando Termo Assinado após confirmar comparecimento e gerar o termo", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Exclusivo%20Comissionado&candidato=2&orgao=SEDUC&etapa=efetivo-exercicio"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.change(screen.getByRole("combobox", { name: /Servidor compareceu/ }), { target: { value: "Sim" } });
  fireEvent.change(screen.getByRole("combobox", { name: /Setor\/Lotação/ }), { target: { value: "Unidade Central" } });
  fireEvent.change(screen.getByLabelText(/Data do Efetivo Exercício/) as HTMLInputElement, { target: { value: "2026-10-05" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["2"]).toBe("Aguardando Termo Assinado");
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-efetivo-gerado") ?? "{}")["Exclusivo Comissionado|2"].termoNome).toContain(".pdf");
  expect(localStorage.getItem("prototype-ingresso-termos-efetivo-assinados")).toBeNull();
});

it("cria um comissionado em análise e o inclui na lista com histórico", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Exclusivo%20Comissionado"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect((screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("combobox", { name: /^CPF/ }));
  fireEvent.click(within(screen.getByRole("listbox", { name: "CPFs cadastrados" })).getByRole("option", { name: /555\.555\.555-55/ }));
  fireEvent.change(screen.getByRole("combobox", { name: /Cargo\/Função/ }), { target: { value: "Analista Administrativo" } });
  fireEvent.change(screen.getByRole("combobox", { name: /Perfil Profissional/ }), { target: { value: "Gestão de Pessoas" } });
  fireEvent.change(screen.getByRole("combobox", { name: /^Jornada/ }), { target: { value: "20 horas" } });
  fireEvent.change(screen.getByRole("combobox", { name: /^Referência/ }), { target: { value: "001A" } });
  fireEvent.change(screen.getByLabelText(/Data da Nomeação/) as HTMLInputElement, { target: { value: "2026-10-05" } });
  fireEvent.change(screen.getByLabelText(/Ato de Nomeação/) as HTMLInputElement, { target: { value: "0006/2026" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  expect(document.querySelector(".prototype-novo-ingresso-step[aria-current=\"step\"]")?.textContent).toContain("Documentação");
  const criados = JSON.parse(localStorage.getItem("prototype-ingressos-comissionados-registros") ?? "[]");
  expect(criados).toHaveLength(1);
  expect(criados[0].situacao).toBe("Em análise");
  expect(criados[0].nome).toBe("Rafael Martins");
  expect(criados[0].cpf).toBe("555.555.555-55");
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")[String(criados[0].id)]).toBe("Em analise");
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-historico-efetivo-exercicio") ?? "{}")["Exclusivo Comissionado|" + criados[0].id][0].titulo).toBe("Ingresso comissionado criado");
});
