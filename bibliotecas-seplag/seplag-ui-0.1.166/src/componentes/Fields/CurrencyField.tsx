import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { NumberFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  mergeConstraintRules,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

// 12 dígitos impede o estouro de precisão do JS
const MAX_DIGITS = 12;

function parseCurrencyInput(value: string): number {
  let digits = value.replaceAll(/\D/g, "");
  if (digits.length > MAX_DIGITS) {
    digits = digits.substring(0, MAX_DIGITS);
  }
  return digits ? Number.parseFloat(digits) / 100 : 0;
}

function toDisplayValue(value: number | null | undefined): string {
  if (typeof value !== "number") return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export function CurrencyFieldSeplag<T extends FieldValues = any>(
  props: Readonly<NumberFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12 6",
    inputStyle,
    max,
    getFormErrorMessage,
    rules,
    placeholder,
    value,
    onChange,
    autoComplete,
  } = props;

  // useState must be called unconditionally (Rules of Hooks)
  const [uncontrolledDisplay, setUncontrolledDisplay] = useState("R$ 0,00");

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const resolvedRules = resolveFieldRules<T>(label, required, mergeConstraintRules({ max }, rules));
  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    return (
      <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column">
          <InputText
            id={inputId}
            name={inputId}
            data-testid={inputId}
            value={
              value !== undefined && value !== null ? toDisplayValue(value) : uncontrolledDisplay
            }
            disabled={disabled}
            style={inputStyle}
            inputMode="numeric"
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={classNames("w-full", {
              "p-invalid": hasExternalError,
            })}
            aria-invalid={hasExternalError || undefined}
            aria-describedby={hasExternalError ? errorId : undefined}
            onChange={(e) => {
              const numberValue = parseCurrencyInput(e.target.value);
              if (max !== undefined && numberValue > max) return;
              if (value === undefined || value === null) {
                setUncontrolledDisplay(toDisplayValue(numberValue));
              }
              onChange?.(numberValue);
            }}
          />
          {ensureErrorNodeId(externalError, errorId)}
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio}>
      <Controller
        name={name}
        control={control}
        rules={resolvedRules}
        render={({ field, fieldState }) => {
          const externalError = getFormErrorMessage?.(field.name);
          const hasExternalError = Boolean(externalError);
          const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

          return (
            <div className="flex flex-column">
              <InputText
                id={field.name}
                name={field.name}
                data-testid={field.name}
                value={toDisplayValue(field.value)}
                className={classNames("w-full", {
                  "p-invalid": fieldState.error || hasExternalError,
                })}
                disabled={disabled}
                style={inputStyle}
                inputMode="numeric"
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                aria-describedby={errorMessage ? errorId : undefined}
                onChange={(e) => {
                  const numberValue = parseCurrencyInput(e.target.value);
                  if (max !== undefined && numberValue > max) return;
                  field.onChange(numberValue);
                }}
              />
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default CurrencyFieldSeplag;
