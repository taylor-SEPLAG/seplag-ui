import { V2_EDITAIS, v2Today, type V2Cargo, type V2Record } from "./v2Store";

export type CoverageStatus = "Completa" | "Parcial" | "Pendente" | "Não aplicável";
export type CoverageDetail = {
  edital?: string;
  status: "Vigente" | "Futura" | "Pendente";
  record?: V2Record;
};
export type CoverageCell = {
  jornada: string; tipo: string;
  status: CoverageDetail["status"] | "Não aplicável";
  details: CoverageDetail[];
};
export type CargoCoverage = {
  status: CoverageStatus; covered: number; total: number; percent: number;
  cells: CoverageCell[];
};
export function v2Coverage(cargo: V2Cargo, records: V2Record[], on = v2Today()): CargoCoverage {
  const cells = [...new Set(cargo.jornadas)].flatMap((jornada) =>
    [...new Set(cargo.vinculos.map((link) => link.tipo))].map((tipo): CoverageCell => {
      const required = [...new Set((cargo.editaisObrigatorios || [])
        .filter((rule) => rule.jornada === jornada && rule.tipo === tipo)
        .flatMap((rule) => rule.editais))]
        .filter((id) => V2_EDITAIS.find((edital) => edital.id === id)?.situacao !== "Encerrado");
      const scopes: (string | undefined)[] = required.length ? required : [undefined];
      const details = scopes.map((edital): CoverageDetail => {
        const candidates = records.filter((record) => record.kind === "padrao" &&
          record.cargoId === cargo.id && record.jornada === jornada && record.links.some((link) => link.tipo === tipo) &&
          (!edital || record.editais?.includes(edital)));
        const effective = (record: V2Record, future: boolean) => record.links.some((link) => {
          if (link.tipo !== tipo) return false;
          const start = record.inicio > link.inicio ? record.inicio : link.inicio;
          const end = [record.fim, link.fim].filter((date): date is string => Boolean(date)).sort()[0];
          return (!end || end >= start) && (future ? start > on : start <= on && (!end || end >= on));
        });
        const latest = (items: V2Record[]) => items.sort((a, b) => b.inicio.localeCompare(a.inicio) || b.version - a.version)[0];
        const current = latest(candidates.filter((record) => effective(record, false)));
        if (current) return { edital, status: "Vigente", record: current };
        const future = latest(candidates.filter((record) => effective(record, true)));
        if (future) return { edital, status: "Futura", record: future };
        return { edital, status: "Pendente", record: latest(candidates) };
      });
      const status = details.every((detail) => detail.status === "Vigente") ? "Vigente" :
        details.every((detail) => detail.status === "Futura") ? "Futura" : "Pendente";
      return { jornada, tipo, status, details };
    }));
  const total = cells.filter((cell) => cell.status !== "Não aplicável").length;
  const covered = cells.filter((cell) => cell.status === "Vigente").length;
  return { cells, total, covered, percent: total ? covered / total * 100 : 0,
    status: !total ? "Não aplicável" : covered === total ? "Completa" : covered ? "Parcial" : "Pendente" };
}

export const V2_COVERAGE_TOOLTIP = "Indica se existem tabelas vigentes para todas as combinações obrigatórias de jornada e tipo de vínculo associadas ao cargo, considerando os editais aplicáveis.";
export const V2_COVERAGE_INFO = "Este indicador considera as tabelas vigentes para todas as combinações de jornada e tipo de vínculo exigidas para o cargo. Para contratos temporários, também são considerados os editais aplicáveis.";
