import { Checkbox } from "primereact/checkbox";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { CheckboxFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

export function CheckboxFieldSeplag<T extends FieldValues = any>(
  props: Readonly<CheckboxFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    checkboxLabel,
    cols = "12",
    defaultValue = "N",
    className,
    style,
    checkedValue = "S",
    uncheckedValue = "N",
    rules,
    getFormErrorMessage,
    value,
    onChange,
  } = props as CheckboxFieldSeplagProps<T>;

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
          <div className={className} style={style}>
            <Checkbox
              id={inputId}
              inputId={inputId}
              name={inputId}
              data-testid={inputId}
              checked={(value ?? defaultValue) === checkedValue}
              onChange={(e) => onChange?.(e.checked ? checkedValue : uncheckedValue)}
              disabled={disabled}
              aria-invalid={hasExternalError || undefined}
              aria-describedby={hasExternalError ? errorId : undefined}
            />
            <label htmlFor={inputId} style={{ marginLeft: 8 }}>
              {checkboxLabel}
            </label>
          </div>
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
        defaultValue={defaultValue as any}
        rules={resolvedRules}
        render={({ field, fieldState }) => {
          const { value, onChange, name: fieldName, ...restField } = field as any;
          const id = String(fieldName);
          const checked = value === checkedValue;

          const externalError = getFormErrorMessage?.(field.name);
          const hasExternalError = Boolean(externalError);
          const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

          const handleChange = (e: any) => onChange(e.checked ? checkedValue : uncheckedValue);

          return (
            <div className="flex flex-column">
              <div className={className} style={style}>
                <Checkbox
                  id={id}
                  inputId={id}
                  data-testid={id}
                  checked={checked}
                  onChange={handleChange}
                  disabled={disabled}
                  aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                  aria-describedby={errorMessage ? errorId : undefined}
                  {...restField}
                />
                <label htmlFor={id} style={{ marginLeft: 8 }}>
                  {checkboxLabel}
                </label>
              </div>
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default CheckboxFieldSeplag;
