// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NovaSolicitacaoContent } from "./NovaSolicitacaoLicencaPage";
import {
  buscarServidores,
  carregarSolicitacoes,
  carregarGestaoLicencas,
  diasPeriodo,
  totalMinutos,
} from "./solicitacaoModel";
import { carregarEventos, configuracaoDoEvento, STORAGE_LICENCAS } from "../licencas/model";
import { registrosLicencas } from "./model";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
function abrir(selecionar = true) {
  render(
    <MemoryRouter initialEntries={["/novo"]}>
      <Routes>
        <Route
          path="/novo"
          element={
            <div className="v2v-page">
              <NovaSolicitacaoContent />
            </div>
          }
        />
        <Route
          path="/prototipos/sigep/gestao-licencas-afastamentos"
          element={<p>Listagem</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
  if (selecionar) {
    fireEvent.focus(screen.getByLabelText("Buscar servidor"));
    fireEvent.click(screen.getByRole("option", { name: "551023/1 - Ana Lúcia Ferreira" }));
  }
}
it("busca por nome sem acentos, CPF formatado ou matrícula", () => {
  for (const termo of ["ANA LUCIA", "00088877766", "000.888.777-66", "551023"])
    expect(buscarServidores(termo)[0].nome).toBe("Ana Lúcia Ferreira");
  expect(buscarServidores("inexistente")).toHaveLength(0);
});
it("exibe o limite parametrizado ao selecionar ocorrência com recorrência", () => {
  abrir(false);
  const tipo = screen.getByLabelText("Tipo de Licença, Afastamento ou Ausência *");
  expect(screen.queryByText(/Recorrência parametrizada:/)).toBeNull();
  fireEvent.change(tipo, { target: { value: "aus-002" } });
  expect(screen.getByText("Recorrência parametrizada: Esta ocorrência possui limite de 1 concessão a cada 12 meses.")).toBeTruthy();
  fireEvent.change(tipo, { target: { value: "lic-101" } });
  expect(screen.queryByText(/Recorrência parametrizada:/)).toBeNull();
});
it("bloqueia nova solicitação para Max e remove o bloqueio ao trocar o servidor", () => {
  abrir(false);
  const busca = screen.getByLabelText("Buscar servidor");
  fireEvent.change(busca, { target: { value: "257812" } });
  fireEvent.click(screen.getByRole("option", { name: /257812\/1 - Max Jorge/ }));
  const tipo = screen.getByLabelText("Tipo de Licença, Afastamento ou Ausência *");
  expect(screen.queryByRole("alert")).toBeNull();
  expect((screen.getByRole("button", { name: "Efetivar Lançamento" }) as HTMLButtonElement).disabled).toBe(false);
  fireEvent.change(tipo, { target: { value: "aus-002" } });
  expect(screen.getByRole("alert").textContent).toContain("Janela de Recorrência Excedida");
  expect(tipo.closest("label")?.nextElementSibling).toBe(screen.getByRole("alert"));
  expect(screen.getByRole("alert").textContent).toContain("16/05/2027");
  expect((screen.getByRole("button", { name: "Efetivar Lançamento" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.submit(screen.getByRole("button", { name: "Efetivar Lançamento" }).closest("form")!);
  expect(carregarSolicitacoes()).toHaveLength(0);
  fireEvent.change(tipo, { target: { value: "lic-101" } });
  expect(screen.queryByRole("alert")).toBeNull();
  expect((screen.getByRole("button", { name: "Efetivar Lançamento" }) as HTMLButtonElement).disabled).toBe(false);
  fireEvent.change(tipo, { target: { value: "aus-002" } });
  fireEvent.change(busca, { target: { value: "551023/1" } });
  fireEvent.click(screen.getByRole("option", { name: "551023/1 - Ana Lúcia Ferreira" }));
  expect(screen.queryByRole("alert")).toBeNull();
  expect((screen.getByRole("button", { name: "Efetivar Lançamento" }) as HTMLButtonElement).disabled).toBe(false);
});
it("lista servidores ao focar e só mostra os vínculos depois da seleção", () => {
  abrir(false);
  expect(screen.queryByRole("region", { name: "Dados do servidor e vínculo selecionado" })).toBeNull();
  expect(screen.queryAllByRole("radio")).toHaveLength(0);
  const busca = screen.getByRole("combobox", { name: "Buscar servidor" });
  fireEvent.focus(busca);
  expect(screen.getByRole("listbox", { name: "Servidores encontrados" })).toBeTruthy();
  expect(screen.getByRole("option", { name: "551023/1 - Ana Lúcia Ferreira" })).toBeTruthy();
  expect(screen.getByRole("option", { name: /Valeria da Silva Pinto/ })).toBeTruthy();
  fireEvent.click(screen.getByRole("option", { name: "551023/1 - Ana Lúcia Ferreira" }));
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(screen.getByRole("region", { name: "Dados do servidor e vínculo selecionado" })).toBeTruthy();
  expect((screen.getByLabelText("Buscar servidor") as HTMLInputElement).value).toBe("551023/1 - Ana Lúcia Ferreira");
  expect(screen.getByText("SEDUC/MT", { exact: false })).toBeTruthy();
  expect(screen.getByText("C. E. Pres. Médici", { exact: false })).toBeTruthy();
  expect(screen.getByText("Técnico de Apoio Educacional")).toBeTruthy();
  expect(screen.getByText("30h semanais")).toBeTruthy();
  fireEvent.change(busca, { target: { value: "551023/2" } });
  expect(screen.queryByRole("region", { name: "Dados do servidor e vínculo selecionado" })).toBeNull();
  fireEvent.click(screen.getByRole("option", { name: "551023/2 - Ana Lúcia Ferreira" }));
  expect(screen.getByText("SES/MT", { exact: false })).toBeTruthy();
  expect(screen.queryByText("SEDUC/MT", { exact: false })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "✕ Limpar" }));
  expect(screen.queryByRole("region", { name: "Dados do servidor e vínculo selecionado" })).toBeNull();
});
it("calcula horas e dias corridos ou úteis", () => {
  expect(totalMinutos("08:00", "12:30")).toBe(270);
  expect(totalMinutos("12:00", "08:00")).toBe(0);
  expect(diasPeriodo("2026-10-23", "2026-10-26", true)).toBe(2);
  expect(diasPeriodo("2026-10-23", "2026-10-26", false)).toBe(4);
});
it("edita um registro existente sem duplicar a listagem", () => {
  const registro = registrosLicencas[0];
  render(<MemoryRouter><NovaSolicitacaoContent registro={registro} editar /></MemoryRouter>);
  expect((screen.getByLabelText("Data de Início *") as HTMLInputElement).value).toBe(registro.inicio);
  fireEvent.change(screen.getByLabelText("Observação / Documento de Respaldo"), { target: { value: "Dados revisados" } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
  expect(screen.queryByRole("alert")).toBeNull();
  const salvos = carregarGestaoLicencas().filter((r) => r.id === registro.id);
  expect(salvos).toHaveLength(1);
  expect(salvos[0].solicitacao?.observacao).toBe("Dados revisados");
  expect(salvos[0].nome).toBe(registro.nome);
});
it("exibe parentesco e salva somente o vínculo selecionado", () => {
  abrir();
  fireEvent.change(screen.getByLabelText("Buscar servidor"), {target: {value: "551023/1"}});
  fireEvent.click(screen.getByRole("option", {name: "551023/1 - Ana Lúcia Ferreira"}));
  expect(screen.getByText("SEDUC/MT", { exact: false })).toBeTruthy();
  expect(screen.queryByText("SES/MT", { exact: false })).toBeNull();
  fireEvent.change(
    screen.getByLabelText("Tipo de Licença, Afastamento ou Ausência *"),
    { target: { value: "lic-135" } },
  );
  fireEvent.change(screen.getByLabelText("Grau de Parentesco do Familiar *"), {
    target: { value: "Pai / Mãe" },
  });
  fireEvent.change(screen.getByLabelText("Data de Início *"), {
    target: { value: "2026-10-20" },
  });
  fireEvent.change(screen.getByLabelText("Data de Término *"), {
    target: { value: "2026-10-21" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Efetivar Lançamento" }));
  expect(screen.getByText("Listagem")).toBeTruthy();
  expect(carregarSolicitacoes()).toHaveLength(1);
  expect(carregarSolicitacoes()[0].vinculo).toBe(1);
  expect(carregarSolicitacoes()[0].solicitacao?.parentesco).toBe("Pai / Mãe");
});
it("calcula horas em parametrização ativa e rejeita horário invertido", () => {
  localStorage.setItem(
    STORAGE_LICENCAS,
    JSON.stringify(carregarEventos().map((e) => ({ ...e, situacao: "Ativo" }))),
  );
  abrir();
  fireEvent.change(
    screen.getByLabelText("Tipo de Licença, Afastamento ou Ausência *"),
    { target: { value: "aus-010" } },
  );
  expect(
    (screen.getByLabelText("Total de Horas Abatidas") as HTMLInputElement)
      .value,
  ).toBe("04:00 horas");
  fireEvent.change(screen.getByLabelText("Data de Início *"), {
    target: { value: "2026-10-20" },
  });
  fireEvent.change(screen.getByLabelText("Data de Término *"), {
    target: { value: "2026-10-20" },
  });
  fireEvent.change(screen.getByLabelText("Hora de Término *"), {
    target: { value: "07:00" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Efetivar Lançamento" }));
  expect(screen.getByRole("alert").textContent).toContain("horário de término");
  expect(carregarSolicitacoes()).toHaveLength(0);
});

it("calcula o termino pelo limite e bloqueia sua edicao", () => {
  abrir();
  fireEvent.change(screen.getByLabelText("Tipo de Licença, Afastamento ou Ausência *"), {target: {value: "lic-135"}});
  fireEvent.change(screen.getByLabelText("Data de Início *"), {target: {value: "2026-10-20"}});
  const fim = screen.getByLabelText("Data de Término *") as HTMLInputElement;
  expect(fim.readOnly).toBe(true);
  expect(fim.value).toBe("2026-10-27");
  fireEvent.change(screen.getByLabelText("Tipo de Licença, Afastamento ou Ausência *"), {target: {value: "lic-101"}});
  expect(fim.readOnly).toBe(false);
});

it("exige anexos quando a parametrizacao determina", () => {
  const eventos = carregarEventos();
  eventos[1].configuracao = {...configuracaoDoEvento(eventos[1]), documentosObrigatorios: true};
  localStorage.setItem(STORAGE_LICENCAS, JSON.stringify(eventos));
  abrir();
  fireEvent.change(screen.getByLabelText("Tipo de Licença, Afastamento ou Ausência *"), {target: {value: "lic-101"}});
  fireEvent.change(screen.getByLabelText("Data de Início *"), {target: {value: "2026-10-20"}});
  fireEvent.change(screen.getByLabelText("Data de Término *"), {target: {value: "2026-10-21"}});
  fireEvent.click(screen.getByRole("button", {name: "Efetivar Lançamento"}));
  expect(screen.getByText("Anexe pelo menos um documento comprobatório.")).toBeTruthy();
});
