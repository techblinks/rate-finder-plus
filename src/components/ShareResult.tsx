import { useCallback, useState } from "react";
import { Link2, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ShareResultProps {
  /** Calculator name for analytics, e.g. "mortgage_repayment". */
  calculator: string;
  /** Current input field values to encode as URL query params. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Pre-filled share text (without the URL). */
  shareText?: string;
}

const XIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2H21l-6.52 7.45L22 22h-6.797l-4.78-6.243L4.86 22H2.1l6.97-7.965L2 2h6.91l4.32 5.71L18.244 2Zm-1.19 18h1.69L7.04 4H5.27l11.785 16Z" />
  </svg>
);

const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M19.11 4.91A10 10 0 0 0 2.05 15.06L1 22l7.1-1.04A10 10 0 1 0 19.11 4.91Zm-7.1 15.32a8.27 8.27 0 0 1-4.21-1.16l-.3-.18-4.21.62.63-4.1-.2-.32a8.28 8.28 0 1 1 8.29 5.14Zm4.55-6.2c-.25-.13-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.13-.17.25-.65.8-.8.97-.15.17-.3.19-.55.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.55-1.34-.76-1.84-.2-.48-.4-.42-.55-.42-.14-.01-.31-.01-.48-.01-.17 0-.45.06-.69.32-.24.25-.91.89-.91 2.18 0 1.29.93 2.53 1.06 2.7.13.17 1.83 2.79 4.43 3.91.62.27 1.1.43 1.48.55.62.2 1.18.17 1.62.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3Z" />
  </svg>
);

const ShareResult = ({ calculator, params, shareText }: ShareResultProps) => {
  const [copied, setCopied] = useState(false);

  const buildUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        sp.set(k, String(v));
      });
    }
    const qs = sp.toString();
    return `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ""}`;
  }, [params]);

  const text = shareText ?? "I just used Calcy to crunch the numbers";

  const handleCopy = useCallback(async () => {
    const url = buildUrl();
    trackEvent("share_result_copy", { calculator });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [buildUrl, calculator]);

  const url = buildUrl();
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} at calcy.com.au ${url}`)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} at calcy.com.au ${url}`)}`;

  return (
    <div className="no-print mt-3 flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
          Share result
        </button>
        {copied && (
          <span
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[12px] font-medium text-background shadow-lg"
          >
            Link copied!
          </span>
        )}
      </div>
      <a
        href={tweet}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        onClick={() => trackEvent("share_result_x", { calculator })}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:border-accent/40 hover:text-accent"
      >
        <XIcon />
      </a>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        onClick={() => trackEvent("share_result_whatsapp", { calculator })}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:border-accent/40 hover:text-accent"
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
};

export default ShareResult;
