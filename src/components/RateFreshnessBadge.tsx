import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useLiveRates } from "@/hooks/useLiveRates";

const STALE_DAYS = 30;
const DAY_MS = 86_400_000;

function walkLatestVerified(node: unknown, acc: { ts: number }) {
  if (!node || typeof node !== "object") return;
  const meta = (node as { _meta?: { last_verified?: string } })._meta;
  if (meta?.last_verified) {
    const t = Date.parse(meta.last_verified);
    if (Number.isFinite(t) && t > acc.ts) acc.ts = t;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === "_meta") continue;
    walkLatestVerified(v, acc);
  }
}

const RateFreshnessBadge = ({ className = "" }: { className?: string }) => {
  const { rates, loading, error } = useLiveRates();

  const latest = useMemo(() => {
    if (!rates) return null;
    const acc = { ts: 0 };
    walkLatestVerified(rates, acc);
    return acc.ts > 0 ? new Date(acc.ts) : null;
  }, [rates]);

  if (loading && !latest) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] text-muted-foreground ${className}`}
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        Checking rate freshness…
      </div>
    );
  }

  const ageDays = latest ? (Date.now() - latest.getTime()) / DAY_MS : Infinity;
  const isStale = !latest || ageDays > STALE_DAYS || !!error;

  const label = latest
    ? latest.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  const relative = latest ? formatRelative(ageDays) : "data unavailable";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium ${
        isStale
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-success/30 bg-success/10 text-success"
      } ${className}`}
      title={`Live rate data last verified ${label}${isStale ? " — may be out of date" : ""}`}
    >
      {isStale ? (
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span>
        {isStale ? "Rates may be stale" : "Rates current"} · {relative}
      </span>
    </div>
  );
};

function formatRelative(days: number): string {
  if (!Number.isFinite(days)) return "verification pending";
  if (days < 1) return "updated today";
  if (days < 2) return "updated yesterday";
  if (days < 31) return `updated ${Math.round(days)} days ago`;
  const months = Math.round(days / 30);
  return `updated ${months} month${months === 1 ? "" : "s"} ago`;
}

export default RateFreshnessBadge;
