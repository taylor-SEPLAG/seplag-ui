import { Checkbox } from "primereact/checkbox";
import React from "react";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { CheckboxListSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

function toggleValue(valores: any[], valor: any, checked: boolean): any[] {
  if (checked) {
    return valores.includes(valor) ? valores : [...valores, valor];
  }

  return valores.filter((item) => item !== valor);
}

export function CheckboxListSeplag<T extends FieldValues = any>(
  props: Readonly<CheckboxListSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12",
    options,
    optionLabel,
    optionValue,
    className,
    style,
    rules,
    getFormErrorMessage,
    value,
    onChange,
  } = props;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const resolvedRules = resolveFieldRules<T>(label, required, rules);
  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);
    const valoresAtuais = value ?? [];

    return (
      <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column">
          <div className={className} style={style}>
            {options.map((option, index) => {
              const optValue = option[optionValue];
              const optionId = `${inputId}_${index}`;
              return (
                <React.Fragment key={optValue}>
                  <Checkbox
                    id={optionId}
                    inputId={optionId}
                    name={optionId}
                    data-testid={optionId}
                    checked={valoresAtuais.includes(optValue)}
                    onChange={(e) =>
                      onChange?.(toggleValue(valoresAtuais, optValue, Boolean(e.checked)))
                    }
                    disabled={disabled}
                    aria-invalid={hasExternalError || undefined}
                    aria-describedby={hasExternalError ? errorId : undefined}
                  />
                  <label htmlFor={optionId} className="ml-1 mr-3">
                    {option[optionLabel]}
                  </label>
                </React.Fragment>
              );
            })}
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
        defaultValue={[] as any}
        rules={resolvedRules}
        render={({ field, fieldState }) => {
          const valoresAtuais: any[] = field.value ?? [];

          const externalError = getFormErrorMessage?.(field.name);
          const hasExternalError = Boolean(externalError);
          const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

          return (
            <div className="flex flex-column">
              <div className={className} style={style}>
                {options.map((option, index) => {
                  const optValue = option[optionValue];
                  const optionId = `${field.name}_${index}`;
                  return (
                    <React.Fragment key={optValue}>
                      <Checkbox
                        id={optionId}
                        inputId={optionId}
                        name={optionId}
                        data-testid={optionId}
                        inputRef={index === 0 ? field.ref : undefined}
                        checked={valoresAtuais.includes(optValue)}
                        onChange={(e) =>
                          field.onChange(toggleValue(valoresAtuais, optValue, Boolean(e.checked)))
                        }
                        disabled={disabled}
                        aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                        aria-describedby={errorMessage ? errorId : undefined}
                      />
                      <label htmlFor={optionId} className="ml-1 mr-3">
                        {option[optionLabel]}
                      </label>
                    </React.Fragment>
                  );
                })}
              </div>
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default CheckboxListSeplag;
