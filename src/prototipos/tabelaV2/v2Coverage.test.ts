import { describe, expect, it } from "vitest";
import { v2Coverage } from "./v2CoverageModel";
import { type V2Cargo, type V2Record } from "./v2Store";

const on = "2026-09-28";
const cargo: V2Cargo = { id: 1, nome: "Cargo", carreira: "Carreira", comissionado: false,
  jornadas: ["30 horas", "40 horas"], vinculos: [
    { tipo: "Nomeado Efetivo", jornadas: ["30 horas", "40 horas"] },
    { tipo: "Contrato Temporário", jornadas: ["30 horas", "40 horas"] },
  ], perfis: [] };
const record = (jornada = "30 horas", tipos = ["Nomeado Efetivo", "Contrato Temporário"], extra: Partial<V2Record> = {}): V2Record => ({
  id: "record-" + jornada, tableId: "TV-" + jornada, version: 1, kind: "padrao", cargoId: 1, jornada,
  inicio: "2026-01-01", links: tipos.map((tipo) => ({ tipo, inicio: "2026-01-01", incideRga: false })),
  matrix: { columns: ["A"], rows: [{ name: "001", values: ["R$ 100,00"] }] }, baseLegal: "Lei", observacao: "",
  origem: "Manual", responsavel: "Usuário", criadoEm: "2026-01-01", events: [], ...extra,
});

describe("cobertura das tabelas", () => {
  it("calcula os cenários completo, parcial e pendente sem duplicar tabelas compartilhadas", () => {
    expect(v2Coverage(cargo, [record(), record("40 horas")], on)).toMatchObject({ status: "Completa", covered: 4, total: 4, percent: 100 });
    expect(v2Coverage(cargo, [record(), record("40 horas", ["Nomeado Efetivo"])], on)).toMatchObject({ status: "Parcial", covered: 3, total: 4, percent: 75 });
    expect(v2Coverage(cargo, [], on)).toMatchObject({ status: "Pendente", covered: 0, total: 4, percent: 0 });
  });
  it("considera todos os vínculos em todas as jornadas sem duplicar jornadas", () => {
    const limited = { ...cargo, jornadas: ["30 horas", "40 horas", "40 horas"], vinculos: [cargo.vinculos[0], { tipo: "Contrato Temporário", jornadas: ["30 horas"] }] };
    const coverage = v2Coverage(limited, [record(), record("40 horas")], on);
    expect(coverage).toMatchObject({ status: "Completa", covered: 4, total: 4 });
    expect(coverage.cells.find((cell) => cell.jornada === "40 horas" && cell.tipo === "Contrato Temporário")?.status).toBe("Vigente");
  });
  it("não classifica cargos sem combinações como completos", () => {
    expect(v2Coverage({ ...cargo, vinculos: [] }, [], on)).toMatchObject({ status: "Não aplicável", total: 0, covered: 0, percent: 0 });
  });
  it("considera os períodos do registro e de cada vínculo individualmente", () => {
    const table = record("30 horas", [], { links: [
      { tipo: "Nomeado Efetivo", inicio: "2026-01-01", fim: "2026-09-27", incideRga: false },
      { tipo: "Contrato Temporário", inicio: on, fim: on, incideRga: false },
    ] });
    expect(v2Coverage(cargo, [table], on).covered).toBe(1);
    expect(v2Coverage(cargo, [table], "2026-09-29").covered).toBe(0);
    expect(v2Coverage(cargo, [record("30 horas", undefined, { fim: "2026-09-27" })], on).covered).toBe(0);
  });
  it("mostra futura e recalcula quando inicia a vigência", () => {
    const future = record("30 horas", undefined, { inicio: "2026-10-01" });
    const coverage = v2Coverage(cargo, [future], on);
    expect(coverage.covered).toBe(0);
    expect(coverage.cells.slice(0, 2).map((cell) => cell.status)).toEqual(["Futura", "Futura"]);
    expect(v2Coverage(cargo, [future], "2026-10-01").covered).toBe(2);
  });
  it("preserva a versão vigente quando existe uma versão futura", () => {
    const current = record("30 horas", undefined, { fim: "2026-09-30" });
    const future = record("30 horas", undefined, { id: "v2", version: 2, inicio: "2026-10-01" });
    expect(v2Coverage(cargo, [current, future], on).cells[0].details[0].record?.version).toBe(1);
    expect(v2Coverage(cargo, [current, future], "2026-10-01").cells[0].details[0].record?.version).toBe(2);
  });
  it("não usa exceção específica para cobrir toda a combinação do cargo", () => {
    expect(v2Coverage(cargo, [record("30 horas", undefined, { kind: "excecao", perfil: "Auditoria", local: "SEFAZ" })], on).covered).toBe(0);
  });
  it("uma tabela geral não encobre a ausência dos editais obrigatórios", () => {
    const required: V2Cargo = { ...cargo, editaisObrigatorios: [{ jornada: "30 horas", tipo: "Contrato Temporário", editais: ["pss-sefaz-002-2026", "pss-seduc-003-2026"] }] };
    const general = record();
    const specific = record("30 horas", ["Contrato Temporário"], { id: "edital", editais: ["pss-sefaz-002-2026"] });
    const coverage = v2Coverage(required, [general, specific], on);
    expect(coverage.covered).toBe(1);
    const temporary = coverage.cells.find((cell) => cell.jornada === "30 horas" && cell.tipo === "Contrato Temporário")!;
    expect(temporary.status).toBe("Pendente");
    expect(temporary.details.map((detail) => detail.status)).toEqual(["Vigente", "Pendente"]);
    expect(temporary.details[1].record).toBeUndefined();
    const sharedEditais = { ...specific, editais: ["pss-sefaz-002-2026", "pss-seduc-003-2026"] };
    expect(v2Coverage(required, [general, sharedEditais], on).covered).toBe(2);
  });
  it("uma tabela futura por edital é detalhada, mas não contabilizada", () => {
    const required = { ...cargo, editaisObrigatorios: [{ jornada: "30 horas", tipo: "Contrato Temporário", editais: ["pss-sefaz-002-2026"] }] };
    const future = record("30 horas", ["Contrato Temporário"], { inicio: "2026-10-01", editais: ["pss-sefaz-002-2026"] });
    const cell = v2Coverage(required, [future], on).cells[1];
    expect(cell.status).toBe("Futura");
    expect(cell.details[0].record).toEqual(future);
    expect(v2Coverage(required, [future], on).covered).toBe(0);
  });
  it("não associa à pendência uma tabela de outro tipo de vínculo", () => {
    const coverage = v2Coverage(cargo, [record("30 horas", ["Nomeado Efetivo"])], on);
    expect(coverage.cells[1].details[0].record).toBeUndefined();
  });
});

it("contabiliza tabelas vigentes por edital mesmo sem edital obrigatório configurado", () => {
  const temporary = { ...cargo, vinculos: [{ ...cargo.vinculos[1], jornadas: ["20 horas", "30 horas", "40 horas"] }], jornadas: ["20 horas", "30 horas", "40 horas"] };
  const records = temporary.jornadas.map((jornada, index) => record(jornada, ["Contrato Temporário"], {
    id: "temporary-" + index, tableId: "TEMP-" + index, editais: ["pss-sefaz-002-2026"],
    origem: index ? "Proporcional" : "Referência",
  }));
  expect(v2Coverage(temporary, records, on)).toMatchObject({ status: "Completa", covered: 3, total: 3, percent: 100 });
  expect(v2Coverage(temporary, records, on).cells.map((cell) => cell.status)).toEqual(["Vigente", "Vigente", "Vigente"]);
  expect(v2Coverage(temporary, records.map((table) => ({ ...table, inicio: "2026-10-01" })), on).covered).toBe(0);
});
