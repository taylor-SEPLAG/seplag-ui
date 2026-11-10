import {
  abrangenciaVazia,
  opcoesAbrangencia,
  type CatalogoAbrangencia,
  type CriteriosAbrangencia,
} from "./abrangenciaGrupoCalculo";
import {
  abrangenciaLegadaGrupo,
  identificarConflitosAbrangencia,
} from "./conflitosAbrangenciaGrupo";

export type CampoImpacto = keyof CriteriosAbrangencia;
export const camposImpacto: Record<CampoImpacto, string> = {
  regimes: "Regime Jurídico",
  tipos: "Tipo de Vínculo",
  orgaos: "Órgão/Entidade",
  unidades: "Unidade de Lotação",
  carreiras: "Carreira",
  cargos: "Cargo",
};
export const chavesImpacto = Object.keys(camposImpacto) as CampoImpacto[];
export type RubricaImpacto = {
  codigo: string;
  nomeRubrica: string;
  naturezaVerba?: string;
  tipo?: string;
};
export type GrupoImpacto = {
  id: number;
  grupo: string;
  herdaDe: string;
  nivel: number;
  orgaoSetor: string;
  tipoVinculo?: string;
  competencia?: string;
  situacao?: string;
  abrangencia?: CriteriosAbrangencia;
  criteriosProprios?: CriteriosAbrangencia;
  composicaoRubricas?: RubricaImpacto[];
  rubricasProprias?: string[];
  versao?: number;
};
export type DecisoesImpacto = Record<
  string,
  "aplicar" | "manter" | "excluir" | "propria"
>;
export type OrdensImpacto = Record<
  number,
  { origem: string; codigos: string[] }
>;
export type ResultadoRevisao = {
  criteriosPai: CriteriosAbrangencia;
  criteriosPaiAntes: CriteriosAbrangencia;
  grupos: {
    id: number;
    criterios: CriteriosAbrangencia;
    criteriosProprios: CriteriosAbrangencia;
    criteriosAntes: CriteriosAbrangencia;
    rubricas: RubricaImpacto[];
    rubricasProprias: string[];
    versao: number;
    origem: string;
    versaoOrigem: number;
  }[];
  decisoes: Record<string, string>;
  ordens?: Record<number, string[]>;
  usuario: string;
  dataHora: string;
  inicio: string;
  fimAnterior: string;
  pai: string;
  versaoPai: number;
};
type Snapshot = {
  grupo: GrupoImpacto;
  criterios: CriteriosAbrangencia;
  proprios: CriteriosAbrangencia;
  rubricas: RubricaImpacto[];
  proprias: string[];
};
export type ContextoImpactos = {
  pai: GrupoImpacto;
  grupos: GrupoImpacto[];
  arvore: GrupoImpacto[];
  niveis: GrupoImpacto[];
  anteriores: Record<number, Snapshot>;
  criteriosPai: CriteriosAbrangencia;
  atuais: RubricaImpacto[];
  novas: RubricaImpacto[];
  catalogo: CatalogoAbrangencia;
};
export type LinhaAbrangenciaImpacto = {
  campo: CampoImpacto;
  atual: string[];
  alteracao: string[];
  proposta: string[];
  chave: string;
  decisao?: string;
};
export type LinhaRubricaImpacto = RubricaImpacto & {
  origem: "Herdada" | "Própria";
  impacto?: "nova" | "removida";
  ordemAlterada: boolean;
  incluida: boolean;
  chave?: string;
  decisao?: string;
};
export type RevisaoGrupoImpacto = {
  grupo: GrupoImpacto;
  origemId: number;
  criterios: CriteriosAbrangencia;
  proprios: CriteriosAbrangencia;
  abrangencia: LinhaAbrangenciaImpacto[];
  rubricas: LinhaRubricaImpacto[];
  assinatura: string;
  origemOrdem: string;
  pendencias: number;
  alteracoes: number;
  alteracoesRubricas: number;
  valida: boolean;
};

const igual = (a: string[], b: string[]) =>
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const assinatura = (v: unknown) => JSON.stringify(v);
const combinacao = (proprio: string[], herdado: string[]) =>
  proprio.length
    ? herdado.length
      ? proprio.filter((v) => herdado.includes(v))
      : [...proprio]
    : [...herdado];
const dadosRubrica = ({
  codigo,
  nomeRubrica,
  naturezaVerba,
  tipo,
}: RubricaImpacto): RubricaImpacto => ({
  codigo,
  nomeRubrica,
  naturezaVerba,
  tipo,
});

export function criarContextoImpactos(
  pai: GrupoImpacto,
  grupos: GrupoImpacto[],
  criteriosPai: CriteriosAbrangencia,
  atuais: RubricaImpacto[],
  novas: RubricaImpacto[],
  catalogo: CatalogoAbrangencia,
  rubricasCatalogo: RubricaImpacto[] = [],
): ContextoImpactos {
  const arvore: GrupoImpacto[] = [];
  const visitar = (nome: string) =>
    grupos
      .filter(
        (g) =>
          g.herdaDe === nome &&
          !["ENCERRADO", "INATIVO", "CANCELADO"].includes(g.situacao ?? "") &&
          g.id !== pai.id &&
          !arvore.some((d) => d.id === g.id),
      )
      .forEach((g) => {
        arvore.push(g);
        visitar(g.grupo);
      });
  visitar(pai.grupo);
  const niveis = [...arvore].sort((a, b) => a.nivel - b.nivel);
  const metadados = new Map(
    [...atuais, ...novas, ...rubricasCatalogo].map((r) => [r.codigo, r]),
  );
  const completar = (rubricas: RubricaImpacto[]) => [
    ...new Map(
      rubricas.map((r) => [
        r.codigo,
        dadosRubrica({ ...metadados.get(r.codigo), ...r }),
      ]),
    ).values(),
  ];
  const anteriores: Record<number, Snapshot> = {
    [pai.id]: {
      grupo: pai,
      criterios: abrangenciaLegadaGrupo(pai, catalogo),
      proprios: abrangenciaVazia(),
      rubricas: completar(atuais),
      proprias: pai.rubricasProprias ?? [],
    },
  };
  for (const g of niveis) {
    const origem =
      anteriores[niveis.find((d) => d.grupo === g.herdaDe)?.id ?? pai.id];
    const original = abrangenciaLegadaGrupo(g, catalogo);
    const proprios = g.criteriosProprios
      ? structuredClone(g.criteriosProprios)
      : (Object.fromEntries(
          chavesImpacto.map((c) => [
            c,
            original[c].length && !igual(original[c], origem.criterios[c])
              ? original[c]
              : [],
          ]),
        ) as CriteriosAbrangencia);
    const criterios = Object.fromEntries(
      chavesImpacto.map((c) => [
        c,
        combinacao(proprios[c], origem.criterios[c]),
      ]),
    ) as CriteriosAbrangencia;
    const rubricas = completar(g.composicaoRubricas ?? origem.rubricas);
    const proprias = [
      ...new Set([
        ...(g.rubricasProprias ?? []),
        ...rubricas
          .filter((r) => !origem.rubricas.some((o) => o.codigo === r.codigo))
          .map((r) => r.codigo),
      ]),
    ];
    anteriores[g.id] = { grupo: g, criterios, proprios, rubricas, proprias };
  }
  return structuredClone({
    pai,
    grupos: grupos.some((g) => g.id === pai.id) ? grupos : [pai, ...grupos],
    arvore,
    niveis,
    anteriores,
    criteriosPai,
    atuais: completar(atuais),
    novas: completar(novas),
    catalogo,
  });
}

export function calcularRevisaoImpactos(
  ctx: ContextoImpactos,
  decisoes: DecisoesImpacto,
  ordens: OrdensImpacto = {},
): Record<number, RevisaoGrupoImpacto> {
  const revisoes: Record<number, RevisaoGrupoImpacto> = {};
  for (const g of ctx.niveis) {
    const atual = ctx.anteriores[g.id];
    const origemId =
      ctx.niveis.find((d) => d.grupo === g.herdaDe)?.id ?? ctx.pai.id;
    const origemAtual = ctx.anteriores[origemId];
    const origemCriterios = revisoes[origemId]?.criterios ?? ctx.criteriosPai;
    const origemRubricas =
      revisoes[origemId]?.rubricas.filter((r) => r.incluida) ?? ctx.novas;
    const proprios = structuredClone(atual.proprios);
    const criterios = structuredClone(atual.criterios);
    const abrangencia: LinhaAbrangenciaImpacto[] = [];
    const valida = true;
    for (const campo of chavesImpacto) {
      const proposta = [...origemCriterios[campo]];
      const mudou = !igual(
        origemAtual.criterios[campo],
        origemCriterios[campo],
      );
      if (mudou && !igual(proposta, atual.criterios[campo])) {
        const chave = `${g.id}:abrangencia:${campo}:${assinatura(origemCriterios[campo])}`;
        const decisao = decisoes[chave];
        abrangencia.push({
          campo,
          atual: atual.criterios[campo],
          alteracao: origemCriterios[campo],
          proposta,
          chave,
          decisao,
        });
        if (decisao === "aplicar") {
          criterios[campo] = proposta;
          proprios[campo] = [];
        }
        if (decisao === "manter") {
          criterios[campo] = [...atual.criterios[campo]];
          proprios[campo] = [...atual.criterios[campo]];
        }
      }
    }
    const origemCodigos = origemRubricas.map((r) => r.codigo);
    const antesCodigos = origemAtual.rubricas.map((r) => r.codigo);
    const comunsAntes = antesCodigos.filter((c) => origemCodigos.includes(c));
    const comunsDepois = origemCodigos.filter((c) => antesCodigos.includes(c));
    const mudouOrdem = !igual(
      comunsAntes.map((c, i) => `${i}:${c}`),
      comunsDepois.map((c, i) => `${i}:${c}`),
    );
    let lista = [...atual.rubricas];
    if (mudouOrdem) {
      const herdadas = lista
        .filter(
          (r) =>
            !atual.proprias.includes(r.codigo) &&
            origemCodigos.includes(r.codigo),
        )
        .sort(
          (a, b) =>
            origemCodigos.indexOf(a.codigo) - origemCodigos.indexOf(b.codigo),
        );
      let indice = 0;
      lista = lista.map((r) =>
        !atual.proprias.includes(r.codigo) && origemCodigos.includes(r.codigo)
          ? herdadas[indice++]
          : r,
      );
    }
    for (let i = 0; i < origemRubricas.length; i++) {
      const nova = origemRubricas[i];
      if (lista.some((r) => r.codigo === nova.codigo)) continue;
      // Uma exclusão já existente no filho não é uma nova inclusão do pai.
      if (antesCodigos.includes(nova.codigo)) continue;
      const anterior = origemCodigos
        .slice(0, i)
        .reverse()
        .find((c) => lista.some((r) => r.codigo === c));
      const seguinte = origemCodigos
        .slice(i + 1)
        .find((c) => lista.some((r) => r.codigo === c));
      const indice = anterior
        ? lista.findIndex((r) => r.codigo === anterior) + 1
        : seguinte
          ? lista.findIndex((r) => r.codigo === seguinte)
          : lista.length;
      lista.splice(indice, 0, dadosRubrica(nova));
    }
    const ordemSugerida = lista.map((r) => r.codigo);
    const origemOrdem = assinatura(ordemSugerida);
    const ordem = ordens[g.id];
    if (ordem?.origem === origemOrdem)
      lista.sort(
        (a, b) =>
          ordem.codigos.indexOf(a.codigo) - ordem.codigos.indexOf(b.codigo),
      );
    const rubricas: LinhaRubricaImpacto[] = lista.map((r) => {
      const propria = atual.proprias.includes(r.codigo);
      const nova = !atual.rubricas.some((a) => a.codigo === r.codigo);
      const removida =
        !propria &&
        antesCodigos.includes(r.codigo) &&
        !origemCodigos.includes(r.codigo);
      const impacto = nova
        ? ("nova" as const)
        : removida
          ? ("removida" as const)
          : undefined;
      const chave = impacto
        ? `${g.id}:rubrica:${impacto}:${r.codigo}:${assinatura(origemCodigos)}`
        : undefined;
      const decisao = chave ? decisoes[chave] : undefined;
      return {
        ...dadosRubrica(r),
        origem:
          propria || (removida && decisao === "propria")
            ? "Própria"
            : "Herdada",
        impacto,
        ordemAlterada:
          (!impacto &&
            !propria &&
            mudouOrdem &&
            comunsAntes.indexOf(r.codigo) !== comunsDepois.indexOf(r.codigo)) ||
          (ordem?.origem === origemOrdem &&
            ordem.codigos.indexOf(r.codigo) !==
              ordemSugerida.indexOf(r.codigo)),
        incluida: impacto ? decisao !== "excluir" : true,
        chave,
        decisao,
      };
    });
    const alteracoesRubricas = rubricas.filter(
      (r) => r.impacto || r.ordemAlterada,
    ).length;
    const pendencias =
      abrangencia.filter((a) => !a.decisao).length +
      rubricas.filter((r) => r.impacto && !r.decisao).length;
    const revisao = {
      grupo: g,
      origemId,
      criterios,
      proprios,
      abrangencia,
      rubricas,
      origemOrdem,
      pendencias,
      alteracoes: abrangencia.length + alteracoesRubricas,
      alteracoesRubricas,
      valida,
      assinatura: "",
    };
    revisao.assinatura = assinatura({
      abrangencia,
      rubricas,
      origemCriterios,
      origemRubricas: origemCodigos,
    });
    revisoes[g.id] = revisao;
  }
  return revisoes;
}

export function validarGrupoRevisado(
  ctx: ContextoImpactos,
  revisoes: Record<number, RevisaoGrupoImpacto>,
  id: number,
): string[] {
  const r = revisoes[id];
  if (r.pendencias)
    return ["Defina uma ação para cada alteração antes de revisar este grupo."];
  const erros: string[] = [];
  const opcoes = opcoesAbrangencia(r.criterios, ctx.catalogo);
  if (
    !r.valida ||
    chavesImpacto.some((c) =>
      r.criterios[c].some((v) => !opcoes[c].some((o) => o.value === v)),
    )
  )
    erros.push(
      "A configuração resultante contém critérios incompatíveis. Reveja as escolhas de abrangência ou volte à edição do grupo pai.",
    );
  const pai = revisoes[r.origemId]?.criterios ?? ctx.criteriosPai;
  const mudou = !chavesImpacto.every(
    (c) =>
      igual(r.criterios[c], ctx.anteriores[id].criterios[c]) &&
      igual(pai[c], ctx.anteriores[r.origemId].criterios[c]),
  );
  if (mudou) {
    const contida = chavesImpacto.every(
      (c) =>
        !pai[c].length ||
        (r.criterios[c].length > 0 &&
          r.criterios[c].every((v) => pai[c].includes(v))),
    );
    const restrita = chavesImpacto.some(
      (c) =>
        r.criterios[c].length > 0 &&
        (!pai[c].length || r.criterios[c].length < pai[c].length),
    );
    if (!contida || !restrita)
      erros.push(
        "Essa escolha não preserva a especificidade do grupo. Reveja as ações de abrangência ou volte à edição do grupo pai.",
      );
  }
  const competencia = ctx.pai.competencia ?? "";
  const anteriores = ctx.grupos.map((g) => ({
    ...g,
    abrangencia:
      ctx.anteriores[g.id]?.criterios ??
      abrangenciaLegadaGrupo(g, ctx.catalogo),
  }));
  const conjuntos = anteriores.map((g) => ({
    ...g,
    abrangencia:
      g.id === ctx.pai.id
        ? ctx.criteriosPai
        : (revisoes[g.id]?.criterios ?? g.abrangencia),
  }));
  const antes = identificarConflitosAbrangencia(
    { ...r.grupo, abrangencia: ctx.anteriores[id].criterios },
    anteriores,
    competencia,
    ctx.catalogo,
  );
  const depois = identificarConflitosAbrangencia(
    { ...r.grupo, abrangencia: r.criterios },
    conjuntos,
    competencia,
    ctx.catalogo,
  );
  if (depois.some((g) => !antes.some((a) => a.id === g.id)))
    erros.push(
      "Não é possível confirmar essa escolha: ela introduz uma sobreposição impeditiva. Reveja as ações ou volte à edição do grupo pai.",
    );
  const incluidas = r.rubricas.filter((l) => l.incluida);
  if (new Set(incluidas.map((l) => l.codigo)).size !== incluidas.length)
    erros.push(
      "A composição contém rubricas duplicadas. Revise a listagem antes de continuar.",
    );
  return erros;
}

export function resultadoDaRevisao(
  ctx: ContextoImpactos,
  revisoes: Record<number, RevisaoGrupoImpacto>,
  decisoes: DecisoesImpacto,
  versaoPai: number,
  inicio: string,
  usuario: string,
): ResultadoRevisao {
  const [dia, mes, ano] = inicio.split("/").map(Number);
  const fimAnterior = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, mes - 1, dia - 1)));
  const chavesAtivas = new Set(
    Object.values(revisoes).flatMap((r) => [
      ...r.abrangencia.map((a) => a.chave),
      ...r.rubricas.flatMap((l) => (l.chave ? [l.chave] : [])),
    ]),
  );
  return {
    pai: ctx.pai.grupo,
    versaoPai,
    criteriosPai: ctx.criteriosPai,
    criteriosPaiAntes: ctx.anteriores[ctx.pai.id].criterios,
    inicio,
    fimAnterior,
    usuario,
    dataHora: new Date().toISOString(),
    decisoes: Object.fromEntries(
      Object.entries(decisoes).filter(([k]) => chavesAtivas.has(k)),
    ),
    ordens: Object.fromEntries(
      Object.values(revisoes).map((r) => [
        r.grupo.id,
        r.rubricas.filter((l) => l.incluida).map((l) => l.codigo),
      ]),
    ),
    grupos: ctx.niveis.map((g) => {
      const r = revisoes[g.id];
      return {
        id: g.id,
        criterios: r.criterios,
        criteriosProprios: r.proprios,
        criteriosAntes: ctx.anteriores[g.id].criterios,
        rubricas: r.rubricas.filter((l) => l.incluida).map(dadosRubrica),
        rubricasProprias: r.rubricas
          .filter((l) => l.incluida && l.origem === "Própria")
          .map((l) => l.codigo),
        versao: (g.versao ?? 1) + 1,
        origem: g.herdaDe,
        versaoOrigem:
          r.origemId === ctx.pai.id
            ? versaoPai
            : (ctx.niveis.find((d) => d.id === r.origemId)?.versao ?? 1) + 1,
      };
    }),
  };
}
