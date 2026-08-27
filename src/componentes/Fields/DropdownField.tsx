import { classNames } from "primereact/utils";
import { Dropdown } from "primereact/dropdown";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import type { DropdownFieldSeplagProps } from "./types";

export function DropdownFieldSeplag<T extends FieldValues = any>(
  props: Readonly<DropdownFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12 6",
    options,
    optionLabel,
    optionValue,
    getFormErrorMessage,
    placeholder = "Selecione...",
    isLoading = false,
    showClear = true,
    rules,
    onChange,
    defaultValue,
    filter = true,
    virtualScrollerOptions,
    optionDisabled,
    itemTemplate,
    panelClassName,
  } = props;

  if (!visible) return null;
  const safeOptions = Array.isArray(options) ? options : [];

  const resolvedRules =
    rules ?? (required ? { required: `${label} é obrigatório` } : undefined);

  const isObrigatorio =
    required ||
    Boolean(
      typeof resolvedRules?.required === "string" ||
      resolvedRules?.required === true,
    );

  return (
    <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio}>
      <Controller
        name={name}
        control={control}
        rules={resolvedRules as any}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <div className="flex flex-column">
            <Dropdown
              filter={filter}
              virtualScrollerOptions={
                virtualScrollerOptions ??
                (safeOptions.length > 50 ? { itemSize: 38 } : undefined)
              }
              id={field.name}
              value={field.value}
              options={safeOptions}
              optionLabel={optionLabel}
              optionValue={optionValue}
              optionDisabled={optionDisabled}
              itemTemplate={itemTemplate}
              className={classNames("w-full", {
                "p-invalid": fieldState.error,
              })}
              style={{ width: "100%" }}
              onChange={(e) => {
                field.onChange(e.value);
                onChange?.(e.value);
              }}
              focusInputRef={field.ref}
              placeholder={placeholder}
              disabled={disabled}
              showClear={showClear}
              loading={isLoading}
              panelClassName={panelClassName}
            />
            {getFormErrorMessage(field.name)}
          </div>
        )}
      />
    </RotuloSeplag>
  );
}

export default DropdownFieldSeplag;
