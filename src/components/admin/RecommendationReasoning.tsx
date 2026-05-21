import { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles, ShieldAlert, TrendingUp, Gauge, Wrench, DollarSign } from "lucide-react";

export type DecisionReasoning = {
  why_matters?: string;
  why_prioritized?: string;
  expected_ranking_impact?: string;
  expected_traffic_impact?: string;
  expected_revenue_impact?: string;
  pattern_reasoning?: string;
  winning_patterns_used?: string[];
  risky_patterns_avoided?: string[];
  confidence_explanation?: string;
  implementation_effort?: string;
  expected_roi?: string;
  business_impact_summary?: string;
  seo_reasoning?: string;
  risk_reasoning?: string;
  signal_breakdown?: { label: string; value: string | number }[];
  generated_at?: string;
};

interface Props {
  reasoning?: DecisionReasoning | null;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

function pickReasoning(input: any): DecisionReasoning | null {
  if (!input) return null;
  if (input.why_matters || input.business_impact_summary || input.signal_breakdown) return input as DecisionReasoning;
  return null;
}

/**
 * Expandable "Why this recommendation?" panel.
 * Pass either a reasoning object or any signals/payload/source_refs blob
 * (it will auto-extract a nested `reasoning` field).
 */
export default function RecommendationReasoning({ reasoning, title = "Why this recommendation?", defaultOpen = false, className = "" }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const r = pickReasoning(reasoning) || pickReasoning((reasoning as any)?.reasoning);

  if (!r) {
    return (
      <div className={`mt-2 rounded-md border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground ${className}`}>
        Decision intelligence not yet generated for this item. Re-run the engine to populate explanations.
      </div>
    );
  }

  return (
    <div className={`mt-2 rounded-md border border-border/70 bg-card ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted/40"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>{title}</span>
        {r.expected_roi && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
            ROI: {String(r.expected_roi).replace("_", " ")}
          </span>
        )}
        {r.implementation_effort && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Effort: {r.implementation_effort}
          </span>
        )}
      </button>

      {open && (
        <div className="space-y-3 border-t border-border/60 px-3 py-3 text-xs">
          {r.business_impact_summary && (
            <div className="rounded bg-primary/5 px-2 py-2 text-foreground">
              <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Business impact</div>
              <p>{r.business_impact_summary}</p>
            </div>
          )}

          <Section icon={<Gauge className="h-3.5 w-3.5" />} label="Why this matters" body={r.why_matters} />
          <Section icon={<Gauge className="h-3.5 w-3.5" />} label="Why prioritized" body={r.why_prioritized} />
          <Section icon={<TrendingUp className="h-3.5 w-3.5" />} label="Expected ranking impact" body={r.expected_ranking_impact} />
          <Section icon={<TrendingUp className="h-3.5 w-3.5" />} label="Expected traffic impact" body={r.expected_traffic_impact} />
          <Section icon={<DollarSign className="h-3.5 w-3.5" />} label="Expected revenue impact" body={r.expected_revenue_impact} />
          <Section icon={<Sparkles className="h-3.5 w-3.5" />} label="Pattern influence" body={r.pattern_reasoning} />

          {(r.winning_patterns_used?.length || r.risky_patterns_avoided?.length) ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {r.winning_patterns_used?.length ? (
                <div className="rounded border border-green-500/30 bg-green-500/5 p-2">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-green-700">Winning patterns used</div>
                  <ul className="list-disc pl-4 text-foreground">
                    {r.winning_patterns_used.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              ) : null}
              {r.risky_patterns_avoided?.length ? (
                <div className="rounded border border-amber-500/30 bg-amber-500/5 p-2">
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    <ShieldAlert className="h-3 w-3" /> Risky patterns flagged
                  </div>
                  <ul className="list-disc pl-4 text-foreground">
                    {r.risky_patterns_avoided.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <Section icon={<Gauge className="h-3.5 w-3.5" />} label="Confidence" body={r.confidence_explanation} />
          <Section icon={<ShieldAlert className="h-3.5 w-3.5" />} label="Risk" body={r.risk_reasoning} />
          <Section icon={<Wrench className="h-3.5 w-3.5" />} label="SEO reasoning" body={r.seo_reasoning} />

          {r.signal_breakdown?.length ? (
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Signal breakdown</div>
              <div className="grid grid-cols-2 gap-1 md:grid-cols-3">
                {r.signal_breakdown.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded bg-muted/50 px-2 py-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="tnum font-medium text-foreground">{String(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {r.generated_at && (
            <p className="pt-1 text-[10px] text-muted-foreground">Generated {new Date(r.generated_at).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ icon, label, body }: { icon: React.ReactNode; label: string; body?: string }) {
  if (!body) return null;
  return (
    <div>
      <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}<span>{label}</span>
      </div>
      <p className="text-foreground">{body}</p>
    </div>
  );
}
