import { useEffect, useRef, useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Production-ready display-ad slot.
 *
 * Behaviour:
 *  - Reads publisher client ID, slot ID, and per-slot enable flag from
 *    admin-managed site_settings (with VITE_ADSENSE_CLIENT fallback for client).
 *  - Renders nothing when the slot isn't configured/enabled — so the calculator
 *    UX is never pushed down by an empty ad container.
 *  - When configured, reserves a min-height matching the AdSense unit to
 *    prevent CLS, and lazy-loads the ad only when the placeholder is near the
 *    viewport (IntersectionObserver). This keeps LCP fast and means the ad
 *    request never blocks the calculator above the fold.
 *  - Includes a small "Advertisement" caption + aria-label for IAB/Google
 *    transparency requirements.
 */
type SlotName = "header" | "inline" | "sidebar" | "stickyMobile";

interface AdSlotProps {
  slot: SlotName;
  className?: string;
  /** Hide the small "Advertisement" caption (e.g. inside sticky bar). */
  hideLabel?: boolean;
}

const SLOT_CLASS: Record<SlotName, string> = {
  header: "min-h-[90px]",
  inline: "min-h-[250px]",
  sidebar: "min-h-[600px]",
  stickyMobile: "h-[60px] w-full",
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AdSlot = ({ slot, className = "", hideLabel = false }: AdSlotProps) => {
  const settings = useSiteSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);
  const [inView, setInView] = useState(false);

  const client =
    settings.adsense_client || (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined);

  const slotIdMap: Record<SlotName, string | null> = {
    header: settings.adsense_slot_header,
    inline: settings.adsense_slot_inline,
    sidebar: settings.adsense_slot_sidebar,
    stickyMobile: settings.adsense_slot_sticky_mobile,
  };
  const enabledMap: Record<SlotName, boolean> = {
    header: settings.slot_header_enabled,
    inline: settings.slot_inline_enabled,
    sidebar: settings.slot_sidebar_enabled,
    stickyMobile: settings.slot_sticky_mobile_enabled,
  };

  const slotId = slotIdMap[slot];
  const enabled = settings.adsense_enabled && enabledMap[slot];
  const ready = !!(client && slotId && enabled);

  // Lazy-load: wait until the slot scrolls within ~400 px of the viewport
  // before pushing into adsbygoogle. This keeps the calculator above the fold
  // completely unblocked by ads.
  useEffect(() => {
    if (!ready || !containerRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const el = containerRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready]);

  useEffect(() => {
    if (!ready || !inView || pushedRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // adsbygoogle not yet loaded; will retry next render
    }
  }, [ready, inView]);

  if (!ready) {
    // Collapse completely — no label, no reserved space, never blocks layout.
    return null;
  }

  return (
    <div
      ref={containerRef}
      role="complementary"
      aria-label="Advertisement"
      className={`w-full ${className}`}
    >
      {!hideLabel && (
        <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">
          Advertisement
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-[hsl(var(--surface))]/40">
        <ins
          key={inView ? "live" : "pending"}
          className={`adsbygoogle block ${SLOT_CLASS[slot]}`}
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdSlot;
