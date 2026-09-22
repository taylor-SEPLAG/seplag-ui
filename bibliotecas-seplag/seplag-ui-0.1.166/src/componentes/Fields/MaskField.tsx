import { InputMask } from "primereact/inputmask";
import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { MaskFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

export function MaskFieldSeplag<T extends FieldValues = any>(
  props: Readonly<MaskFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12 6",
    mask = "99/99/9999",
    placeholder = "dd/mm/yyyy",
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
          <InputMask
            id={inputId}
            name={inputId}
            data-testid={inputId}
            mask={mask}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value || "")}
            disabled={disabled}
            autoComplete={autoComplete}
            className={classNames({
              "p-invalid": hasExternalError,
            })}
            aria-invalid={hasExternalError || undefined}
            aria-describedby={hasExternalError ? errorId : undefined}
            style={{ height: "40px" }}
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
              <InputMask
                id={field.name}
                name={field.name}
                data-testid={field.name}
                mask={mask}
                value={field.value}
                placeholder={placeholder}
                className={classNames({
                  "p-invalid": fieldState.error || hasExternalError,
                })}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={disabled}
                autoComplete={autoComplete}
                aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                aria-describedby={errorMessage ? errorId : undefined}
                style={{ height: "40px" }}
              />
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default MaskFieldSeplag;
