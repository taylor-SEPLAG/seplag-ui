import type { FieldValues } from "react-hook-form";
import type { FormFieldSeplagProps } from "./FormFieldSeplagProps";
import type { RadioOptionSeplag } from "./RadioOptionSeplag";

export interface RadioButtonFieldSeplagProps<
  T extends FieldValues = any,
> extends FormFieldSeplagProps<T> {
  readonly options: RadioOptionSeplag[];
  readonly variant?: "inline" | "cards";
}
