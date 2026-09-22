import { useEffect, useMemo, useRef, useState } from "react";

export function useDebouncedValueSeplag<T>(value: T, delayMs: number): T {
  const valueKey = JSON.stringify(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableValue = useMemo(() => value, [valueKey]);

  const [debounced, setDebounced] = useState(stableValue);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebounced(stableValue), delayMs);
    return () => clearTimeout(timerRef.current);
  }, [stableValue, delayMs]);

  return debounced;
}
