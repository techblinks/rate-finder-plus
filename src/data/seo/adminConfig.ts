// Lightweight localStorage-backed admin overrides for programmatic SEO pages.
// No server, no database — easy to swap for Lovable Cloud later.

const KEY = "zune.seo.admin.v1";

export interface PageOverride {
  enabled?: boolean;
  title?: string;
  description?: string;
  affiliateUrl?: string;
  adSnippet?: string;
}

export type AdminConfig = Record<string, PageOverride>;

export const loadAdminConfig = (): AdminConfig => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminConfig) : {};
  } catch {
    return {};
  }
};

export const saveAdminConfig = (cfg: AdminConfig) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cfg));
};

export const getOverride = (slug: string): PageOverride =>
  loadAdminConfig()[slug] ?? {};

export const setOverride = (slug: string, patch: PageOverride) => {
  const cfg = loadAdminConfig();
  cfg[slug] = { ...(cfg[slug] ?? {}), ...patch };
  saveAdminConfig(cfg);
};

export const ADMIN_KEY_PARAM = "key";
export const ADMIN_KEY_VALUE = "zune-admin";
