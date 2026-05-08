// Dynamic AdSense loader. Reads publisher client ID from admin-managed
// site_settings (with env fallback). Adds verification meta tag and the
// adsbygoogle.js loader once. Loading is gated on cookie consent.

import { getConsent } from "@/components/CookieConsent";

interface AdSenseConfig {
  client?: string | null;
  enabled?: boolean;
  autoAds?: boolean;
}

let loaded = false;
let pending: AdSenseConfig | null = null;

function actuallyLoad(client: string, autoAds: boolean | undefined, consent: string) {
  if (loaded) return;
  loaded = true;

  if (!document.querySelector('meta[name="google-adsense-account"]')) {
    const meta = document.createElement("meta");
    meta.name = "google-adsense-account";
    meta.content = client;
    document.head.appendChild(meta);
  }

  if (consent === "essential_only") {
    (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle =
      (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
    (window as unknown as { adsbygoogle: Record<string, unknown>[] }).adsbygoogle.push({
      google_ad_client: client,
      tag_for_under_age_of_consent: false,
      requestNonPersonalizedAds: 1,
    });
  }

  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  if (autoAds) s.setAttribute("data-ad-client", client);
  document.head.appendChild(s);
}

export function configureAdSense(cfg: AdSenseConfig) {
  if (typeof document === "undefined") return;
  const client = cfg.client || (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined);
  if (!client || cfg.enabled === false) return;
  if (loaded) return;

  // Always set the verification meta tag (allowed before consent)
  if (!document.querySelector('meta[name="google-adsense-account"]')) {
    const meta = document.createElement("meta");
    meta.name = "google-adsense-account";
    meta.content = client;
    document.head.appendChild(meta);
  }

  const consent = getConsent();
  if (!consent) {
    pending = { ...cfg, client };
    const onConsent = () => {
      window.removeEventListener("calcy:consent", onConsent as EventListener);
      if (pending) {
        const c = getConsent();
        if (c) actuallyLoad(client, pending.autoAds, c);
      }
    };
    window.addEventListener("calcy:consent", onConsent as EventListener, { once: true });
    return;
  }

  actuallyLoad(client, cfg.autoAds, consent);
}

/** Back-compat shim. */
export function loadAdSense() {
  configureAdSense({ client: import.meta.env.VITE_ADSENSE_CLIENT as string | undefined });
}

