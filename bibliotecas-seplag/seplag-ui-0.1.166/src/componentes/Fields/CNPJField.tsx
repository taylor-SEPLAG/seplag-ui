import { InputMask } from "primereact/inputmask";
import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import { validacaoCNPJSeplag } from "../../uteis";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { CNPJFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

export function CNPJFieldSeplag<T extends FieldValues = any>(
  props: Readonly<CNPJFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "CNPJ",
    cols = "12 6",
    getFormErrorMessage,
    onBlur,
    validarCNPJ = true,
    rules,
    value,
    onChange,
    autoComplete,
  } = props;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const buildCNPJRules = () => ({
    ...(required ? { required: `${label} é obrigatório` } : {}),
    ...(validarCNPJ ? { validate: validacaoCNPJSeplag(label) } : {}),
  });

  const resolvedRules = rules ? resolveFieldRules<T>(label, required, rules) : buildCNPJRules();

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
            mask="**.***.***/****-99"
            placeholder="00.000.000/0000-00"
            value={value}
            onChange={(e) => onChange?.(e.target.value || "")}
            disabled={disabled}
            autoComplete={autoComplete}
            autoClear={false}
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

          return (
            <div className="flex flex-column">
              <InputMask
                id={field.name}
                name={field.name}
                data-testid={field.name}
                mask="**.***.***/****-99"
                value={field.value}
                placeholder="00.000.000/0000-00"
                className={classNames({
                  "p-invalid": fieldState.error || hasExternalError,
                })}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={onBlur}
                disabled={disabled}
                autoComplete={autoComplete}
                autoClear={false}
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

export default CNPJFieldSeplag;
