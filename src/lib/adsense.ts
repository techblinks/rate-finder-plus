const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

let loaded = false;

export function loadAdSense() {
  if (loaded || !CLIENT || typeof document === "undefined") return;
  loaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
  document.head.appendChild(s);
}
