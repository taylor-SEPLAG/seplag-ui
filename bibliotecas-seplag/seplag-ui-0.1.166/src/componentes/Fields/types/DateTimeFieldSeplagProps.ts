import type React from "react";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";

export interface DateTimeFieldSeplagProps<T extends FieldValues = FieldValues> {
   name?: Path<T>;
   control?: Control<T>;
   label?: string;
   cols?: string;
   required?: boolean;
   disabled?: boolean;
   visible?: boolean;

   getFormErrorMessage?: (name: string) => React.ReactNode;
   rules?: RegisterOptions<T, Path<T>>;
   shouldUnregister?: boolean;
   placeholder?: string;
   ariaLabel?: string;
   className?: string;
   inputId?: string;
   maxDate?: Date;
   minDate?: Date;
   mask?: string;
   customValidation?: RegisterOptions<T, Path<T>>["validate"];
   value?: string;
   appendTo?: "self" | HTMLElement | null;
   onChange?: (value: string) => void;
   autoComplete?: string;
}

