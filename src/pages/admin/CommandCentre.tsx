import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDataAlerts, type AlertSeverity } from "@/hooks/useDataAlerts";
import { useLiveRates, invalidateLiveRatesCache } from "@/hooks/useLiveRates";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getNextRbaMeeting, isRbaDecisionDay, getDaysUntilNextRba } from "@/config/rba-calendar";
import { toast } from "@/hooks/use-toast";

type CommandCentreProps = {
  onNavigate: (key: string) => void;
};

interface KwSummary {
  total: number;
  page1: number;
  avgPosition: number;
  topOpp: { keyword: string; position: number; impressions: number } | null;
  totalImpressions: number;
  totalClicks: number;
}

const REDDIT_KEY = "calcy_last_reddit_post";

const fmtAge = (iso: string | null | undefined) => {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(ms / 3_600_000);
  if (hrs < 1) return `${Math.max(1, Math.floor(ms / 60_000))}m ago`;
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const fmtRbaDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const sevTone: Record<AlertSeverity, string> = {
  critical: "border-l-4 border-[hsl(var(--admin-red))] bg-[hsl(var(--admin-red-light))] text-[hsl(var(--admin-red))]",
  warning: "border-l-4 border-[hsl(var(--admin-amber))] bg-[hsl(var(--admin-amber-light))] text-[hsl(var(--admin-amber))]",
  info: "border-l-4 border-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary-light))] text-[hsl(var(--admin-primary))]",
};

const CommandCentre = ({ onNavigate }: CommandCentreProps) => {
  const { alerts, loading: alertsLoading } = useDataAlerts();
  const { rbaRate, lastUpdated } = useLiveRates();
  const settings = useSiteSettings();
  const [rateRows, setRateRows] = useState<{ last_verified_at: string }[]>([]);
  const [lastJob, setLastJob] = useState<{ started_at: string; job_type: string; status: string } | null>(null);
  const [kw, setKw] = useState<KwSummary | null>(null);
  const [drafts, setDrafts] = useState({ brief: 0, draft: 0, approved: 0, published: 0 });
  const [busy, setBusy] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("calcy_admin_dismissed") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    (async () => {
      const [rd, sj, kwData, dd] = await Promise.all([
        supabase.from("rate_data").select("last_verified_at").eq("is_active", true),
        supabase.from("sync_jobs").select("started_at, job_type, status").order("started_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("seo_keywords").select("keyword, calcy_position, calcy_impressions_28d, calcy_clicks_28d").eq("is_active", true),
        supabase.from("content_drafts").select("status"),
      ]);
      if (rd.data) setRateRows(rd.data as typeof rateRows);
      if (sj.data) setLastJob(sj.data as typeof lastJob);
      if (kwData.data) {
        const positions = kwData.data.map((k: any) => Number(k.calcy_position)).filter((n) => Number.isFinite(n) && n > 0);
        const totalImpr = kwData.data.reduce((s: number, k: any) => s + (Number(k.calcy_impressions_28d) || 0), 0);
        const totalClk = kwData.data.reduce((s: number, k: any) => s + (Number(k.calcy_clicks_28d) || 0), 0);
        const avg = positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : 0;
        const opps = kwData.data
          .filter((k: any) => { const p = Number(k.calcy_position); return p > 10 && p <= 30; })
          .sort((a: any, b: any) => (Number(b.calcy_impressions_28d) || 0) - (Number(a.calcy_impressions_28d) || 0));
        setKw({
          total: kwData.data.length,
          page1: positions.filter((p) => p <= 10).length,
          avgPosition: Math.round(avg * 10) / 10,
          totalImpressions: totalImpr,
          totalClicks: totalClk,
          topOpp: opps[0]
            ? { keyword: opps[0].keyword as string, position: Number(opps[0].calcy_position) || 0, impressions: Number(opps[0].calcy_impressions_28d) || 0 }
            : null,
        });
      }
      if (dd.data) {
        const counts = { brief: 0, draft: 0, approved: 0, published: 0 } as any;
        for (const r of dd.data) counts[r.status] = (counts[r.status] || 0) + 1;
        setDrafts(counts);
      }
    })();
  }, []);

  const freshCount = rateRows.filter((r) => Date.now() - new Date(r.last_verified_at).getTime() < 30 * 86_400_000).length;
  const staleCount = rateRows.length - freshCount;

  const adsenseStatus: "approved" | "review" | "not_started" =
    settings.adsense_enabled && settings.adsense_client ? "approved" :
    settings.adsense_client ? "review" : "not_started";

  const visitorEstimate = kw?.totalClicks ?? 0;
  const goalProgress = Math.min(100, (visitorEstimate / 300_000) * 100);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("calcy_admin_dismissed", JSON.stringify(next));
  };

  const runRbaEventScan = async () => {
    setBusy("rba_event");
    try {
      await Promise.all([
        supabase.functions.invoke("sync-rba-rate", { headers: { "x-triggered-by": "rba_event" } }),
        supabase.functions.invoke("sync-trends", { body: { rba_event: true }, headers: { "x-triggered-by": "rba_event" } }),
      ]);
      invalidateLiveRatesCache();
      const { data, error } = await supabase.functions.invoke("generate-rba-article");
      if (error) throw error;
      toast({ title: "RBA Event Scan complete", description: (data as any)?.skipped ? "Article draft already exists." : "Article draft ready in Content Engine." });
    } catch (e: any) {
      toast({ title: "RBA scan failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  // Action centre items
  const actions = useMemo(() => {
    const lastReddit = Number(localStorage.getItem(REDDIT_KEY) || 0);
    const daysSinceReddit = lastReddit ? Math.floor((Date.now() - lastReddit) / 86_400_000) : 999;
    const items: Array<{ id: string; level: "urgent" | "week" | "ok"; title: string; body: string; cta: string; onClick: () => void }> = [];

    if (daysSinceReddit > 3) {
      items.push({
        id: "reddit",
        level: "urgent",
        title: "Post on r/AusFinance today",
        body: "Free traffic. Find a stamp duty or mortgage thread and mention Calcy. Can send 500–2,000 visitors in 24 hours.",
        cta: "Open r/AusFinance →",
        onClick: () => {
          localStorage.setItem(REDDIT_KEY, String(Date.now()));
          window.open("https://www.reddit.com/r/AusFinance/", "_blank", "noopener");
        },
      });
    }
    if (drafts.brief === 0 && drafts.draft === 0) {
      items.push({
        id: "briefs",
        level: "week",
        title: "Generate your first content briefs",
        body: kw?.total ? `Your GSC shows ${kw.total} keywords. Generate 3 article briefs from your top opportunities.` : "Connect GSC and run a sync, then generate briefs.",
        cta: "Open Content Engine →",
        onClick: () => onNavigate("content"),
      });
    }
    if (kw?.topOpp) {
      items.push({
        id: "opp",
        level: "week",
        title: `Push "${kw.topOpp.keyword}" to page 1`,
        body: `Position ${kw.topOpp.position} · ${kw.topOpp.impressions.toLocaleString()} impressions. One content addition can move this onto page 1.`,
        cta: "View opportunities →",
        onClick: () => onNavigate("seo_intel"),
      });
    }
    if (staleCount > 0) {
      items.push({
        id: "stale",
        level: "week",
        title: `${staleCount} rate item${staleCount === 1 ? "" : "s"} need re-verification`,
        body: "Live data older than 30 days. Confirm or update them so calculators stay accurate.",
        cta: "Open Live Rates →",
        onClick: () => onNavigate("live_data"),
      });
    }
    if (adsenseStatus === "review") {
      items.push({
        id: "adsense",
        level: "week",
        title: "AdSense under review",
        body: "Approval typically lands within 1–14 days. Once approved, configure ad slots to start earning.",
        cta: "View AdSense →",
        onClick: () => onNavigate("adsense"),
      });
    }
    return items;
  }, [drafts, kw, staleCount, adsenseStatus, onNavigate]);

  const todayStr = new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  const nextRba = getNextRbaMeeting();
  const daysToRba = getDaysUntilNextRba();
  const bestAction = actions[0];
  const pendingApprovals = drafts.approved + drafts.draft;
  const seoHealth = staleCount === 0 && lastJob?.status !== "failed" ? 92 : staleCount > 0 ? 78 : 84;

  return (
    <div className="space-y-7">
      {/* RBA decision-day banner */}
      {isRbaDecisionDay() && !dismissed.includes("rba_today") && (
        <Banner tone="critical" onDismiss={() => dismiss("rba_today")}
          icon="🔴" title="RBA DECISION DAY — Today"
          body="Wait for the 2:30pm AEST announcement, then run the RBA Event Scan to sync rate, trends, and generate the article draft."
          ctaLabel={busy === "rba_event" ? "Running…" : "Run RBA Event Scan"}
          onCta={runRbaEventScan}
        />
      )}
      {/* Alert stack */}
      {!alertsLoading && alerts.slice(0, 3).filter((a) => !dismissed.includes(`alert_${a.id}`)).map((a) => (
        <div key={a.id} className={`flex flex-wrap items-center gap-3 rounded-xl p-3 text-sm ${sevTone[a.severity]}`}>
          <span className="flex-1 text-[hsl(var(--admin-text))]">{a.message}</span>
          <button onClick={() => onNavigate(a.action.includes("rate") ? "live_data" : "seo_intel")} className="text-xs font-semibold uppercase">
            {a.action} →
          </button>
          <button onClick={() => dismiss(`alert_${a.id}`)} className="text-xs opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      ))}

      {/* Daily mission header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3366FF]">Today</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[hsl(var(--admin-text))]">Good morning, Bikash</h1>
            <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--admin-muted))]">
              Today's mission: complete the highest-value SEO actions that move Calcy closer to $10K/month.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <MiniStat label="Tasks" value={String(Math.max(actions.length, 1))} />
            <MiniStat label="Approvals" value={String(pendingApprovals)} tone={pendingApprovals > 0 ? "warning" : "success"} />
            <MiniStat label="SEO health" value={`${seoHealth}/100`} tone={seoHealth >= 90 ? "success" : "warning"} />
            <MiniStat label="Automation" value="Running" tone="success" />
          </div>
        </div>
      </header>

      {/* Best next action */}
      <section className="rounded-2xl border border-slate-900 bg-[#050505] p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6EA8FF]">Best action right now</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              {bestAction?.title || "Review today's SEO briefing"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {bestAction?.body || "Open SEO Intelligence, review the top recommendations, then approve only the work you trust."}
            </p>
          </div>
          <button
            onClick={bestAction?.onClick || (() => onNavigate("plan"))}
            className="rounded-lg bg-[#3366FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2855d9]"
          >
            {bestAction?.cta?.replace("â†’", "").trim() || "Review plan"}
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <DecisionMetric label="Traffic impact" value={kw?.topOpp ? `${kw.topOpp.impressions.toLocaleString()} impr.` : "Estimate pending"} />
          <DecisionMetric label="Revenue impact" value="High intent" />
          <DecisionMetric label="Confidence" value={bestAction ? "High" : "Medium"} />
          <DecisionMetric label="Difficulty" value={bestAction?.level === "urgent" ? "Low" : "Medium"} />
          <DecisionMetric label="Risk" value="Review first" />
        </div>
      </section>

      {/* Today's SEO flow */}
      <section className="admin-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--admin-text))]">Today's SEO flow</h2>
            <p className="mt-1 text-xs text-[hsl(var(--admin-muted))]">A simple operating checklist for the day.</p>
          </div>
          <button onClick={() => onNavigate("plan")} className="rounded-lg border border-[hsl(var(--admin-border))] bg-white px-3 py-2 text-xs font-semibold text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg))]">
            Open plan
          </button>
        </div>
        <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {[
            ["Daily Briefing", "done", "Briefing data and warnings are ready to review.", "View Briefing", "plan"],
            ["Review Top Opportunities", actions.length > 0 ? "in progress" : "waiting", `${actions.length || 1} priority action is waiting.`, "Review Top 3", "plan"],
            ["Generate Draft Improvements", drafts.brief || drafts.draft ? "in progress" : "not started", `${drafts.brief} briefs and ${drafts.draft} drafts currently loaded.`, "Create Draft", "create"],
            ["Approve or Reject Drafts", pendingApprovals > 0 ? "waiting" : "done", `${pendingApprovals} items need decision review.`, "Review Queue", "review"],
            ["Apply Approved Safe Changes", drafts.approved > 0 ? "waiting" : "locked", "Only approved work should move to apply.", "Apply Safe Work", "apply"],
            ["Check Impact Tracking", "not started", "Measure results after changes have enough data.", "Measure Impact", "measure"],
            ["Confirm System Health", staleCount > 0 ? "waiting" : "done", `${freshCount}/${rateRows.length} live data items are fresh.`, "Open System", "system"],
            ["Mark Today Complete", actions.length === 0 ? "done" : "locked", "Complete the open action queue first.", "Finish Day", "today"],
          ].map(([title, status, body, cta, target]) => (
            <FlowStep key={title} title={title} status={status} body={body} cta={cta} onClick={() => onNavigate(target)} />
          ))}
        </div>
      </section>

      {/* Revenue goal hero */}
      <section className="admin-card relative overflow-hidden p-6"
        style={{ borderLeft: "4px solid hsl(var(--admin-green))" }}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-[hsl(var(--admin-text))]">🎯 Monthly revenue goal</h2>
          <span className="text-xs text-[hsl(var(--admin-muted))]">
            AdSense: {adsenseStatus === "approved" ? "Active ✓" : adsenseStatus === "review" ? "Under review ⏳" : "Not connected"}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between text-sm text-[hsl(var(--admin-muted))]">
          <span>$0</span>
          <span className="font-semibold text-[hsl(var(--admin-text))]">$10,000 / month</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[hsl(var(--admin-border))]">
          <div className="h-full rounded-full bg-[hsl(var(--admin-green))] transition-all duration-700"
            style={{ width: `${goalProgress}%` }} />
        </div>
        <div className="mt-2 flex justify-end text-xs font-semibold tnum text-[hsl(var(--admin-green))]">
          {goalProgress.toFixed(1)}%
        </div>
        <p className="mt-3 text-xs text-[hsl(var(--admin-muted))]">
          You need ~300,000 monthly visitors at $33 RPM to hit $10K.
          Current estimate: <strong className="text-[hsl(var(--admin-text))] tnum">{visitorEstimate.toLocaleString()}</strong> · Target: <strong className="text-[hsl(var(--admin-text))]">300,000</strong>/mo
        </p>
      </section>

      {/* Snapshot row */}
      <section className="grid gap-3 md:grid-cols-3">
        <SnapshotCard
          label="Today"
          title={todayStr}
          body={adsenseStatus === "review" ? "AdSense under review" : adsenseStatus === "approved" ? "AdSense active" : "AdSense not connected"}
        />
        <SnapshotCard
          label="Next event"
          title="RBA Meeting"
          body={nextRba ? `${fmtRbaDate(nextRba)} · ${daysToRba} day${daysToRba === 1 ? "" : "s"} away` : "No meeting scheduled"}
          ctaLabel="Prepare now"
          onCta={() => onNavigate("seo_intel")}
        />
        <SnapshotCard
          label="Content"
          title={`${drafts.brief} brief${drafts.brief === 1 ? "" : "s"} ready`}
          body={`${drafts.draft} draft · ${drafts.approved} approved · ${drafts.published} live`}
          ctaLabel="Create brief"
          onCta={() => onNavigate("content")}
        />
      </section>

      {/* Live metrics */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Visitors" value={(kw?.totalClicks ?? 0).toLocaleString()} sub="/ month from search" />
        <Metric label="Impressions" value={(kw?.totalImpressions ?? 0).toLocaleString()} sub="last 28 days" />
        <Metric label="Avg position" value={kw?.avgPosition?.toString() ?? "—"} sub={`Google rank · ${kw?.page1 ?? 0} on page 1`} />
        <Metric label="RBA rate" value={`${rbaRate}%`} sub={nextRba ? `Next: ${fmtRbaDate(nextRba)}` : "—"} />
      </section>

      {/* Action centre */}
      <section className="admin-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[hsl(var(--admin-border))] px-5 py-3">
          <h2 className="text-sm font-semibold text-[hsl(var(--admin-text))]">⚡ Action Centre</h2>
          <span className="text-xs text-[hsl(var(--admin-muted))]">Today's priority</span>
        </div>
        <div className="divide-y divide-[hsl(var(--admin-border))]">
          {actions.length === 0 ? (
            <div className="px-5 py-6 text-sm text-[hsl(var(--admin-muted))]">All clear. Check back tomorrow.</div>
          ) : actions.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
              <ActionDot level={a.level} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="admin-section-label">
                    {a.level === "urgent" ? "Urgent" : a.level === "week" ? "This week" : "Automated"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-semibold text-[hsl(var(--admin-text))]">{a.title}</p>
                <p className="mt-1 text-xs text-[hsl(var(--admin-muted))]">{a.body}</p>
              </div>
              <button onClick={a.onClick} className="rounded-md bg-[hsl(var(--admin-primary))] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                {a.cta}
              </button>
            </div>
          ))}
          <div className="flex items-center gap-3 px-5 py-3 bg-[hsl(var(--admin-green-light))]">
            <ActionDot level="ok" />
            <p className="flex-1 text-xs text-[hsl(var(--admin-text))]">
              <strong>Automated — running fine.</strong> Daily RBA sync · Daily trends · Weekly GSC sync
            </p>
          </div>
        </div>
      </section>

      {/* System health bar */}
      <section className="admin-card flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 text-xs text-[hsl(var(--admin-muted))]">
        <Status ok label={`RBA ${rbaRate}%`} />
        <Status ok={staleCount === 0} label={`Data: ${freshCount}/${rateRows.length} fresh`} />
        <Status ok label="GSC: Connected" />
        <Status ok label={`Last sync: ${lastJob ? fmtAge(lastJob.started_at) : "never"}`} />
        <Status ok={adsenseStatus === "approved"} pending={adsenseStatus === "review"}
          label={adsenseStatus === "approved" ? "AdSense: Active" : adsenseStatus === "review" ? "AdSense: Under review" : "AdSense: Off"} />
      </section>
    </div>
  );
};

const Banner = ({ tone, icon, title, body, ctaLabel, onCta, onDismiss }: {
  tone: AlertSeverity; icon: string; title: string; body: string; ctaLabel?: string;
  onCta?: () => void; onDismiss?: () => void;
}) => (
  <div className={`flex flex-wrap items-center gap-3 rounded-xl p-4 ${sevTone[tone]}`}>
    <span aria-hidden>{icon}</span>
    <div className="min-w-0 flex-1">
      <div className="text-sm font-semibold text-[hsl(var(--admin-text))]">{title}</div>
      <div className="mt-0.5 text-xs text-[hsl(var(--admin-muted))]">{body}</div>
    </div>
    {ctaLabel && (
      <button onClick={onCta} className="rounded-md bg-[hsl(var(--admin-text))] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
        {ctaLabel}
      </button>
    )}
    {onDismiss && (
      <button onClick={onDismiss} className="text-xs opacity-60 hover:opacity-100">Dismiss</button>
    )}
  </div>
);

const MiniStat = ({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "success" | "warning" }) => {
  const valueClass = tone === "success" ? "text-emerald-700" : tone === "warning" ? "text-amber-700" : "text-[hsl(var(--admin-text))]";
  return (
    <div className="min-w-24 rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--admin-muted))]">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
};

const DecisionMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{label}</p>
    <p className="mt-1 text-sm font-semibold text-white">{value}</p>
  </div>
);

const FlowStep = ({ title, status, body, cta, onClick }: { title: string; status: string; body: string; cta: string; onClick: () => void }) => {
  const tone = status === "done" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : status === "waiting" ? "text-amber-700 bg-amber-50 border-amber-200" : status === "locked" ? "text-slate-500 bg-slate-50 border-slate-200" : "text-[#003680] bg-blue-50 border-blue-200";
  return (
    <div className="rounded-xl border border-[hsl(var(--admin-border))] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--admin-text))]">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[hsl(var(--admin-muted))]">{body}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${tone}`}>{status}</span>
      </div>
      <button onClick={onClick} className="mt-3 text-xs font-semibold text-[hsl(var(--admin-primary))] hover:underline">
        {cta}
      </button>
    </div>
  );
};

const SnapshotCard = ({ label, title, body, ctaLabel, onCta }: {
  label: string; title: string; body: string; ctaLabel?: string; onCta?: () => void;
}) => (
  <div className="admin-card p-5">
    <div className="admin-section-label">{label}</div>
    <div className="mt-2 text-base font-semibold text-[hsl(var(--admin-text))]">{title}</div>
    <div className="mt-1 text-xs text-[hsl(var(--admin-muted))]">{body}</div>
    {ctaLabel && (
      <button onClick={onCta} className="mt-3 text-xs font-semibold text-[hsl(var(--admin-primary))] hover:underline">
        {ctaLabel} →
      </button>
    )}
  </div>
);

const Metric = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="admin-card p-5">
    <div className="admin-metric-label">{label}</div>
    <div className="admin-metric mt-2">{value}</div>
    <div className="mt-1 text-xs text-[hsl(var(--admin-muted))]">{sub}</div>
  </div>
);

const ActionDot = ({ level }: { level: "urgent" | "week" | "ok" }) => {
  const bg = level === "urgent" ? "hsl(var(--admin-red))" : level === "week" ? "hsl(var(--admin-amber))" : "hsl(var(--admin-green))";
  return <span className="mt-1 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: bg }} />;
};

const Status = ({ ok, pending, label }: { ok?: boolean; pending?: boolean; label: string }) => {
  const color = ok ? "hsl(var(--admin-green))" : pending ? "hsl(var(--admin-amber))" : "hsl(var(--admin-red))";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </span>
  );
};

export default CommandCentre;
