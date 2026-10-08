// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PrototiposIngressosTesteDetalhePage, PrototiposNovoIngressoPage } from "../PrototiposPage";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

it("mantém o órgão atual ou direciona a análise sem alterar o órgão designado", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SES%202026&orgao=SES"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Direcionamento da Análise" })).toBeTruthy();
  expect(screen.getByText("Deseja alterar o responsável pela próxima etapa do ingresso?")).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "Direcionamento do Efetivo Exercício" })).toBeNull();
  const manter = screen.getByRole("radio", { name: /Não, manter o órgão atual/ }) as HTMLInputElement;
  expect(manter.checked).toBe(true);
  expect(screen.queryByRole("combobox", { name: "Órgão responsável" })).toBeNull();
  expect(screen.getByText("O ingresso permanecerá sob responsabilidade do órgão atual: SES, para análise da documentação.")).toBeTruthy();

  const designado = screen.getByRole("combobox", { name: /^Órgão Designado/ }) as HTMLSelectElement;
  fireEvent.change(designado, { target: { value: "SEPLAG" } });
  fireEvent.click(screen.getByRole("radio", { name: /Sim, direcionar para outro órgão/ }));
  const destino = screen.getByRole("combobox", { name: "Órgão responsável" }) as HTMLSelectElement;
  expect(destino.required).toBe(true);
  expect(Array.from(destino.options).map((option) => option.value)).toEqual(["", "SES", "SEPLAG"]);
  expect(destino.options[1].disabled).toBe(true);
  expect(destino.options[2].disabled).toBe(false);
  expect(screen.getByText("Selecione o órgão que ficará responsável pela análise da documentação.")).toBeTruthy();
  expect(screen.getByText("O órgão responsável atual é SES. A alteração do órgão responsável não modifica o Órgão Designado: SEPLAG.")).toBeTruthy();

  fireEvent.change(destino, { target: { value: "SEPLAG" } });
  fireEvent.click(manter);
  expect(screen.queryByRole("combobox", { name: "Órgão responsável" })).toBeNull();
  expect(designado.value).toBe("SEPLAG");
  expect(screen.getByText("O ingresso permanecerá sob responsabilidade do órgão atual: SES, para análise da documentação.")).toBeTruthy();
});
it("lista o órgão responsável mesmo quando é o único órgão do edital", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEPLAG%202027&orgao=SEPLAG"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole("radio", { name: /Sim, direcionar para outro/ }));
  const destino = screen.getByRole("combobox", { name: /responsável$/ }) as HTMLSelectElement;
  expect(Array.from(destino.options).map((option) => option.value)).toEqual(["", "SEPLAG"]);
  expect(destino.options[1].disabled).toBe(true);
});
it("lista só os órgãos do edital no direcionamento do efetivo exercício", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SES%202026&orgao=SES&etapa=documentacao"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Direcionamento do Efetivo Exercício" })).toBeTruthy();
  const direcionamento = document.querySelector(".prototype-direcionamento-analise") as HTMLElement;
  expect(direcionamento).toBeTruthy();
  expect(document.querySelector(".prototype-termo-compromisso-dados select")).toBeNull();
  expect(screen.getByText("Deseja alterar o responsável pela próxima etapa do ingresso?")).toBeTruthy();
  const current = screen.getByRole("radio", { name: /Não, manter o órgão atual/ }) as HTMLInputElement;
  const other = screen.getByRole("radio", { name: /Sim, direcionar para outro órgão/ }) as HTMLInputElement;
  expect(current.checked).toBe(true);
  expect(screen.queryByRole("combobox", { name: "Órgão responsável" })).toBeNull();
  expect(screen.getByText("O ingresso permanecerá sob responsabilidade do órgão atual: SES, para registro do Efetivo Exercício.")).toBeTruthy();
  fireEvent.click(other);
  const destination = screen.getByRole("combobox", { name: "Órgão responsável" }) as HTMLSelectElement;
  expect(destination.required).toBe(true);
  expect(Array.from(destination.options).map(option => option.value)).toEqual(["", "SES", "SEPLAG"]);
  expect(destination.options[1].disabled).toBe(true);
  expect(destination.options[2].disabled).toBe(false);
  expect(Array.from(destination.options).map(option => option.textContent)).toContain("Secretaria de Estado de Planejamento e Gestão (SEPLAG-MT)");
  expect(screen.getByText("Selecione o órgão que ficará responsável pelo registro do Efetivo Exercício.")).toBeTruthy();
  fireEvent.change(destination, { target: { value: "SEPLAG" } });
  expect(screen.getByText("O órgão responsável atual é SES. A alteração do órgão responsável não modifica o Órgão Designado do candidato.")).toBeTruthy();
  fireEvent.click(current);
  expect(screen.queryByRole("combobox", { name: "Órgão responsável" })).toBeNull();
  fireEvent.click(other);
  expect((screen.getByRole("combobox", { name: "Órgão responsável" }) as HTMLSelectElement).value).toBe("");
});

it("mostra direcionamento, jornada e referência na primeira etapa do ingresso comissionado", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Exclusivo%20Comissionado&orgao=SEPLAG"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  const dados = document.querySelector(".prototype-novo-ingresso-dados-ingresso") as HTMLElement;
  const cards = (Array.from(document.querySelectorAll(".prototype-novo-ingresso-dados-grid > section")) as HTMLElement[])
    .filter((card) => ["Dados do Ingresso", "Enquadramento Funcional", "Informações da Nomeação"].includes(card.querySelector("h3")?.textContent ?? ""));
  expect(cards.map((card) => card.querySelector("h3")?.textContent)).toEqual(["Dados do Ingresso", "Enquadramento Funcional", "Informações da Nomeação"]);
  expect(cards[0].textContent).not.toContain("Cargo/Função");
  expect(cards[1].textContent).toContain("Cargo/Função");
  expect(cards[1].textContent).toContain("Perfil Profissional");
  expect(cards[1].textContent).toContain("Quadro de vagas");
  expect(cards[2].textContent).toContain("Data da Nomeação");

  expect(dados.textContent).toContain("Órgão");
  expect(dados.textContent).not.toContain("Órgão Responsável");
  expect(screen.getByRole("combobox", { name: /^Jornada/ })).toBeTruthy();
  expect(screen.getByRole("combobox", { name: /^Refer/ })).toBeTruthy();
  const quadro = screen.getByRole("textbox", { name: /Quadro de vagas/ }) as HTMLInputElement;
  expect(quadro.readOnly).toBe(true);
  expect(quadro.value).toBe("");
  fireEvent.change(screen.getByRole("combobox", { name: /Cargo\/Fun/ }), { target: { value: "Analista Administrativo" } });
  expect(quadro.value).toBe("QC-0001");
  expect(screen.getByRole("heading", { name: "Direcionamento da Análise" })).toBeTruthy();
  fireEvent.click(screen.getByRole("radio", { name: /Sim, direcionar para outro órgão/ }));
  const destino = screen.getByRole("combobox", { name: "Órgão responsável" }) as HTMLSelectElement;
  expect(Array.from(destino.options).map((option) => option.value)).toEqual(["", "SEPLAG", "SES", "SEDUC", "SEFAZ"]);
  expect(destino.options[1].disabled).toBe(true);
});

it("mantém os campos da última etapa do ingresso comissionado sem jornada e referência", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Exclusivo%20Comissionado&orgao=SEPLAG&etapa=efetivo-exercicio"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  const card = document.querySelector(".prototype-efetivo-exercicio-card") as HTMLElement;
  expect(card).toBeTruthy();
  expect(card.textContent).toContain("Servidor compareceu?");
  fireEvent.change(screen.getByRole("combobox", { name: /Servidor compareceu/ }), { target: { value: "Sim" } });
  expect(card.textContent).toContain("Órgão");
  expect(card.textContent).toContain("Setor/Lotação");
  expect(card.textContent).toContain("Data do Efetivo Exercício");
  expect(card.textContent).toContain("Data Fim do Exercício");
  expect(card.textContent).toContain("Observação");
  expect(card.textContent).not.toContain("Jornada");
  expect(card.textContent).not.toContain("Referência");
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
  expect(Array.from(table.querySelectorAll("th")).map((cell) => cell.textContent)).toContain("Órgão Designado");
  const linhaGabriela = Array.from(table.querySelectorAll("tbody tr")).find((row) => row.textContent?.includes("Gabriela Mendes"));
  expect(linhaGabriela?.querySelectorAll("td")[4]?.textContent).toBe("SEPLAG");
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

