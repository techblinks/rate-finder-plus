import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { buildShareUrl, encodeState } from "@/lib/share";

interface ShareButtonProps<T extends object> {
  state: T;
  title?: string;
  resultLabel?: string;
  resultValue?: string;
}

const ShareButton = <T extends object>({ state, title, resultLabel, resultValue }: ShareButtonProps<T>) => {
  const [copied, setCopied] = useState(false);

  const getUrl = () => buildShareUrl(encodeState(state));

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleShare = async () => {
    const url = getUrl();
    const shareText = resultLabel && resultValue ? `${resultLabel}: ${resultValue}` : title ?? "Calculator result";
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: title ?? "Zune Calculator", text: shareText, url });
        return;
      } catch {
        // user cancelled or share unsupported — fall through to copy
      }
    }
    await copyToClipboard(url);
  };

  const handleCopy = async () => copyToClipboard(getUrl());

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-secondary"
        aria-label="Copy shareable link"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
        aria-label="Share result"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>
    </div>
  );
};

export default ShareButton;
