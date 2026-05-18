import { useEffect, useRef, useState } from "react";

/**
 * Smoothly tweens a numeric value over `duration` ms using rAF.
 * Honours prefers-reduced-motion (jumps straight to target).
 * Skips the initial mount tween — the very first value renders immediately.
 */
export function useCountUp(target: number, duration = 300): number {
  const [display, setDisplay] = useState<number>(target);
  const fromRef = useRef<number>(target);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || duration <= 0 || !Number.isFinite(target)) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    const from = display;
    fromRef.current = from;
    startRef.current = performance.now();

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setDisplay(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}
