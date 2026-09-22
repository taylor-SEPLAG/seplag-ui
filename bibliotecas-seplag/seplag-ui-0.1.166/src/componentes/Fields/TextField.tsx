import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { TextFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  mergeConstraintRules,
  resolveFieldRules,
} from "./utils/resolveFieldRules";
import { sanitizeTextFieldValueSeplag } from "./utils/sanitizeTextFieldValue";

/**
 * Campo de texto com suporte a validações personalizadas via `rules`.
 *
 * Compatibilidade legada: mantém prioridade para `getFormErrorMessage` quando fornecido.
 * Modo sem `control`: permite usar como input simples com sanitização.
 *
 * @example
 * // Exemplo 1: Validação simples com função
 * <TextFieldSeplag
 *   name="cpf"
 *   label="CPF"
 *   control={control}
 *   rules={{
 *     validate: (value) => {
 *       if (value && !isCPFValid(value)) return "CPF inválido";
 *       return true;
 *     },
 *   }}
 * />
 *
 * @example
 * // Exemplo 2: Múltiplas validações nomeadas
 * <TextFieldSeplag
 *   name="cnpj"
 *   label="CNPJ"
 *   control={control}
 *   rules={{
 *     required: "CNPJ é obrigatório",
 *     validate: {
 *       isValid: (value) => isCNPJValid(value) || "CNPJ inválido",
 *       isNotBlacklisted: (value) => !isBlacklisted(value) || "CNPJ bloqueado",
 *     },
 *   }}
 * />
 *
 * @example
 * // Exemplo 3: Combinar required + min/max + validação custom
 * <TextFieldSeplag
 *   name="codigo"
 *   label="Código"
 *   control={control}
 *   required
 *   rules={{
 *     minLength: { value: 5, message: "Mínimo 5 caracteres" },
 *     maxLength: { value: 20, message: "Máximo 20 caracteres" },
 *     validate: (value) =>
 *       /^[A-Z0-9]+$/.test(value) ? true : "Apenas maiúsculas e números",
 *   }}
 * />
 *
 * @example
 * // Exemplo 4: Modo sem control (input simples com sanitização)
 * <TextFieldSeplag
 *   name="telefone"
 *   label="Telefone"
 *   value={telefone}
 *   onChange={setTelefone}
 *   numbersOnly
 *   maxLength={11}
 * />
 */
export function TextFieldSeplag<T extends FieldValues = any>(
  props: Readonly<TextFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12 6",
    getFormErrorMessage,
    placeholder,
    icon,
    maxLength,
    noSpaces = false,
    allowMoreThanOneSpace = false,
    allowNumberLetter = false,
    autoTrimOnBlur = true,
    numbersOnly = false,
    value,
    onChange,
    rules,
    autoComplete,
  } = props;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const resolvedRules = resolveFieldRules<T>(
    label,
    required,
    mergeConstraintRules({ maxLength }, rules),
  );
  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);

  const sanitizeValue = (rawValue: string) =>
    sanitizeTextFieldValueSeplag(rawValue, {
      numbersOnly,
      noSpaces,
      allowMoreThanOneSpace,
      allowNumberLetter,
    });

  const renderInput = (
    inputId: string,
    inputValue: string,
    isInvalid: boolean,
    hasErrorMessage: boolean,
    errorElementId: string,
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleOnBlur: (e: React.FocusEvent<HTMLInputElement>) => void,
  ) => {
    const input = (
      <InputText
        id={inputId}
        name={inputId}
        data-testid={inputId}
        value={inputValue}
        className={classNames({ "p-invalid": isInvalid })}
        onChange={handleOnChange}
        onBlur={handleOnBlur}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={isInvalid || undefined}
        aria-describedby={hasErrorMessage ? errorElementId : undefined}
        style={{ height: "40px" }}
      />
    );

    return icon ? (
      <span className="p-input-icon-right" style={{ width: "100%" }}>
        {input}
        <i className={icon} />
      </span>
    ) : (
      input
    );
  };

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = sanitizeValue(e.target.value);
      onChange?.(sanitizedValue);
    };

    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (autoTrimOnBlur) {
        onChange?.(e.target.value.trim());
      }
    };

    return (
      <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column">
          {renderInput(
            inputId,
            value ?? "",
            hasExternalError,
            hasExternalError,
            errorId,
            handleOnChange,
            handleOnBlur,
          )}
          {ensureErrorNodeId(externalError, errorId)}
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
      <Controller
        name={name}
        control={control}
        rules={resolvedRules}
        render={({ field, fieldState }) => {
          const externalError = getFormErrorMessage?.(field.name);
          const hasExternalError = Boolean(externalError);
          const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

          const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const sanitizedValue = sanitizeValue(e.target.value);

            field.onChange(sanitizedValue);
            onChange?.(sanitizedValue);
          };

          const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            if (autoTrimOnBlur) {
              field.onChange(e.target.value.trim());
            }

            field.onBlur();
          };

          return (
            <div className="flex flex-column">
              {renderInput(
                field.name,
                value ?? field.value ?? "",
                Boolean(fieldState.error || hasExternalError),
                Boolean(errorMessage),
                errorId,
                handleOnChange,
                handleOnBlur,
              )}
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default TextFieldSeplag;
