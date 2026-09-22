import { useId } from "react";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Tooltip } from "primereact/tooltip";
import { SEPLAG_GRAY_600, SEPLAG_INFO_BG, SEPLAG_PRIMARY_DARK, SEPLAG_WHITE } from "../../tokens/colors";
import { FieldError } from "../Fields/FieldError";
import style from "./CardRadioGroupSeplag.module.css";

export interface CardRadioGroupOptionSeplag<V extends string = string> {
  value: V;
  icon: string;
  label: string;
  descricao: string;
  tooltip?: string;
}

export interface CardRadioGroupSeplagProps<T extends FieldValues, V extends string = string> {
  name: Path<T>;
  control: Control<T>;
  options: readonly CardRadioGroupOptionSeplag<V>[];
  disabled?: boolean;
  ariaLabel?: string;
  /**
   * Classe de coluna PrimeFlex por item. Default "col-12 sm:col-6 lg:col-4":
   * 1 por linha em telas estreitas, 2 em tablets, 3 em desktop.
   */
  itemColClassName?: string;
}

/**
 * Radio-group renderizado como cards selecionáveis (ícone + título +
 * descrição), integrado ao react-hook-form via Controller. Uso: seleção de
 * uma entre N opções mutuamente exclusivas com contexto textual por opção
 * (ex: tipo de operação, categoria, modalidade).
 */
export function CardRadioGroupSeplag<T extends FieldValues, V extends string = string>({
  name,
  control,
  options,
  disabled,
  ariaLabel,
  itemColClassName = "col-12 sm:col-6 lg:col-4",
}: Readonly<CardRadioGroupSeplagProps<T, V>>) {
  const generatedId = useId();
  const groupId = `card-radio-group-${generatedId.replaceAll(":", "")}`;
  const errorId = `${groupId}-error`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div>
          <div
            className="grid"
            role="radiogroup"
            aria-label={ariaLabel}
            aria-describedby={fieldState.error ? errorId : undefined}
            data-testid={groupId}
          >
            {options.map((option) => {
              const selecionado = field.value === option.value;
              const optionId = `${groupId}-${option.value}`;

              return (
                <div key={option.value} className={itemColClassName}>
                  {option.tooltip && (
                    <Tooltip target={`#${optionId}`} content={option.tooltip} position="top" />
                  )}
                  <button
                    id={optionId}
                    data-testid={optionId}
                    type="button"
                    role="radio"
                    aria-checked={selecionado}
                    disabled={disabled}
                    onClick={() => field.onChange(option.value as PathValue<T, Path<T>>)}
                    onBlur={field.onBlur}
                    className={`${style.card} w-full h-full flex align-items-center gap-3 text-left p-3 border-1 border-round-sm`}
                    style={{
                      backgroundColor: selecionado ? SEPLAG_INFO_BG : SEPLAG_WHITE,
                      borderColor: fieldState.error
                        ? "var(--red-400)"
                        : selecionado
                          ? SEPLAG_PRIMARY_DARK
                          : "var(--surface-300)",
                      // Simula a borda de 2px do estado selecionado sem alterar o layout.
                      boxShadow: selecionado ? `0 0 0 1px ${SEPLAG_PRIMARY_DARK}` : undefined,
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    <i
                      className={`${option.icon} text-xl flex-shrink-0`}
                      style={{ color: selecionado ? SEPLAG_PRIMARY_DARK : SEPLAG_GRAY_600 }}
                      aria-hidden="true"
                    />

                    <span className="flex flex-column gap-1" style={{ minWidth: 0, overflow: "hidden" }}>
                      <strong className="text-900">{option.label}</strong>
                      <span
                        className="text-sm text-600"
                        style={{ overflowWrap: "break-word" }}
                      >
                        {option.descricao}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
          <FieldError id={errorId}>{fieldState.error?.message}</FieldError>
        </div>
      )}
    />
  );
}

export default CardRadioGroupSeplag;
