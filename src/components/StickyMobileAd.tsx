import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdSlot from "@/components/AdSlot";

/**
 * Anchored bottom ad for mobile only. Appears after the user scrolls past the
 * calculator inputs (≈ 400 px) so it surfaces alongside the result, not the form.
 * Dismissible per session. Hidden ≥ md breakpoint to avoid layout shift on desktop.
 */
const StickyMobileAd = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem("calcy:sticky-ad-dismissed") === "1";
  });

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed || !show) return null;

  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        type="button"
        aria-label="Dismiss advertisement"
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem("calcy:sticky-ad-dismissed", "1");
          } catch {
            /* ignore */
          }
        }}
        className="absolute -top-3 right-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="mx-auto max-w-2xl px-2 py-1">
        <AdSlot slot="stickyMobile" />
      </div>
    </div>
  );
};

export default StickyMobileAd;
