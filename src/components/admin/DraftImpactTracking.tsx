import { useMemo } from "react";

export type DraftImpact = {
  id: string;
  draft_id: string;
  target_url: string;
  target_keyword: string | null;
  draft_type: string | null;
  applied_at: string;
  baseline_start: string | null;
  baseline_end: string | null;
  baseline_clicks: number;
  baseline_impressions: number;
  baseline_ctr: number;
  baseline_position: number | null;
  after_7d_clicks: number | null;
  after_7d_impressions: number | null;
  after_7d_ctr: number | null;
  after_7d_position: number | null;
  after_30d_clicks: number | null;
  after_30d_impressions: number | null;
  after_30d_ctr: number | null;
  after_30d_position: number | null;
  clicks_delta_7d: number | null;
  impressions_delta_7d: number | null;
  ctr_delta_7d: number | null;
  position_delta_7d: number | null;
  clicks_delta_30d: number | null;
  impressions_delta_30d: number | null;
  ctr_delta_30d: number | null;
  position_delta_30d: number | null;
  estimated_traffic_impact: number | null;
  estimated_revenue_impact: number | null;
  rpm_estimate: number | null;
  impact_status: string;
  confidence: string | null;
  last_computed_at: string;
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  improving: { label: "Improving", cls: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  declining: { label: "Declining", cls: "bg-red-100 text-red-900 border-red-300" },
  neutral: { label: "Neutral", cls: "bg-slate-100 text-slate-800 border-slate-300" },
  awaiting_data: { label: "Awaiting data", cls: "bg-amber-100 text-amber-900 border-amber-300" },
  insufficient_data: { label: "Insufficient data", cls: "bg-amber-50 text-amber-900 border-amber-200" },
};

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_LABEL[status] || STATUS_LABEL.neutral;
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}>{meta.label}</span>;
}

function num(n: number | null | undefined, suffix = ""): string {
  if (n == null) return "—";
  return `${n}${suffix}`;
}

function pct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${Math.round(n * 1000) / 10}%`;
}

function deltaCell(delta: number | null | undefined, opts?: { inverse?: boolean; suffix?: string; isPct?: boolean }): React.ReactNode {
  if (delta == null) return <span className="text-muted-foreground">—</span>;
  const inverse = opts?.inverse;
  const good = inverse ? delta < 0 : delta > 0;
  const bad = inverse ? delta > 0 : delta < 0;
  const sign = delta > 0 ? "+" : "";
  const text = opts?.isPct ? `${sign}${Math.round(delta * 1000) / 10}%` : `${sign}${delta}${opts?.suffix ?? ""}`;
  return (
    <span className={`font-semibold ${good ? "text-emerald-700" : bad ? "text-red-700" : "text-foreground"}`}>{text}</span>
  );
}

export function StatTile({ label, value, tone }: { label: string; value: number | string; tone?: "green" | "red" }) {
  const cls = tone === "green" ? "border-emerald-300 bg-emerald-50 text-emerald-900"
    : tone === "red" ? "border-red-300 bg-red-50 text-red-900"
    : "border-border bg-background text-foreground";
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <p className="text-[10px] uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

export function DraftImpactInline({ impact }: { impact: DraftImpact }) {
  const window = impact.after_30d_clicks != null ? "30d" : impact.after_7d_clicks != null ? "7d" : null;
  const clicksDelta = impact.clicks_delta_30d ?? impact.clicks_delta_7d;
  const posDelta = impact.position_delta_30d ?? impact.position_delta_7d;
  return (
    <span className="inline-flex items-center gap-2 text-[10px]">
      <StatusPill status={impact.impact_status} />
      {window ? (
        <>
          <span className="text-emerald-900">Δclicks ({window}): {deltaCell(clicksDelta)}</span>
          {posDelta != null && <span className="text-emerald-900">Δpos: {deltaCell(posDelta, { inverse: true })}</span>}
        </>
      ) : (
        <span className="italic text-amber-900">Waiting for 7-day post-apply data</span>
      )}
    </span>
  );
}

export function ImpactList({
  title,
  tone,
  emptyText,
  impacts,
  drafts,
}: {
  title: string;
  tone: "green" | "red" | "neutral";
  emptyText: string;
  impacts: DraftImpact[];
  drafts: Array<{ id: string; draft_type: string; proposed_change?: string; target_keyword?: string | null }>;
}) {
  const draftMap = useMemo(() => {
    const m = new Map<string, (typeof drafts)[number]>();
    for (const d of drafts) m.set(d.id, d);
    return m;
  }, [drafts]);

  const headerCls = tone === "green" ? "text-emerald-900" : tone === "red" ? "text-red-900" : "text-foreground";

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className={`text-base font-semibold ${headerCls}`}>{title}</h3>
      {impacts.length === 0 ? (
        <p className="mt-3 text-sm italic text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-2">Status</th>
                <th className="pr-2">Target</th>
                <th className="pr-2">Type</th>
                <th className="pr-2">Applied</th>
                <th className="pr-2">Baseline (28d)</th>
                <th className="pr-2">After 7d</th>
                <th className="pr-2">After 30d</th>
                <th className="pr-2">Δ clicks</th>
                <th className="pr-2">Δ pos</th>
                <th className="pr-2">Δ CTR</th>
                <th className="pr-2">Est. traffic / mo</th>
                <th className="pr-2">Est. revenue / mo</th>
              </tr>
            </thead>
            <tbody>
              {impacts.map((i) => {
                const draft = draftMap.get(i.draft_id);
                const window = i.after_30d_clicks != null ? "30d" : "7d";
                const clicksAfter = window === "30d" ? i.after_30d_clicks : i.after_7d_clicks;
                const posAfter = window === "30d" ? i.after_30d_position : i.after_7d_position;
                const ctrAfter = window === "30d" ? i.after_30d_ctr : i.after_7d_ctr;
                return (
                  <tr key={i.id} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-2"><StatusPill status={i.impact_status} /></td>
                    <td className="pr-2">
                      <a className="text-accent underline" href={i.target_url} target="_blank" rel="noreferrer">{i.target_url}</a>
                      {i.target_keyword && <div className="text-[10px] text-muted-foreground">kw: {i.target_keyword}</div>}
                      {draft?.proposed_change && <div className="mt-0.5 text-[10px] text-muted-foreground">{draft.proposed_change.slice(0, 90)}{draft.proposed_change.length > 90 ? "…" : ""}</div>}
                    </td>
                    <td className="pr-2">{i.draft_type || draft?.draft_type || "—"}</td>
                    <td className="pr-2 text-muted-foreground">{new Date(i.applied_at).toLocaleDateString("en-AU")}</td>
                    <td className="pr-2">
                      <div>{num(i.baseline_clicks)} cl · {num(i.baseline_impressions)} imp</div>
                      <div className="text-[10px] text-muted-foreground">CTR {pct(i.baseline_ctr)} · pos {num(i.baseline_position)}</div>
                    </td>
                    <td className="pr-2">
                      {i.after_7d_clicks == null
                        ? <span className="text-amber-700 italic">Waiting for 7d data</span>
                        : <>
                            <div>{num(i.after_7d_clicks)} cl · {num(i.after_7d_impressions)} imp</div>
                            <div className="text-[10px] text-muted-foreground">CTR {pct(i.after_7d_ctr)} · pos {num(i.after_7d_position)}</div>
                          </>}
                    </td>
                    <td className="pr-2">
                      {i.after_30d_clicks == null
                        ? <span className="text-amber-700 italic">Waiting for 30d data</span>
                        : <>
                            <div>{num(i.after_30d_clicks)} cl · {num(i.after_30d_impressions)} imp</div>
                            <div className="text-[10px] text-muted-foreground">CTR {pct(i.after_30d_ctr)} · pos {num(i.after_30d_position)}</div>
                          </>}
                    </td>
                    <td className="pr-2">{deltaCell(i.clicks_delta_30d ?? i.clicks_delta_7d)}</td>
                    <td className="pr-2">{deltaCell(i.position_delta_30d ?? i.position_delta_7d, { inverse: true })}</td>
                    <td className="pr-2">{deltaCell(i.ctr_delta_30d ?? i.ctr_delta_7d, { isPct: true })}</td>
                    <td className="pr-2">{i.estimated_traffic_impact == null ? "—" : <span className={i.estimated_traffic_impact >= 0 ? "text-emerald-700" : "text-red-700"}>{i.estimated_traffic_impact >= 0 ? "+" : ""}{i.estimated_traffic_impact}</span>}</td>
                    <td className="pr-2">{i.estimated_revenue_impact == null ? "—" : <span className={i.estimated_revenue_impact >= 0 ? "text-emerald-700" : "text-red-700"}>{i.estimated_revenue_impact >= 0 ? "+" : ""}${i.estimated_revenue_impact}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
