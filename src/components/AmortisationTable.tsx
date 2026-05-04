import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AUD } from "@/lib/format";
import type { YearRow } from "@/lib/calc/mortgage";

const AmortisationTable = ({ rows }: { rows: YearRow[] }) => {
  const [open, setOpen] = useState(false);
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
        <div className="mt-3 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead className="bg-surface text-muted-foreground">
              <tr>
                <th className="sticky left-0 bg-surface px-3 py-2 text-left font-semibold">Year</th>
                <th className="px-3 py-2 text-right font-semibold">Opening balance</th>
                <th className="px-3 py-2 text-right font-semibold">Principal</th>
                <th className="px-3 py-2 text-right font-semibold">Interest</th>
                <th className="px-3 py-2 text-right font-semibold">Closing balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.year}>
                  <td className="sticky left-0 bg-card px-3 py-2 font-medium">{r.year}</td>
                  <td className="px-3 py-2 text-right tnum">{AUD(r.opening)}</td>
                  <td className="px-3 py-2 text-right tnum">{AUD(r.principal)}</td>
                  <td className="px-3 py-2 text-right tnum">{AUD(r.interest)}</td>
                  <td className="px-3 py-2 text-right tnum">{AUD(r.closing)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AmortisationTable;
