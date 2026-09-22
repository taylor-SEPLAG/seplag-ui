import { InputNumber } from "primereact/inputnumber";
import { classNames } from "primereact/utils";
import type { KeyboardEvent } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import "./ReadOnlyField.css";
import "./SemMolduraField.css";
import type { NumberFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  mergeConstraintRules,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

export function NumberFieldSeplag<T extends FieldValues = any>(
  props: Readonly<NumberFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    readOnly = false,
    semMoldura = false,
    visible = true,
    control,
    label = "",
    cols = "12 6",
    inputStyle,
    min,
    max,
    minFractionDigits,
    maxFractionDigits,
    prefix,
    suffix,
    locale,
    mode,
    currency,
    placeholder,
    getFormErrorMessage,
    rules,
    value,
    onChange,
    autoComplete,
    maxLength,
  } = props;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const resolvedRules = resolveFieldRules<T>(
    label,
    required,
    mergeConstraintRules({ min, max }, rules),
  );
  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);

  // `disabled` prevalece: já esmaece e bloqueia por conta própria, sem precisar do readOnly.
  const somenteLeitura = readOnly && !disabled;

  // O `maxLength` do atributo HTML não barra nada aqui: o InputNumber reescreve o valor via
  // JS a cada tecla (parsing numérico próprio), então o navegador nunca aplica o limite nativo
  // do atributo. Bloqueando na captura da tecla, antes do InputNumber processar.
  const bloquearDigitoExcedente = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!maxLength) return;
    const teclasPermitidas = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Home",
      "End",
      "-",
      ",",
      ".",
    ];
    if (event.ctrlKey || event.metaKey || teclasPermitidas.includes(event.key)) return;
    const valorAtual = event.currentTarget.value.replace(/\D/g, "");
    if (valorAtual.length >= maxLength) {
      event.preventDefault();
    }
  };

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    return (
      <RotuloSeplag
        nome={label}
        cols={cols}
        obrigatorio={isObrigatorio}
        htmlFor={inputId}
        semMoldura={semMoldura}
      >
        <div className="flex flex-column">
          <InputNumber
            id={inputId}
            name={inputId}
            data-testid={inputId}
            value={value}
            onValueChange={(e) => onChange?.(e.value)}
            disabled={disabled}
            readOnly={somenteLeitura}
            useGrouping={false}
            inputStyle={{ height: "40px", ...inputStyle }}
            min={min}
            max={max}
            minFractionDigits={minFractionDigits}
            maxFractionDigits={maxFractionDigits}
            prefix={prefix}
            suffix={suffix}
            locale={locale}
            mode={mode}
            currency={currency}
            placeholder={placeholder}
            pt={{ input: { root: { autoComplete, maxLength } } }}
            onKeyDown={bloquearDigitoExcedente}
            className={classNames({
              "p-invalid": hasExternalError,
              "seplag-field-readonly": somenteLeitura,
              "seplag-field-sem-moldura": semMoldura,
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
    <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} semMoldura={semMoldura}>
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
              <InputNumber
                id={field.name}
                name={field.name}
                data-testid={field.name}
                value={field.value}
                className={classNames({
                  "p-invalid": fieldState.error || hasExternalError,
                  "seplag-field-readonly": somenteLeitura,
                  "seplag-field-sem-moldura": semMoldura,
                })}
                onChange={(e) => {
                  const novoValor = e.value ?? null;
                  if (novoValor === (field.value ?? null)) return;
                  field.onChange(novoValor);
                }}
                onValueChange={(e) => {
                  const novoValor = e.value ?? null;
                  if (novoValor === (field.value ?? null)) return;
                  field.onChange(novoValor);
                }}
                onBlur={field.onBlur}
                useGrouping={false}
                disabled={disabled}
                readOnly={somenteLeitura}
                inputStyle={{ height: "40px", ...inputStyle }}
                min={min}
                max={max}
                minFractionDigits={minFractionDigits}
                maxFractionDigits={maxFractionDigits}
                prefix={prefix}
                suffix={suffix}
                locale={locale}
                mode={mode}
                currency={currency}
                placeholder={placeholder}
                pt={{ input: { root: { autoComplete, maxLength } } }}
                onKeyDown={bloquearDigitoExcedente}
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

export default NumberFieldSeplag;
