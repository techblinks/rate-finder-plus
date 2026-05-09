import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { type MobileResult, useMobileResultSubscription } from "@/lib/mobileResult";

const MobileStickyResultBar = () => {
  const isMobile = useIsMobile();
  const [result, setResult] = useState<MobileResult | null>(null);

  useMobileResultSubscription(setResult);

  // Reset when navigation removes the result-publishing calculator
  useEffect(() => {
    if (!isMobile) setResult(null);
  }, [isMobile]);

  if (!isMobile || !result) return null;

  return (
    <div
      className="fixed inset-x-0 z-40 flex items-center justify-between border-t border-border bg-background px-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      style={{
        bottom: `calc(64px + env(safe-area-inset-bottom))`,
        height: 56,
      }}
    >
      <div className="flex flex-col">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {result.label}
        </span>
        {result.sub && (
          <span className="text-[11px] text-muted-foreground tnum">{result.sub}</span>
        )}
      </div>
      <span className="text-[22px] font-bold tracking-tight text-foreground tnum">
        {result.value}
      </span>
    </div>
  );
};

export default MobileStickyResultBar;
