import type { FieldValues, RegisterOptions } from "react-hook-form";
import type { ReactNode } from "react";
import type { FormFieldSeplagProps } from "./FormFieldSeplagProps";

export interface DropdownFieldSeplagProps<
  T extends FieldValues = any,
> extends FormFieldSeplagProps<T> {
  readonly options: any[];
  readonly optionLabel: string;
  readonly optionValue: string;
  readonly placeholder?: string;
  readonly isLoading?: boolean;
  readonly showClear?: boolean;
  readonly rules?: RegisterOptions;
  readonly onChange?: (value: any) => void;
  readonly defaultValue?: any;
  readonly filter?: boolean;
  readonly virtualScrollerOptions?: any;
  readonly optionDisabled?: string | ((option: any) => boolean);
  readonly itemTemplate?: (option: any) => ReactNode;
}
