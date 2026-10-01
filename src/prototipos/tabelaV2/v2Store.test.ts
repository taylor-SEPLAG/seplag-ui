import { describe, expect, it } from "vitest";
import {
  V2_CARGOS, V2_EDITAIS, v2CreateCommissionedPair, v2VersionCommissionedPair, v2CommissionedViewValues, v2ReferenceCandidates, v2AssignTableNumbers, v2TableDisplayId, v2Applicable, v2ApplyRga, v2ApplyIndividualRga, v2Conflicts, v2Create, v2Currency, v2Latest, v2ProportionalMatrix,
  v2RgaCandidates, v2Seed, v2Status, v2Version, type V2Input, type V2Record,
} from "./v2Store";

const matrix = { columns: ["A"], rows: [{ name: "001", values: ["R$ 4.500,00"] }] };
const input: V2Input = {
  kind: "padrao", cargoId: 2, jornada: "20 horas", inicio: "2026-10-01",
  links: [{ tipo: "Nomeado Efetivo", inicio: "2026-10-01", incideRga: true }],
  matrix, baseLegal: "Lei 123/2026", observacao: "", origem: "Manual",
};

describe("Tabela V2", () => {
  it("mantém uma linha de tabela compartilhada e identifica cada vínculo", () => {
    const shared = v2Seed()[0];
    expect(shared.links).toHaveLength(2);
    expect(v2Latest(v2Seed(), "padrao").filter((record) => record.tableId === shared.tableId)).toHaveLength(1);
    expect(v2Applicable(v2Seed(), { cargoId: 1, jornada: "20 horas", tipo: "Nomeado Efetivo" }, "2026-09-25")).toEqual(shared);
    expect(v2Applicable(v2Seed(), { cargoId: 1, jornada: "20 horas", tipo: "Contrato Temporário" }, "2026-09-25")).toEqual(shared);
  });
  it("identifica vínculos conflitantes individualmente", () => {
    const candidate: V2Input = { ...input, cargoId: 1, jornada: "40 horas", links: [
      { tipo: "Nomeado Efetivo", inicio: input.inicio, incideRga: true },
      { tipo: "Emprego Público", inicio: input.inicio, incideRga: false },
    ] };
    expect(v2Conflicts(v2Seed(), candidate)).toEqual(["Nomeado Efetivo"]);
    const result = v2Create(v2Seed(), candidate);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("Nomeado Efetivo");
  });
  it("interpreta valores digitados em reais com ou sem centavos", () => {
    expect(v2Currency("4500")).toContain("4.500,00");
    expect(v2Currency("4500,50")).toContain("4.500,50");
  });
  it("calcula valores proporcionais com duas casas decimais", () => {
    expect(v2ProportionalMatrix(matrix, 40, 30).rows[0].values[0]).toBe("R$ 3.375,00");
  });
  it("versiona somente alguns vínculos e conserva os demais na tabela original", () => {
    const source = v2Seed()[0];
    const next: V2Input = { ...input, cargoId: 1, jornada: source.jornada, inicio: "2026-10-01", links: [
      { tipo: "Nomeado Efetivo", inicio: "2026-10-01", incideRga: true },
    ] };
    const result = v2Version(v2Seed(), source.id, ["Nomeado Efetivo"], next);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record.tableId).not.toBe(source.tableId);
    expect(result.records.find((record) => record.id === source.id)?.links.find((link) => link.tipo === "Nomeado Efetivo")?.fim).toBe("2026-09-30");
    expect(v2Applicable(result.records, { cargoId: 1, jornada: "20 horas", tipo: "Contrato Temporário" }, "2026-11-01")?.tableId).toBe(source.tableId);
    expect(v2Applicable(result.records, { cargoId: 1, jornada: "20 horas", tipo: "Nomeado Efetivo" }, "2026-11-01")?.tableId).toBe(result.record.tableId);
  });
  it("aplica RGA apenas ao vínculo elegível e registra os valores anteriores", () => {
    const source = v2Seed()[0];
    expect(v2RgaCandidates(v2Seed(), "2026-09-25").some((record) => record.id === source.id)).toBe(true);
    const result = v2ApplyRga(v2Seed(), [source.id], 5.4, "2026-10-01", "Lei 999/2026", "RGA anual");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.created[0].links.map((link) => link.tipo)).toEqual(["Nomeado Efetivo"]);
    expect(result.created[0].matrix.rows[0].values[0]).toBe("R$ 4.743,00");
    expect(result.created[0].events[0].percent).toBe(5.4);
    expect(result.created[0].events[0].before?.rows[0].values[0]).toBe("R$ 4.500,00");
    expect(v2Status(result.records.find((record) => record.id === source.id)!, "2026-11-01")).toBe("Vigente");
  });
  it("faz a exceção prevalecer para vínculos, perfil e local correspondentes", () => {
    const exception: V2Input = {
      ...input, kind: "excecao", cargoId: 1, jornada: undefined, perfil: "Auditoria", local: "SEFAZ",
      links: [{ tipo: "Nomeado Efetivo", inicio: "2026-10-01", incideRga: false }],
    };
    const created = v2Create(v2Seed(), exception);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(v2Applicable(created.records, { cargoId: 1, jornada: "40 horas", tipo: "Nomeado Efetivo", perfil: "Auditoria", local: "SEFAZ" }, "2026-11-01")).toEqual(created.record);
    expect(v2Applicable(created.records, { cargoId: 1, jornada: "40 horas", tipo: "Nomeado Efetivo", perfil: "Fiscalização", local: "SEFAZ" }, "2026-11-01")?.kind).toBe("padrao");
  });

  it("aplica exceção com horas trabalhadas somente às horas correspondentes", () => {
    const exception: V2Input = { ...input, kind: "excecao", cargoId: 1, jornada: undefined, perfil: "Auditoria", local: "SEFAZ", horasTrabalhadas: "6h" };
    const created = v2Create(v2Seed(), exception);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(v2Applicable(created.records, { cargoId: 1, jornada: "20 horas", tipo: "Nomeado Efetivo", perfil: "Auditoria", local: "SEFAZ", horasTrabalhadas: "6h" }, "2026-11-01")?.id).toBe(created.record.id);
    expect(v2Applicable(created.records, { cargoId: 1, jornada: "20 horas", tipo: "Nomeado Efetivo", perfil: "Auditoria", local: "SEFAZ", horasTrabalhadas: "4h" }, "2026-11-01")?.kind).toBe("padrao");
  });

  it("mantém a versão vigente consultável quando já existe uma versão futura", () => {
    const source = v2Seed()[1];
    const future: V2Input = {
      kind: "padrao", cargoId: source.cargoId, jornada: source.jornada, inicio: "2026-11-01",
      links: source.links.map((link) => ({ ...link, inicio: "2026-11-01" })),
      matrix: source.matrix, baseLegal: "Lei 456/2026", observacao: "", origem: "Manual",
    };
    const result = v2Version(v2Seed(), source.id, source.links.map((link) => link.tipo), future);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(v2Latest(result.records, "padrao").find((record) => record.tableId === source.tableId)?.id).toBe(source.id);
    expect(v2Applicable(result.records, { cargoId: 1, jornada: "30 horas", tipo: "Nomeado Efetivo" }, "2026-11-02")?.id).toBe(result.record.id);
  });

  it("usa estrutura de subsídio para cargo exclusivamente comissionado", () => {
    const commissioned: V2Input = {
      kind: "padrao", cargoId: 101, jornada: "40 horas", inicio: "2026-10-01",
      links: [{ tipo: "Exclusivamente Comissionado", inicio: "2026-10-01", incideRga: false }],
      matrix: { columns: [], rows: [] },
      remuneracao: { tipo: "subsidio", valor: "R$ 10.000,00" },
      baseLegal: "LC nº 500/2026", observacao: "", origem: "Manual",
    };
    const result = v2Create(v2Seed(), commissioned);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record.remuneracao?.valor).toBe("R$ 10.000,00");
    const incompatible = v2Create(v2Seed(), {
      ...commissioned,
      links: [...commissioned.links, { tipo: "Nomeado Efetivo", inicio: "2026-10-01", incideRga: false }],
    });
    expect(incompatible.ok).toBe(false);
  });
});

it("aplica RGA individual à base da gratificação e mantém o percentual remuneratório", () => {
  const created = v2Create([], { ...input, cargoId: 101, jornada: "40 horas", inicio: "2026-01-01",
    links: [{ tipo: "Nomeado Efetivo", inicio: "2026-01-01", incideRga: false }],
    remuneracao: { tipo: "gratificacao", valor: "30", baseCalculo: "R$ 10.000,00", valorCalculado: "R$ 3.000,00" },
  });
  expect(created.ok).toBe(true);
  if (!created.ok) return;
  const result = v2ApplyIndividualRga(created.records, created.record.id, 5, "2026-10-01", "", "LC 500/2026", "lc-500-2026", "");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.record.remuneracao?.valor).toBe("30");
  expect(result.record.remuneracao?.baseCalculo).toContain("10.500,00");
  expect(result.record.remuneracao?.valorCalculado).toContain("3.150,00");
  expect(result.record.events[0].detail).toContain("3.150,00");
});

it("rejeita RGA individual com percentual inválido ou vigência anterior à versão", () => {
  const records = v2Seed();
  expect(v2ApplyIndividualRga(records, records[0].id, Infinity, "2026-10-01", "", "Lei 1", "", "").ok).toBe(false);
  expect(v2ApplyIndividualRga(records, records[0].id, 5, records[0].inicio, "", "Lei 1", "", "").ok).toBe(false);
});

it("valida editais em homologação e preserva associações nas versões", () => {
  const ids = V2_EDITAIS.filter((edital) => edital.situacao === "Em homologação").slice(0, 2).map((edital) => edital.id);
  const temporary: V2Input = { ...input, jornada: "30 horas", editais: ids, links: [{ tipo: "Contrato Temporário", inicio: input.inicio, incideRga: false }] };
  expect(v2Create([], { ...input, editais: ids }).ok).toBe(false);
  expect(v2Create([], { ...temporary, editais: [V2_EDITAIS.find((edital) => edital.situacao === "Aberto")!.id] }).ok).toBe(false);
  const created = v2Create([], temporary);
  expect(created.ok).toBe(true);
  if (!created.ok) return;
  const version = v2Version(created.records, created.record.id, ["Contrato Temporário"], {
    ...temporary, inicio: "2026-11-01", links: temporary.links.map((link) => ({ ...link, inicio: "2026-11-01" })),
  });
  expect(version.ok).toBe(true);
  if (!version.ok) return;
  expect(version.record.editais).toEqual(ids);
  expect(version.records.find((record) => record.id === created.record.id)?.editais).toEqual(ids);
});

it("rejeita valor fixo para cargo não comissionado e preserva matriz no RGA", () => {
  expect(v2Create([], { ...input, estrutura: "fixo" }).ok).toBe(false);
  const created = v2Create([], { ...input, estrutura: "matriz", inicio: "2026-01-01",
    links: input.links.map(link => ({ ...link, inicio: "2026-01-01" })) });
  expect(created.ok).toBe(true);
  if (!created.ok) return;
  const individual = v2ApplyIndividualRga(created.records, created.record.id, 5, "2026-10-01", "", "Lei 999/2026", "", "");
  expect(individual.ok).toBe(true);
  if (!individual.ok) return;
  expect(individual.record.estrutura).toBe("matriz");
  expect(individual.record.matrix.rows[0].values[0]).toContain("4.725,00");
  const batch = v2ApplyRga(created.records, [created.record.id], 5, "2026-10-01", "Lei 999/2026", "");
  expect(batch.ok).toBe(true);
  if (batch.ok) expect(batch.created[0].estrutura).toBe("matriz");
});

it("aplica RGA à exceção vigente e preserva seus critérios e editais", () => {
  const source = { ...structuredClone(v2Seed()[0]), id: "exception-rga-v1", tableId: "EX-RGA",
    kind: "excecao" as const, jornada: undefined, perfil: "Auditoria", local: "SEFAZ",
    editais: [V2_EDITAIS[0].id], links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }] };
  const result = v2ApplyIndividualRga([source], source.id, 5, "2026-10-01", "", "Lei 999/2026", "", "");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.record).toMatchObject({ kind: "excecao", perfil: "Auditoria", local: "SEFAZ", editais: source.editais, origem: "RGA" });
  expect(result.record.matrix.rows[0].values[0]).toContain("4.725,00");
  expect(result.record.events[0].label).toContain("RGA");
  expect(result.records.find((record) => record.id === source.id)?.links[0].fim).toBe("2026-09-30");
});

it("permite tabelas temporárias para o mesmo cargo, jornada e período com editais diferentes", () => {
  const temporary = { ...structuredClone(v2Seed()[0]), cargoId: 5, links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }], editais: [V2_EDITAIS[0].id] };
  const next: V2Input = { ...input, cargoId: 5, jornada: temporary.jornada, editais: [V2_EDITAIS[1].id],
    links: [{ tipo: "Contrato Temporário", inicio: input.inicio, incideRga: false }] };
  expect(v2Conflicts([temporary], next)).toEqual([]);
  const created = v2Create([temporary], next);
  expect(created.ok).toBe(true);
  if (created.ok) {
    expect(created.records).toHaveLength(2);
    expect(created.record.editais).toEqual([V2_EDITAIS[1].id]);
  }
  expect(v2Conflicts([temporary], { ...next, editais: [V2_EDITAIS[0].id] })).toEqual(["Contrato Temporário"]);
  expect(v2Create([temporary], { ...next, editais: [V2_EDITAIS[1].id, V2_EDITAIS[0].id] }).ok).toBe(false);
});
it("mantém o conflito de vínculos efetivos mesmo quando os editais temporários são diferentes", () => {
  const shared = { ...structuredClone(v2Seed()[0]), editais: [V2_EDITAIS[0].id] };
  const candidate: V2Input = { ...input, cargoId: 1, jornada: "20 horas", editais: [V2_EDITAIS[1].id], links: [
    { tipo: "Nomeado Efetivo", inicio: input.inicio, incideRga: true },
    { tipo: "Contrato Temporário", inicio: input.inicio, incideRga: false },
  ] };
  expect(v2Conflicts([shared], candidate)).toEqual(["Nomeado Efetivo"]);
});
it("permite tabela temporária geral e específica sem permitir duas tabelas gerais sobrepostas", () => {
  const general = { ...structuredClone(v2Seed()[0]), cargoId: 5, links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }] };
  const specific: V2Input = { ...input, cargoId: 5, jornada: "20 horas", editais: [V2_EDITAIS[0].id], links: [{ tipo: "Contrato Temporário", inicio: input.inicio, incideRga: false }] };
  expect(v2Create([general], specific).ok).toBe(true);
  expect(v2Create([general], { ...specific, editais: [] }).ok).toBe(false);
});

it("permite reutilizar o mesmo edital em jornadas distintas do cargo", () => {
  const previous = { ...structuredClone(v2Seed()[0]), cargoId: 5, jornada: "20 horas",
    editais: [V2_EDITAIS[1].id], links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }] };
  let records: V2Record[] = [previous];
  for (const jornada of ["30 horas", "40 horas"]) {
    const next: V2Input = { ...input, cargoId: 5, jornada, editais: [V2_EDITAIS[1].id],
      links: [{ tipo: "Contrato Temporário", inicio: input.inicio, incideRga: false }] };
    expect(v2Conflicts(records, next)).toEqual([]);
    const result = v2Create(records, next);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    records = result.records;
    expect(v2Create(records, next).ok).toBe(false);
  }
  expect(records.map((record) => record.jornada)).toEqual(["20 horas", "30 horas", "40 horas"]);
});

it("numera tabelas novas e preserva o ID no versionamento e na RGA", () => {
  const created = v2Create(v2Seed(), input);
  expect(created.ok).toBe(true);
  if (!created.ok) return;
  expect(v2TableDisplayId(created.record)).toBe("TV-0005");
  const version = v2Version(created.records, created.record.id, ["Nomeado Efetivo"], {
    ...input, inicio: "2026-11-01", links: input.links.map((link) => ({ ...link, inicio: "2026-11-01" })),
  });
  expect(version.ok).toBe(true);
  if (!version.ok) return;
  expect(v2TableDisplayId(version.record)).toBe("TV-0005");
  const rga = v2ApplyIndividualRga(v2Seed(), v2Seed()[0].id, 5, "2026-10-01", "", "LC RGA", "", "");
  expect(rga.ok).toBe(true);
  if (rga.ok) expect(v2TableDisplayId(rga.record)).toBe("TV-0001");
});

it("atribui IDs aos dados antigos e mantém a numeração mesmo ao reordenar as versões", () => {
  const old = v2Seed().map((record) => ({ ...record, tableNumber: undefined }));
  const migrated = v2AssignTableNumbers([...old, { ...old[0], id: "v2", version: 2 }]);
  expect(migrated.map(v2TableDisplayId)).toEqual(["TV-0001", "TV-0002", "TV-0003", "TV-0004", "TV-0001"]);
  const reversed = v2AssignTableNumbers([...migrated].reverse());
  expect(reversed.find((record) => record.id === old[1].id)?.tableNumber).toBe(2);
  const split = v2Version(old, old[0].id, ["Nomeado Efetivo"], {
    ...input, cargoId: old[0].cargoId, jornada: old[0].jornada,
  });
  expect(split.ok).toBe(true);
  if (split.ok) expect(v2TableDisplayId(split.record)).toBe("TV-0005");
});

it("oferece apenas referências vigentes e compatíveis com a jornada e seus editais", () => {
  const reference = { ...structuredClone(v2Seed()[0]), cargoId: 5, jornada: "40 horas", origem: "Referência" as const,
    editais: [V2_EDITAIS[0].id], links: [{ tipo: "Contrato Temporário", inicio: "2026-01-01", incideRga: false }] };
  const cargo = V2_CARGOS.find((item) => item.id === 5)!;
  expect(v2ReferenceCandidates([reference], cargo, "20 horas")).toHaveLength(1);
  expect(v2ReferenceCandidates([reference], cargo, "40 horas")).toHaveLength(0);
  expect(v2ReferenceCandidates([{ ...reference, inicio: "2099-01-01" }], cargo, "20 horas")).toHaveLength(0);
  expect(v2ReferenceCandidates([{ ...reference, fim: "2020-12-31" }], cargo, "20 horas")).toHaveLength(0);
  const used = { ...reference, id: "other", tableId: "other", jornada: "20 horas", origem: "Manual" as const };
  expect(v2ReferenceCandidates([reference, used], cargo, "20 horas")).toHaveLength(0);
  const incompatible = { ...reference, cargoId: 3, jornada: "20 horas" };
  expect(v2ReferenceCandidates([incompatible], V2_CARGOS.find((item) => item.id === 3)!, "40 horas")).toHaveLength(1);
});

it("cria o par comissionado com IDs distintos e calcula a gratificação", () => {
  const result = v2CreateCommissionedPair([], { ...input, cargoId: 101, jornada: "40 horas" }, "7000", "85");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.created.map(record => record.links[0].tipo)).toEqual(["Exclusivamente Comissionado", "Nomeado Efetivo"]);
  expect(result.created.map(record => v2TableDisplayId(record))).toEqual(["TV-0001", "TV-0002"]);
  expect(result.created[1].remuneracao?.valorCalculado).toContain("5.950,00");
  expect(result.created[1].matrix.rows[0].values[0]).toContain("5.950,00");
});
it("rejeita percentual inválido e não salva parcialmente quando o segundo vínculo conflita", () => {
  const candidate = { ...input, cargoId: 101, jornada: "40 horas" };
  expect(v2CreateCommissionedPair([], candidate, "7000", "101").ok).toBe(false);
  expect(v2CreateCommissionedPair([], candidate, "7000", "").ok).toBe(false);
  const existing = v2CreateCommissionedPair([], candidate, "7000", "85");
  if (!existing.ok) throw new Error("Falha ao preparar tabela");
  const records = [existing.created[1]];
  const before = JSON.stringify(records);
  expect(v2CreateCommissionedPair(records, candidate, "8000", "90").ok).toBe(false);
  expect(JSON.stringify(records)).toBe(before);
});

it("versiona o par comissionado preservando IDs, percentual e históricos", () => {
  const candidate = { ...input, cargoId: 101, jornada: "40 horas", inicio: "2026-01-01" };
  const pair = v2CreateCommissionedPair([], candidate, "7000", "85");
  if (!pair.ok) throw new Error(pair.message);
  const next = { ...candidate, inicio: "2026-10-01", remuneracao: { tipo: "subsidio" as const, valor: "8000" } };
  expect(v2VersionCommissionedPair(pair.records, pair.created[1].id, next).ok).toBe(false);
  const result = v2VersionCommissionedPair(pair.records, pair.created[0].id, next);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.created.map(record => record.version)).toEqual([2, 2]);
  expect(result.created.map(record => record.tableId)).toEqual(pair.created.map(record => record.tableId));
  expect(result.created.map(record => record.previousId)).toEqual(pair.created.map(record => record.id));
  expect(result.created[1].remuneracao?.valor).toBe("85");
  expect(result.created[1].remuneracao?.valorCalculado).toContain("6.800,00");
  expect(result.records.filter(record => record.version === 1).every(record => record.links[0].fim === "2026-09-30")).toBe(true);
});
it("não persiste metade do versionamento quando a vigência do Nomeado Efetivo é incompatível", () => {
  const candidate = { ...input, cargoId: 101, jornada: "40 horas", inicio: "2026-01-01" };
  const pair = v2CreateCommissionedPair([], candidate, "7000", "85");
  if (!pair.ok) throw new Error(pair.message);
  pair.records[1] = { ...pair.records[1], inicio: "2026-11-01" };
  const before = JSON.stringify(pair.records);
  const result = v2VersionCommissionedPair(pair.records, pair.created[0].id, {
    ...candidate, inicio: "2026-10-01", remuneracao: { tipo: "subsidio", valor: "8000" },
  });
  expect(result.ok).toBe(false);
  expect(JSON.stringify(pair.records)).toBe(before);
});

it("visualiza o percentual da época sem misturar versões comissionadas", () => {
  const candidate = { ...input, cargoId: 101, jornada: "40 horas", inicio: "2026-01-01" };
  const pair = v2CreateCommissionedPair([], candidate, "7000", "85");
  if (!pair.ok) throw new Error(pair.message);
  const next = v2VersionCommissionedPair(pair.records, pair.created[0].id, {
    ...candidate, inicio: "2026-10-01", remuneracao: { tipo: "subsidio", valor: "8000" },
  }, undefined, "90");
  if (!next.ok) throw new Error(next.message);
  expect(v2CommissionedViewValues(next.records, pair.created[0]).percent).toBe("85");
  expect(v2CommissionedViewValues(next.records, next.created[0]).percent).toBe("90");
  expect(v2CommissionedViewValues(next.records, pair.created[1]).subsidy).toContain("7.000,00");
});

it("aceita todos os vínculos nas jornadas do cargo e rejeita jornadas fora do cargo", () => {
  const candidate = { ...input, cargoId: 3, jornada: "40 horas",
    links: [{ tipo: "Contrato Temporário", inicio: input.inicio, incideRga: false }] };
  expect(v2Create([], candidate).ok).toBe(true);
  expect(v2Create([], { ...candidate, jornada: "99 horas" }).ok).toBe(false);
});
