import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import type { CSSProperties } from "react";

export interface CheckboxFieldSeplagProps<T extends FieldValues = any> {
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
  readonly defaultValue?: string;
  readonly checkboxLabel: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly checkedValue?: string;
  readonly uncheckedValue?: string;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
}
