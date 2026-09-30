import { describe, expect, it } from "vitest";
import type { TabelaSalva } from "./TabelaVencimentosFeaturePage";
import {
  exceptionStatus,
  hasExceptionOverlap,
  resolveApplicableWageTable,
  saveException,
  visibleExceptions,
  type ExceptionInput,
  type ExceptionRecord,
} from "./exceptionStore";

const matrix = {
  columns: ["A"],
  rows: [{ name: "001", values: ["R$ 1.000,00"] }],
};
const input: ExceptionInput = {
  cargoId: 1,
  perfil: "Tecnologia da Informação",
  localId: "org:sefaz",
  start: "2026-01-01",
  matrix,
  baseLegal: ["Lei 1/2026"],
  observacao: "Regra específica",
};
const exception: ExceptionRecord = {
  ...input,
  id: "ex-1",
  version: 1,
  responsavel: "Teste",
  registradoEm: "2026-01-01T12:00:00.000Z",
};
const general: TabelaSalva = {
  id: "general",
  cargoId: 1,
  jornada: "40 horas",
  versao: {
    ano: 2026,
    inicio: "01/01/2026",
    status: "Vigente",
    alteracao: "01/01/2026",
    usuario: "Teste",
  },
};

describe("Tabelas de Exceção", () => {
  it("prioriza a exceção e usa Cargo + Jornada quando ela não se aplica", () => {
    expect(
      resolveApplicableWageTable(
        [exception], [general],
        { cargoId: 1, perfil: input.perfil, localId: "ORG:SEFAZ", jornada: "40 horas" },
        "2026-06-01",
      ),
    ).toEqual({ kind: "exception", record: exception });
    expect(
      resolveApplicableWageTable(
        [exception], [general],
        { cargoId: 1, perfil: input.perfil, localId: "org:seduc", jornada: "40 horas" },
        "2026-06-01",
      ),
    ).toEqual({ kind: "journey", record: general });
    expect(
      resolveApplicableWageTable(
        [exception], [general],
        { cargoId: 1, perfil: input.perfil, localId: "org:seduc", jornada: "30 horas" },
        "2026-06-01",
      ),
    ).toEqual({ kind: "none", message: "Sem Tabela de Vencimentos aplicável" });
  });

  it("impede vigências sobrepostas apenas para a mesma combinação", () => {
    expect(hasExceptionOverlap([exception], { ...input, start: "2026-06-01" })).toBe(true);
    expect(hasExceptionOverlap([exception], { ...input, localId: "org:seduc" })).toBe(false);
    expect(hasExceptionOverlap([exception], input, exception.id)).toBe(false);
  });

  it("cria nova versão sem sobrescrever matriz e auditoria anteriores", () => {
    const updatedMatrix = {
      columns: ["A"],
      rows: [{ name: "001", values: ["R$ 1.200,00"] }],
    };
    const result = saveException(
      [exception],
      { ...input, start: "2026-07-01", matrix: updatedMatrix },
      "Roberto Junior",
      exception.id,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.records).toHaveLength(2);
    expect(result.records[0].end).toBe("2026-06-30");
    expect(result.records[0].matrix).toEqual(matrix);
    expect(result.saved.version).toBe(2);
    expect(result.saved.previousId).toBe(exception.id);
    expect(result.saved.matrix).toEqual(updatedMatrix);
    expect(result.saved.responsavel).toBe("Roberto Junior");
    expect(exception.end).toBeUndefined();
  });

  it("aceita apenas Cargo, início e Base Legal e valida os obrigatórios", () => {
    const broad = { ...input, perfil: "", localId: "", observacao: "" };
    const result = saveException([], broad, "Teste");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.saved.perfil).toBe("");
      expect(result.saved.localId).toBe("");
      expect(result.saved.horasTrabalhadas).toBeUndefined();
    }
    expect(saveException([], { ...broad, start: "" }, "Teste").ok).toBe(false);
    expect(saveException([], { ...broad, baseLegal: [] }, "Teste").ok).toBe(false);
  });

  it("aplica critérios opcionais e prioriza a exceção mais específica", () => {
    const broad = { ...exception, id: "broad", perfil: "", localId: "" };
    const hours = { ...broad, id: "hours", horasTrabalhadas: "6h" as const };
    const specific = { ...exception, id: "specific", horasTrabalhadas: "6h" as const };
    const criteria = { cargoId: 1, perfil: input.perfil, localId: input.localId, jornada: "40 horas" };
    expect(resolveApplicableWageTable([broad, hours, specific], [general], { ...criteria, horasTrabalhadas: "6h" }, "2026-06-01"))
      .toEqual({ kind: "exception", record: specific });
    expect(resolveApplicableWageTable([broad, hours], [general], { ...criteria, horasTrabalhadas: "4h" }, "2026-06-01"))
      .toEqual({ kind: "exception", record: broad });
    expect(hasExceptionOverlap([hours], { ...input, perfil: "", localId: "", horasTrabalhadas: "4h" }))
      .toBe(false);
  });

  it("mostra a versão atual na grid e preserva a anterior no histórico", () => {
    const previous = { ...exception, end: "2026-06-30" };
    const current = {
      ...exception,
      id: "ex-2",
      version: 2,
      start: "2026-07-01",
      previousId: exception.id,
    };
    expect(exceptionStatus(previous, "2026-08-01")).toBe("Encerrada");
    expect(visibleExceptions([previous, current], 1, "2026-08-01")).toEqual([current]);
  });
});

