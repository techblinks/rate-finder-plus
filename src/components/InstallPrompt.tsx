import { useEffect, useState } from "react";
import { haptic } from "@/lib/haptic";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

const DISMISS_KEY = "calcy_install_dismissed_until";
const PV_KEY = "calcy_pv";

const isIOSSafari = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
};

const isStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari proprietary
    window.navigator.standalone === true
  );
};

const InstallPrompt = () => {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (window.innerWidth >= 768) return;

    // Page-view counter via sessionStorage.
    let pv = 0;
    try {
      pv = parseInt(sessionStorage.getItem(PV_KEY) || "0", 10) + 1;
      sessionStorage.setItem(PV_KEY, String(pv));
    } catch {
      /* ignore */
    }

    // Honor 7-day dismiss.
    try {
      const until = parseInt(localStorage.getItem(DISMISS_KEY) || "0", 10);
      if (Date.now() < until) return;
    } catch {
      /* ignore */
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      if (pv >= 2) setTimeout(() => setShow(true), 1500);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari fallback — no beforeinstallprompt event.
    if (isIOSSafari() && pv >= 2) {
      setTimeout(() => {
        setIosHint(true);
        setShow(true);
      }, 1500);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    try {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_KEY, String(Date.now() + sevenDays));
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  const install = async () => {
    if (!evt) return;
    haptic.success();
    try {
      await evt.prompt();
      await evt.userChoice;
    } finally {
      setShow(false);
    }
  };

  if (!show) return null;
  if (!evt && !iosHint) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Calcy"
      className="fixed left-3 right-3 z-[60] rounded-2xl border border-border bg-background shadow-xl md:hidden"
      style={{
        bottom: "calc(64px + env(safe-area-inset-bottom) + 12px)",
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold text-xl">
          C
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-foreground">Install Calcy</p>
          <p className="text-[13px] text-muted-foreground">
            {iosHint
              ? "Tap Share → Add to Home Screen for quick access."
              : "Add to your home screen for quick access"}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-[13px] font-medium text-foreground"
            >
              Not now
            </button>
            {!iosHint && (
              <button
                type="button"
                onClick={install}
                className="flex-1 min-h-[44px] rounded-lg bg-accent px-3 py-2 text-[13px] font-semibold text-accent-foreground"
              >
                Install
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
