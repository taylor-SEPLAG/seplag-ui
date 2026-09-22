import { format, isValid, parse } from "date-fns";
import { updateLocaleOptions } from "primereact/api";
import type { FormEvent } from "primereact/ts-helpers";

export const DATE_TIME_FIELD_FORMAT_SEPLAG = "dd/MM/yyyy HH:mm";
export const DATE_TIME_FIELD_MASK_SEPLAG = "99/99/9999 99:99";
const EMPTY_MASK_VALUE = "__/__/____ __:__";

type CalendarValue = Date | Date[] | string | null | undefined;

export type DateTimeCalendarChangeEventSeplag = FormEvent<CalendarValue>;

updateLocaleOptions({ now: "Agora", today: "Hoje", clear: "Limpar" }, "pt");

export function cleanDateTimeMaskedValueSeplag(value: string) {
  return value === EMPTY_MASK_VALUE ? "" : value;
}

export function isDateTimeInputTypingEventSeplag(event: DateTimeCalendarChangeEventSeplag) {
  return (
    typeof HTMLInputElement !== "undefined" &&
    event.originalEvent?.target instanceof HTMLInputElement
  );
}

export function parseDateTimeFieldValueSeplag(value?: string | null): Date | null {
  if (!value || value.includes("_")) {
    return null;
  }

  const parsedDate = parse(value, DATE_TIME_FIELD_FORMAT_SEPLAG, new Date());
  return isValid(parsedDate) ? parsedDate : null;
}

export function formatDateTimeFieldValueSeplag(value: Date): string {
  return format(value, DATE_TIME_FIELD_FORMAT_SEPLAG);
}
