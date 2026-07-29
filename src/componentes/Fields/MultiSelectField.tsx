import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import type { MultiSelectFieldSeplagProps } from "./types";
import { MultiSelect } from "primereact/multiselect";
export function MultiSelectFieldSeplag<T extends FieldValues = any>(
  props: Readonly<MultiSelectFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12 4",
    options,
    optionValue,
    optionLabel,
    isLoading = false,
    dataKey = "id",
    placeholder = "Selecione...",
    display = "comma",
    maxSelectedLabels = 3,
    selectedItemsLabel,
    readOnly = false,
    onChange,
    getFormErrorMessage,
  } = props;

  if (!visible) return null;

  const effectiveDisplay = readOnly ? "comma" : display;

  return (
    <RotuloSeplag nome={label} cols={cols} obrigatorio={required}>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} é obrigatório` } : undefined}
        render={({ field, fieldState }) => (
          <div className="flex flex-column">
            <MultiSelect
              dataKey={dataKey}
              id={field.name}
              value={field.value}
              options={options}
              filter
              optionValue={optionValue}
              optionLabel={optionLabel}
              className={classNames({ "p-invalid": fieldState.error })}
              onChange={(e) => {
                if (readOnly) return;
                field.onChange(e.target.value);
                onChange?.(e.target.value);
              }}
              optionDisabled={readOnly ? () => true : undefined}
              disabled={disabled}
              loading={isLoading}
              placeholder={placeholder}
              display={effectiveDisplay}
              maxSelectedLabels={maxSelectedLabels}
              selectedItemsLabel={selectedItemsLabel}
            />
            {getFormErrorMessage(field.name)}
          </div>
        )}
      />
    </RotuloSeplag>
  );
}

export default MultiSelectFieldSeplag;
