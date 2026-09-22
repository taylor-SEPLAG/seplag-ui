import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import type { FieldValues, Path, PathValue, RegisterOptions, Validate } from "react-hook-form";

export type FieldRules<T extends FieldValues> = RegisterOptions<T, Path<T>>;
type FieldValidateFn<T extends FieldValues> = Validate<PathValue<T, Path<T>>, T>;

/**
 * Retorna uma função de validação que rejeita valores vazios/somente espaços.
 */
export function buildRequiredValidate<T extends FieldValues>(label: string): FieldValidateFn<T> {
  return (inputValue) => {
    if (inputValue == null) return `${label} é obrigatório`;
    if (typeof inputValue === "string" && !/[^\s]/.test(inputValue)) {
      return `${label} é obrigatório`;
    }
    return true;
  };
}

export interface FieldConstraints {
  maxLength?: number;
  minLength?: number;
  min?: number | string;
  max?: number | string;
}

/**
 * Injeta automaticamente regras de `maxLength`, `minLength`, `min` e `max`
 * nas rules, com mensagens padrão, sem sobrescrever regras já definidas pelo usuário.
 */
export function mergeConstraintRules<T extends FieldValues>(
  constraints: FieldConstraints,
  rules?: FieldRules<T>,
): FieldRules<T> | undefined {
  const { maxLength, minLength, min, max } = constraints;
  if (!maxLength && !minLength && min === undefined && max === undefined) return rules;

  const extra: Pick<RegisterOptions, "maxLength" | "minLength" | "min" | "max" | "validate"> = {};

  if (maxLength !== undefined && !rules?.maxLength) {
    extra.maxLength = {
      value: maxLength,
      message: `Máximo ${maxLength} caracteres`,
    };
  }
  if (minLength !== undefined && !rules?.minLength) {
    extra.minLength = {
      value: minLength,
      message: `Mínimo ${minLength} caracteres`,
    };
  }
  if (min !== undefined && !rules?.min) {
    extra.validate = {
      ...(extra.validate as object),
      min: (v) => (v == null || v >= min) || `Valor mínimo é ${min}`,
    };
  }
  if (max !== undefined && !rules?.max) {
    extra.validate = {
      ...(extra.validate as object),
      max: (v) => (v == null || v <= max) || `Valor máximo é ${max}`,
    };
  }

  return { ...extra, ...rules };
}

/**
 * Mescla as regras de `required` com as regras customizadas do campo,
 * garantindo que a validação de campo obrigatório sempre seja executada
 * antes das validações customizadas.
 *
 * @param label     Rótulo do campo, usado nas mensagens de erro.
 * @param required  Indica se o campo é obrigatório.
 * @param rules     Regras customizadas opcionais do react-hook-form.
 * @returns         Regras mescladas prontas para passar ao `Controller`.
 */
export function resolveFieldRules<T extends FieldValues>(
  label: string,
  required: boolean,
  rules?: FieldRules<T>,
): FieldRules<T> | undefined {
  const requiredValidate = buildRequiredValidate<T>(label);

  const requiredRules: FieldRules<T> | undefined = required
    ? {
        required: `${label} é obrigatório`,
        validate: requiredValidate,
      }
    : undefined;

  if (!requiredRules) return rules;
  if (!rules) return requiredRules;

  const customValidate = rules.validate;
  let mergedValidate: FieldRules<T>["validate"] = requiredValidate;

  if (typeof customValidate === "function") {
    mergedValidate = (inputValue, formValues) => {
      const baseResult = requiredValidate(inputValue, formValues);
      if (baseResult !== true) return baseResult;
      return customValidate(inputValue, formValues);
    };
  } else if (customValidate && typeof customValidate === "object") {
    const wrapped: Record<string, FieldValidateFn<T>> = {};

    for (const key of Object.keys(customValidate)) {
      const validator = customValidate[key];
      if (typeof validator === "function") {
        wrapped[key] = (inputValue, formValues) => {
          const baseResult = requiredValidate(inputValue, formValues);
          if (baseResult !== true) return baseResult;
          return validator(inputValue, formValues);
        };
      }
    }

    mergedValidate = wrapped;
  }

  return {
    ...rules,
    required: rules.required ?? requiredRules.required,
    validate: mergedValidate,
  };
}

/**
 * Determina se o campo deve ser marcado como obrigatório visualmente,
 * levando em conta tanto a prop `required` quanto as `resolvedRules`.
 */
export function isFieldObrigatorio<T extends FieldValues>(
  required: boolean,
  resolvedRules?: FieldRules<T>,
): boolean {
  return (
    required || typeof resolvedRules?.required === "string" || resolvedRules?.required === true
  );
}

/**
 * Garante que um nó de erro React tenha o atributo `id` definido.
 * Se o nó já tiver `id`, ele é retornado sem alteração.
 */
export function ensureErrorNodeId(errorNode: ReactNode, id: string): ReactNode {
  if (!errorNode || !isValidElement(errorNode)) return errorNode;
  const element = errorNode as ReactElement<{ id?: string }>;
  if (element.props.id) return element;
  return cloneElement(element, { id });
}
