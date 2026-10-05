// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { PrototiposIngressosTestePage, PrototiposNovoIngressoPage } from "../PrototiposPage";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });
function NewEntry() {
  const location = useLocation();
  return <><output data-testid="entry-location">{location.search}</output><PrototiposNovoIngressoPage /></>;
}
it.each([
  ["001/2026/SES", "Concurso", "Concurso SES 2026", "SES", "SES", "Nomeado Efetivo", "Estatutário Civil"],
  ["004/2026/SES", "Processo Seletivo", "Processo Seletivo SES 2026", "SES", "SES, SEPLAG", "Contrato Temporário", "Estatutário Civil"],
  ["009/2027/SEPLAG", "Processo Seletivo", "Processo Seletivo SEPLAG 2027", "SEPLAG", "SEPLAG", "Estagiário", "Sem Vínculo Empregatício"],
])("abre um novo ingresso a partir do edital %s com a origem preenchida", (edital, type, title, organ, participants, link, regime) => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos-teste"]}><Routes>
    <Route path="/prototipos/sigep/ingressos-teste" element={<PrototiposIngressosTestePage />} />
    <Route path="/prototipos/sigep/ingressos/novo" element={<NewEntry />} />
  </Routes></MemoryRouter>);
  const row = screen.getByText(edital, { selector: "strong" }).closest("tr")!;
  const cells = within(row).getAllByRole("cell");
  const actions = within(cells[cells.length - 1]).getAllByRole("button");
  expect(actions.map((button) => button.getAttribute("aria-label"))).toEqual(["Novo ingresso", "Gerenciar ingressos", "Histórico de Integração"]);
  expect(actions[0].querySelector(".pi-user-plus")).toBeTruthy();
  fireEvent.click(actions[0]);
  const params = new URLSearchParams(screen.getByTestId("entry-location").textContent || "");
  expect(params.get("tipo")).toBe(type);
  expect(params.get("concurso")).toBe(title);
  expect(params.get("orgao")).toBe(organ);
  expect(params.has("candidato")).toBe(false);
  expect(params.get("origem")).toBe("edital");
  ["Concurso", "Processo Seletivo", "Exclusivamente Comissionado"].forEach((origin) => {
    const button = screen.getByRole("button", { name: origin, exact: true }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
  });
  const originField = screen.getByRole("combobox", { name: new RegExp("^" + type + "\\s*\\*$") }) as HTMLSelectElement;
  expect(originField.disabled).toBe(true);
  expect((screen.getByRole("combobox", { name: /^Regime Jurídico/ }) as HTMLSelectElement).value).toBe(regime);
  expect((screen.getByLabelText(/^Tipo de Vínculo/) as HTMLInputElement | HTMLSelectElement).value).toBe(link);
  const responsibleField = screen.getByText(/^Órgão Responsável/).closest(".prototype-ingresso-field")!;
  expect(within(responsibleField as HTMLElement).getByRole("button", { name: organ }).hasAttribute("disabled")).toBe(true);
  const participantsField = screen.getByText("Órgãos Participantes").closest(".prototype-ingresso-field")!;
  expect(within(participantsField as HTMLElement).getByRole("button", { name: participants }).hasAttribute("disabled")).toBe(true);

  expect(screen.getByRole("button", { name: type, exact: true }).classList.contains("is-selected")).toBe(true);
  expect((screen.getByRole("combobox", { name: new RegExp("^" + type + "\\s*\\*$") }) as HTMLSelectElement).value).toBe(title);
});

it("permite alterar a origem quando o cadastro não foi aberto pelo ícone do edital", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Concurso"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  const process = screen.getByRole("button", { name: "Processo Seletivo", exact: true }) as HTMLButtonElement;
  expect(process.disabled).toBe(false);
  fireEvent.click(process);
  expect(process.classList.contains("is-selected")).toBe(true);
  expect((screen.getByRole("combobox", { name: /^Processo Seletivo/ }) as HTMLSelectElement).disabled).toBe(false);
});


it("preenche o quadro de vaga do estagiário pelo cargo e impede edição direta", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEPLAG%202027&orgao=SEPLAG&origem=edital"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  const cargo = screen.getByRole("combobox", { name: /^Cargo\/Função/ }) as HTMLSelectElement;
  const quadro = screen.getByRole("textbox", { name: /^Quadro de vaga/ }) as HTMLInputElement;
  expect(quadro.value).toBe("");
  expect(quadro.readOnly).toBe(true);
  fireEvent.change(cargo, { target: { value: "Analista Administrativo - SES" } });
  expect(quadro.value).toBe("QA-0012");
  fireEvent.change(cargo, { target: { value: "Analista de Gestão - SES" } });
  expect(quadro.value).toBe("QA-0013");
  fireEvent.change(cargo, { target: { value: "" } });
  expect(quadro.value).toBe("");
});

it("preenche o quadro de vagas do contrato temporário ao selecionar o processo seletivo", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  const processo = screen.getByRole("combobox", { name: /^Processo Seletivo/ }) as HTMLSelectElement;
  expect((screen.getByRole("textbox", { name: /^Quadro de vagas/ }) as HTMLInputElement).value).toBe("");
  fireEvent.change(processo, { target: { value: "Processo Seletivo SES 2026" } });
  const quadro = screen.getByRole("textbox", { name: /^Quadro de vagas/ }) as HTMLInputElement;
  expect(quadro.value).toBe("QA-0012");
  expect(quadro.readOnly).toBe(true);
  expect(quadro.closest("section")?.textContent).toContain("Enquadramento");
  expect((screen.getByRole("combobox", { name: /^Jornada/ }) as HTMLSelectElement).required).toBe(true);
  expect((screen.getByRole("combobox", { name: /^Refer/ }) as HTMLSelectElement).required).toBe(true);
  fireEvent.change(processo, { target: { value: "Processo Seletivo SEDUC 2026" } });
  expect(quadro.value).toBe("QA-0013");
  fireEvent.change(processo, { target: { value: "Processo Seletivo SEPLAG 2027" } });
  expect((screen.getByRole("textbox", { name: /^Quadro de vagas/ }) as HTMLInputElement).value).toBe("");
});

it("remove jornada e referência da última aba do processo seletivo", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SES%202026&orgao=SES&etapa=efetivo-exercicio"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.change(screen.getByRole("combobox", { name: /Servidor compareceu/ }), { target: { value: "Sim" } });
  const card = document.querySelector(".prototype-efetivo-exercicio-card") as HTMLElement;
  expect(card.textContent).toContain("Setor/Lotação");
  expect(card.textContent).not.toContain("Jornada");
  expect(card.textContent).not.toContain("Referência");
});

it("exige jornada e referência no Enquadramento do concurso", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Concurso&concurso=Concurso%20SES%202026&orgao=SES"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  const jornada = screen.getByRole("combobox", { name: /^Jornada/ }) as HTMLSelectElement;
  const referencia = screen.getByRole("combobox", { name: /^Refer/ }) as HTMLSelectElement;
  expect(jornada.closest("section")?.textContent).toContain("Enquadramento");
  expect(referencia.closest("section")?.textContent).toContain("Enquadramento");
  expect(jornada.required).toBe(true);
  expect(referencia.required).toBe(true);
});

it("não repete jornada e referência na última aba do concurso", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Concurso&concurso=Concurso%20SES%202026&orgao=SES&etapa=efetivo-exercicio"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  fireEvent.change(screen.getByRole("combobox", { name: /Servidor compareceu/ }), { target: { value: "Sim" } });
  const card = document.querySelector(".prototype-efetivo-exercicio-card") as HTMLElement;
  expect(card.textContent).toContain("Setor/Lotação");
  expect(card.textContent).not.toContain("Jornada");
  expect(card.textContent).not.toContain("Referência");
});

it("bloqueia o ingresso do PSS 006/2026/SEFAZ sem quadro de vagas", () => {
  render(<MemoryRouter initialEntries={["/prototipos/sigep/ingressos/novo?tipo=Processo%20Seletivo&concurso=Processo%20Seletivo%20SEFAZ%202026&orgao=SEFAZ"]}><PrototiposNovoIngressoPage /></MemoryRouter>);
  expect(screen.getByRole("alert").textContent).toContain("Não existe Quadro de Vagas disponível para o Cargo/Função e Perfil Profissional selecionados. Cadastre o Quadro de Vagas para prosseguir.");
  expect((screen.getByRole("textbox", { name: /^Quadro de vagas/ }) as HTMLInputElement).value).toBe("");
  expect((screen.getByRole("button", { name: "Confirmar" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByRole("combobox", { name: /^Processo Seletivo/ }), { target: { value: "Processo Seletivo SES 2026" } });
  expect(screen.queryByText(/Não existe Quadro de Vagas disponível/)).toBeNull();
  expect((screen.getByRole("textbox", { name: /^Quadro de vagas/ }) as HTMLInputElement).value).toBe("QA-0012");
});
