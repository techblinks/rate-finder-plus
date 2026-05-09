import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDataAlerts, type AlertSeverity } from "@/hooks/useDataAlerts";
import { useLiveRates, invalidateLiveRatesCache } from "@/hooks/useLiveRates";
import { getNextRbaMeeting, isRbaDecisionDay, getDaysUntilNextRba } from "@/config/rba-calendar";

const fmtRbaDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
import { toast } from "@/hooks/use-toast";

interface SyncJobLite {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  records_updated: number | null;
  summary: Record<string, unknown> | null;
}

interface KeywordSummary {
  total: number;
  page1: number;
  page2: number;
  avgPosition: number;
  avgPositionPrev: number;
  topOpp: {
    keyword: string;
    position: number;
    impressions: number;
  } | null;
}

const sevTone: Record<AlertSeverity, string> = {
  critical: "border-l-4 border-red-500 bg-red-50 text-red-900",
  warning: "border-l-4 border-amber-500 bg-amber-50 text-amber-900",
  info: "border-l-4 border-blue-500 bg-blue-50 text-blue-900",
};

const sevIcon: Record<AlertSeverity, string> = {
  critical: "🔴",
  warning: "⚠️",
  info: "ℹ️",
};

const fmtAge = (iso: string | null | undefined) => {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(ms / 3_600_000);
  if (hrs < 1) return `${Math.max(1, Math.floor(ms / 60_000))} min ago`;
  if (hrs < 48) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  return `${Math.floor(hrs / 24)} days ago`;
};

const SETUP_KEY = "calcy_admin_setup_v1";
const DEFAULT_CHECKS = {
  google_oauth: false,
  connect_gsc: false,
  first_gsc_sync: false,
  verify_rates: false,
  test_rba_sync: false,
};

const DashboardPanel = () => {
  const { alerts, loading: alertsLoading } = useDataAlerts();
  const { rbaRate, lastUpdated } = useLiveRates();
  const [rateRows, setRateRows] = useState<{ last_verified_at: string }[]>([]);
  const [lastJob, setLastJob] = useState<SyncJobLite | null>(null);
  const [kwSummary, setKwSummary] = useState<KeywordSummary | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    try {
      return { ...DEFAULT_CHECKS, ...JSON.parse(localStorage.getItem(SETUP_KEY) || "{}") };
    } catch {
      return { ...DEFAULT_CHECKS };
    }
  });

  useEffect(() => {
    (async () => {
      const [rd, sj, kw] = await Promise.all([
        supabase.from("rate_data").select("last_verified_at").eq("is_active", true),
        supabase
          .from("sync_jobs")
          .select("id, job_type, status, started_at, records_updated, summary")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("seo_keywords")
          .select("keyword, calcy_position, calcy_position_previous, calcy_impressions_28d")
          .eq("is_active", true),
      ]);
      if (rd.data) setRateRows(rd.data as typeof rateRows);
      if (sj.data) setLastJob(sj.data as SyncJobLite);
      if (kw.data) {
        const positions = kw.data
          .map((k) => Number(k.calcy_position))
          .filter((n) => Number.isFinite(n) && n > 0);
        const prevPositions = kw.data
          .map((k) => Number(k.calcy_position_previous))
          .filter((n) => Number.isFinite(n) && n > 0);
        const page1 = positions.filter((p) => p <= 10).length;
        const page2 = positions.filter((p) => p > 10 && p <= 20).length;
        const avg = positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : 0;
        const avgPrev = prevPositions.length
          ? prevPositions.reduce((a, b) => a + b, 0) / prevPositions.length
          : avg;
        const opps = kw.data
          .filter((k) => {
            const p = Number(k.calcy_position);
            return p > 10 && p <= 30;
          })
          .sort(
            (a, b) =>
              (Number(b.calcy_impressions_28d) || 0) - (Number(a.calcy_impressions_28d) || 0),
          );
        const top = opps[0];
        setKwSummary({
          total: kw.data.length,
          page1,
          page2,
          avgPosition: Math.round(avg * 10) / 10,
          avgPositionPrev: Math.round(avgPrev * 10) / 10,
          topOpp: top
            ? {
                keyword: top.keyword as string,
                position: Number(top.calcy_position) || 0,
                impressions: Number(top.calcy_impressions_28d) || 0,
              }
            : null,
        });
      }
    })();
  }, []);

  const freshCount = rateRows.filter(
    (r) => Date.now() - new Date(r.last_verified_at).getTime() < 30 * 86_400_000,
  ).length;
  const staleCount = rateRows.length - freshCount;

  const toggleCheck = (key: keyof typeof DEFAULT_CHECKS) => {
    const next = { ...checks, [key]: !checks[key] };
    setChecks(next);
    localStorage.setItem(SETUP_KEY, JSON.stringify(next));
  };

  const runSync = async (
    key: string,
    fn: "sync-rba-rate" | "sync-housing-australia" | "sync-gsc-data" | "sync-trends",
    body?: Record<string, unknown>,
    triggeredBy = "admin_manual",
  ) => {
    setBusy(key);
    try {
      const { data, error } = await supabase.functions.invoke(fn, {
        body,
        headers: { "x-triggered-by": triggeredBy },
      });
      if (error) throw error;
      invalidateLiveRatesCache();
      const summary =
        fn === "sync-rba-rate"
          ? (data as { changed?: boolean; rate?: number; previous?: number })?.changed
            ? `RBA rate updated: ${(data as { previous?: number }).previous}% → ${(data as { rate?: number }).rate}%`
            : `RBA rate confirmed: ${(data as { rate?: number }).rate}% (no change)`
          : fn === "sync-gsc-data"
            ? `${(data as { total?: number }).total ?? 0} queries · ${(data as { newKeywords?: number }).newKeywords ?? 0} new`
            : "Complete";
      toast({ title: `✓ ${fn}`, description: summary });
    } catch (err) {
      toast({
        title: `${fn} failed`,
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const runRbaEventScan = async () => {
    setBusy("rba_event");
    try {
      // 1+2: Sync RBA rate and trends
      await Promise.all([
        supabase.functions.invoke("sync-rba-rate", {
          headers: { "x-triggered-by": "rba_event" },
        }),
        supabase.functions.invoke("sync-trends", {
          body: { rba_event: true },
          headers: { "x-triggered-by": "rba_event" },
        }),
      ]);
      invalidateLiveRatesCache();

      // 3: Generate RBA announcement article draft
      const { data, error } = await supabase.functions.invoke("generate-rba-article");
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title: "✓ RBA Event Scan complete",
        description: (data as any)?.skipped
          ? "Rate synced, trends captured. Article draft already exists in Content tab."
          : "Rate synced, trends captured, article draft ready in Content tab.",
      });
    } catch (err) {
      toast({
        title: "RBA Event Scan failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts banner stack */}
      {!alertsLoading && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 5).map((a) => (
            <div
              key={a.id}
              className={`flex flex-wrap items-center gap-3 rounded-lg p-3 text-sm ${sevTone[a.severity]}`}
            >
              <span aria-hidden>{sevIcon[a.severity]}</span>
              <span className="flex-1">{a.message}</span>
              <span className="text-xs font-semibold uppercase opacity-80">{a.action} →</span>
            </div>
          ))}
        </div>
      )}

      {isRbaDecisionDay() && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 text-sm text-blue-900">
          <span>⚡</span>
          <span className="flex-1 font-semibold">
            RBA MEETING TODAY: Run RBA Event Scan to capture trending keywords
          </span>
          <button
            onClick={runRbaEventScan}
            disabled={!!busy}
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy === "rba_event" ? "Running…" : "Run RBA Event Scan"}
          </button>
        </div>
      )}

      {/* Live data row */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Live data health
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardLabel>🟢 RBA cash rate</CardLabel>
            <div className="mt-1 text-3xl font-bold tnum text-foreground">{rbaRate}%</div>
            <CardSub>
              {lastUpdated ? `Synced ${fmtAge(lastUpdated.toISOString())}` : "Live data"}
            </CardSub>
            <CardSub>
              Next meeting: {getNextRbaMeeting() ?? "—"}
            </CardSub>
          </Card>
          <Card>
            <CardLabel>{staleCount > 0 ? "⚠ Data freshness" : "✓ Data freshness"}</CardLabel>
            <div className="mt-1 text-3xl font-bold tnum text-foreground">
              {freshCount}/{rateRows.length}
            </div>
            <CardSub>fresh items (verified &lt; 30 days)</CardSub>
            {staleCount > 0 && (
              <CardSub className="text-amber-700">{staleCount} need attention</CardSub>
            )}
          </Card>
          <Card>
            <CardLabel>🔄 Last sync</CardLabel>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {lastJob ? fmtAge(lastJob.started_at) : "Never"}
            </div>
            <CardSub>{lastJob?.job_type ?? "—"}</CardSub>
            <CardSub
              className={
                lastJob?.status === "completed"
                  ? "text-emerald-700"
                  : lastJob?.status === "failed"
                    ? "text-red-700"
                    : ""
              }
            >
              {lastJob ? `${lastJob.status} · ${lastJob.records_updated ?? 0} updated` : ""}
            </CardSub>
          </Card>
        </div>
      </section>

      {/* SEO row */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          SEO health
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardLabel>🔍 Keywords tracked</CardLabel>
            <div className="mt-1 text-3xl font-bold tnum text-foreground">
              {kwSummary?.total ?? 0}
            </div>
            <CardSub>{kwSummary?.page1 ?? 0} on page 1</CardSub>
            <CardSub>{kwSummary?.page2 ?? 0} on page 2</CardSub>
          </Card>
          <Card>
            <CardLabel>📈 Avg position</CardLabel>
            <div className="mt-1 text-3xl font-bold tnum text-foreground">
              {kwSummary?.avgPosition ?? "—"}
            </div>
            {kwSummary && kwSummary.avgPositionPrev > 0 && (
              <CardSub
                className={
                  kwSummary.avgPosition < kwSummary.avgPositionPrev
                    ? "text-emerald-700"
                    : kwSummary.avgPosition > kwSummary.avgPositionPrev
                      ? "text-red-700"
                      : ""
                }
              >
                {kwSummary.avgPosition < kwSummary.avgPositionPrev ? "▼" : "▲"}{" "}
                {Math.abs(kwSummary.avgPosition - kwSummary.avgPositionPrev).toFixed(1)} vs prev
                sync
              </CardSub>
            )}
          </Card>
          <Card>
            <CardLabel>🎯 Top opportunity</CardLabel>
            {kwSummary?.topOpp ? (
              <>
                <div className="mt-1 text-lg font-semibold tnum text-foreground">
                  Pos {kwSummary.topOpp.position}
                </div>
                <CardSub className="line-clamp-2 break-words">
                  "{kwSummary.topOpp.keyword}"
                </CardSub>
                <CardSub>{kwSummary.topOpp.impressions.toLocaleString()} impressions</CardSub>
              </>
            ) : (
              <CardSub>No opportunities yet — run GSC sync.</CardSub>
            )}
          </Card>
        </div>
      </section>

      {/* Quick triggers */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-foreground">Quick sync triggers</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Manual triggers for each sync function. Loading state shown per button.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <TriggerButton
            label="Sync RBA rate"
            busy={busy === "rba"}
            onClick={() => runSync("rba", "sync-rba-rate")}
          />
          <TriggerButton
            label="Sync Housing Aus."
            busy={busy === "housing"}
            onClick={() => runSync("housing", "sync-housing-australia")}
          />
          <TriggerButton
            label="Sync GSC data"
            busy={busy === "gsc"}
            onClick={() => runSync("gsc", "sync-gsc-data")}
          />
          <TriggerButton
            label="Sync trends"
            busy={busy === "trends"}
            onClick={() => runSync("trends", "sync-trends")}
          />
        </div>
        <button
          onClick={runRbaEventScan}
          disabled={!!busy}
          className="mt-3 w-full rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-50"
        >
          {busy === "rba_event" ? "Running RBA Event Scan…" : "⚡ Run RBA Event Scan (rate + trending keywords)"}
        </button>
      </section>

      {/* Schedule */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-foreground">Automated schedule</h3>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <ScheduleItem when="Daily · 6:00 AEST" what="RBA rate check" />
          <ScheduleItem when="Daily · 6:30 AEST" what="Google Trends scan" />
          <ScheduleItem when="Weekly · Sun 22:00" what="GSC keyword sync" />
          <ScheduleItem when="Monthly · 1st Mon" what="Housing Australia check" />
        </ul>
        <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Manual triggers (run when needed)
        </h4>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li>⚡ <strong className="text-foreground">After each RBA meeting</strong> (8×/year) — run RBA Event Scan within 30 min</li>
          <li>📋 <strong className="text-foreground">After adding new content</strong> — run GSC Sync</li>
          <li>🏛 <strong className="text-foreground">After state budgets (May)</strong> — verify FHOG / FHB thresholds</li>
          <li>📰 <strong className="text-foreground">After First Home Guarantee changes (July)</strong> — update Housing Australia caps</li>
        </ul>
      </section>

      {/* Setup checklist */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-foreground">🚀 First-time setup checklist</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Local progress tracker — saved to your browser only.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <ChecklistItem checked label="Database tables created" />
          <ChecklistItem checked label="Rate data seeded" />
          <ChecklistItem checked label="Edge functions deployed" />
          <ChecklistItem
            checked={checks.google_oauth}
            label="Google OAuth credentials configured"
            hint="GSC_CLIENT_ID & GSC_CLIENT_SECRET added"
            onChange={() => toggleCheck("google_oauth")}
          />
          <ChecklistItem
            checked={checks.connect_gsc}
            label="Google Search Console connected"
            hint="Use the Connect GSC button in the SEO Intelligence tab"
            onChange={() => toggleCheck("connect_gsc")}
          />
          <ChecklistItem
            checked={checks.first_gsc_sync}
            label="First GSC sync run"
            onChange={() => toggleCheck("first_gsc_sync")}
          />
          <ChecklistItem
            checked={checks.verify_rates}
            label="All rate data verified"
            hint="Open Live Data → mark each item as verified"
            onChange={() => toggleCheck("verify_rates")}
          />
          <ChecklistItem
            checked={checks.test_rba_sync}
            label="RBA sync tested manually"
            onChange={() => toggleCheck("test_rba_sync")}
          />
        </ul>
      </section>
    </div>
  );
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-surface p-4">{children}</div>
);
const CardLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    {children}
  </div>
);
const CardSub = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`mt-1 text-xs text-muted-foreground ${className}`}>{children}</div>;

const ScheduleItem = ({ when, what }: { when: string; what: string }) => (
  <li className="flex items-center justify-between gap-3">
    <span className="font-mono text-xs">{when}</span>
    <span className="flex-1">{what}</span>
    <span className="text-xs text-emerald-700">Auto ✓</span>
  </li>
);

const TriggerButton = ({
  label,
  busy,
  onClick,
}: {
  label: string;
  busy: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={busy}
    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
  >
    {busy ? (
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
        Running…
      </span>
    ) : (
      label
    )}
  </button>
);

const ChecklistItem = ({
  checked,
  label,
  hint,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint?: string;
  onChange?: () => void;
}) => (
  <li className="flex items-start gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={!onChange}
      className="mt-0.5 h-4 w-4"
    />
    <span>
      <span className={`font-medium ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}>
        {label}
      </span>
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </span>
  </li>
);

export default DashboardPanel;
