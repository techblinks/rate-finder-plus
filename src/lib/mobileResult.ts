import { useEffect } from "react";

export interface MobileResult {
  label: string;
  value: string;
  /** Optional secondary line (e.g. "Monthly $3,210"). */
  sub?: string;
  /** Optional weekly-equivalent string shown below primary value on mobile. */
  weekly?: string;
  /** Optional share action wired into the sticky bar share button. */
  onShare?: () => void;
  /** Optional save action wired into the sticky bar save button. */
  onSave?: () => void;
}

const EVENT = "calcy:mobile-result";

/**
 * Publish the calculator's primary result so the global mobile sticky
 * result bar can render it. Called on every result change.
 * Pass `null` to clear.
 */
export function setMobileResult(result: MobileResult | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<MobileResult | null>(EVENT, { detail: result }));
}

/** Hook for the StickyResultBar component to subscribe to result updates. */
export function useMobileResultSubscription(
  cb: (result: MobileResult | null) => void,
) {
  useEffect(() => {
    const handler = (e: Event) => {
      cb((e as CustomEvent<MobileResult | null>).detail);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [cb]);
}

/** Convenience hook for calculators to publish + auto-clear on unmount. */
export function usePublishMobileResult(result: MobileResult | null) {
  useEffect(() => {
    setMobileResult(result);
    return () => setMobileResult(null);
    // Re-publish whenever any displayed field or callback identity changes.
  }, [result?.label, result?.value, result?.sub, result?.weekly, result?.onShare, result?.onSave]);
}
