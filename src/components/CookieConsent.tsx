import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { haptic } from "@/lib/haptic";

export const CONSENT_KEY = "calcy_cookie_consent";
export type ConsentValue = "accepted" | "essential_only";

export function getConsent(): ConsentValue | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    if (raw === "accepted" || raw === "essential_only") return raw;
    // Older payloads with timestamp
    try {
      const obj = JSON.parse(raw);
      if (obj?.value === "accepted" || obj?.value === "essential_only") return obj.value;
    } catch {
      /* ignore */
    }
    return null;
  } catch {
    return null;
  }
}

function saveConsent(v: ConsentValue) {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ value: v, ts: new Date().toISOString() }),
    );
  } catch {
    /* ignore */
  }
  // Notify same-window listeners
  window.dispatchEvent(new CustomEvent("calcy:consent", { detail: v }));
}

const isStandalone = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(display-mode: standalone)").matches;

const CookieConsent = () => {
  // Lazy init so the banner is interactive immediately after hydration
  // (avoids a window where the prerendered HTML has show=false and was
  // applying `pointer-events-none`, which made the buttons unclickable).
  const [show, setShow] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [adsToggle, setAdsToggle] = useState(true);

  useEffect(() => {
    if (isStandalone()) return;
    if (!getConsent()) setShow(true);
  }, []);

  const accept = (v: ConsentValue) => {
    haptic.light();
    saveConsent(v);
    setShow(false);
    setShowPrefs(false);
  };

  return (
    <>
      <div
        role="dialog"
        aria-label="Cookie consent"
        aria-hidden={!show}
        className={`fixed inset-x-0 z-[10000] border-t border-border bg-background shadow-[0_-4px_24px_hsl(var(--foreground)/0.06)] transition-transform duration-300 will-change-transform bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-0 ${
          show ? "translate-y-0" : "translate-y-full invisible"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)", pointerEvents: "auto" }}
      >
        <div className="page-shell flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3 text-[13px] text-foreground">
            <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
            <p className="leading-relaxed">
              Calcy uses cookies to improve your experience and to serve relevant ads through Google
              AdSense. By continuing, you accept our{" "}
              <Link to="/privacy-policy" className="text-accent hover:underline">
                cookie policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setShowPrefs(true)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-[13px] font-medium text-foreground hover:bg-surface"
            >
              Manage preferences
            </button>
            <button
              type="button"
              onClick={() => accept("accepted")}
              className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-[13px] font-semibold text-accent-foreground hover:bg-accent/90"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>

      {showPrefs && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-foreground/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Cookie preferences"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h2 className="text-h3 mb-2">Cookie preferences</h2>
            <p className="mb-4 text-[13px] text-muted-foreground">
              Choose which cookies Calcy can use on your device.
            </p>

            <div className="space-y-3">
              <div className="flex items-start justify-between rounded-xl border border-border p-4">
                <div className="pr-3">
                  <p className="text-[14px] font-medium text-foreground">Essential cookies</p>
                  <p className="text-[12px] text-muted-foreground">
                    Required for the site to function. Always on.
                  </p>
                </div>
                <span className="inline-flex h-6 w-10 items-center rounded-full bg-accent px-1">
                  <span className="h-4 w-4 translate-x-4 rounded-full bg-white" />
                </span>
              </div>

              <label className="flex items-start justify-between rounded-xl border border-border p-4 cursor-pointer">
                <div className="pr-3">
                  <p className="text-[14px] font-medium text-foreground">
                    Advertising & analytics
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    Used by Google AdSense and analytics to serve relevant ads and improve the site.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={adsToggle}
                  onChange={(e) => setAdsToggle(e.target.checked)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`inline-flex h-6 w-10 items-center rounded-full px-1 transition-colors ${
                    adsToggle ? "bg-accent" : "bg-border"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white transition-transform ${
                      adsToggle ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowPrefs(false)}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-[13px] font-medium text-foreground hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => accept(adsToggle ? "accepted" : "essential_only")}
                className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-[13px] font-semibold text-accent-foreground hover:bg-accent/90"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
