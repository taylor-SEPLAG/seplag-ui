import type { DataTableStateEvent } from "primereact/datatable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Control, FieldValues, UseFormGetValues, UseFormReset } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useDebouncedValueSeplag } from "./useDebouncedValueSeplag";
import {
  clearFilterStorageSeplag,
  loadFilterStorageSeplag,
  saveFilterStorageSeplag,
} from "./useFilterStorageSeplag";

export interface UseFiltersSeplagOptions<TFilters extends FieldValues> {
  readonly control: Control<TFilters>;
  readonly getValues: UseFormGetValues<TFilters>;
  readonly reset: UseFormReset<TFilters>;
  readonly defaultValues: TFilters;
  readonly onSearch: (filters: TFilters, page: number, rows: number) => void;
  readonly debouncedFields?: (keyof TFilters)[];
  readonly minChars?: number;
  readonly debounceMs?: number;
  readonly initialRows?: number;
  /** Quando informado, persiste e restaura filtros+página+rows desta tela em localStorage sob essa chave. */
  readonly storageKey?: string;
  /**
   * Validação adicional por campo, além do minChars (ex: campos com máscara que só devem
   * disparar busca quando completos e válidos). Retornar false bloqueia o disparo da busca.
   */
  readonly isValidField?: (field: keyof TFilters, value: unknown) => boolean;
}

export interface UseFiltersSeplagResult<TFilters extends FieldValues> {
  readonly page: number;
  readonly rows: number;
  readonly onPageChange: (event: DataTableStateEvent) => void;
  readonly resetAll: () => void;
  readonly resetField: (field: keyof TFilters) => void;
  readonly refetch: () => void;
}

function isBelowMinChars(value: unknown, minChars: number): boolean {
  return typeof value === "string" && value.length > 0 && value.length < minChars;
}

export function useFiltersSeplag<TFilters extends FieldValues>({
  control,
  getValues,
  reset,
  defaultValues,
  onSearch,
  debouncedFields = [],
  minChars = 3,
  debounceMs = 400,
  initialRows = 10,
  storageKey,
  isValidField,
}: UseFiltersSeplagOptions<TFilters>): UseFiltersSeplagResult<TFilters> {
  const [restoredStorage] = useState(() =>
    storageKey ? loadFilterStorageSeplag<TFilters>(storageKey) : null,
  );

  const [page, setPage] = useState(() => restoredStorage?.page ?? 0);
  const [rows, setRows] = useState(() => restoredStorage?.rows ?? initialRows);
  const restorePendingRef = useRef(Boolean(restoredStorage?.filters));

  useEffect(() => {
    if (restoredStorage?.filters) reset(restoredStorage.filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const watchedValuesRaw = useWatch({ control }) as TFilters;
  const watchedValuesKey = JSON.stringify(watchedValuesRaw);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const watchedValues = useMemo(() => watchedValuesRaw, [watchedValuesKey]);

  useEffect(() => {

    restorePendingRef.current = false;
  }, [watchedValuesKey]);

  const debouncedFieldsSet = new Set(debouncedFields as string[]);

  const { immediateValues, debouncedSourceValues } = useMemo(() => {
    const immediate: Record<string, unknown> = {};
    const debouncedSource: Record<string, unknown> = {};
    for (const key of Object.keys(watchedValues)) {
      if (debouncedFieldsSet.has(key)) {
        debouncedSource[key] = watchedValues[key];
      } else {
        immediate[key] = watchedValues[key];
      }
    }
    return { immediateValues: immediate, debouncedSourceValues: debouncedSource };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues]);

  const debouncedValues = useDebouncedValueSeplag(debouncedSourceValues, debounceMs);

  const effectiveFiltersKey = JSON.stringify({ ...immediateValues, ...debouncedValues });
  const effectiveFilters = useMemo(
    () => ({ ...immediateValues, ...debouncedValues }) as TFilters,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveFiltersKey],
  );
  const filtersKey = effectiveFiltersKey;

  const onSearchRef = useRef(onSearch);
  const isValidFieldRef = useRef(isValidField);
  const lastSearchArgsRef = useRef({ filters: effectiveFilters, page, rows });

  useEffect(() => {
    onSearchRef.current = onSearch;
    isValidFieldRef.current = isValidField;
  });

  const lastSearchKeyRef = useRef<string | null>(null);
  const lastFiltersKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (restorePendingRef.current) return;

    const isFirstRun = lastFiltersKeyRef.current === null;
    const filtersChanged = !isFirstRun && filtersKey !== lastFiltersKeyRef.current;
    const effectivePage = filtersChanged ? 0 : page;

    lastFiltersKeyRef.current = filtersKey;

    const hasFieldBelowMinChars = Object.values(effectiveFilters).some((value) =>
      isBelowMinChars(value, minChars),
    );
    if (hasFieldBelowMinChars) return;

    const hasInvalidField =
      isValidFieldRef.current &&
      (Object.keys(effectiveFilters) as (keyof TFilters)[]).some(
        (field) => !isValidFieldRef.current!(field, effectiveFilters[field]),
      );
    if (hasInvalidField) return;

    const searchKey = `${filtersKey}|${effectivePage}|${rows}`;
    if (searchKey === lastSearchKeyRef.current) return;
    lastSearchKeyRef.current = searchKey;

    if (filtersChanged && page !== 0) setPage(0);
    lastSearchArgsRef.current = { filters: effectiveFilters, page: effectivePage, rows };
    if (storageKey) {
      saveFilterStorageSeplag(storageKey, { filters: effectiveFilters, page: effectivePage, rows });
    }
    onSearchRef.current(effectiveFilters, effectivePage, rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, page, rows, minChars, storageKey]);

  const onPageChange = useCallback(
    (event: DataTableStateEvent) => {
      setPage(event.page ?? 0);
      setRows(event.rows ?? initialRows);
    },
    [initialRows],
  );

  const resetAll = useCallback(() => {
    reset(defaultValues);
    setPage(0);
    if (storageKey) clearFilterStorageSeplag(storageKey);
  }, [reset, defaultValues, storageKey]);

  const resetField = useCallback(
    (field: keyof TFilters) => {
      reset({ ...getValues(), [field]: defaultValues[field] } as TFilters);
      setPage(0);
    },
    [reset, getValues, defaultValues],
  );

  const refetch = useCallback(() => {
    const { filters, page: lastPage, rows: lastRows } = lastSearchArgsRef.current;
    onSearchRef.current(filters, lastPage, lastRows);
  }, []);

  return { page, rows, onPageChange, resetAll, resetField, refetch };
}
