import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  logo_url: string | null;
  favicon_url: string | null;
  logo_height: number;

  // Analytics
  ga4_id: string | null;
  gtm_id: string | null;
  fb_pixel_id: string | null;
  head_html: string | null;
  body_html: string | null;

  // AdSense
  adsense_client: string | null;
  adsense_slot_header: string | null;
  adsense_slot_inline: string | null;
  adsense_slot_sidebar: string | null;
  adsense_slot_sticky_mobile: string | null;
  adsense_enabled: boolean;
  adsense_auto_ads: boolean;
  slot_header_enabled: boolean;
  slot_inline_enabled: boolean;
  slot_sidebar_enabled: boolean;
  slot_sticky_mobile_enabled: boolean;
  ads_txt: string | null;

  // SEO
  default_og_image: string | null;
  default_meta_description: string | null;
  title_template: string;
  gsc_verification: string | null;
  bing_verification: string | null;
  robots_txt: string | null;
  indexing_enabled: boolean;
}

const DEFAULTS: SiteSettings = {
  logo_url: null,
  favicon_url: null,
  logo_height: 32,
  ga4_id: null,
  gtm_id: null,
  fb_pixel_id: null,
  head_html: null,
  body_html: null,
  adsense_client: null,
  adsense_slot_header: null,
  adsense_slot_inline: null,
  adsense_slot_sidebar: null,
  adsense_slot_sticky_mobile: null,
  adsense_enabled: true,
  adsense_auto_ads: false,
  slot_header_enabled: true,
  slot_inline_enabled: true,
  slot_sidebar_enabled: true,
  slot_sticky_mobile_enabled: true,
  ads_txt: null,
  default_og_image: null,
  default_meta_description: null,
  title_template: "%s | Calcy",
  gsc_verification: null,
  bing_verification: null,
  robots_txt: null,
  indexing_enabled: true,
};

let cache: SiteSettings | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

const SELECT_COLS =
  "logo_url, favicon_url, logo_height, ga4_id, gtm_id, fb_pixel_id, head_html, body_html, adsense_client, adsense_slot_header, adsense_slot_inline, adsense_slot_sidebar, adsense_slot_sticky_mobile, adsense_enabled, adsense_auto_ads, slot_header_enabled, slot_inline_enabled, slot_sidebar_enabled, slot_sticky_mobile_enabled, ads_txt, default_og_image, default_meta_description, title_template, gsc_verification, bing_verification, robots_txt, indexing_enabled";

const fetchSettings = async () => {
  const { data } = await supabase
    .from("site_settings")
    .select(SELECT_COLS)
    .eq("id", 1)
    .maybeSingle();
  const next = data ? { ...DEFAULTS, ...(data as Partial<SiteSettings>) } : DEFAULTS;
  cache = next;
  listeners.forEach((l) => l(next));
  return next;
};

export const refreshSiteSettings = () => fetchSettings();

export const getCachedSettings = () => cache;

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? DEFAULTS);

  useEffect(() => {
    listeners.add(setSettings);
    if (!cache) fetchSettings();
    return () => {
      listeners.delete(setSettings);
    };
  }, []);

  return settings;
};
