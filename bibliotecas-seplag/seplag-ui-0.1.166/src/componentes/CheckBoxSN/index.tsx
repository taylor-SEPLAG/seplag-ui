import { Checkbox, type CheckboxChangeEvent } from "primereact/checkbox";
import type { CSSProperties } from "react";
import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { CheckboxSNValorSeplag } from "./values";

export interface CheckboxSNSeplagProps<T extends FieldValues = any> {
  name: Path<T>;
  control?: Control<T>;
  label: string;
  rules?: RegisterOptions<T, Path<T>>;
  inputId?: string;
  isDisabled?: boolean;
  className?: string;
  style?: CSSProperties;
  checkedValue?: string;
  uncheckedValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  /**
   * @deprecated Use react-hook-form error handling (`fieldState.error`) ou `rules` instead.
   */
  getFormErrorMessage?: (name: string) => React.ReactNode;
}

export const CheckboxSNSeplag = <T extends FieldValues = any>({
  name,
  control,
  label,
  rules,
  inputId,
  isDisabled = false,
  className,
  style,
  checkedValue = CheckboxSNValorSeplag.SIM,
  uncheckedValue = CheckboxSNValorSeplag.NAO,
  value: externalValue,
  onChange: externalOnChange,
}: CheckboxSNSeplagProps<T>) => {
  const [internalValue, setInternalValue] = useState(externalValue ?? uncheckedValue);

  if (!control) {
    const id = inputId ?? String(name);
    const checked = (externalValue ?? internalValue) === checkedValue;

    const handleChange = (e: CheckboxChangeEvent) => {
      const newValue = e.checked ? checkedValue : uncheckedValue;
      setInternalValue(newValue);
      externalOnChange?.(newValue);
    };

    return (
      <div className={className} style={style}>
        <Checkbox
          id={id}
          inputId={id}
          name={id}
          data-testid={id}
          checked={checked}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <label htmlFor={id} style={{ marginLeft: 8 }}>
          {label}
        </label>
      </div>
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const { value, onChange, name: fieldName, ...restField } = field as any;
        const id = inputId ?? String(fieldName);
        const checked = value === checkedValue;

        const handleChange = (e: CheckboxChangeEvent) => {
          onChange(e.checked ? checkedValue : uncheckedValue);
        };

        return (
          <div className={className} style={style}>
            <Checkbox
              id={id}
              inputId={id}
              data-testid={id}
              checked={checked}
              onChange={handleChange}
              disabled={isDisabled}
              {...restField}
            />
            <label htmlFor={id} style={{ marginLeft: 8 }}>
              {label}
            </label>
          </div>
        );
      }}
    />
  );
};
