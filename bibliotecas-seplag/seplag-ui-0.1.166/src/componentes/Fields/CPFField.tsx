import { InputMask } from "primereact/inputmask";
import { classNames } from "primereact/utils";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { BotaoIconSeplag } from "../Botao";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

interface CPFFieldSeplagProps<T extends FieldValues = any> {
  readonly name: Path<T>;
  readonly control?: Control<T>;
  readonly label?: string;
  readonly cols?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly visible?: boolean;
  /**
   * @deprecated Use react-hook-form error handling (`fieldState.error`) ou `rules` instead.
   */
  readonly getFormErrorMessage?: (name: string) => React.ReactNode;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly showIcon?: boolean;
  readonly onSearch?: (cpf: string) => void;
  readonly autoComplete?: string;
}

function cleanCpf(value: string) {
  return value.replaceAll(/\D/g, "");
}

export function CPFFieldSeplag<T extends FieldValues = any>(
  props: Readonly<CPFFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "CPF",
    cols = "12 6",
    getFormErrorMessage,
    rules,
    value,
    onChange,
    showIcon = false,
    onSearch,
    autoComplete,
  } = props;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const resolvedRules = resolveFieldRules<T>(label, required, rules);
  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);

  const searchButton = (currentValue: string) =>
    showIcon && onSearch ? (
      <BotaoIconSeplag
        type="button"
        id={`${inputId}-buscar`}
        data-testid={`${inputId}-buscar`}
        className="p-inputgroup-addon p-button-icon-only"
        icon="pi pi-search"
        onClick={() => {
          const cpf = cleanCpf(currentValue);
          if (cpf.length === 11) onSearch(cpf);
        }}
        disabled={disabled}
        style={{ cursor: "pointer" }}
      />
    ) : null;

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    return (
      <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column">
          <div className={showIcon && onSearch ? "p-inputgroup" : undefined}>
            <InputMask
              id={inputId}
              name={inputId}
              data-testid={inputId}
              mask="999.999.999-99"
              placeholder="000.000.000-00"
              value={value}
              onChange={(e) => onChange?.(e.target.value || "")}
              onComplete={(e) => onSearch?.(cleanCpf(e.value || ""))}
              disabled={disabled}
              autoComplete={autoComplete}
              className={classNames({
                "p-invalid": hasExternalError,
              })}
              aria-invalid={hasExternalError || undefined}
              aria-describedby={hasExternalError ? errorId : undefined}
            />
            {searchButton(value ?? "")}
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
              <div className={showIcon && onSearch ? "p-inputgroup" : undefined}>
                <InputMask
                  id={field.name}
                  name={field.name}
                  data-testid={field.name}
                  mask="999.999.999-99"
                  value={field.value}
                  placeholder="000.000.000-00"
                  className={classNames({
                    "p-invalid": fieldState.error || hasExternalError,
                  })}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onChange?.(cleanCpf(e.value || ""));
                  }}
                  onComplete={(e) => onSearch?.(cleanCpf(e.value || ""))}
                  disabled={disabled}
                  autoComplete={autoComplete}
                  aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                  aria-describedby={errorMessage ? errorId : undefined}
                />
                {searchButton(field.value)}
              </div>
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default CPFFieldSeplag;
