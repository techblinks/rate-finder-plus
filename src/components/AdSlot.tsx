import { useEffect, useRef } from "react";

/**
 * Display-ad placeholder. Until `VITE_ADSENSE_CLIENT` is set, renders a labelled
 * empty container so layout reflects production. With the env var set, mounts
 * an AdSense `<ins>` tag and pushes it to the queue.
 *
 * Slot IDs come from env (`VITE_ADSENSE_SLOT_HEADER`, `VITE_ADSENSE_SLOT_INLINE`,
 * `VITE_ADSENSE_SLOT_SIDEBAR`) so they can be swapped without code changes.
 */
type SlotName = "header" | "inline" | "sidebar";

interface AdSlotProps {
  slot: SlotName;
  className?: string;
}

const SLOT_ENV: Record<SlotName, string | undefined> = {
  header: import.meta.env.VITE_ADSENSE_SLOT_HEADER as string | undefined,
  inline: import.meta.env.VITE_ADSENSE_SLOT_INLINE as string | undefined,
  sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR as string | undefined,
};

const SLOT_CLASS: Record<SlotName, string> = {
  header: "min-h-[90px]",
  inline: "min-h-[250px]",
  sidebar: "min-h-[600px]",
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AdSlot = ({ slot, className = "" }: AdSlotProps) => {
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
  const slotId = SLOT_ENV[slot];
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!client || !slotId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not yet loaded; ignore
    }
  }, [client, slotId]);

  if (!client || !slotId) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-[12px] uppercase tracking-wide text-muted-foreground ${SLOT_CLASS[slot]} ${className}`}
      >
        Advertisement
      </div>
    );
  }

  return (
    <ins
      ref={ref}
      className={`adsbygoogle block ${SLOT_CLASS[slot]} ${className}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSlot;
