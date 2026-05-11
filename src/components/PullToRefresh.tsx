import { useEffect, useRef, useState } from "react";
import { haptic } from "@/lib/haptic";

const THRESHOLD = 80;
const MAX_PULL = 120;

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS
    window.navigator.standalone === true);

/**
 * Pull-to-refresh — only attached when running as an installed PWA
 * (standalone display mode) on mobile viewports. In regular Safari/Chrome
 * the browser's native overscroll refresh handles this.
 */
const PullToRefresh = () => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const active = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isStandalone()) return;
    if (window.innerWidth >= 768) return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active.current || startY.current == null) return;
      if (window.scrollY > 0) {
        active.current = false;
        setPull(0);
        return;
      }
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) return;
      // Rubber-banded.
      const eased = Math.min(MAX_PULL, delta * 0.5);
      setPull(eased);
    };

    const onTouchEnd = () => {
      if (!active.current) return;
      active.current = false;
      startY.current = null;
      if (pull >= THRESHOLD) {
        haptic.medium();
        setRefreshing(true);
        setTimeout(() => window.location.reload(), 200);
      } else {
        setPull(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pull]);

  if (pull <= 0 && !refreshing) return null;

  const ready = pull >= THRESHOLD || refreshing;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[55] flex justify-center md:hidden"
      style={{
        transform: `translateY(${refreshing ? THRESHOLD : pull}px)`,
        transition: refreshing ? "transform 0.2s" : "none",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="mt-2 flex items-center gap-2 rounded-full bg-background px-4 py-2 text-[12px] font-medium text-foreground shadow-md border border-border">
        <span
          className={`inline-block h-3 w-3 rounded-full border-2 border-accent border-t-transparent ${
            refreshing ? "animate-spin" : ""
          }`}
          style={{
            transform: refreshing ? undefined : `rotate(${pull * 4}deg)`,
          }}
        />
        {refreshing ? "Refreshing…" : ready ? "Release to refresh" : "Pull to refresh"}
      </div>
    </div>
  );
};

export default PullToRefresh;
