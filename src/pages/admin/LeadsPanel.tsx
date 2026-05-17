import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Lead = {
  id: string;
  email: string;
  calculator_type: string;
  inputs: Record<string, unknown> | null;
  result_summary: string | null;
  suburb: string | null;
  created_at: string;
};

const PAGE_SIZE = 50;

const CALC_LABEL: Record<string, string> = {
  mortgage: "Mortgage",
  borrowing_power: "Borrowing power",
  stamp_duty: "Stamp duty",
  lmi: "LMI",
  refinance: "Refinance",
};

const escapeCsv = (v: unknown) => {
  if (v == null) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return `"${s.replace(/"/g, '""')}"`;
};

const LeadsPanel = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [calcFilter, setCalcFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let q = supabase
        .from("calculation_leads")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (calcFilter !== "all") q = q.eq("calculator_type", calcFilter);
      if (search.trim()) q = q.ilike("email", `%${search.trim()}%`);
      const { data, error, count } = await q;
      if (cancelled) return;
      if (error) {
        toast({ title: "Failed to load leads", description: error.message, variant: "destructive" });
        setLeads([]);
        setTotal(0);
      } else {
        setLeads((data ?? []) as Lead[]);
        setTotal(count ?? 0);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [calcFilter, search, page]);

  const exportCsv = async () => {
    let q = supabase
      .from("calculation_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (calcFilter !== "all") q = q.eq("calculator_type", calcFilter);
    if (search.trim()) q = q.ilike("email", `%${search.trim()}%`);
    const { data, error } = await q;
    if (error) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
      return;
    }
    const rows = (data ?? []) as Lead[];
    const header = ["created_at", "email", "calculator_type", "result_summary", "suburb", "inputs"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.created_at, r.email, r.calculator_type, r.result_summary, r.suburb, r.inputs]
          .map(escapeCsv)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calcy-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const calcOptions = useMemo(
    () => [
      { value: "all", label: "All calculators" },
      ...Object.entries(CALC_LABEL).map(([value, label]) => ({ value, label })),
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <section className="admin-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--admin-muted))]">Calculator</label>
            <select
              className="mt-1 rounded-lg border border-[hsl(var(--admin-border))] bg-white px-3 py-2 text-sm"
              value={calcFilter}
              onChange={(e) => {
                setCalcFilter(e.target.value);
                setPage(0);
              }}
            >
              {calcOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-[hsl(var(--admin-muted))]">Search email</label>
            <input
              type="search"
              placeholder="name@example.com"
              className="mt-1 w-full rounded-lg border border-[hsl(var(--admin-border))] bg-white px-3 py-2 text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <button
            onClick={exportCsv}
            className="rounded-lg border border-[hsl(var(--admin-border))] bg-white px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--admin-bg))]"
          >
            ⬇ Export CSV
          </button>
        </div>
        <p className="mt-3 text-xs text-[hsl(var(--admin-muted))]">
          {loading ? "Loading…" : `${total} lead${total === 1 ? "" : "s"} captured`}
        </p>
      </section>

      <section className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--admin-bg))] text-left text-xs uppercase tracking-wide text-[hsl(var(--admin-muted))]">
              <tr>
                <th className="px-4 py-2">Captured</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Calculator</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Suburb</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[hsl(var(--admin-muted))]">
                    No leads yet.
                  </td>
                </tr>
              )}
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-[hsl(var(--admin-border))]">
                  <td className="whitespace-nowrap px-4 py-2 text-[hsl(var(--admin-muted))]">
                    {new Date(l.created_at).toLocaleString("en-AU")}
                  </td>
                  <td className="px-4 py-2 font-medium">{l.email}</td>
                  <td className="px-4 py-2">{CALC_LABEL[l.calculator_type] ?? l.calculator_type}</td>
                  <td className="px-4 py-2 text-[hsl(var(--admin-muted))]">{l.result_summary ?? "—"}</td>
                  <td className="px-4 py-2">{l.suburb ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-[hsl(var(--admin-border))] px-4 py-3 text-sm">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded border border-[hsl(var(--admin-border))] px-3 py-1 disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-[hsl(var(--admin-muted))]">
              Page {page + 1} of {pageCount}
            </span>
            <button
              disabled={page + 1 >= pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-[hsl(var(--admin-border))] px-3 py-1 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default LeadsPanel;
