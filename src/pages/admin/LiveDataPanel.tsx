import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invalidateLiveRatesCache } from "@/hooks/useLiveRates";
import { toast } from "@/hooks/use-toast";

type SubTab = "dashboard" | "edit" | "history";

interface RateRow {
  id: string;
  category: string;
  state: string | null;
  key: string;
  value: Record<string, unknown>;
  display_label: string | null;
  source_url: string | null;
  source_name: string | null;
  last_verified_at: string;
  last_changed_at: string;
  auto_sync: boolean;
  sync_source: string | null;
  is_active: boolean;
}

interface SyncJob {
  id: string;
  job_type: string;
  triggered_by: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  records_checked: number | null;
  records_updated: number | null;
  records_failed: number | null;
  summary: Record<string, unknown> | null;
  error_log: Record<string, unknown> | null;
}

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "dashboard", label: "Data dashboard" },
  { key: "edit", label: "Edit rates" },
  { key: "history", label: "Sync history" },
];

const fmtAge = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) {
    const hrs = Math.floor(ms / 3_600_000);
    return hrs <= 1 ? `${Math.max(1, Math.floor(ms / 60_000))} min ago` : `${hrs} hours ago`;
  }
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const freshness = (iso: string): { label: string; tone: "fresh" | "stale" | "overdue" } => {
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (days < 30) return { label: "FRESH", tone: "fresh" };
  if (days < 90) return { label: "STALE", tone: "stale" };
  return { label: "OVERDUE", tone: "overdue" };
};

const freshnessClass = (tone: "fresh" | "stale" | "overdue") =>
  tone === "fresh"
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : tone === "stale"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-red-100 text-red-800 border-red-300";

const fmtMoney = (n: unknown) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n)
    : String(n ?? "—");

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const LiveDataPanel = () => {
  const [sub, setSub] = useState<SubTab>("dashboard");
  const [rows, setRows] = useState<RateRow[]>([]);
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const [rd, sj] = await Promise.all([
      supabase.from("rate_data").select("*").order("category").order("state"),
      supabase.from("sync_jobs").select("*").order("started_at", { ascending: false }).limit(50),
    ]);
    if (rd.data) setRows(rd.data as unknown as RateRow[]);
    if (sj.data) setJobs(sj.data as unknown as SyncJob[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, RateRow[]> = {};
    for (const r of rows) {
      g[r.category] ??= [];
      g[r.category].push(r);
    }
    return g;
  }, [rows]);

  const triggerSync = async (fn: "sync-rba-rate" | "sync-housing-australia") => {
    setBusy(fn);
    try {
      const { data, error } = await supabase.functions.invoke(fn, {
        headers: { "x-triggered-by": "admin_manual" },
      });
      if (error) throw error;
      toast({ title: `${fn} triggered`, description: JSON.stringify(data).slice(0, 200) });
      invalidateLiveRatesCache();
      await refresh();
    } catch (err) {
      toast({
        title: "Sync failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const runRbaEventScan = async () => {
    setBusy("rba-event-scan");
    try {
      // 1. Sync the latest RBA cash rate
      const sync = await supabase.functions.invoke("sync-rba-rate", {
        headers: { "x-triggered-by": "admin_rba_event_scan" },
      });
      if (sync.error) throw sync.error;
      invalidateLiveRatesCache();

      // 2. Auto-generate a draft article from the new rate context
      const draft = await supabase.functions.invoke("generate-rba-article", {
        headers: { "x-triggered-by": "admin_rba_event_scan" },
      });
      if (draft.error) throw draft.error;

      const wordCount = (draft.data as any)?.word_count;
      toast({
        title: "RBA event scan complete",
        description: wordCount
          ? `Rates synced and a ${wordCount}-word draft article was saved to Content → Drafts.`
          : "Rates synced. Draft article saved to Content → Drafts.",
      });
      await refresh();
    } catch (err) {
      toast({
        title: "RBA event scan failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const saveRow = async (id: string, patch: Partial<RateRow>, oldValue: unknown) => {
    setBusy(id);
    try {
      const { error } = await supabase
        .from("rate_data")
        .update({
          ...patch,
          previous_value: oldValue as never,
          last_verified_at: new Date().toISOString(),
          last_changed_at: new Date().toISOString(),
        } as never)
        .eq("id", id);
      if (error) throw error;

      const row = rows.find((r) => r.id === id);
      if (row) {
        await supabase.from("rate_audit_log").insert({
          rate_data_id: id,
          category: row.category,
          state: row.state,
          key: row.key,
          old_value: oldValue as never,
          new_value: (patch.value ?? row.value) as never,
          changed_by: "admin_manual",
          change_source: "admin_panel",
          change_note: "Manual update from admin panel",
        });
      }

      invalidateLiveRatesCache();
      toast({ title: "Saved", description: "Rate updated and change logged." });
      await refresh();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const markVerified = async (id: string) => {
    setBusy(id);
    await supabase
      .from("rate_data")
      .update({ last_verified_at: new Date().toISOString() })
      .eq("id", id);
    setBusy(null);
    refresh();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-border">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              sub === t.key
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => triggerSync("sync-rba-rate")}
            disabled={!!busy}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            🔄 Sync RBA rate
          </button>
          <button
            onClick={() => triggerSync("sync-housing-australia")}
            disabled={!!busy}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            🔄 Sync Housing Aus.
          </button>
          <button
            onClick={runRbaEventScan}
            disabled={!!busy}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
          >
            {busy === "rba-event-scan" ? "Running RBA event scan…" : "⚡ Run RBA Event Scan"}
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!loading && sub === "dashboard" && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, list]) => {
            const oldest = list.reduce((acc, r) =>
              new Date(r.last_verified_at) < new Date(acc.last_verified_at) ? r : acc,
            );
            const f = freshness(oldest.last_verified_at);
            return (
              <article key={cat} className="rounded-2xl border border-border bg-surface p-5">
                <header className="flex items-center justify-between">
                  <h3 className="text-base font-semibold uppercase tracking-wide text-foreground">
                    {cat.replace(/_/g, " ")}
                  </h3>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${freshnessClass(f.tone)}`}
                  >
                    ● {f.label}
                  </span>
                </header>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {list.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-mono text-xs text-foreground">
                        {r.state ?? "national"} · {r.key}
                      </span>
                      <span className="tnum">{summarizeValue(r)}</span>
                      <span className="ml-auto text-xs">
                        Verified {fmtAge(r.last_verified_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      )}

      {!loading && sub === "edit" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Edit any rate's JSON value. Saving updates the live data, logs an audit entry, and busts the calculator cache.
          </p>
          {rows.map((r) => (
            <EditRow key={r.id} row={r} busy={busy === r.id} onSave={saveRow} onVerify={markVerified} />
          ))}
        </div>
      )}

      {!loading && sub === "history" && (
        <div className="space-y-2">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Job</th>
                <th className="py-2 pr-3">Trigger</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Updated</th>
                <th className="py-2 pr-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t border-border align-top">
                  <td className="py-2 pr-3">{new Date(j.started_at).toLocaleString("en-AU")}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{j.job_type}</td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">{j.triggered_by}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        j.status === "completed"
                          ? "text-emerald-700"
                          : j.status === "failed"
                            ? "text-red-700"
                            : "text-amber-700"
                      }
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="py-2 pr-3 tnum">
                    {j.records_updated ? <span className="font-semibold">⚡ {j.records_updated}</span> : "0"}
                  </td>
                  <td className="py-2 pr-3 tnum text-xs text-muted-foreground">
                    {j.duration_ms ? `${(j.duration_ms / 1000).toFixed(1)}s` : "—"}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    No sync jobs yet — trigger one above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const summarizeValue = (r: RateRow) => {
  const v = r.value as Record<string, unknown>;
  if (r.category === "rba_cash_rate") return `${v.rate}%`;
  if (r.category === "fhog") return `${fmtMoney(v.amount)}${v.max_property_value ? ` ≤ ${fmtMoney(v.max_property_value)}` : ""}`;
  if (r.category === "fhb_threshold")
    return `exempt ≤ ${fmtMoney(v.full_exemption_to)} · concession ≤ ${fmtMoney(v.concession_to)}`;
  if (r.category === "lmi_bands") return `${(v.bands as unknown[])?.length ?? 0} bands`;
  if (r.category === "hia_scheme") return `${fmtMoney(v.individual_income_cap)} / ${fmtMoney(v.couple_income_cap)}`;
  return JSON.stringify(v).slice(0, 60);
};

const EditRow = ({
  row,
  busy,
  onSave,
  onVerify,
}: {
  row: RateRow;
  busy: boolean;
  onSave: (id: string, patch: Partial<RateRow>, oldValue: unknown) => void;
  onVerify: (id: string) => void;
}) => {
  const [text, setText] = useState(JSON.stringify(row.value, null, 2));
  const [open, setOpen] = useState(false);
  const dirty = text !== JSON.stringify(row.value, null, 2);

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="font-mono text-xs text-foreground">
          {row.category} · {row.state ?? "national"} · {row.key}
        </span>
        <span className="text-xs text-muted-foreground">
          {summarizeValue(row)} · verified {fmtAge(row.last_verified_at)}
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <textarea
            className="w-full rounded-lg border border-border bg-background p-2 font-mono text-xs"
            rows={Math.min(12, text.split("\n").length + 1)}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              disabled={!dirty || busy}
              onClick={() => {
                let parsed: unknown;
                try {
                  parsed = JSON.parse(text);
                } catch {
                  toast({ title: "Invalid JSON", variant: "destructive" });
                  return;
                }
                if (
                  !confirm(
                    `Update ${row.category} (${row.state ?? "national"}) — this is logged in the audit trail. Continue?`,
                  )
                ) {
                  return;
                }
                onSave(row.id, { value: parsed as Record<string, unknown> }, row.value);
              }}
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
            >
              Save
            </button>
            <button
              disabled={busy}
              onClick={() => onVerify(row.id)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              Mark as verified (no change)
            </button>
            {row.source_url && (
              <a
                href={row.source_url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto self-center text-xs text-muted-foreground hover:text-foreground"
              >
                Source ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDataPanel;
