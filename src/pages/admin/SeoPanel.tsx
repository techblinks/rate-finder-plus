import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, AlertTriangle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

type SubTab = "overview" | "keywords" | "opportunities" | "reports";

type Keyword = {
  id: string;
  keyword: string;
  category: string | null;
  target_page: string | null;
  calcy_position: number | null;
  calcy_position_previous: number | null;
  calcy_clicks_28d: number | null;
  calcy_impressions_28d: number | null;
  calcy_ctr_28d: number | null;
  monthly_search_volume: number | null;
  opportunity_score: number | null;
  trend_direction: string | null;
  intent: string | null;
};

type Report = {
  id: string;
  report_type: string;
  generated_at: string;
  period_start: string | null;
  period_end: string | null;
  total_keywords_tracked: number | null;
  total_clicks_period: number | null;
  total_impressions_period: number | null;
  avg_position: number | null;
  top_opportunities: any;
  content_recommendations: any;
  full_report_data: any;
  rba_keywords: any;
};

type SyncJob = {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  records_updated: number | null;
  triggered_by: string;
  error_log: any;
};

const positionColor = (p: number | null | undefined) => {
  if (p == null) return "bg-muted text-muted-foreground";
  if (p <= 10) return "bg-emerald-100 text-emerald-900";
  if (p <= 20) return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-900";
};

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/gsc-oauth-callback`;

const RedirectUriBox = () => {
  const [copied, setCopied] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REDIRECT_URI);
      setCopied(true);
      toast({ title: "Redirect URI copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <code className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground break-all">
          {REDIRECT_URI}
        </code>
        <button
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
          title="Copy redirect URI"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={verified}
          onChange={(e) => setVerified(e.target.checked)}
          className="rounded border-border"
        />
        <span>I have pasted this exact URI into Google Cloud Console</span>
      </label>

      {verified && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>
            Good. Make sure there are no extra spaces, trailing slashes, or protocol differences in Google Cloud Console.
          </span>
        </div>
      )}

      {!verified && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>
            If you see <strong>redirect_uri_mismatch</strong>, the URI in Google Cloud Console doesn't match the one above.
          </span>
        </div>
      )}
    </div>
  );
};

const SeoPanel = () => {
  const [sub, setSub] = useState<SubTab>("overview");
  const [gscConnected, setGscConnected] = useState<boolean | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [openReportId, setOpenReportId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRange, setFilterRange] = useState("all");
  const [filterTrend, setFilterTrend] = useState("all");
  const [sortBy, setSortBy] = useState<"opportunity_score" | "calcy_position" | "calcy_impressions_28d" | "calcy_clicks_28d">("opportunity_score");
  const [page, setPage] = useState(1);

  useEffect(() => {
    void loadAll();
    // Detect callback flags
    const params = new URLSearchParams(window.location.search);
    if (params.get("gsc_connected") === "true") {
      toast({ title: "Google Search Console connected" });
      window.history.replaceState({}, "", "/admin");
    } else if (params.get("gsc_error")) {
      toast({ title: "GSC connection failed", description: params.get("gsc_error") || "", variant: "destructive" });
      window.history.replaceState({}, "", "/admin");
    }
  }, []);

  const loadAll = async () => {
    const [tokens, kw, rep, sj] = await Promise.all([
      supabase.from("gsc_oauth_tokens").select("id").eq("is_active", true).limit(1),
      supabase.from("seo_keywords").select("*").eq("is_active", true).order("opportunity_score", { ascending: false }),
      supabase.from("seo_reports").select("*").order("generated_at", { ascending: false }).limit(20),
      supabase.from("sync_jobs").select("*").in("job_type", ["gsc_data", "trends"]).order("started_at", { ascending: false }).limit(20),
    ]);
    setGscConnected((tokens.data?.length ?? 0) > 0);
    setKeywords((kw.data as Keyword[]) || []);
    setReports((rep.data as Report[]) || []);
    setLatestReport((rep.data?.find((r: Report) => r.report_type === "weekly_summary") as Report) || null);
    setJobs((sj.data as SyncJob[]) || []);
  };

  const callFunction = async (name: "sync-gsc-data" | "sync-trends", body?: any) => {
    setRunning(name);
    try {
      const { data, error } = await supabase.functions.invoke(name, { body: body ?? {} });
      if (error) throw error;
      toast({ title: `${name} complete`, description: data?.success ? "Data refreshed." : "Done." });
      await loadAll();
    } catch (err: any) {
      toast({ title: `${name} failed`, description: err.message, variant: "destructive" });
    } finally {
      setRunning(null);
    }
  };

  const startGscOAuth = () => {
    window.location.href = `${SUPABASE_URL}/functions/v1/gsc-oauth-callback`;
  };

  const filteredKeywords = useMemo(() => {
    let list = [...keywords];
    if (search) list = list.filter((k) => k.keyword.toLowerCase().includes(search.toLowerCase()));
    if (filterCategory !== "all") list = list.filter((k) => k.category === filterCategory);
    if (filterRange !== "all") {
      list = list.filter((k) => {
        const p = k.calcy_position ?? 999;
        if (filterRange === "page1") return p <= 10;
        if (filterRange === "page2") return p > 10 && p <= 20;
        if (filterRange === "page3+") return p > 20;
        return true;
      });
    }
    if (filterTrend !== "all") list = list.filter((k) => k.trend_direction === filterTrend);
    list.sort((a, b) => ((b[sortBy] as number) ?? 0) - ((a[sortBy] as number) ?? 0));
    if (sortBy === "calcy_position") list.reverse(); // ascending position
    return list;
  }, [keywords, search, filterCategory, filterRange, filterTrend, sortBy]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(filteredKeywords.length / pageSize));
  const pageItems = filteredKeywords.slice((page - 1) * pageSize, page * pageSize);

  const opportunities = useMemo(
    () =>
      keywords
        .filter((k) => (k.calcy_position ?? 0) > 10 && (k.calcy_position ?? 0) <= 30 && (k.calcy_impressions_28d ?? 0) > 50)
        .sort((a, b) => ((b.calcy_impressions_28d ?? 0) / (b.calcy_position ?? 1)) - ((a.calcy_impressions_28d ?? 0) / (a.calcy_position ?? 1)))
        .slice(0, 10),
    [keywords]
  );

  const categories = Array.from(new Set(keywords.map((k) => k.category).filter(Boolean))) as string[];

  return (
    <div className="space-y-5">
      {/* GSC Connection prompt */}
      {gscConnected === false && (
        <section className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
          <h2 className="text-lg font-semibold text-foreground">Connect Google Search Console</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your GSC account to unlock exact keyword rankings, click & impression data, automated weekly reports
            and content recommendations for calcy.com.au.
          </p>
          <button
            onClick={startGscOAuth}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            Connect Google Search Console →
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Requires a Google account with access to the calcy.com.au Search Console property.
          </p>
        </section>
      )}

      {/* Redirect URI helper */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Google Search Console — Redirect URI</h3>
            <p className="text-xs text-muted-foreground">
              Copy this exact URI and paste it into Google Cloud Console → Credentials → your OAuth Client ID → Authorized redirect URIs.
            </p>
          </div>
          <RedirectUriBox />
        </div>
      </section>

      {/* GSC 403 Troubleshooting */}
      <details className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 open:shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold">
          ⚠️ Getting a 403 / "access_denied" / "has not completed Google verification"? Click to fix.
        </summary>
        <div className="mt-4 space-y-4 text-sm">
          <p>
            Your Google OAuth app is in <strong>Testing</strong> mode, so only emails listed as <strong>Test users</strong> can sign in.
            Add <code className="rounded bg-amber-100 px-1 py-0.5">yadavabikash@gmail.com</code> (and any other admin email) to the test users list.
          </p>

          <div>
            <p className="font-semibold">Step-by-step</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                Open the Google Cloud Console OAuth consent screen:{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials/consent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  console.cloud.google.com/apis/credentials/consent →
                </a>
              </li>
              <li>Make sure the project selector (top bar) is set to the same project that owns your OAuth Client ID / Secret.</li>
              <li>
                Confirm <strong>Publishing status: Testing</strong> and <strong>User type: External</strong>.
              </li>
              <li>
                Scroll down to the <strong>Test users</strong> section and click{" "}
                <span className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">+ ADD USERS</span>.
              </li>
              <li>
                Enter <code className="rounded bg-amber-100 px-1 py-0.5">yadavabikash@gmail.com</code> and click <strong>Save</strong>.
              </li>
              <li>
                Go to <strong>Data Access</strong> (or <strong>Scopes</strong>) and confirm{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5">.../auth/webmasters.readonly</code> is listed.
              </li>
              <li>
                Open <strong>Credentials → your OAuth Client ID</strong> and verify the redirect URI is exactly:
                <pre className="mt-1 overflow-x-auto rounded bg-white p-2 text-xs">
                  {`${SUPABASE_URL}/functions/v1/gsc-oauth-callback`}
                </pre>
              </li>
              <li>
                Come back here and click <strong>Connect Google Search Console</strong> again. If Google shows
                "Google hasn't verified this app", click <strong>Advanced → Go to (unsafe)</strong> to continue —
                this is normal for apps in Testing mode.
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-amber-300 bg-white/60 p-3 text-xs">
            <p className="font-semibold">Still blocked?</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Test users can take ~1 minute to propagate — wait and retry.</li>
              <li>You must sign in with the <em>exact</em> email you added (yadavabikash@gmail.com), not a different Google account.</li>
              <li>That account must also have access to the <code>calcy.com.au</code> property in Search Console.</li>
              <li>If you see <code>redirect_uri_mismatch</code>, the URI in step 7 doesn't match — copy it exactly.</li>
            </ul>
          </div>
        </div>
      </details>

      {gscConnected && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          <span>✓ Google Search Console connected — calcy.com.au</span>
          <button onClick={() => callFunction("sync-gsc-data")} className="text-xs font-semibold underline">
            Run sync now
          </button>
        </div>
      )}

      {/* Sub-tab nav */}
      <div className="flex flex-wrap gap-2 border-b border-border">
        {(["overview", "keywords", "opportunities", "reports"] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setSub(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors ${
              sub === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {sub === "overview" && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">SEO Intelligence — Weekly Overview</h2>
                {latestReport && (
                  <p className="text-xs text-muted-foreground">
                    Period: {latestReport.period_start} – {latestReport.period_end}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => callFunction("sync-gsc-data")}
                  disabled={running !== null || !gscConnected}
                  className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
                >
                  🔄 {running === "sync-gsc-data" ? "Syncing…" : "Run GSC Sync"}
                </button>
                <button
                  onClick={() => callFunction("sync-trends")}
                  disabled={running !== null}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  📈 {running === "sync-trends" ? "Syncing…" : "Run Trends"}
                </button>
                <button
                  onClick={() => callFunction("sync-trends", { rba_event: true })}
                  disabled={running !== null}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                >
                  ⚡ RBA Event Scan
                </button>
              </div>
            </div>

            {/* KPI grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Total clicks", value: latestReport?.total_clicks_period ?? 0, change: latestReport?.full_report_data?.clicks_change },
                { label: "Impressions", value: latestReport?.total_impressions_period ?? 0 },
                { label: "Avg position", value: latestReport?.avg_position ?? 0, change: latestReport?.full_report_data?.position_change, invert: true },
                { label: "Keywords tracked", value: latestReport?.total_keywords_tracked ?? keywords.length },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-bold tnum text-foreground">
                    {typeof m.value === "number" ? m.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : m.value}
                  </p>
                  {typeof m.change === "number" && (
                    <p className={`mt-1 text-xs ${(m.invert ? -m.change : m.change) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {(m.invert ? -m.change : m.change) >= 0 ? "▲" : "▼"} {Math.abs(m.change).toFixed(1)} WoW
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Top opportunities */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-base font-semibold text-foreground">🔥 Top opportunities this week</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">Keyword</th>
                    <th className="py-2">Position</th>
                    <th className="py-2">Impressions</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-muted-foreground">Run a GSC sync to see opportunities.</td></tr>
                  )}
                  {opportunities.slice(0, 5).map((k) => (
                    <tr key={k.id} className="border-t border-border">
                      <td className="py-2 font-medium">{k.keyword}</td>
                      <td className="py-2 tnum">{k.calcy_position?.toFixed(1)}</td>
                      <td className="py-2 tnum">{k.calcy_impressions_28d?.toLocaleString()}</td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {(k.calcy_position ?? 99) <= 15 ? "Add to H1/H2" : (k.calcy_position ?? 99) <= 20 ? "Improve content" : "Create dedicated page"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Trends */}
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground">📈 Trending up</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {keywords.filter((k) => k.trend_direction === "rising").slice(0, 5).map((k) => (
                  <li key={k.id} className="flex justify-between">
                    <span>{k.keyword}</span>
                    <span className="text-emerald-600">↑ rising</span>
                  </li>
                ))}
                {keywords.filter((k) => k.trend_direction === "rising").length === 0 && (
                  <li className="text-muted-foreground">No rising trends yet.</li>
                )}
              </ul>
            </section>
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground">📉 Watch list — position drops</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {keywords
                  .filter((k) => (k.calcy_position_previous ?? 0) > 0 && (k.calcy_position ?? 0) - (k.calcy_position_previous ?? 0) > 2)
                  .slice(0, 5)
                  .map((k) => (
                    <li key={k.id} className="flex justify-between">
                      <span>{k.keyword}</span>
                      <span className="text-red-600 tnum">
                        {k.calcy_position_previous?.toFixed(1)} → {k.calcy_position?.toFixed(1)} ▼
                      </span>
                    </li>
                  ))}
                {keywords.filter((k) => (k.calcy_position_previous ?? 0) > 0 && (k.calcy_position ?? 0) - (k.calcy_position_previous ?? 0) > 2).length === 0 && (
                  <li className="text-muted-foreground">No drops detected.</li>
                )}
              </ul>
            </section>
          </div>

          {/* Sync history */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-base font-semibold text-foreground">Recent sync runs</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="py-2">Job</th><th>Status</th><th>Records</th><th>Trigger</th><th>When</th></tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 8).map((j) => (
                    <tr key={j.id} className="border-t border-border">
                      <td className="py-2">{j.job_type}</td>
                      <td className={j.status === "completed" ? "text-emerald-600" : j.status === "failed" ? "text-red-600" : "text-amber-600"}>{j.status}</td>
                      <td className="tnum">{j.records_updated ?? 0}</td>
                      <td className="text-xs">{j.triggered_by}</td>
                      <td className="text-xs text-muted-foreground">{new Date(j.started_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {jobs.length === 0 && <tr><td colSpan={5} className="py-3 text-muted-foreground">No syncs yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* KEYWORDS */}
      {sub === "keywords" && (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Search keywords…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 min-w-[200px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterRange} onChange={(e) => { setFilterRange(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="all">All positions</option>
              <option value="page1">Page 1 (≤10)</option>
              <option value="page2">Page 2 (11–20)</option>
              <option value="page3+">Page 3+ (&gt;20)</option>
            </select>
            <select value={filterTrend} onChange={(e) => setFilterTrend(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="all">All trends</option>
              <option value="rising">Rising</option>
              <option value="falling">Falling</option>
              <option value="stable">Stable</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="opportunity_score">Sort: Opportunity</option>
              <option value="calcy_position">Sort: Position</option>
              <option value="calcy_impressions_28d">Sort: Impressions</option>
              <option value="calcy_clicks_28d">Sort: Clicks</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Keyword</th>
                  <th>Category</th>
                  <th>Position</th>
                  <th>Δ</th>
                  <th>Clicks</th>
                  <th>Impr.</th>
                  <th>CTR</th>
                  <th>Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((k) => {
                  const delta = k.calcy_position_previous != null && k.calcy_position != null ? k.calcy_position - k.calcy_position_previous : null;
                  const opp = Math.min(100, Math.round((k.opportunity_score ?? 0) * 10));
                  return (
                    <tr key={k.id} className="border-t border-border">
                      <td className="py-2 font-medium">{k.keyword}</td>
                      <td><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{k.category || "—"}</span></td>
                      <td><span className={`rounded-md px-2 py-0.5 text-xs tnum ${positionColor(k.calcy_position)}`}>{k.calcy_position?.toFixed(1) ?? "—"}</span></td>
                      <td className={`tnum text-xs ${delta == null ? "" : delta < 0 ? "text-emerald-600" : delta > 0 ? "text-red-600" : ""}`}>
                        {delta == null ? "—" : delta === 0 ? "—" : `${delta < 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}`}
                      </td>
                      <td className="tnum">{k.calcy_clicks_28d ?? 0}</td>
                      <td className="tnum">{(k.calcy_impressions_28d ?? 0).toLocaleString()}</td>
                      <td className="tnum">{k.calcy_ctr_28d != null ? `${(k.calcy_ctr_28d * 100).toFixed(1)}%` : "—"}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-accent" style={{ width: `${opp}%` }} />
                          </div>
                          <span className="text-xs tnum text-muted-foreground">{opp}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pageItems.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">No keywords match.</td></tr>}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Page {page} of {totalPages} · {filteredKeywords.length} keywords</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-border px-3 py-1 disabled:opacity-50">Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-border px-3 py-1 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* OPPORTUNITIES */}
      {sub === "opportunities" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">Top fastest-win opportunities</h2>
            <p className="text-xs text-muted-foreground">Position 11–30 + high impressions = biggest traffic gain potential.</p>
          </div>
          {opportunities.length === 0 && (
            <p className="text-sm text-muted-foreground">No opportunities yet — run a GSC sync first.</p>
          )}
          {opportunities.map((k, i) => {
            const target = k.target_page || "/";
            const recommendation =
              (k.calcy_position ?? 99) <= 15
                ? `Position ${k.calcy_position} — near page 1. Add "${k.keyword}" to H1 or H2 heading on ${target} and update meta description.`
                : (k.calcy_position ?? 99) <= 20
                  ? `Position ${k.calcy_position} — improve content depth on ${target}. Add a dedicated section addressing "${k.keyword}" with 200+ words.`
                  : `Position ${k.calcy_position} — consider creating a dedicated article or landing page specifically targeting "${k.keyword}".`;
            const estClicks = Math.round((k.calcy_impressions_28d ?? 0) * 0.3);
            return (
              <div key={k.id} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">#{i + 1}</p>
                    <h3 className="text-base font-semibold text-foreground">"{k.keyword}"</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Current: <span className="font-semibold text-foreground tnum">Position {k.calcy_position?.toFixed(1)}</span> · Target: Page 1 (≤10)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Impressions: <span className="tnum text-foreground">{k.calcy_impressions_28d?.toLocaleString()}/28d</span> · Est. clicks at top 3: <span className="tnum text-foreground">~{estClicks}/mo</span>
                    </p>
                    <p className="text-sm text-muted-foreground">Current page: <a href={target} target="_blank" rel="noreferrer" className="text-accent underline">{target}</a></p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-dashed border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">What to do</p>
                  <p className="mt-1 text-sm text-foreground">✦ {recommendation}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <a className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted" href={`https://www.google.com/search?q=${encodeURIComponent(k.keyword)}&gl=au`} target="_blank" rel="noreferrer">View on Google</a>
                  <a className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted" href={target} target="_blank" rel="noreferrer">View page</a>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* REPORTS */}
      {sub === "reports" && (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Reports archive</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">Type</th><th>Date</th><th>Clicks</th><th>Impressions</th><th>Avg pos</th><th>Keywords</th><th></th></tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2">{r.report_type}</td>
                    <td className="text-xs">{new Date(r.generated_at).toLocaleDateString()}</td>
                    <td className="tnum">{r.total_clicks_period ?? "—"}</td>
                    <td className="tnum">{r.total_impressions_period?.toLocaleString() ?? "—"}</td>
                    <td className="tnum">{r.avg_position?.toFixed(1) ?? "—"}</td>
                    <td className="tnum">{r.total_keywords_tracked ?? "—"}</td>
                    <td><button className="text-xs text-accent underline" onClick={() => setOpenReportId(r.id)}>View</button></td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={7} className="py-4 text-muted-foreground">No reports yet.</td></tr>}
              </tbody>
            </table>
          </div>

          {openReportId && (() => {
            const r = reports.find((x) => x.id === openReportId);
            if (!r) return null;
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpenReportId(null)}>
                <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">{r.report_type} — {new Date(r.generated_at).toLocaleDateString()}</h3>
                    <button onClick={() => setOpenReportId(null)} className="text-sm text-muted-foreground">Close</button>
                  </div>
                  {r.content_recommendations && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold">Content recommendations</h4>
                      <ul className="mt-2 space-y-2 text-sm">
                        {(r.content_recommendations as any[]).map((c, i) => (
                          <li key={i} className="rounded-lg border border-border p-3">
                            <p className="font-medium">{c.keyword}</p>
                            <p className="text-xs text-muted-foreground">{c.action}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <pre className="mt-4 overflow-auto rounded-lg bg-muted p-3 text-[10px]">{JSON.stringify(r, null, 2)}</pre>
                </div>
              </div>
            );
          })()}
        </section>
      )}
    </div>
  );
};

export default SeoPanel;
