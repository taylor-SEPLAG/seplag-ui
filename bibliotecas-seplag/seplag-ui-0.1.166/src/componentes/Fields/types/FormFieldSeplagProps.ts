import type { FieldValues, Path, Control } from "react-hook-form";
import type React from "react";

export interface FormFieldSeplagProps<T extends FieldValues = any> {
  readonly name: Path<T>;
  readonly control: Control<T>;
  readonly label?: string;
  readonly cols?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly visible?: boolean;
  readonly getFormErrorMessage: (name: string) => React.ReactNode;
}
