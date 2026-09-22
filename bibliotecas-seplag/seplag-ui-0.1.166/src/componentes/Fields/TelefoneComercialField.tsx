import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { TelefoneComercialFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

function formatTelefoneComercial(raw: string): string {
  const digits = (raw || "")
    .split("")
    .filter((c) => c >= "0" && c <= "9")
    .join("")
    .slice(0, 11);
  const n = digits.length;
  if (n === 0) return "";
  if (n <= 2) return `(${digits}`;
  if (n <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (n <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function TelefoneComercialFieldSeplag<T extends FieldValues = any>(
  props: Readonly<TelefoneComercialFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "Telefone Comercial",
    cols = "12 6",
    placeholder = "(99) 9999-9999",
    getFormErrorMessage,
    rules,
    value,
    onChange,
    autoComplete,
  } = props;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const resolvedRules = resolveFieldRules<T>(label, required, rules);
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
            value={formatTelefoneComercial(value ?? "")}
            placeholder={placeholder}
            className={classNames({
              "p-invalid": hasExternalError,
            })}
            disabled={disabled}
            maxLength={16}
            autoComplete={autoComplete}
            onChange={(e) => onChange?.(formatTelefoneComercial(e.target.value))}
            aria-invalid={hasExternalError || undefined}
            aria-describedby={hasExternalError ? errorId : undefined}
          />
          {ensureErrorNodeId(externalError, errorId)}
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
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
                value={formatTelefoneComercial(field.value)}
                placeholder={placeholder}
                className={classNames({
                  "p-invalid": fieldState.error || hasExternalError,
                })}
                disabled={disabled}
                maxLength={16}
                autoComplete={autoComplete}
                onChange={(e) => field.onChange(formatTelefoneComercial(e.target.value))}
                onBlur={field.onBlur}
                aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                aria-describedby={errorMessage ? errorId : undefined}
              />
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default TelefoneComercialFieldSeplag;
