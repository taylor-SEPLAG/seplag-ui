import type { CSSProperties } from "react";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";

export interface CheckboxListSeplagProps<T extends FieldValues = any> {
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
  readonly options: any[];
  readonly optionLabel: string;
  readonly optionValue: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly value?: any[];
  readonly onChange?: (value: any[]) => void;
}
