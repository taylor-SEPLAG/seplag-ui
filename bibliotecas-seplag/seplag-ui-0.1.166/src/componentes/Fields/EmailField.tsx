import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { EmailFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  mergeConstraintRules,
  resolveFieldRules,
  type FieldRules,
} from "./utils/resolveFieldRules";

export function EmailFieldSeplag<T extends FieldValues = any>(
  props: Readonly<EmailFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "E-mail",
    cols = "12 6",
    getFormErrorMessage,
    placeholder = "Digite o e-mail",
    maxLength = 100,
    autoTrimOnBlur = true,
    rules,
    value,
    onChange,
    autoComplete,
  } = props;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const buildEmailRules = (): FieldRules<T> => ({
    ...(required ? { required: `${label} é obrigatório` } : {}),
    validate: (value: any) => {
      const email = typeof value === "string" ? value.trim() : "";
      if (!email) {
        return required ? `${label} é obrigatório` : true;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return `${label} inválido`;
      }
      return true;
    },
  });

  const resolvedRules = rules
    ? resolveFieldRules<T>(label, required, mergeConstraintRules({ maxLength }, rules))
    : mergeConstraintRules<T>({ maxLength }, buildEmailRules());
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
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            autoComplete={autoComplete}
            style={{ height: "40px" }}
            className={classNames({
              "p-invalid": hasExternalError,
            })}
            aria-invalid={hasExternalError || undefined}
            aria-describedby={hasExternalError ? errorId : undefined}
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

          const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let value = e.target.value;
            value = value.replaceAll(/\s/g, "");
            field.onChange(value);
          };

          const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (autoTrimOnBlur) {
              field.onChange(e.target.value.trim());
            }
            field.onBlur();
          };

          return (
            <div className="flex flex-column">
              <InputText
                id={field.name}
                name={field.name}
                data-testid={field.name}
                value={field.value ?? ""}
                className={classNames({
                  "p-invalid": fieldState.error || hasExternalError,
                })}
                onChange={handleOnChange}
                onBlur={handleOnBlur}
                disabled={disabled}
                placeholder={placeholder}
                maxLength={maxLength}
                autoComplete={autoComplete}
                style={{ height: "40px" }}
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

export default EmailFieldSeplag;
