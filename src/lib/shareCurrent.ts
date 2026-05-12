import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

interface ShareArgs {
  calculator: string;
  title: string;
  text: string;
}

/**
 * Shared "share this result" handler used by mobile sticky bar and inline
 * Share buttons. Uses native Web Share API on supported devices, falls back
 * to copy-to-clipboard with a toast.
 */
export async function shareCurrent({ calculator, title, text }: ShareArgs) {
  if (typeof window === "undefined") return;
  const url = window.location.href;
  trackEvent("share_result_attempt", { calculator });

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      trackEvent("share_result_native", { calculator });
      return;
    } catch {
      /* user cancelled or share failed — fall through to clipboard */
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    trackEvent("share_result_copy", { calculator });
    toast.success("Link copied", { description: "Paste anywhere to share." });
  } catch {
    toast.error("Could not share", { description: "Please copy the URL manually." });
  }
}
