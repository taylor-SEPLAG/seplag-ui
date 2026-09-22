import { InputSwitch } from "primereact/inputswitch";
import { useState } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { SwitchFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

export function SwitchFieldSeplag<T extends FieldValues = any>(
  props: Readonly<SwitchFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12 6",
    horizontal = false,
    getFormErrorMessage,
    textTooltip,
    rules,
    value,
    onChange,
  } = props;

  const [localChecked, setLocalChecked] = useState(false);

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const resolvedRules = resolveFieldRules<T>(label, required, rules);
  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    return (
      <RotuloSeplag
        nome={label}
        cols={cols}
        obrigatorio={isObrigatorio}
        horizontal={horizontal}
        htmlFor={inputId}
      >
        <div className="flex flex-column">
          <InputSwitch
            id={inputId}
            inputId={inputId}
            name={inputId}
            data-testid={inputId}
            checked={value === undefined ? localChecked : value === "S"}
            onChange={(e) => {
              setLocalChecked(e.value);
              onChange?.(e.value ? "S" : "N");
            }}
            disabled={disabled}
            tooltip={textTooltip}
            aria-invalid={hasExternalError || undefined}
            aria-describedby={hasExternalError ? errorId : undefined}
          />
          {ensureErrorNodeId(externalError, errorId)}
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={resolvedRules}
      render={({ field, fieldState }) => {
        const externalError = getFormErrorMessage?.(field.name);
        const hasExternalError = Boolean(externalError);
        const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

        return (
          <RotuloSeplag
            nome={label}
            cols={cols}
            obrigatorio={isObrigatorio}
            horizontal={horizontal}
            htmlFor={field.name}
          >
            <div className="flex flex-column">
              <InputSwitch
                id={field.name}
                inputId={field.name}
                name={field.name}
                data-testid={field.name}
                checked={field.value === "S"}
                onChange={(e) => field.onChange(e.value ? "S" : "N")}
                disabled={disabled}
                tooltip={textTooltip}
                aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                aria-describedby={errorMessage ? errorId : undefined}
              />
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          </RotuloSeplag>
        );
      }}
    />
  );
}

export default SwitchFieldSeplag;
