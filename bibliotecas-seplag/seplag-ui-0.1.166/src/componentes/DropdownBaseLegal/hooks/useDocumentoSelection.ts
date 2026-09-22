import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { NormalizedDocumentoSeplag } from "../types";

interface UseDocumentoSelectionReturn {
  selected: NormalizedDocumentoSeplag[];
  setSelected: Dispatch<SetStateAction<NormalizedDocumentoSeplag[]>>;
}

export const useDocumentoSelection = (): UseDocumentoSelectionReturn => {
  const [selected, setSelected] = useState<NormalizedDocumentoSeplag[]>([]);

  return { selected, setSelected };
};
