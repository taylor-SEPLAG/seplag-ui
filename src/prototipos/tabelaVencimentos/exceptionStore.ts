import type { MatrixData, TabelaSalva } from "./TabelaVencimentosFeaturePage";

export type ExceptionRecord = {
  id: string;
  cargoId: number;
  perfil: string;
  localId: string;
  horasTrabalhadas?: "6h" | "4h" | "17h";
  version: number;
  start: string;
  end?: string;
  matrix: MatrixData;
  baseLegal: string[];
  observacao: string;
  responsavel: string;
  registradoEm: string;
  previousId?: string;
};

export type ExceptionInput = Pick<
  ExceptionRecord,
  "cargoId" | "perfil" | "localId" | "horasTrabalhadas" | "start" | "end" | "matrix" | "baseLegal" | "observacao"
>;

const STORAGE_KEY = "sigep-tabelas-vencimentos-excecoes-v2";
const normalize = (value: string) => value.trim().toLocaleLowerCase("pt-BR");
const toIsoDate = (date: string) => {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
};
const previousDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

export const readExceptions = (): ExceptionRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.sessionStorage.getItem(STORAGE_KEY) || "[]",
    );
    return Array.isArray(parsed) ? (parsed as ExceptionRecord[]) : [];
  } catch {
    return [];
  }
};

export const exceptionStatus = (
  record: ExceptionRecord,
  on: string,
): "Vigente" | "Futura" | "Encerrada" => {
  if (record.start > on) return "Futura";
  if (record.end && record.end < on) return "Encerrada";
  return "Vigente";
};

export const hasExceptionOverlap = (
  records: ExceptionRecord[],
  input: ExceptionInput,
  exceptId?: string,
) =>
  records.some(
    (record) =>
      record.id !== exceptId &&
      record.cargoId === input.cargoId &&
      record.perfil === input.perfil &&
      normalize(record.localId) === normalize(input.localId) &&
      (record.horasTrabalhadas || "") === (input.horasTrabalhadas || "") &&
      input.start <= (record.end || "9999-12-31") &&
      record.start <= (input.end || "9999-12-31"),
  );

export const visibleExceptions = (
  records: ExceptionRecord[],
  cargoId: number,
  on: string,
): ExceptionRecord[] => {
  const groups = new Map<string, ExceptionRecord[]>();
  records
    .filter((record) => record.cargoId === cargoId)
    .forEach((record) => {
      const key = [record.perfil, normalize(record.localId), record.horasTrabalhadas || ""].join("|");
      groups.set(key, [...(groups.get(key) || []), record]);
    });

  return [...groups.values()].flatMap((group) => {
    const sorted = group.sort((a, b) => b.start.localeCompare(a.start));
    const currentOrFuture = sorted.filter(
      (record) => exceptionStatus(record, on) !== "Encerrada",
    );
    return currentOrFuture.length ? currentOrFuture : sorted.slice(0, 1);
  });
};

export const resolveApplicableWageTable = (
  exceptions: ExceptionRecord[],
  generalTables: TabelaSalva[],
  criteria: {
    cargoId: number;
    perfil: string;
    localId: string;
    jornada: string;
    horasTrabalhadas?: string;
  },
  on: string,
):
  | { kind: "exception"; record: ExceptionRecord }
  | { kind: "journey"; record: TabelaSalva }
  | { kind: "none"; message: string } => {
  const exception = exceptions
    .filter(
      (record) =>
        record.cargoId === criteria.cargoId &&
        (!record.perfil || record.perfil === criteria.perfil) &&
        (!record.localId || normalize(record.localId) === normalize(criteria.localId)) &&
        (!record.horasTrabalhadas || record.horasTrabalhadas === criteria.horasTrabalhadas) &&
        exceptionStatus(record, on) === "Vigente",
    )
    .sort((a, b) => {
      const specificity = (record: ExceptionRecord) =>
        Number(Boolean(record.perfil)) + Number(Boolean(record.localId)) +
        Number(Boolean(record.horasTrabalhadas));
      return specificity(b) - specificity(a) || b.start.localeCompare(a.start);
    })[0];
  if (exception) return { kind: "exception", record: exception };

  const general = generalTables
    .filter(
      (table) =>
        table.cargoId === criteria.cargoId &&
        table.jornada === criteria.jornada &&
        toIsoDate(table.versao.inicio) <= on &&
        (!table.versao.fim || on <= toIsoDate(table.versao.fim)),
    )
    .sort((a, b) =>
      toIsoDate(b.versao.inicio).localeCompare(toIsoDate(a.versao.inicio)),
    )[0];
  return general
    ? { kind: "journey", record: general }
    : { kind: "none", message: "Sem Tabela de Vencimentos aplicável" };
};

export const saveException = (
  records: ExceptionRecord[],
  input: ExceptionInput,
  responsavel: string,
  sourceId?: string,
):
  | { ok: true; records: ExceptionRecord[]; saved: ExceptionRecord }
  | { ok: false; message: string } => {
  const source = sourceId
    ? records.find((record) => record.id === sourceId)
    : undefined;
  if (sourceId && !source) {
    return { ok: false, message: "Versão de origem não encontrada." };
  }
  if (
    !input.cargoId ||
    !input.start ||
    !input.baseLegal.length ||
    (input.end && input.end < input.start)
  ) {
    return { ok: false, message: "Revise os campos obrigatórios e a vigência." };
  }
  if (
    source &&
    (source.cargoId !== input.cargoId ||
      source.perfil !== input.perfil ||
      normalize(source.localId) !== normalize(input.localId) ||
      (source.horasTrabalhadas || "") !== (input.horasTrabalhadas || "") ||
      input.start <= source.start)
  ) {
    return {
      ok: false,
      message: "A nova versão deve manter a identificação e começar após a versão anterior.",
    };
  }
  if (hasExceptionOverlap(records, input, sourceId)) {
    return {
      ok: false,
      message:
        "Já existe uma Tabela de Exceção vigente para esta combinação de Cargo e critérios informados no período. Revise a vigência para continuar.",
    };
  }

  const updated = records.map((record) => {
    if (record.id !== sourceId) return record;
    const newEnd = previousDate(input.start);
    return {
      ...record,
      end: record.end && record.end < newEnd ? record.end : newEnd,
    };
  });
  const previousVersions = records.filter(
    (record) =>
      record.cargoId === input.cargoId &&
      record.perfil === input.perfil &&
      normalize(record.localId) === normalize(input.localId) &&
      (record.horasTrabalhadas || "") === (input.horasTrabalhadas || ""),
  );
  const saved: ExceptionRecord = {
    ...input,
    id: crypto.randomUUID(),
    version: Math.max(0, ...previousVersions.map((record) => record.version)) + 1,
    responsavel,
    registradoEm: new Date().toISOString(),
    previousId: sourceId,
  };
  return { ok: true, saved, records: [...updated, saved] };
};

export const persistExceptions = (records: ExceptionRecord[]) => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

