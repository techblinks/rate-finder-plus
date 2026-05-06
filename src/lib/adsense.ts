// Dynamic AdSense loader. Reads publisher client ID from admin-managed
// site_settings (with env fallback). Adds verification meta tag and the
// adsbygoogle.js loader once. `auto-ads` is opt-in via settings.

interface AdSenseConfig {
  client?: string | null;
  enabled?: boolean;
  autoAds?: boolean;
}

let loaded = false;

export function configureAdSense(cfg: AdSenseConfig) {
  if (typeof document === "undefined") return;
  const client = cfg.client || (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined);
  if (!client || cfg.enabled === false) return;
  if (loaded) return;
  loaded = true;

  if (!document.querySelector('meta[name="google-adsense-account"]')) {
    const meta = document.createElement("meta");
    meta.name = "google-adsense-account";
    meta.content = client;
    document.head.appendChild(meta);
  }

  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  if (cfg.autoAds) s.setAttribute("data-ad-client", client);
  document.head.appendChild(s);
}

/** Back-compat shim. */
export function loadAdSense() {
  configureAdSense({ client: import.meta.env.VITE_ADSENSE_CLIENT as string | undefined });
}
