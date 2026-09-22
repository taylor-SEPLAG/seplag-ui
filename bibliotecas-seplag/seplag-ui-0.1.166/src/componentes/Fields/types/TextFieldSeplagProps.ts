import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import type { FormFieldSeplagProps } from "./FormFieldSeplagProps";

export interface TextFieldSeplagProps<T extends FieldValues = any> extends Omit<
  FormFieldSeplagProps<T>,
  "control" | "getFormErrorMessage"
> {
  readonly name: Path<T>;
  readonly control?: Control<T>;
  /**
   * @deprecated Use react-hook-form error handling (`fieldState.error`) or
   * `rules` instead.
   * Quando retornar um nó válido, ele tem prioridade sobre o erro interno do
   * react-hook-form. Retorne null/undefined/false para usar as mensagens
   * internas enquanto migra.
   */
  readonly getFormErrorMessage?: (name: string) => React.ReactNode;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly placeholder?: string;
  readonly icon?: string;
  readonly maxLength?: number;
  readonly noSpaces?: boolean;
  readonly allowMoreThanOneSpace?: boolean;
  readonly allowNumberLetter?: boolean;
  readonly autoTrimOnBlur?: boolean;
  readonly numbersOnly?: boolean;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly autoComplete?: string;
}
