import { describe, expect, it } from "vitest";
import {
  createBatch,
  resolveJourneyVersions,
  simulateMatrix,
  validateBatch,
  type Journey,
  type Parameters,
} from "./rgaLote";
const params: Parameters = {
  ano: "2027",
  percentual: "5,40",
  vigencia: "2027-01-01",
  baseLegal: "Lei nº 123/2027",
  arredondamento: "2 casas decimais",
  observacao: "",
};
const matrix = {
  columns: ["A"],
  rows: [
    { name: "001", values: ["R$ 5.000,00"] },
    { name: "002", values: ["R$ 5.800,00"] },
  ],
};
function journey(jornada = "20 horas"): Journey {
  const item = {
    ano: 2026,
    numero: "V1",
    inicio: "01/01/2026",
    status: "Vigente" as const,
    alteracao: "01/01/2026",
    usuario: "Roberto Junior",
    matrix,
  };
  return {
    key: "1:" + jornada,
    cargoId: 1,
    cargo: "Auditor Fiscal",
    jornada,
    incideRga: true,
    item,
    versions: [item],
  };
}
describe("RGA em lote por jornada", () => {
  it("simula sem alterar valores e arredonda em centavos", () => {
    const before = JSON.stringify(matrix);
    expect(
      simulateMatrix(matrix, "5,40").rows.map((row) =>
        row.values[0].replace(/\s/g, ""),
      ),
    ).toEqual(["R$5.270,00", "R$6.113,20"]);
    expect(JSON.stringify(matrix)).toBe(before);
  });
  it("gera versões e histórico independentes para duas jornadas do mesmo cargo", () => {
    const result = createBatch(
      [],
      [journey(), journey("30 horas")],
      params,
      "2026-09-10T10:00:00Z",
      "lote-1",
    );
    expect(result).toHaveLength(4);
    expect(
      result.filter((record) => record.versao.origem === "RGA"),
    ).toHaveLength(2);
    expect(
      result
        .filter((record) => record.versao.numero === "V1")
        .every((record) => record.matrix?.rows[0].values[0] === "R$ 5.000,00"),
    ).toBe(true);
    expect(result[1].versao.auditoriaRga?.loteId).toBe("lote-1");
  });
  it("preserva registros anteriores byte a byte", () => {
    const previous = createBatch(
      [],
      [journey()],
      params,
      "2026-09-10T10:00:00Z",
      "lote-1",
    );
    const before = JSON.stringify(previous);
    createBatch(
      previous,
      [journey("30 horas")],
      params,
      "2026-09-10T10:00:00Z",
      "lote-2",
    );
    expect(JSON.stringify(previous)).toBe(before);
  });
  it("bloqueia todo o lote e identifica a jornada não elegível", () => {
    const invalid = { ...journey("40 horas"), incideRga: false };
    expect(() =>
      createBatch(
        [],
        [journey(), invalid],
        params,
        "2026-09-10T10:00:00Z",
        "lote",
      ),
    ).toThrow("Auditor Fiscal — 40 horas: Incide RGA = Não");
  });
  it("bloqueia ausência de versão vigente e conflito futuro", () => {
    expect(
      validateBatch([{ ...journey(), item: undefined }], params).join(),
    ).toContain("não existe versão vigente");
    const selected = journey();
    selected.versions.push({
      ...selected.item!,
      inicio: "01/06/2027",
      status: "Futura",
    });
    expect(validateBatch([selected], params).join()).toContain(
      "versão futura incompatível",
    );
  });
  it("valida seleção, parâmetros e datas inválidas", () => {
    expect(
      validateBatch([], {
        ...params,
        percentual: "",
        vigencia: "",
        baseLegal: "",
      }),
    ).toHaveLength(4);
    expect(
      validateBatch([journey()], { ...params, vigencia: "2027-02-31" }).join(),
    ).toContain("vigência válida");
  });
  it("aceita vigência do RGA no início da tabela e bloqueia período externo", () => {
    expect(
      validateBatch([journey()], { ...params, vigencia: "2026-01-01" }),
    ).toEqual([]);

    const tabelaComFim = journey();
    tabelaComFim.item = { ...tabelaComFim.item!, fim: "31/12/2026" };
    tabelaComFim.versions = [tabelaComFim.item];
    expect(
      validateBatch([tabelaComFim], params),
    ).toContain(
      "A vigência do RGA deve estar contida no período de vigência da Tabela de Vencimentos.",
    );
  });  it("ativa a versão na vigência sem mutar os registros históricos", () => {
    const records = createBatch(
      [],
      [journey()],
      params,
      "2026-09-10T10:00:00Z",
      "lote",
    );
    const versions = records.map((record) => record.versao).reverse();
    expect(
      resolveJourneyVersions(versions, "2026-12-31").map(
        (version) => version.status,
      ),
    ).toEqual(["Futura", "Vigente"]);
    expect(
      resolveJourneyVersions(versions, "2027-01-01").map(
        (version) => version.status,
      ),
    ).toEqual(["Vigente", "Encerrada"]);
    expect(versions[1].status).toBe("Vigente");
  });
});
