import { addDays, format } from "date-fns";
import { stringToDateSeplag } from "@uteis/manipulaData";
import type { Certame } from "./types";

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
