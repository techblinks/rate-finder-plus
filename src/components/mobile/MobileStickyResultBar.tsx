import { useEffect, useState } from "react";
import { Share2, Bookmark } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { type MobileResult, useMobileResultSubscription } from "@/lib/mobileResult";
import { haptic } from "@/lib/haptic";

const MobileStickyResultBar = () => {
  const isMobile = useIsMobile();
  const [result, setResult] = useState<MobileResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useMobileResultSubscription(setResult);

  useEffect(() => {
    if (result && !mounted) {
      // Slight stagger so the entrance feels intentional.
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    if (!result && mounted) setMounted(false);
  }, [result, mounted]);

  useEffect(() => {
    if (!isMobile) setResult(null);
  }, [isMobile]);

  if (!isMobile || !result) return null;

  const handleShare = () => {
    haptic.light();
    result.onShare?.();
  };
  const handleSave = () => {
    haptic.medium();
    result.onSave?.();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur shadow-[0_-6px_18px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out"
      style={{
        bottom: `calc(64px + env(safe-area-inset-bottom))`,
        height: 60,
        transform: mounted ? "translateY(0)" : "translateY(110%)",
      }}
    >
      <div className="flex h-full items-center justify-between gap-3 px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {result.label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-bold tracking-tight text-foreground tnum leading-none">
              {result.value}
            </span>
            {result.weekly && (
              <span className="text-[11px] font-medium text-muted-foreground tnum">
                = {result.weekly}/wk
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {result.onSave && (
            <button
              type="button"
              onClick={handleSave}
              aria-label="Save scenario"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground active:scale-95 transition-transform"
            >
              <Bookmark className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          )}
          {result.onShare && (
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share result"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground active:scale-95 transition-transform"
            >
              <Share2 className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileStickyResultBar;
