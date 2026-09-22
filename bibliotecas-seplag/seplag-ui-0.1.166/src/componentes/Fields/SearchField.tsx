import { AutoComplete } from "primereact/autocomplete";
import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { SearchFieldSeplagProps, SuggestionSeplag } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

export function SearchFieldSeplag<TForm extends FieldValues = any, TItem = any>(
  props: Readonly<SearchFieldSeplagProps<TForm, TItem>>,
) {
  const {
    visible = true,
    name,
    required = false,
    disabled = false,
    control,
    fieldLabel = undefined,
    placeholder = "",
    label = "",
    cols = "12 6",
    items = [] as SuggestionSeplag<TItem>[],
    minLength = 3,
    maxLength,
    search,
    getFormErrorMessage,
    itemTemplate,
    onSelect,
    forceSelection = false,
    loading = false,
    rules,
    value,
    onChange,
    autoComplete,
  } = props;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const resolvedRules = resolveFieldRules<TForm>(label, required, rules);
  const isObrigatorio = isFieldObrigatorio<TForm>(required, resolvedRules);

  const sharedProps = {
    className: "w-full",
    inputClassName: "w-full",
    showEmptyMessage: true,
    emptyMessage: loading ? "Carregando..." : "Nenhum registro localizado",
    disabled,
    placeholder,
    field: fieldLabel,
    suggestions: items,
    minLength,
    maxLength,
    itemTemplate,
    completeMethod: (e: { query: string }) => search?.(e.query),
    delay: 300,
    forceSelection,
    pt: { input: { root: { autoComplete } } },
  } as const;

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    return (
      <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column">
          <AutoComplete
            {...sharedProps}
            id={inputId}
            name={inputId}
            data-testid={inputId}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            className={classNames("w-full", { "p-invalid": hasExternalError })}
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
              <AutoComplete
                {...sharedProps}
                id={field.name}
                name={field.name}
                data-testid={field.name}
                value={field.value || ""}
                ref={field.ref}
                onChange={(e) => field.onChange(e.target.value)}
                onSelect={(e) => onSelect?.(e.value)}
                className={classNames("w-full", {
                  "p-invalid": fieldState.error || hasExternalError,
                })}
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

export default SearchFieldSeplag;
