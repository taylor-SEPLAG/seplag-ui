import { Calendar } from "primereact/calendar";
import { classNames } from "primereact/utils";
import { Controller, type FieldValues } from "react-hook-form";
import {
  formatDateToStringSeplag,
  isDateBeforeSeplag,
  stringToDateSeplag,
} from "../../uteis/manipulaData";
import RotuloSeplag from "../Rotulo";
import "./DateField.css";
import { FieldError } from "./FieldError";
import type { DateFieldSeplagProps } from "./types";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

const DATA_COMPLETA = /^\d{2}\/\d{2}\/\d{4}$/;

/**
 * O Calendar aplica `minDate`/`maxDate` também no que é digitado: `updateValueOnInput` só chama
 * `updateModel` quando `isValidSelection` passa, e o blur repinta o input a partir do modelo.
 * Sem isto, digitar uma data fora do intervalo devolve o campo ao valor anterior em silêncio —
 * sem mensagem, sem o valor chegar ao formulário e, portanto, sem chegar às validações nem ao
 * backend. Como o `onInput` é chamado antes desse descarte, gravamos o valor daqui e os limites
 * passam a valer só para a seleção no calendário.
 */
function comprometerValorDigitado(bruto: string, gravar: (valor?: string) => void) {
  if (!DATA_COMPLETA.test(bruto)) return; // máscara ainda incompleta
  if (!stringToDateSeplag(bruto)) return; // data impossível (ex.: 31/02)
  gravar(bruto);
}

function forcePanelDown(input: HTMLElement | null, panelId: string) {
  if (!input) return;
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const wrapper = input.closest(".p-calendar");
  const isPortalled = !wrapper?.contains(panel);

  if (isPortalled) {
    const rect = input.getBoundingClientRect();
    panel.style.position = "fixed";
    panel.style.top = `${rect.bottom}px`;
    panel.style.left = `${rect.left}px`;
    panel.style.bottom = "auto";
  } else {
    panel.style.top = `${input.offsetHeight}px`;
    panel.style.bottom = "auto";
  }
  panel.style.transformOrigin = "top";
  panel.classList.add("seplag-calendar-panel-ready");
}

export function DateFieldSeplag<T extends FieldValues = any>(
  props: Readonly<DateFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12 6 3",
    getFormErrorMessage,
    shouldUnregister,
    placeholder = "dd/mm/aaaa",
    dateFormat = "dd/mm/yy",
    mask = "99/99/9999",
    view = "date",
    customValidation,
    validateAfterDate,
    validateAfterMessage,
    maxDate,
    minDate,
    validateStartDate,
    validateStartMessage,
    rules,
    value,
    appendTo: appendToProp,
    onChange,
    autoComplete = "off",
  } = props;

  // Padrão sempre portalado para document.body: qualquer ancestral com overflow/position
  // restrito (cards, seções de formulário, containers com scroll) recorta ou some com o painel
  // quando ele é ancorado ao próprio campo ("self").
  const appendTo = appendToProp === undefined ? document.body : appendToProp;

  if (!visible) return null;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const buildDateRules = () => {
    return {
      required: {
        message: `${label} é obrigatório`,
        value: required,
      },
      validate: {
        ...(typeof customValidation === "function"
          ? { custom: customValidation }
          : (customValidation ?? {})),
        afterDate: (value: any) => {
          if (!value || !validateAfterDate) return true;
          return (
            !isDateBeforeSeplag(value, validateAfterDate) ||
            validateAfterMessage ||
            "Data não pode ser anterior à data inicial"
          );
        },
        startDateRequired: (value: any) => {
          if (Object.hasOwn(props, "validateStartDate") && value && !validateStartDate)
            return validateStartMessage || "Informe a data Inicial";
          return true;
        },
      },
    };
  };

  const resolvedRules = rules ? resolveFieldRules<T>(label, required, rules) : buildDateRules();

  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    return (
      <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column">
          <Calendar
            id={inputId}
            inputId={inputId}
            value={stringToDateSeplag(value ?? null)}
            onChange={(e) =>
              onChange?.(e.value ? (formatDateToStringSeplag(e.value) ?? undefined) : undefined)
            }
            onInput={(e) =>
              comprometerValorDigitado(e.currentTarget.value, (valor) => onChange?.(valor))
            }
            disabled={disabled}
            className={classNames({
              "p-invalid": hasExternalError,
            })}
            locale="pt"
            showIcon
            showOnFocus={true}
            placeholder={placeholder}
            dateFormat={dateFormat}
            mask={mask}
            view={view}
            appendTo={appendTo}
            panelClassName="seplag-calendar-panel"
            maxDate={maxDate ?? undefined}
            minDate={minDate ?? undefined}
            onShow={() => forcePanelDown(document.getElementById(inputId), `${inputId}-panel`)}
            pt={{
              input: { root: { name: inputId, "data-testid": inputId, autoComplete } },
              panel: { id: `${inputId}-panel` },
            }}
            aria-invalid={hasExternalError || undefined}
            aria-describedby={hasExternalError ? errorId : undefined}
          />
          <FieldError id={errorId}>{ensureErrorNodeId(externalError, errorId)}</FieldError>
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={resolvedRules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => {
        const externalError = getFormErrorMessage?.(field.name);
        const hasExternalError = Boolean(externalError);
        const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

        return (
          <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
            <div className="flex flex-column">
              <Calendar
                id={field.name}
                inputId={field.name}
                value={stringToDateSeplag(field.value)}
                onChange={(e) =>
                  field.onChange(
                    e.value ? (formatDateToStringSeplag(e.value) ?? undefined) : undefined,
                  )
                }
                onInput={(e) => comprometerValorDigitado(e.currentTarget.value, field.onChange)}
                className={classNames({
                  "p-invalid": !!fieldState.error || hasExternalError,
                })}
                locale="pt"
                showIcon
                showOnFocus={true}
                placeholder={placeholder}
                dateFormat={dateFormat}
                mask={mask}
                disabled={disabled}
                view={view}
                appendTo={appendTo}
                panelClassName="seplag-calendar-panel"
                maxDate={maxDate ?? undefined}
                minDate={
                  validateAfterDate
                    ? (stringToDateSeplag(validateAfterDate) ?? undefined)
                    : (minDate ?? undefined)
                }
                onShow={() =>
                  forcePanelDown(document.getElementById(field.name), `${field.name}-panel`)
                }
                pt={{
                  input: { root: { name: field.name, "data-testid": field.name, autoComplete } },
                  panel: { id: `${field.name}-panel` },
                }}
                aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                aria-describedby={errorMessage ? errorId : undefined}
              />
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          </RotuloSeplag>
        );
      }}
    />
  );
}

export default DateFieldSeplag;
