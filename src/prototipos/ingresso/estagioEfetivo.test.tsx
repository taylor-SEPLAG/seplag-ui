// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PrototiposNovoIngressoPage } from "../PrototiposPage";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ "65": "Aguardando Efetivo Exercicio" }));
  localStorage.setItem("prototype-ingresso-datas-estagio", JSON.stringify({ "65": { inicio: "2026-10-05", termino: "2027-10-05" } }));
});
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

it.each(["SETORIAL", "CENTRAL"])("gera matrícula e vínculo no modal para o perfil %s e conclui estágio ao fechar", (perfil) => {
  localStorage.setItem("prototype-ingresso-perfil-variacao", perfil);
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEPLAG%202027&candidato=65&orgao=SEPLAG&etapa=efetivo-exercicio&perfil=setorial"]}>
    <Routes>
      <Route path="/prototipos/sigep/ingressos/novo" element={<PrototiposNovoIngressoPage />} />
      <Route path="/prototipos/sigep/ingressos-teste" element={<div>Gestão de Ingresso</div>} />
    </Routes>
  </MemoryRouter>);
  fireEvent.change(screen.getByRole("combobox", { name: /Servidor compareceu/ }), { target: { value: "Sim" } });
  const topo = document.querySelector(".prototype-efetivo-exercicio-top-row") as HTMLElement;
  expect(topo.textContent).not.toContain("Matrícula");
  expect(topo.textContent).not.toContain("Vínculo");
  expect((screen.getByLabelText(/Data do Efetivo Exercício/) as HTMLInputElement).value).toBe("2026-10-05");
  expect((screen.getByLabelText(/Data Fim do Exercício/) as HTMLInputElement).value).toBe("2027-10-05");
  fireEvent.change(screen.getByRole("combobox", { name: /Setor\/Lotação/ }), { target: { value: "Unidade Central" } });
  fireEvent.change(screen.getByRole("textbox", { name: /Número da apólice de seguro/ }), { target: { value: "12343243" } });
  fireEvent.change(screen.getByRole("combobox", { name: /CPF ou nome/ }), { target: { value: "Maria Silva" } });
  const confirmar = screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement;
  expect(confirmar.disabled).toBe(false);
  fireEvent.click(confirmar);
  expect(screen.getByText("Efetivo Exercício registrado")).toBeTruthy();
  expect(screen.getByText("O sistema registrou os dados do efetivo exercício e gerou automaticamente a matrícula e o vínculo funcional.")).toBeTruthy();
  expect(screen.getByText("327065")).toBeTruthy();
  expect(screen.getByText("1", { selector: "dd" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Baixar termo" })).toBeNull();
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["65"]).toBe("Aguardando Efetivo Exercicio");
  fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  expect(screen.getByText("Gestão de Ingresso")).toBeTruthy();
  expect(JSON.parse(localStorage.getItem("prototype-ingresso-situacoes") ?? "{}")["65"]).toBe("Ingresso Concluído");
  const gerado = JSON.parse(localStorage.getItem("prototype-ingresso-efetivo-gerado") ?? "{}")["Processo Seletivo SEPLAG 2027|65"];
  expect(gerado).toMatchObject({ matricula: "327065", vinculo: "1" });
});

it("confirma o estágio após avançar da Documentação na mesma sessão", () => {
  localStorage.setItem("prototype-ingresso-situacoes", JSON.stringify({ "65": "Em analise" }));
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEPLAG%202027&candidato=65&orgao=SEPLAG&etapa=documentacao"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Finalizar parecer" }));
  fireEvent.click(screen.getByRole("button", { name: /Prosseguir para Efetivo Exercício/ }));
  expect(screen.getByText("Dados do Efetivo Exercício")).toBeTruthy();
  fireEvent.change(screen.getByRole("combobox", { name: /Servidor compareceu/ }), { target: { value: "Sim" } });
  fireEvent.change(screen.getByRole("combobox", { name: /Setor\/Lotação/ }), { target: { value: "Unidade Central" } });
  fireEvent.change(screen.getByRole("textbox", { name: /Número da apólice de seguro/ }), { target: { value: "33121" } });
  fireEvent.change(screen.getByRole("combobox", { name: /CPF ou nome/ }), { target: { value: "Maria Silva" } });
  const confirmar = screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement;
  expect(confirmar.disabled).toBe(false);
  fireEvent.click(confirmar);
  expect(screen.getByText("Efetivo Exercício registrado")).toBeTruthy();
});

it("registra o efetivo no ingresso iniciado pelo edital sem candidato na URL", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo+Seletivo&concurso=Processo+Seletivo+SEPLAG+2027&orgao=SEPLAG&origem=edital"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.click(document.querySelectorAll(".prototype-novo-ingresso-step")[1] as HTMLButtonElement);
  fireEvent.change(screen.getByLabelText(/Data de início/) as HTMLInputElement, { target: { value: "2027-02-12" } });
  fireEvent.change(screen.getByLabelText(/Data de término/) as HTMLInputElement, { target: { value: "2028-02-12" } });
  fireEvent.click(screen.getByRole("button", { name: "Finalizar parecer" }));
  fireEvent.click(screen.getByRole("button", { name: /Prosseguir para Efetivo Exercício/ }));
  fireEvent.change(screen.getByRole("combobox", { name: /Servidor compareceu/ }), { target: { value: "Sim" } });
  fireEvent.change(screen.getByRole("combobox", { name: /Setor\/Lotação/ }), { target: { value: "Unidade Central" } });
  fireEvent.change(screen.getByRole("textbox", { name: /Número da apólice de seguro/ }), { target: { value: "43243243" } });
  fireEvent.change(screen.getByRole("combobox", { name: /CPF ou nome/ }), { target: { value: "Maria Silva" } });
  const confirmar = screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement;
  expect(confirmar.disabled).toBe(false);
  fireEvent.click(confirmar);
  expect(screen.getByText("Efetivo Exercício registrado")).toBeTruthy();
  const registros = JSON.parse(localStorage.getItem("prototype-ingresso-efetivo-gerado") ?? "{}");
  expect(Object.keys(registros).some((chave) => chave.startsWith("Processo Seletivo SEPLAG 2027|"))).toBe(true);
});
