import { useEffect, useRef } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Display-ad placeholder. Reads publisher client ID, slot ID, and per-slot
 * enable flag from admin-managed site_settings. Renders a labelled empty
 * container until configured, so layout matches production.
 */
type SlotName = "header" | "inline" | "sidebar" | "stickyMobile";

interface AdSlotProps {
  slot: SlotName;
  className?: string;
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

const AdSlot = ({ slot, className = "" }: AdSlotProps) => {
  const settings = useSiteSettings();
  const ref = useRef<HTMLModElement>(null);

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

  useEffect(() => {
    if (!client || !slotId || !enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not yet loaded; ignore
    }
  }, [client, slotId, enabled]);

  if (!client || !slotId || !enabled) {
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
