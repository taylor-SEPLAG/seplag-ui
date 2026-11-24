import { expect, it } from "vitest";
import { copiarCiclo } from "./copiarCiclo";
import type { CicloCronograma } from "./ciclosRepository";
const fonte = (competencia: string, periodos: string[]): CicloCronograma => ({
  competencia,
  configuracao: {
    tituloCiclo: "Origem",
    secoes: [
      {
        id: 7,
        titulo: "Grupo A",
        marcador: "is-main",
        observacao: "Observação do grupo",
        eventos: periodos.map((periodo, i) => ({
          periodo,
          descricao: "Evento " + i,
          status: "Agendado",
        })),
      },
      {
        id: 3,
        titulo: "Grupo vazio",
        marcador: "is-rescission",
        observacao: "Outra observação",
        eventos: [],
      },
    ],
  },
});
it("copia grupos, observações, ordenação e horários sem compartilhar registros", () => {
  const original = fonte("2026-11", [
    "14/11/2026 18:00 - 14/11/2026 19:00",
    "22/11 - 22/11 - 17:00",
  ]);
  const antes = structuredClone(original);
  const copia = copiarCiclo(original, "2026-12");
  expect(copia.configuracao.tituloCiclo).toBe("Dezembro/2026");
  expect(copia.configuracao.secoes.map((s) => s.id)).toEqual([7, 3]);
  expect(copia.configuracao.secoes[0].observacao).toBe("Observação do grupo");
  expect(copia.configuracao.secoes[0].eventos.map((e) => e.periodo)).toEqual([
    "14/12/2026 18:00 - 14/12/2026 19:00",
    "22/12/2026 - 22/12/2026 - 17:00",
  ]);
  expect(copia.avisos).toEqual([]);
  copia.configuracao.secoes[0].eventos[0].descricao = "Alterado";
  expect(original).toEqual(antes);
});
it("ajusta o último dia válido e sinaliza os ajustes, incluindo ano bissexto", () => {
  const a = copiarCiclo(
    fonte("2026-01", ["31/01/2026 - 31/01/2026 - 18:00"]),
    "2026-02",
  );
  expect(a.configuracao.secoes[0].eventos[0].periodo).toBe(
    "28/02/2026 - 28/02/2026 - 18:00",
  );
  expect(a.avisos.join(" ")).toContain("último dia válido");
  expect(
    copiarCiclo(fonte("2027-12", ["31/12/2027 - 31/12/2027"]), "2028-02")
      .configuracao.secoes[0].eventos[0].periodo,
  ).toBe("29/02/2028 - 29/02/2028");
});
it("preserva meses anteriores e subsequentes na virada de ano", () => {
  const copia = copiarCiclo(
    fonte("2026-11", [
      "31/10/2026 - 02/11/2026 - 09:00",
      "30/11/2026 - 02/12/2026 - 18:00",
    ]),
    "2026-12",
  );
  expect(copia.configuracao.secoes[0].eventos.map((e) => e.periodo)).toEqual([
    "30/11/2026 - 02/12/2026 - 09:00",
    "30/12/2026 - 02/01/2027 - 18:00",
  ]);
  expect(
    copiarCiclo(fonte("2026-12", ["31/12 - 02/01 - 17:00"]), "2027-01")
      .configuracao.secoes[0].eventos[0].periodo,
  ).toBe("31/01/2027 - 02/02/2027 - 17:00");
  expect(
    copiarCiclo(fonte("2026-01", ["31/12 - 02/01 - 17:00"]), "2026-02")
      .configuracao.secoes[0].eventos[0].periodo,
  ).toBe("31/01/2026 - 02/02/2026 - 17:00");
});
it("preserva períodos incompletos para revisão e permite referências posteriores", () => {
  const a = copiarCiclo(
    fonte("2026-01", ["", "31/02/2026 - 31/02/2026"]),
    "2026-02",
  );
  expect(a.configuracao.secoes[0].eventos[0].periodo).toBe("");
  expect(a.avisos.length).toBeGreaterThan(0);
  expect(
    copiarCiclo(
      fonte("2026-12", ["14/12/2026 - 14/12/2026 - 18:00"]),
      "2026-11",
    ).configuracao.secoes[0].eventos[0].periodo,
  ).toBe("14/11/2026 - 14/11/2026 - 18:00");
});
