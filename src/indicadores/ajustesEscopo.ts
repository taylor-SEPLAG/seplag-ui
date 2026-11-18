import type { DadosProjeto } from "./types";

// Escopo corrigido pelo usuário: férias pertencem apenas à Sprint 23,
// como histórias novas. As aparições da Sprint 22 não são remanescentes.
const FERIAS_SPRINT_23 = new Set([
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
]);

export function ajustarEscopoProjeto(dados: DadosProjeto): DadosProjeto {
  const retiradas = dados.historias.filter(
    (h) => h.sprint === 22 && FERIAS_SPRINT_23.has(h.codigo),
  );
  // Recupera também bases salvas com o ajuste anterior para a Sprint 24.
  const restauradas = (dados.replanejadas ?? []).filter(
    (r) =>
      r.historia.sprint === 23 &&
      r.sprintDestino === 24 &&
      FERIAS_SPRINT_23.has(r.historia.codigo),
  );
  if (!retiradas.length && !restauradas.length) return dados;

  const historias = dados.historias.filter((h) => !retiradas.includes(h));
  const ids = new Set(historias.map((h) => h.id));
  for (const { historia } of restauradas) {
    if (!ids.has(historia.id)) {
      historias.push(historia);
      ids.add(historia.id);
    }
  }
  historias.sort(
    (a, b) =>
      a.sprint - b.sprint ||
      a.codigo.localeCompare(b.codigo, undefined, { numeric: true }),
  );

  const replanejadas = new Map(
    (dados.replanejadas ?? [])
      .filter((r) => !restauradas.includes(r))
      .map((r) => [r.historia.id, r]),
  );
  for (const historia of retiradas)
    replanejadas.set(historia.id, { historia, sprintDestino: 23 });

  const ferias = historias.filter(
    (h) => h.sprint === 23 && FERIAS_SPRINT_23.has(h.codigo),
  );
  return {
    ...dados,
    historias,
    replanejadas: [...replanejadas.values()],
    avisos: [
      ...dados.avisos.filter(
        (a) =>
          !(
            a.tipo === "replanejamento" &&
            (a.sprint === 22 || a.sprint === 23)
          ),
      ),
      {
        tipo: "replanejamento",
        sprint: 22,
        linhas: [...replanejadas.values()]
          .filter(
            (r) =>
              r.historia.sprint === 22 &&
              FERIAS_SPRINT_23.has(r.historia.codigo),
          )
          .flatMap((r) => r.historia.linhas),
        mensagem: `Escopo corrigido pelo usuário: as ${ferias.length} histórias de férias (${ferias.map((h) => h.codigo).join(", ")}) pertencem exclusivamente à Sprint 23 e são contabilizadas como novas, sem remanescência da Sprint 22. As aparições da Sprint 22 foram retiradas dos indicadores e preservadas apenas para rastreabilidade.`,
      },
    ],
  };
}
