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
    fireEvent.click(screen.getByRole("option", { name: /Ana Lúcia Ferreira/ }));
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
  }
}
it("busca por nome sem acentos, CPF formatado ou matrícula", () => {
  for (const termo of ["ANA LUCIA", "00088877766", "000.888.777-66", "551023"])
    expect(buscarServidores(termo)[0].nome).toBe("Ana Lúcia Ferreira");
  expect(buscarServidores("inexistente")).toHaveLength(0);
});
it("lista servidores ao focar e só mostra os vínculos depois da seleção", () => {
  abrir(false);
  expect(screen.queryByText("Nome do servidor")).toBeNull();
  expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  const busca = screen.getByRole("combobox", { name: "Buscar servidor" });
  fireEvent.focus(busca);
  expect(screen.getByRole("listbox", { name: "Servidores encontrados" })).toBeTruthy();
  expect(screen.getByRole("option", { name: /Ana Lúcia Ferreira/ })).toBeTruthy();
  expect(screen.getByRole("option", { name: /Valeria da Silva Pinto/ })).toBeTruthy();
  fireEvent.click(screen.getByRole("option", { name: /Ana Lúcia Ferreira/ }));
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(screen.getByText("Nome do servidor")).toBeTruthy();
  expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  fireEvent.change(busca, { target: { value: "inexistente" } });
  expect(screen.queryByText("Nome do servidor")).toBeNull();
  expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  expect(screen.getByRole("status").textContent).toContain("Nenhum servidor encontrado");
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
it("limpa o servidor e permite selecionar novamente pelo resultado da busca", () => {
  abrir();
  fireEvent.click(screen.getByRole("button", { name: "✕ Limpar" }));
  expect(screen.queryByText("Ana Lúcia Ferreira")).toBeNull();
  fireEvent.change(screen.getByLabelText("Buscar servidor"), {
    target: { value: "551023" },
  });
  fireEvent.click(screen.getByRole("option", { name: /Ana Lúcia Ferreira/ }));
  expect(
    screen
      .getAllByRole("checkbox")
      .every((c) => !(c as HTMLInputElement).checked),
  ).toBe(true);
});
it("exibe parentesco e salva um registro para cada vínculo selecionado", () => {
  abrir();
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
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
  expect(carregarSolicitacoes()).toHaveLength(2);
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
