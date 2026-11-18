import { expect, it } from "vitest";
import base from "./dados-iniciais.json";
import { ajustarEscopoProjeto } from "./ajustesEscopo";
import { primeirasAparicoes, resumir } from "./modelo";
import type { DadosProjeto } from "./types";

const dados = base as DadosProjeto;
const codigos = [
  "US302",
  "US303",
  "US304",
  "US305",
  "US306",
  "US307",
  "US308",
  "US309",
  "US317",
  "US348",
];

it("retira as aparições indevidas de férias da Sprint 22 e as conta apenas como novas na Sprint 23", () => {
  const originais = dados.replanejadas!.map((r) => r.historia);
  const fonte: DadosProjeto = {
    ...dados,
    historias: [...dados.historias, ...originais],
    replanejadas: undefined,
    avisos: dados.avisos.filter((a) => a.tipo !== "replanejamento"),
  };
  expect(fonte.historias.filter((h) => h.sprint === 22)).toHaveLength(42);
  const corrigida = ajustarEscopoProjeto(fonte);
  expect(corrigida.historias.filter((h) => h.sprint === 23)).toHaveLength(43);
  expect(corrigida.historias.filter((h) => h.sprint === 22)).toHaveLength(33);
  expect(corrigida.historias).toEqual(dados.historias);
  expect(
    corrigida.historias.filter(
      (h) => h.sprint === 22 && codigos.includes(h.codigo),
    ),
  ).toHaveLength(0);
  expect(corrigida.replanejadas!.map((r) => r.historia.codigo)).toEqual(
    codigos.filter((c) => c !== "US348"),
  );
  expect(corrigida.replanejadas!.every((r) => r.sprintDestino === 23)).toBe(
    true,
  );
  expect(corrigida.replanejadas!.map((r) => r.historia)).toEqual(originais);
  expect(
    corrigida.avisos.filter((a) => a.tipo === "replanejamento"),
  ).toHaveLength(1);
  expect(ajustarEscopoProjeto(corrigida)).toBe(corrigida);
  expect(fonte.historias.filter((h) => h.sprint === 22)).toHaveLength(42);
  const ferias = corrigida.historias.filter((h) => codigos.includes(h.codigo));
  expect(ferias).toHaveLength(10);
  expect(ferias.every((h) => h.sprint === 23)).toBe(true);
  expect(
    resumir(ferias, primeirasAparicoes(corrigida.historias)),
  ).toMatchObject({ novas: 10, reaparecidas: 0 });
});

it("recupera bases salvas com férias adiadas para a Sprint 24 e corrige o aviso anterior", () => {
  const ferias = dados.historias.filter(
    (h) => h.sprint === 23 && codigos.includes(h.codigo),
  );
  const anterior: DadosProjeto = {
    ...dados,
    historias: [
      ...dados.historias.filter((h) => !ferias.includes(h)),
      ...dados.replanejadas!.map((r) => r.historia),
    ],
    replanejadas: ferias.map((historia) => ({ historia, sprintDestino: 24 })),
    avisos: [
      {
        tipo: "replanejamento",
        sprint: 23,
        mensagem: "Passaram para a Sprint 24",
      },
    ],
  };
  const corrigida = ajustarEscopoProjeto(anterior);
  expect(corrigida.historias).toEqual(dados.historias);
  expect(corrigida.replanejadas).toEqual(dados.replanejadas);
  expect(
    corrigida.avisos.some((a) =>
      a.mensagem.includes("Passaram para a Sprint 24"),
    ),
  ).toBe(false);
  expect(ajustarEscopoProjeto(corrigida)).toBe(corrigida);
});
