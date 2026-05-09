import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, FileText, BarChart3, Shield, ArrowLeftRight, Repeat, PlusCircle, Building2 } from "lucide-react";
import { useLiveRates } from "@/hooks/useLiveRates";

interface CalcCardDef {
  icon: typeof Home;
  name: string;
  path: string;
  bg: string;
  fg: string;
}

const CALCULATORS: CalcCardDef[] = [
  { icon: Home, name: "Mortgage", path: "/mortgage-calculator", bg: "#eff6ff", fg: "#2563eb" },
  { icon: FileText, name: "Stamp Duty", path: "/stamp-duty-calculator", bg: "#f0fdf4", fg: "#16a34a" },
  { icon: BarChart3, name: "Borrowing Power", path: "/borrowing-power-calculator", bg: "#fdf4ff", fg: "#a855f7" },
  { icon: Shield, name: "LMI", path: "/lmi-calculator", bg: "#fff7ed", fg: "#ea580c" },
  { icon: ArrowLeftRight, name: "Compare Loans", path: "/loan-comparison-calculator", bg: "#f8fafc", fg: "#475569" },
  { icon: Building2, name: "Rent vs Buy", path: "/rent-vs-buy-calculator", bg: "#fef2f2", fg: "#dc2626" },
  { icon: Repeat, name: "Refinance", path: "/refinance-calculator", bg: "#f0fdf4", fg: "#0d9488" },
  { icon: PlusCircle, name: "Extra Repayments", path: "/extra-repayments-calculator", bg: "#fffbeb", fg: "#d97706" },
];

interface LastResult {
  label: string;
  value: string;
  path: string;
}

function readLastResult(): LastResult | null {
  try {
    const raw = localStorage.getItem("calcy_mortgage_last");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.value) return null;
    return {
      label: data.label || "Mortgage",
      value: data.value,
      path: data.path || "/mortgage-calculator",
    };
  } catch {
    return null;
  }
}

const MobileHomepage = () => {
  const { rbaRate } = useLiveRates();
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  useEffect(() => {
    setLastResult(readLastResult());
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Minimal sticky header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <span className="text-[18px] font-semibold tracking-tight">
          <span aria-hidden>🧮</span> Calcy
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-[12px] font-medium"
          style={{ background: "hsl(var(--accent-light))", color: "hsl(var(--accent))" }}
        >
          RBA {rbaRate}%
        </span>
      </header>

      {/* Last result (if available) */}
      {lastResult && (
        <section className="px-4 pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Last calculation
          </p>
          <Link
            to={lastResult.path}
            className="flex items-center justify-between rounded-2xl border border-border bg-accent-light p-4 text-foreground active:scale-[0.99] transition-transform"
          >
            <div>
              <p className="text-[13px] text-muted-foreground">{lastResult.label}</p>
              <p className="text-[22px] font-bold tnum">{lastResult.value}</p>
            </div>
            <span className="text-[13px] font-medium text-accent">Resume →</span>
          </Link>
        </section>
      )}

      {/* Calculator grid */}
      <section className="px-4 pt-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Calculators
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {CALCULATORS.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link
                key={calc.path}
                to={calc.path}
                className="flex min-h-[88px] flex-col justify-between rounded-2xl border border-black/5 p-4 active:scale-[0.97] transition-transform"
                style={{ background: calc.bg }}
              >
                <Icon className="h-6 w-6" style={{ color: calc.fg }} strokeWidth={2} />
                <span className="text-[13px] font-semibold text-foreground">{calc.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Latest guide hint */}
      <section className="px-4 pt-6">
        <Link
          to="/guides"
          className="flex items-center justify-between rounded-2xl border border-border bg-background p-4 active:scale-[0.99] transition-transform"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Guides
            </p>
            <p className="mt-1 text-[14px] font-medium text-foreground">
              Browse first home buyer, refinance & stamp duty guides
            </p>
          </div>
          <span className="text-[13px] font-medium text-accent">→</span>
        </Link>
      </section>
    </div>
  );
};

export default MobileHomepage;
