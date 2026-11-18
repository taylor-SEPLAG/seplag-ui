import type { ComprometimentoVaga, EstadoVaga, FaseComprometimento, NaturezaComprometimento, Vaga } from "./types";

export const fasesPadrao: Record<NaturezaComprometimento, string[]> = {
  OCUPACAO: ["Aguardando análise", "Em análise", "Aguardando efetivo exercício", "Posse suspensa"],
  DISPONIBILIZACAO: ["Solicitação registrada", "Instrução do processo", "Análise e validação", "Publicação do ato"],
};

export function criarFasesComprometimento(natureza: NaturezaComprometimento, processo: string, origem: string, concluidas = 0): FaseComprometimento[] {
  return fasesPadrao[natureza].map((nome, indice) => ({
    id: `${processo}-F${indice + 1}`,
    nome,
    ordem: indice + 1,
    situacao: indice < concluidas ? "CONCLUIDA" : indice === concluidas ? "EM_ANDAMENTO" : "PENDENTE",
    origem,
    processo,
    iniciadaEm: indice <= concluidas ? `${String(10 + indice).padStart(2, "0")}/07/2026 09:00` : undefined,
    concluidaEm: indice < concluidas ? `${String(10 + indice).padStart(2, "0")}/07/2026 16:00` : undefined,
  }));
}

export function avancarFase(comprometimento: ComprometimentoVaga): ComprometimentoVaga {
  if (comprometimento.situacao !== "ATIVO") return comprometimento;
  const atual = comprometimento.fases.findIndex((fase) => fase.situacao === "EM_ANDAMENTO");
  if (atual < 0) return comprometimento;
  const fases = comprometimento.fases.map((fase, indice) => indice === atual ? { ...fase, situacao: "CONCLUIDA" as const, concluidaEm: "16/07/2026 10:30" } : indice === atual + 1 ? { ...fase, situacao: "EM_ANDAMENTO" as const, iniciadaEm: "16/07/2026 10:30" } : fase);
  return { ...comprometimento, fases };
}

export function concluirEventoDefinitivo(vaga: Vaga, comprometimento: ComprometimentoVaga): { vaga: Vaga; comprometimento: ComprometimentoVaga } {
  const estadoPosterior: EstadoVaga = comprometimento.natureza === "OCUPACAO" ? "OCUPADA" : "DISPONIVEL";
  const titulo = comprometimento.natureza === "OCUPACAO" ? "Ocupação confirmada" : "Disponibilização confirmada";
  const fases = comprometimento.fases.map((fase) => ({ ...fase, situacao: "CONCLUIDA" as const, concluidaEm: fase.concluidaEm ?? "16/07/2026 11:00" }));
  return {
    vaga: { ...vaga, estado: estadoPosterior, historico: [...vaga.historico, { id: `HIS-${vaga.id}-${String(vaga.historico.length + 1).padStart(3, "0")}`, vagaId: vaga.id, ocorridoEm: "16/07/2026 11:00", dataEfeito: "16/07/2026", tipo: "ALTERACAO_ESTADO", titulo, descricao: `Evento definitivo confirmado após conclusão do processo ${comprometimento.processo}.`, estadoAnterior: vaga.estado, estadoPosterior, origem: comprometimento.origem, usuario: "Integração SIGEP", processo: comprometimento.processo }] },
    comprometimento: { ...comprometimento, situacao: "CONCLUIDO", fases, eventoDefinitivo: titulo, concluidoEm: "16/07/2026 11:00" },
  };
}

export type SituacaoIngressoVaga =
  | "AGUARDANDO_ANALISE"
  | "EM_ANALISE"
  | "AGUARDANDO_EFETIVO_EXERCICIO"
  | "INGRESSO_CONCLUIDO"
  | "POSSE_SUSPENSA"
  | "POSSE_NEGADA"
  | "TORNADO_SEM_EFEITO";

const rotuloSituacaoIngresso: Record<SituacaoIngressoVaga, string> = {
  AGUARDANDO_ANALISE: "Aguardando análise",
  EM_ANALISE: "Em análise",
  AGUARDANDO_EFETIVO_EXERCICIO: "Aguardando efetivo exercício",
  INGRESSO_CONCLUIDO: "Ingresso concluído",
  POSSE_SUSPENSA: "Posse suspensa",
  POSSE_NEGADA: "Posse Negada",
  TORNADO_SEM_EFEITO: "Tornado sem efeito",
};

export function aplicarSituacaoIngresso(
  vaga: Vaga,
  comprometimento: ComprometimentoVaga,
  situacao: SituacaoIngressoVaga,
): { vaga: Vaga; comprometimento: ComprometimentoVaga } {
  if (comprometimento.natureza !== "OCUPACAO") return { vaga, comprometimento };
  if (situacao === "INGRESSO_CONCLUIDO") {
    return concluirEventoDefinitivo(vaga, comprometimento);
  }
  if (situacao === "POSSE_NEGADA" || situacao === "TORNADO_SEM_EFEITO") {
    return {
      vaga,
      comprometimento: {
        ...cancelarComprometimento(comprometimento),
        eventoDefinitivo: rotuloSituacaoIngresso[situacao],
        concluidoEm: "16/07/2026 11:00",
      },
    };
  }

  const nomeAtual = rotuloSituacaoIngresso[situacao];
  const indiceAtual = comprometimento.fases.findIndex((fase) => fase.nome === nomeAtual);
  const fases = comprometimento.fases.map((fase, indice) => ({
    ...fase,
    situacao:
      indice < indiceAtual
        ? ("CONCLUIDA" as const)
        : indice === indiceAtual
          ? ("EM_ANDAMENTO" as const)
          : ("PENDENTE" as const),
  }));

  return {
    vaga,
    comprometimento: { ...comprometimento, situacao: "ATIVO", fases },
  };
}
export function cancelarComprometimento(comprometimento: ComprometimentoVaga): ComprometimentoVaga {
  return { ...comprometimento, situacao: "CANCELADO", fases: comprometimento.fases.map((fase) => fase.situacao === "PENDENTE" || fase.situacao === "EM_ANDAMENTO" ? { ...fase, situacao: "CANCELADA" } : fase) };
}
