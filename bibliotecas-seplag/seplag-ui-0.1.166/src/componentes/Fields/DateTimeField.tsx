import { Calendar } from "primereact/calendar";
import { classNames } from "primereact/utils";
import { useId, type FormEvent as ReactFormEvent } from "react";
import { Controller, type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import "./DateTimeField.css";
import {
  DATE_TIME_FIELD_MASK_SEPLAG,
  cleanDateTimeMaskedValueSeplag,
  formatDateTimeFieldValueSeplag,
  isDateTimeInputTypingEventSeplag,
  parseDateTimeFieldValueSeplag,
  type DateTimeCalendarChangeEventSeplag,
} from "./DateTimeFieldUtils";
import { FieldError } from "./FieldError";
import type { DateTimeFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

function DateTimeFieldSeplagComponent<T extends FieldValues = FieldValues>(
  props: Readonly<DateTimeFieldSeplagProps<T>>,
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
    placeholder = "DD/MM/AAAA HH:mm",
    ariaLabel,
    mask = DATE_TIME_FIELD_MASK_SEPLAG,
    customValidation,
    rules,
    value,
    appendTo: appendToProp,
    className,
    inputId: inputIdProp,
    maxDate,
    minDate,
    onChange,
    autoComplete = "off",
  } = props;

  // Padrão sempre portalado para document.body: qualquer ancestral com overflow/position
  // restrito (cards, seções de formulário, containers com scroll) recorta ou some com o painel
  // quando ele é ancorado ao próprio campo ("self").
  const appendTo = appendToProp === undefined ? document.body : appendToProp;

  if (!visible) return null;

  const generatedInputId = useId();
  const inputId = inputIdProp ?? (name ? String(name) : generatedInputId);
  const errorId = `${inputId}-error`;

  const buildDateTimeRules = (): RegisterOptions<T, Path<T>> => {
    const dateTimeRules: RegisterOptions<T, Path<T>> = {
      required: {
        message: `${label} \u00e9 obrigat\u00f3rio`,
        value: required,
      },
    };

    if (customValidation) {
      dateTimeRules.validate = customValidation;
    }

    return dateTimeRules;
  };

  const resolvedRules = rules ? resolveFieldRules<T>(label, required, rules) : buildDateTimeRules();
  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);

  const resolveNextValue = (event: DateTimeCalendarChangeEventSeplag) => {
    if (event.value instanceof Date && !isDateTimeInputTypingEventSeplag(event)) {
      return formatDateTimeFieldValueSeplag(event.value);
    }

    if (typeof event.value === "string") {
      return cleanDateTimeMaskedValueSeplag(event.value);
    }

    return undefined;
  };

  if (!control || !name) {
    const externalError = name ? getFormErrorMessage?.(name) : undefined;
    const hasExternalError = Boolean(externalError);

    const handleInput = (event: ReactFormEvent<HTMLInputElement>) => {
      onChange?.(cleanDateTimeMaskedValueSeplag(event.currentTarget.value));
    };

    const handleChange = (event: DateTimeCalendarChangeEventSeplag) => {
      const nextValue = resolveNextValue(event);

      if (nextValue !== undefined) {
        onChange?.(nextValue);
      }
    };

    const calendar = (
      <Calendar
        id={inputId}
        inputId={inputId}
        value={parseDateTimeFieldValueSeplag(value ?? null)}
        placeholder={placeholder}
        dateFormat="dd/mm/yy"
        hourFormat="24"
        locale="pt"
        mask={mask}
        maskSlotChar="_"
        keepInvalid
        appendTo={appendTo}
        touchUI={false}
        showButtonBar
        showIcon
        showOnFocus
        showTime
        disabled={disabled}
        className={classNames("seplag-date-time-field", className, {
          "p-invalid": hasExternalError,
        })}
        panelClassName="seplag-date-time-panel"
        maxDate={maxDate ?? undefined}
        minDate={minDate ?? undefined}
        pt={{ input: { root: { name: inputId, "data-testid": inputId, autoComplete } } }}
        aria-label={ariaLabel}
        aria-invalid={hasExternalError || undefined}
        aria-describedby={hasExternalError ? errorId : undefined}
        onChange={handleChange}
        onInput={handleInput}
      />
    );

    if (!label && !name && !required && !externalError) {
      return calendar;
    }

    return (
      <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column">
          {calendar}
          <FieldError id={errorId}>{ensureErrorNodeId(externalError, errorId)}</FieldError>
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={resolvedRules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => {
        const externalError = getFormErrorMessage?.(field.name);
        const hasExternalError = Boolean(externalError);
        const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

        const handleInput = (event: ReactFormEvent<HTMLInputElement>) => {
          field.onChange(cleanDateTimeMaskedValueSeplag(event.currentTarget.value));
        };

        const handleChange = (event: DateTimeCalendarChangeEventSeplag) => {
          const nextValue = resolveNextValue(event);

          if (nextValue !== undefined) {
            field.onChange(nextValue);
          }
        };

        return (
          <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
            <div className="flex flex-column">
              <Calendar
                id={field.name}
                inputId={field.name}
                value={parseDateTimeFieldValueSeplag(field.value)}
                placeholder={placeholder}
                dateFormat="dd/mm/yy"
                hourFormat="24"
                locale="pt"
                mask={mask}
                maskSlotChar="_"
                keepInvalid
                appendTo={appendTo}
                touchUI={false}
                showButtonBar
                showIcon
                showOnFocus
                showTime
                disabled={disabled}
                className={classNames("seplag-date-time-field", className, {
                  "p-invalid": !!fieldState.error || hasExternalError,
                })}
                panelClassName="seplag-date-time-panel"
                maxDate={maxDate ?? undefined}
                minDate={minDate ?? undefined}
                pt={{
                  input: { root: { name: field.name, "data-testid": field.name, autoComplete } },
                }}
                aria-label={ariaLabel}
                aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                aria-describedby={errorMessage ? errorId : undefined}
                onChange={handleChange}
                onInput={handleInput}
              />
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          </RotuloSeplag>
        );
      }}
    />
  );
}

type DateTimeFieldSeplagComponentType = typeof DateTimeFieldSeplagComponent & {
  parseValue: typeof parseDateTimeFieldValueSeplag;
  formatValue: typeof formatDateTimeFieldValueSeplag;
};

// eslint-disable-next-line react-refresh/only-export-components -- expose date helpers on the field component API.
export const DateTimeFieldSeplag = Object.assign(DateTimeFieldSeplagComponent, {
  parseValue: parseDateTimeFieldValueSeplag,
  formatValue: formatDateTimeFieldValueSeplag,
}) as DateTimeFieldSeplagComponentType;

export default DateTimeFieldSeplag;
