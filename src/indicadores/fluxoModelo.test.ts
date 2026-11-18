import { describe, expect, it } from "vitest";
import { novaBaseAnalise } from "./analiseModelo";
import {
  adaptarMovimentos,
  auditarSequenciaFluxo,
  diasImpedimento,
  conclusoesFluxo,
  estadosEm,
  fluxoSprint,
  novoFluxo,
  picoObservadoFluxo,
  resumirCiclos,
  serieHistorica,
  unirMovimentos,
  validarFluxo,
  type EtapaFluxo,
  type MovimentoFluxo,
} from "./fluxoModelo";
import base from "./dados-iniciais.json";
const h = base.historias[0];
const mover = (
  destino: EtapaFluxo,
  dia: string,
  origem: EtapaFluxo | null = null,
): MovimentoFluxo => ({
  id: `${dia}-${destino}`,
  us: h.codigo,
  origem,
  destino,
  instante: `${dia}T10:00:00-04:00`,
  analista: h.analistas[0],
  motivo: "Registro real para teste",
  precisao: "instante",
  fonte: "Registro WIP",
});
const sprint = {
  numero: 18,
  inicio: "2026-11-02",
  fim: "2026-11-13",
  periodo: "02 a 13/11",
  aba: "Sprint 18",
};
describe("regras de fluxo da análise", () => {
  it("não atribui entrada fictícia quando o primeiro registro já está em especificação", () => {
    const ms = [mover("Especificação/Prototipação", "2026-11-02")];
    expect(estadosEm([h], ms, [], "2026-11-03")[0]).toMatchObject({
      wip: true,
      inicio: null,
      idade: null,
    });
    const s = fluxoSprint(ms, sprint, "2026-11-13");
    expect(s.entradas).toHaveLength(0);
    expect(s.iniciosDesconhecidos).toHaveLength(1);
  });
  it("rejeita sequência de origem incompatível sem corrigir o histórico silenciosamente", () => {
    expect(
      auditarSequenciaFluxo([
        mover("Levantamento", "2026-11-02"),
        mover("Ajustes", "2026-11-03", "Validação com Cliente"),
      ]),
    ).toContain("diverge");
  });
  it("não soma duas vezes dias de bloqueios sobrepostos da mesma US", () => {
    const b = {
      id: "b",
      us: h.codigo,
      inicio: "2026-11-02T10:00:00-04:00",
      fim: "2026-11-06T10:00:00-04:00",
      motivo: "Outros",
      responsavel: "",
      observacao: "",
      tipo: "Bloqueio" as const,
    };
    expect(
      diasImpedimento(
        [b, { ...b, id: "c", inicio: "2026-11-04T10:00:00-04:00" }],
        "2026-11-10",
      ),
    ).toBe(4);
  });
  it("capta pico entre movimentações com horário mesmo que o encerramento diário seja menor", () => {
    const outra = { ...h, codigo: "US9999", id: "nova" };
    const ms = [
      mover("Levantamento", "2026-11-02"),
      {
        ...mover("Levantamento", "2026-11-02"),
        id: "outro",
        us: outra.codigo,
        instante: "2026-11-02T11:00:00-04:00",
      },
      {
        ...mover("Pronta para Desenvolvimento", "2026-11-02"),
        instante: "2026-11-02T12:00:00-04:00",
      },
    ];
    const diarios = serieHistorica([h, outra], ms, [], ["2026-11-02"]);
    expect(diarios[0].wip).toBe(1);
    expect(
      picoObservadoFluxo([h, outra], ms, "2026-11-02", "2026-11-02", diarios),
    ).toBe(2);
  });
  it("não cria histórico a partir das atribuições ou do status atual", () => {
    expect(estadosEm(base.historias, [], [], "2026-11-18")).toEqual([]);
    expect(
      serieHistorica(base.historias, [], [], ["2026-11-02", "2026-11-03"]).map(
        (s) => s.wip,
      ),
    ).toEqual([null, null]);
    expect(
      conclusoesFluxo([], novaBaseAnalise(), "2026-11-02", "2026-11-18", null),
    ).toEqual([]);
  });
  it("exclui backlog, aprovação, cancelamento e suspensão do WIP e mantém validação", () => {
    for (const [destino, esperado] of [
      ["Backlog", false],
      ["Levantamento", true],
      ["Especificação/Prototipação", true],
      ["Validação com Cliente", true],
      ["Ajustes", true],
      ["Pronta para Desenvolvimento", false],
      ["Cancelada", false],
      ["Suspensa", false],
    ] as const) {
      expect(
        estadosEm([h], [mover(destino, "2026-11-02")], [], "2026-11-03")[0].wip,
      ).toBe(esperado);
    }
  });
  it("deduplica US que aparecem em várias sprints sem criar novos ciclos", () => {
    const ms = [mover("Levantamento", "2026-11-02")];
    expect(
      estadosEm([h, { ...h, sprint: 23 }], ms, [], "2026-11-03"),
    ).toHaveLength(1);
    expect(fluxoSprint(ms, sprint, "2026-11-13").entradas).toHaveLength(1);
  });
  it("preserva transições diárias e ignora suporte, QA e conclusão de especificação como aprovação", () => {
    const b = novaBaseAnalise();
    b.transicoes = [
      "Levantamento",
      "Conclusão da especificação",
      "Aprovação final",
      "Acompanhamento de desenvolvimento",
      "Acompanhamento de testes",
    ].map((etapa, i) => ({
      id: String(i),
      us: h.codigo,
      analista: h.analistas[0],
      sprint: 18,
      etapa,
      data: `2026-11-0${i + 2}`,
      estimativa: null,
      dimensoes: null,
    }));
    const ms = adaptarMovimentos(b);
    expect(ms).toHaveLength(3);
    expect(
      ms.every((m) => m.precisao === "dia" && !m.instante.includes("T")),
    ).toBe(true);
    expect(ms[1].destino).toBe("Especificação/Prototipação");
    expect(estadosEm([h], ms, [], "2026-11-08")[0]).toMatchObject({
      etapa: "Pronta para Desenvolvimento",
      wip: false,
    });
  });
  it("não conta retorno para ajustes como uma nova entrada", () => {
    const ms = [
      mover("Levantamento", "2026-11-02"),
      mover("Validação com Cliente", "2026-11-04"),
      mover("Ajustes", "2026-11-05"),
      mover("Validação com Cliente", "2026-11-06"),
    ];
    const f = fluxoSprint(ms, sprint, "2026-11-13");
    expect(f.entradas).toHaveLength(1);
    expect(f.retomadas).toHaveLength(0);
    expect(f.saidas).toHaveLength(0);
  });
  it("não transforma cancelamentos ou suspensões em throughput", () => {
    for (const destino of ["Cancelada", "Suspensa"] as const) {
      const ms = [
        mover("Levantamento", "2026-11-02"),
        mover(destino, "2026-11-04"),
      ];
      expect(
        conclusoesFluxo(
          ms,
          novaBaseAnalise(),
          "2026-11-02",
          "2026-11-13",
          null,
        ),
      ).toHaveLength(0);
      expect(fluxoSprint(ms, sprint, "2026-11-13").saidas).toHaveLength(1);
    }
  });
  it("reconstrói o estado em cada dia, sem aplicar o status atual a datas anteriores", () => {
    const ms = [
      mover("Levantamento", "2026-11-02"),
      mover("Validação com Cliente", "2026-11-04"),
      mover("Pronta para Desenvolvimento", "2026-11-06"),
    ];
    const hs = serieHistorica(
      [h],
      ms,
      [],
      ["2026-11-01", "2026-11-02", "2026-11-04", "2026-11-06"],
    );
    expect(hs.map((s) => s.wip)).toEqual([null, 1, 1, 0]);
    expect(hs[1].estados[0].etapa).toBe("Levantamento");
    expect(hs[2].estados[0].etapa).toBe("Validação com Cliente");
  });
  it("calcula ciclo apenas para aprovação com início conhecido e preserva feriados", () => {
    const b = novaBaseAnalise();
    b.config.feriados = ["2026-11-03"];
    const ms = [
      mover("Levantamento", "2026-11-02"),
      mover("Pronta para Desenvolvimento", "2026-11-06"),
    ];
    expect(
      conclusoesFluxo(ms, b, "2026-11-02", "2026-11-13", null)[0].ciclo,
    ).toBe(3);
    expect(conclusoesFluxo(ms, b, "2026-11-02", "2026-11-05", null)).toEqual(
      [],
    );
    expect(
      conclusoesFluxo([ms[1]], b, "2026-11-02", "2026-11-13", null)[0].ciclo,
    ).toBeNull();
  });
  it("deduplica aprovações por US e reconhece reabertura somente com movimentação explícita", () => {
    const ms = [
      mover("Levantamento", "2026-11-02"),
      mover("Pronta para Desenvolvimento", "2026-11-04"),
      mover("Levantamento", "2026-11-05"),
      mover("Pronta para Desenvolvimento", "2026-11-06"),
    ];
    expect(
      conclusoesFluxo(ms, novaBaseAnalise(), "2026-11-02", "2026-11-13", null),
    ).toHaveLength(1);
    const f = fluxoSprint(ms, sprint, "2026-11-13");
    expect(f.entradas).toHaveLength(2);
    expect(f.novas).toHaveLength(1);
    expect(f.retomadas).toHaveLength(1);
    expect(f.saidas).toHaveLength(2);
  });
  it("distingue bloqueios explícitos de validação normal e considera encerramentos", () => {
    const ms = [
      mover("Levantamento", "2026-11-02"),
      mover("Validação com Cliente", "2026-11-04"),
    ];
    const b = {
      id: "b1",
      us: h.codigo,
      tipo: "Bloqueio" as const,
      inicio: "2026-11-04T10:00:00-04:00",
      fim: "2026-11-06T10:00:00-04:00",
      motivo: "Falta de informação",
      responsavel: "Cliente",
      observacao: "",
    };
    expect(estadosEm([h], ms, [], "2026-11-05")[0].bloqueios).toHaveLength(0);
    expect(estadosEm([h], ms, [b], "2026-11-05")[0].bloqueios).toHaveLength(1);
    expect(estadosEm([h], ms, [b], "2026-11-06")[0].bloqueios).toHaveLength(0);
  });
  it("não inventa espera a partir de apontamentos incompletos ou mistura horas e dias", () => {
    const b = novaBaseAnalise();
    b.atividades = [
      {
        id: "a",
        us: h.codigo,
        analista: h.analistas[0],
        sprint: 18,
        modulo: "",
        tipo: "Especificação",
        inicio: "2026-11-02",
        fim: "2026-11-06",
        horas: 8,
        situacao: "Concluída",
        impedimento: "",
        observacao: "",
        motivo: "",
      },
    ];
    const ms = [
      mover("Levantamento", "2026-11-02"),
      mover("Pronta para Desenvolvimento", "2026-11-06"),
    ];
    expect(
      conclusoesFluxo(ms, b, "2026-11-02", "2026-11-13", 8)[0].eficiencia,
    ).toBeNull();
    expect(
      conclusoesFluxo(ms, b, "2026-11-02", "2026-11-13", 8, [h.codigo])[0],
    ).toMatchObject({ horasAtivas: 8, esperaHoras: 24, eficiencia: 25 });
    expect(
      conclusoesFluxo(ms, b, "2026-11-02", "2026-11-13", 1, [h.codigo])[0]
        .eficiencia,
    ).toBeNull();
  });
  it("rejeita arquivos inválidos, horários sem fuso e limites contraditórios", () => {
    const f = novoFluxo();
    expect(validarFluxo(f)).toBe(true);
    expect(
      validarFluxo({ ...f, movimentos: [mover("Levantamento", "2026-11-02")] }),
    ).toBe(true);
    expect(
      validarFluxo({
        ...f,
        movimentos: [
          { ...mover("Levantamento", "2026-11-02"), instante: "2026-11-02" },
        ],
      }),
    ).toBe(false);
    expect(
      validarFluxo({
        ...f,
        limites: {
          ...f.limites,
          aging: { "8 pontos": { atencao: 10, critico: 5 } },
        },
      }),
    ).toBe(false);
    expect(validarFluxo({ ...f, impedimentos: [null] })).toBe(false);
  });
  it("mantém o histórico original intacto ao unificar fontes", () => {
    const b = novaBaseAnalise(),
      f = novoFluxo();
    f.movimentos = [mover("Levantamento", "2026-11-02")];
    const original = JSON.stringify(f);
    unirMovimentos(b, f);
    expect(JSON.stringify(f)).toBe(original);
    expect(resumirCiclos([]).p85).toBeNull();
  });
});
