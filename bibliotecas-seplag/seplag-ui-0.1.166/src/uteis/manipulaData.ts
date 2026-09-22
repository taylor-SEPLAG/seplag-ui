import { parse, isValid, format, parseISO, isBefore, isAfter, startOfDay } from "date-fns";

/**
 * Compara se a primeira data é anterior à segunda (apenas data, ignorando horas).
 */
export function isDateBeforeSeplag(date: string | Date, dateToCompare: string | Date): boolean {
  const d1 = stringToDateSeplag(date);
  const d2 = stringToDateSeplag(dateToCompare);

  if (!d1 || !d2) return false;

  return isBefore(startOfDay(d1), startOfDay(d2));
}

/**
 * Compara se a primeira data é posterior à segunda (apenas data, ignorando horas).
 */
export function isDateAfterSeplag(date: string | Date, dateToCompare: string | Date): boolean {
  const d1 = stringToDateSeplag(date);
  const d2 = stringToDateSeplag(dateToCompare);

  if (!d1 || !d2) return false;

  return isAfter(startOfDay(d1), startOfDay(d2));
}

/**
 * Converte uma string de data para um objeto Date.
 * Aceita formatos 'dd/MM/yyyy' e 'yyyy-MM-dd'.
 * @param dateString - A string de data a ser convertida
 * @returns Date ou null se a conversão falhar
 */
export function stringToDateSeplag(dateString: string | Date | null): Date | null {
  if (dateString == null) {
    return null;
  }

  if (dateString instanceof Date) {
    return isValid(dateString) ? dateString : null;
  }

  const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
  if (!dateRegex.test(dateString)) {
    return null;
  }

  let parsedDate: Date;

  try {
    if (dateString.includes("/")) {
      parsedDate = parse(dateString, "dd/MM/yyyy", new Date());
    } else {
      parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
    }

    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error("Erro ao converter string para data:", error);
    return null;
  }
}

/**
 * Formata um objeto Date para uma string no formato 'dd/MM/yyyy'.
 * @param date - O objeto Date a ser formatado
 * @returns string formatada ou null se a data for inválida
 */
export function formatDateToStringSeplag(date: Date | null | undefined): string | null {
  if (!date) return null;

  try {
    return format(date, "dd/MM/yyyy");
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return null;
  }
}

/**
 * Recebe várias representações de data (string ou null/undefined) e
 * retorna a primeira que for válida, formatada como 'dd/MM/yyyy'.
 * @param dates - Lista de valores de data em string ('dd/MM/yyyy' ou 'yyyy-MM-dd') ou null/undefined
 * @returns string formatada da primeira data válida ou '-' se nenhuma for válida
 */
export function formatAnyDateSeplag(...dates: Array<string | null | undefined>): string {
  const found = dates.find(Boolean);
  if (!found) {
    return "-";
  }

  try {
    const date = parseISO(found); // interpreta sempre como local
    const dateObj = new Date(date);

    return isValid(dateObj) ? format(dateObj, "dd/MM/yyyy") : "-";
  } catch {
    return "-";
  }
}

/**
 * Tenta formatar um valor (string dd/MM/yyyy ou yyyy-MM-dd, ou Date) em 'dd/MM/yyyy'.
 * Retorna undefined se o valor for “falsy” ou inválido.
 */
export function formatDateFieldSeplag(value?: string | Date | null): string | undefined {
  if (!value) return undefined;
  let date: Date;
  if (typeof value === "string") {
    date = new Date(value);
  } else {
    date = value;
  }
  if (Number.isNaN(date.getTime())) return undefined;
  try {
    return format(date, "dd/MM/yyyy");
  } catch {
    return undefined;
  }
}
