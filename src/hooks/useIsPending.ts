import { useEffect, useRef, useState } from "react";

/**
 * Returns `true` for `delay` ms after `key` (a stable identifier of the
 * current input snapshot, e.g. JSON.stringify of state) changes. Used to
 * drive skeleton/dim states while a debounced calculation settles.
 *
 * Pass a primitive (string/number) or a JSON-serialisable snapshot.
 */
export function useIsPending(key: string | number, delay = 250): boolean {
  const [pending, setPending] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPending(true);
    const t = setTimeout(() => setPending(false), delay);
    return () => clearTimeout(t);
  }, [key, delay]);

  return pending;
}
