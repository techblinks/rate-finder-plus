import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  logo_url: string | null;
  favicon_url: string | null;
  logo_height: number;
}

const DEFAULTS: SiteSettings = {
  logo_url: null,
  favicon_url: null,
  logo_height: 32,
};

let cache: SiteSettings | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

const fetchSettings = async () => {
  const { data } = await supabase
    .from("site_settings")
    .select("logo_url, favicon_url, logo_height")
    .eq("id", 1)
    .maybeSingle();
  const next = data ? { ...DEFAULTS, ...data } : DEFAULTS;
  cache = next;
  listeners.forEach((l) => l(next));
  return next;
};

export const refreshSiteSettings = () => fetchSettings();

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
