import { addDays, differenceInCalendarDays, format, isBefore } from "date-fns";
import { stringToDateSeplag } from "@uteis/manipulaData";
import type { Certame, SituacaoCertame, SituacaoHistoricoCertame, TipoCertame } from "./types";

// RN-03: número sequencial de 11 dígitos, zerado a cada exercício — sugerido automaticamente
// (Cenário 3) mas sempre editável pelo usuário até a publicação do edital.
export function proximoNumeroCertame(exercicio:number, certames:readonly Certame[]):string {
 const doExercicio = certames.filter((certame) => certame.anoConcurso === exercicio).length;
 return String(doExercicio + 1).padStart(11, "0");
}

// RN001: cada mudança de situação — em especial a Homologação — reabre um prazo de 2 dias
// corridos para nova prestação de contas ao TCE-MT, contado a partir da data de efeito registrada.
export function calcularPrazoPrestacaoContas(dataEfeito?:string):string | undefined {
 const data = stringToDateSeplag(dataEfeito ?? null);
 if (!data) return undefined;
 return format(addDays(data, 2), "dd/MM/yyyy");
}

// RN: a validade em dias é derivada do intervalo entre a data do resultado e a data de validade
// informada — não da publicação do edital — evitando divergência entre as duas datas e o número
// de dias exibido no formulário.
export function calcularValidadeDias(dataResultado?:string, dataValidade?:string):number | undefined {
 const inicio = stringToDateSeplag(dataResultado ?? null);
 const fim = stringToDateSeplag(dataValidade ?? null);
 if (!inicio || !fim) return undefined;
 const dias = differenceInCalendarDays(fim, inicio);
 return dias >= 0 ? dias : undefined;
}

// RN-23 (equivalente a ER143): dois certames do mesmo tipo e exercício não podem compartilhar o
// mesmo número de certame (TCE-MT).
export function certameDuplicado(certames:readonly Certame[], dados:{ numeroConcurso:string; tipoCertame:TipoCertame; anoConcurso:number }, idIgnorado?:string):boolean {
 return certames.some((item) => item.id !== idIgnorado && item.numeroConcurso === dados.numeroConcurso && item.tipoCertame === dados.tipoCertame && item.anoConcurso === dados.anoConcurso);
}

// RN-24d: a data de efeito de qualquer situação registrada não pode anteceder a publicação do
// edital — mesma lógica de RN-07/CA05, aplicada ao histórico de situações.
export function dataEfeitoAnteriorPublicacao(dataEfeito?:string, dataPublicacaoEdital?:string):boolean {
 const efeito = stringToDateSeplag(dataEfeito ?? null);
 const publicacao = stringToDateSeplag(dataPublicacaoEdital ?? null);
 if (!efeito || !publicacao) return false;
 return isBefore(efeito, publicacao);
}

// Situação atual do certame = tipo do registro mais recente do histórico. Histórico vazio equivale
// a "ABERTO" porque RN007 garante que todo certame nasce automaticamente nessa situação; só fica
// vazio de fato em cenário de histórico corrompido/ausente.
export function situacaoAtualDoHistorico(historico:readonly SituacaoHistoricoCertame[]):SituacaoCertame {
 return historico.length > 0 ? historico[historico.length - 1].tipo : "ABERTO";
}

// RN001 (Listagem de Certames): o atalho "Editar" só fica disponível enquanto a situação atual do
// certame é Abertura ou Retificação de Edital — depois que o certame avança (Paralisação,
// Homologação, Prorrogação, Cancelamento etc.), o cadastro deixa de ser editável por aqui e as
// mudanças passam a ser feitas via "Nova Situação".
export function podeEditarCertame(situacaoAtual:SituacaoCertame):boolean {
 return situacaoAtual === "ABERTO" || situacaoAtual === "RETIFICACAO_EDITAL";
}

// RN003/RN019 (equivalente a ER142, RN-24a): Retificação de Edital exige que o certame já possua um
// registro de Abertura no histórico E que a situação atual seja Abertura, Paralisação ou a própria
// Retificação de Edital — não é mais permitida depois de Homologação, Prorrogação ou Cancelamento.
export function podeRegistrarRetificacaoEdital(historico:readonly SituacaoHistoricoCertame[]):boolean {
 if (!historico.some((item) => item.tipo === "ABERTO")) return false;
 const atual = situacaoAtualDoHistorico(historico);
 return atual === "ABERTO" || atual === "PARALISADO" || atual === "RETIFICACAO_EDITAL";
}

// RN004 (equivalente a ER144, RN-24b): Homologação e Homologação Parcial compartilham a mesma
// guarda de vigência — não é permitido registrar uma nova Homologação ou Homologação Parcial
// enquanto a última do histórico (completa ou parcial) não tiver sido seguida de Cancelamento/Anulação.
export function homologacaoVigenteSemCancelamento(historico:readonly SituacaoHistoricoCertame[]):boolean {
 for (let indice = historico.length - 1; indice >= 0; indice -= 1) {
  if (historico[indice].tipo === "CANCELADO_ANULADO") return false;
  if (historico[indice].tipo === "HOMOLOGADO" || historico[indice].tipo === "HOMOLOGACAO_PARCIAL") return true;
 }
 return false;
}

// RN005 (equivalente a ER145, RN-24c): só é possível registrar Retificação de Homologação se houver
// um registro de Homologação (completa) prévio no histórico — uma Homologação Parcial prévia não é
// suficiente (ver RN017, a contrapartida parcial desta guarda).
export function podeRegistrarRetificacaoHomologacao(historico:readonly SituacaoHistoricoCertame[]):boolean {
 return historico.some((item) => item.tipo === "HOMOLOGADO");
}

// RN017 (nova): contrapartida da RN005 para a trilha parcial — só é possível registrar Retificação
// da Homologação Parcial se houver um registro de Homologação Parcial prévio; uma Homologação
// completa prévia não é suficiente.
export function podeRegistrarRetificacaoHomologacaoParcial(historico:readonly SituacaoHistoricoCertame[]):boolean {
 return historico.some((item) => item.tipo === "HOMOLOGACAO_PARCIAL");
}

// RN018 (nova): Prorrogação da Validade só pode ser registrada com uma Homologação ou Homologação
// Parcial vigente (sem Cancelamento/Anulação posterior) — mesma checagem da RN004, já que só faz
// sentido prorrogar a vigência de uma seleção já homologada.
export function podeRegistrarProrrogacaoValidade(historico:readonly SituacaoHistoricoCertame[]):boolean {
 return homologacaoVigenteSemCancelamento(historico);
}

// RN020 (nova): Paralisação só pode ser registrada enquanto a situação atual for anterior à
// Homologação (Abertura, Retificação de Edital ou a própria Paralisação) — depois de Homologado,
// Prorrogado ou Cancelado usa-se outra situação, não faz sentido paralisar.
export function podeRegistrarParalisacao(historico:readonly SituacaoHistoricoCertame[]):boolean {
 const atual = situacaoAtualDoHistorico(historico);
 return atual === "ABERTO" || atual === "RETIFICACAO_EDITAL" || atual === "PARALISADO";
}

// RN023 (nova): Retomada do Cronograma só pode ser registrada com a situação atual em Paralisação —
// sinaliza que o motivo da paralisação foi resolvido sem precisar alterar o edital (ao contrário da
// Retificação de Edital, usada quando a retomada exige mudança de regras/datas).
export function podeRegistrarRetomadaCronograma(historico:readonly SituacaoHistoricoCertame[]):boolean {
 return situacaoAtualDoHistorico(historico) === "PARALISADO";
}
