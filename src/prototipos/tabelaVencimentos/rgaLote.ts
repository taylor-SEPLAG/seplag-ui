import {
  isRgaVigenciaWithinTable,
  RGA_VIGENCIA_FORA_TABELA,
} from "./rgaVigencia";
import type {
  MatrixData,
  TabelaSalva,
  Versao,
} from "./TabelaVencimentosFeaturePage";
export type Journey = {
  key: string;
  cargoId: number;
  cargo: string;
  jornada: string;
  incideRga: boolean;
  item?: Versao;
  versions: Versao[];
};
export type Parameters = {
  ano: string;
  percentual: string;
  vigencia: string;
  fim?: string;
  baseLegal: string;
  arredondamento: string;
  observacao: string;
};
export const iso = (date: string) => date.split("/").reverse().join("-");
export const brDate = (date: string) => date.split("-").reverse().join("/");
export const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const cents = (value: string) =>
  Math.round(Number(value.replace(/[^\d,-]/g, "").replace(",", ".")) * 100);
export const percentage = (value: string) =>
  Number(value.replace("%", "").replace(",", "."));
export function resolveJourneyVersions(
  versions: Versao[],
  today: string,
): Versao[] {
  return versions.map((version, index) => {
    const successor = versions
      .filter((next) => iso(next.inicio) > iso(version.inicio))
      .sort((a, b) => iso(a.inicio).localeCompare(iso(b.inicio)))[0];
    const ended =
      Boolean(successor && iso(successor.inicio) <= today) ||
      Boolean(version.fim && iso(version.fim) < today);
    return {
      ...version,
      numero: version.numero || "V" + (versions.length - index),
      status:
        iso(version.inicio) > today
          ? "Futura"
          : ended || version.status === "Encerrada"
            ? "Encerrada"
            : "Vigente",
    };
  });
}
export function validateBatch(
  journeys: Journey[],
  params: Parameters,
): string[] {
  const errors: string[] = [];
  if (!journeys.length) errors.push("Selecione pelo menos uma jornada.");
  if (!/^\d{4}$/.test(params.ano) || Number(params.ano) < 1900)
    errors.push("Informe um ano da RGA válido.");
  if (
    !/^\d+(?:[,.]\d{1,2})?%?$/.test(params.percentual) ||
    !Number.isFinite(percentage(params.percentual)) ||
    percentage(params.percentual) <= 0
  )
    errors.push(
      "Informe um percentual da RGA maior que zero, com até 2 casas decimais.",
    );
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(params.vigencia) ||
    Number.isNaN(Date.parse(params.vigencia)) ||
    new Date(params.vigencia).toISOString().slice(0, 10) !== params.vigencia
  )
    errors.push("Informe uma vigência válida.");
  if (params.fim && params.vigencia && params.fim < params.vigencia)
    errors.push(RGA_VIGENCIA_FORA_TABELA);
  if (!params.baseLegal) errors.push("Selecione a base legal obrigatória.");
  journeys.forEach((journey) => {
    const prefix = journey.cargo + " — " + journey.jornada + ": ";
    if (!journey.incideRga) errors.push(prefix + "Incide RGA = Não.");
    if (!journey.item) errors.push(prefix + "não existe versão vigente.");
    else {
      if (
        !isRgaVigenciaWithinTable(
          iso(journey.item.inicio),
          journey.item.fim ? iso(journey.item.fim) : undefined,
          params.vigencia,
          params.fim,
        ) &&
        !errors.includes(RGA_VIGENCIA_FORA_TABELA)
      )
        errors.push(RGA_VIGENCIA_FORA_TABELA);
      if (
        journey.versions.some(
          (version) =>
            iso(version.inicio) >= params.vigencia && version !== journey.item,
        )
      )
        errors.push(
          prefix + "há conflito de vigência ou versão futura incompatível.",
        );
      const matrix = journey.item.matrix;
      if (
        !matrix?.columns.length ||
        !matrix.rows.length ||
        matrix.rows.some(
          (row) =>
            row.values.length !== matrix.columns.length ||
            row.values.some(
              (value) =>
                !/\d/.test(value) ||
                !Number.isSafeInteger(cents(value)) ||
                cents(value) < 0 ||
                !Number.isSafeInteger(
                  Math.round(
                    cents(value) * (1 + percentage(params.percentual) / 100),
                  ),
                ),
            ),
        )
      )
        errors.push(prefix + "a matriz de valores está ausente ou inválida.");
    }
  });
  return errors;
}
export function simulateMatrix(matrix: MatrixData, rate: string): MatrixData {
  const basisPoints = Math.round(percentage(rate) * 100);
  return {
    columns: [...matrix.columns],
    rows: matrix.rows.map((row) => ({
      name: row.name,
      values: row.values.map((value) =>
        money(
          Number(
            (BigInt(cents(value)) * BigInt(10000 + basisPoints) + 5000n) /
              10000n,
          ) / 100,
        ),
      ),
    })),
  };
}
export const nextVersion = (journey: Journey) =>
  "V" +
  (Math.max(
    journey.versions.length,
    ...journey.versions.map(
      (version) => Number(version.numero?.replace(/^V/, "")) || 0,
    ),
  ) +
    1);
export function createBatch(
  saved: TabelaSalva[],
  journeys: Journey[],
  params: Parameters,
  appliedAt: string,
  batchId: string,
): TabelaSalva[] {
  const errors = validateBatch(journeys, params);
  if (errors.length) throw new Error(errors.join("\n"));
  const records = [...saved];
  for (const journey of journeys) {
    if (
      !records.some(
        (record) =>
          record.cargoId === journey.cargoId &&
          record.jornada === journey.jornada,
      )
    ) {
      journey.versions
        .slice()
        .reverse()
        .forEach((version, index) =>
          records.push({
            id: batchId + "-source-" + journey.key + "-" + index,
            cargoId: journey.cargoId,
            jornada: journey.jornada,
            incideRga: journey.incideRga,
            versao: structuredClone(version),
            matrix: structuredClone(version.matrix),
            baseLegal: version.baseLegal,
            observacao: version.observacao,
          }),
        );
    }
    const source = journey.item!;
    const matrix = simulateMatrix(source.matrix!, params.percentual);
    records.push({
      id: batchId + "-" + journey.key,
      cargoId: journey.cargoId,
      jornada: journey.jornada,
      incideRga: true,
      matrix,
      baseLegal: params.baseLegal,
      observacao: params.observacao,
      versao: {
        valorBase: structuredClone(source.matrix),
        ano: Number(params.ano),
        numero: nextVersion(journey),
        inicio: brDate(params.vigencia),
        fim: params.fim ? brDate(params.fim) : undefined,
        status: "Futura",
        alteracao: brDate(appliedAt.slice(0, 10)),
        usuario: "Roberto Junior",
        origem: "RGA",
        percentualRga: params.percentual,
        matrix,
        baseLegal: params.baseLegal,
        observacao: params.observacao,
        auditoriaRga: {
          ...params,
          responsavel: "Roberto Junior",
          aplicadaEm: appliedAt,
          versaoOrigem: source.numero || "V" + journey.versions.length,
          novaVersao: nextVersion(journey),
          loteId: batchId,
          tipoAplicacao: "Em lote",
        },
      },
      rga: { ...params, responsavel: "Roberto Junior", aplicadaEm: appliedAt },
    });
  }
  return records;
}

