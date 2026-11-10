import {
  abrangenciaVazia,
  normalizarChaveAbrangencia,
  opcoesAbrangencia,
  type CatalogoAbrangencia,
  type CriteriosAbrangencia,
} from "./abrangenciaGrupoCalculo";

export interface GrupoParaConflito {
  id: number | string;
  grupo: string;
  herdaDe?: string;
  competencia?: string;
  situacao?: string;
  abrangencia: CriteriosAbrangencia;
}
export interface ConflitoAbrangenciaGrupo {
  id: number | string;
  grupo: string;
  competencia: string;
  criterios: { campo: keyof CriteriosAbrangencia; valores: string[] }[];
}
const campos = Object.keys(
  abrangenciaVazia(),
) as (keyof CriteriosAbrangencia)[];
const chave = normalizarChaveAbrangencia;
const contem = (lista: string[], valor: string) =>
  lista.some((v) => chave(v) === chave(valor));
const mesmoGrupo = (a: GrupoParaConflito, b: GrupoParaConflito) =>
  String(a.id) === String(b.id);

/** Converte os rótulos antigos sem transformá-los em filtros irrestritos. */
export function abrangenciaLegadaGrupo(
  grupo: {
    abrangencia?: CriteriosAbrangencia;
    tipoVinculo?: string;
    orgaoSetor?: string;
  },
  catalogo: CatalogoAbrangencia,
): CriteriosAbrangencia {
  const original = grupo.abrangencia ?? {
    ...abrangenciaVazia(),
    tipos: (grupo.tipoVinculo ?? "").split(","),
    orgaos: (grupo.orgaoSetor ?? "").split(","),
  };
  const aliases: Record<string, string[]> = {
    contratado: ["Contrato Temporário", "Contrato Temporário Vínculo Único"],
    contratados: ["Contrato Temporário", "Contrato Temporário Vínculo Único"],
    comissionado: ["Exclusivamente Comissionado"],
    comissionados: ["Exclusivamente Comissionado"],
  };
  return Object.fromEntries(
    campos.map((campo) => [
      campo,
      [
        ...new Set(
          original[campo].flatMap((v) => {
            if (
              !v.trim() ||
              ["todos", "todas", "-", "nenhum"].includes(chave(v))
            )
              return [];
            const valores =
              campo === "tipos" ? (aliases[chave(v)] ?? [v]) : [v];
            return valores.map(
              (valor) =>
                catalogo[campo].find((o) => contem([o.value, o.label], valor))
                  ?.value ?? valor.trim(),
            );
          }),
        ),
      ],
    ]),
  ) as CriteriosAbrangencia;
}

function intersecao(
  a: CriteriosAbrangencia,
  b: CriteriosAbrangencia,
): CriteriosAbrangencia | null {
  const resultado = abrangenciaVazia();
  for (const campo of campos) {
    resultado[campo] =
      a[campo].length && b[campo].length
        ? a[campo].filter((v) => contem(b[campo], v))
        : [...(a[campo].length ? a[campo] : b[campo])];
    if (a[campo].length && b[campo].length && !resultado[campo].length)
      return null;
  }
  return resultado;
}
function maisRestrito(filho: CriteriosAbrangencia, pai: CriteriosAbrangencia) {
  return (
    campos.every(
      (c) =>
        !pai[c].length ||
        (filho[c].length > 0 && filho[c].every((v) => contem(pai[c], v))),
    ) &&
    campos.some(
      (c) =>
        filho[c].length > 0 &&
        (!pai[c].length || filho[c].length < pai[c].length),
    )
  );
}

/** Compara configurações, sem depender de pessoas ou vínculos já cadastrados. */
export function identificarConflitosAbrangencia(
  atual: GrupoParaConflito,
  grupos: GrupoParaConflito[],
  competencia: string,
  catalogo: CatalogoAbrangencia,
): ConflitoAbrangenciaGrupo[] {
  const daCompetencia = grupos.filter(
    (g) =>
      (!g.competencia || g.competencia === competencia) &&
      !["ENCERRADO", "INATIVO", "CANCELADO"].includes(
        (g.situacao ?? "ATIVO").toUpperCase(),
      ),
  );
  const porNome = new Map(
    daCompetencia.map((g) => [
      chave(g.grupo),
      mesmoGrupo(g, atual) ? atual : g,
    ]),
  );
  porNome.set(chave(atual.grupo), atual);
  const ancestral = (filho: GrupoParaConflito, pai: GrupoParaConflito) => {
    const visitados = new Set<string>();
    let origem = filho.herdaDe ? porNome.get(chave(filho.herdaDe)) : undefined;
    while (origem && !visitados.has(String(origem.id))) {
      if (mesmoGrupo(origem, pai)) return true;
      visitados.add(String(origem.id));
      origem = origem.herdaDe ? porNome.get(chave(origem.herdaDe)) : undefined;
    }
    return false;
  };
  const efetiva = (
    g: GrupoParaConflito,
    visitados = new Set<string>(),
  ): CriteriosAbrangencia | null => {
    if (visitados.has(String(g.id))) return null;
    const origem = g.herdaDe ? porNome.get(chave(g.herdaDe)) : undefined;
    if (!origem) return g.abrangencia;
    const herdada = efetiva(origem, new Set([...visitados, String(g.id)]));
    return herdada ? intersecao(g.abrangencia, herdada) : null;
  };
  const criteriosAtuais = efetiva(atual);
  if (!criteriosAtuais) return [];
  const conflitos: ConflitoAbrangenciaGrupo[] = [];
  for (const outro of daCompetencia) {
    if (mesmoGrupo(outro, atual)) continue;
    const criteriosOutro = efetiva(outro);
    if (!criteriosOutro) continue;
    const comuns = intersecao(criteriosAtuais, criteriosOutro);
    if (!comuns) continue;
    // Descarta interseções impossíveis entre campos relacionados do próprio catálogo.
    const opcoes = opcoesAbrangencia(comuns, catalogo);
    if (
      campos.some(
        (c) =>
          comuns[c].length &&
          !comuns[c].some((v) =>
            opcoes[c].some((o) => contem([o.value, o.label], v)),
          ),
      )
    )
      continue;
    if (
      ancestral(atual, outro) &&
      maisRestrito(criteriosAtuais, criteriosOutro)
    )
      continue;
    if (
      ancestral(outro, atual) &&
      maisRestrito(criteriosOutro, criteriosAtuais)
    )
      continue;
    conflitos.push({
      id: outro.id,
      grupo: outro.grupo,
      competencia,
      criterios: campos
        .filter((c) => comuns[c].length)
        .map((c) => ({ campo: c, valores: comuns[c] })),
    });
  }
  return conflitos;
}
