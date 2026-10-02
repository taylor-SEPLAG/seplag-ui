import { cargosComissionadosIniciais } from "../controleVagasComissionados/cargosComissionadosStore";
export type V2Remuneracao = { tipo: "subsidio" | "gratificacao"; valor: string; baseCalculo?: string; valorCalculado?: string };
export type V2Matrix = { columns: string[]; rows: { name: string; values: string[] }[] };
export type V2Kind = "padrao" | "excecao";
export type V2Origin = "Manual" | "Referência" | "Proporcional" | "Ajustada manualmente" | "RGA" | "RGA em lote";
export type V2Link = { tipo: string; inicio: string; fim?: string; incideRga: boolean; percentualRga?: string };
export type V2Event = {
  id: string;
  label: string;
  detail: string;
  when: string;
  actor: string;
  tipos: string[];
  before?: V2Matrix;
  after?: V2Matrix;
  percent?: number;
  year?: string;
  applicationType?: "Individual" | "Em lote";
  baseLegal?: string;
};
export type V2Record = {
  id: string;
  tableId: string;
  tableNumber?: number;
  version: number;
  kind: V2Kind;
  cargoId: number;
  jornada?: string;
  editais?: string[];
  perfil?: string;
  local?: string;
  horasTrabalhadas?: string;
  inicio: string;
  fim?: string;
  links: V2Link[];
  matrix: V2Matrix;
  estrutura?: "fixo" | "matriz";
  remuneracao?: V2Remuneracao;
  baseLegal: string;
  baseLegalId?: string;
  observacao: string;
  origem: V2Origin;
  referencia?: string;
  proporcional?: { referenciaId: string; percentual: number; calculada: V2Matrix };
  responsavel: string;
  criadoEm: string;
  previousId?: string;
  commissionPairId?: string;
  events: V2Event[];
};
export type V2Cargo = {
  id: number;
  nome: string;
  carreira: string;
  comissionado: boolean;
  jornadas: string[];
  vinculos: { tipo: string; jornadas: string[] }[];
  perfis: string[];
  editaisObrigatorios?: { jornada: string; tipo: string; editais: string[] }[];
};
export const V2_CARGOS: V2Cargo[] = [
  {
    id: 1, nome: "Auditor Fiscal", carreira: "Administração Tributária", comissionado: false,
    jornadas: ["20 horas", "30 horas", "40 horas"],
    vinculos: [
      { tipo: "Nomeado Efetivo", jornadas: ["20 horas", "30 horas", "40 horas"] },
      { tipo: "Contrato Temporário", jornadas: ["20 horas", "30 horas", "40 horas"] },
      { tipo: "Emprego Público", jornadas: ["40 horas"] },
    ],
    editaisObrigatorios: [{ jornada: "40 horas", tipo: "Contrato Temporário", editais: ["pss-sefaz-002-2026"] }],
    perfis: ["Auditoria", "Fiscalização", "Tecnologia da Informação", "Contabilidade"],
  },
  {
    id: 2, nome: "Analista Administrativo", carreira: "Gestão Governamental", comissionado: false,
    jornadas: ["20 horas", "30 horas", "40 horas"],
    vinculos: [
      { tipo: "Nomeado Efetivo", jornadas: ["20 horas", "30 horas", "40 horas"] },
      { tipo: "Contrato Temporário", jornadas: ["30 horas", "40 horas"] },
    ],
    perfis: ["Administração", "Contabilidade", "Planejamento"],
  },
  {
    id: 3, nome: "Professor da Educação Básica", carreira: "Educação Básica", comissionado: false,
    jornadas: ["20 horas", "30 horas", "40 horas"],
    vinculos: [
      { tipo: "Nomeado Efetivo", jornadas: ["20 horas", "30 horas", "40 horas"] },
      { tipo: "Contrato Temporário", jornadas: ["20 horas", "30 horas"] },
    ],
    editaisObrigatorios: ["20 horas", "30 horas"].map((jornada) => ({ jornada, tipo: "Contrato Temporário", editais: ["pss-seduc-003-2026"] })),
    perfis: ["Pedagogia", "Matemática", "Língua Portuguesa"],
  },
  {
    id: 4, nome: "Médico", carreira: "Saúde Pública", comissionado: false,
    jornadas: ["20 horas", "24 horas", "40 horas"],
    vinculos: [
      { tipo: "Nomeado Efetivo", jornadas: ["20 horas", "24 horas", "40 horas"] },
      { tipo: "Contrato Temporário", jornadas: ["20 horas", "24 horas"] },
    ],
    editaisObrigatorios: ["20 horas", "24 horas"].map((jornada) => ({ jornada, tipo: "Contrato Temporário", editais: ["pss-ses-004-2026"] })),
    perfis: ["Clínica Médica", "Cardiologia"],
  },
  {
    "id": 5,
    "nome": "Assistente de Apoio Temporário",
    "carreira": "Gestão Governamental",
    "comissionado": false,
    "jornadas": [
      "20 horas",
      "30 horas",
      "40 horas"
    ],
    "vinculos": [
      {
        "tipo": "Contrato Temporário",
        "jornadas": [
          "20 horas",
          "30 horas",
          "40 horas"
        ]
      }
    ],
    "perfis": [
      "Administrativo"
    ]
  },
  {
    "id": 6,
    "nome": "Analista de Gestão Pública",
    "carreira": "Gestão Governamental",
    "comissionado": false,
    "jornadas": [
      "20 horas",
      "30 horas",
      "40 horas"
    ],
    "vinculos": [
      {
        "tipo": "Nomeado Efetivo",
        "jornadas": [
          "20 horas",
          "30 horas",
          "40 horas"
        ]
      }
    ],
    "perfis": [
      "Administrativo"
    ]
  },
  {
    "id": 7,
    "nome": "Apoio Técnico e Formação",
    "carreira": "Formação e Desenvolvimento",
    "comissionado": false,
    "jornadas": [
      "20 horas",
      "30 horas",
      "40 horas"
    ],
    "vinculos": [
      {
        "tipo": "Residente Técnico",
        "jornadas": [
          "20 horas",
          "30 horas",
          "40 horas"
        ]
      },
      {
        "tipo": "Bolsista",
        "jornadas": [
          "20 horas",
          "30 horas",
          "40 horas"
        ]
      },
      {
        "tipo": "Estagiário",
        "jornadas": [
          "20 horas",
          "30 horas",
          "40 horas"
        ]
      }
    ],
    "perfis": [
      "Administrativo"
    ]
  },
  {
    "id": 8,
    "nome": "Técnico Administrativo",
    "carreira": "Gestão Governamental",
    "comissionado": false,
    "jornadas": [
      "20 horas",
      "30 horas",
      "40 horas"
    ],
    "vinculos": [
      {
        "tipo": "Nomeado Efetivo",
        "jornadas": [
          "20 horas",
          "30 horas",
          "40 horas"
        ]
      },
      {
        "tipo": "Estabilizado Constitucionalmente",
        "jornadas": [
          "20 horas",
          "30 horas",
          "40 horas"
        ]
      },
      {
        "tipo": "Contrato Temporário",
        "jornadas": [
          "20 horas",
          "30 horas",
          "40 horas"
        ]
      }
    ],
    "perfis": [
      "Administrativo"
    ]
  },
  ...cargosComissionadosIniciais.map((item): V2Cargo => ({ id: item.id, nome: item.nome, carreira: "Cargos Comissionados", comissionado: true, jornadas: ["40 horas"],
    vinculos: [{ tipo: "Exclusivamente Comissionado", jornadas: ["40 horas"] }, { tipo: "Nomeado Efetivo", jornadas: ["40 horas"] }], perfis: ["Direção"] })),
 ].map(cargo => ({ ...cargo, vinculos: cargo.vinculos.map(link => ({ ...link, jornadas: [...cargo.jornadas] })) }));
export type V2Edital = { id: string; nome: string; situacao: "Em homologação" | "Aberto" | "Encerrado" };
export const V2_EDITAIS: V2Edital[] = [
  { id: "pss-sefaz-002-2026", nome: "PSS 002/2026/SEFAZ — Auditoria e apoio administrativo", situacao: "Em homologação" },
  { id: "pss-seduc-003-2026", nome: "PSS 003/2026/SEDUC — Educação Básica", situacao: "Em homologação" },
  { id: "pss-ses-004-2026", nome: "PSS 004/2026/SES — Saúde", situacao: "Em homologação" },
  { id: "pss-seplag-005-2026", nome: "PSS 005/2026/SEPLAG — Gestão Governamental", situacao: "Aberto" },
  { id: "pss-ses-006-2025", nome: "PSS 006/2025/SES — Saúde", situacao: "Encerrado" },
];
export const v2EditalNames = (ids?: string[]) => (ids || []).map((id) => V2_EDITAIS.find((edital) => edital.id === id)?.nome || id).join("; ");
export const V2_LOCAIS = ["SEFAZ", "SEPLAG", "SEDUC", "Cuiabá", "Várzea Grande"];
const KEY = "sigep-tabela-v2-v1";
const today = () => new Date().toLocaleDateString("en-CA");
const timestamp = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const cents = (value: string) => {
  const cleaned = value.replace(/[^\d,.]/g, "");
  if (!cleaned) return 0;
  const separator = cleaned.lastIndexOf(",") >= 0 ? "," : /^\d+\.\d{1,2}$/.test(cleaned) ? "." : "";
  if (!separator) return (Number(cleaned.replace(/\D/g, "")) || 0) * 100;
  const index = cleaned.lastIndexOf(separator);
  const whole = Number(cleaned.slice(0, index).replace(/\D/g, "")) || 0;
  const fraction = Number(cleaned.slice(index + 1).replace(/\D/g, "").padEnd(2, "0").slice(0, 2)) || 0;
  return whole * 100 + fraction;
};
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
export const v2Currency = (value: string) => money(cents(value));
const normalizedMatrix = (matrix: V2Matrix): V2Matrix => ({
  columns: matrix.columns.map((name) => name.trim()),
  rows: matrix.rows.map((row) => ({ name: row.name.trim(), values: row.values.map((value) => value ? v2Currency(value) : "") })),
});
export const v2Date = (value?: string) => value ? value.split("-").reverse().join("/") : "—";
export const v2Yesterday = (iso: string) => {
  const date = new Date(iso + "T12:00:00");
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString("en-CA");
};
export const v2MatrixValid = (matrix: V2Matrix) =>
  matrix.columns.length > 0 && matrix.rows.length > 0 &&
  matrix.columns.every((name) => name.trim()) &&
  matrix.rows.every((row) => row.name.trim() && row.values.length === matrix.columns.length) &&
  new Set(matrix.columns.map((name) => name.trim().toLowerCase())).size === matrix.columns.length &&
  new Set(matrix.rows.map((row) => row.name.trim().toLowerCase())).size === matrix.rows.length &&
  matrix.rows.every((row) => row.values.every((value) => cents(value) > 0));
export const v2CommissionCalculatedValue = (base: string, percent: string) => money(Math.round(cents(base) * Number(percent.replace(",", ".")) / 100));
export const v2RemuneracaoValid = (value?: V2Remuneracao) => Boolean(value && (value.tipo === "subsidio" ? cents(value.valor) > 0 : cents(value.baseCalculo || "") > 0 && Number(value.valor.replace(",", ".")) > 0 && Number(value.valor.replace(",", ".")) <= 100));
export const v2Structure = (record: Pick<V2Record, "cargoId" | "estrutura">) => V2_CARGOS.find((cargo) => cargo.id === record.cargoId)?.comissionado ? record.estrutura || "fixo" : "matriz";
export const v2ValuesValid = (input: Pick<V2Input, "cargoId" | "matrix" | "remuneracao" | "estrutura">) => {
  const structure = v2Structure(input);
  if (structure === "fixo" && V2_CARGOS.find((cargo) => cargo.id === input.cargoId)?.comissionado) return v2RemuneracaoValid(input.remuneracao);
  return (structure !== "fixo" || input.matrix.columns.length === 1 && input.matrix.rows.length === 1) && v2MatrixValid(input.matrix);
};
export const v2ProportionalMatrix = (matrix: V2Matrix, sourceHours: number, targetHours: number): V2Matrix => ({
  columns: [...matrix.columns],
  rows: matrix.rows.map((row) => ({
    name: row.name,
    values: row.values.map((value) => value ? money(Math.round(cents(value) * targetHours / sourceHours)) : ""),
  })),
});
export const v2RgaMatrix = (matrix: V2Matrix, percent: number): V2Matrix => ({
  columns: [...matrix.columns],
  rows: matrix.rows.map((row) => ({
    name: row.name,
    values: row.values.map((value) => value ? money(Math.round(cents(value) * (1 + percent / 100))) : ""),
  })),
});
export const v2Hours = (jornada: string) => Number(jornada.match(/\d+/)?.[0] || 0);
export const v2Status = (record: V2Record, on = today()): "Vigente" | "Futura" | "Encerrada" => {
  if (record.inicio > on) return "Futura";
  const applicable = record.links.some((link) => link.inicio <= on && (!link.fim || link.fim >= on));
  return applicable && (!record.fim || record.fim >= on) ? "Vigente" : "Encerrada";
};
export const v2VisibleLinks = (record: V2Record, on = today()) => {
  const open = record.links.filter((link) => !link.fim || link.fim >= on);
  return open.length ? open : record.links;
};
const sampleMatrix: V2Matrix = {
  columns: ["A", "B", "C"],
  rows: [
    { name: "001", values: ["R$ 4.500,00", "R$ 4.750,00", "R$ 5.000,00"] },
    { name: "002", values: ["R$ 4.800,00", "R$ 5.050,00", "R$ 5.300,00"] },
    { name: "003", values: ["R$ 5.100,00", "R$ 5.350,00", "R$ 5.600,00"] },
  ],
};
const sample = (tableId: string, jornada: string, tipos: string[], origin: V2Origin, matrix = sampleMatrix): V2Record => ({
  id: tableId + "-v1", tableId, tableNumber: Number(tableId.slice(4)), version: 1, kind: "padrao", cargoId: 1, jornada,
  inicio: "2026-01-01",
  links: tipos.map((tipo) => ({ tipo, inicio: "2026-01-01", incideRga: tipo === "Nomeado Efetivo" })),
  matrix, baseLegal: "Lei Complementar nº 600/2017",
  observacao: "", origem: origin, responsavel: "Roberto Junior",
  criadoEm: "2026-01-02T10:00:00.000Z",
  events: [{
    id: tableId + "-e1", label: "Tabela criada", detail: "Cadastro inicial da tabela.",
    when: "2026-01-02T10:00:00.000Z", actor: "Roberto Junior", tipos,
  }],
});
const SEED: V2Record[] = [
  sample("TV2-001", "20 horas", ["Nomeado Efetivo", "Contrato Temporário"], "Manual"),
  sample("TV2-002", "30 horas", ["Nomeado Efetivo"], "Manual", v2ProportionalMatrix(sampleMatrix, 20, 30)),
  sample("TV2-003", "30 horas", ["Contrato Temporário"], "Manual", v2RgaMatrix(v2ProportionalMatrix(sampleMatrix, 20, 30), 1)),
  sample("TV2-004", "40 horas", ["Nomeado Efetivo", "Contrato Temporário"], "Referência", v2ProportionalMatrix(sampleMatrix, 20, 40)),
];
export const v2AssignTableNumbers = (records: V2Record[]): V2Record[] => {
  const numbers = new Map<string, number>();
  for (const record of records) {
    if (record.tableNumber && Number.isInteger(record.tableNumber) && record.tableNumber > 0 && !numbers.has(record.tableId) && ![...numbers.values()].includes(record.tableNumber)) {
      numbers.set(record.tableId, record.tableNumber);
    }
  }
  let next = Math.max(0, ...numbers.values()) + 1;
  return records.map((record) => {
    if (!numbers.has(record.tableId)) numbers.set(record.tableId, next++);
    const tableNumber = numbers.get(record.tableId)!;
    return record.tableNumber === tableNumber ? record : { ...record, tableNumber };
  });
};
export const v2TableDisplayId = (record: V2Record) => "TV-" + String(record.tableNumber || 0).padStart(4, "0");
const nextTableNumber = (records: V2Record[]) => Math.max(0, ...records.map((record) => record.tableNumber || 0)) + 1;

export const v2Read = (): V2Record[] => {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw === null) return SEED;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? v2AssignTableNumbers(parsed as V2Record[]) : SEED;
  } catch { return SEED; }
};
export const v2Persist = (records: V2Record[]) => {
  window.sessionStorage.setItem(KEY, JSON.stringify(v2AssignTableNumbers(records)));
  window.dispatchEvent(new Event("v2-records-updated"));
};
export const v2Latest = (records: V2Record[], kind?: V2Kind): V2Record[] => {
  const latest = new Map<string, V2Record>();
  const priority = (record: V2Record) => ({ Vigente: 3, Futura: 2, Encerrada: 1 })[v2Status(record)];
  records.filter((record) => !kind || record.kind === kind).forEach((record) => {
    const previous = latest.get(record.tableId);
    if (!previous || priority(record) > priority(previous) ||
      priority(record) === priority(previous) && record.version > previous.version) {
      latest.set(record.tableId, record);
    }
  });
  return [...latest.values()];
};
export const v2Versions = (records: V2Record[], tableId: string) =>
  records.filter((record) => record.tableId === tableId).sort((a, b) => b.version - a.version);
const periodsOverlap = (aStart: string, aEnd: string | undefined, bStart: string, bEnd: string | undefined) =>
  aStart <= (bEnd || "9999-12-31") && bStart <= (aEnd || "9999-12-31");
export type V2Input = Omit<V2Record, "id" | "tableId" | "tableNumber" | "version" | "responsavel" | "criadoEm" | "events" | "previousId">;
export const v2Conflicts = (records: V2Record[], input: V2Input, skip?: { recordId: string; tipos: string[] }): string[] => {
  const conflicts = new Set<string>();
  input.links.forEach((link) => records.forEach((record) => {
    if (record.kind !== input.kind || record.cargoId !== input.cargoId) return;
    if (input.kind === "padrao" && record.jornada !== input.jornada) return;
    if (input.kind === "excecao" && ((record.perfil || "") !== (input.perfil || "") || (record.local || "") !== (input.local || "") || (record.horasTrabalhadas || "") !== (input.horasTrabalhadas || ""))) return;
    record.links.forEach((existing) => {
      if (existing.tipo !== link.tipo) return;
      if (link.tipo === "Contrato Temporário") {
        const currentEditais = record.editais || [];
        const newEditais = input.editais || [];
        const sameScope = currentEditais.length && newEditais.length
          ? currentEditais.some((id) => newEditais.includes(id))
          : !currentEditais.length && !newEditais.length;
        if (!sameScope) return;
      }
      if (skip && skip.tipos.includes(link.tipo) && skip.recordId === record.id) return;
      if (periodsOverlap(link.inicio, link.fim || input.fim, existing.inicio, existing.fim || record.fim)) conflicts.add(link.tipo);
    });
  }));
  return [...conflicts];
};
const conflictMessage = (tipos: string[]) =>
  "Já existe uma tabela cadastrada para o período informado. Tipo(s) de Vínculo em conflito: " + tipos.join(", ") + ". Revise a seleção ou utilize o versionamento da tabela existente.";
const validateInput = (input: V2Input, allowMissingInheritedEditais = false): string | null => {
  if (!input.cargoId || !input.links.length || !input.inicio || !input.baseLegal.trim()) return "Preencha os campos obrigatórios.";
  if (input.kind === "padrao" && !input.jornada) return "Selecione a Jornada.";
  if (input.kind === "excecao" && (!input.perfil || !input.local)) return "Selecione Perfil Profissional e Local de Lotação.";
  if (input.origem !== "RGA" && input.origem !== "RGA em lote" && input.links.some((link) => link.tipo === "Contrato Temporário") && !input.editais?.length && !allowMissingInheritedEditais) return "Selecione ao menos um Edital / Processo Seletivo.";
  if (input.editais?.length && !input.links.some((link) => link.tipo === "Contrato Temporário")) return "Selecione Contrato Temporário para associar editais.";
  if (input.editais && (new Set(input.editais).size !== input.editais.length || input.editais.some((id) => !V2_EDITAIS.some((edital) => edital.id === id && edital.situacao === "Em homologação")))) return "Selecione somente editais em homologação.";
  if (input.fim && input.fim < input.inicio) return "A data de término deve ser posterior à data de início.";
  if (input.estrutura && !["fixo", "matriz"].includes(input.estrutura)) return "Selecione a Estrutura de Vencimento.";
  if (!v2ValuesValid(input)) return "Preencha todos os valores da estrutura remuneratória.";
  if (input.links.some((link) => !link.tipo || (link.fim && link.fim < link.inicio))) return "Revise os vínculos e suas vigências.";
  const cargo = V2_CARGOS.find((item) => item.id === input.cargoId);
  if (!cargo || input.links.some((link) => !cargo.vinculos.some((valid) => valid.tipo === link.tipo))) return "Selecione apenas Tipos de Vínculo válidos para o Cargo e a Jornada.";
  if (!cargo.comissionado && input.estrutura === "fixo") return "Informe os valores por Nível e Classe.";
  if (input.kind === "padrao" && !cargo.jornadas.includes(input.jornada || "")) return "Selecione uma Jornada válida para o Cargo.";
  if (cargo.comissionado && v2Structure(input) === "fixo" && new Set(input.links.map((link) => link.tipo === "Exclusivamente Comissionado" ? "subsidio" : "gratificacao")).size > 1) return "Compartilhe apenas vínculos com a mesma estrutura remuneratória.";
  if (cargo.comissionado && v2Structure(input) === "fixo" && input.remuneracao?.tipo !== (input.links[0].tipo === "Exclusivamente Comissionado" ? "subsidio" : "gratificacao")) return "Selecione a estrutura remuneratória correspondente ao Tipo de Vínculo.";
  return null;
};
export type V2Result = { ok: true; records: V2Record[]; record: V2Record } | { ok: false; message: string };
export const v2Create = (records: V2Record[], input: V2Input, actor = "Roberto Junior"): V2Result => {
  records = v2AssignTableNumbers(records);
  const error = validateInput(input);
  if (error) return { ok: false, message: error };
  const conflicts = v2Conflicts(records, input);
  if (conflicts.length) return { ok: false, message: conflictMessage(conflicts) };
  const tableId = "TV2-" + id().slice(0, 8).toUpperCase();
  const when = timestamp();
  const record: V2Record = {
    ...input, matrix: normalizedMatrix(input.matrix), id: id(), tableId, tableNumber: nextTableNumber(records), version: 1, responsavel: actor, criadoEm: when,
    events: [{ id: id(), label: input.origem === "Proporcional" ? "Tabela proporcional gerada" : input.origem === "Ajustada manualmente" ? "Cálculo proporcional ajustado" : "Tabela criada",
      detail: (input.referencia ? "Referência: " + input.referencia + ". " : "") + "Cargo " + input.cargoId + (input.jornada ? ", jornada " + input.jornada : "") + ". Vigência: " + v2Date(input.inicio) + " a " + v2Date(input.fim) + ". Base Legal: " + input.baseLegal + ". Estrutura: " + (v2Structure(input) === "fixo" ? "Valor Fixo" : "Tabela por Nível e Classe") + ". Editais: " + (v2EditalNames(input.editais) || "Nenhum") + ". Incidência de RGA: " + input.links.map((link) => link.tipo + " " + (link.incideRga ? "Sim" : "Não") + (link.percentualRga ? " (" + link.percentualRga + "%)" : "")).join("; ") + "." + (input.remuneracao ? " Remuneração: " + input.remuneracao.tipo + " " + input.remuneracao.valor + (input.remuneracao.baseCalculo ? ", base " + input.remuneracao.baseCalculo + ", valor calculado " + input.remuneracao.valorCalculado : "") + "." : ""),
      when, actor, tipos: input.links.map((link) => link.tipo), before: input.proporcional?.calculada, after: normalizedMatrix(input.matrix), percent: input.proporcional?.percentual, baseLegal: input.baseLegal }],
  };
  return { ok: true, records: [...records, record], record };
};
export const v2Version = (
  records: V2Record[], sourceId: string, selectedTypes: string[], input: V2Input,
  actor = "Roberto Junior", audit?: { percent: number; applicationType?: "Individual" | "Em lote" },
): V2Result => {
  records = v2AssignTableNumbers(records);
  const source = records.find((record) => record.id === sourceId);
  if (!source) return { ok: false, message: "Tabela de origem não encontrada." };
  const selected = [...new Set(selectedTypes)];
  if (input.links.length !== selected.length || input.links.some((link) => !selected.includes(link.tipo))) return { ok: false, message: "Os vínculos da nova versão devem coincidir com a seleção." };
  if (!selected.length || selected.some((tipo) => !v2VisibleLinks(source).some((link) => link.tipo === tipo))) return { ok: false, message: "Selecione os vínculos da nova versão." };
  if (input.inicio <= source.inicio) return { ok: false, message: "A nova vigência deve começar após a versão anterior." };
  if (input.cargoId !== source.cargoId || input.kind !== source.kind || input.jornada !== source.jornada || input.perfil !== source.perfil || input.local !== source.local || input.horasTrabalhadas !== source.horasTrabalhadas) return { ok: false, message: "Mantenha a identificação da tabela de origem." };
  const error = validateInput(input, !source.editais?.length && !input.editais?.length);
  if (error) return { ok: false, message: error };
  const conflicts = v2Conflicts(records, input, { recordId: source.id, tipos: selected });
  if (conflicts.length) return { ok: false, message: conflictMessage(conflicts) };
  const split = selected.length < v2VisibleLinks(source).length;
  const ended = v2Yesterday(input.inicio);
  const when = timestamp();
  const changedIncidence = selected.filter((tipo) =>
    source.links.find((link) => link.tipo === tipo)?.incideRga !== input.links.find((link) => link.tipo === tipo)?.incideRga || source.links.find((link) => link.tipo === tipo)?.percentualRga !== input.links.find((link) => link.tipo === tipo)?.percentualRga);
  const updatedSource: V2Record = {
    ...source,
    links: source.links.map((link) => selected.includes(link.tipo)
      ? { ...link, fim: link.fim && link.fim < ended ? link.fim : ended } : link),
    events: [...source.events, { id: id(), label: split ? "Tipos de Vínculo separados" : "Vigência encerrada",
      detail: split ? "Vínculos transferidos para uma tabela independente em " + v2Date(input.inicio) + ": " + selected.join(", ") + ". Vínculos mantidos na tabela anterior: " + source.links.filter((link) => !selected.includes(link.tipo) && (!link.fim || link.fim >= input.inicio)).map((link) => link.tipo).join(", ") + "." :
        "Versão substituída a partir de " + v2Date(input.inicio) + ".",
      when, actor, tipos: selected }],
  };
  const tableId = split ? "TV2-" + id().slice(0, 8).toUpperCase() : source.tableId;
  const version = split ? 1 : Math.max(...records.filter((record) => record.tableId === tableId).map((record) => record.version)) + 1;
  const record: V2Record = {
    ...input, commissionPairId: input.commissionPairId || source.commissionPairId, matrix: normalizedMatrix(input.matrix), id: id(), tableId, tableNumber: split ? nextTableNumber(records) : source.tableNumber, version, previousId: source.id, responsavel: actor, criadoEm: when,
    events: [{ id: id(), label: audit ? "RGA aplicado" : split ? "Nova tabela após separação" : "Nova versão criada",
      detail: audit ? "Reajuste de " + audit.percent.toLocaleString("pt-BR") + "% sobre " + source.tableId + " V" + source.version + ". Aplicado em " + new Date(when).toLocaleString("pt-BR") + "; vigência a partir de " + v2Date(input.inicio) + "." : split ? "Vínculos separados da tabela " + source.tableId + " V" + source.version + "." : "Valores e vigência atualizados. Editais anteriores: " + (v2EditalNames(source.editais) || "Nenhum") + "; editais da nova versão: " + (v2EditalNames(input.editais) || "Nenhum") + "." + (input.remuneracao ? " Remuneração anterior: " + (source.remuneracao?.valor || "—") + "; nova: " + input.remuneracao.valor + "." : ""),
      when, actor, tipos: selected, before: source.matrix, after: normalizedMatrix(input.matrix),
      percent: audit?.percent, applicationType: audit?.applicationType, baseLegal: input.baseLegal },
      ...(changedIncidence.length ? [{ id: id(), label: "Incidência de RGA alterada",
        detail: changedIncidence.map((tipo) => tipo + ": " + (source.links.find((link) => link.tipo === tipo)?.incideRga ? "Sim" : "Não") +
          (source.links.find((link) => link.tipo === tipo)?.percentualRga ? " (" + source.links.find((link) => link.tipo === tipo)?.percentualRga + "%)" : "") +
          " → " + (input.links.find((link) => link.tipo === tipo)?.incideRga ? "Sim" : "Não") +
          (input.links.find((link) => link.tipo === tipo)?.percentualRga ? " (" + input.links.find((link) => link.tipo === tipo)?.percentualRga + "%)" : "")).join("; ") + ".",
        when, actor, tipos: changedIncidence }] : [])],
  };
  return { ok: true, records: [...records.map((item) => item.id === source.id ? updatedSource : item), record], record };
};
export const v2Applicable = (
  records: V2Record[], criteria: { cargoId: number; jornada: string; tipo: string; perfil?: string; local?: string; horasTrabalhadas?: string }, on: string,
): V2Record | undefined => {
  const matches = records.filter((record) =>
    record.cargoId === criteria.cargoId &&
    (record.kind === "excecao"
      ? (!record.perfil || record.perfil === criteria.perfil) && (!record.local || record.local === criteria.local) && (!record.horasTrabalhadas || record.horasTrabalhadas === criteria.horasTrabalhadas)
      : record.jornada === criteria.jornada) &&
    record.links.some((link) => link.tipo === criteria.tipo && link.inicio <= on && (!link.fim || link.fim >= on)) &&
    record.inicio <= on && (!record.fim || record.fim >= on));
  return matches.sort((a, b) => {
    const specificity = (record: V2Record) => record.kind === "padrao" ? 0 : 1 + Number(Boolean(record.perfil)) + Number(Boolean(record.local)) + Number(Boolean(record.horasTrabalhadas));
    return specificity(b) - specificity(a) || b.inicio.localeCompare(a.inicio);
  })[0];
};
export const v2RgaCandidates = (records: V2Record[], on = today()) =>
  v2Latest(records, "padrao").filter((record) => v2Status(record, on) === "Vigente");

export const v2ApplyRga = (
  records: V2Record[], ids: string[], percent: number, start: string, baseLegal: string, observation: string,
  actor = "Roberto Junior",
): { ok: true; records: V2Record[]; created: V2Record[] } | { ok: false; message: string } => {
  if (!Number.isFinite(percent) || percent <= 0 || !start || !baseLegal.trim() || !ids.length)
    return { ok: false, message: "Preencha o percentual, a vigência, a Base Legal e selecione ao menos uma tabela." };
  if (new Set(ids).size !== ids.length) return { ok: false, message: "Há tabelas selecionadas em duplicidade." };
  const selectable = new Set(v2RgaCandidates(records).map((record) => record.id));
  if (ids.some((recordId) => !selectable.has(recordId)))
    return { ok: false, message: "Uma tabela selecionada não está mais vigente. Revise a seleção." };
  let next = records;
  const created: V2Record[] = [];
  for (const recordId of ids) {
    const source = next.find((record) => record.id === recordId);
    if (!source || source.kind !== "padrao" || v2Status(source) !== "Vigente")
      return { ok: false, message: "Uma tabela selecionada não está mais vigente. Revise a seleção." };
    const links = v2VisibleLinks(source);
    if (!links.length || links.some((link) => start < link.inicio || start > (link.fim || source.fim || "9999-12-31")))
      return { ok: false, message: "A vigência do RGA está fora do período da tabela " + source.tableId + "." };
    const adjustedAmount = (value: string) => money(Math.round(cents(value) * (1 + percent / 100)));
    const remuneration = source.remuneracao;
    const base = remuneration?.baseCalculo ? adjustedAmount(remuneration.baseCalculo) : undefined;
    const nextRemuneration = remuneration ? remuneration.tipo === "subsidio"
      ? { ...remuneration, valor: adjustedAmount(remuneration.valor) }
      : { ...remuneration, baseCalculo: base, valorCalculado: base ? v2CommissionCalculatedValue(base, remuneration.valor) : undefined } : undefined;
    const matrix = v2RgaMatrix(source.matrix, percent);
    if (nextRemuneration && matrix.rows[0]?.values.length)
      matrix.rows[0].values[0] = nextRemuneration.tipo === "subsidio" ? nextRemuneration.valor : nextRemuneration.valorCalculado || matrix.rows[0].values[0];
    const input: V2Input = {
      kind: "padrao", cargoId: source.cargoId, jornada: source.jornada,
      estrutura: v2Structure(source), editais: source.editais,
      inicio: start, fim: source.fim,
      links: links.map((link) => ({ ...link, inicio: start })),
      matrix, remuneracao: nextRemuneration,
      baseLegal, observacao: observation, origem: "RGA em lote",
      referencia: source.tableId + " V" + source.version,
    };
    const result = v2Version(next, source.id, links.map((link) => link.tipo), input, actor, { percent, applicationType: "Em lote" });
    if (!result.ok) return result;
    result.record.events[0].detail += " Cargo: " + (V2_CARGOS.find((cargo) => cargo.id === source.cargoId)?.nome || source.cargoId) +
      "; jornada: " + source.jornada + "; vínculos: " + links.map((link) => link.tipo).join(", ") +
      "; base legal: " + baseLegal + "; observação: " + (observation || "—") + ".";
    next = result.records;
    created.push(result.record);
  }
  return { ok: true, records: next, created };
};
export const v2ApplyIndividualRga = (
  records: V2Record[], sourceId: string, percent: number, start: string, end: string,
  baseLegal: string, baseLegalId: string, observation: string, year = start.slice(0, 4),
): V2Result => {
  const source = records.find((record) => record.id === sourceId);
  if (!source || v2Status(source) !== "Vigente") return { ok: false, message: "Selecione uma tabela vigente." };
  if (!Number.isFinite(percent) || percent <= 0 || !start || !baseLegal.trim()) return { ok: false, message: "Informe percentual, data início da vigência e Base Legal." };
  if (!/^[0-9]{4}$/.test(year)) return { ok: false, message: "Informe o ano do RGA com quatro dígitos." };
  const links = v2VisibleLinks(source);
  if (links.some((link) => start < link.inicio || start > (link.fim || source.fim || "9999-12-31"))) return { ok: false, message: "A vigência do RGA deve estar dentro da vigência da tabela selecionada." };
  const adjustedAmount = (value: string) => money(Math.round(cents(value) * (1 + percent / 100)));
  const remuneration = source.remuneracao;
  const base = remuneration?.baseCalculo ? adjustedAmount(remuneration.baseCalculo) : undefined;
  const nextRemuneration = remuneration ? remuneration.tipo === "subsidio"
    ? { ...remuneration, valor: adjustedAmount(remuneration.valor) }
    : { ...remuneration, baseCalculo: base, valorCalculado: base ? v2CommissionCalculatedValue(base, remuneration.valor) : undefined } : undefined;
  const input: V2Input = {
    kind: source.kind, cargoId: source.cargoId, jornada: source.jornada, perfil: source.perfil, local: source.local,
    estrutura: v2Structure(source),
    editais: source.editais,
    inicio: start, fim: end || source.fim, links: links.map((link) => ({ ...link, inicio: start, fim: end || link.fim || source.fim })),
    matrix: v2RgaMatrix(source.matrix, percent), remuneracao: nextRemuneration,
    baseLegal, baseLegalId, observacao: observation, origem: "RGA", referencia: source.tableId + " V" + source.version,
  };
  if (source.fim && end && end > source.fim || links.some((link) => link.fim && end && end > link.fim)) return { ok: false, message: "A data de término do RGA deve estar dentro da vigência da tabela selecionada." };
  const result = v2Version(records, source.id, links.map((link) => link.tipo), input, undefined, { percent, applicationType: "Individual" });
  if (result.ok) {
    result.record.events[0].year = year;
    result.record.events[0].detail += " Ano do RGA: " + year + ".";
  }
  if (result.ok && remuneration && nextRemuneration) {
    result.record.events[0].detail += " Remuneração anterior: " + (remuneration.valorCalculado || remuneration.valor) + "; nova: " + (nextRemuneration.valorCalculado || nextRemuneration.valor) + ".";
  }
  return result;
};

export const v2Seed = () => SEED;

export const V2_BASE = "/prototipos/sigep/tabela-v2";
export const v2Today = () => new Date().toLocaleDateString("en-CA");
export const v2RecordTypes = (record: V2Record) => v2VisibleLinks(record).map((link) => link.tipo);
export const blankV2Matrix = (): V2Matrix => ({
  columns: ["A", "B"],
  rows: ["001", "002"].map((name) => ({ name, values: ["", ""] })),
});

export const v2UncoveredJourneyTypes = (records: V2Record[], cargo: V2Cargo, jornada: string): string[] => {
  const covered = new Set(v2Latest(records, "padrao")
    .filter((record) => record.cargoId === cargo.id && record.jornada === jornada && v2Status(record) !== "Encerrada")
    .flatMap((record) => record.links.filter((link) => !link.fim || link.fim >= v2Today()).map((link) => link.tipo)));
  return cargo.vinculos.filter((link) => link.jornadas.includes(jornada) && !covered.has(link.tipo)).map((link) => link.tipo);
};

export const v2ReferenceCandidates = (records: V2Record[], cargo: V2Cargo, jornada: string) =>
  v2Latest(records, "padrao").filter((record) => {
    if (record.cargoId !== cargo.id || record.origem !== "Referência" || v2Status(record) !== "Vigente" ||
        !record.jornada || !cargo.jornadas.includes(jornada) || !v2UncoveredJourneyTypes(records, cargo, jornada).length) return false;
    const links = v2VisibleLinks(record).filter((link) => link.inicio <= v2Today() && (!link.fim || link.fim >= v2Today()));
    if (!links.length || links.some((link) => !cargo.vinculos.some((item) => item.tipo === link.tipo))) return false;
    return !links.some((link) => link.tipo === "Contrato Temporário") || !record.editais?.some((edital) =>
      records.some((item) => item.cargoId === cargo.id && item.kind === "padrao" && item.jornada === jornada && item.editais?.includes(edital)));
  });

export const v2CommissionedInputs = (input: V2Input, subsidy: string, percent: string): [V2Input, V2Input] => {
  const amount = v2Currency(subsidy);
  const calculated = v2CommissionCalculatedValue(subsidy, percent);
  const makeLink = (tipo: string): V2Link => ({
    tipo, inicio: input.inicio, fim: input.fim,
    incideRga: input.links.find((link) => link.tipo === tipo)?.incideRga ?? false,
  });
  return [
    { ...input, estrutura: "fixo", links: [makeLink("Exclusivamente Comissionado")],
      remuneracao: { tipo: "subsidio", valor: amount },
      matrix: { columns: ["Valor"], rows: [{ name: "Fixo", values: [amount] }] } },
    { ...input, estrutura: "fixo", links: [makeLink("Nomeado Efetivo")],
      remuneracao: { tipo: "gratificacao", valor: percent, baseCalculo: amount, valorCalculado: calculated },
      matrix: { columns: ["Valor"], rows: [{ name: "Fixo", values: [calculated] }] } },
  ];
};

export const v2CreateCommissionedPair = (records: V2Record[], input: V2Input, subsidy: string, percent: string, actor = "Roberto Junior"):
  { ok: true; records: V2Record[]; created: V2Record[] } | { ok: false; message: string } => {
  if (!V2_CARGOS.find((cargo) => cargo.id === input.cargoId)?.comissionado) return { ok: false, message: "Selecione um cargo comissionado." };
  const inputs = v2CommissionedInputs({ ...input, commissionPairId: id() }, subsidy, percent);
  if (inputs.some((item) => !v2ValuesValid(item))) return { ok: false, message: "Informe o subsídio e um percentual de gratificação maior que zero e de até 100%." };
  const subsidyResult = v2Create(records, inputs[0], actor);
  if (!subsidyResult.ok) return subsidyResult;
  const gratificationResult = v2Create(subsidyResult.records, inputs[1], actor);
  if (!gratificationResult.ok) return gratificationResult;
  return { ok: true, records: gratificationResult.records, created: [subsidyResult.record, gratificationResult.record] };
};

export const v2CanVersion = (record: V2Record) => !V2_CARGOS.find(cargo => cargo.id === record.cargoId)?.comissionado ||
  (record.links.length === 1 && record.links[0].tipo === "Exclusivamente Comissionado");

export const v2CommissionedCompanion = (records: V2Record[], source: V2Record) => {
  const candidates = v2Latest(records, source.kind).filter(record =>
    record.cargoId === source.cargoId && record.jornada === source.jornada &&
    record.perfil === source.perfil && record.local === source.local &&
    record.remuneracao?.tipo === "gratificacao" && record.links.length === 1 &&
    record.links[0].tipo === "Nomeado Efetivo" &&
    (source.commissionPairId ? record.commissionPairId === source.commissionPairId : !record.commissionPairId));
  return candidates.length === 1 ? candidates[0] : undefined;
};

export const v2VersionCommissionedPair = (records: V2Record[], sourceId: string, input: V2Input, actor = "Roberto Junior", percent?: string):
  { ok: true; records: V2Record[]; record: V2Record; created: V2Record[] } | { ok: false; message: string } => {
  const source = records.find(record => record.id === sourceId);
  if (!source || !V2_CARGOS.find(cargo => cargo.id === source.cargoId)?.comissionado || !v2CanVersion(source))
    return { ok: false, message: "Versione o cargo comissionado pela tabela de Exclusivamente Comissionado." };
  const companion = v2CommissionedCompanion(records, source);
  if (!companion) return { ok: false, message: "Não foi possível identificar a tabela de Nomeado Efetivo associada." };
  const pairId = source.commissionPairId || id();
  const inputs = v2CommissionedInputs({ ...input, commissionPairId: pairId },
    input.remuneracao?.valor || "", percent ?? companion.remuneracao?.valor ?? "");
  if (inputs.some(item => !v2ValuesValid(item))) return { ok: false, message: "Informe o subsídio e um percentual de gratificação maior que zero e de até 100%." };
  inputs[1].links = companion.links.map(link => ({ ...link, inicio: input.inicio, fim: input.fim }));
  const first = v2Version(records, source.id, ["Exclusivamente Comissionado"], inputs[0], actor);
  if (!first.ok) return first;
  const second = v2Version(first.records, companion.id, ["Nomeado Efetivo"], inputs[1], actor);
  if (!second.ok) return second;
  return { ok: true, records: second.records, record: first.record, created: [first.record, second.record] };
};

export const v2CommissionedViewValues = (records: V2Record[], source: V2Record) => {
  if (source.remuneracao?.tipo === "gratificacao") return {
    subsidy: source.remuneracao.baseCalculo || "", percent: source.remuneracao.valor,
  };
  const companion = records.filter(record =>
    record.cargoId === source.cargoId && record.kind === source.kind &&
    record.jornada === source.jornada && record.perfil === source.perfil && record.local === source.local &&
    record.remuneracao?.tipo === "gratificacao" && record.links.some(link => link.tipo === "Nomeado Efetivo") &&
    (source.commissionPairId ? record.commissionPairId === source.commissionPairId : !record.commissionPairId) &&
    record.inicio <= source.inicio
  ).sort((a, b) => b.inicio.localeCompare(a.inicio) || b.version - a.version);
  const tableIds = new Set(companion.map(record => record.tableId));
  return { subsidy: source.remuneracao?.valor || "", percent: tableIds.size === 1 ? companion[0]?.remuneracao?.valor || "" : "" };
};
