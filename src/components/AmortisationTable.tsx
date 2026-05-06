import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AUD } from "@/lib/format";
import type { YearRow, MonthRow } from "@/lib/calc/mortgage";

interface AmortisationTableProps {
  rows: YearRow[];
  monthlyRows?: MonthRow[];
}

const PAGE_SIZE = 24;

const AmortisationTable = ({ rows, monthlyRows }: AmortisationTableProps) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"annual" | "monthly">("annual");
  const [visibleMonths, setVisibleMonths] = useState(PAGE_SIZE);

  const monthly = monthlyRows ?? [];
  const totalMonths = monthly.length;
  const shown = monthly.slice(0, visibleMonths);

  return (
    <section aria-label="Amortisation schedule">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-[14px] font-semibold text-foreground"
      >
        <span>{open ? "Hide" : "Show"} amortisation schedule</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3">
          {monthlyRows && (
            <div className="mb-3 inline-flex rounded-full border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setView("annual")}
                aria-pressed={view === "annual"}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium ${
                  view === "annual" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                Annual
              </button>
              <button
                type="button"
                onClick={() => setView("monthly")}
                aria-pressed={view === "monthly"}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium ${
                  view === "monthly" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead className="bg-surface text-muted-foreground">
                <tr>
                  <th className="sticky left-0 bg-surface px-3 py-2 text-left font-semibold">
                    {view === "annual" ? "Year" : "Month"}
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">Opening balance</th>
                  <th className="px-3 py-2 text-right font-semibold">Principal</th>
                  <th className="px-3 py-2 text-right font-semibold">Interest</th>
                  <th className="px-3 py-2 text-right font-semibold">Closing balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {view === "annual"
                  ? rows.map((r) => (
                      <tr key={r.year}>
                        <td className="sticky left-0 bg-card px-3 py-2 font-medium">{r.year}</td>
                        <td className="px-3 py-2 text-right tnum">{AUD(r.opening)}</td>
                        <td className="px-3 py-2 text-right tnum">{AUD(r.principal)}</td>
                        <td className="px-3 py-2 text-right tnum">{AUD(r.interest)}</td>
                        <td className="px-3 py-2 text-right tnum">{AUD(r.closing)}</td>
                      </tr>
                    ))
                  : shown.map((r) => (
                      <tr key={r.month}>
                        <td className="sticky left-0 bg-card px-3 py-2 font-medium">{r.month}</td>
                        <td className="px-3 py-2 text-right tnum">{AUD(r.opening)}</td>
                        <td className="px-3 py-2 text-right tnum">{AUD(r.principal)}</td>
                        <td className="px-3 py-2 text-right tnum">{AUD(r.interest)}</td>
                        <td className="px-3 py-2 text-right tnum">{AUD(r.closing)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {view === "monthly" && totalMonths > 0 && (
            <div className="mt-3 flex items-center justify-between text-[13px] text-muted-foreground">
              <span>
                Showing month 1–{Math.min(visibleMonths, totalMonths)} of {totalMonths}
              </span>
              {visibleMonths < totalMonths && (
                <button
                  type="button"
                  onClick={() => setVisibleMonths((v) => v + PAGE_SIZE)}
                  className="btn-link"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AmortisationTable;
