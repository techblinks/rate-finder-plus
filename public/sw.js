/* Calcy service worker — v3
 * Strategy:
 *   - HTML navigations: NetworkFirst (3s timeout) → cache → /offline.html
 *   - Same-origin static assets (JS/CSS/fonts/images): CacheFirst
 *   - Skips: sitemap*.xml, /admin*, /~oauth*, cross-origin
 */
const VERSION = "calcy-v3";
const HTML_CACHE = `${VERSION}-html`;
const ASSET_CACHE = `${VERSION}-assets`;

const PRECACHE_ROUTES = [
  "/",
  "/mortgage-calculator",
  "/stamp-duty-calculator",
  "/borrowing-power-calculator",
  "/lmi-calculator",
  "/loan-comparison-calculator",
  "/refinance-calculator",
  "/rent-vs-buy-calculator",
  "/extra-repayments-calculator",
  "/hecs-borrowing-power",
  "/offline.html",
  "/manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(HTML_CACHE).then((c) =>
      Promise.all(
        PRECACHE_ROUTES.map((url) =>
          fetch(url, { cache: "no-store" })
            .then((r) => (r.ok ? c.put(url, r) : null))
            .catch(() => null),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isHtmlRequest(req) {
  return (
    req.mode === "navigate" ||
    (req.method === "GET" && req.headers.get("accept")?.includes("text/html"))
  );
}

function shouldSkip(url) {
  return (
    /\/sitemap.*\.xml$/.test(url.pathname) ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/~oauth")
  );
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (shouldSkip(url)) return;

  if (isHtmlRequest(req)) {
    // NetworkFirst
    e.respondWith(
      (async () => {
        try {
          const fresh = await Promise.race([
            fetch(req),
            new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
          ]);
          const cache = await caches.open(HTML_CACHE);
          cache.put(req, fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cached = await caches.match(req);
          if (cached) return cached;
          const offline = await caches.match("/offline.html");
          if (offline) return offline;
          return new Response("Offline", { status: 503 });
        }
      })(),
    );
    return;
  }

  // CacheFirst for static assets
  e.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok) {
          const cache = await caches.open(ASSET_CACHE);
          cache.put(req, res.clone()).catch(() => {});
        }
        return res;
      } catch {
        return cached || new Response("", { status: 504 });
      }
    })(),
  );
});
