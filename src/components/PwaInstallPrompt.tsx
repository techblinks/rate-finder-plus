import { useEffect, useState } from "react";
import { bumpVisits } from "@/lib/mortgageState";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

const PwaInstallPrompt = () => {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const visits = bumpVisits();
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (isStandalone) return;
    const dismissed = localStorage.getItem("calcy_install_dismissed") === "1";
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      if (visits >= 2) setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show || !evt) return null;

  const dismiss = () => {
    localStorage.setItem("calcy_install_dismissed", "1");
    setShow(false);
  };

  const install = async () => {
    try {
      await evt.prompt();
      await evt.userChoice;
    } finally {
      setShow(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Add Calcy to home screen"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background shadow-2xl md:left-auto md:right-4 md:bottom-4 md:max-w-sm md:rounded-2xl md:border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold">
          C
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-foreground">
            Add Calcy to your home screen
          </p>
          <p className="text-[13px] text-muted-foreground">
            Get instant access — works like an app.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[13px] font-medium text-foreground"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={install}
              className="flex-1 rounded-lg bg-accent px-3 py-2 text-[13px] font-semibold text-accent-foreground"
            >
              Add to home screen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
