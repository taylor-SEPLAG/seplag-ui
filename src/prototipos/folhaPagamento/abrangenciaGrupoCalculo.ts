export type CriteriosAbrangencia = Record<
  "regimes" | "tipos" | "carreiras" | "orgaos" | "unidades" | "cargos",
  string[]
>;
export type OpcaoAbrangencia = { value: string; label: string };
export interface CatalogoAbrangencia {
  regimes: OpcaoAbrangencia[];
  tipos: (OpcaoAbrangencia & { regimes: string[]; possuiCarreira: boolean })[];
  carreiras: (OpcaoAbrangencia & { orgaos: string[] })[];
  orgaos: OpcaoAbrangencia[];
  unidades: (OpcaoAbrangencia & { orgao: string })[];
  cargos: (OpcaoAbrangencia & {
    tipos: string[];
    carreirasPorTipo: Record<string, string>;
  })[];
}
export const abrangenciaVazia = (): CriteriosAbrangencia => ({
  regimes: [],
  tipos: [],
  carreiras: [],
  orgaos: [],
  unidades: [],
  cargos: [],
});
export const normalizarChaveAbrangencia = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
const contem = (valores: string[], valor: string) =>
  valores.some(
    (v) => normalizarChaveAbrangencia(v) === normalizarChaveAbrangencia(valor),
  );
const intersecta = (a: string[], b: string[]) => a.some((v) => contem(b, v));

export function opcoesAbrangencia(
  f: CriteriosAbrangencia,
  c: CatalogoAbrangencia,
) {
  const tipos = c.tipos.filter(
    (t) => !f.regimes.length || intersecta(t.regimes, f.regimes),
  );
  const tiposConsiderados = tipos.filter(
    (t) => !f.tipos.length || f.tipos.includes(t.value),
  );
  const restringirTipos = Boolean(f.regimes.length || f.tipos.length);
  const carreiraAtiva =
    !restringirTipos || tiposConsiderados.some((t) => t.possuiCarreira);
  const carreiras = !carreiraAtiva
    ? []
    : c.carreiras.filter(
        (carreira) =>
          !restringirTipos ||
          c.cargos.some((cargo) =>
            tiposConsiderados.some(
              (tipo) =>
                cargo.tipos.includes(tipo.value) &&
                cargo.carreirasPorTipo[tipo.value] === carreira.value,
            ),
          ),
      );
  const carreirasSelecionadas = carreiraAtiva
    ? carreiras.filter((carreira) => f.carreiras.includes(carreira.value))
    : [];
  const orgaos = c.orgaos.filter(
    (orgao) =>
      !carreirasSelecionadas.length ||
      carreirasSelecionadas.some((carreira) =>
        contem(carreira.orgaos, orgao.value),
      ),
  );
  const unidades = c.unidades.filter(
    (unidade) =>
      orgaos.some((orgao) => contem([orgao.value], unidade.orgao)) &&
      (!f.orgaos.length || contem(f.orgaos, unidade.orgao)),
  );
  const cargos = c.cargos.filter((cargo) => {
    if (!restringirTipos && !carreirasSelecionadas.length) return true;
    return tiposConsiderados.some(
      (tipo) =>
        cargo.tipos.includes(tipo.value) &&
        (!tipo.possuiCarreira ||
          !carreirasSelecionadas.length ||
          f.carreiras.includes(cargo.carreirasPorTipo[tipo.value])),
    );
  });
  return {
    regimes: c.regimes,
    tipos,
    carreiras,
    orgaos,
    unidades,
    cargos,
    carreiraAtiva,
  };
}

// A ordem segue as dependências; apenas seleções incompatíveis são removidas.
export function ajustarAbrangencia(
  f: CriteriosAbrangencia,
  c: CatalogoAbrangencia,
): CriteriosAbrangencia {
  const atual = { ...f };
  for (const campo of [
    "regimes",
    "tipos",
    "carreiras",
    "orgaos",
    "unidades",
    "cargos",
  ] as const) {
    const opcoes = opcoesAbrangencia(atual, c)[campo];
    atual[campo] = [...new Set(atual[campo])].filter((v) =>
      opcoes.some((o) => o.value === v),
    );
  }
  return atual;
}

export function temAbrangencia(f: CriteriosAbrangencia) {
  return Object.values(f).some((v) => v.length > 0);
}

export interface VinculoParaAbrangencia {
  id: string;
  regime: string;
  tipo: string;
  carreira: string;
  orgao: string;
  setor: string;
  cargo: string;
}
export function filtrarVinculosElegiveis<T extends VinculoParaAbrangencia>(
  vinculos: T[],
  filtros: CriteriosAbrangencia,
  c: CatalogoAbrangencia,
): T[] {
  const f = ajustarAbrangencia(filtros, c);
  const corresponde = (
    selecionados: string[],
    opcoes: OpcaoAbrangencia[],
    valor: string,
  ) =>
    !selecionados.length ||
    opcoes.some(
      (o) =>
        selecionados.includes(o.value) && contem([o.value, o.label], valor),
    );
  return vinculos.filter((v) => {
    const tipo = c.tipos.find((t) => contem([t.value, t.label], v.tipo));
    return (
      corresponde(f.regimes, c.regimes, v.regime) &&
      corresponde(f.tipos, c.tipos, v.tipo) &&
      (tipo?.possuiCarreira === false ||
        corresponde(f.carreiras, c.carreiras, v.carreira)) &&
      corresponde(f.orgaos, c.orgaos, v.orgao) &&
      corresponde(f.cargos, c.cargos, v.cargo) &&
      (!f.unidades.length ||
        c.unidades.some(
          (u) =>
            f.unidades.includes(u.value) &&
            contem([u.orgao], v.orgao) &&
            contem([u.value, u.label], v.setor),
        ))
    );
  });
}

const chave = (id: string) => `sigep:grupo-calculo:abrangencia:${id}`;
export function lerAbrangenciaGrupo(
  id: string,
  fallback = abrangenciaVazia(),
): CriteriosAbrangencia {
  try {
    const valor = JSON.parse(
      localStorage.getItem(chave(id)) ?? "null",
    )?.criterios;
    if (!valor) return fallback;
    const vazio = abrangenciaVazia();
    return Object.fromEntries(
      Object.keys(vazio).map((campo) => [
        campo,
        Array.isArray(valor?.[campo])
          ? valor[campo].filter((v: unknown) => typeof v === "string")
          : [],
      ]),
    ) as CriteriosAbrangencia;
  } catch {
    return abrangenciaVazia();
  }
}
export function salvarAbrangenciaGrupo(
  id: string,
  criterios: CriteriosAbrangencia,
  vinculosElegiveisIds: string[] = [],
) {
  localStorage.setItem(
    chave(id),
    JSON.stringify({ criterios, vinculosElegiveisIds }),
  );
}
export function vinculosElegiveisDoGrupo<T extends VinculoParaAbrangencia>(
  id: string,
  vinculos: T[],
  catalogo: CatalogoAbrangencia,
): T[] {
  return filtrarVinculosElegiveis(vinculos, lerAbrangenciaGrupo(id), catalogo);
}
