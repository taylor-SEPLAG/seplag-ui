import type { FieldValues } from "react-hook-form";
import type { FormFieldSeplagProps } from "./FormFieldSeplagProps";

export interface MultiSelectFieldSeplagProps<
  T extends FieldValues = any,
> extends FormFieldSeplagProps<T> {
  readonly options: any[];
  readonly optionValue?: string;
  readonly optionLabel: string;
  readonly dataKey?: string;
  readonly isLoading?: boolean;
  readonly placeholder?: string;
  readonly display?: "chip" | "comma";
  readonly maxSelectedLabels?: number;
  readonly selectedItemsLabel?: string;
  readonly readOnly?: boolean;
  readonly onChange?: (value: any[]) => void;
}
