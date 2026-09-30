// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { V2HistoryModal } from "./V2History";
import { V2_CARGOS, v2ApplyRga, v2ApplyIndividualRga, v2Seed, v2CreateCommissionedPair, v2VersionCommissionedPair } from "./v2Store";

afterEach(cleanup);
const showHistoryDetails = (button: HTMLElement) => { fireEvent.click(button); };

it("consulta as versões anteriores e os valores antes e depois da RGA sem alterar os registros", () => {
  const seed = v2Seed();
  const result = v2ApplyIndividualRga(seed, seed[0].id, 5, "2026-10-01", "", "LC RGA 2026", "", "Reajuste anual");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  const snapshot = JSON.stringify(result.records);
  const close = vi.fn();
  render(<V2HistoryModal record={result.record} records={result.records} cargo={V2_CARGOS[0]} onClose={close} />);
  const table = screen.getByRole("table", { name: "Versões da tabela de vencimentos" });
  const rows = within(table).getAllByRole("row").slice(1);
  expect(rows).toHaveLength(2);
  expect(within(rows[0]).getByText("V2")).toBeTruthy();
  expect(within(rows[1]).getByText("30/09/2026")).toBeTruthy();
  showHistoryDetails(within(rows[0]).getByRole("button", { name: /detalhes da versão/ }));
  fireEvent.click(screen.getByRole("button", { name: "RGA" }));
  expect(screen.getByText("LC RGA 2026")).toBeTruthy();
  expect(screen.getAllByText("5,00%").length).toBeGreaterThan(0);

  const audit = result.record.events[0];
  expect(screen.getByText("Individual")).toBeTruthy();
  expect(within(screen.getByText("Versão de origem").parentElement!).getByText("V1")).toBeTruthy();
  const values = screen.getByRole("table", { name: "Valores aplicados pelo RGA" });
  expect(within(values).getAllByRole("columnheader").map((header) => header.textContent)).toEqual(["Nível", "Classe", "Valor base", "Percentual RGA", "Valor com RGA", "Diferença"]);
  expect(within(values).getAllByRole("row")).toHaveLength(1 + audit.after!.rows.flatMap((row) => row.values).length);
  expect(within(values).getAllByText(/225,00/).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole("button", { name: "Visualizar arquivo" }));
  expect(screen.getByRole("dialog", { name: "Visualização da Base legal" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Fechar visualização" }));
  expect(screen.getAllByText(audit.before!.rows[0].values[0]).length).toBeGreaterThan(0);
  expect(screen.getAllByText(audit.after!.rows[0].values[0].replace(/\s/g, " ")).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole("button", { name: "Informações adicionais" }));
  expect(screen.getByText("Reajuste anual")).toBeTruthy();
  expect(JSON.stringify(result.records)).toBe(snapshot);
  fireEvent.keyDown(window, { key: "Escape" });
  expect(close).toHaveBeenCalledOnce();
});

it("pagina as versões e redefine a expansão ao trocar de página", () => {
  const base = v2Seed()[0];
  const records = Array.from({ length: 12 }, (_, index) => ({
    ...base, id: "version-" + index, version: index + 1,
    criadoEm: "2026-09-" + String(index + 1).padStart(2, "0") + "T12:00:00Z",
  }));
  render(<V2HistoryModal record={records[11]} records={records} cargo={V2_CARGOS[0]} onClose={() => {}} />);
  const table = screen.getByRole("table", { name: "Versões da tabela de vencimentos" });
  expect(within(table).getAllByRole("row")).toHaveLength(11);
  showHistoryDetails(screen.getAllByRole("button", { name: /detalhes da versão/ })[0]);
  fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
  expect(screen.queryByRole("button", { name: "Tabela de valores" })).toBeNull();
  expect(within(table).getAllByRole("row")).toHaveLength(3);
  expect(within(table).getByText("V1")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Itens por página"), { target: { value: "20" } });
  expect(within(table).getAllByRole("row")).toHaveLength(13);
  expect((screen.getByRole("button", { name: "Próxima página" }) as HTMLButtonElement).disabled).toBe(true);
});

it("mostra o histórico da exceção com seu perfil, lotação e valor fixo", () => {
  const record = { ...v2Seed()[0], kind: "excecao" as const, perfil: "Especialista", local: "SEPLAG",
    estrutura: "fixo" as const, matrix: { columns: ["Valor"], rows: [{ name: "Fixo", values: ["R$ 4.500,00"] }] } };
  render(<V2HistoryModal record={record} records={[record]} cargo={V2_CARGOS[0]} onClose={() => {}} />);
  expect(screen.getByRole("dialog", { name: "Histórico da exceção" })).toBeTruthy();
  showHistoryDetails(screen.getByRole("button", { name: /detalhes da versão/ }));
  expect(screen.getByText("R$ 4.500,00")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Informações adicionais" }));
  expect(screen.getByText("Especialista")).toBeTruthy();
  expect(screen.getByText("SEPLAG")).toBeTruthy();
});

it("exibe aplicação em lote, percentual e diferenças no formato do módulo original", () => {
  const seed = v2Seed();
  const result = v2ApplyRga(seed, [seed[0].id], 5.4, "2026-10-01", "LC 500/2026", "Reajuste em lote");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  const version = result.created[0];
  expect(version.events[0].applicationType).toBe("Em lote");
  render(<V2HistoryModal record={version} records={result.records} cargo={V2_CARGOS[0]} onClose={() => {}} />);
  showHistoryDetails(screen.getAllByRole("button", { name: /detalhes da versão/ })[0]);
  fireEvent.click(screen.getByRole("button", { name: "RGA" }));
  expect(screen.getByText("Em lote")).toBeTruthy();
  expect(screen.getAllByText("5,40%").length).toBeGreaterThan(0);
  expect(screen.getByText("Reajuste em lote")).toBeTruthy();
  const grid = screen.getByRole("table", { name: "Valores aplicados pelo RGA" });
  const first = within(grid).getAllByRole("row")[1];
  const cells = within(first).getAllByRole("cell");
  expect(cells[2].textContent).toContain("4.500,00");
  expect(cells[4].textContent).toContain("4.743,00");
  expect(cells[5].textContent).toContain("+ R$");
  expect(cells[5].textContent).toContain("243,00");
  expect(cells[5].className).toBe("tv-rga-positive");
});

it.each([0, 1])("mostra o resumo comissionado e os valores de cada versão pelo vínculo %s", (index) => {
  const input = { ...v2Seed()[0], cargoId: 101, jornada: "40 horas", inicio: "2026-01-01", fim: undefined, editais: [],
    links: [{ tipo: "Exclusivamente Comissionado", inicio: "2026-01-01", incideRga: false }],
    baseLegalId: "lc-500-2026", baseLegal: "LC nº 500/2026", origem: "Manual" as const };
  const pair = v2CreateCommissionedPair([], input, "7000", "85");
  if (!pair.ok) throw new Error(pair.message);
  const next = v2VersionCommissionedPair(pair.records, pair.created[0].id, {
    ...input, inicio: "2026-10-01", remuneracao: { tipo: "subsidio", valor: "8000" },
  }, undefined, "90");
  if (!next.ok) throw new Error(next.message);
  const before = JSON.stringify(next.records);
  render(<V2HistoryModal record={next.created[index]} records={next.records} cargo={V2_CARGOS.find(cargo => cargo.id === 101)!} onClose={() => {}} />);
  const versions = screen.getByRole("table", { name: "Versões da tabela de vencimentos" });
  const rows = within(versions).getAllByRole("row").slice(1);
  showHistoryDetails(within(rows[0]).getByRole("button", { name: /detalhes da versão/ }));
  let summary = screen.getByRole("table", { name: "Resumo dos valores comissionados" });
  expect(within(summary).getAllByRole("columnheader").map(header => header.textContent)).toEqual(["Forma de ocupação", "Regra", "Valor"]);
  expect(within(summary).getByText("Gratificação de 90%")).toBeTruthy();
  expect(within(summary).getByText(/7.200,00/)).toBeTruthy();
  showHistoryDetails(within(rows[1]).getByRole("button", { name: /detalhes da versão/ }));
  summary = screen.getByRole("table", { name: "Resumo dos valores comissionados" });
  expect(within(summary).getByText("Subsídio integral")).toBeTruthy();
  expect(within(summary).getByText("Gratificação de 85%")).toBeTruthy();
  expect(within(summary).getByText(/7.000,00/)).toBeTruthy();
  expect(within(summary).getByText(/5.950,00/)).toBeTruthy();
  expect(JSON.stringify(next.records)).toBe(before);
});
