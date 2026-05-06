const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

let loaded = false;

export function loadAdSense() {
  if (loaded || !CLIENT || typeof document === "undefined") return;
  loaded = true;

  // AdSense site-verification meta tag. Required during approval; harmless
  // afterwards. Idempotent — only injected once.
  if (!document.querySelector('meta[name="google-adsense-account"]')) {
    const meta = document.createElement("meta");
    meta.name = "google-adsense-account";
    meta.content = CLIENT;
    document.head.appendChild(meta);
  }

  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
  document.head.appendChild(s);
}
