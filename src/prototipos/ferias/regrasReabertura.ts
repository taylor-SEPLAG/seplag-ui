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

/** Suspensão (RN 2): habilitada antes de iniciar OU durante o usufruto, desde que a folha
 * ainda não tenha sido homologada/paga. */
export function podeSuspender(registro: FeriasRegistro) {
  return registro.situacao === "EM ABERTO" && !registro.folhaHomologada;
}

/** Reabertura-padrão (RN reabertura 3.1): exige as três condições ao mesmo tempo —
 * Cancelado/Suspenso, hoje estritamente anterior ao início original do usufruto, e folha
 * ainda não homologada/paga. Uma vez iniciado o período, a reativação direta deixa de valer
 * (3.2 trataria o saldo remanescente de uma suspensão em andamento — fora deste protótipo). */
export function elegivelParaReabertura(registro: FeriasRegistro) {
  return registro.situacao === "SUSPENSO" || registro.situacao === "CANCELADO";
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

/** Cancelamento (RN 1): habilitado em dois momentos — antes de iniciar o usufruto, ou durante
 * o usufruto (hoje dentro do período) — desde que a folha ainda não tenha sido homologada/paga.
 * Depois que o período termina (hoje > fim), cancelar deixa de ser oferecido. */
function elegivelParaCancelar(registro: FeriasRegistro) {
  if (registro.situacao !== "EM ABERTO") return false;
  const fim = fimUsufruto(registro);
  return fim !== null && dataLocalISO() <= fim;
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
