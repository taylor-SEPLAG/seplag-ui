import { describe, expect, it } from "vitest";
import base from "./dados-iniciais.json";
import type { DadosProjeto, HistoriaProjeto } from "./types";
import {
  agrupar,
  calcularCapacity,
  calcularCapacitySprint,
  contarDiasUteis,
  compararRecorteAnterior,
  concluida,
  filtrarHistorias,
  filtrosIniciais,
  gerarInsights,
  primeirasAparicoes,
  reapareceu,
  qaAprovada,
  homologada,
  resumir,
  somarCapacityBruta,
  tendencia,
  variacao,
} from "./modelo";

const dados = base as DadosProjeto,
  primeiras = primeirasAparicoes(dados.historias);
describe("base real das Sprints 18 a 23", () => {
  it("reconcilia histórias distintas, presenças, pontos e reaparições com o arquivo", () => {
    expect(resumir(dados.historias, primeiras)).toMatchObject({
      distintas: 144,
      registros: 172,
      pontos: 1087,
      reaparecidas: 28,
      pontuadas: 149,
      semPontos: 23,
      concluidas: 99,
      conhecidas: 143,
      semDev: 2,
      taxaConclusao: 68.75,
    });
    const sprints = dados.sprints.map((s) =>
      resumir(
        dados.historias.filter((h) => h.sprint === s.numero),
        primeiras,
      ),
    );
    expect(sprints.map((s) => s.registros)).toEqual([11, 22, 29, 34, 33, 43]);
    expect(sprints.map((s) => s.pontos)).toEqual([74, 123, 202, 188, 189, 311]);
    expect(sprints.map((s) => [s.novas, s.reaparecidas])).toEqual([
      [11, 0],
      [22, 0],
      [18, 11],
      [21, 13],
      [33, 0],
      [39, 4],
    ]);
    expect(sprints.at(-1)?.media).toBeCloseTo(8.4054, 4);
    expect(sprints.map((s) => s.concluidas)).toEqual([11, 22, 29, 34, 28, 0]);
    expect(sprints.map((s) => s.desenvolvedores)).toEqual([7, 7, 7, 7, 12, 11]);
  });
  it("preserva associações compartilhadas sem duplicar os totais globais", () => {
    const grupos = agrupar(dados.historias, "analistas");
    expect(
      Object.fromEntries(grupos.map((g) => [g.nome, g.distintas])),
    ).toEqual({
      Taylor: 42,
      Danielle: 23,
      Carlos: 25,
      Isabeli: 53,
      Marcela: 1,
    });
    const compartilhada = dados.historias.find(
      (h) => h.desenvolvedores.length > 1,
    )!;
    const participantes = agrupar([compartilhada], "desenvolvedores");
    expect(participantes.length).toBe(compartilhada.desenvolvedores.length);
    expect(participantes.every((g) => g.registros === 1)).toBe(true);
    expect(resumir([compartilhada]).distintas).toBe(1);
  });
  it("reconhece US319, US321 e US322 como remanescentes da Sprint 22, mantendo férias como novas", () => {
    const codigos = ["US319", "US321", "US322"];
    const remanescentes = dados.historias.filter(
      (h) => h.sprint === 23 && codigos.includes(h.codigo),
    );
    expect(remanescentes.map((h) => h.codigo)).toEqual(codigos);
    expect(
      remanescentes.every(
        (h) => primeiras.get(h.codigo) === 22 && reapareceu(h, primeiras),
      ),
    ).toBe(true);
    expect(resumir(remanescentes, primeiras)).toMatchObject({
      novas: 0,
      reaparecidas: 3,
    });
    const sprint23 = dados.historias.filter((h) => h.sprint === 23);
    expect(resumir(sprint23, primeiras)).toMatchObject({
      novas: 39,
      reaparecidas: 4,
    });
    expect(
      sprint23
        .filter((h) => /Férias/i.test(h.titulo))
        .every((h) => !reapareceu(h, primeiras)),
    ).toBe(true);
    expect(sprint23.some((h) => h.codigo === "US219")).toBe(false);
  });
  it("trata conclusão pela última aparição e não infere QA de um nome atribuído", () => {
    const sprint22 = dados.historias.filter((h) => h.sprint === 22);
    expect(resumir(sprint22).concluidas).toBe(28);
    expect(resumir(dados.historias).concluidas).toBe(99);
    expect(
      resumir(
        dados.historias
          .filter((h) => h.sprint === 18)
          .map((h) => ({ ...h, situacao: "Não informado" })),
      ).concluidas,
    ).toBeNull();
    expect(dados.historias.some((h) => h.qa.length > 0)).toBe(true);
    expect(dados.historias.some(qaAprovada)).toBe(false);
    expect(dados.historias.some(homologada)).toBe(false);
    expect(dados.historias.filter(concluida).every((h) => h.sprint <= 22)).toBe(
      true,
    );
  });
  it("não confunde histórias removidas com observações de priorização", () => {
    expect(dados.historias.some((h) => h.codigo === "US271")).toBe(false);
    expect(dados.historias.some((h) => h.codigo === "US316")).toBe(true);
    expect(dados.removidas).toBe(1);
    expect(dados.avisos.find((a) => a.tipo === "periodo")?.linhas).toHaveLength(
      15,
    );
    expect(dados.sprints.map((s) => s.numero)).toEqual([
      18, 19, 20, 21, 22, 23,
    ]);
  });
  it("combina filtros e compara apenas recortes anteriores presentes na fonte", () => {
    const exemplo = dados.historias.find(
      (h) => h.squads.length && h.desenvolvedores.length && h.analistas.length,
    )!;
    const filtros = {
      ...filtrosIniciais(dados),
      squad: exemplo.squads[0],
      analista: exemplo.analistas[0],
      desenvolvedor: exemplo.desenvolvedores[0],
      modulo: exemplo.modulo!,
      situacao: exemplo.situacao,
    };
    const filtradas = filtrarHistorias(dados, filtros);
    expect(filtradas.length).toBeGreaterThan(0);
    expect(
      filtradas.every(
        (h) =>
          h.squads.includes(filtros.squad) &&
          h.analistas.includes(filtros.analista) &&
          h.desenvolvedores.includes(filtros.desenvolvedor) &&
          h.modulo === filtros.modulo &&
          h.situacao === filtros.situacao,
      ),
    ).toBe(true);
    expect(compararRecorteAnterior(dados, filtrosIniciais(dados))).toBeNull();
    expect(
      compararRecorteAnterior(dados, {
        ...filtrosIniciais(dados),
        inicial: 23,
        final: 23,
      }),
    ).toHaveLength(33);
    expect(
      compararRecorteAnterior(dados, {
        ...filtrosIniciais(dados),
        comparar: false,
        inicial: 23,
        final: 23,
      }),
    ).toBeNull();
  });
  it("mantém estimativas ausentes como desconhecidas e aceita zero explicitamente informado", () => {
    const semPontos = { ...dados.historias[0], pontos: null };
    expect(resumir([semPontos]).media).toBeNull();
    expect(
      resumir([{ ...semPontos, situacao: "Finalizada" }]).pontosConcluidos,
    ).toBeNull();
    expect(
      resumir([
        semPontos,
        { ...semPontos, id: "zero", codigo: "US999", pontos: 0 },
      ] as HistoriaProjeto[]).media,
    ).toBe(0);
    expect(variacao(10, 0)).toBeNull();
    expect(tendencia([null, null])).toEqual([null, null]);
  });
  it("gera insights determinísticos com a jornada de capacity informada", () => {
    const insights = gerarInsights(dados.historias, primeiras);
    expect(insights).toEqual(gerarInsights(dados.historias, primeiras));
    expect(insights.find((i) => i.id === "complexidade")?.valor).toContain(
      "15,6%",
    );
    expect(insights.find((i) => i.id === "capacity")?.valor).toBe(
      "8 h/dia por desenvolvedor",
    );
    expect(
      insights.find((i) => i.id === "reaparecimento")?.historias,
    ).toHaveLength(28);
  });
});
it("calcula a capacity de cada sprint com equipe distinta, dias de segunda a sexta e jornada de 8 horas", () => {
  const capacidades = dados.sprints.map((s) =>
    calcularCapacitySprint(s, dados.historias),
  );
  expect(capacidades.map((c) => c.desenvolvedores)).toEqual([
    7, 7, 7, 7, 12, 11,
  ]);
  expect(capacidades.map((c) => c.diasUteis)).toEqual([11, 12, 11, 12, 13, 12]);
  expect(capacidades.map((c) => c.diaria)).toEqual([56, 56, 56, 56, 96, 88]);
  expect(capacidades.map((c) => c.bruta)).toEqual([
    616, 672, 616, 672, 1248, 1056,
  ]);
  expect(somarCapacityBruta(capacidades)).toBe(4880);
  const repetidas = [...dados.historias, ...dados.historias];
  expect(calcularCapacitySprint(dados.sprints[5], repetidas)).toEqual(
    capacidades[5],
  );
});
it("conta os extremos do período, exclui fins de semana e preserva datas ausentes como desconhecidas", () => {
  expect(contarDiasUteis("2026-11-20", "2026-11-23")).toBe(2);
  expect(contarDiasUteis("2026-11-21", "2026-11-22")).toBe(0);
  expect(contarDiasUteis("2026-11-23", "2026-11-23")).toBe(1);
  expect(contarDiasUteis("2028-02-29", "2028-02-29")).toBe(1);
  expect(contarDiasUteis("2026-02-30", "2026-03-01")).toBeNull();
  expect(contarDiasUteis("2026-11-23", "2026-11-20")).toBeNull();
  expect(contarDiasUteis("2026-11-23", null)).toBeNull();
  const desconhecida = calcularCapacitySprint(
    { ...dados.sprints[5], fim: null },
    dados.historias,
  );
  expect(desconhecida).toMatchObject({
    desenvolvedores: 11,
    diaria: 88,
    bruta: null,
  });
  expect(somarCapacityBruta([desconhecida])).toBeNull();
});
it("calcula apenas uma simulação explícita de capacity, com dedicação e reservas", () => {
  const entrada = {
    pessoas: 2,
    dias: 10,
    jornada: 8,
    dedicacao: 50,
    suporte: 8,
    afastamentos: 8,
    outras: 4,
  };
  expect(calcularCapacity({ ...entrada, pessoas: null })).toBeNull();
  expect(calcularCapacity({ ...entrada, dedicacao: 101 })).toBeNull();
  expect(calcularCapacity(entrada)).toEqual({
    bruta: 160,
    alocada: 80,
    indisponivel: 100,
    liquida: 60,
    fte: 1,
    excesso: false,
  });
  expect(calcularCapacity({ ...entrada, suporte: 100 })?.excesso).toBe(true);
  expect(calcularCapacity({ ...entrada, suporte: 100 })?.liquida).toBe(0);
});
