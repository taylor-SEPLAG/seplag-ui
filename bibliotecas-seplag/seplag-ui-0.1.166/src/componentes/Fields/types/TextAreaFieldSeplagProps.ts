import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import type { FormFieldSeplagProps } from "./FormFieldSeplagProps";

export interface TextAreaFieldSeplagProps<T extends FieldValues = any> extends Omit<
  FormFieldSeplagProps<T>,
  "control" | "getFormErrorMessage"
> {
  readonly control?: Control<T>;
  readonly rows?: number;
  readonly placeholder?: string;
  readonly maxLength?: number;
  /**
   * @deprecated Use react-hook-form error handling (`fieldState.error`) or
   * `rules` instead.
   * Quando retornar um nó válido, ele tem prioridade sobre o erro interno do
   * react-hook-form. Retorne null/undefined/false para usar as mensagens
   * internas enquanto migra.
   */
  readonly getFormErrorMessage?: (name: string) => React.ReactNode;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly autoComplete?: string;
}
