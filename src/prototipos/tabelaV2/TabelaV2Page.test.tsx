// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { TabelaV2Page } from "./TabelaV2Page";
import { V2_BASE, V2_CARGOS, V2_EDITAIS, v2Seed, v2CreateCommissionedPair } from "./v2Store";

beforeEach(() => window.sessionStorage.clear());
const showHistoryDetails = (button: HTMLElement) => { fireEvent.click(button); };
afterEach(() => { cleanup(); window.sessionStorage.clear(); });

it("mostra uma linha por tabela compartilhada e abre o histórico no padrão do módulo original", () => {
  render(<MemoryRouter initialEntries={[V2_BASE]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getAllByRole("button", { name: "Expandir cargo" })[0]);
  expect(screen.getByRole("button", { name: "Visualizar TV2-001" })).toBeTruthy();
  const tables = screen.getByRole("table", { name: "Tabelas cadastradas para Auditor Fiscal" });
  expect(within(tables).getByRole("columnheader", { name: "ID" })).toBeTruthy();
  expect(within(tables).getByRole("cell", { name: "TV-0001" })).toBeTruthy();
  expect(screen.getAllByText("Nomeado Efetivo").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Contrato Temporário").length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole("button", { name: "Mais ações de TV2-001" }));
  fireEvent.click(screen.getByRole("button", { name: "Histórico" }));
  const dialog = screen.getByRole("dialog", { name: "Histórico da jornada" });
  expect(within(dialog).getByRole("columnheader", { name: "Origem da alteração" })).toBeTruthy();
  expect(within(dialog).getByRole("columnheader", { name: "Alterado por" })).toBeTruthy();
  expect(within(dialog).queryByRole("button", { name: "Histórico de Alterações" })).toBeNull();
  showHistoryDetails(within(dialog).getByRole("button", { name: /detalhes da versão/ }));
  expect(within(dialog).getByRole("button", { name: "Tabela de valores" })).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "Informações adicionais" }));
  expect(within(dialog).getByText("Identificador da tabela")).toBeTruthy();
  expect(within(dialog).getByText("TV-0001")).toBeTruthy();
  showHistoryDetails(within(dialog).getByRole("button", { name: /detalhes da versão/ }));
  expect(within(dialog).queryByRole("button", { name: "Informações adicionais" })).toBeNull();
});

it("cadastra uma tabela compartilhada para um cargo sem tabela inicial", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=2"]}><TabelaV2Page /></MemoryRouter>);
  expect(screen.queryByLabelText("Incide RGA? *")).toBeNull();
  fireEvent.change(screen.getByLabelText("Jornada *"), { target: { value: "40 horas" } });
  fireEvent.click(screen.getByRole("button", { name: "Selecionar Tipos de Vínculo" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Nomeado Efetivo" }));
  expect(screen.queryByRole("button", { name: "Selecionar editais" })).toBeNull();
  fireEvent.click(screen.getByRole("checkbox", { name: "Contrato Temporário" }));
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  const selectedEditais = V2_EDITAIS.filter((edital) => edital.situacao === "Em homologação").slice(0, 2);
  selectedEditais.forEach((edital) => fireEvent.click(screen.getByRole("checkbox", { name: edital.nome })));
  V2_EDITAIS.filter((edital) => edital.situacao !== "Em homologação").forEach((edital) => expect(screen.queryByRole("checkbox", { name: edital.nome })).toBeNull());
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  screen.getAllByPlaceholderText("R$ 0,00").forEach((cell) => fireEvent.change(cell, { target: { value: "4500,00" } }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar tabela" }));
  fireEvent.click(within(screen.getByRole("dialog", { name: "Confirmar cadastro da tabela" })).getByRole("button", { name: "Confirmar cadastro" }));
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  expect(saved.find((record: { cargoId: number }) => record.cargoId === 2).editais).toEqual(selectedEditais.map((edital) => edital.id));
  const journeysTable = screen.getByRole("table", { name: /Tabelas cadastradas para/ });
  expect(within(journeysTable).getByRole("columnheader", { name: "Edital" })).toBeTruthy();
  selectedEditais.forEach((edital) => expect(within(journeysTable).getByText(edital.nome).className).toContain("v2-chip"));
  expect(saved.some((record: { cargoId: number; jornada: string; links: { tipo: string }[] }) =>
    record.cargoId === 2 && record.jornada === "40 horas" && record.links.length === 2)).toBe(true);
});

it("cadastra uma exceção compartilhada com perfil e local próprios", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/excecao/nova?cargo=1"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Selecionar Tipos de Vínculo" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Nomeado Efetivo" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Contrato Temporário" }));
  fireEvent.change(screen.getByLabelText("Perfil Profissional *"), { target: { value: "Auditoria" } });
  expect(screen.queryByPlaceholderText("Buscar lotação")).toBeNull();
  fireEvent.change(screen.getByLabelText("Local de Lotação *"), { target: { value: "Secretaria de Estado de Fazenda (SEFAZ-MT)" } });
  const horas = screen.getByLabelText("Horas trabalhadas") as HTMLSelectElement;
  expect([...horas.options].map((option) => option.textContent)).toEqual(["Selecione", "6 horas", "4 horas", "17 horas"]);
  fireEvent.change(horas, { target: { value: "6h" } });
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
  expect(screen.queryByRole("alert")?.textContent).toBeUndefined();
  screen.getAllByPlaceholderText("R$ 0,00").forEach((cell) => fireEvent.change(cell, { target: { value: "4500,00" } }));
  fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
  expect(screen.getByRole("heading", { name: "Confirmação da Exceção" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Salvar Exceção" }));
  fireEvent.click(within(screen.getByRole("dialog", { name: "Confirmar cadastro da Exceção" })).getByRole("button", { name: "Confirmar cadastro" }));
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  expect(saved.some((record: { kind: string; perfil: string; local: string; horasTrabalhadas?: string; links: unknown[] }) =>
    record.kind === "excecao" && record.perfil === "Auditoria" && record.local === "Secretaria de Estado de Fazenda (SEFAZ-MT)" && record.horasTrabalhadas === "6h" && record.links.length === 2)).toBe(true);
});

it("aplica RGA em lote somente ao vínculo elegível após confirmação", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/rga-em-lote"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText("Percentual de RGA (%) *"), { target: { value: "5.4" } });
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  fireEvent.change(screen.getByLabelText("Base Legal *"), { target: { value: "Lei 999/2026" } });
  fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar TV2-001" }));
  fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
  expect(screen.getByRole("heading", { name: "Resumo da aplicação" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar Aplicação" }));
  const dialog = screen.getByRole("dialog", { name: "Confirmar aplicação de RGA" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Confirmar Aplicação" }));
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  const revised = saved.find((record: { origem: string; referencia: string }) =>
    record.origem === "RGA" && record.referencia === "TV2-001 V1");
  expect(revised.links.map((link: { tipo: string }) => link.tipo)).toEqual(["Nomeado Efetivo"]);
  expect(revised.events[0].before.rows[0].values[0]).toBe("R$ 4.500,00");
});

it("versiona apenas um vínculo de uma tabela compartilhada e preserva o outro", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/versionar?registro=TV2-001-v1"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Remover Contrato Temporário" }));
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
  fireEvent.change(screen.getByRole("textbox", { name: "001 / A" }), { target: { value: "4750,00" } });
  expect(screen.queryByRole("button", { name: "Confirmação do versionamento" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar versionamento" }));
  expect(within(screen.getByRole("dialog", { name: "Confirmar versionamento" })).getByText("Contrato Temporário", { selector: "strong" })).toBeTruthy();
  fireEvent.click(within(screen.getByRole("dialog", { name: "Confirmar versionamento" })).getByRole("button", { name: "Confirmar versionamento" }));
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  const split = saved.find((record: { previousId?: string }) => record.previousId === "TV2-001-v1");
  expect(split.tableId).not.toBe("TV2-001");
  expect(split.links.map((link: { tipo: string }) => link.tipo)).toEqual(["Nomeado Efetivo"]);
  expect(split.links[0].incideRga).toBe(true);
  expect(saved.find((record: { id: string }) => record.id === "TV2-001-v1").links.find((link: { tipo: string }) => link.tipo === "Contrato Temporário").fim).toBeUndefined();
});

it("gera e aprova tabela proporcional com valores por nível e classe", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=3"]}><TabelaV2Page /></MemoryRouter>);
  expect(screen.queryByLabelText("Estrutura de Vencimento *")).toBeNull();
  expect(screen.getByRole("button", { name: "Valores por Nível e Classe" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Selecionar Tipos de Vínculo" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Nomeado Efetivo" }));
  fireEvent.change(screen.getByLabelText("Jornada *"), { target: { value: "20 horas" } });
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.change(screen.getByLabelText(/Esta será a tabela de referência/), { target: { value: "Sim" } });
  fireEvent.click(screen.getByRole("checkbox", { name: "Gerar 40 horas para Nomeado Efetivo" }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  screen.getAllByPlaceholderText("R$ 0,00").forEach(cell => fireEvent.change(cell, { target: { value: "4500,00" } }));
  fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
  expect(screen.getByRole("heading", { name: "Revisão das Jornadas" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Aprovar cálculo" }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar tabela" }));
  fireEvent.click(within(screen.getByRole("dialog", { name: "Confirmar cadastro da tabela" })).getByRole("button", { name: "Confirmar cadastro" }));
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  const generated = saved.find((record: { cargoId: number; origem: string }) => record.cargoId === 3 && record.origem === "Proporcional");
  expect(generated.links.map((link: { tipo: string }) => link.tipo)).toEqual(["Nomeado Efetivo"]);
  expect(generated.matrix.rows[0].values[0]).toContain("9.000,00");
});

it("cria duas tabelas comissionadas com subsídio e gratificação sem matriz de níveis", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=101"]}><TabelaV2Page /></MemoryRouter>);
  const journeysTable = screen.getByRole("table", { name: /Tabelas cadastradas para/ });
  expect(within(journeysTable).getByText("40 horas")).toBeTruthy();
  expect(within(journeysTable).getByText("Sem tabela cadastrada")).toBeTruthy();
  expect(within(journeysTable).getAllByRole("row")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: /Cadastrar tabela para 40 horas do cargo/ }));
  fireEvent.click(within(screen.getByRole("dialog", { name: "Criar tabela para 40 horas" })).getByRole("button", { name: "Continuar" }));
  expect((screen.getByLabelText("Jornada *") as HTMLSelectElement).value).toBe("40 horas");
  expect(screen.queryByRole("button", { name: "Selecionar Tipos de Vínculo" })).toBeNull();
  expect(screen.queryByLabelText("Estrutura remuneratória *")).toBeNull();
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  expect(screen.queryByRole("textbox", { name: "001 / A" })).toBeNull();
  fireEvent.change(screen.getByLabelText("Subsídio — Exclusivamente Comissionado *"), { target: { value: "7000,00" } });
  fireEvent.change(screen.getByLabelText("Percentual — Nomeado Efetivo *"), { target: { value: "85" } });
  expect((screen.getByLabelText("Referência") as HTMLInputElement).readOnly).toBe(true);
  expect(within(screen.getByRole("table", { name: "Resumo dos valores comissionados" })).getByText(/5.950,00/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  expect(screen.queryByRole("alert")?.textContent).toBeUndefined();
  fireEvent.click(within(screen.getByRole("dialog", { name: "Confirmar cadastro da tabela" })).getByRole("button", { name: "Confirmar cadastro" }));
  expect(within(screen.getByRole("table", { name: /Tabelas cadastradas para/ })).getByRole("columnheader", { name: "Tipo(s) de Vínculo" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Cadastrar tabela para 40 horas do cargo/ })).toBeNull();
  expect(within(screen.getByRole("table", { name: /Tabelas cadastradas para/ })).queryByText("Sem tabela cadastrada")).toBeNull();
  expect(within(screen.getByRole("table", { name: /Tabelas cadastradas para/ })).getAllByRole("row")).toHaveLength(3);
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  const pair = saved.filter((record: { cargoId: number }) => record.cargoId === 101);
  expect(pair).toHaveLength(2);
  expect(pair[0].remuneracao).toEqual({ tipo: "subsidio", valor: expect.stringContaining("7.000,00") });
  expect(pair[1].remuneracao).toEqual({ tipo: "gratificacao", valor: "85", baseCalculo: expect.stringContaining("7.000,00"), valorCalculado: expect.stringContaining("5.950,00") });
  expect(pair.map((record: { links: { tipo: string }[] }) => record.links.map(link => link.tipo))).toEqual([["Exclusivamente Comissionado"], ["Nomeado Efetivo"]]);
  expect(pair[0].tableNumber).not.toBe(pair[1].tableNumber);
});

it("versiona exceção compartilhada para um vínculo sem afetar o outro", () => {
  const original = v2Seed()[0];
  const exception = { ...original, id: "exception-test-v1", tableId: "EX2-TEST", kind: "excecao" as const,
    jornada: undefined, perfil: "Auditoria", local: "Secretaria de Estado de Fazenda (SEFAZ-MT)",
    baseLegalId: "lc-500-2026", baseLegal: "LC nº 500/2026" };
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify([...v2Seed(), exception]));
  render(<MemoryRouter initialEntries={[V2_BASE + "/versionar?registro=" + exception.id]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Remover Contrato Temporário" }));
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
  fireEvent.change(screen.getByRole("textbox", { name: "001 / A" }), { target: { value: "4750,00" } });
  expect(screen.queryByRole("button", { name: "Confirmação do versionamento" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar versionamento" }));
  expect(within(screen.getByRole("dialog", { name: "Confirmar versionamento" })).getByText("Contrato Temporário", { selector: "strong" })).toBeTruthy();
  fireEvent.click(within(screen.getByRole("dialog", { name: "Confirmar versionamento" })).getByRole("button", { name: "Confirmar versionamento" }));
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  const split = saved.find((record: { previousId?: string }) => record.previousId === exception.id);
  expect(split.kind).toBe("excecao");
  expect(split.perfil).toBe("Auditoria");
  expect(split.links.map((link: { tipo: string }) => link.tipo)).toEqual(["Nomeado Efetivo"]);
  expect(split.links[0].incideRga).toBe(true);
  expect(saved.find((record: { id: string }) => record.id === exception.id).links.find((link: { tipo: string }) => link.tipo === "Contrato Temporário").fim).toBeUndefined();
});

it("bloqueia versionamento direto de Nomeado Efetivo comissionado", () => {
  const source = { ...v2Seed()[0], id: "commission-gratification-v1", tableId: "TV2-COM-TEST", cargoId: 101, jornada: "40 horas",
    links: [{ tipo: "Nomeado Efetivo", inicio: "2026-01-01", incideRga: false }],
    remuneracao: { tipo: "gratificacao", valor: "85", baseCalculo: "R$ 7.000,00", valorCalculado: "R$ 5.950,00" } };
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify([source]));
  render(<MemoryRouter initialEntries={[V2_BASE + "/versionar?registro=" + source.id]}><TabelaV2Page /></MemoryRouter>);
  expect(screen.getByRole("alert").textContent).toContain("Exclusivamente Comissionado");
  expect(screen.queryByRole("button", { name: "Confirmar versionamento" })).toBeNull();
});
it("informa no modal e versiona as duas tabelas pelo subsídio comissionado", () => {
  const pair = v2CreateCommissionedPair([], {
    ...v2Seed()[0], cargoId: 101, jornada: "40 horas", inicio: "2026-01-01", fim: undefined, editais: [],
    links: [{ tipo: "Exclusivamente Comissionado", inicio: "2026-01-01", incideRga: false }],
    baseLegalId: "lc-500-2026", baseLegal: "LC nº 500/2026", origem: "Manual",
  }, "7000", "85");
  if (!pair.ok) throw new Error(pair.message);
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify(pair.records));
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=101"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Mais ações de " + pair.created[1].tableId }));
  expect(screen.queryByRole("button", { name: "Versionar" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Mais ações de " + pair.created[0].tableId }));
  fireEvent.click(screen.getByRole("button", { name: "Versionar" }));
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  expect((screen.getByLabelText("Subsídio — Exclusivamente Comissionado *") as HTMLInputElement).value).toContain("7.000,00");
  expect((screen.getByLabelText("Percentual — Nomeado Efetivo *") as HTMLInputElement).value).toBe("85%");
  fireEvent.change(screen.getByLabelText("Subsídio — Exclusivamente Comissionado *"), { target: { value: "8000" } });
  fireEvent.change(screen.getByLabelText("Percentual — Nomeado Efetivo *"), { target: { value: "90" } });
  expect(within(screen.getByRole("table", { name: "Resumo dos valores comissionados" })).getByText(/7.200,00/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar versionamento" }));
  const modal = screen.getByRole("dialog", { name: "Confirmar versionamento" });
  expect(within(modal).getByText(/serão versionadas automaticamente/)).toBeTruthy();
  expect(within(modal).getByText(/7.200,00/)).toBeTruthy();
  expect(JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]")).toHaveLength(2);
  fireEvent.click(within(modal).getByRole("button", { name: "Confirmar versionamento" }));
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  expect(saved).toHaveLength(4);
  expect(saved.find((record: { previousId?: string }) => record.previousId === pair.created[1].id).remuneracao.valor).toBe("90");
  expect(saved.filter((record: { version: number }) => record.version === 2)).toHaveLength(2);
  expect(saved.find((record: { previousId?: string }) => record.previousId === pair.created[1].id).remuneracao.valorCalculado).toContain("7.200,00");
});

it("filtra por cargo selecionado sem pesquisar e restaura a lista ao limpar", () => {
  render(<MemoryRouter initialEntries={[V2_BASE]}><TabelaV2Page /></MemoryRouter>);
  const select = screen.getByRole("combobox", { name: /Cargo ou Nome do Cargo/ });
  expect(screen.queryByRole("button", { name: "Pesquisar" })).toBeNull();
  const options = within(select).getAllByRole("option");
  expect(options).toHaveLength(V2_CARGOS.length + 1);
  V2_CARGOS.forEach((cargo) => expect(within(select).getByRole("option", { name: String(cargo.id).padStart(4, "0") + " - " + cargo.nome })).toBeTruthy());
  fireEvent.change(select, { target: { value: "2" } });
  const table = screen.getByRole("table");
  expect(within(table).getAllByRole("row")).toHaveLength(2);
  expect(within(table).getByText(V2_CARGOS.find((cargo) => cargo.id === 2)!.nome)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
  expect((select as HTMLSelectElement).value).toBe("");
  expect(within(table).getAllByRole("row")).toHaveLength(V2_CARGOS.length + 1);
});

it("aplica RGA individual pelo menu somente após simulação e confirmação", () => {
  const records = structuredClone(v2Seed());
  records[0].links.forEach((link) => { link.incideRga = false; });
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify(records));
  render(<MemoryRouter initialEntries={[V2_BASE]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getAllByRole("button", { name: "Expandir cargo" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "Mais ações de TV2-001" }));
  fireEvent.click(screen.getByRole("button", { name: "Aplicar RGA" }));
  expect(screen.getByRole("heading", { name: "Parametrização da RGA" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Finalizar" }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByText("Execute a simulação para visualizar os novos valores.")).toBeTruthy();
  const apply = screen.getByRole("button", { name: "Aplicar RGA" }) as HTMLButtonElement;
  expect(apply.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText("Percentual do RGA*"), { target: { value: "540" } });
  fireEvent.change(screen.getByLabelText("Data início da vigência do RGA*"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.click(screen.getByRole("button", { name: "Simular aplicação" }));
  expect(apply.disabled).toBe(false);
  expect(screen.getByRole("columnheader", { name: "Diferença" })).toBeTruthy();
  expect(screen.getAllByText(/4\.743,00/).length).toBeGreaterThan(0);
  expect(JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]")).toHaveLength(records.length);
  fireEvent.change(screen.getByLabelText("Percentual do RGA*"), { target: { value: "600" } });
  expect(apply.disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Simular aplicação" }));
  fireEvent.click(apply);
  fireEvent.click(within(screen.getByRole("dialog", { name: "Aplicar RGA" })).getByRole("button", { name: "Cancelar" }));
  expect(JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]")).toHaveLength(records.length);
  fireEvent.click(apply);
  fireEvent.change(screen.getByLabelText("Observação"), { target: { value: "Reajuste anual" } });
  fireEvent.click(within(screen.getByRole("dialog", { name: "Aplicar RGA" })).getByRole("button", { name: "Confirmar aplicação" }));
  const appliedRecords = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  expect(appliedRecords).toHaveLength(records.length + 1);
  expect(appliedRecords.find((record: { previousId?: string }) => record.previousId === records[0].id).version).toBe(2);
  expect(screen.getByText("Versão atual")).toBeTruthy();
  expect(apply.disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Finalizar" }));
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  const revised = saved.find((record: { previousId?: string }) => record.previousId === records[0].id);
  expect(revised.tableId).toBe(records[0].tableId);
  expect(revised.version).toBe(2);
  expect(revised.links).toHaveLength(2);
  expect(revised.events[0].percent).toBe(6);
  expect(revised.events[0].year).toBe(String(new Date().getFullYear()));
  expect(revised.observacao).toBe("Reajuste anual");
  expect(revised.events[0].before.rows[0].values[0]).toBe("R$ 4.500,00");
  expect(revised.matrix.rows[0].values[0]).toContain("4.770,00");
});

it("oculta e limpa os editais ao remover o vínculo temporário", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=2"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Selecionar Tipos de Vínculo" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Contrato Temporário" }));
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  const edital = V2_EDITAIS.find((item) => item.situacao === "Em homologação")!;
  fireEvent.click(screen.getByRole("checkbox", { name: edital.nome }));
  fireEvent.click(screen.getByRole("button", { name: "Remover Contrato Temporário" }));
  expect(screen.queryByRole("button", { name: "Selecionar editais" })).toBeNull();
  fireEvent.click(screen.getByRole("checkbox", { name: "Contrato Temporário" }));
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  expect((screen.getByRole("checkbox", { name: edital.nome }) as HTMLInputElement).checked).toBe(false);
});

it("usa sempre a segunda aba por nível e classe nos cargos não comissionados", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=2"]}><TabelaV2Page /></MemoryRouter>);
  expect(screen.queryByLabelText("Estrutura de Vencimento *")).toBeNull();
  expect(screen.queryByLabelText("Valor de Referência *")).toBeNull();
  expect(screen.getByRole("button", { name: "Valores por Nível e Classe" })).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Jornada *"), { target: { value: "40 horas" } });
  fireEvent.click(screen.getByRole("button", { name: "Selecionar Tipos de Vínculo" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Nomeado Efetivo" }));
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  expect(screen.getByRole("heading", { name: "Valores por Nível e Classe" })).toBeTruthy();
  expect(screen.getByRole("textbox", { name: "001 / A" })).toBeTruthy();
});

it("fecha os dropdowns ao clicar fora e mantém os asteriscos nos campos obrigatórios", () => {
  const { container } = render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=2"]}><TabelaV2Page /></MemoryRouter>);
  container.querySelectorAll("label").forEach((label) => {
    if (label.textContent?.includes("*")) expect(label.querySelector(".v2-required, [class*='required']")).toBeTruthy();
  });
  const links = screen.getByRole("button", { name: "Selecionar Tipos de Vínculo" });
  fireEvent.click(links);
  const temporary = screen.getByRole("checkbox", { name: "Contrato Temporário" });
  fireEvent.mouseDown(temporary);
  expect(links.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(temporary);
  fireEvent.mouseDown(screen.getByLabelText("Cargo *"));
  expect(links.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByLabelText("Buscar Tipo de Vínculo")).toBeNull();

  const editais = screen.getByRole("button", { name: "Selecionar editais" });
  fireEvent.click(editais);
  fireEvent.click(screen.getByRole("checkbox", { name: V2_EDITAIS[0].nome }));
  fireEvent.mouseDown(screen.getByLabelText("Cargo *"));
  expect(editais.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByLabelText("Buscar edital")).toBeNull();
  expect(screen.getByRole("button", { name: "Remover edital " + V2_EDITAIS[0].nome })).toBeTruthy();

  const legal = screen.getByPlaceholderText("Buscar documentos legais...");
  const combo = legal.closest('[role="combobox"]')!;
  fireEvent.click(legal);
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.mouseDown(screen.getByLabelText("Cargo *"));
  expect(combo.getAttribute("aria-expanded")).toBe("false");
});

it("exibe o indicador, a matriz e os detalhes dos editais obrigatórios", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=1"]}><TabelaV2Page /></MemoryRouter>);
  const panel = screen.getByRole("region", { name: "Cobertura de Auditor Fiscal" });
  expect(within(panel).getByText("Cobertura por Jornada e Tipo de Vínculo")).toBeTruthy();
  fireEvent.click(within(panel).getByRole("button", { name: "Cobertura por Jornada e Tipo de Vínculo" }));
  fireEvent.click(within(panel).getByRole("button", { name: "Ver detalhes de 40 horas — Contrato Temporário" }));
  const detailsTable = within(panel).getByRole("table", { name: "Detalhamento por edital" });
  expect(within(detailsTable).getByText(V2_EDITAIS[0].nome)).toBeTruthy();
  expect(within(detailsTable).getByText("Pendente")).toBeTruthy();
  fireEvent.click(within(panel).getByRole("button", { name: "Ver detalhes de 40 horas — Contrato Temporário" }));
  expect(within(panel).queryByRole("table", { name: "Detalhamento por edital" })).toBeNull();
});

it("recalcula a cobertura após alteração dos registros sem recarregar a página", () => {
  render(<MemoryRouter initialEntries={[V2_BASE]}><TabelaV2Page /></MemoryRouter>);
  const firstRow = within(screen.getByRole("table")).getAllByRole("row")[1];
  expect(within(firstRow).getByText("5 de 9 combinações")).toBeTruthy();
  fireEvent(window, new Event("focus"));
  window.sessionStorage.setItem("sigep-tabela-v2-v1", "[]");
  fireEvent(window, new Event("v2-records-updated"));
  expect(within(firstRow).getByText("0 de 9 combinações")).toBeTruthy();
  expect(within(firstRow).getByText("Pendente")).toBeTruthy();
});

it("oculta a demonstração de cobertura e mantém a ação de RGA em lote", () => {
  render(<MemoryRouter initialEntries={[V2_BASE]}><TabelaV2Page /></MemoryRouter>);
  expect(screen.queryByRole("button", { name: "Ver demonstração de cobertura" })).toBeNull();
  expect(screen.getByRole("button", { name: "Aplicar RGA em lote" })).toBeTruthy();
});

it("abre a segunda aba diretamente e preserva os valores ao voltar", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=2"]}><TabelaV2Page /></MemoryRouter>);
  const valuesTab = screen.getByRole("button", { name: "Valores por Nível e Classe" });
  expect(valuesTab.hasAttribute("disabled")).toBe(false);
  fireEvent.click(valuesTab);
  const value = screen.getByRole("textbox", { name: "001 / A" });
  fireEvent.change(value, { target: { value: "4500,00" } });
  fireEvent.click(screen.getByRole("button", { name: "Identificação e vigência" }));
  expect(screen.getByLabelText("Jornada *")).toBeTruthy();
  fireEvent.click(valuesTab);
  expect((screen.getByRole("textbox", { name: "001 / A" }) as HTMLInputElement).value).toBe("4500,00");
});

it.each(["padrao", "excecao", "comissionado"] as const)("oferece RGA e versionamento para tabela vigente (%s)", (type) => {
  const source = { ...structuredClone(v2Seed()[0]), id: "all-actions-v1", tableId: "ALL-ACTIONS",
    cargoId: type === "comissionado" ? 101 : 1,
    kind: type === "excecao" ? "excecao" as const : "padrao" as const,
    jornada: type === "excecao" ? undefined : type === "comissionado" ? "40 horas" : "20 horas",
    perfil: type === "excecao" ? "Auditoria" : undefined,
    local: type === "excecao" ? "Secretaria de Estado de Fazenda (SEFAZ-MT)" : undefined };
  if (type === "comissionado") source.links = [{ tipo: "Exclusivamente Comissionado", inicio: source.inicio, incideRga: false }];
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify([source]));
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=" + source.cargoId]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Mais ações de ALL-ACTIONS" }));
  expect(screen.getByRole("button", { name: "Versionar" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Aplicar RGA" }));
  expect(screen.getByRole("heading", { name: "Parametrização da RGA" })).toBeTruthy();
});

it.each(["Futura", "Encerrada"])("mantém apenas histórico para tabela não vigente (%s)", (status) => {
  const source = { ...structuredClone(v2Seed()[0]), inicio: status === "Futura" ? "9999-01-01" : "2000-01-01",
    fim: status === "Encerrada" ? "2000-12-31" : undefined };
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify([source]));
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=1"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Mais ações de TV2-001" }));
  expect(screen.queryByRole("button", { name: "Aplicar RGA" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Versionar" })).toBeNull();
  expect(screen.getByRole("button", { name: "Histórico" })).toBeTruthy();
});

it("copia a tabela anterior do cargo e da jornada sem exigir vínculo selecionado", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=1&jornada=20%20horas"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Valores por Nível e Classe" }));
  const copy = screen.getByRole("button", { name: "Copiar valores da tabela anterior" });
  expect(copy.hasAttribute("disabled")).toBe(false);
  fireEvent.click(copy);
  expect((screen.getByRole("textbox", { name: "001 / A" }) as HTMLInputElement).value).toBe(v2Seed()[0].matrix.rows[0].values[0]);
  expect((screen.getByRole("textbox", { name: "Classe 3" }) as HTMLInputElement).value).toBe("C");
});
it("desabilita a cópia quando não existe tabela anterior para o cargo e a jornada", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=2&jornada=40%20horas"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Valores por Nível e Classe" }));
  expect(screen.getByRole("button", { name: "Copiar valores da tabela anterior" }).hasAttribute("disabled")).toBe(true);
});

it("permite todas as jornadas proporcionais para os vínculos selecionados", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=3&jornada=20%20horas"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText(/Esta será a tabela de referência/), { target: { value: "Sim" } });
  const generation = screen.getByRole("region", { name: "Geração proporcional" });
  expect(within(generation).getAllByRole("checkbox")).toHaveLength(2);
  within(generation).getAllByRole("checkbox").forEach((box) => expect((box as HTMLInputElement).disabled).toBe(true));
  fireEvent.click(screen.getByRole("button", { name: "Selecionar Tipos de Vínculo" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Nomeado Efetivo" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Contrato Temporário" }));
  expect((screen.getByRole("checkbox", { name: "Gerar 30 horas para Nomeado Efetivo, Contrato Temporário" }) as HTMLInputElement).disabled).toBe(false);
  expect((screen.getByRole("checkbox", { name: "Gerar 40 horas para Nomeado Efetivo, Contrato Temporário" }) as HTMLInputElement).disabled).toBe(false);
  expect(within(generation).queryByText("Jornada incompatível com os vínculos da referência.")).toBeNull();
});

it("cadastra referência e duas proporcionais com os mesmos três vínculos e editais", () => {
  const types = ["Nomeado Efetivo", "Estabilizado Constitucionalmente", "Contrato Temporário"];
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=8&jornada=40%20horas"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Selecionar Tipos de Vínculo" }));
  types.forEach((tipo) => fireEvent.click(screen.getByRole("checkbox", { name: tipo })));
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  fireEvent.click(screen.getByRole("checkbox", { name: V2_EDITAIS[0].nome }));
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.change(screen.getByLabelText(/Esta será a tabela de referência/), { target: { value: "Sim" } });
  for (const journey of ["20 horas", "30 horas"]) {
    fireEvent.click(screen.getByRole("checkbox", { name: "Gerar " + journey + " para " + types.join(", ") }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  screen.getAllByPlaceholderText("R$ 0,00").forEach((cell) => fireEvent.change(cell, { target: { value: "4000,00" } }));
  fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
  fireEvent.click(screen.getByRole("button", { name: "Aprovar cálculo" }));
  fireEvent.click(screen.getByRole("button", { name: "30 horas — " + types.join(", ") }));
  fireEvent.click(screen.getByRole("button", { name: "Aprovar cálculo" }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar tabela" }));
  fireEvent.click(within(screen.getByRole("dialog", { name: "Confirmar cadastro da tabela" })).getByRole("button", { name: "Confirmar cadastro" }));
  const records = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  const created = records.filter((record: { cargoId: number }) => record.cargoId === 8);
  expect(created).toHaveLength(3);
  created.forEach((record: { links: { tipo: string }[]; editais: string[] }) => {
    expect(record.links.map((link) => link.tipo)).toEqual(types);
    expect(record.editais).toEqual([V2_EDITAIS[0].id]);
  });
  const reference = created.find((record: { origem: string }) => record.origem === "Referência");
  expect(reference.jornada).toBe("40 horas");
  for (const [journey, expected, percent] of [["20 horas", "2.000,00", 50], ["30 horas", "3.000,00", 75]]) {
    const proportional = created.find((record: { jornada: string }) => record.jornada === journey);
    expect(proportional.origem).toBe("Proporcional");
    expect(proportional.matrix.rows[0].values[0]).toContain(expected);
    expect(proportional.proporcional).toMatchObject({ referenciaId: reference.id, percentual: percent });
  }
});

it("atualiza a grid e a matriz ao incluir referência e proporcionais vigentes com edital", () => {
  window.sessionStorage.setItem("sigep-tabela-v2-v1", "[]");
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=5"]}><TabelaV2Page /></MemoryRouter>);
  const panel = screen.getByRole("region", { name: "Cobertura de Assistente de Apoio Temporário" });
  expect(within(screen.getByText("0005").closest("tr")!).getByText("0 de 3 combinações")).toBeTruthy();
  const records = ["20 horas", "30 horas", "40 horas"].map((jornada, index) => ({
    ...structuredClone(v2Seed()[0]), id: "coverage-temp-" + index, tableId: "COVERAGE-TEMP-" + index,
    cargoId: 5, jornada, editais: [V2_EDITAIS[0].id], origem: index ? "Proporcional" : "Referência",
    links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }],
  }));
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify(records));
  fireEvent(window, new Event("v2-records-updated"));
  expect(within(screen.getByText("0005").closest("tr")!).getByText("3 de 3 combinações")).toBeTruthy();
  fireEvent.click(within(panel).getByRole("button", { name: "Cobertura por Jornada e Tipo de Vínculo" }));
  expect(within(panel).getAllByText("Vigente")).toHaveLength(3);
  const row = screen.getByText("0005").closest("tr")!;
  expect(within(row).getByText("3 de 3 combinações")).toBeTruthy();
  expect(within(row).getByText("Completa")).toBeTruthy();
  expect(within(row).queryByRole("progressbar")).toBeNull();
  expect(within(panel).getByRole("progressbar").getAttribute("aria-valuenow")).toBe("3");
});

it("risca e bloqueia editais usados no cargo e cadastra outra tabela com edital diferente", () => {
  const previous = { ...structuredClone(v2Seed()[0]), id: "edital-used-v1", tableId: "EDITAL-USED", cargoId: 5,
    editais: [V2_EDITAIS[0].id], links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }] };
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify([previous]));
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=5&jornada=20%20horas"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  const used = screen.getByRole("checkbox", { name: V2_EDITAIS[0].nome }) as HTMLInputElement;
  expect(used.disabled).toBe(true);
  expect(used.closest("label")?.className).toContain("v2-edital-used");
  expect((screen.getByRole("checkbox", { name: V2_EDITAIS[1].nome }) as HTMLInputElement).disabled).toBe(false);
  fireEvent.click(screen.getByRole("checkbox", { name: V2_EDITAIS[1].nome }));
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  fireEvent.change(screen.getByLabelText("Data início da vigência *"), { target: { value: "2026-02-12" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  expect(screen.queryByRole("alert")).toBeNull();
  screen.getAllByPlaceholderText("R$ 0,00").forEach((cell) => fireEvent.change(cell, { target: { value: "4000,00" } }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar tabela" }));
  fireEvent.click(within(screen.getByRole("dialog", { name: "Confirmar cadastro da tabela" })).getByRole("button", { name: "Confirmar cadastro" }));
  const records = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  expect(records).toHaveLength(2);
  expect(records[0].editais).toEqual([V2_EDITAIS[0].id]);
  expect(records[1].editais).toEqual([V2_EDITAIS[1].id]);
});

it("permite manter o edital da própria tabela no versionamento", () => {
  const source = { ...structuredClone(v2Seed()[0]), id: "edital-version-v1", tableId: "EDITAL-VERSION", cargoId: 5,
    editais: [V2_EDITAIS[0].id], links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }] };
  const another = { ...source, id: "another-edital-v1", tableId: "ANOTHER-EDITAL", editais: [V2_EDITAIS[1].id] };
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify([source, another]));
  render(<MemoryRouter initialEntries={[V2_BASE + "/versionar?registro=" + source.id]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  const own = screen.getByRole("checkbox", { name: V2_EDITAIS[0].nome }) as HTMLInputElement;
  expect(own.checked).toBe(true);
  expect(own.disabled).toBe(false);
  expect((screen.getByRole("checkbox", { name: V2_EDITAIS[1].nome }) as HTMLInputElement).disabled).toBe(true);
});

it("mantém a cobertura recolhida, sem repetições, e conta tabelas sem contar versões", () => {
  const records = structuredClone(v2Seed());
  records.push({ ...structuredClone(records[0]), id: "another-version", version: 2 });
  records.push({ ...structuredClone(records[0]), id: "exception-count", tableId: "EX-COUNT", kind: "excecao", perfil: "Auditoria", local: "SEFAZ" });
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify(records));
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=1"]}><TabelaV2Page /></MemoryRouter>);
  const row = screen.getByText("Auditor Fiscal", { selector: "td" }).closest("tr")!;
  expect(within(row).getAllByRole("cell")[5].textContent).toBe("5");
  expect(within(row).getByText("5 de 9 combinações")).toBeTruthy();
  expect(screen.queryByRole("progressbar")).toBeNull();
  const panel = screen.getByRole("region", { name: "Cobertura de Auditor Fiscal" });
  const toggle = within(panel).getByRole("button", { name: "Cobertura por Jornada e Tipo de Vínculo" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(within(panel).queryByRole("table")).toBeNull();
  expect(within(panel).queryByText(/Carreira:/)).toBeNull();
  expect(within(panel).queryByText(/combinações/)).toBeNull();
  fireEvent.click(toggle);
  expect(within(panel).getByRole("table", { name: "Matriz de cobertura" })).toBeTruthy();
  expect(within(panel).getByText("5 de 9 combinações vigentes")).toBeTruthy();
  expect(within(panel).getByRole("progressbar").getAttribute("aria-valuenow")).toBe("5");
  expect(screen.getByRole("button", { name: "Recolher cargo" }).getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(toggle);
  expect(within(panel).queryByRole("table")).toBeNull();
  expect(screen.getByRole("table", { name: "Tabelas cadastradas para Auditor Fiscal" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Recolher cargo" }).getAttribute("aria-expanded")).toBe("true");
});

it("bloqueia editais somente na jornada selecionada e atualiza a seleção ao trocar de jornada", () => {
  const previous = { ...structuredClone(v2Seed()[0]), id: "journey-edital-v1", tableId: "JOURNEY-EDITAL", cargoId: 5,
    jornada: "20 horas", editais: [V2_EDITAIS[1].id], links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }] };
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify([previous]));
  render(<MemoryRouter initialEntries={[V2_BASE + "/novo?cargo=5&jornada=30%20horas"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Selecionar editais" }));
  const option = () => screen.getByRole("checkbox", { name: V2_EDITAIS[1].nome }) as HTMLInputElement;
  expect(option().disabled).toBe(false);
  fireEvent.click(option());
  expect(option().checked).toBe(true);
  fireEvent.change(screen.getByLabelText("Jornada *"), { target: { value: "40 horas" } });
  expect(option().disabled).toBe(false);
  expect(option().checked).toBe(true);
  fireEvent.change(screen.getByLabelText("Jornada *"), { target: { value: "20 horas" } });
  expect(option().disabled).toBe(true);
  expect(option().checked).toBe(false);
  expect(option().closest("label")?.className).toContain("v2-edital-used");
  fireEvent.change(screen.getByLabelText("Jornada *"), { target: { value: "30 horas" } });
  expect(option().disabled).toBe(false);
  expect(option().closest("label")?.className || "").not.toContain("v2-edital-used");
});


it("abre o cadastro somente leitura ao visualizar e mantém as abas e os dados salvos", () => {
  const records = v2Seed();
  const record = records[0];
  record.fim = "2027-12-31";
  record.observacao = "Dados preservados para consulta";
  record.editais = [V2_EDITAIS[0].id];
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify(records));
  const snapshot = window.sessionStorage.getItem("sigep-tabela-v2-v1");
  render(<MemoryRouter initialEntries={[V2_BASE]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getAllByRole("button", { name: "Expandir cargo" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "Visualizar " + record.tableId }));
  expect(screen.queryByRole("dialog")).toBeNull();
  const inicio = screen.getByLabelText("Data início da vigência *") as HTMLInputElement;
  expect(inicio.value).toBe(record.inicio);
  expect(inicio.readOnly).toBe(true);
  expect((screen.getByLabelText("Data fim da vigência") as HTMLInputElement).value).toBe(record.fim);
  expect((screen.getByLabelText("Observação") as HTMLTextAreaElement).readOnly).toBe(true);
  expect(screen.queryByLabelText("Estrutura de Vencimento *")).toBeNull();
  expect(screen.getByText(V2_EDITAIS[0].nome)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Selecionar editais" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Selecionar Tipos de Vínculo" })).toBeNull();
  expect(screen.queryByRole("button", { name: /Confirmar versionamento/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Valores por Nível e Classe" }));
  expect(screen.getAllByText(record.matrix.rows[0].values[0]).length).toBeGreaterThan(0);
  expect(screen.queryByRole("button", { name: "Adicionar classe" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Copiar valores da tabela anterior" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Identificação e vigência" }));
  expect((screen.getByLabelText("Observação") as HTMLTextAreaElement).value).toBe(record.observacao);
  fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
  expect(screen.getByRole("button", { name: "Visualizar " + record.tableId })).toBeTruthy();
  expect(window.sessionStorage.getItem("sigep-tabela-v2-v1")).toBe(snapshot);
});

it.each(["matriz", "fixo"] as const)("mantém as abas anteriores somente leitura e preserva a simulação de RGA (%s)", (structure) => {
  const records = structuredClone(v2Seed());
  const source = records[0];
  source.estrutura = structure;
  source.observacao = "Observação da tabela original";
  if (structure === "fixo") source.matrix = { columns: ["Valor"], rows: [{ name: "Fixo", values: ["R$ 4.500,00"] }] };
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify(records));
  const snapshot = window.sessionStorage.getItem("sigep-tabela-v2-v1");
  render(<MemoryRouter initialEntries={[V2_BASE + "/aplicar-rga?registro=" + source.id]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText("Percentual do RGA*"), { target: { value: "500" } });
  fireEvent.change(screen.getByLabelText("Data início da vigência do RGA*"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.click(screen.getByRole("button", { name: "Simular aplicação" }));
  expect((screen.getByRole("button", { name: "Aplicar RGA" }) as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Identificação e vigência" }));
  expect((screen.getByLabelText("Data início da vigência *") as HTMLInputElement).value).toBe(source.inicio);
  expect((screen.getByLabelText("Data início da vigência *") as HTMLInputElement).readOnly).toBe(true);
  expect((screen.getByLabelText("Observação") as HTMLTextAreaElement).value).toBe(source.observacao);
  expect((screen.getByLabelText("Observação") as HTMLTextAreaElement).readOnly).toBe(true);
  expect(screen.queryByRole("button", { name: "Selecionar Tipos de Vínculo" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Confirmar versionamento" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Finalizar" })).toBeNull();
  expect(screen.getAllByRole("button", { name: "Voltar" })).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Valores por Nível e Classe" }));
  expect(screen.getAllByText(source.matrix.rows[0].values[0]).length).toBeGreaterThan(0);
  expect(screen.queryByRole("button", { name: "Adicionar classe" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Copiar valores da tabela anterior" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Aplicação de RGA" }));
  expect((screen.getByLabelText("Percentual do RGA*") as HTMLInputElement).value).toBe("5,00%");
  expect((screen.getByLabelText("Data início da vigência do RGA*") as HTMLInputElement).value).toBe("2026-10-01");
  expect((screen.getByRole("button", { name: "Aplicar RGA" }) as HTMLButtonElement).disabled).toBe(false);
  expect(screen.getAllByText(/4\.725,00/).length).toBeGreaterThan(0);
  expect(window.sessionStorage.getItem("sigep-tabela-v2-v1")).toBe(snapshot);
});

it("abre o modal de criação com cadastro manual e referência indisponível", () => {
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=2"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar Tabela" }));
  let dialog = screen.getByRole("dialog", { name: "Criar tabela para 20 horas" });
  expect((within(dialog).getByRole("radio", { name: "Cadastrar manualmente" }) as HTMLInputElement).checked).toBe(true);
  expect((within(dialog).getByRole("radio", { name: "Gerar proporcionalmente" }) as HTMLInputElement).disabled).toBe(true);
  expect(within(dialog).getByText("Nenhuma tabela de referência vigente está disponível.")).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar tabela para 30 horas do cargo Analista Administrativo" }));
  dialog = screen.getByRole("dialog", { name: "Criar tabela para 30 horas" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Continuar" }));
  expect((screen.getByLabelText("Jornada *") as HTMLSelectElement).value).toBe("30 horas");
  expect(screen.queryByText(/Tabela proporcional à referência/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Valores por Nível e Classe" }));
  expect(screen.getByRole("textbox", { name: "001 / A" })).toBeTruthy();
});

it.each(["matriz", "fixo"] as const)("cadastra a jornada proporcional usando a referência vigente e os mesmos vínculos e editais (%s)", (structure) => {
  const reference = { ...structuredClone(v2Seed()[0]), id: "creation-reference", tableId: "CREATION-REF",
    cargoId: 5, jornada: "40 horas", origem: "Referência" as const, estrutura: structure, baseLegalId: "",
    editais: [V2_EDITAIS[0].id], links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }],
    matrix: structure === "fixo" ? { columns: ["Valor"], rows: [{ name: "Fixo", values: ["R$ 8.000,00"] }] }
      : { columns: ["A", "B"], rows: [{ name: "001", values: ["R$ 6.000,00", "R$ 8.000,00"] }, { name: "002", values: ["R$ 7.000,00", "R$ 9.000,00"] }] },
  };
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify([reference]));
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=5"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar tabela para 20 horas do cargo Assistente de Apoio Temporário" }));
  const dialog = screen.getByRole("dialog", { name: "Criar tabela para 20 horas" });
  fireEvent.click(within(dialog).getByRole("radio", { name: "Gerar proporcionalmente" }));
  expect((within(dialog).getByLabelText("Tabela de referência") as HTMLSelectElement).value).toBe(reference.id);
  fireEvent.click(within(dialog).getByRole("button", { name: "Continuar" }));
  expect(screen.getByText(/Tabela proporcional à referência TV-0001/)).toBeTruthy();
  expect((screen.getByLabelText("Jornada *") as HTMLSelectElement).value).toBe("20 horas");
  expect((screen.getByLabelText("Jornada *") as HTMLSelectElement).disabled).toBe(true);
  expect(screen.getByText(V2_EDITAIS[0].nome)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Selecionar editais" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Selecionar Tipos de Vínculo" })).toBeNull();
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  expect(screen.queryByLabelText("Valor de Referência *")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  expect(screen.getByText(structure === "fixo" ? /4.000,00/ : /3.000,00/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Adicionar classe" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Salvar tabela" }));
  fireEvent.click(within(screen.getByRole("dialog", { name: "Confirmar cadastro da tabela" })).getByRole("button", { name: "Confirmar cadastro" }));
  const saved = JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]");
  const proportional = saved.find((record: { jornada: string }) => record.jornada === "20 horas");
  expect(proportional.origem).toBe("Proporcional");
  expect(proportional.editais).toEqual(reference.editais);
  expect(proportional.links.map((link: { tipo: string }) => link.tipo)).toEqual(["Contrato Temporário"]);
  expect(proportional.proporcional.referenciaId).toBe(reference.id);
  expect(proportional.proporcional.percentual).toBe(50);
  expect(proportional.tableNumber).toBe(2);
});

it.each([0, 1])("visualiza os dois valores comissionados apenas para leitura pela tabela %s", (index) => {
  const pair = v2CreateCommissionedPair([], {
    ...v2Seed()[0], cargoId: 101, jornada: "40 horas", inicio: "2026-01-01", fim: undefined, editais: [],
    links: [{ tipo: "Exclusivamente Comissionado", inicio: "2026-01-01", incideRga: false }],
    baseLegalId: "lc-500-2026", baseLegal: "LC nº 500/2026", origem: "Manual",
  }, "7000", "85");
  if (!pair.ok) throw new Error(pair.message);
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify(pair.records));
  render(<MemoryRouter initialEntries={[V2_BASE + "?cargo=101"]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Visualizar " + pair.created[index].tableId }));
  const subsidy = screen.getByLabelText("Subsídio — Exclusivamente Comissionado *") as HTMLInputElement;
  const percent = screen.getByLabelText("Percentual — Nomeado Efetivo *") as HTMLInputElement;
  expect(subsidy.value).toContain("7.000,00");
  expect(percent.value).toBe("85%");
  expect(subsidy.readOnly).toBe(true);
  expect(percent.readOnly).toBe(true);
  expect(within(screen.getByRole("table", { name: "Resumo dos valores comissionados" })).getByText(/5.950,00/)).toBeTruthy();
  fireEvent.change(subsidy, { target: { value: "9000" } });
  fireEvent.change(percent, { target: { value: "95" } });
  expect(subsidy.value).toContain("7.000,00");
  expect(percent.value).toBe("85%");
  expect(screen.queryByRole("button", { name: "Confirmar" })).toBeNull();
  expect(JSON.parse(window.sessionStorage.getItem("sigep-tabela-v2-v1") || "[]")).toHaveLength(2);
});

it.each([0, 1])("simula somente a remuneração do vínculo comissionado selecionado %s", (index) => {
  const pair = v2CreateCommissionedPair([], {
    ...v2Seed()[0], cargoId: 101, jornada: "40 horas", inicio: "2026-01-01", fim: undefined, editais: [],
    links: [{ tipo: "Exclusivamente Comissionado", inicio: "2026-01-01", incideRga: false }],
    baseLegalId: "lc-500-2026", baseLegal: "LC nº 500/2026", origem: "Manual",
  }, "7000", "80");
  if (!pair.ok) throw new Error(pair.message);
  window.sessionStorage.setItem("sigep-tabela-v2-v1", JSON.stringify(pair.records));
  render(<MemoryRouter initialEntries={[V2_BASE + "/aplicar-rga?registro=" + pair.created[index].id]}><TabelaV2Page /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText("Percentual do RGA*"), { target: { value: "540" } });
  fireEvent.change(screen.getByLabelText("Data início da vigência do RGA*"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByPlaceholderText("Buscar documentos legais..."));
  fireEvent.click(screen.getByRole("checkbox", { name: /LC.*500/ }));
  fireEvent.click(screen.getByRole("button", { name: "Simular aplicação" }));
  const preview = screen.getByText("Pré-visualização dos novos valores").closest(".tv-rga-preview") as HTMLElement;
  expect(within(preview).getAllByRole("row")).toHaveLength(2);
  expect(within(preview).getByText(index === 1 ? "Gratificação" : "Subsídio")).toBeTruthy();
  expect(within(preview).queryByText(index === 1 ? "Subsídio" : "Gratificação")).toBeNull();
  expect(within(preview).getByText(index === 1 ? /5.902,40/ : /7.378,00/)).toBeTruthy();
  const summary = screen.getByText("Valores reajustados").parentElement as HTMLElement;
  expect(within(summary).getByText("1")).toBeTruthy();
});
