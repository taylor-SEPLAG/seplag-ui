import { RadioButton } from "primereact/radiobutton";
import React from "react";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { RadioButtonFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

export function RadioButtonFieldSeplag<T extends FieldValues = any>(
  props: Readonly<RadioButtonFieldSeplagProps<T>>,
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
    getFormErrorMessage,
    rules,
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

    return (
      <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column">
          <div className="flex justify-content-start" style={{ minHeight: "39px" }}>
            <div className="flex align-items-center">
              {options.map((option, index) => {
                const optionId = `${inputId}_${index}`;
                return (
                  <React.Fragment key={option.value}>
                    <RadioButton
                      id={optionId}
                      inputId={optionId}
                      name={inputId}
                      data-testid={optionId}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => onChange?.(option.value)}
                      disabled={disabled}
                      aria-invalid={hasExternalError || undefined}
                      aria-describedby={hasExternalError ? errorId : undefined}
                    />
                    <label htmlFor={optionId} className="ml-1 mr-3">
                      {option.label}
                    </label>
                  </React.Fragment>
                );
              })}
            </div>
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
        rules={resolvedRules}
        render={({ field, fieldState }) => {
          const externalError = getFormErrorMessage?.(field.name);
          const hasExternalError = Boolean(externalError);
          const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

          return (
            <div className="flex flex-column">
              <div className="flex justify-content-start" style={{ minHeight: "39px" }}>
                <div className="flex align-items-center">
                  {options.map((option, index) => {
                    const optionId = `${field.name}_${index}`;
                    return (
                      <React.Fragment key={option.value}>
                        <RadioButton
                          id={optionId}
                          inputId={optionId}
                          data-testid={optionId}
                          {...field}
                          inputRef={field.ref}
                          value={option.value}
                          checked={field.value === option.value}
                          disabled={disabled}
                          aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                          aria-describedby={errorMessage ? errorId : undefined}
                        />
                        <label htmlFor={optionId} className="ml-1 mr-3">
                          {option.label}
                        </label>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default RadioButtonFieldSeplag;
