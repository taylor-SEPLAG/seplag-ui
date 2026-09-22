import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import type { TextAreaFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  mergeConstraintRules,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

/**
 * Campo de área de texto com suporte a validações via `rules`.
 *
 * Observações:
 * - Usa internamente `resolveFieldRules` para mesclar `required` com
 *   `rules` customizadas, garantindo que a validação de obrigatório rode
 *   antes das validações customizadas.
 * - Mantém prioridade para `getFormErrorMessage` quando fornecido.
 * - Suporta modo sem `control` (uso controlado/externo via `value` + `onChange`).
 *
 * Exemplos de uso e validações:
 *
 * // Validação simples com função
 * <TextAreaFieldSeplag
 *   name="observacoes"
 *   label="Observações"
 *   control={control}
 *   rules={{
 *     validate: (value) => (value && value.length < 10) ? 'Mínimo 10 caracteres' : true,
 *   }}
 * />
 *
 * // Validações nomeadas (múltiplos validadores)
 * <TextAreaFieldSeplag
 *   name="descricao"
 *   label="Descrição"
 *   control={control}
 *   rules={{
 *     required: 'Descrição é obrigatória',
 *     validate: {
 *       notTooShort: (v) => (v && v.length >= 5) || 'Muito curto',
 *       noBadWords: (v) => !/palavr[oã]o/i.test(v) || 'Conteúdo inválido',
 *     }
 *   }}
 * />
 *
 * // Modo sem control (input simples / controlado externamente)
 * <TextAreaFieldSeplag
 *   name="obs"
 *   label="Obs"
 *   value={obs}
 *   onChange={setObs}
 *   maxLength={500}
 * />
 */

export function TextAreaFieldSeplag<T extends FieldValues = any>(
  props: Readonly<TextAreaFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12",
    getFormErrorMessage,
    rows = 4,
    placeholder,
    maxLength,
    rules,
    value,
    onChange,
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

  const renderTextarea = (
    id: string,
    textValue: string,
    isInvalid: boolean,
    errorElementId: string,
    hasErrorNode: boolean,
    handleOnChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  ) => (
    <>
      <InputTextarea
        id={id}
        name={id}
        data-testid={id}
        value={textValue}
        rows={rows}
        className={classNames("w-full", { "p-invalid": isInvalid })}
        autoResize
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={handleOnChange}
        aria-invalid={isInvalid || undefined}
        aria-describedby={hasErrorNode ? errorElementId : undefined}
      />
      {maxLength && (
        <small
          className={classNames("text-right", {
            "text-red-500": textValue.length >= maxLength,
            "text-500": textValue.length < maxLength,
          })}
        >
          {textValue.length}/{maxLength}
        </small>
      )}
    </>
  );

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <RotuloSeplag cols={cols} nome={label} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column gap-1">
          {renderTextarea(
            inputId,
            value ?? "",
            hasExternalError,
            errorId,
            hasExternalError,
            handleOnChange,
          )}
          {ensureErrorNodeId(externalError, errorId)}
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <RotuloSeplag cols={cols} nome={label} obrigatorio={isObrigatorio} htmlFor={inputId}>
      <Controller
        name={name}
        control={control}
        rules={resolvedRules}
        render={({ field, fieldState }) => {
          const externalError = getFormErrorMessage?.(field.name);
          const hasExternalError = Boolean(externalError);
          const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

          const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            field.onChange(e.target.value);
            onChange?.(e.target.value);
          };

          return (
            <div className="flex flex-column gap-1">
              {renderTextarea(
                field.name,
                value ?? field.value ?? "",
                Boolean(fieldState.error || hasExternalError),
                errorId,
                Boolean(errorMessage),
                handleOnChange,
              )}
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default TextAreaFieldSeplag;
