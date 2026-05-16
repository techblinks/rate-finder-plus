import { useMemo, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import type { YearAmort } from "@/lib/calc/mortgageEngine";

const AUD = (n: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

const HIGHLIGHT_YEARS = new Set([1, 5, 10, 20, 25]);

const MortgageAmortTable = ({ schedule }: { schedule: YearAmort[] }) => {
  const [open, setOpen] = useState(false);

  const finalYear = schedule.length;
  const totals = useMemo(() => {
    let principal = 0;
    let interest = 0;
    for (const r of schedule) {
      principal += r.principalPaid;
      interest += r.interestPaid;
    }
    return { principal, interest, repayments: principal + interest };
  }, [schedule]);

  const downloadCsv = () => {
    const header = [
      "Year",
      "Opening balance",
      "Annual repayments",
      "Principal paid",
      "Interest paid",
      "Closing balance",
    ];
    const lines = [header.join(",")];
    for (const r of schedule) {
      const annual = r.principalPaid + r.interestPaid;
      lines.push(
        [
          r.year,
          Math.round(r.openingBalance),
          Math.round(annual),
          Math.round(r.principalPaid),
          Math.round(r.interestPaid),
          Math.round(r.closingBalance),
        ].join(","),
      );
    }
    lines.push(
      [
        "Total",
        "",
        Math.round(totals.repayments),
        Math.round(totals.principal),
        Math.round(totals.interest),
        "",
      ].join(","),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mortgage-schedule.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground hover:bg-surface"
            >
              <Download className="h-3.5 w-3.5" />
              Download as CSV
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead className="bg-surface text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Year</th>
                  <th className="px-3 py-2 text-right font-semibold">Opening balance</th>
                  <th className="px-3 py-2 text-right font-semibold">Annual repayments</th>
                  <th className="px-3 py-2 text-right font-semibold">Principal paid</th>
                  <th className="px-3 py-2 text-right font-semibold">Interest paid</th>
                  <th className="px-3 py-2 text-right font-semibold">Closing balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schedule.map((r) => {
                  const highlight = HIGHLIGHT_YEARS.has(r.year) || r.year === finalYear;
                  const annual = r.principalPaid + r.interestPaid;
                  return (
                    <tr
                      key={r.year}
                      className={
                        highlight
                          ? "bg-sky-50 dark:bg-sky-950/30"
                          : ""
                      }
                    >
                      <td className="px-3 py-2 font-medium">{r.year}</td>
                      <td className="px-3 py-2 text-right tnum">{AUD(r.openingBalance)}</td>
                      <td className="px-3 py-2 text-right tnum">{AUD(annual)}</td>
                      <td className="px-3 py-2 text-right tnum">{AUD(r.principalPaid)}</td>
                      <td className="px-3 py-2 text-right tnum">{AUD(r.interestPaid)}</td>
                      <td className="px-3 py-2 text-right tnum">{AUD(r.closingBalance)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-surface font-semibold text-foreground">
                <tr>
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 text-right tnum">{AUD(totals.repayments)}</td>
                  <td className="px-3 py-2 text-right tnum">{AUD(totals.principal)}</td>
                  <td className="px-3 py-2 text-right tnum">{AUD(totals.interest)}</td>
                  <td className="px-3 py-2" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default MortgageAmortTable;
