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

/** Quitação automática: usufruto concluído integralmente sem interrupção — Em Aberto com
 * hoje já após o fim de todas as parcelas. A folha homologada/paga não bloqueia a quitação
 * em si (só cancelamento, ver podeCancelar acima). */
export function elegivelParaQuitacaoAutomatica(registro: FeriasRegistro) {
  if (registro.situacao !== "EM ABERTO") return false;
  const fim = fimUsufruto(registro);
  return fim !== null && dataLocalISO() > fim;
}
