import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { haptic } from "@/lib/haptic";

const CALC_ORDER = [
  "/mortgage-calculator",
  "/stamp-duty-calculator",
  "/borrowing-power-calculator",
  "/lmi-calculator",
  "/extra-repayments-calculator",
  "/loan-comparison-calculator",
  "/rent-vs-buy-calculator",
  "/refinance-calculator",
];

const MIN_DELTA_X = 80;
const HORIZONTAL_DOMINANCE = 1.5;
const EDGE_PX = 24; // ignore swipes that start near the edge (browser back gesture conflict)

/**
 * Attaches touch listeners to `target` (or window) so left/right swipes
 * navigate between calculators. Only runs when enabled.
 */
export function useSwipeNavigation(enabled: boolean) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const idx = CALC_ORDER.indexOf(pathname);
    if (idx === -1) return;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      // Skip if starting too close to an edge — that's likely a browser back gesture.
      if (t.clientX < EDGE_PX || t.clientX > window.innerWidth - EDGE_PX) {
        tracking.current = false;
        return;
      }
      // Skip horizontally scrollable elements (e.g. tables, quick-pill rows).
      let el = e.target as HTMLElement | null;
      while (el && el !== document.body) {
        const overflow = getComputedStyle(el).overflowX;
        if ((overflow === "auto" || overflow === "scroll") && el.scrollWidth > el.clientWidth) {
          tracking.current = false;
          return;
        }
        el = el.parentElement;
      }
      startX.current = t.clientX;
      startY.current = t.clientY;
      tracking.current = true;
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking.current) return;
      tracking.current = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;
      if (Math.abs(dx) < MIN_DELTA_X) return;
      if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_DOMINANCE) return;

      if (dx < 0 && idx < CALC_ORDER.length - 1) {
        haptic.light();
        navigate(CALC_ORDER[idx + 1]);
      } else if (dx > 0 && idx > 0) {
        haptic.light();
        navigate(CALC_ORDER[idx - 1]);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [enabled, pathname, navigate]);

  const idx = CALC_ORDER.indexOf(pathname);
  return {
    index: idx,
    total: CALC_ORDER.length,
    prev: idx > 0 ? CALC_ORDER[idx - 1] : null,
    next: idx < CALC_ORDER.length - 1 ? CALC_ORDER[idx + 1] : null,
  };
}

export const CALCULATOR_ORDER = CALC_ORDER;
