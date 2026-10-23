import type { ControleVagasState } from "./controleVagasStore";
import type { ComprometimentoVaga, EstadoVaga, OcupacaoVaga, QuadroAutorizadoRow, SituacaoLastroVaga, Vaga } from "./types";

export type SituacaoIngressoIntegracao =
  | "Aguardando Analise"
  | "Em analise"
  | "Analise Documental"
  | "Aguardando análise documento"
  | "Aguardando Efetivo Exercicio"
  | "Aguardando Termo Assinado"
  | "Posse Suspensa"
  | "Ingresso Concluído"
  | "Posse Negada"
  | "Tornado sem efeito"
  | "Exoneração de oficio"
  | "Ingresso Cancelado"
  | "Exclusão de ingresso"
  | "Encerrado por desistência";

export interface DadosIngressoVaga {
  chaveIngresso: string;
  ingressoId: string;
  editalId: string;
  numeroEdital: string;
  tipoProcesso?: "Concurso" | "Processo Seletivo";
  processo: string;
  pessoaId: string;
  pessoaNome: string;
  cpf?: string;
  classificacao?: string;
  cargo: string;
  carreira?: string;
  perfilProfissional?: string;
  orgao: string;
  vinculo?: string;
  decisaoJudicial?: boolean;
  processoJudicial?: string;
  documentoDecisaoJudicial?: string;
}

export interface ResultadoIntegracaoIngresso {
  state: ControleVagasState;
  vagaId?: string;
  comprometimentoId?: string;
  bloqueado?: string;
  alerta?: string;
}

export interface DadosRegularizacaoVagaPendente {
  identificadorRegular: string;
  processo: string;
  motivo: string;
}

const agora = () => new Date().toLocaleString("pt-BR");
const dataHoje = () => new Date().toLocaleDateString("en-CA");
const normalizar = (valor?: string) => (valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
const normalizarVinculo = (valor?: string) => {
  const vinculo = normalizar(valor);
  return vinculo === "NOMEADO EFETIVO" ? "SERVIDOR EFETIVO" : vinculo;
};
const orgaoCompativel = (quadro: QuadroAutorizadoRow, orgao: string) =>
  normalizar(quadro.orgao) === normalizar(orgao) ||
  normalizar(quadro.abrangencia).includes(normalizar(orgao)) ||
  quadro.orgaosDefinidosLei?.some((orgaoDefinido) => normalizar(orgaoDefinido) === normalizar(orgao)) ||
  quadro.quantitativosLegaisPorOrgao?.some(({ orgao: orgaoDefinido, quantidade }) => quantidade > 0 && normalizar(orgaoDefinido) === normalizar(orgao)) ||
  false;
const ultimoHistorico = (vaga: Vaga, titulo: string, anterior: EstadoVaga, posterior: EstadoVaga, descricao: string, processo: string) => ({
  id: `HIS-${vaga.id}-${String(vaga.historico.length + 1).padStart(3, "0")}`,
  vagaId: vaga.id,
  ocorridoEm: agora(),
  dataEfeito: dataHoje(),
  tipo: "ALTERACAO_ESTADO" as const,
  titulo,
  descricao,
  estadoAnterior: anterior,
  estadoPosterior: posterior,
  origem: "Ingresso do Servidor",
  usuario: "Integração SIGEP",
  processo,
});

const quadroCompativel = (quadro: QuadroAutorizadoRow, dados: DadosIngressoVaga) =>
  quadro.tipoQuadro === "Efetivo" && quadro.situacao === "Vigente" && !["ENCERRADO", "EXTINTO"].includes(quadro.situacaoVigencia ?? "") &&
  normalizar(quadro.cargo) === normalizar(dados.cargo) &&
  (!dados.carreira || normalizar(quadro.carreira) === normalizar(dados.carreira)) &&
  (!dados.vinculo || normalizarVinculo(quadro.vinculo) === normalizarVinculo(dados.vinculo)) &&
  orgaoCompativel(quadro, dados.orgao);

const vagaCompativel = (vaga: Vaga, dados: DadosIngressoVaga, quadro: QuadroAutorizadoRow) =>
  vaga.quadroAutorizadoId === quadro.id && vaga.tipo === "EFETIVO" && vaga.estado === "DISPONIVEL" &&
  vaga.situacaoLegal === "REGULAR" && (vaga.situacaoLastro ?? "REGULAR") === "REGULAR" &&
  normalizar(vaga.cargo) === normalizar(dados.cargo) && normalizar(vaga.carreira) === normalizar(quadro.carreira) &&
  normalizar(vaga.orgaoTitular) === normalizar(dados.orgao);

const fases = (situacao: SituacaoIngressoIntegracao) => {
  const nomes = ["Em análise", "Análise documental", "Aguardando efetivo exercício", "Aguardando termo assinado", "Posse suspensa"];
  const alvo: Record<string, number> = { "Aguardando Analise": 0, "Em analise": 0, "Analise Documental": 1, "Aguardando análise documento": 1, "Aguardando Efetivo Exercicio": 2, "Aguardando Termo Assinado": 3, "Posse Suspensa": 4 };
  const indice = alvo[situacao] ?? 0;
  return nomes.map((nome, ordem) => ({ id: `F${ordem + 1}`, nome, ordem: ordem + 1, situacao: ordem < indice ? "CONCLUIDA" as const : ordem === indice ? "EM_ANDAMENTO" as const : "PENDENTE" as const, origem: "Ingresso do Servidor", processo: "" }));
};

const criarComprometimento = (vagaId: string, dados: DadosIngressoVaga, situacao: SituacaoIngressoIntegracao): ComprometimentoVaga => ({
  id: `CPR-ING-${dados.chaveIngresso}`,
  vagaId,
  natureza: "OCUPACAO",
  situacao: "ATIVO",
  origem: "Ingresso do Servidor",
  processo: dados.processo,
  criadoEm: agora(),
  motivo: "Reserva automática de vaga para ingresso.",
  pessoaId: dados.pessoaId,
  pessoaNome: dados.pessoaNome,
  cpf: dados.cpf,
  ingressoId: dados.ingressoId,
  chaveIngresso: dados.chaveIngresso,
  editalId: dados.editalId,
  numeroEdital: dados.numeroEdital,
  tipoProcesso: dados.tipoProcesso,
  classificacao: dados.classificacao,
  decisaoJudicial: dados.decisaoJudicial,
  processoJudicial: dados.processoJudicial,
  documentoDecisaoJudicial: dados.documentoDecisaoJudicial,
  fases: fases(situacao).map(fase => ({ ...fase, id: `CPR-ING-${dados.chaveIngresso}-${fase.id}`, processo: dados.processo })),
});

const proximoSequencial = (state: ControleVagasState, quadroId: number) => Math.max(0, ...state.vagas.filter(v => v.quadroAutorizadoId === quadroId).map(v => v.sequencial)) + 1;

function criarVagaPendente(state: ControleVagasState, quadro: QuadroAutorizadoRow, dados: DadosIngressoVaga): { vaga: Vaga; lastro: SituacaoLastroVaga } {
  const haVagaDistribuidaNoOrgao = state.vagas.some(v => v.quadroAutorizadoId === quadro.id && normalizar(v.orgaoTitular) === normalizar(dados.orgao) && !v.provisoria);
  const lastro: SituacaoLastroVaga = !haVagaDistribuidaNoOrgao
    ? "PENDENTE_DISTRIBUICAO"
    : "PENDENTE_AMPLIACAO";
  const sequencial = proximoSequencial(state, quadro.id);
  const prefixo = lastro === "PENDENTE_DISTRIBUICAO" ? "PEND-DIST" : lastro === "PENDENTE_CRIACAO" ? "PEND-CRI" : "PEND-AMP";
  const id = `${prefixo}-${quadro.codigo}-${String(sequencial).padStart(3, "0")}`;
  return { lastro, vaga: {
    id, nome: id, sequencial, quadroAutorizadoId: quadro.id, quadroCodigo: quadro.codigo, tipo: "EFETIVO", lei: quadro.ato,
    carreira: quadro.carreira, cargo: quadro.cargo, perfilProfissional: quadro.perfilProfissional, orgaoTitular: dados.orgao,
    destinacaoPrevistaLei: dados.orgao, orgaoDistribuicaoInicial: dados.orgao, criadaEm: agora(), inicioVigencia: dataHoje(),
    estado: "EM_OCUPACAO", situacaoLegal: "REGULAR", situacaoLastro: lastro, provisoria: true,
    historico: [{ ...ultimoHistorico({ id, historico: [] } as Vaga, lastro === "PENDENTE_DISTRIBUICAO" ? "Vaga pendente de distribuição" : lastro === "PENDENTE_CRIACAO" ? "Vaga pendente de criação" : "Vaga pendente de ampliação", "DISPONIVEL", "EM_OCUPACAO", `Posição provisória criada automaticamente para ${dados.pessoaNome}.`, dados.processo) }],
  }};
}

export function atribuirVagaAutomaticaAoIngresso(state: ControleVagasState, dados: DadosIngressoVaga, situacao: SituacaoIngressoIntegracao = "Aguardando Analise"): ResultadoIntegracaoIngresso {
  const existente = state.comprometimentos.find(c => c.chaveIngresso === dados.chaveIngresso && c.natureza === "OCUPACAO" && c.situacao === "ATIVO");
  if (existente) return { state, vagaId: existente.vagaId, comprometimentoId: existente.id };
  const quadro = state.quadros.find(q => quadroCompativel(q, dados));
  if (!quadro) return { state, bloqueado: "Não existe Quadro Autorizado vigente e compatível para este ingresso." };
  const vaga = state.vagas.filter(v => vagaCompativel(v, dados, quadro)).sort((a, b) => a.sequencial - b.sequencial)[0];
  const pendente = vaga ? undefined : criarVagaPendente(state, quadro, dados);
  const escolhida = vaga ?? pendente!.vaga;
  const compromisso = criarComprometimento(escolhida.id, dados, situacao);
  const vagaReservada = vaga ? { ...vaga, estado: "EM_OCUPACAO" as const, historico: [...vaga.historico, ultimoHistorico(vaga, "Vaga reservada para ingresso", "DISPONIVEL", "EM_OCUPACAO", `Reserva automática para ${dados.pessoaNome}.`, dados.processo)] } : escolhida;
  return {
    state: { ...state, vagas: [...state.vagas.filter(v => v.id !== escolhida.id), vagaReservada], comprometimentos: [...state.comprometimentos, compromisso] },
    vagaId: escolhida.id,
    comprometimentoId: compromisso.id,
    alerta: pendente ? (pendente.lastro === "PENDENTE_DISTRIBUICAO" ? "Ingresso encaminhado para órgão sem vagas distribuídas; foi criada vaga pendente de distribuição." : pendente.lastro === "PENDENTE_CRIACAO" ? "Ingresso encaminhado com vaga pendente de criação." : "Ingresso encaminhado com vaga pendente de ampliação; o quadro possui saldo operacional negativo.") : undefined,
  };
}

export function atualizarSituacaoReserva(state: ControleVagasState, chaveIngresso: string, situacao: SituacaoIngressoIntegracao): ResultadoIntegracaoIngresso {
  const compromisso = state.comprometimentos.find(c => c.chaveIngresso === chaveIngresso && c.natureza === "OCUPACAO" && c.situacao === "ATIVO");
  if (!compromisso) return { state, bloqueado: "Reserva ativa do ingresso não encontrada." };
  const vaga = state.vagas.find(v => v.id === compromisso.vagaId);
  if (!vaga) return { state, bloqueado: "Vaga reservada não encontrada." };
  if (situacao === "Ingresso Cancelado" && compromisso.tipoProcesso === "Concurso") {
    return { state, bloqueado: "Ingresso cancelado é aplicável somente a Processo Seletivo." };
  }
  const terminal = ["Posse Negada", "Tornado sem efeito", "Exoneração de oficio", "Ingresso Cancelado", "Exclusão de ingresso", "Encerrado por desistência"].includes(situacao);
  const concluido = situacao === "Ingresso Concluído";
  if (terminal) {
    const atualizado = { ...compromisso, situacao: "CANCELADO" as const, eventoDefinitivo: situacao, concluidoEm: agora(), fases: compromisso.fases.map(f => f.situacao === "CONCLUIDA" ? f : { ...f, situacao: "CANCELADA" as const }) };
    const vagaAtualizada = { ...vaga, estado: "DISPONIVEL" as const, historico: [...vaga.historico, ultimoHistorico(vaga, `Reserva encerrada: ${situacao}`, "EM_OCUPACAO", "DISPONIVEL", `Reserva de ${compromisso.pessoaNome} cancelada.`, compromisso.processo)] };
    return { state: { ...state, vagas: state.vagas.map(v => v.id === vaga.id ? vagaAtualizada : v), comprometimentos: state.comprometimentos.map(c => c.id === compromisso.id ? atualizado : c) }, vagaId: vaga.id, comprometimentoId: compromisso.id };
  }
  if (concluido) return concluirIngressoEOcuparVaga(state, chaveIngresso, dataHoje());
  const novasFases = fases(situacao).map(f => ({ ...f, id: `${compromisso.id}-${f.id}`, processo: compromisso.processo }));
  return { state: { ...state, comprometimentos: state.comprometimentos.map(c => c.id === compromisso.id ? { ...c, fases: novasFases } : c) }, vagaId: vaga.id, comprometimentoId: compromisso.id };
}

export function concluirIngressoEOcuparVaga(state: ControleVagasState, chaveIngresso: string, efetivoExercicioEm: string): ResultadoIntegracaoIngresso {
  const compromisso = state.comprometimentos.find(c => c.chaveIngresso === chaveIngresso && c.natureza === "OCUPACAO");
  if (!compromisso) return { state, bloqueado: "Reserva do ingresso não encontrada." };
  const vaga = state.vagas.find(v => v.id === compromisso.vagaId);
  if (!vaga) return { state, bloqueado: "Vaga reservada não encontrada." };
  const ocupacaoExistente = state.ocupacoes.find(o => o.chaveIngresso === chaveIngresso && o.situacao === "ATIVA");
  if (ocupacaoExistente) return { state, vagaId: vaga.id, comprometimentoId: compromisso.id };
  const ocupacao: OcupacaoVaga = { id: `OCU-${vaga.id}-${compromisso.ingressoId}`, vagaId: vaga.id, pessoaId: compromisso.pessoaId ?? chaveIngresso, pessoaNome: compromisso.pessoaNome ?? "Servidor", cpf: compromisso.cpf ?? "", vinculoId: compromisso.vinculoId ?? `VIN-${compromisso.ingressoId}`, matricula: compromisso.matricula ?? `MAT-${compromisso.ingressoId}`, tipoVinculo: "EFETIVO", orgaoVinculo: vaga.orgaoTitular, orgaoLotacao: vaga.orgaoTitular, orgaoExercicio: vaga.orgaoTitular, cargo: vaga.cargo, efetivoExercicioEm, ingressoId: compromisso.ingressoId, chaveIngresso, decisaoJudicial: compromisso.decisaoJudicial, processoJudicial: compromisso.processoJudicial, situacao: "ATIVA", eventos: [] };
  const vagaAtualizada = { ...vaga, estado: "OCUPADA" as const, historico: [...vaga.historico, ultimoHistorico(vaga, "Ingresso concluído e vaga ocupada", "EM_OCUPACAO", "OCUPADA", `Ocupação criada para ${ocupacao.pessoaNome}.`, compromisso.processo)] };
  const compromissoAtualizado = { ...compromisso, situacao: "CONCLUIDO" as const, eventoDefinitivo: "Ingresso concluído", concluidoEm: agora(), fases: compromisso.fases.map(f => ({ ...f, situacao: "CONCLUIDA" as const })) };
  return { state: { ...state, vagas: state.vagas.map(v => v.id === vaga.id ? vagaAtualizada : v), comprometimentos: state.comprometimentos.map(c => c.id === compromisso.id ? compromissoAtualizado : c), ocupacoes: [...state.ocupacoes, ocupacao] }, vagaId: vaga.id, comprometimentoId: compromisso.id };
}

/**
 * Regulariza a mesma posição provisória depois da criação/materialização ou da
 * ampliação do quadro. Manter o identificador técnico preserva a trilha da
 * reserva, do ingresso e da eventual ocupação sem duplicar vínculos.
 */
export function regularizarVagaPendente(state: ControleVagasState, vagaId: string, dados: DadosRegularizacaoVagaPendente): ResultadoIntegracaoIngresso {
  const vaga = state.vagas.find(item => item.id === vagaId);
  if (!vaga) return { state, bloqueado: "Vaga pendente não encontrada." };
  if (!vaga.provisoria || !["PENDENTE_CRIACAO", "PENDENTE_DISTRIBUICAO", "PENDENTE_AMPLIACAO"].includes(vaga.situacaoLastro ?? "REGULAR")) {
    return { state, bloqueado: "A vaga informada já possui lastro regular." };
  }
  const quadro = state.quadros.find(item => item.id === vaga.quadroAutorizadoId);
  if (!quadro || quadro.tipoQuadro !== "Efetivo" || quadro.situacao !== "Vigente") {
    return { state, bloqueado: "O Quadro Autorizado vinculado não está vigente para regularização." };
  }
  const vagaRegularizada: Vaga = {
    ...vaga,
    provisoria: false,
    situacaoLastro: "REGULAR",
    identificadorRegular: dados.identificadorRegular,
    regularizadaEm: agora(),
    historico: [...vaga.historico, {
      id: `HIS-${vaga.id}-${String(vaga.historico.length + 1).padStart(3, "0")}`,
      vagaId: vaga.id,
      ocorridoEm: agora(),
      dataEfeito: dataHoje(),
      tipo: "ALTERACAO_LEGAL",
      titulo: "Vaga pendente regularizada",
      descricao: `${dados.motivo} Identificador definitivo: ${dados.identificadorRegular}.`,
      situacaoLegalAnterior: vaga.situacaoLegal,
      situacaoLegalPosterior: vaga.situacaoLegal,
      origem: "Controle de Vagas",
      usuario: "Integração SIGEP",
      processo: dados.processo,
    }],
  };
  return {
    state: { ...state, vagas: state.vagas.map(item => item.id === vaga.id ? vagaRegularizada : item) },
    vagaId,
    alerta: "Vaga provisória regularizada sem alterar a reserva, ocupação ou histórico já existentes.",
  };
}
