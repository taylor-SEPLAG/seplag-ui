import { expect, it } from "vitest";
import {
  capacidadeSprint,
  classificacaoUS,
  faixaICA,
  novaBaseSimples,
  tempoUS,
  totalICA,
  unicas,
  validarBaseSimples,
} from "./analiseSimplesModelo";
import dados from "./dados-iniciais.json";
it("usa 144 US reais distintas e mantém ICA independente de sprint e story points", () => {
  const b = novaBaseSimples();
  expect(unicas(dados.historias).length).toBe(144);
  expect(totalICA(classificacaoUS(b, "US008"))).toBeNull();
  b.classificacoes.push({
    us: "US008",
    analista: "Taylor",
    criterios: [1, 1, 1, 1],
    registradoEm: "2026-11-24T12:00:00Z",
  });
  b.classificacoes.push({
    us: "US008",
    analista: "Taylor",
    criterios: [3, 3, 2, 2],
    registradoEm: "2026-11-24T13:00:00Z",
  });
  expect(faixaICA(classificacaoUS(b, "US008"))).toBe("Alta");
  expect(b.classificacoes).toHaveLength(2);
  expect(validarBaseSimples(b)).toBe(true);
});
it("calcula dias úteis sem finais de semana e feriados e valida datas", () => {
  const b = novaBaseSimples();
  b.levantamentos.push({
    us: "US008",
    analista: "Taylor",
    inicio: "2026-11-20",
    envio: "2026-11-24",
    aprovacao: "",
  });
  expect(tempoUS(b, "US008")).toBe(2);
  b.feriados.push("2026-11-23");
  expect(tempoUS(b, "US008")).toBe(1);
  b.levantamentos[0].envio = "2026-11-19";
  expect(validarBaseSimples(b)).toBe(false);
  expect(tempoUS(b, "US008")).toBeNull();
  b.levantamentos[0].envio = "";
  expect(validarBaseSimples(b)).toBe(true);
  expect(tempoUS(b, "US008")).toBeNull();
  b.levantamentos[0].inicio = "2026-02-30";
  expect(validarBaseSimples(b)).toBe(false);
});
it("respeita períodos históricos e não presume percentuais parciais", () => {
  const b = novaBaseSimples(),
    s = {
      numero: 18,
      inicio: "2026-11-16",
      fim: "2026-11-20",
      periodo: "",
      aba: "",
    };
  expect(capacidadeSprint(b, s)).toBeNull();
  b.alocacoes.push({
    id: "1",
    analista: "Carlos",
    entrada: "2026-11-18",
    saida: "",
    dedicacao: "Parcial",
    percentual: null,
  });
  expect(capacidadeSprint(b, s)?.fte).toBeNull();
  b.alocacoes[0].percentual = 40;
  expect(capacidadeSprint(b, s)?.fte).toBeCloseTo(0.24);
  expect(
    capacidadeSprint(b, { ...s, inicio: "2026-10-01", fim: "2026-10-09" }),
  ).toBeNull();
  b.alocacoes.push({ ...b.alocacoes[0], id: "2" });
  expect(validarBaseSimples(b)).toBe(false);
  b.alocacoes[0].saida = "2026-11-17";
  expect(validarBaseSimples(b)).toBe(false);
});
it("rejeita importações inválidas e preserva lacunas como desconhecidas", () => {
  for (const v of [
    null,
    {},
    { ...novaBaseSimples(), feriados: ["2026-02-30"] },
    {
      ...novaBaseSimples(),
      classificacoes: [
        {
          us: "US008",
          analista: "Taylor",
          criterios: [3, 3, 3],
          registradoEm: "2026-11-24",
        },
      ],
    },
  ])
    expect(validarBaseSimples(v)).toBe(false);
});
