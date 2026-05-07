import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Share2, X, Plus, Check } from "lucide-react";
import { buildAmortisation, type Frequency } from "@/lib/calc/mortgageEngine";
import { rbaRates } from "@/data/rbaRates";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import {
  loadLast,
  loadScenarios,
  saveLast,
  saveScenarios,
  clearLast,
  haptic,
  MAX_SCENARIOS,
  type SavedScenario,
} from "@/lib/mortgageState";
import RangeField from "@/components/RangeField";
import ResultActions from "@/components/ResultActions";

const AmortChart = lazy(() => import("@/components/MortgageAmortChart"));
const AmortTable = lazy(() => import("@/components/MortgageAmortTable"));

const AUD0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const AUD2 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 2,
});
const fmt0 = (n: number) => AUD0.format(Math.max(0, Math.round(n)));
const fmt2 = (n: number) => AUD2.format(Math.max(0, n));

const FREQ_LABEL: Record<Frequency, string> = {
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
};

const TERM_OPTIONS = [10, 15, 20, 25, 30];
const LOAN_PILLS = [400000, 500000, 600000, 700000, 800000, 1000000];
const FREQS: Frequency[] = ["weekly", "fortnightly", "monthly"];

const DEFAULTS = {
  loan: 650000,
  rate: 6.14,
  term: 30,
  freq: "fortnightly" as Frequency,
  extra: 0,
  propValue: 0,
};

type LoanType = "pi" | "io";

const Segmented = <T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel?: string;
}) => (
  <div role="tablist" aria-label={ariaLabel} className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-border bg-surface p-1">
    {options.map((o) => {
      const active = o.value === value;
      return (
        <button
          key={String(o.value)}
          role="tab"
          aria-selected={active}
          type="button"
          onClick={() => {
            onChange(o.value);
            haptic(8);
          }}
          className={`rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
            active ? "bg-background text-accent shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

function readUrlParams() {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  if (![...sp.keys()].length) return null;
  const num = (k: string, d: number) => {
    const v = parseFloat(sp.get(k) || "");
    return Number.isFinite(v) ? v : d;
  };
  const freqRaw = sp.get("freq");
  const freq: Frequency =
    freqRaw === "weekly" || freqRaw === "monthly" || freqRaw === "fortnightly"
      ? (freqRaw as Frequency)
      : DEFAULTS.freq;
  return {
    loan: num("loan", DEFAULTS.loan),
    rate: num("rate", DEFAULTS.rate),
    term: num("term", DEFAULTS.term),
    extra: num("extra", DEFAULTS.extra),
    propValue: num("pv", DEFAULTS.propValue),
    freq,
  };
}

const MortgageCalculatorRedesign = () => {
  // Initial state from URL → localStorage → defaults
  const [restored, setRestored] = useState<"url" | "local" | null>(null);
  const initial = useMemo(() => {
    const u = readUrlParams();
    if (u) {
      return { ...DEFAULTS, ...u, _src: "url" as const };
    }
    const l = typeof window !== "undefined" ? loadLast() : null;
    if (l) return { ...DEFAULTS, ...l, _src: "local" as const };
    return { ...DEFAULTS, _src: null as null | "url" | "local" };
  }, []);

  useEffect(() => {
    if (initial._src) setRestored(initial._src);
  }, [initial._src]);

  const [loan, setLoan] = useState(initial.loan);
  const [rate, setRate] = useState(initial.rate);
  const [term, setTerm] = useState(initial.term);
  const [freq, setFreq] = useState<Frequency>(initial.freq);
  const [extra, setExtra] = useState(initial.extra);
  const [propValue, setPropValue] = useState(initial.propValue);
  const [loanType, setLoanType] = useState<LoanType>("pi");
  const [ioYears, setIoYears] = useState(3);
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const sliderHaptic = useRef(0);

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  // Listen for the bottom-nav "Saved" tap → toggle the scenarios panel.
  useEffect(() => {
    const open = () => setScenariosOpen((v) => !v);
    document.addEventListener("calcy:open-scenarios", open);
    return () => document.removeEventListener("calcy:open-scenarios", open);
  }, []);

  const dLoan = useDebouncedValue(loan);
  const dRate = useDebouncedValue(rate);
  const dTerm = useDebouncedValue(term);
  const dExtra = useDebouncedValue(extra);

  // Effective rate / amort accounts for IO mode by computing the IO-period
  // interest-only payment, then full amort over (term - ioYears).
  const result = useMemo(() => {
    if (loanType === "io") {
      const ioInterestPerMonth = (dLoan * dRate) / 100 / 12;
      const remainTerm = Math.max(1, dTerm - ioYears);
      const piPart = buildAmortisation(dLoan, dRate, remainTerm, freq, dExtra);
      // Approximate display values during IO: show base IO repayment by frequency
      const ioPerPeriod =
        freq === "monthly"
          ? ioInterestPerMonth
          : freq === "fortnightly"
            ? ioInterestPerMonth / (26 / 12)
            : ioInterestPerMonth / (52 / 12);
      const ioInterestTotal = ioInterestPerMonth * 12 * ioYears;
      return {
        ...piPart,
        // Override headline with IO payment for clarity during IO years
        weekly: ioInterestPerMonth / (52 / 12),
        fortnightly: ioInterestPerMonth / (26 / 12),
        monthly: ioInterestPerMonth,
        perPeriod: ioPerPeriod,
        totalRepaid: piPart.totalRepaid + ioInterestTotal,
        totalInterest: piPart.totalInterest + ioInterestTotal,
      };
    }
    return buildAmortisation(dLoan, dRate, dTerm, freq, dExtra);
  }, [dLoan, dRate, dTerm, freq, dExtra, loanType, ioYears]);

  const baseResult = useMemo(
    () => (dExtra > 0 ? buildAmortisation(dLoan, dRate, dTerm, freq, 0) : null),
    [dLoan, dRate, dTerm, freq, dExtra],
  );

  const headline = result[freq];

  useDebouncedCalculate("mortgage_repayment", {
    loan_type: loanType,
    amount: dLoan,
    rate: dRate,
    term: dTerm,
    extra: dExtra,
    frequency: freq,
    monthly: Math.round(result.monthly),
  });

  // URL + localStorage sync (debounced inputs)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams();
    sp.set("loan", String(Math.round(dLoan)));
    sp.set("rate", dRate.toFixed(2));
    sp.set("term", String(dTerm));
    sp.set("freq", freq);
    sp.set("extra", String(Math.round(dExtra)));
    if (propValue > 0) sp.set("pv", String(Math.round(propValue)));
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState(null, "", url);
    saveLast({ loan: dLoan, rate: dRate, term: dTerm, freq, extra: dExtra, propValue });
  }, [dLoan, dRate, dTerm, freq, dExtra, propValue]);

  // Haptic snap on $50k loan boundaries
  useEffect(() => {
    const snap = Math.floor(loan / 50000);
    if (sliderHaptic.current !== snap) {
      sliderHaptic.current = snap;
      haptic(8);
    }
  }, [loan]);

  // Savings vs base loan (extra repayments)
  const savings = useMemo(() => {
    if (!baseResult || dExtra <= 0) return null;
    const monthsSaved = Math.max(
      0,
      (baseResult.yearsTaken - result.yearsTaken) * 12 +
        (baseResult.monthsRemainder - result.monthsRemainder),
    );
    const yrs = Math.floor(monthsSaved / 12);
    const mos = monthsSaved % 12;
    const interestSaved = Math.max(0, baseResult.totalInterest - result.totalInterest);
    return {
      yrs,
      mos,
      interestSaved,
      payoffYear: result.payoffYear,
    };
  }, [baseResult, result, dExtra]);

  const lvr = propValue > 0 ? Math.min(999, (loan / propValue) * 100) : null;

  const shareText = `${fmt0(loan)} loan at ${rate.toFixed(2)}% over ${term} years = ${fmt0(headline)} per ${freq}. Calculated with Calcy.`;

  const onShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My mortgage calculation — Calcy",
          text: shareText,
          url,
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      haptic(15);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [shareText]);

  const applyScenario = (s: SavedScenario) => {
    setLoan(s.loan);
    setRate(s.rate);
    setTerm(s.term);
    setFreq(s.freq);
    setExtra(s.extra);
    if (s.propValue) setPropValue(s.propValue);
    haptic(15);
  };

  const saveScenario = () => {
    if (scenarios.length >= MAX_SCENARIOS) return;
    const label = `Scenario ${String.fromCharCode(65 + scenarios.length)}`;
    const next: SavedScenario = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      label,
      loan,
      rate,
      term,
      freq,
      extra,
      propValue,
    };
    const arr = [...scenarios, next];
    setScenarios(arr);
    saveScenarios(arr);
    haptic(15);
  };

  const deleteScenario = (id: string) => {
    if (!confirm("Delete this scenario?")) return;
    const arr = scenarios.filter((s) => s.id !== id);
    setScenarios(arr);
    saveScenarios(arr);
  };

  const renameScenario = (id: string, label: string) => {
    const arr = scenarios.map((s) => (s.id === id ? { ...s, label } : s));
    setScenarios(arr);
    saveScenarios(arr);
  };

  const resetDefaults = () => {
    setLoan(DEFAULTS.loan);
    setRate(DEFAULTS.rate);
    setTerm(DEFAULTS.term);
    setFreq(DEFAULTS.freq);
    setExtra(DEFAULTS.extra);
    setPropValue(DEFAULTS.propValue);
    clearLast();
    setRestored(null);
  };

  const altFreqs = FREQS.filter((f) => f !== freq);

  return (
    <div className="space-y-6">
      {restored === "local" && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent-mid bg-accent-light px-4 py-3 text-[13px] text-foreground">
          <span>Welcome back! We've restored your last calculation.</span>
          <button
            type="button"
            onClick={resetDefaults}
            className="font-semibold text-accent hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Scenario tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {scenarios.map((s) => (
          <div
            key={s.id}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface pl-1"
          >
            <button
              type="button"
              onClick={() => applyScenario(s)}
              onDoubleClick={() => {
                const v = prompt("Rename scenario", s.label);
                if (v) renameScenario(s.id, v);
              }}
              className="rounded-full px-3 py-1 text-[13px] font-medium text-foreground"
              title="Tap to load · double-click to rename"
            >
              {s.label}
            </button>
            <button
              type="button"
              onClick={() => deleteScenario(s.id)}
              aria-label={`Delete ${s.label}`}
              className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {scenarios.length < MAX_SCENARIOS && (
          <button
            type="button"
            onClick={saveScenario}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-background px-3 py-1 text-[13px] font-medium text-accent hover:bg-accent-light"
          >
            <Plus className="h-3.5 w-3.5" /> Save scenario
          </button>
        )}
      </div>

      {scenariosOpen && (
        <div className="rounded-xl border border-border bg-surface p-4 text-[13px] text-muted-foreground">
          {scenarios.length === 0
            ? "No scenarios yet. Save up to 3 to compare."
            : `You have ${scenarios.length} of ${MAX_SCENARIOS} scenarios saved. Tap a tab above to load it.`}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* INPUTS */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
          <div>
            <RangeField
              label="Loan amount"
              value={loan}
              onChange={setLoan}
              min={50000}
              max={3000000}
              step={5000}
              prefix="$"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LOAN_PILLS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLoan(v)}
                  className={`rounded-full border px-3 py-1 text-[12px] font-medium ${
                    loan === v
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-background text-foreground hover:border-accent"
                  }`}
                >
                  {v >= 1_000_000 ? `$${v / 1_000_000}M` : `$${v / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <RangeField
              label="Interest rate"
              value={rate}
              onChange={setRate}
              min={1}
              max={15}
              step={0.05}
              suffix="%"
              hint={`RBA cash rate: ${rbaRates.cashRate.toFixed(2)}% · ${rbaRates.lastUpdated}`}
            />
          </div>

          <div>
            <p className="mb-1 text-[13px] font-medium text-foreground">Loan term</p>
            <Segmented
              ariaLabel="Loan term"
              value={term}
              onChange={(v) => setTerm(Number(v))}
              options={TERM_OPTIONS.map((y) => ({ value: y, label: `${y} yr` }))}
            />
          </div>

          <div>
            <p className="mb-1 text-[13px] font-medium text-foreground">Repayment frequency</p>
            <Segmented<Frequency>
              ariaLabel="Frequency"
              value={freq}
              onChange={setFreq}
              options={FREQS.map((f) => ({ value: f, label: FREQ_LABEL[f] }))}
            />
          </div>

          <div>
            <RangeField
              label="Extra repayments per month"
              value={extra}
              onChange={setExtra}
              min={0}
              max={5000}
              step={50}
              prefix="$"
            />
          </div>

          <div>
            <p className="mb-1 text-[13px] font-medium text-foreground">Loan type</p>
            <Segmented<LoanType>
              ariaLabel="Loan type"
              value={loanType}
              onChange={setLoanType}
              options={[
                { value: "pi", label: "Principal & Interest" },
                { value: "io", label: "Interest Only" },
              ]}
            />
            {loanType === "io" && (
              <div className="mt-3">
                <p className="mb-1 text-[13px] font-medium text-foreground">IO period</p>
                <Segmented
                  ariaLabel="Interest only years"
                  value={ioYears}
                  onChange={(v) => setIoYears(Number(v))}
                  options={[1, 2, 3, 5, 10].map((y) => ({ value: y, label: `${y} yr` }))}
                />
              </div>
            )}
          </div>

          <div>
            <RangeField
              label="Property value (optional, for LVR)"
              value={propValue}
              onChange={setPropValue}
              min={0}
              max={5000000}
              step={10000}
              prefix="$"
            />
          </div>
        </div>

        {/* RESULTS */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-[12px] uppercase tracking-wide text-muted-foreground">
              {FREQ_LABEL[freq]} repayment
            </p>
            <p className="tnum text-[44px] font-bold leading-none text-accent sm:text-[52px]">
              {fmt0(headline)}
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {altFreqs
                .map((f) => `${FREQ_LABEL[f]}: ${fmt0(result[f])}`)
                .join(" · ")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total repayments" value={fmt0(result.totalRepaid)} />
            <StatCard
              label="Total interest"
              value={fmt0(result.totalInterest)}
              tone="warning"
            />
            <StatCard
              label="Loan-to-value ratio"
              value={lvr !== null ? `${lvr.toFixed(1)}%` : "—"}
              hint={lvr === null ? "Add property value" : undefined}
            />
            <StatCard label="Payoff year" value={String(result.payoffYear)} />
          </div>

          {savings && (
            <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-[14px]">
              <p className="font-semibold text-success">
                You'll save {savings.yrs} years and {savings.mos} months
              </p>
              <p className="text-foreground">
                You'll save {fmt0(savings.interestSaved)} in total interest
              </p>
              <p className="text-muted-foreground">
                Loan paid off in {savings.payoffYear}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-[15px] font-semibold">Principal vs interest by year</h3>
            <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted/40" />}>
              <AmortChart schedule={result.schedule} />
            </Suspense>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[14px] font-semibold text-accent-foreground hover:bg-accent-hover"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Copied!" : "Share this calculation"}
            </button>
          </div>

          <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-muted/40" />}>
            <AmortTable schedule={result.schedule} />
          </Suspense>

          <ResultActions calculator="mortgage_repayment" />

          <p className="text-[12px] text-muted-foreground">
            All calculations use {fmt2(result.monthly)} monthly base. Estimates only — confirm with
            your lender.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "warning";
  hint?: string;
}) => (
  <div
    className={`rounded-2xl border p-4 ${
      tone === "warning"
        ? "border-warning/30 bg-warning/10"
        : "border-border bg-card"
    }`}
  >
    <p className="text-[12px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p
      className={`tnum text-[22px] font-bold ${
        tone === "warning" ? "text-warning" : "text-foreground"
      }`}
    >
      {value}
    </p>
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

export default MortgageCalculatorRedesign;
