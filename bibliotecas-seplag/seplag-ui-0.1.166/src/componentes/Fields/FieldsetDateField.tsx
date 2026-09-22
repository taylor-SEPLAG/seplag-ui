import { Calendar } from "primereact/calendar";
import { Fieldset } from "primereact/fieldset";
import { classNames } from "primereact/utils";
import type { ReactNode } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import { formatDateToStringSeplag, isDateBeforeSeplag, stringToDateSeplag } from "../../uteis";
import RotuloSeplag from "../Rotulo";
import type { DateFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

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
    rules,
    value,
    onChange,
    shouldUnregister,
    autoComplete = "off",
  } = props;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const buildDateRules = () => ({
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
        if (Object.hasOwn(props, "validateStartDate") && value && !validateStartDate)
          return validateStartMessage || "Informe a data Inicial";
        return true;
      },
    },
  });

  const resolvedRules = rules ? resolveFieldRules<T>(label, required, rules) : buildDateRules();

  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    return (
      <Fieldset className="col col-sm-auto mx-2 mb-2">
        <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
          <div className="flex flex-column">
            <Calendar
              id={inputId}
              inputId={inputId}
              value={stringToDateSeplag(value ?? null)}
              onChange={(e) =>
                onChange?.(e.value ? (formatDateToStringSeplag(e.value) ?? undefined) : undefined)
              }
              disabled={disabled}
              className={classNames({
                "p-invalid": hasExternalError,
              })}
              locale="pt"
              showIcon
              showOnFocus={true}
              placeholder={placeholder}
              dateFormat={dateFormat}
              mask={mask}
              view={view}
              pt={{ input: { root: { name: inputId, "data-testid": inputId, autoComplete } } }}
              aria-invalid={hasExternalError || undefined}
              aria-describedby={hasExternalError ? errorId : undefined}
            />
            {ensureErrorNodeId(externalError, errorId)}
          </div>
        </RotuloSeplag>
      </Fieldset>
    );
  }

  return (
    <Fieldset className="col col-sm-auto mx-2 mb-2">
      <Controller
        name={name}
        control={control}
        rules={resolvedRules}
        shouldUnregister={shouldUnregister}
        render={({ field, fieldState }) => {
          const externalError = getFormErrorMessage?.(field.name);
          const hasExternalError = Boolean(externalError);
          const internalError = fieldState.error?.message;
          let errorNode: ReactNode = null;

          if (hasExternalError) {
            errorNode = ensureErrorNodeId(externalError, errorId);
          } else if (internalError) {
            errorNode = (
              <small id={errorId} className="p-error">
                {internalError}
              </small>
            );
          }

          return (
            <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
              <div className="flex flex-column">
                <Calendar
                  id={field.name}
                  inputId={field.name}
                  value={stringToDateSeplag(field.value)}
                  onChange={(e) =>
                    field.onChange(e.value ? formatDateToStringSeplag(e.value) : undefined)
                  }
                  className={classNames({
                    "p-invalid": fieldState.error || hasExternalError,
                  })}
                  locale="pt"
                  showIcon
                  showOnFocus={true}
                  placeholder={placeholder}
                  dateFormat={dateFormat}
                  mask={mask}
                  disabled={disabled}
                  view={view}
                  pt={{
                    input: { root: { name: field.name, "data-testid": field.name, autoComplete } },
                  }}
                  aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                  aria-describedby={errorNode ? errorId : undefined}
                />
                {errorNode}
              </div>
            </RotuloSeplag>
          );
        }}
      />
    </Fieldset>
  );
}

export default FieldsetDateFieldSeplag;
