import {
  normalizarChaveAbrangencia as chave,
  type CatalogoAbrangencia,
  type CriteriosAbrangencia,
} from "./abrangenciaGrupoCalculo";
export interface GrupoSimulacao {
  id: number;
  grupo: string;
  versao: number;
  competencia: string;
  inicioVigencia: string;
  fimVigencia: string;
  situacao: string;
  criterios: CriteriosAbrangencia;
  peso: number | null;
  pendencias: number;
}
export interface VinculoSimulacao {
  id: string;
  matricula: string;
  nome: string;
  numero: string;
  tipo: string;
  regime: string;
  orgao: string;
  setor: string;
  cargo: string;
  carreira: string;
  inicio: string;
  termino: string;
  situacao: string;
  vacanciaData?: string;
}
export interface ParametrosSimulacao {
  competenciaInicial: string;
  competenciaFinal?: string;
  tipoExecucao: string;
  folhaPagamentoId: number;
  criterios: CriteriosAbrangencia;
  grupoEleitos?: string;
}
export interface GrupoResultado extends GrupoSimulacao {
  chave: string;
  vinculosIds: string[];
}
export interface ResultadoSimulacao {
  grupos: GrupoResultado[];
  total: number | null;
  impedimentos: string[];
  apta: boolean;
}
export interface FonteSimulacao {
  grupos: (competencia: string) => GrupoSimulacao[];
  vinculos: () => VinculoSimulacao[];
  eleitos?: (grupo: string) => string[] | undefined;
}
export const competenciaISO = (v: string) =>
  /^\d{2}\/\d{4}$/.test(v) ? v.split("/").reverse().join("-") : v;
function dataISO(v: string, fim = false): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(v))
    return Number.isFinite(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v
      ? v
      : null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v))
    return dataISO(v.split("/").reverse().join("-"));
  const c = competenciaISO(v);
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(c))
    return (
      c +
      "-" +
      (fim
        ? String(
            new Date(
              Date.UTC(Number(c.slice(0, 4)), Number(c.slice(5)), 0),
            ).getUTCDate(),
          )
        : "01")
    );
  return null;
}
const campos = [
  "regimes",
  "tipos",
  "orgaos",
  "unidades",
  "carreiras",
  "cargos",
] as const;
function compativel(a: CriteriosAbrangencia, b: CriteriosAbrangencia) {
  return campos.every(
    (c) =>
      !a[c].length ||
      !b[c].length ||
      a[c].some((v) => b[c].some((w) => chave(v) === chave(w))),
  );
}
function enquadra(
  v: VinculoSimulacao,
  c: CriteriosAbrangencia,
  catalogo: CatalogoAbrangencia,
) {
  const valores = {
    regimes: v.regime,
    tipos: v.tipo,
    orgaos: v.orgao,
    unidades: v.setor,
    carreiras: v.carreira,
    cargos: v.cargo,
  };
  const mesmoOrgao = (a: string, b: string) =>
    chave(a) === chave(b) ||
    catalogo.orgaos.some(
      (o) =>
        [o.value, o.label].some((v) => chave(v) === chave(a)) &&
        [o.value, o.label].some((v) => chave(v) === chave(b)),
    );
  return campos.every(
    (campo) =>
      !c[campo].length ||
      c[campo].some((selecionado) => {
        if (campo === "unidades") {
          const unidade = catalogo.unidades.find((u) =>
            [u.value, u.label].some((v) => chave(v) === chave(selecionado)),
          );
          return unidade
            ? [unidade.value, unidade.label].some(
                (vv) => chave(vv) === chave(v.setor),
              ) && mesmoOrgao(unidade.orgao, v.orgao)
            : chave(selecionado) === chave(v.setor);
        }
        return (
          chave(selecionado) === chave(valores[campo]) ||
          catalogo[campo].some(
            (o) =>
              chave(o.value) === chave(selecionado) &&
              [o.value, o.label].some(
                (a) => chave(a) === chave(valores[campo]),
              ),
          )
        );
      }),
  );
}

export function simularExecucao(
  parametros: ParametrosSimulacao,
  fonte: FonteSimulacao,
  catalogo: CatalogoAbrangencia,
): ResultadoSimulacao {
  const inicial = competenciaISO(parametros.competenciaInicial),
    final = competenciaISO(
      parametros.competenciaFinal || parametros.competenciaInicial,
    );
  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(inicial) ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(final) ||
    final < inicial
  )
    throw Error("Informe um período de competências válido.");
  const primeiro = inicial + "-01",
    ultimo = dataISO(final, true)!;
  const grupos = new Map<string, GrupoResultado>();
  for (
    let ano = Number(inicial.slice(0, 4)), mes = Number(inicial.slice(5));
    `${ano}-${String(mes).padStart(2, "0")}` <= final;
    mes === 12 ? (ano++, (mes = 1)) : mes++
  ) {
    const competencia = `${ano}-${String(mes).padStart(2, "0")}`,
      inicioMes = competencia + "-01",
      fimMes = dataISO(competencia, true)!;
    const versoes = fonte
      .grupos(competencia)
      .filter(
        (g) =>
          [
            "ativo",
            "vigente",
            "agendado encerramento",
            "agendado_encerramento",
            "encerrado",
          ].includes(chave(g.situacao)) &&
          dataISO(g.inicioVigencia) !== null &&
          dataISO(g.inicioVigencia)! <= fimMes &&
          (!g.fimVigencia ||
            g.fimVigencia === "-" ||
            (!!dataISO(g.fimVigencia, true) &&
              dataISO(g.fimVigencia, true)! >= inicioMes)) &&
          compativel(g.criterios, parametros.criterios),
      );
    const selecionadas = new Map<number, GrupoSimulacao>();
    for (const g of versoes.sort((a, b) => b.versao - a.versao))
      if (!selecionadas.has(g.id)) selecionadas.set(g.id, g);
    for (const g of selecionadas.values()) {
      const id = `${g.id}:${g.versao}:${g.inicioVigencia}`;
      if (!grupos.has(id)) grupos.set(id, { ...g, chave: id, vinculosIds: [] });
    }
  }
  const resultado: ResultadoSimulacao = {
    grupos: [...grupos.values()],
    total: null,
    impedimentos: [],
    apta: false,
  };
  if (!resultado.grupos.length) return resultado; // Nenhuma consulta de vínculos sem grupos aplicáveis.
  resultado.total = 0;
  for (const g of resultado.grupos)
    if (g.pendencias > 0)
      resultado.impedimentos.push(
        `O grupo ${g.grupo} possui pendências de parametrização.`,
      );
  const eleitos = parametros.grupoEleitos
    ? fonte.eleitos?.(parametros.grupoEleitos)
    : undefined;
  if (parametros.grupoEleitos && eleitos === undefined) {
    resultado.impedimentos.push(
      "A composição do Grupo de Eleitos selecionado não está disponível. Cadastre seus vínculos antes de simular.",
    );
    return resultado;
  }
  const permitidos = eleitos ? new Set(eleitos) : undefined;
  const unicos = new Map(fonte.vinculos().map((v) => [v.id, v]));
  for (const v of unicos.values()) {
    if (permitidos && !permitidos.has(v.id)) continue;
    const inicio = dataISO(v.inicio),
      vacancia = v.vacanciaData ? dataISO(v.vacanciaData) : null,
      fim = v.termino ? dataISO(v.termino) : null;
    if (
      !inicio ||
      inicio > ultimo ||
      (vacancia && vacancia <= primeiro) ||
      (fim && fim < primeiro) ||
      (!vacancia && ["inativo", "encerrado"].includes(chave(v.situacao))) ||
      !enquadra(v, parametros.criterios, catalogo)
    )
      continue;
    const candidatos = resultado.grupos.filter(
      (g) =>
        enquadra(v, g.criterios, catalogo) &&
        dataISO(g.inicioVigencia)! <= (vacancia || fim || ultimo) &&
        (!dataISO(g.fimVigencia, true) ||
          dataISO(g.fimVigencia, true)! >= inicio),
    );
    if (!candidatos.length) continue;
    let vencedor = candidatos[0];
    if (candidatos.length > 1) {
      if (candidatos.some((g) => g.peso === null)) {
        resultado.impedimentos.push(
          "Existem vínculos em grupos sobrepostos sem peso parametrizado. Revise os pesos de abrangência.",
        );
        continue;
      }
      candidatos.sort(
        (a, b) => (b.peso ?? 0) - (a.peso ?? 0) || b.versao - a.versao,
      );
      if (
        candidatos[0].peso === candidatos[1].peso &&
        candidatos[0].id !== candidatos[1].id
      ) {
        resultado.impedimentos.push(
          "Existem vínculos em grupos com o mesmo peso aplicável. Revise a prevalência dos grupos.",
        );
        continue;
      }
      vencedor = candidatos[0];
    }
    vencedor.vinculosIds.push(v.id);
    resultado.total++;
  }
  resultado.impedimentos = [...new Set(resultado.impedimentos)];
  resultado.apta = resultado.total > 0 && !resultado.impedimentos.length;
  return resultado;
}
