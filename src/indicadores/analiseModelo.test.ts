import { describe, expect, it } from "vitest";
import {
  diasUteis,
  distintas,
  estadoUS,
  etapaAtual,
  liquida,
  fteAnalise,
  media,
  novaBaseAnalise,
  percentil,
  temposUS,
  validarBaseAnalise,
  type AlocacaoAnalise,
  type TransicaoAnalise,
} from "./analiseModelo";
import base from "./dados-iniciais.json";

const t = (etapa: string, data: string, sprint = 18): TransicaoAnalise => ({
  id: `${data}-${etapa}`,
  analista: "Analista",
  sprint,
  us: "US1",
  etapa,
  data,
  estimativa: null,
  dimensoes: null,
});
describe("integridade da análise", () => {
  it("deduplica códigos sem confundir reaparição com nova demanda", () => {
    const hs = base.historias;
    const repetida = hs[0];
    expect(
      distintas([repetida, { ...repetida, sprint: 23, pontos: 13 }]),
    ).toHaveLength(1);
    expect(
      distintas([repetida, { ...repetida, sprint: 23, pontos: 13 }])[0].pontos,
    ).toBe(13);
  });
  it("mantém datas desconhecidas diferentes de zero e exclui feriados e fins de semana", () => {
    expect(diasUteis("2026-11-13", "2026-11-18", ["2026-11-16"])).toBe(2);
    expect(diasUteis("2026-11-18", "2026-11-18")).toBe(0);
    expect(diasUteis("", "2026-11-18")).toBeNull();
    expect(diasUteis("2026-02-30", "2026-03-04")).toBeNull();
    expect(diasUteis("2026-11-19", "2026-11-18")).toBeNull();
  });
  it("não infere análise concluída da situação de desenvolvimento", () => {
    expect(temposUS([], "US1")).toEqual({
      analise: null,
      validacao: null,
      ciclo: null,
      rodadas: null,
      aprovacao: undefined,
    });
  });
  it("preserva múltiplas rodadas, mede dias decorridos e usa aprovação final", () => {
    const ts = [
      t("Levantamento", "2026-11-02"),
      t("Conclusão da especificação", "2026-11-04"),
      t("Envio para validação", "2026-11-04"),
      t("Retorno da validação", "2026-11-06"),
      t("Envio para validação", "2026-11-09"),
      t("Aprovação final", "2026-11-11"),
    ];
    const original = JSON.stringify(ts);
    expect(temposUS(ts, "US1")).toMatchObject({
      analise: 2,
      validacao: 5,
      ciclo: 7,
      rodadas: 2,
    });
    expect(JSON.stringify(ts)).toBe(original);
  });
  it("respeita o corte histórico da sprint e mapeia transições às etapas de WIP", () => {
    const ts = [
      t("Envio para validação", "2026-11-02", 18),
      t("Aprovação final", "2026-11-09", 19),
    ];
    expect(etapaAtual(estadoUS(ts, "US1", 18)?.etapa)).toBe(
      "Aguardando validação",
    );
    expect(estadoUS(ts, "US1", 19)?.etapa).toBe("Aprovação final");
  });
  it("calcula capacity líquida com dedicação e todos os descontos explícitos", () => {
    const a: AlocacaoAnalise = {
      id: "1",
      analista: "A",
      sprint: 18,
      dias: 10,
      jornada: 8,
      dedicacao: 50,
      reunioes: 4,
      ferias: 8,
      afastamentos: 2,
      apoio: 3,
      imprevistos: 1,
    };
    expect(liquida(a)).toBe(22);
    expect(fteAnalise(a, 8)).toBe(0.5);
    expect(fteAnalise({ ...a, jornada: 4 }, 8)).toBe(0.25);
  });
  it("calcula mediana e P85 sem mutar a amostra", () => {
    const valores = [20, 1, 3, 2];
    expect(percentil(valores, 0.5)).toBe(2.5);
    expect(percentil(valores, 0.85)).toBeCloseTo(12.35);
    expect(valores).toEqual([20, 1, 3, 2]);
    expect(media([])).toBeNull();
    expect(percentil([], 0.85)).toBeNull();
  });
  it("rejeita backups sem configuração ou com dimensões incompletas", () => {
    const b = novaBaseAnalise();
    expect(validarBaseAnalise(b)).toBe(true);
    expect(validarBaseAnalise({ ...b, config: {} })).toBe(false);
    expect(
      validarBaseAnalise({
        ...b,
        transicoes: [
          { ...t("Levantamento", "2026-11-02"), dimensoes: [1, 1, 0, 1, 1, 1] },
        ],
      }),
    ).toBe(false);
    expect(validarBaseAnalise({ ...b, atividades: [null] })).toBe(false);
  });
  it("rejeita alocações duplicadas ou com horas negativas", () => {
    const b = novaBaseAnalise(),
      a: AlocacaoAnalise = {
        id: "1",
        analista: "A",
        sprint: 18,
        dias: 10,
        jornada: 8,
        dedicacao: 100,
        reunioes: 0,
        ferias: 0,
        afastamentos: 0,
        apoio: 0,
        imprevistos: 0,
      };
    expect(validarBaseAnalise({ ...b, alocacoes: [a, a] })).toBe(false);
    expect(
      validarBaseAnalise({ ...b, alocacoes: [{ ...a, ferias: 100 }] }),
    ).toBe(false);
  });
});
