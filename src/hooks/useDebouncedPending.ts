import { useEffect, useState } from "react";

/**
 * Like `useDebouncedValue`, but also returns a `pending` boolean that is
 * `true` from the moment `value` changes until `delay` ms later when the
 * debounced value catches up. Used to drive mobile skeleton loaders so the
 * UI feels instant while heavy calculations and chart re-renders settle.
 */
export function useDebouncedPending<T>(value: T, delay = 250): [T, boolean] {
  const [debounced, setDebounced] = useState(value);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (Object.is(value, debounced)) return;
    setPending(true);
    const t = setTimeout(() => {
      setDebounced(value);
      setPending(false);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay, debounced]);

  return [debounced, pending];
}
