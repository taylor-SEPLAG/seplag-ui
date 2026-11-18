import type {
  CapacityEntrada,
  CapacityResultado,
  CapacitySprint,
  DadosProjeto,
  DimensaoProjeto,
  FiltrosProjeto,
  GrupoProjeto,
  HistoriaProjeto,
  InsightProjeto,
  ResumoProjeto,
  SprintProjeto,
} from "./types";

export const numero = (valor: number | null | undefined, casas = 0) =>
  valor === null || valor === undefined
    ? "Não informado"
    : valor.toLocaleString("pt-BR", {
        maximumFractionDigits: casas,
        minimumFractionDigits: casas,
      });
export const percentual = (valor: number | null) =>
  valor === null ? "Não informado" : `${numero(valor, 1)}%`;
export const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
export const nomesUnicos = (valores: string[]) =>
  [
    ...new Map(valores.filter(Boolean).map((v) => [normalizar(v), v])).values(),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
export const filtrosIniciais = (dados: DadosProjeto): FiltrosProjeto => ({
  inicial: Math.min(...dados.sprints.map((s) => s.numero)),
  final: Math.max(...dados.sprints.map((s) => s.numero)),
  comparar: true,
  squad: "",
  analista: "",
  desenvolvedor: "",
  modulo: "",
  situacao: "",
});
export const concluida = (h: HistoriaProjeto) =>
  /^(finalizad[ao]|concluid[ao]|encerrad[ao]|closed|done|homologad[ao])$/.test(
    normalizar(h.situacao),
  );
export const iniciada = (h: HistoriaProjeto) =>
  concluida(h) ||
  (/andamento|desenvolvimento|iniciad|teste|qa|homolog/.test(
    normalizar(h.situacao),
  ) &&
    !/nao iniciad/.test(normalizar(h.situacao)));
export const qaAprovada = (h: HistoriaProjeto) =>
  Boolean(
    h.qaSituacao &&
    /^(aprovad[ao]|concluid[ao]|passou)$/.test(normalizar(h.qaSituacao)),
  );
export const homologada = (h: HistoriaProjeto) =>
  Boolean(
    h.homologacao &&
    /^(aprovad[ao]|homologad[ao]|concluid[ao])$/.test(
      normalizar(h.homologacao),
    ),
  );
export const ultimasHistorias = (registros: HistoriaProjeto[]) => [
  ...new Map(
    [...registros]
      .sort((a, b) => a.sprint - b.sprint)
      .map((h) => [h.codigo, h]),
  ).values(),
];
export function filtrarHistorias(
  dados: DadosProjeto,
  filtros: FiltrosProjeto,
): HistoriaProjeto[] {
  return dados.historias.filter(
    (h) =>
      h.sprint >= filtros.inicial &&
      h.sprint <= filtros.final &&
      (!filtros.squad || h.squads.includes(filtros.squad)) &&
      (!filtros.analista || h.analistas.includes(filtros.analista)) &&
      (!filtros.desenvolvedor ||
        h.desenvolvedores.includes(filtros.desenvolvedor)) &&
      (!filtros.modulo || (h.modulo ?? "Não informado") === filtros.modulo) &&
      (!filtros.situacao || h.situacao === filtros.situacao),
  );
}
export function primeirasAparicoes(
  historias: HistoriaProjeto[],
): Map<string, number> {
  const primeiras = new Map<string, number>();
  for (const h of historias)
    primeiras.set(
      h.codigo,
      Math.min(primeiras.get(h.codigo) ?? Infinity, h.sprint),
    );
  return primeiras;
}
export const reapareceu = (
  h: HistoriaProjeto,
  primeiras: Map<string, number>,
) => h.sprint > (primeiras.get(h.codigo) ?? h.sprint);
export function resumir(
  historias: HistoriaProjeto[],
  primeiras = primeirasAparicoes(historias),
): ResumoProjeto {
  const distintas = ultimasHistorias(historias),
    pontuadas = historias.filter((h) => h.pontos !== null),
    conhecidas = distintas.filter((h) => h.situacao !== "Não informado");
  const concluidas = conhecidas.filter(concluida).length;
  const pontos = pontuadas.reduce((s, h) => s + h.pontos!, 0);
  const repetidas = historias.filter((h) => reapareceu(h, primeiras)).length;
  const finalizadas = historias.filter(concluida);
  const finalizadasPontuadas = finalizadas.filter((h) => h.pontos !== null);
  return {
    distintas: distintas.length,
    registros: historias.length,
    concluidas: conhecidas.length ? concluidas : null,
    pontos,
    pontosConcluidos:
      !historias.some((h) => h.situacao !== "Não informado") ||
      (finalizadas.length > 0 && finalizadasPontuadas.length === 0)
        ? null
        : finalizadasPontuadas.reduce((s, h) => s + h.pontos!, 0),
    pontuadas: pontuadas.length,
    semPontos: historias.length - pontuadas.length,
    semDev: historias.filter((h) => !h.desenvolvedores.length).length,
    semSituacao: historias.filter((h) => h.situacao === "Não informado").length,
    conhecidas: conhecidas.length,
    desenvolvedores: nomesUnicos(historias.flatMap((h) => h.desenvolvedores))
      .length,
    reaparecidas: repetidas,
    novas: historias.length - repetidas,
    media: pontuadas.length ? pontos / pontuadas.length : null,
    taxaConclusao:
      conhecidas.length && distintas.length
        ? (concluidas / distintas.length) * 100
        : null,
    oitoOuMais: pontuadas.length
      ? (pontuadas.filter((h) => h.pontos! >= 8).length / pontuadas.length) *
        100
      : null,
  };
}
export function agrupar(
  historias: HistoriaProjeto[],
  dimensao: DimensaoProjeto,
  primeiras = primeirasAparicoes(historias),
): GrupoProjeto[] {
  const grupos = new Map<string, HistoriaProjeto[]>();
  for (const h of historias) {
    const valores =
      dimensao === "modulo"
        ? [h.modulo ?? "Não informado"]
        : h[dimensao].length
          ? h[dimensao]
          : ["Não informado"];
    for (const nome of nomesUnicos(valores))
      grupos.set(nome, [...(grupos.get(nome) ?? []), h]);
  }
  return [...grupos].map(([nome, linhas]) => ({
    nome,
    historias: linhas,
    ...resumir(linhas, primeiras),
  }));
}
export const faixaComplexidade = (h: HistoriaProjeto) =>
  h.pontos === null
    ? "Sem estimativa"
    : h.pontos >= 1 && h.pontos <= 3
      ? "1 a 3 pontos"
      : h.pontos === 5
        ? "5 pontos"
        : h.pontos === 8
          ? "8 pontos"
          : h.pontos === 13
            ? "13 pontos"
            : "Outras pontuações";
export const FAIXAS = [
  "1 a 3 pontos",
  "5 pontos",
  "8 pontos",
  "13 pontos",
  "Outras pontuações",
  "Sem estimativa",
];
export const JORNADA_DIARIA = 8;

export function contarDiasUteis(
  inicio: string,
  fim: string | null,
): number | null {
  const data = (valor: string | null) => {
    if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
    const instante = Date.parse(`${valor}T00:00:00Z`);
    return Number.isFinite(instante) &&
      new Date(instante).toISOString().slice(0, 10) === valor
      ? instante
      : null;
  };
  const primeiro = data(inicio),
    ultimo = data(fim);
  if (primeiro === null || ultimo === null || ultimo < primeiro) return null;
  const total = (ultimo - primeiro) / 86400000 + 1;
  let dias = Math.floor(total / 7) * 5;
  const inicioSemana = new Date(primeiro).getUTCDay();
  for (let i = 0; i < total % 7; i++) {
    const dia = (inicioSemana + i) % 7;
    if (dia !== 0 && dia !== 6) dias++;
  }
  return dias;
}

export function calcularCapacitySprint(
  sprint: SprintProjeto,
  historias: HistoriaProjeto[],
): CapacitySprint {
  const nomes = nomesUnicos(
    historias
      .filter((h) => h.sprint === sprint.numero)
      .flatMap((h) => h.desenvolvedores),
  );
  const diasUteis = contarDiasUteis(sprint.inicio, sprint.fim);
  const diaria = nomes.length * JORNADA_DIARIA;
  return {
    desenvolvedores: nomes.length,
    nomes,
    jornada: JORNADA_DIARIA,
    diasUteis,
    diaria,
    bruta: diasUteis === null ? null : diaria * diasUteis,
  };
}
export const somarCapacityBruta = (
  capacidades: CapacitySprint[],
): number | null =>
  capacidades.some((c) => c.bruta === null)
    ? null
    : capacidades.reduce((total, c) => total + c.bruta!, 0);

export function calcularCapacity(e: CapacityEntrada): CapacityResultado | null {
  if (
    [e.pessoas, e.dias, e.jornada, e.dedicacao].some(
      (v) => v === null || !Number.isFinite(v) || v < 0,
    ) ||
    e.dedicacao! > 100 ||
    [e.suporte, e.afastamentos, e.outras].some(
      (v) => !Number.isFinite(v) || v < 0,
    )
  )
    return null;
  const bruta = e.pessoas! * e.dias! * e.jornada!,
    alocada = (bruta * e.dedicacao!) / 100;
  const reservas = e.suporte + e.afastamentos + e.outras;
  return {
    bruta,
    alocada,
    indisponivel: bruta - alocada + reservas,
    liquida: Math.max(0, alocada - reservas),
    fte: (e.pessoas! * e.dedicacao!) / 100,
    excesso: reservas > alocada,
  };
}
export function compararRecorteAnterior(
  dados: DadosProjeto,
  f: FiltrosProjeto,
): HistoriaProjeto[] | null {
  if (!f.comparar) return null;
  const tamanho = f.final - f.inicial + 1,
    inicial = f.inicial - tamanho,
    final = f.inicial - 1;
  if (
    !Array.from({ length: tamanho }, (_, i) => inicial + i).every((n) =>
      dados.sprints.some((s) => s.numero === n),
    )
  )
    return null;
  return filtrarHistorias(dados, { ...f, inicial, final });
}
export const variacao = (atual: number | null, anterior: number | null) =>
  atual === null || anterior === null || anterior === 0
    ? null
    : ((atual - anterior) / anterior) * 100;
export function tendencia(valores: (number | null)[]) {
  const pontos = valores
    .map((y, x) => ({ x, y }))
    .filter((p): p is { x: number; y: number } => p.y !== null);
  if (pontos.length < 2) return valores.map(() => null);
  const mx = pontos.reduce((s, p) => s + p.x, 0) / pontos.length,
    my = pontos.reduce((s, p) => s + p.y, 0) / pontos.length;
  const den = pontos.reduce((s, p) => s + (p.x - mx) ** 2, 0),
    a = den ? pontos.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / den : 0;
  return valores.map((_, x) => my + a * (x - mx));
}
export function gerarInsights(
  historias: HistoriaProjeto[],
  primeiras = primeirasAparicoes(historias),
): InsightProjeto[] {
  if (!historias.length) return [];
  const sprints = [...new Set(historias.map((h) => h.sprint))].sort(
      (a, b) => a - b,
    ),
    primeira = sprints[0],
    ultima = sprints.at(-1)!;
  const iniciais = historias.filter((h) => h.sprint === primeira),
    finais = historias.filter((h) => h.sprint === ultima),
    anteriores = historias.filter((h) => h.sprint === ultima - 1);
  const geral = resumir(historias, primeiras),
    atual = resumir(finais, primeiras),
    anterior = resumir(anteriores, primeiras),
    insights: InsightProjeto[] = [];
  if (primeira !== ultima)
    insights.push({
      id: "escopo",
      titulo: "Evolução do volume planejado",
      valor: `${iniciais.length} → ${finais.length} registros`,
      explicacao: `Entre as Sprints ${primeira} e ${ultima}, o volume registrado variou ${percentual(variacao(finais.length, iniciais.length))}. Escopo representa planejamento; a conclusão depende da situação registrada.`,
      impacto:
        "Mais escopo pode exigir revisão de prioridades e da disponibilidade efetiva.",
      pergunta:
        "O crescimento do planejamento está acompanhado de disponibilidade e conclusão?",
      tom: "info",
      historias,
    });
  const delta = variacao(atual.media, anterior.media);
  if (delta !== null)
    insights.push({
      id: "complexidade",
      titulo:
        delta > 0
          ? "Aumento da complexidade média"
          : "Variação da complexidade média",
      valor: `${delta > 0 ? "+" : ""}${percentual(delta)}`,
      explicacao: `A média passou de ${numero(anterior.media, 2)} para ${numero(atual.media, 2)} pontos entre as Sprints ${ultima - 1} e ${ultima}, considerando apenas histórias pontuadas.`,
      impacto: "A ausência de estimativas limita a comparação entre sprints.",
      pergunta:
        "As histórias mais complexas precisam de divisão, apoio ou refinamento?",
      tom: delta > 10 ? "alerta" : "info",
      historias: [...anteriores, ...finais],
    });
  if (geral.reaparecidas)
    insights.push({
      id: "reaparecimento",
      titulo: "Histórias em mais de uma sprint",
      valor: `${numero(geral.reaparecidas)} reaparições`,
      explicacao: `Na Sprint ${ultima}, ${atual.reaparecidas} de ${atual.registros} registros (${percentual(atual.registros ? (atual.reaparecidas / atual.registros) * 100 : null)}) já apareceram em sprints anteriores no histórico da base.`,
      impacto:
        "Reaparição pode representar continuidade, divisão ou replanejamento; o motivo não está estruturado na fonte.",
      pergunta: "Quais reaparições representam continuidade planejada?",
      tom: "info",
      historias: historias.filter((h) => reapareceu(h, primeiras)),
    });
  const grupos = agrupar(historias, "analistas")
    .filter((g) => g.nome !== "Não informado")
    .sort((a, b) => b.distintas - a.distintas);
  if (
    grupos.length > 1 &&
    geral.distintas &&
    grupos[0].distintas / geral.distintas > 0.35
  )
    insights.push({
      id: "concentracao",
      titulo: "Concentração de atribuições",
      valor: percentual((grupos[0].distintas / geral.distintas) * 100),
      explicacao: `${grupos[0].nome} está associado(a) a ${grupos[0].distintas} das ${geral.distintas} histórias distintas do recorte. Associação não mede produtividade individual.`,
      impacto:
        "A concentração pode aumentar dependências de conhecimento e a necessidade de apoio.",
      pergunta:
        "Há oportunidades de compartilhar contexto e distribuir responsabilidades?",
      tom: "alerta",
      historias: grupos[0].historias,
    });
  if (geral.semDev || geral.semPontos || geral.semSituacao)
    insights.push({
      id: "rastreabilidade",
      titulo: "Lacunas de rastreabilidade",
      valor: `${geral.semDev} sem desenvolvedor`,
      explicacao: `Dos ${geral.registros} registros, ${geral.semPontos} não têm pontuação e ${geral.semSituacao} não têm situação. Campos vazios permanecem desconhecidos.`,
      impacto:
        "As lacunas reduzem a precisão das análises de carga, conclusão e complexidade.",
      pergunta:
        "Quais registros precisam de atualização no próximo alinhamento?",
      tom: "alerta",
      historias: historias.filter(
        (h) =>
          !h.desenvolvedores.length ||
          h.pontos === null ||
          h.situacao === "Não informado",
      ),
    });
  insights.push({
    id: "capacity",
    titulo: "Jornada de capacity definida",
    valor: `${JORNADA_DIARIA} h/dia por desenvolvedor`,
    explicacao:
      "A capacity bruta usa os nomes distintos atribuídos às histórias de cada sprint, multiplicados pelos dias de segunda a sexta do período e pela jornada diária de 8 horas informada pelo usuário.",
    impacto:
      "A capacidade planejada em horas permite acompanhar a equipe ao longo das sprints. Descontos de feriados, férias, suporte e dedicação são tratados na simulação.",
    pergunta:
      "Quais reservas de tempo precisam ser consideradas na capacidade líquida?",
    tom: "info",
    historias: [],
  });
  return insights;
}
