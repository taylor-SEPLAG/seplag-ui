import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { RadioButton } from "primereact/radiobutton";
import type { RadioButtonFieldSeplagProps } from "./types";
import React from "react";
import "./RadioButtonField.css";

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
    variant = "inline",
    getFormErrorMessage,
  } = props;

  if (!visible) return null;

  return (
    <RotuloSeplag nome={label} cols={cols} obrigatorio={required}>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} é obrigatório` } : undefined}
        render={({ field }) => (
          <div className="flex flex-column">
            <div
              className={
                variant === "cards"
                  ? "seplag-radio-card-group"
                  : "flex justify-content-start"
              }
              style={{ minHeight: "39px" }}
            >
              {options.map((option, index) => {
                const inputId = `${field.name}_${index}`;
                const checked = field.value === option.value;
                if (variant === "cards") {
                  return (
                    <label
                      key={option.value}
                      htmlFor={inputId}
                      className={`seplag-radio-card${checked ? " is-selected" : ""}${disabled || option.disabled ? " is-disabled" : ""}`}
                    >
                      <RadioButton
                        inputId={inputId}
                        {...field}
                        inputRef={field.ref}
                        value={option.value}
                        checked={checked}
                        disabled={disabled || option.disabled}
                      />
                      {option.icon && (
                        <i className={option.icon} aria-hidden="true" />
                      )}
                      <span>
                        <strong>{option.label}</strong>
                        {option.description && (
                          <small>{option.description}</small>
                        )}
                      </span>
                    </label>
                  );
                }
                return (
                  <React.Fragment key={option.value}>
                    <RadioButton
                      inputId={inputId}
                      {...field}
                      inputRef={field.ref}
                      value={option.value}
                      checked={checked}
                      disabled={disabled || option.disabled}
                    />
                    <label htmlFor={inputId} className="ml-1 mr-3">
                      {option.label}
                    </label>
                  </React.Fragment>
                );
              })}
            </div>
            {getFormErrorMessage(field.name)}
          </div>
        )}
      />
    </RotuloSeplag>
  );
}

export default RadioButtonFieldSeplag;
