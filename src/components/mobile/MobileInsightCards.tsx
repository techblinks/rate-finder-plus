import { useMemo } from "react";
import { X, TrendingDown, AlertTriangle, Sparkles, Info } from "lucide-react";
import type { ReactNode } from "react";
import { useInsightDismissal } from "@/hooks/useInsightDismissal";
import { haptic } from "@/lib/haptic";

export type InsightTone = "info" | "success" | "warn";

export interface InsightCandidate {
  id: string;
  tone: InsightTone;
  /** Lower = higher priority. */
  priority: number;
  title: string;
  body: ReactNode;
}

const TONE: Record<InsightTone, { wrap: string; icon: JSX.Element; iconWrap: string; title: string }> = {
  info: {
    wrap: "border-accent/30 bg-accent-light",
    iconWrap: "bg-accent/15 text-accent",
    icon: <Sparkles className="h-4 w-4" aria-hidden />,
    title: "text-foreground",
  },
  success: {
    wrap: "border-success/30 bg-success/10",
    iconWrap: "bg-success/15 text-success",
    icon: <TrendingDown className="h-4 w-4" aria-hidden />,
    title: "text-success",
  },
  warn: {
    wrap: "border-warning/40 bg-warning/10",
    iconWrap: "bg-warning/20 text-warning",
    icon: <AlertTriangle className="h-4 w-4" aria-hidden />,
    title: "text-foreground",
  },
};

interface Props {
  candidates: InsightCandidate[];
}

/**
 * Mobile contextual insight cards. Shows the single highest-priority
 * candidate that has not been dismissed in the last 7 days. Dismissals
 * persist via useInsightDismissal.
 */
const MobileInsightCards = ({ candidates }: Props) => {
  const { isDismissed, dismiss } = useInsightDismissal();

  const active = useMemo(() => {
    const live = candidates.filter((c) => !isDismissed(c.id));
    if (live.length === 0) return null;
    return live.slice().sort((a, b) => a.priority - b.priority)[0];
  }, [candidates, isDismissed]);

  if (!active) return null;

  const cfg = TONE[active.tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex items-start gap-3 rounded-2xl border px-3 py-3 pr-9 text-[13px] ${cfg.wrap}`}
    >
      <span className={`mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full ${cfg.iconWrap}`}>
        {cfg.icon}
      </span>
      <div className="min-w-0 flex-1 leading-snug">
        <p className={`text-[13px] font-semibold ${cfg.title}`}>{active.title}</p>
        <div className="mt-0.5 text-[13px] text-foreground/85">{active.body}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          haptic.light();
          dismiss(active.id);
        }}
        aria-label="Dismiss insight"
        className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export { Info };
export default MobileInsightCards;
