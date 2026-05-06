// Dynamic analytics loader. Reads IDs from site_settings (admin-managed) at
// runtime so updates take effect without a redeploy. Falls back to env vars
// for local dev convenience.
//
// Supports: GA4, Google Tag Manager, Facebook Pixel.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
    _fbq?: unknown;
  }
}

interface AnalyticsConfig {
  ga4Id?: string | null;
  gtmId?: string | null;
  fbPixelId?: string | null;
}

const loaded = {
  ga4: false,
  gtm: false,
  fb: false,
};

function injectScript(src: string, id?: string) {
  if (id && document.getElementById(id)) return;
  const s = document.createElement("script");
  if (id) s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function configureAnalytics(cfg: AnalyticsConfig) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];

  // GA4
  const ga4 = cfg.ga4Id || (import.meta.env.VITE_GA4_ID as string | undefined);
  if (ga4 && ga4 !== "G-PLACEHOLDER" && !loaded.ga4) {
    loaded.ga4 = true;
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${ga4}`, "ga4-script");
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ga4, { send_page_view: false });
  }

  // GTM
  const gtm = cfg.gtmId;
  if (gtm && !loaded.gtm) {
    loaded.gtm = true;
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    injectScript(`https://www.googletagmanager.com/gtm.js?id=${gtm}`, "gtm-script");
  }

  // Facebook Pixel
  const fb = cfg.fbPixelId;
  if (fb && !loaded.fb) {
    loaded.fb = true;
    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq?.("init", fb);
    window.fbq?.("track", "PageView");
  }
}

/** Back-compat shim — older callers used initAnalytics() with no args. */
export function initAnalytics() {
  configureAnalytics({ ga4Id: import.meta.env.VITE_GA4_ID as string | undefined });
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined") return;
  if (window.gtag) {
    window.gtag("event", "page_view", { page_path: path, page_title: title ?? document.title });
  } else {
    (window.dataLayer ||= []).push({ event: "page_view", page_path: path });
  }
  window.fbq?.("track", "PageView");
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (window.gtag) {
    window.gtag("event", name, params);
  } else {
    (window.dataLayer ||= []).push({ event: name, ...params });
  }
}
