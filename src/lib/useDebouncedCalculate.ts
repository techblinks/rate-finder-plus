import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires a GA4 `calculate` event after `delay` ms of stable input,
 * de-duplicating identical payloads to avoid noisy reports.
 */
export function useDebouncedCalculate(
  calculator: string,
  payload: Record<string, unknown>,
  delay = 800,
) {
  const lastSent = useRef<string>("");
  const key = JSON.stringify(payload);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (lastSent.current === key) return;
      lastSent.current = key;
      trackEvent("calculate", { calculator, ...payload });
    }, delay);
    return () => window.clearTimeout(t);
  }, [key, calculator, delay]);
}
