import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Share2, X, Plus, Check, ChevronDown } from "lucide-react";
import { buildAmortisation, type Frequency, type YearAmort } from "@/lib/calc/mortgageEngine";
import { calculateWithOffset } from "@/lib/calc/offset";
import { monthlyPayment as basePmt } from "@/lib/calc/mortgage";
import Tooltip from "@/components/Tooltip";
import CurrencyInput from "@/components/CurrencyInput";
import { useRbaRates } from "@/hooks/useRbaRates";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useIsPending } from "@/hooks/useIsPending";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import {
  loadLast,
  loadScenarios,
  saveLast,
  saveScenarios,
  clearLast,
  haptic,
  MAX_SCENARIOS,
  loadOffsetPresets,
  saveOffsetPresets,
  MAX_OFFSET_PRESETS,
  type SavedScenario,
  type OffsetPreset,
} from "@/lib/mortgageState";
import RangeField from "@/components/RangeField";
import ResultActions from "@/components/ResultActions";
import EmailResultsDialog from "@/components/EmailResultsDialog";
import ShareResult from "@/components/ShareResult";
import StickyResultsBar from "@/components/StickyResultsBar";
import QuickAdjustChips from "@/components/mobile/QuickAdjustChips";
import MobileCollapse from "@/components/mobile/MobileCollapse";
import MobileInsightCards, { type InsightCandidate } from "@/components/mobile/MobileInsightCards";
import MobileResultCard from "@/components/mobile/MobileResultCard";
import { MobilePendingOverlay } from "@/components/mobile/MobileSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePublishMobileResult } from "@/lib/mobileResult";

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
  rate: 6.39,
  term: 30,
  freq: "fortnightly" as Frequency,
  extra: 0,
  propValue: 0,
  offsetStart: 0,
  offsetMonthly: 0,
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
          className={`min-h-[44px] rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
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
    offsetStart: num("offset_start", DEFAULTS.offsetStart),
    offsetMonthly: num("offset_monthly", DEFAULTS.offsetMonthly),
    freq,
  };
}

/** Simulate paying a fixed amount at a given frequency (for half-monthly / divided-weekly savings callout). */
function simulateDividedFrequency(
  principal: number,
  annualRatePct: number,
  paymentPerPeriod: number,
  periodsPerYear: number,
) {
  const r = annualRatePct / 100 / periodsPerYear;
  let balance = principal;
  let totalInterest = 0;
  let totalRepaid = 0;
  let periods = 0;
  const maxPeriods = 100 * periodsPerYear;

  while (balance > 0.01 && periods < maxPeriods) {
    const interest = balance * r;
    if (paymentPerPeriod <= interest) break; // payment doesn't cover interest
    let principalPaid = paymentPerPeriod - interest;
    if (principalPaid > balance) principalPaid = balance;
    const actualPayment = interest + principalPaid;
    balance -= principalPaid;
    totalInterest += interest;
    totalRepaid += actualPayment;
    periods++;
    if (balance < 0.01) balance = 0;
  }

  const years = periods / periodsPerYear;
  const yearsTaken = Math.floor(years);
  const monthsRemainder = Math.round((years - yearsTaken) * 12);
  return {
    totalInterest,
    totalRepaid,
    yearsTaken,
    monthsRemainder,
    payoffMonths: yearsTaken * 12 + monthsRemainder,
  };
}

const MortgageCalculatorRedesign = () => {
  const rbaRates = useRbaRates();
  const isMobile = useIsMobile();
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
  const [offsetOpen, setOffsetOpen] = useState(
    (initial.offsetStart ?? 0) > 0 || (initial.offsetMonthly ?? 0) > 0,
  );
  const [offsetStart, setOffsetStart] = useState(initial.offsetStart ?? 0);
  const [offsetMonthly, setOffsetMonthly] = useState(initial.offsetMonthly ?? 0);
  const [loanType, setLoanType] = useState<LoanType>("pi");
  const [ioYears, setIoYears] = useState(3);
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const [offsetPresets, setOffsetPresets] = useState<OffsetPreset[]>([]);
  const [copied, setCopied] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const sliderHaptic = useRef(0);
  const inputsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScenarios(loadScenarios());
    setOffsetPresets(loadOffsetPresets());
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
  const dOffsetStart = useDebouncedValue(offsetOpen ? offsetStart : 0);
  const dOffsetMonthly = useDebouncedValue(offsetOpen ? offsetMonthly : 0);
  const offsetActive = offsetOpen && (dOffsetStart > 0 || dOffsetMonthly > 0);

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
    if (dOffsetStart > 0) sp.set("offset_start", String(Math.round(dOffsetStart)));
    if (dOffsetMonthly > 0) sp.set("offset_monthly", String(Math.round(dOffsetMonthly)));
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState(null, "", url);
    saveLast({
      loan: dLoan,
      rate: dRate,
      term: dTerm,
      freq,
      extra: dExtra,
      propValue,
      offsetStart: dOffsetStart,
      offsetMonthly: dOffsetMonthly,
    });
  }, [dLoan, dRate, dTerm, freq, dExtra, propValue, dOffsetStart, dOffsetMonthly]);

  // Haptic snap on $50k loan boundaries
  useEffect(() => {
    const snap = Math.floor(loan / 50000);
    if (sliderHaptic.current !== snap) {
      sliderHaptic.current = snap;
      haptic(8);
    }
  }, [loan]);

  // Haptic snap on 0.25% rate boundaries
  const rateSnapRef = useRef<number>(Math.round(rate * 4));
  useEffect(() => {
    const snap = Math.round(rate * 4); // each unit = 0.25%
    if (rateSnapRef.current !== snap) {
      rateSnapRef.current = snap;
      haptic(8);
    }
  }, [rate]);

  // One-shot success haptic when LVR crosses the 80% LMI threshold (in either direction)
  const lvrCrossedRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (propValue <= 0) {
      lvrCrossedRef.current = null;
      return;
    }
    const above = (loan / propValue) * 100 > 80;
    if (lvrCrossedRef.current !== null && lvrCrossedRef.current !== above) {
      haptic(20);
    }
    lvrCrossedRef.current = above;
  }, [loan, propValue]);

  // Scroll a target input into view and pulse-highlight it (mobile edit-chip flow)
  const handleEditField = useCallback((field: "loan" | "rate" | "term") => {
    const id =
      field === "loan" ? "loan-amount-input" : field === "rate" ? "interest-rate-input" : "loan-term-input";
    const el = typeof document !== "undefined" ? document.getElementById(id) : null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("calcy-field-pulse");
    // Force reflow so the animation restarts if tapped twice
    void el.offsetWidth;
    el.classList.add("calcy-field-pulse");
    window.setTimeout(() => el.classList.remove("calcy-field-pulse"), 1600);
  }, []);

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

  // Offset account modeling (Sprint 4). Only computed when offset is active.
  const offset = useMemo(() => {
    if (!offsetActive || loanType !== "pi" || dLoan <= 0 || dTerm <= 0) return null;
    const payment = basePmt(dLoan, dRate, dTerm);
    const r = calculateWithOffset({
      loanAmount: dLoan,
      annualRate: dRate,
      termYears: dTerm,
      monthlyPayment: payment + dExtra, // extra repayments boost principal portion
      startingOffset: dOffsetStart,
      monthlyOffsetContribution: dOffsetMonthly,
    });
    // Convert monthly schedule → yearly aggregates matching YearAmort shape.
    const yearly: YearAmort[] = [];
    let yOpen = dLoan;
    let yPrin = 0;
    let yInt = 0;
    let yClose = dLoan;
    for (let i = 0; i < r.schedule.length; i++) {
      const row = r.schedule[i];
      yPrin += row.principalPaid;
      yInt += row.interestPaid;
      yClose = row.loanBalance;
      if ((i + 1) % 12 === 0 || i === r.schedule.length - 1) {
        yearly.push({
          year: Math.ceil((i + 1) / 12),
          openingBalance: yOpen,
          principalPaid: yPrin,
          interestPaid: yInt,
          closingBalance: yClose,
        });
        yOpen = yClose;
        yPrin = 0;
        yInt = 0;
      }
    }
    const nowYear = new Date().getFullYear();
    return {
      ...r,
      yearlySchedule: yearly,
      payoffYearWith: nowYear + Math.ceil(r.payoffMonths / 12),
      payoffYearWithout: nowYear + Math.ceil(r.baselinePayoffMonths / 12),
    };
  }, [offsetActive, loanType, dLoan, dRate, dTerm, dExtra, dOffsetStart, dOffsetMonthly]);

  // Baseline yearly schedule for chart comparison (re-uses existing engine).
  const baselineForChart = useMemo(
    () => (offset ? buildAmortisation(dLoan, dRate, dTerm, freq, dExtra).schedule : null),
    [offset, dLoan, dRate, dTerm, freq, dExtra],
  );

  // Rate change scenarios
  const rateScenarios = useMemo(() => {
    const currentMonthly = result.monthly;
    const compute = (r: number) => {
      if (loanType === "io") {
        return (dLoan * r) / 100 / 12;
      }
      return basePmt(dLoan, r, dTerm) + dExtra;
    };
    return [
      { label: "Drop 0.25%", rate: Math.max(0.01, dRate - 0.25), tone: "success" as const, monthly: compute(Math.max(0.01, dRate - 0.25)) },
      { label: "Current", rate: dRate, tone: "accent" as const, monthly: currentMonthly },
      { label: "Rise 0.5%", rate: dRate + 0.5, tone: "warning" as const, monthly: compute(dRate + 0.5) },
      { label: "Rise 1%", rate: dRate + 1.0, tone: "destructive" as const, monthly: compute(dRate + 1.0) },
    ].map((s) => ({ ...s, diff: s.monthly - currentMonthly }));
  }, [dLoan, dRate, dTerm, dExtra, loanType, result.monthly]);

  // Frequency savings (half-monthly / divided-weekly vs monthly)
  const freqSavings = useMemo(() => {
    if (freq === "monthly") return null;
    const monthlyTotal = result.monthly + dExtra;
    const monthlyScenario = simulateDividedFrequency(dLoan, dRate, monthlyTotal, 12);

    if (freq === "fortnightly") {
      const fortPayment = monthlyTotal / 2;
      const fortScenario = simulateDividedFrequency(dLoan, dRate, fortPayment, 26);
      const monthsSaved = Math.max(0, monthlyScenario.payoffMonths - fortScenario.payoffMonths);
      const interestSaved = Math.max(0, monthlyScenario.totalInterest - fortScenario.totalInterest);
      return { monthsSaved, interestSaved, label: "fortnightly" as const };
    }

    if (freq === "weekly") {
      const weekPayment = monthlyTotal / 4;
      const weekScenario = simulateDividedFrequency(dLoan, dRate, weekPayment, 52);
      const monthsSaved = Math.max(0, monthlyScenario.payoffMonths - weekScenario.payoffMonths);
      const interestSaved = Math.max(0, monthlyScenario.totalInterest - weekScenario.totalInterest);
      return { monthsSaved, interestSaved, label: "weekly" as const };
    }

    return null;
  }, [freq, dLoan, dRate, dExtra, result.monthly]);

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
    const os = s.offsetStart ?? 0;
    const om = s.offsetMonthly ?? 0;
    setOffsetStart(os);
    setOffsetMonthly(om);
    setOffsetOpen(os > 0 || om > 0);
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
      offsetStart,
      offsetMonthly,
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

  const applyOffsetPreset = (p: { start: number; monthly: number }) => {
    haptic(10);
    setOffsetStart(p.start);
    setOffsetMonthly(p.monthly);
    setOffsetOpen(true);
  };

  const saveCurrentOffsetPreset = () => {
    if (offsetPresets.length >= MAX_OFFSET_PRESETS) {
      alert(`You can save up to ${MAX_OFFSET_PRESETS} offset presets. Delete one to add another.`);
      return;
    }
    if (offsetStart <= 0 && offsetMonthly <= 0) return;
    const fallback = `My preset ${offsetPresets.length + 1}`;
    const name = (prompt("Name this offset preset", fallback) || fallback).trim().slice(0, 32);
    if (!name) return;
    const next: OffsetPreset = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      name,
      start: Math.round(offsetStart),
      monthly: Math.round(offsetMonthly),
    };
    const arr = [...offsetPresets, next];
    setOffsetPresets(arr);
    saveOffsetPresets(arr);
    haptic(15);
  };

  const deleteOffsetPreset = (id: string) => {
    const arr = offsetPresets.filter((p) => p.id !== id);
    setOffsetPresets(arr);
    saveOffsetPresets(arr);
  };

  const resetDefaults = () => {
    setLoan(DEFAULTS.loan);
    setRate(DEFAULTS.rate);
    setTerm(DEFAULTS.term);
    setFreq(DEFAULTS.freq);
    setExtra(DEFAULTS.extra);
    setPropValue(DEFAULTS.propValue);
    setOffsetStart(DEFAULTS.offsetStart);
    setOffsetMonthly(DEFAULTS.offsetMonthly);
    setOffsetOpen(false);
    clearLast();
    setRestored(null);
  };

  const altFreqs = FREQS.filter((f) => f !== freq);

  // True while live inputs differ from the debounced snapshot — drives
  // mobile sticky-bar shimmer and result/chart dim states.
  const calcPending = useIsPending(`${loan}|${rate}|${term}|${extra}|${offsetStart}|${offsetMonthly}`);

  // Mobile sticky result bar: primary repayment + weekly equivalent + actions.
  usePublishMobileResult({
    label: `${FREQ_LABEL[freq]} repayment`,
    value: fmt0(headline),
    weekly: freq === "weekly" ? undefined : fmt0(result.weekly),
    onShare,
    onSave: scenarios.length < MAX_SCENARIOS ? saveScenario : undefined,
    pending: calcPending,
  });

  return (
    <div className="space-y-6">
      <StickyResultsBar
        watchRef={inputsRef}
        summary={`${fmt0(loan)} · ${rate.toFixed(2)}% · ${term}yr`}
        primary={`${FREQ_LABEL[freq]} ${fmt0(headline)}`}
      />
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

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* INPUTS */}
        <div ref={inputsRef} className="space-y-4 rounded-2xl border border-border bg-card p-4 md:space-y-5 md:p-5">
          <div id="loan-amount-input" className="scroll-mt-24">
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
                  onClick={() => {
                    haptic(10);
                    setLoan(v);
                  }}
                  className={`rounded-full md:rounded-md border px-3 py-1 text-[12px] font-medium ${
                    loan === v
                      ? "border-accent bg-accent text-accent-foreground md:border-[var(--c-navy)] md:bg-[var(--c-navy)] md:text-white"
                      : "border-border bg-background text-foreground hover:border-accent md:hover:border-[var(--c-navy)]"
                  }`}
                >
                  {v >= 1_000_000 ? `$${v / 1_000_000}M` : `$${v / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          <div id="interest-rate-input" className="scroll-mt-24">
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

          <div id="loan-term-input" className="scroll-mt-24">
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

          {/* Offset account (advanced, Sprint 4) */}
          <div className="rounded-xl border border-border">
            <button
              type="button"
              onClick={() => {
                setOffsetOpen((v) => !v);
                haptic(8);
              }}
              aria-expanded={offsetOpen}
              className="flex w-full min-h-[44px] items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="flex flex-wrap items-center gap-2">
                <strong className="text-[14px] font-semibold text-foreground">
                  Add an offset account
                </strong>
                <span className="text-[12px] uppercase tracking-wide text-muted-foreground">
                  advanced
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <Tooltip
                    label="What is an offset account?"
                    text="An offset account is a transaction account linked to your loan. Money in the offset reduces the interest you pay daily. $50,000 in offset on a $650,000 loan means you only pay interest on $600,000. Most Australian variable-rate loans include this feature free."
                  />
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  offsetOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            <p className="px-4 pb-3 text-[13px] text-muted-foreground">
              Model an offset account like 80% of Australian mortgages use.
            </p>
            {offsetOpen && (
              <div className="space-y-4 border-t border-border p-4">
                <div>
                  <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                    Quick presets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { label: "None", start: 0, monthly: 0 },
                        { label: "Offset only", start: 50000, monthly: 0 },
                        { label: "+ $500/mo", start: 50000, monthly: 500 },
                        { label: "+ $1,000/mo", start: 50000, monthly: 1000 },
                      ] as const
                    ).map((p) => {
                      const active =
                        Math.round(offsetStart) === p.start &&
                        Math.round(offsetMonthly) === p.monthly;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            haptic(10);
                            setOffsetStart(p.start);
                            setOffsetMonthly(p.monthly);
                          }}
                          aria-pressed={active}
                          className={
                            "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors " +
                            (active
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-border bg-background text-foreground hover:bg-muted")
                          }
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="offset-start"
                    className="mb-1 block text-[13px] font-medium text-foreground"
                  >
                    Starting offset balance
                  </label>
                  <CurrencyInput
                    id="offset-start"
                    value={offsetStart}
                    onChange={setOffsetStart}
                    min={0}
                    max={5_000_000}
                    ariaLabel="Starting offset balance"
                    placeholder="$0"
                  />
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Current savings sitting in your offset account today.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="offset-monthly"
                    className="mb-1 block text-[13px] font-medium text-foreground"
                  >
                    Monthly contribution to offset
                  </label>
                  <CurrencyInput
                    id="offset-monthly"
                    value={offsetMonthly}
                    onChange={setOffsetMonthly}
                    min={0}
                    max={50_000}
                    ariaLabel="Monthly contribution to offset"
                    placeholder="$0"
                  />
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    How much you'll add to the offset each month from leftover income.
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                      My saved presets
                    </p>
                    <button
                      type="button"
                      onClick={saveCurrentOffsetPreset}
                      disabled={offsetStart <= 0 && offsetMonthly <= 0}
                      className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      + Save current
                    </button>
                  </div>
                  {offsetPresets.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">
                      Save up to {MAX_OFFSET_PRESETS} of your own setups (e.g. "Conservative",
                      "After bonus") to compare in one tap.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {offsetPresets.map((p) => {
                        const active =
                          Math.round(offsetStart) === p.start &&
                          Math.round(offsetMonthly) === p.monthly;
                        return (
                          <span
                            key={p.id}
                            className={
                              "inline-flex items-center gap-1 rounded-full border pl-3 pr-1 py-1 text-[12px] font-medium transition-colors " +
                              (active
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border bg-background text-foreground")
                            }
                          >
                            <button
                              type="button"
                              onClick={() => applyOffsetPreset(p)}
                              aria-pressed={active}
                              title={`Apply: ${fmt0(p.start)} starting${
                                p.monthly > 0 ? ` + ${fmt0(p.monthly)}/mo` : ""
                              }`}
                              className="text-left"
                            >
                              {p.name}
                              <span
                                className={
                                  "ml-1.5 text-[10px] " +
                                  (active ? "opacity-90" : "text-muted-foreground")
                                }
                              >
                                {fmt0(p.start)}
                                {p.monthly > 0 ? ` +${fmt0(p.monthly)}/mo` : ""}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteOffsetPreset(p.id)}
                              aria-label={`Delete preset ${p.name}`}
                              className={
                                "ml-1 flex h-5 w-5 items-center justify-center rounded-full transition-colors " +
                                (active
                                  ? "hover:bg-accent-foreground/20"
                                  : "text-muted-foreground hover:bg-muted")
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {(() => {
            const advancedInner = (
              <div className="space-y-5">
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
            );
            return isMobile ? (
              <MobileCollapse title="Advanced loan settings" hint="Loan type, IO period, property value">
                {advancedInner}
              </MobileCollapse>
            ) : (
              advancedInner
            );
          })()}
        </div>

        {/* RESULTS */}
        <div className="order-first lg:order-none space-y-3 md:space-y-4">
          {!isMobile && (
            <QuickAdjustChips
              loan={loan}
              setLoan={setLoan}
              loanBounds={{ min: 50000, max: 3000000 }}
              rate={rate}
              setRate={setRate}
              rateBounds={{ min: 1, max: 15 }}
              term={term}
              setTerm={setTerm}
              termBounds={{ min: 5, max: 30 }}
            />
          )}
          {isMobile ? (
            <>
              <MobileResultCard
                primaryLabel={`${FREQ_LABEL[freq]} repayment`}
                primaryValue={headline}
                secondary={altFreqs.map((f) => ({ label: FREQ_LABEL[f], value: result[f] }))}
                loanAmount={loan}
                rate={rate}
                termYears={term}
                pending={calcPending}
                onEditField={handleEditField}
              />
              {freqSavings && (
                <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-[13px]">
                  <p className="text-success">
                    <span className="font-semibold">Tip:</span> Paying{" "}
                    {freqSavings.label} instead of monthly saves you{" "}
                    <span className="font-semibold">{freqSavings.monthsSaved} months</span>{" "}
                    and{" "}
                    <span className="font-semibold">{fmt0(freqSavings.interestSaved)}</span>{" "}
                    in total interest
                  </p>
                </div>
              )}
            </>
          ) : (
            <div
              className="result-panel-navy rounded-2xl border border-border bg-card p-6 text-center md:p-7"
            >
              <p className="result-primary-label text-[12px] uppercase tracking-wide text-muted-foreground">
                {FREQ_LABEL[freq]} repayment
              </p>
              <p className="result-primary-value tnum text-[44px] font-bold leading-none text-accent sm:text-[52px]">
                {fmt0(headline)}
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {altFreqs
                  .map((f) => `${FREQ_LABEL[f]}: ${fmt0(result[f])}`)
                  .join(" · ")}
              </p>

              {freqSavings && (
                <div className="mt-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-[13px]">
                  <p className="text-success">
                    <span className="font-semibold">Tip:</span> Paying{" "}
                    {freqSavings.label} instead of monthly saves you{" "}
                    <span className="font-semibold">{freqSavings.monthsSaved} months</span>{" "}
                    and{" "}
                    <span className="font-semibold">{fmt0(freqSavings.interestSaved)}</span>{" "}
                    in total interest
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Plain-English "What this means" summary */}
          {(() => {
            const monthlyRepay = result.monthly + dExtra;
            const requiredIncome = Math.max(0, (monthlyRepay * 12) / 0.3);
            const pctOfIncome = requiredIncome > 0 ? (monthlyRepay * 12 / requiredIncome) * 100 : 0;
            if (monthlyRepay <= 0) return null;
            return (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-[14px] text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100">
                <p className="mb-1 font-semibold">What this means</p>
                <p>
                  To comfortably afford this loan, most lenders suggest a minimum gross income of approximately{" "}
                  <span className="font-semibold">{fmt0(requiredIncome)}/year</span>{" "}
                  (based on the 30% of income rule). Your monthly repayment of{" "}
                  <span className="font-semibold">{fmt0(monthlyRepay)}</span> represents{" "}
                  <span className="font-semibold">{pctOfIncome.toFixed(0)}%</span> of a{" "}
                  {fmt0(requiredIncome)} annual salary.
                </p>
              </div>
            );
          })()}

          {isMobile && (
            <MobileInsightCards
              candidates={(() => {
                const list: InsightCandidate[] = [];
                // LMI warning (highest priority — costs real money)
                if (lvr !== null && lvr > 80) {
                  list.push({
                    id: "lmi-above-80",
                    tone: "warn",
                    priority: 1,
                    title: `LVR ${lvr.toFixed(0)}% — LMI likely required`,
                    body: (
                      <>
                        Lenders typically charge Lenders Mortgage Insurance above 80% LVR.
                        Try the <a href="/lmi-calculator" className="font-semibold underline">LMI calculator</a> to estimate it.
                      </>
                    ),
                  });
                }
                // Fortnightly savings
                if (freq === "monthly" && freqSavings === null) {
                  // freqSavings only populated for non-monthly; compute a quick estimate
                  const monthlyTotal = result.monthly + dExtra;
                  const mScenario = simulateDividedFrequency(dLoan, dRate, monthlyTotal, 12);
                  const fScenario = simulateDividedFrequency(dLoan, dRate, monthlyTotal / 2, 26);
                  const interestSaved = Math.max(0, mScenario.totalInterest - fScenario.totalInterest);
                  if (interestSaved > 1000) {
                    list.push({
                      id: "switch-fortnightly",
                      tone: "success",
                      priority: 2,
                      title: `Switch to fortnightly — save ${fmt0(interestSaved)}`,
                      body: `Paying fortnightly squeezes in an extra month's repayment each year, with no change to your budget.`,
                    });
                  }
                }
                // Interest-heavy warning
                if (result.totalInterest > dLoan && dExtra === 0) {
                  list.push({
                    id: "interest-heavier-than-loan",
                    tone: "warn",
                    priority: 3,
                    title: `You'll pay ${fmt0(result.totalInterest)} in interest`,
                    body: `That's more than the loan itself. Even small extra repayments compound — try $100/mo below.`,
                  });
                }
                // Extras nudge
                if (dExtra === 0 && dTerm >= 25) {
                  list.push({
                    id: "extras-suggest",
                    tone: "info",
                    priority: 4,
                    title: "Even $200/mo extra cuts years off",
                    body: "Open the extra repayments slider above — small consistent extras have an outsized impact on a 25+ year loan.",
                  });
                }
                return list;
              })()}
            />
          )}

          {/* Rate change scenarios */}
          <div className="space-y-3">
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">
                What if rates change?
              </h3>
              <p className="text-[13px] text-muted-foreground">
                The RBA meets 8 times per year. See how rate changes affect your repayments.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {rateScenarios.map((s) => {
                const isCurrent = s.label === "Current";
                const diffText =
                  s.diff === 0
                    ? "Same as now"
                    : `${s.diff > 0 ? "+" : "-"}${fmt0(Math.abs(s.diff))}/month`;
                const toneConfig = {
                  success: {
                    border: "border-success/30",
                    bg: "bg-success/10",
                    text: "text-success",
                  },
                  accent: {
                    border: "border-accent/30",
                    bg: "bg-accent/10",
                    text: "text-accent",
                  },
                  warning: {
                    border: "border-warning/30",
                    bg: "bg-warning/10",
                    text: "text-warning",
                  },
                  destructive: {
                    border: "border-destructive/30",
                    bg: "bg-destructive/10",
                    text: "text-destructive",
                  },
                }[s.tone];
                return (
                  <div
                    key={s.label}
                    className={`rounded-2xl border p-4 ${toneConfig.border} ${toneConfig.bg} ${isCurrent ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
                  >
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {s.label}
                    </p>
                    <p className={`tnum text-[22px] font-bold mt-1 ${toneConfig.text}`}>
                      {fmt0(s.monthly)}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      {s.rate.toFixed(2)}%
                    </p>
                    <p className="text-[12px] font-medium mt-0.5 text-muted-foreground">
                      {diffText}
                    </p>
                  </div>
                );
              })}
            </div>
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

          {offset && (
            <div className="rounded-2xl border border-success/40 bg-success/5 p-5">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-success">
                With offset account
              </p>
              <p className="mb-3 text-[13px] text-muted-foreground">
                Modelled against{" "}
                <strong className="font-semibold text-foreground">
                  {fmt0(dOffsetStart)}
                </strong>{" "}
                starting in the offset
                {dOffsetMonthly > 0 ? (
                  <>
                    {" "}plus{" "}
                    <strong className="font-semibold text-foreground">
                      {fmt0(dOffsetMonthly)}
                    </strong>{" "}
                    added every month
                  </>
                ) : (
                  <> with no further contributions</>
                )}
                . Both inputs drive the figures below — your monthly repayment of{" "}
                <strong className="font-semibold text-foreground">{fmt2(result.monthly)}</strong>{" "}
                doesn't change; more of it goes to principal each cycle.
              </p>
              {offset.clearedByOffsetAlone ? (
                <p className="mb-3 text-[14px] font-semibold text-success">
                  Your offset balance alone would clear this loan immediately.
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-muted-foreground">
                    Interest saved
                  </p>
                  <p className="tnum text-[22px] font-bold text-success">
                    {fmt0(offset.interestSaved)}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-muted-foreground">
                    Years shaved off
                  </p>
                  <p className="tnum text-[22px] font-bold text-success">
                    {offset.yearsSaved.toFixed(1)} years
                  </p>
                </div>
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-muted-foreground">
                    Effective rate
                  </p>
                  <p className="tnum text-[18px] font-bold text-accent">
                    {offset.effectiveRate.toFixed(2)}%
                    <span className="ml-1 text-[12px] font-normal text-muted-foreground">
                      vs {dRate.toFixed(2)}% nominal
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-muted-foreground">
                    New payoff year
                  </p>
                  <p className="tnum text-[18px] font-bold text-foreground">
                    {offset.payoffYearWith}
                    <span className="ml-1 text-[12px] font-normal text-muted-foreground">
                      (vs {offset.payoffYearWithout} without offset)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {(() => {
            const chart = (
              <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted/40" />}>
                <AmortChart
                  schedule={offset ? offset.yearlySchedule : result.schedule}
                  baselineSchedule={offset && baselineForChart ? baselineForChart : undefined}
                />
              </Suspense>
            );
            const title = offset ? "Loan balance over time" : "Principal vs interest by year";
            return isMobile ? (
              <MobileCollapse title={title} hint="Tap to see year-by-year chart">
                {chart}
              </MobileCollapse>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-3 text-[15px] font-semibold">{title}</h3>
                {chart}
              </div>
            );
          })()}

          {!isMobile && (
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
          )}

          {isMobile ? (
            <MobileCollapse title="Year-by-year schedule" hint="Full amortisation table">
              <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-muted/40" />}>
                <AmortTable schedule={result.schedule} />
              </Suspense>
            </MobileCollapse>
          ) : (
            <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-muted/40" />}>
              <AmortTable schedule={result.schedule} />
            </Suspense>
          )}

          {!isMobile && (
            <ResultActions
              calculator="mortgage_repayment"
              onEmail={() => setEmailOpen(true)}
              emailSummary={`${freq.charAt(0).toUpperCase() + freq.slice(1)} repayment of ${fmt0(headline)} on a ${fmt0(loan)} loan at ${rate.toFixed(2)}% over ${term} years.`}
            />
          )}
          <EmailResultsDialog
            open={emailOpen}
            onOpenChange={setEmailOpen}
            calculator="mortgage"
            inputs={{ loan, rate, term, freq, extra, propValue, offsetStart, offsetMonthly }}
            resultSummary={`${freq.charAt(0).toUpperCase() + freq.slice(1)} repayment of ${fmt0(headline)} on a ${fmt0(loan)} loan at ${rate.toFixed(2)}% over ${term} years.`}
          />

          <ShareResult
            calculator="mortgage_repayment"
            params={{
              loan: Math.round(loan),
              rate: rate.toFixed(2),
              term,
              freq,
              extra: Math.round(extra),
              pv: propValue > 0 ? Math.round(propValue) : undefined,
              offset_start: offsetStart > 0 ? Math.round(offsetStart) : undefined,
              offset_monthly: offsetMonthly > 0 ? Math.round(offsetMonthly) : undefined,
            }}
            shareText={`I calculated my mortgage repayment at ${fmt0(headline)} per ${freq}`}
          />

          <p className="text-[12px] text-muted-foreground">
            Calculations use a {fmt2(result.monthly)} monthly base repayment. Offset figures are a
            month-by-month simulation against this same engine — accurate to the cent for the
            inputs above. Your lender's exact rate, fees, and timing may differ.
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
