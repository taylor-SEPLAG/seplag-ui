import type React from "react";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";

export interface DateFieldSeplagProps<T extends FieldValues = any> {
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
  readonly shouldUnregister?: boolean;
  readonly placeholder?: string;
  readonly dateFormat?: string;
  readonly mask?: string;
  readonly view?: "date" | "month" | "year";
  readonly customValidation?: (value: any) => string | boolean;
  readonly validateAfterDate?: any;
  readonly validateAfterMessage?: string;
  readonly validateStartDate?: any;
  readonly validateStartMessage?: string;
  readonly maxDate?: Date;
  readonly minDate?: Date;
  readonly value?: string;
  readonly appendTo?: "self" | HTMLElement | null;
  readonly onChange?: (value: string | undefined) => void;
  readonly autoComplete?: string;
}
