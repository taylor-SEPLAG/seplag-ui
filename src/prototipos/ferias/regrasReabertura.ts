import type { FeriasRegistro } from './FeriasPages';

// Funções puras isoladas num módulo à parte (não um arquivo de componentes) para não repetir
// o problema de Fast Refresh já descrito em feriasMockDados.ts: um arquivo de componentes que
// também exporta valores não-componente invalida o módulo inteiro a cada HMR.

export function dataLocalISO(data = new Date()): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function inicioUsufruto(registro: FeriasRegistro): string | null {
  if (!registro.parcelas.length) return null;
  return registro.parcelas.reduce((menor, parcela) => (parcela.inicio < menor ? parcela.inicio : menor), registro.parcelas[0].inicio);
}

export function fimUsufruto(registro: FeriasRegistro): string | null {
  if (!registro.parcelas.length) return null;
  return registro.parcelas.reduce((maior, parcela) => (parcela.fim > maior ? parcela.fim : maior), registro.parcelas[0].fim);
}

/** Suspensão (RN-SUS, Arts. 16 e 17): é o único instituto legal para interromper as férias
 * DURANTE o usufruto. Só fica disponível quando o gozo já começou (hoje entre o início e o fim,
 * inclusive) e a folha ainda não foi homologada/paga. Antes do início do gozo a ação cabível é
 * o cancelamento (ver podeCancelar) — por isso suspender não aparece nesse momento. */
export function podeSuspender(registro: FeriasRegistro) {
  if (registro.situacao !== "EM ABERTO" || registro.folhaHomologada) return false;
  // Já existe uma suspensão aguardando validação do órgão central: não abre outra em paralelo.
  if (registro.suspensaoPendente) return false;
  const inicio = inicioUsufruto(registro);
  const fim = fimUsufruto(registro);
  const hoje = dataLocalISO();
  return inicio !== null && fim !== null && hoje >= inicio && hoje <= fim;
}

/** Reabertura-padrão (RN reabertura 3.1): exige as três condições ao mesmo tempo —
 * Suspenso, hoje estritamente anterior ao início original do usufruto, e folha ainda não
 * homologada/paga. Não há cancelamento no sistema: antes do início o registro é editado/
 * remanejado; durante o usufruto só há suspensão. Uma vez iniciado o período, a reativação
 * direta deixa de valer (3.2 trataria o saldo remanescente de uma suspensão em andamento —
 * fora deste protótipo). */
export function elegivelParaReabertura(registro: FeriasRegistro) {
  return registro.situacao === "SUSPENSO";
}

export function reaberturaDentroDoPrazo(registro: FeriasRegistro) {
  const inicio = inicioUsufruto(registro);
  return inicio !== null && dataLocalISO() < inicio;
}

export function podeReativar(registro: FeriasRegistro) {
  return elegivelParaReabertura(registro) && reaberturaDentroDoPrazo(registro) && !registro.folhaHomologada;
}

/** true quando a reabertura seria elegível por status/data, mas está bloqueada só pela folha
 * homologada/paga (3.3) — usado para exibir a ação desabilitada com a mensagem do RN, em vez
 * de simplesmente esconder a opção. */
export function reativarBloqueadaPelaFolha(registro: FeriasRegistro) {
  return elegivelParaReabertura(registro) && reaberturaDentroDoPrazo(registro) && Boolean(registro.folhaHomologada);
}

/** Cancelamento (nota normativa RN-CAN): o cancelamento aplica-se EXCLUSIVAMENTE antes do
 * início do gozo. Uma vez iniciado o usufruto, a interrupção deixa de ser cancelamento e passa
 * a ser suspensão (Arts. 16 e 17). Por isso só é elegível enquanto hoje é estritamente anterior
 * ao início da primeira parcela — e, como antes, desde que a folha não tenha sido homologada. */
function elegivelParaCancelar(registro: FeriasRegistro) {
  if (registro.situacao !== "EM ABERTO") return false;
  const inicio = inicioUsufruto(registro);
  return inicio !== null && dataLocalISO() < inicio;
}

export function podeCancelar(registro: FeriasRegistro) {
  return elegivelParaCancelar(registro) && !registro.folhaHomologada;
}

/** true quando o cancelamento seria elegível por situação/data, mas está bloqueado só pela
 * folha homologada/paga — usado para exibir a ação desabilitada com a mensagem do RN, em vez
 * de simplesmente esconder a opção (mesmo padrão de reativarBloqueadaPelaFolha). */
export function cancelarBloqueadoPelaFolha(registro: FeriasRegistro) {
  return elegivelParaCancelar(registro) && Boolean(registro.folhaHomologada);
}

/** Retorno automático da suspensão: registro SUSPENSO cuja data de retorno já chegou (hoje >=
 * dataRetornoSuspensao). Ao retornar, o registro volta para "Agendada" (EM ABERTO), pois o
 * direito foi preservado e as férias são retomadas. */
export function elegivelParaRetornoSuspensao(registro: FeriasRegistro): boolean {
  if (registro.situacao !== "SUSPENSO" || !registro.dataRetornoSuspensao) return false;
  return dataLocalISO() >= registro.dataRetornoSuspensao;
}

/** Quitação automática: usufruto concluído integralmente sem interrupção — Em Aberto com
 * hoje já após o fim de todas as parcelas. A folha homologada/paga não bloqueia a quitação
 * em si (só cancelamento/reabertura direta, ver podeCancelar/podeReativar acima). */
export function elegivelParaQuitacaoAutomatica(registro: FeriasRegistro) {
  if (registro.situacao !== "EM ABERTO") return false;
  // Suspensão aguardando validação: o registro fica congelado até o aprovador decidir.
  if (registro.suspensaoPendente) return false;
  const fim = fimUsufruto(registro);
  return fim !== null && dataLocalISO() > fim;
}

/** Saldo restante do período aquisitivo na reabertura: cancelar/suspender já devolveu os dias
 * deste registro ao saldo (periodoDisponivelServidor); enquanto ele ficou parado, outra
 * solicitação pode ter consumido essa folga, então o saldo precisa ser reconferido antes de
 * reaproveitar a mesma quantidade de dias — não dá para assumir que ainda está livre. */
export function saldoRestanteParaReabertura(registro: FeriasRegistro, demaisRegistros: FeriasRegistro[]): number {
  const saldoTotal = registro.saldoFerias ?? registro.parcelas.reduce((total, parcela) => total + parcela.dias, 0);
  const diasComprometidos = demaisRegistros
    .filter((r) =>
      r.id !== registro.id &&
      r.matricula === registro.matricula &&
      r.periodoAquisitivoInicio === registro.periodoAquisitivoInicio &&
      !["REPROVADO", "PRAZO EXPIRADO", "SUSPENSO"].includes(r.situacao),
    )
    .reduce((total, r) => total + r.parcelas.reduce((n, p) => n + p.dias, 0), 0);
  return Math.max(0, saldoTotal - diasComprometidos);
}
