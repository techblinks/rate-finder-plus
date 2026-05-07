import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { YearAmort } from "@/lib/calc/mortgageEngine";

const AUD = (n: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

const SUMMARY_YEARS = [1, 5, 10, 15, 20, 25, 30];

const MortgageAmortTable = ({ schedule }: { schedule: YearAmort[] }) => {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const rows = showAll
    ? schedule
    : schedule.filter((r) => SUMMARY_YEARS.includes(r.year) || r.year === schedule.length);

  return (
    <section aria-label="Amortisation schedule" className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-[14px] font-semibold text-foreground"
      >
        <span>{open ? "Hide" : "Show"} year-by-year schedule</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border p-3">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead className="bg-surface text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Year</th>
                  <th className="px-3 py-2 text-right font-semibold">Opening</th>
                  <th className="px-3 py-2 text-right font-semibold">Principal</th>
                  <th className="px-3 py-2 text-right font-semibold">Interest</th>
                  <th className="px-3 py-2 text-right font-semibold">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.year}>
                    <td className="px-3 py-2 font-medium">{r.year}</td>
                    <td className="px-3 py-2 text-right tnum">{AUD(r.openingBalance)}</td>
                    <td className="px-3 py-2 text-right tnum">{AUD(r.principalPaid)}</td>
                    <td className="px-3 py-2 text-right tnum">{AUD(r.interestPaid)}</td>
                    <td className="px-3 py-2 text-right tnum">{AUD(r.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!showAll && schedule.length > SUMMARY_YEARS.length && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 text-[13px] font-semibold text-accent hover:underline"
            >
              Show all {schedule.length} years
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default MortgageAmortTable;
