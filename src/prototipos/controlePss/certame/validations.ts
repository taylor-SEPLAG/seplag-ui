import { addDays, differenceInCalendarDays, format, isBefore } from "date-fns";
import { stringToDateSeplag } from "@uteis/manipulaData";
import type { Certame, SituacaoHistoricoCertame, TipoCertame } from "./types";

// RN-03: número sequencial de 11 dígitos, zerado a cada exercício — sugerido automaticamente
// (Cenário 3) mas sempre editável pelo usuário até a publicação do edital.
export function proximoNumeroCertame(exercicio:number, certames:readonly Certame[]):string {
 const doExercicio = certames.filter((certame) => certame.anoConcurso === exercicio).length;
 return String(doExercicio + 1).padStart(11, "0");
}

// RN-15/RN-16: cada mudança de situação — em especial a Homologação — reabre um prazo de 48h
// para nova prestação de contas ao TCE-MT, contado a partir da data de efeito registrada.
export function calcularPrazoPrestacaoContas(dataEfeito?:string):string | undefined {
 const data = stringToDateSeplag(dataEfeito ?? null);
 if (!data) return undefined;
 return format(addDays(data, 2), "dd/MM/yyyy");
}

// A validade em dias é derivada do intervalo entre a publicação do edital e a data de validade
// informada, evitando divergência entre as duas datas e o número de dias exibido no formulário.
export function calcularValidadeDias(dataPublicacaoEdital?:string, dataValidade?:string):number | undefined {
 const inicio = stringToDateSeplag(dataPublicacaoEdital ?? null);
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

// RN-24a (equivalente a ER142): só é possível registrar uma Retificação de Edital se o certame já
// possuir um registro de abertura (Aberto) no histórico — todo certame salvo nasce com esse
// registro (RN-15), então a guarda cobre apenas o caso de histórico corrompido/ausente.
export function podeRegistrarRetificacaoEdital(historico:readonly SituacaoHistoricoCertame[]):boolean {
 return historico.some((item) => item.tipo === "ABERTO");
}

// RN-24b (equivalente a ER144): não é permitido registrar uma nova Homologação enquanto a última
// Homologação do histórico não tiver sido seguida de um Cancelamento/Anulação.
export function homologacaoVigenteSemCancelamento(historico:readonly SituacaoHistoricoCertame[]):boolean {
 for (let indice = historico.length - 1; indice >= 0; indice -= 1) {
  if (historico[indice].tipo === "CANCELADO_ANULADO") return false;
  if (historico[indice].tipo === "HOMOLOGADO") return true;
 }
 return false;
}

// RN-24c (equivalente a ER145): só é possível registrar uma Retificação de Homologação se houver
// um registro de Homologado prévio no histórico do certame.
export function podeRegistrarRetificacaoHomologacao(historico:readonly SituacaoHistoricoCertame[]):boolean {
 return historico.some((item) => item.tipo === "HOMOLOGADO");
}
