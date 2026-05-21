type Pattern = {
  id: string;
  pattern_key: string;
  pattern_type: string;
  draft_type: string | null;
  page_type: string | null;
  keyword_intent: string | null;
  confidence_level: string;
  average_ctr_delta: number | null;
  average_click_delta: number | null;
  average_position_delta: number | null;
  success_count: number;
  failure_count: number;
  neutral_count: number;
  recommendation: string | null;
  status: string;
  updated_at: string;
};

const toneStyles = {
  green: "border-emerald-200 bg-emerald-50",
  red: "border-rose-200 bg-rose-50",
  neutral: "border-border bg-surface",
} as const;

const confidenceBadge = (c: string) => {
  const cls =
    c === "high"
      ? "bg-emerald-100 text-emerald-800"
      : c === "medium"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-700";
  return <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${cls}`}>{c}</span>;
};

const fmtDelta = (v: number | null, suffix = "") => {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v}${suffix}`;
};

export function PatternList({
  title,
  tone,
  emptyText,
  patterns,
}: {
  title: string;
  tone: "green" | "red" | "neutral";
  emptyText: string;
  patterns: Pattern[];
}) {
  return (
    <div className={`rounded-2xl border ${toneStyles[tone]} p-5`}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {patterns.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {patterns.slice(0, 12).map((p) => {
            const label = [p.draft_type, p.page_type, p.keyword_intent].filter(Boolean).join(" · ") || p.pattern_key;
            const total = p.success_count + p.failure_count + p.neutral_count;
            const winRate = total > 0 ? Math.round((p.success_count / total) * 100) : 0;
            return (
              <li key={p.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    {confidenceBadge(p.confidence_level)}
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.pattern_type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {p.success_count}W / {p.failure_count}L / {p.neutral_count}N · {winRate}% win
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                  <div>CTR Δ: <span className="font-mono text-foreground">{fmtDelta(p.average_ctr_delta != null ? Math.round(p.average_ctr_delta * 10000) / 100 : null, "pp")}</span></div>
                  <div>Clicks Δ: <span className="font-mono text-foreground">{fmtDelta(p.average_click_delta)}</span></div>
                  <div>Position Δ: <span className="font-mono text-foreground">{fmtDelta(p.average_position_delta)}</span></div>
                </div>
                {p.recommendation && (
                  <p className="mt-2 text-xs text-foreground">{p.recommendation}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
