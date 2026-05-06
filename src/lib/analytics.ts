// GA4 analytics wrapper. Placeholder measurement ID — replace VITE_GA4_ID via env
// or swap the string below with the live "G-XXXXXXX" ID when ready.
//
// Usage:
//   import { trackEvent } from "@/lib/analytics";
//   trackEvent("calculate", { calculator: "mortgage", loan_amount: 500000 });

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA4_ID = (import.meta.env.VITE_GA4_ID as string | undefined) ?? "G-PLACEHOLDER";

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  if (!GA4_ID || GA4_ID === "G-PLACEHOLDER") {
    // No-op until a real ID is wired in. Keep dataLayer queue available for early calls.
    window.dataLayer = window.dataLayer || [];
    initialized = true;
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID, { send_page_view: false });

  initialized = true;
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined") return;
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: title ?? document.title,
    });
  } else {
    (window.dataLayer ||= []).push({ event: "page_view", page_path: path });
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (window.gtag) {
    window.gtag("event", name, params);
  } else {
    (window.dataLayer ||= []).push({ event: name, ...params });
  }
}
