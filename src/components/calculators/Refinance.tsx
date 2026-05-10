import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildRefinanceTimeline,
  calculateRefinance,
  estimateBreakCost,
  fixedRemainingToMonths,
  type CurrentLoanType,
  type FixedRemaining,
  type LmiMode,
  type NewLoanType,
  type RefinanceInputs,
} from "@/lib/calc/refinance";
import { useRbaRates } from "@/hooks/useRbaRates";
import { usePublishMobileResult } from "@/lib/mobileResult";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const fmt0 = (n: number) => AUD.format(Math.round(n));
const fmtSigned = (n: number) => `${n < 0 ? "-" : ""}${AUD.format(Math.abs(Math.round(n)))}`;

const STORAGE_KEY = "calcy_refinance_last";
const SHARED_KEY = "calcy_shared_state";
const TTL = 90 * 24 * 60 * 60 * 1000;

interface State {
  currentBalance: number;
  currentRate: number;
  currentTermYears: number;
  currentTermMonthsExtra: number;
  currentLoanType: CurrentLoanType;
  fixedRemaining: FixedRemaining;
  exitFees: number;
  hasOffset: boolean;
  currentOffsetBalance: number;

  newRate: number;
  newTermMode: "20" | "25" | "30" | "keep";
  newLoanType: NewLoanType;
  newLenderFees: number;
  cashback: number;
  newHasOffset: boolean;
  newOffsetBalance: number;

  lmiMode: LmiMode;
  propertyValue: number;
  manualLmi: number;

  wholesaleRate: number; // for break cost section
}

const DEFAULTS: State = {
  currentBalance: 500_000,
  currentRate: 6.75,
  currentTermYears: 25,
  currentTermMonthsExtra: 0,
  currentLoanType: "variable",
  fixedRemaining: "1-2y",
  exitFees: 300,
  hasOffset: false,
  currentOffsetBalance: 0,

  newRate: 6.24,
  newTermMode: "keep",
  newLoanType: "variable",
  newLenderFees: 0,
  cashback: 0,
  newHasOffset: true,
  newOffsetBalance: 0,

  lmiMode: "auto",
  propertyValue: 700_000,
  manualLmi: 0,

  wholesaleRate: 4.1,
};

const BALANCE_PILLS = [300_000, 400_000, 500_000, 600_000, 750_000, 1_000_000];
const TERM_PILLS = [10, 15, 20, 25, 30];
const CASHBACK_PILLS = [0, 2000, 3000, 4000];

function readUrl(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  if (![...sp.keys()].length) return null;
  const out: Partial<State> = {};
  const num = (k: string) => {
    const v = sp.get(k);
    return v != null && !Number.isNaN(parseFloat(v)) ? parseFloat(v) : undefined;
  };
  if (num("balance") != null) out.currentBalance = num("balance")!;
  if (num("currentrate") != null) out.currentRate = num("currentrate")!;
  if (num("term") != null) out.currentTermYears = num("term")!;
  if (num("newrate") != null) out.newRate = num("newrate")!;
  if (num("exit") != null) out.exitFees = num("exit")!;
  if (num("fees") != null) out.newLenderFees = num("fees")!;
  if (num("lmi") != null) out.manualLmi = num("lmi")!;
  if (num("cashback") != null) out.cashback = num("cashback")!;
  if (num("offset") != null) {
    out.currentOffsetBalance = num("offset")!;
    out.hasOffset = num("offset")! > 0;
  }
  if (num("newoffset") != null) {
    out.newOffsetBalance = num("newoffset")!;
    out.newHasOffset = true;
  }
  if (num("propvalue") != null) out.propertyValue = num("propvalue")!;
  const nt = sp.get("newterm");
  if (nt === "20" || nt === "25" || nt === "30" || nt === "keep") out.newTermMode = nt;
  const fixed = sp.get("fixed");
  if (fixed === "yes") out.currentLoanType = "fixed";
  if (fixed === "no") out.currentLoanType = "variable";
  const fr = sp.get("fr");
  if (fr === "<6m" || fr === "6-12m" || fr === "1-2y" || fr === "2y+") out.fixedRemaining = fr;
  const lmiMode = sp.get("lmimode");
  if (lmiMode === "auto" || lmiMode === "yes" || lmiMode === "no") out.lmiMode = lmiMode;
  return out;
}

function readLocal(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: Partial<State> };
    if (Date.now() - parsed.ts > TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function readShared(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SHARED_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as {
      loanBalance?: number;
      annualRate?: number;
      interestRate?: number;
      remainingTermYears?: number;
      propertyValue?: number;
    };
    const out: Partial<State> = {};
    if (typeof s.loanBalance === "number") out.currentBalance = s.loanBalance;
    if (typeof s.annualRate === "number") out.currentRate = s.annualRate;
    else if (typeof s.interestRate === "number") out.currentRate = s.interestRate;
    if (typeof s.remainingTermYears === "number") out.currentTermYears = s.remainingTermYears;
    if (typeof s.propertyValue === "number") out.propertyValue = s.propertyValue;
    return out;
  } catch {
    return null;
  }
}

const Pill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
      active
        ? "border-accent bg-accent text-accent-foreground"
        : "border-border bg-background text-foreground hover:border-accent/40"
    }`}
  >
    {children}
  </button>
);

const NumberField = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  hint?: React.ReactNode;
}) => (
  <label className="block">
    <span className="mb-1 block text-[13px] font-medium text-foreground">{label}</span>
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground">
          {prefix}
        </span>
      )}
      <input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ""}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`w-full rounded-xl border border-border bg-background py-2.5 text-[15px] text-foreground focus:border-accent focus:outline-none ${
          prefix ? "pl-7" : "pl-3"
        } ${suffix ? "pr-10" : "pr-3"}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
    {hint && <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>}
  </label>
);

const Segmented = <T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) => (
  <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-muted/30 p-1">
    {options.map((o) => (
      <button
        key={String(o.value)}
        type="button"
        onClick={() => onChange(o.value)}
        className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
          value === o.value
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-accent/10"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const Refinance = () => {
  const rbaRates = useRbaRates();
  const [s, setS] = useState<State>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    const fromUrl = readUrl();
    const fromLocal = !fromUrl ? readLocal() : null;
    const fromShared = !fromUrl && !fromLocal ? readShared() : null;
    return { ...DEFAULTS, ...(fromShared || {}), ...(fromLocal || {}), ...(fromUrl || {}) };
  });
  const [restored, setRestored] = useState<"local" | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!readUrl() && readLocal()) setRestored("local");
  }, []);

  const set = <K extends keyof State>(k: K, v: State[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const debounced = useDebouncedValue(s, 150);

  // Build engine inputs
  const inputs: RefinanceInputs = useMemo(() => {
    const currentTermMonths = Math.max(
      1,
      Math.round(debounced.currentTermYears * 12 + debounced.currentTermMonthsExtra),
    );
    const newTermMonths =
      debounced.newTermMode === "keep"
        ? currentTermMonths
        : parseInt(debounced.newTermMode, 10) * 12;
    const breakCost =
      debounced.currentLoanType === "fixed"
        ? estimateBreakCost(
            debounced.currentBalance,
            debounced.currentRate,
            debounced.wholesaleRate,
            fixedRemainingToMonths(debounced.fixedRemaining),
          )
        : 0;

    return {
      currentBalance: Math.max(1000, debounced.currentBalance),
      currentRate: Math.max(0.1, debounced.currentRate),
      currentTermMonths,
      currentLoanType: debounced.currentLoanType,
      fixedRemaining: debounced.fixedRemaining,
      exitFees: debounced.exitFees,
      currentOffsetBalance: debounced.hasOffset ? debounced.currentOffsetBalance : 0,
      newRate: Math.max(0.1, debounced.newRate),
      newTermMonths,
      newLenderFees: debounced.newLenderFees,
      newOffsetBalance: debounced.newHasOffset ? debounced.newOffsetBalance : 0,
      cashback: debounced.cashback,
      lmiMode: debounced.lmiMode,
      propertyValue: Math.max(1000, debounced.propertyValue),
      manualLmi: debounced.manualLmi,
      estimatedBreakCost: breakCost,
    };
  }, [debounced]);

  const result = useMemo(() => calculateRefinance(inputs), [inputs]);
  const timeline = useMemo(
    () => buildRefinanceTimeline(inputs, result),
    [inputs, result],
  );

  usePublishMobileResult({
    label: result.monthlySaving >= 0 ? "Monthly saving" : "Monthly extra cost",
    value: fmt0(Math.abs(result.monthlySaving)),
    sub: result.breakEvenMonth != null
      ? `Break-even: month ${result.breakEvenMonth}`
      : "No break-even",
  });

  // Persist + URL sync (debounced)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), data: debounced }),
      );
      window.sessionStorage.setItem(
        SHARED_KEY,
        JSON.stringify({
          loanBalance: debounced.currentBalance,
          interestRate: debounced.newRate,
          remainingTermYears: Math.round(inputs.newTermMonths / 12),
          propertyValue: debounced.propertyValue,
        }),
      );
      const sp = new URLSearchParams();
      sp.set("balance", String(debounced.currentBalance));
      sp.set("currentrate", String(debounced.currentRate));
      sp.set("term", String(debounced.currentTermYears));
      sp.set("newrate", String(debounced.newRate));
      sp.set("newterm", debounced.newTermMode);
      sp.set("exit", String(debounced.exitFees));
      sp.set("fees", String(debounced.newLenderFees));
      sp.set("cashback", String(debounced.cashback));
      sp.set("offset", String(debounced.hasOffset ? debounced.currentOffsetBalance : 0));
      sp.set("newoffset", String(debounced.newHasOffset ? debounced.newOffsetBalance : 0));
      sp.set("propvalue", String(debounced.propertyValue));
      sp.set("fixed", debounced.currentLoanType === "fixed" ? "yes" : "no");
      sp.set("fr", debounced.fixedRemaining);
      sp.set("lmimode", debounced.lmiMode);
      window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
    } catch {
      // ignore
    }
  }, [debounced, inputs.newTermMonths]);

  const reset = () => {
    setS(DEFAULTS);
    setRestored(null);
  };

  const onShare = async () => {
    const url = window.location.href;
    const text =
      result.monthlySaving > 0
        ? `Refinancing my ${fmt0(inputs.currentBalance)} loan from ${inputs.currentRate}% to ${inputs.newRate}% saves ${fmt0(result.monthlySaving)}/month (${fmt0(result.annualSaving)}/year). Break-even in ${result.breakEvenMonth ?? "—"} months.`
        : `Refinancing this loan would cost more — see Calcy for details.`;
    try {
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: "My refinance calculation — Calcy", text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {
      // user cancelled
    }
  };

  // Rate diff badge
  const rateDiff = inputs.newRate - inputs.currentRate;
  const rateDiffLabel =
    Math.abs(rateDiff) < 0.005
      ? { text: "Same as current rate", cls: "bg-muted text-muted-foreground" }
      : rateDiff < 0
        ? { text: `↓ ${Math.abs(rateDiff).toFixed(2)}% lower than current rate`, cls: "bg-success/15 text-success" }
        : { text: `↑ ${rateDiff.toFixed(2)}% higher than current rate`, cls: "bg-destructive/15 text-destructive" };

  // Checklist
  const checks: { status: "ok" | "warn" | "bad"; text: string }[] = [];
  if (result.monthlySaving >= 200)
    checks.push({ status: "ok", text: `Your monthly saving is meaningful (${fmt0(result.monthlySaving)}/mo is significant)` });
  else if (result.monthlySaving >= 100)
    checks.push({ status: "warn", text: `Monthly saving is modest (${fmt0(result.monthlySaving)}/mo)` });
  else if (result.monthlySaving > 0)
    checks.push({ status: "bad", text: `Monthly saving is small (${fmt0(result.monthlySaving)}/mo)` });
  else
    checks.push({ status: "bad", text: `New loan costs more per month than your current loan` });

  if (result.breakEvenMonth == null)
    checks.push({ status: "bad", text: `Switching costs are never recovered at this new rate` });
  else if (result.breakEvenMonth === 0)
    checks.push({ status: "ok", text: `Cashback exceeds switching costs — break-even is immediate` });
  else if (result.breakEvenMonth <= 18)
    checks.push({ status: "ok", text: `Break-even is fast (Month ${result.breakEvenMonth} — under 18 months)` });
  else if (result.breakEvenMonth <= 36)
    checks.push({ status: "warn", text: `Break-even is moderate (Month ${result.breakEvenMonth})` });
  else
    checks.push({ status: "bad", text: `Break-even is slow (Month ${result.breakEvenMonth})` });

  checks.push({
    status: "warn",
    text: `Make sure you'll keep this loan at least 3 years after break-even`,
  });

  if (inputs.currentLoanType === "fixed") {
    checks.push({
      status: result.switchingBreakdown.breakCost > 5000 ? "bad" : "warn",
      text: `Fixed rate break cost estimated at ${fmt0(result.switchingBreakdown.breakCost)} — confirm with your lender`,
    });
  } else {
    checks.push({ status: "warn", text: `Your current loan is variable — no break cost risk` });
  }

  if (result.lmiApplies && result.switchingBreakdown.lmi > 0) {
    checks.push({
      status: "bad",
      text: `LMI applies on refinance (${fmt0(result.switchingBreakdown.lmi)}) — LVR is ${result.lvr.toFixed(1)}%`,
    });
  } else {
    checks.push({
      status: "ok",
      text: `LMI does not apply on refinance (LVR is ${result.lvr.toFixed(1)}%)`,
    });
  }

  const okCount = checks.filter((c) => c.status === "ok").length;
  const badCount = checks.filter((c) => c.status === "bad").length;
  const overall =
    badCount >= 2
      ? { text: "❌ The numbers suggest refinancing may not be worth it right now", cls: "text-destructive" }
      : okCount >= 3
        ? { text: "✅ Refinancing looks worth it based on your numbers", cls: "text-success" }
        : { text: "⚠ Refinancing may be worthwhile — review each factor carefully", cls: "text-warning-foreground" };

  // Verdict colors
  const savingPositive = result.monthlySaving > 0;
  const verdictBorder = savingPositive
    ? "border-success/60 bg-success/5"
    : "border-destructive/60 bg-destructive/5";

  return (
    <div className="space-y-6 pb-32 md:pb-0">
      <RestoreBanner show={!!restored} onReset={reset} />

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        {/* LEFT — Inputs */}
        <div className="space-y-6">
          {/* Current loan */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-[16px] font-semibold">Your current loan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <NumberField
                  label="Current loan balance"
                  prefix="$"
                  value={s.currentBalance}
                  onChange={(v) => set("currentBalance", v)}
                  step={5000}
                  hint="Enter your outstanding balance — not the original loan amount."
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BALANCE_PILLS.map((p) => (
                    <Pill
                      key={p}
                      active={s.currentBalance === p}
                      onClick={() => set("currentBalance", p)}
                    >
                      {p >= 1_000_000 ? `$${p / 1_000_000}M` : `$${p / 1000}k`}
                    </Pill>
                  ))}
                </div>
              </div>
              <NumberField
                label="Current interest rate"
                suffix="%"
                value={s.currentRate}
                onChange={(v) => set("currentRate", v)}
                step={0.05}
                hint={`RBA cash rate: ${rbaRates.cashRate}%`}
              />
              <div>
                <NumberField
                  label="Remaining term (years)"
                  value={s.currentTermYears}
                  onChange={(v) => set("currentTermYears", v)}
                  step={1}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TERM_PILLS.map((p) => (
                    <Pill
                      key={p}
                      active={s.currentTermYears === p}
                      onClick={() => set("currentTermYears", p)}
                    >
                      {p} yr
                    </Pill>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1 block text-[13px] font-medium text-foreground">
                  Current loan type
                </span>
                <Segmented
                  value={s.currentLoanType}
                  options={[
                    { value: "variable", label: "Variable" },
                    { value: "fixed", label: "Fixed" },
                  ]}
                  onChange={(v) => set("currentLoanType", v)}
                />
              </div>
              {s.currentLoanType === "fixed" && (
                <div className="sm:col-span-2">
                  <span className="mb-1 block text-[13px] font-medium text-foreground">
                    Fixed rate — time remaining
                  </span>
                  <Segmented
                    value={s.fixedRemaining}
                    options={[
                      { value: "<6m", label: "< 6 mo" },
                      { value: "6-12m", label: "6–12 mo" },
                      { value: "1-2y", label: "1–2 yr" },
                      { value: "2y+", label: "2 yr+" },
                    ]}
                    onChange={(v) => set("fixedRemaining", v)}
                  />
                  <div className="mt-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-[13px] leading-relaxed">
                    <strong>⚠ Fixed rate break costs.</strong> Breaking a fixed rate loan early can
                    cost <strong>$5,000–$50,000+</strong> depending on remaining term, current vs
                    contracted wholesale rates, and your loan balance. Always get a break cost quote
                    from your lender before deciding to refinance.
                  </div>
                </div>
              )}
              <NumberField
                label="Exit / discharge fee"
                prefix="$"
                value={s.exitFees}
                onChange={(v) => set("exitFees", v)}
                hint="Most lenders charge a discharge fee of $150–$400."
              />
              <label className="flex items-center gap-2 self-end text-[13px] font-medium">
                <input
                  type="checkbox"
                  checked={s.hasOffset}
                  onChange={(e) => set("hasOffset", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Current loan has an offset account
              </label>
              {s.hasOffset && (
                <div className="sm:col-span-2">
                  <NumberField
                    label="Current offset balance"
                    prefix="$"
                    value={s.currentOffsetBalance}
                    onChange={(v) => set("currentOffsetBalance", v)}
                    step={1000}
                    hint="Your offset reduces the effective interest you pay."
                  />
                </div>
              )}
            </div>
          </section>

          {/* New loan */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-[16px] font-semibold">New loan details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <NumberField
                  label="New interest rate"
                  suffix="%"
                  value={s.newRate}
                  onChange={(v) => set("newRate", v)}
                  step={0.05}
                />
                <div
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-[12px] font-semibold ${rateDiffLabel.cls}`}
                >
                  {rateDiffLabel.text}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-[13px] font-medium text-foreground">
                  New loan term
                </span>
                <Segmented
                  value={s.newTermMode}
                  options={[
                    { value: "20", label: "20 yr" },
                    { value: "25", label: "25 yr" },
                    { value: "30", label: "30 yr" },
                    { value: "keep", label: "Keep remaining" },
                  ]}
                  onChange={(v) => set("newTermMode", v)}
                />
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Extending term lowers monthly repayments but increases total interest.
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-[13px] font-medium text-foreground">
                  New loan type
                </span>
                <Segmented
                  value={s.newLoanType}
                  options={[
                    { value: "variable", label: "Variable" },
                    { value: "fixed1", label: "Fixed 1y" },
                    { value: "fixed2", label: "Fixed 2y" },
                    { value: "fixed3", label: "Fixed 3y" },
                    { value: "split", label: "Split" },
                  ]}
                  onChange={(v) => set("newLoanType", v)}
                />
              </div>
              <NumberField
                label="New lender setup fees"
                prefix="$"
                value={s.newLenderFees}
                onChange={(v) => set("newLenderFees", v)}
                hint="Many lenders waive fees on refinance."
              />
              <div>
                <NumberField
                  label="Cashback offer (optional)"
                  prefix="$"
                  value={s.cashback}
                  onChange={(v) => set("cashback", v)}
                  step={500}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CASHBACK_PILLS.map((p) => (
                    <Pill key={p} active={s.cashback === p} onClick={() => set("cashback", p)}>
                      {p === 0 ? "$0" : `$${(p / 1000).toFixed(0)}k`}
                    </Pill>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-[13px] font-medium text-foreground">
                  Will LMI apply on the new loan?
                </span>
                <Segmented
                  value={s.lmiMode}
                  options={[
                    { value: "auto", label: "Auto-calculate" },
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes (manual)" },
                  ]}
                  onChange={(v) => set("lmiMode", v)}
                />
                {s.lmiMode === "auto" && (
                  <div className="mt-3">
                    <NumberField
                      label="Estimated current property value"
                      prefix="$"
                      value={s.propertyValue}
                      onChange={(v) => set("propertyValue", v)}
                      step={10_000}
                      hint={
                        <>
                          Current LVR: <strong>{result.lvr.toFixed(1)}%</strong> —{" "}
                          {result.lmiApplies ? (
                            <span className="text-destructive">LMI applies</span>
                          ) : (
                            <span className="text-success">LMI does not apply</span>
                          )}
                          {result.lmiApplies && (
                            <>
                              . Estimated LMI on refinance:{" "}
                              <strong>{fmt0(result.estimatedLmi)}</strong>.
                            </>
                          )}
                        </>
                      }
                    />
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      LMI is not transferable between lenders — if your LVR is above 80% you may
                      need to pay a new LMI premium.
                    </p>
                  </div>
                )}
                {s.lmiMode === "yes" && (
                  <div className="mt-3">
                    <NumberField
                      label="LMI premium (if known)"
                      prefix="$"
                      value={s.manualLmi}
                      onChange={(v) => set("manualLmi", v)}
                      step={500}
                    />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 self-end text-[13px] font-medium sm:col-span-2">
                <input
                  type="checkbox"
                  checked={s.newHasOffset}
                  onChange={(e) => set("newHasOffset", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                New loan has an offset account
              </label>
              {s.newHasOffset && (
                <div className="sm:col-span-2">
                  <NumberField
                    label="New offset balance (estimated)"
                    prefix="$"
                    value={s.newOffsetBalance}
                    onChange={(v) => set("newOffsetBalance", v)}
                    step={1000}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Fixed rate break cost section */}
          {s.currentLoanType === "fixed" && (
            <section className="rounded-2xl border-2 border-warning/50 bg-warning/5 p-5">
              <h3 className="text-[15px] font-semibold">⚠ Fixed rate break cost estimate</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                When you break a fixed rate loan before the term expires, your lender charges a
                break cost based on the difference between your contracted rate and current
                wholesale rates, your remaining balance, and time remaining.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <NumberField
                  label="Current wholesale rate (estimate)"
                  suffix="%"
                  value={s.wholesaleRate}
                  onChange={(v) => set("wholesaleRate", v)}
                  step={0.05}
                  hint={`Pre-filled with the RBA cash rate (${rbaRates.cashRate}%) as a proxy.`}
                />
                <div className="rounded-xl border border-border bg-background p-3 text-[13px]">
                  <div className="text-[11px] uppercase text-muted-foreground">
                    Estimated break cost
                  </div>
                  <div className="mt-1 text-[22px] font-bold tnum">
                    {fmt0(result.switchingBreakdown.breakCost)}
                  </div>
                  <div className="mt-1 text-[12px] text-muted-foreground">
                    Estimate only — request an exact quote from your lender before refinancing.
                  </div>
                </div>
              </div>
              {result.switchingBreakdown.breakCost > 5000 && (
                <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-[13px] text-destructive">
                  <strong>🔴 High break cost detected.</strong> Your estimated break cost of{" "}
                  {fmt0(result.switchingBreakdown.breakCost)} significantly delays your break-even.
                  Updated break-even with this cost:{" "}
                  <strong>
                    {result.breakEvenMonth == null
                      ? "never"
                      : `Month ${result.breakEvenMonth}`}
                  </strong>
                  .
                </div>
              )}
            </section>
          )}
        </div>

        {/* RIGHT — Verdict panel */}
        <aside className="md:sticky md:top-6 md:self-start">
          <div
            className={`rounded-2xl border-2 p-5 transition-colors ${verdictBorder}`}
            aria-live="polite"
          >
            <div className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              {savingPositive ? "Monthly saving" : "Monthly increase"}
            </div>
            <div
              className={`mt-1 text-[34px] font-bold leading-none tracking-tight tnum ${
                savingPositive ? "text-success" : "text-destructive"
              }`}
            >
              {fmt0(Math.abs(result.monthlySaving))}/mo
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">New repayment</div>
                <div className="font-semibold tnum">{fmt0(result.newRepayment)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Current</div>
                <div className="font-semibold tnum">{fmt0(result.currentRepayment)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Annual saving</div>
                <div className="font-semibold tnum">
                  {fmt0(Math.abs(result.annualSaving))}/yr
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">5-year saving</div>
                <div className="font-semibold tnum">{fmtSigned(result.saving5yr)}</div>
              </div>
            </div>

            {/* Break-even */}
            <div className="mt-4 rounded-xl border border-border bg-background/60 p-3">
              <div className="text-[11px] uppercase text-muted-foreground">Break-even</div>
              {result.breakEvenMonth == null ? (
                <>
                  <div className="text-[18px] font-bold text-destructive">Not recovered</div>
                  <div className="text-[12px] text-muted-foreground">
                    {result.monthlySaving <= 0
                      ? "Refinancing to this rate costs more — not recommended."
                      : "Switching costs are not recovered within the loan term."}
                  </div>
                </>
              ) : result.breakEvenMonth === 0 ? (
                <>
                  <div className="text-[18px] font-bold text-success">Immediate</div>
                  <div className="text-[12px] text-muted-foreground">
                    Cashback exceeds switching costs — you receive{" "}
                    {fmt0(Math.abs(result.netSwitchingCost))} net at settlement.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[18px] font-bold text-foreground">
                    Month {result.breakEvenMonth}
                    {result.breakEvenMonth > 36 && (
                      <span className="ml-2 text-[12px] font-semibold text-destructive">
                        likely not worth it
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    You recover all switching costs in {result.breakEvenMonth} months. Every month
                    after saves {fmt0(result.monthlySaving)}.
                  </div>
                </>
              )}
              {/* Progress bar to month 36 */}
              {result.breakEvenMonth != null && result.breakEvenMonth > 0 && (
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${result.breakEvenMonth <= 18 ? "bg-success" : result.breakEvenMonth <= 36 ? "bg-warning" : "bg-destructive"}`}
                    style={{
                      width: `${Math.min(100, (result.breakEvenMonth / 36) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Switching cost summary */}
            <div className="mt-4 rounded-xl border border-border bg-background/60 p-3 text-[13px]">
              <div className="font-semibold">Switching costs</div>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Exit fee (current lender)</span>
                  <span className="tnum">{fmt0(result.switchingBreakdown.exitFees)}</span>
                </li>
                <li className="flex justify-between">
                  <span>New lender setup fees</span>
                  <span className="tnum">{fmt0(result.switchingBreakdown.newLenderFees)}</span>
                </li>
                <li className="flex justify-between">
                  <span>LMI on refinance</span>
                  <span className="tnum">{fmt0(result.switchingBreakdown.lmi)}</span>
                </li>
                {result.switchingBreakdown.breakCost > 0 && (
                  <li className="flex justify-between">
                    <span>Fixed rate break cost</span>
                    <span className="tnum">{fmt0(result.switchingBreakdown.breakCost)}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span>Less: cashback</span>
                  <span className="tnum">
                    -{fmt0(result.switchingBreakdown.cashback)}
                  </span>
                </li>
              </ul>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                <span>Net switching cost</span>
                <span
                  className={`tnum ${result.netSwitchingCost < 0 ? "text-success" : "text-foreground"}`}
                >
                  {fmtSigned(result.netSwitchingCost)}
                </span>
              </div>
              {result.netSwitchingCost < 0 && (
                <div className="mt-1 text-[12px] text-success">
                  You receive {fmt0(Math.abs(result.netSwitchingCost))} net at settlement.
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onShare}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-[13px] font-semibold hover:border-accent"
              >
                {shareCopied ? "Link copied" : "Share result"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-border bg-background px-3 py-2 text-[13px] font-semibold hover:border-accent"
              >
                Reset
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Savings timeline chart */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold">Cumulative cost — current vs refinanced</h3>
          {result.breakEvenMonth != null && result.breakEvenMonth > 0 && (
            <span className="rounded-full bg-warning/15 px-3 py-1 text-[12px] font-semibold text-warning-foreground">
              Break-even: Month {result.breakEvenMonth}
            </span>
          )}
        </div>
        <div className="h-[280px] w-full md:h-[320px]">
          <ResponsiveContainer>
            <AreaChart data={timeline} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="curFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="newFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(v: number) =>
                  v % 12 === 0 ? `${v / 12}y` : `${v}m`
                }
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1_000_000
                    ? `$${(v / 1_000_000).toFixed(1)}M`
                    : `$${Math.round(v / 1000)}k`
                }
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                formatter={(value: number, name: string) => [fmt0(value), name]}
                labelFormatter={(l) => `Month ${l}`}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background))",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                name="Current loan"
                dataKey="current"
                stroke="hsl(var(--accent))"
                strokeWidth={2.5}
                fill="url(#curFill)"
              />
              <Area
                type="monotone"
                name="Refinanced loan"
                dataKey="refinanced"
                stroke="hsl(var(--success))"
                strokeWidth={2.5}
                fill="url(#newFill)"
              />
              {result.breakEvenMonth != null && result.breakEvenMonth > 0 && (
                <ReferenceLine
                  x={result.breakEvenMonth}
                  stroke="hsl(var(--warning))"
                  strokeDasharray="5 5"
                  label={{
                    value: "Break-even",
                    position: "top",
                    fill: "hsl(var(--warning-foreground))",
                    fontSize: 11,
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {result.breakEvenMonth == null && (
          <p className="mt-2 text-[12px] text-destructive">
            The lines never cross — refinancing to this rate would cost more over the term.
          </p>
        )}
        {result.totalInterestSaved > 0 && (
          <p className="mt-2 text-[12px] text-muted-foreground">
            Total interest saved over the remaining term:{" "}
            <strong className="text-foreground">{fmt0(result.totalInterestSaved)}</strong>
          </p>
        )}
      </section>

      {/* Checklist */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-[15px] font-semibold">Is refinancing right for you?</h3>
        <ul className="mt-3 space-y-2 text-[13px]">
          {checks.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={`mt-0.5 inline-block h-5 w-5 flex-none rounded-full text-center text-[12px] font-bold leading-5 ${
                  c.status === "ok"
                    ? "bg-success/15 text-success"
                    : c.status === "warn"
                      ? "bg-warning/15 text-warning-foreground"
                      : "bg-destructive/15 text-destructive"
                }`}
              >
                {c.status === "ok" ? "✓" : c.status === "warn" ? "!" : "✕"}
              </span>
              <span className="text-foreground">{c.text}</span>
            </li>
          ))}
        </ul>
        <div className={`mt-4 rounded-xl border border-border bg-background/60 p-3 text-[14px] font-semibold ${overall.cls}`}>
          {overall.text}
        </div>
      </section>

      {/* Cross-calculator links */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-[15px] font-semibold">Continue your refinance plan</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link
            to="/loan-comparison-calculator"
            className="rounded-xl border border-border bg-background px-3 py-2 text-[13px] hover:border-accent"
          >
            → Compare your two loans side by side
          </Link>
          <Link
            to="/extra-repayments-calculator"
            className="rounded-xl border border-border bg-background px-3 py-2 text-[13px] hover:border-accent"
          >
            → Extra repayments on the new loan
          </Link>
          {(result.lvr > 80 || result.lmiApplies) && (
            <Link
              to="/lmi-calculator"
              className="rounded-xl border border-border bg-background px-3 py-2 text-[13px] hover:border-accent"
            >
              → Check LMI on the new loan
            </Link>
          )}
          <Link
            to="/borrowing-power-calculator"
            className="rounded-xl border border-border bg-background px-3 py-2 text-[13px] hover:border-accent"
          >
            → Borrowing power at the new rate
          </Link>
        </div>
      </section>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-16 z-40 flex items-center justify-between border-t border-border bg-background px-4 py-3 md:hidden">
        <span className="text-[12px] uppercase text-muted-foreground">
          {savingPositive ? "Monthly saving" : "Monthly increase"}
        </span>
        <span
          className={`text-[18px] font-bold tnum ${
            savingPositive ? "text-success" : "text-destructive"
          }`}
        >
          {fmt0(Math.abs(result.monthlySaving))}/mo
        </span>
      </div>
    </div>
  );
};

export default Refinance;
