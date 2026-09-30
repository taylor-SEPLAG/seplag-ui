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
