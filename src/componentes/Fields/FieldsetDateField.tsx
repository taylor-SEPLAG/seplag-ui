import { Calendar } from "primereact/calendar";
import "./primeLocalePt";
import { classNames } from "primereact/utils";
import { Fieldset } from "primereact/fieldset";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import type { DateFieldSeplagProps } from "./types";
import {
  formatDateToStringSeplag,
  isDateBeforeSeplag,
  stringToDateSeplag,
} from "../../uteis";

export function FieldsetDateFieldSeplag<T extends FieldValues = any>(
  props: Readonly<DateFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12",
    getFormErrorMessage,
    placeholder = "dd/mm/aaaa",
    dateFormat = "dd/mm/yy",
    mask = "99/99/9999",
    view = "date",
    customValidation,
    validateAfterDate,
    validateAfterMessage,
    validateStartDate,
    validateStartMessage,
  } = props;

  if (!visible) return null;

  return (
    <Fieldset className="col col-sm-auto mx-2 mb-2">
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
            afterDate: (value) => {
              if (!value || !validateAfterDate) return true;
              return (
                !isDateBeforeSeplag(value, validateAfterDate) ||
                validateAfterMessage ||
                "Data não pode ser anterior à data inicial"
              );
            },
            startDateRequired: (value) => {
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
        render={({ field, fieldState }) => (
          <RotuloSeplag nome={label} cols={cols} obrigatorio={required}>
            <div className="flex flex-column">
              <Calendar
                inputId={field.name}
                value={stringToDateSeplag(field.value)}
                onChange={(e) =>
                  field.onChange(
                    e.value ? formatDateToStringSeplag(e.value) : undefined,
                  )
                }
                className={classNames({ "p-invalid": fieldState.error })}
                locale="pt"
                showIcon
                showOnFocus={true}
                placeholder={placeholder}
                dateFormat={dateFormat}
                mask={mask}
                disabled={disabled}
                view={view}
              />
              {getFormErrorMessage(field.name)}
            </div>
          </RotuloSeplag>
        )}
      />
    </Fieldset>
  );
}

export default FieldsetDateFieldSeplag;
