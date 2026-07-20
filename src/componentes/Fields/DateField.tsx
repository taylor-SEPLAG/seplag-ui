import { Calendar } from "primereact/calendar";
import "./primeLocalePt";
import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import {
  stringToDateSeplag,
  formatDateToStringSeplag,
  isDateBeforeSeplag,
} from "../../uteis/manipulaData";
import type { DateFieldSeplagProps } from "./types";

export function DateFieldSeplag<T extends FieldValues = any>(
  props: Readonly<DateFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12 6 3",
    getFormErrorMessage,
    shouldUnregister,
    placeholder = "dd/mm/aaaa",
    dateFormat = "dd/mm/yy",
    mask = "99/99/9999",
    view = "date",
    customValidation,
    validateAfterDate,
    validateAfterMessage,
    maxDate,
    minDate,
    validateStartDate,
    validateStartMessage,
  } = props;

  if (!visible) return null;

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: {
          message: `${label} é obrigatório`,
          value: required,
        },
        validate: {
          ...(typeof customValidation === "function"
            ? { custom: customValidation }
            : (customValidation ?? {})),
          afterDate: (value: any) => {
            if (!value || !validateAfterDate) return true;
            return (
              !isDateBeforeSeplag(value, validateAfterDate) ||
              validateAfterMessage ||
              "Data não pode ser anterior à data inicial"
            );
          },
          startDateRequired: (value: any) => {
            if (
              Object.hasOwn(props, "validateStartDate") &&
              value &&
              !validateStartDate
            )
              return validateStartMessage || "Informe a data Inicial";
            return true;
          },
        },
      }}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => (
        <RotuloSeplag nome={label} cols={cols} obrigatorio={required}>
          <div className="flex flex-column">
            <Calendar
              inputId={field.name}
              value={stringToDateSeplag(field.value)}
              onChange={(e) =>
                field.onChange(
                  e.value
                    ? (formatDateToStringSeplag(e.value) ?? undefined)
                    : undefined,
                )
              }
              className={classNames({ "p-invalid": !!fieldState.error })}
              locale="pt"
              showIcon
              showOnFocus={true}
              placeholder={placeholder}
              dateFormat={dateFormat}
              mask={mask}
              disabled={disabled}
              view={view}
              maxDate={maxDate ?? undefined}
              minDate={
                validateAfterDate
                  ? (stringToDateSeplag(validateAfterDate) ?? undefined)
                  : (minDate ?? undefined)
              }
            />
            {getFormErrorMessage(field.name)}
          </div>
        </RotuloSeplag>
      )}
    />
  );
}

export default DateFieldSeplag;
