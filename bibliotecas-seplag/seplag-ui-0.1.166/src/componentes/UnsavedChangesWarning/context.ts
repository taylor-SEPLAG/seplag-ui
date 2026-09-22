import { createContext } from "react";
import type { UnsavedChangesContextValueSeplag } from "./types";

export const UnsavedChangesContextSeplag = createContext<UnsavedChangesContextValueSeplag | null>(
  null,
);
