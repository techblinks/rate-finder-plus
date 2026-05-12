import { useEffect, useMemo, useRef, useState } from "react";
import RestoreBanner from "@/components/RestoreBanner";
import { Minus, Plus, Share2, Check, ChevronDown } from "lucide-react";
import { calcBorrowingPowerV2, calcHem } from "@/lib/calc/borrowingPower";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import { usePublishMobileResult } from "@/lib/mobileResult";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileInsightBar from "@/components/mobile/MobileInsightBar";
import { useRbaRates } from "@/hooks/useRbaRates";
import Tooltip from "@/components/Tooltip";
import ResultActions from "@/components/ResultActions";

const AUD0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const fmt0 = (n: number) => AUD0.format(Math.max(0, Math.round(n)));

const STORAGE_KEY = "calcy_borrowing_last";
const STORAGE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

type State = {
  income: number;
  partnerIncome: number;
  joint: boolean;
  overtimeIncome: number;
  rentalIncome: number;
  monthlyExpenses: number;
  otherRepayments: number;
  creditCardLimit: number;
  dependants: number;
  interestRate: number;
  loanTerm: number;
  deposit: number;
};

const DEFAULTS: State = {
  income: 100000,
  partnerIncome: 0,
  joint: false,
  overtimeIncome: 0,
  rentalIncome: 0,
  monthlyExpenses: 3500,
  otherRepayments: 0,
  creditCardLimit: 0,
  dependants: 0,
  interestRate: 6.39,
  loanTerm: 30,
  deposit: 80000,
};

const URL_KEYS: Record<string, keyof State> = {
  income: "income",
  partner: "partnerIncome",
  overtime: "overtimeIncome",
  rental: "rentalIncome",
  expenses: "monthlyExpenses",
  repayments: "otherRepayments",
  cards: "creditCardLimit",
  dependants: "dependants",
  rate: "interestRate",
  term: "loanTerm",
  deposit: "deposit",
};

function readUrl(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  if (![...sp.keys()].length) return null;
  const out: Partial<State> = {};
  for (const [k, v] of sp.entries()) {
    const target = URL_KEYS[k];
    if (!target) continue;
    const n = parseFloat(v);
    if (Number.isFinite(n)) (out as Record<string, number>)[target as string] = n;
  }
  if (out.partnerIncome && out.partnerIncome > 0) out.joint = true;
  return out;
}

function readLocal(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { ts?: number; state?: State };
    if (!data?.ts || Date.now() - data.ts > STORAGE_TTL_MS) return null;
    return data.state ?? null;
  } catch {
    return null;
  }
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  max,
  tooltip,
  hint,
  rightLabel,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
  hint?: React.ReactNode;
  rightLabel?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
          {label}
          {tooltip && <Tooltip text={tooltip} label={`About: ${label}`} />}
        </label>
        {rightLabel}
      </div>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          aria-label={label}
          className={`field-input tnum w-full ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""}`}
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(0);
            const n = parseFloat(raw);
            onChange(Number.isFinite(n) ? n : 0);
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[12px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
  tooltip,
  hint,
  min = 0,
  max = 6,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  tooltip?: string;
  hint?: React.ReactNode;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
        {label}
        {tooltip && <Tooltip text={tooltip} label={`About: ${label}`} />}
      </label>
      <div
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            onChange(Math.min(max, value + 1));
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            onChange(Math.max(min, value - 1));
          }
        }}
        className="inline-flex items-center gap-3 rounded-xl border border-border bg-background p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <button
          type="button"
          aria-label="Decrease"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-surface disabled:opacity-40"
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="tnum w-8 text-center text-[15px] font-semibold">
          {value >= max ? `${max}+` : value}
        </span>
        <button
          type="button"
          aria-label="Increase"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-surface disabled:opacity-40"
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {hint && <p className="text-[12px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-border bg-surface p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
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
}

const BorrowingPower = () => {
  const rbaRates = useRbaRates();
  const [restored, setRestored] = useState<"url" | "local" | null>(null);
  const initial = useMemo<State>(() => {
    const u = readUrl();
    if (u) return { ...DEFAULTS, ...u };
    const l = readLocal();
    if (l) return { ...DEFAULTS, ...l };
    return DEFAULTS;
  }, []);
  useEffect(() => {
    if (readUrl()) setRestored("url");
    else if (readLocal()) setRestored("local");
  }, []);

  const [s, setS] = useState<State>(initial);
  const [bufferOpen, setBufferOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof State>(k: K, v: State[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const debounced = useDebouncedValue(s, 200);

  const result = useMemo(
    () =>
      calcBorrowingPowerV2({
        income: debounced.income,
        partnerIncome: debounced.joint ? debounced.partnerIncome : 0,
        overtimeIncome: debounced.overtimeIncome,
        rentalIncome: debounced.rentalIncome,
        monthlyExpenses: debounced.monthlyExpenses,
        otherRepayments: debounced.otherRepayments,
        creditCardLimit: debounced.creditCardLimit,
        dependants: debounced.dependants,
        interestRate: debounced.interestRate,
        loanTerm: debounced.loanTerm,
        deposit: debounced.deposit,
      }),
    [debounced],
  );

  const hemForUI = calcHem(s.joint && s.partnerIncome > 0 ? s.partnerIncome : 0, s.dependants);

  // URL + localStorage sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams();
    sp.set("income", String(Math.round(debounced.income)));
    if (debounced.joint) sp.set("partner", String(Math.round(debounced.partnerIncome)));
    if (debounced.overtimeIncome) sp.set("overtime", String(Math.round(debounced.overtimeIncome)));
    if (debounced.rentalIncome) sp.set("rental", String(Math.round(debounced.rentalIncome)));
    sp.set("expenses", String(Math.round(debounced.monthlyExpenses)));
    if (debounced.otherRepayments) sp.set("repayments", String(Math.round(debounced.otherRepayments)));
    if (debounced.creditCardLimit) sp.set("cards", String(Math.round(debounced.creditCardLimit)));
    if (debounced.dependants) sp.set("dependants", String(debounced.dependants));
    sp.set("rate", debounced.interestRate.toFixed(2));
    sp.set("term", String(debounced.loanTerm));
    sp.set("deposit", String(Math.round(debounced.deposit)));
    window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), state: debounced }),
      );
    } catch {
      /* quota or disabled */
    }
  }, [debounced]);

  useDebouncedCalculate("borrowing_power", {
    income: Math.round(debounced.income),
    partner: debounced.joint ? Math.round(debounced.partnerIncome) : 0,
    expenses: Math.round(debounced.monthlyExpenses),
    cards: Math.round(debounced.creditCardLimit),
    dependants: debounced.dependants,
    rate: debounced.interestRate,
    term: debounced.loanTerm,
  });

  const onShare = async () => {
    const url = window.location.href;
    const text = `Based on my income and expenses, I could borrow up to ${fmt0(
      result.borrowingPower,
    )} and buy a home up to ${fmt0(result.maxPurchasePrice)}. Calculated with Calcy.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My borrowing power — Calcy", text, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  usePublishMobileResult({
    label: "You can borrow",
    value: fmt0(result.borrowingPower),
    sub: `at ${debounced.interestRate}% over ${debounced.loanTerm}yr`,
    onShare,
  });

  const clearStored = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setS(DEFAULTS);
    setRestored(null);
  };

  const ccImpact = Math.round(s.creditCardLimit * 5);
  const otherImpact = Math.round(s.otherRepayments * 120);
  const overtimeAssessed = Math.round(s.overtimeIncome * 0.8);
  const rentalAssessed = Math.round(s.rentalIncome * 0.8);

  // Action items for the "How to increase" panel
  const actions: { key: string; title: string; body: React.ReactNode }[] = [];
  if (s.creditCardLimit > 0) {
    actions.push({
      key: "cards",
      title: "Close or reduce your credit cards",
      body: (
        <>
          Your <strong>{fmt0(s.creditCardLimit)}</strong> credit card limit reduces your borrowing
          power by approximately <strong>{fmt0(ccImpact)}</strong>.
          <span className="block text-accent">→ Eliminating this adds ~{fmt0(ccImpact)} to your limit</span>
        </>
      ),
    });
  }
  if (s.otherRepayments > 0) {
    actions.push({
      key: "loans",
      title: "Pay off existing loans",
      body: (
        <>
          Your <strong>{fmt0(s.otherRepayments)}/month</strong> in loan repayments reduces your
          borrowing capacity by approximately <strong>{fmt0(otherImpact)}</strong>.
          <span className="block text-accent">→ Clearing these adds ~{fmt0(otherImpact)} to your limit</span>
        </>
      ),
    });
  }
  if (!s.joint || s.partnerIncome === 0) {
    actions.push({
      key: "joint",
      title: "Apply jointly with a partner",
      body: (
        <>
          Adding a second income significantly increases borrowing power. A partner earning $70,000
          could add approximately <strong>$200,000–$300,000</strong>.
          <span className="block text-accent">→ Toggle "Applying jointly" above to model this</span>
        </>
      ),
    });
  }
  if (s.overtimeIncome === 0) {
    actions.push({
      key: "overtime",
      title: "Include regular overtime or bonuses",
      body: (
        <>
          If you earn consistent overtime, lenders will assess 80% of your 2-year average.
          $10,000/year in overtime adds approximately <strong>$45,000</strong> to your limit.
          <span className="block text-accent">→ Add your overtime income above</span>
        </>
      ),
    });
  }
  if (result.lvr > 90 && s.deposit > 0) {
    const target80 = Math.round(result.borrowingPower * 0.25);
    actions.push({
      key: "deposit",
      title: "Increase your deposit",
      body: (
        <>
          Your current deposit gives a <strong>{result.lvr.toFixed(1)}%</strong> LVR. Increasing
          your deposit to around <strong>{fmt0(target80)}</strong> reaches 80% LVR, eliminates LMI,
          and may improve lender options.
        </>
      ),
    });
  }
  // HECS prompt — always-relevant nudge to the dedicated tool
  actions.push({
    key: "hecs",
    title: "HECS/HELP debt reduces your capacity",
    body: (
      <>
        HECS repayments are deducted from income before serviceability is assessed. Paying off
        HECS before applying can increase borrowing power by <strong>$30,000–$80,000</strong>{" "}
        depending on your balance.
      </>
    ),
  });

  const reducedBufferGain = Math.max(0, result.reducedBuffer - result.borrowingPower);
  const gaugeMax = 1_500_000;
  const gaugePct = Math.min(100, (result.borrowingPower / gaugeMax) * 100);

  return (
    <div className="space-y-6">
      <RestoreBanner show={restored === "local"} onReset={clearStored} />

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <header className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-foreground">Your income</h2>
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
                RBA cash rate {rbaRates.cashRate.toFixed(2)}% · {rbaRates.lastUpdated}
              </span>
            </header>
            <NumberField
              label="Your annual income (before tax)"
              value={s.income}
              onChange={(v) => set("income", v)}
              prefix="$"
              step={1000}
              tooltip="Enter your gross annual salary. We'll estimate your net income at approximately 70% for serviceability purposes."
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-foreground">Applying jointly?</span>
                <Segmented
                  ariaLabel="Applying jointly"
                  value={s.joint ? "yes" : "no"}
                  onChange={(v) => set("joint", v === "yes")}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                />
              </div>
              {s.joint && (
                <NumberField
                  label="Partner's annual income (optional)"
                  value={s.partnerIncome}
                  onChange={(v) => set("partnerIncome", v)}
                  prefix="$"
                  step={1000}
                  tooltip="If applying jointly, add your partner's gross annual income. Both incomes are assessed together."
                />
              )}
            </div>

            <NumberField
              label="Regular overtime or bonus income (annual)"
              value={s.overtimeIncome}
              onChange={(v) => set("overtimeIncome", v)}
              prefix="$"
              step={500}
              tooltip="Lenders typically assess overtime and bonuses at 80% of the average over 2 years. Only include if it is regular and consistent."
              hint={s.overtimeIncome > 0 ? <>Assessed at 80% = <strong>{fmt0(overtimeAssessed)}</strong></> : null}
            />

            <NumberField
              label="Rental income (annual)"
              value={s.rentalIncome}
              onChange={(v) => set("rentalIncome", v)}
              prefix="$"
              step={500}
              tooltip="Rental income from investment properties is typically assessed at 80% by lenders."
              hint={s.rentalIncome > 0 ? <>Assessed at 80% = <strong>{fmt0(rentalAssessed)}</strong></> : null}
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-[15px] font-semibold text-foreground">Your commitments</h2>

            <NumberField
              label="Monthly living expenses"
              value={s.monthlyExpenses}
              onChange={(v) => set("monthlyExpenses", v)}
              prefix="$"
              step={50}
              tooltip="Include groceries, utilities, transport, subscriptions, insurance, and lifestyle costs. Lenders compare your declared expenses against the Household Expenditure Measure (HEM) benchmark and use whichever is higher."
              hint={
                <>
                  HEM benchmark for your household: approximately{" "}
                  <strong>{fmt0(hemForUI)}</strong>/month. Lenders use whichever is higher.
                </>
              }
            />

            <NumberField
              label="Other monthly loan repayments"
              value={s.otherRepayments}
              onChange={(v) => set("otherRepayments", v)}
              prefix="$"
              step={50}
              tooltip="Include car loans, personal loans, HECS/HELP debt, and any other existing loan repayments. Do NOT include your current rent — only existing loan repayments."
            />

            <NumberField
              label="Total credit card limits (not balance)"
              value={s.creditCardLimit}
              onChange={(v) => set("creditCardLimit", v)}
              prefix="$"
              step={500}
              tooltip="Enter your TOTAL credit card limit across all cards — not your current balance. Lenders assess you on your limit, not what you owe."
              hint={
                s.creditCardLimit > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    Your credit card limits reduce your borrowing power by approximately{" "}
                    <strong>{fmt0(ccImpact)}</strong>
                  </span>
                ) : null
              }
            />

            <Stepper
              label="Number of dependants"
              value={s.dependants}
              onChange={(v) => set("dependants", v)}
              tooltip="Each dependant increases your assessed living expenses. This reduces the amount available for loan repayments."
              hint={
                s.dependants > 0 ? (
                  <>
                    {s.dependants} dependant{s.dependants > 1 ? "s" : ""} adds approximately{" "}
                    <strong>${(s.dependants * 400).toLocaleString("en-AU")}/month</strong> to assessed living costs
                  </>
                ) : null
              }
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-[15px] font-semibold text-foreground">Loan details</h2>

            <NumberField
              label="Expected interest rate"
              value={s.interestRate}
              onChange={(v) => set("interestRate", v)}
              suffix="%"
              step={0.01}
              max={20}
              tooltip="Enter the interest rate you expect to be offered. This is used to calculate your repayment capacity."
              hint={
                <>
                  Lenders assess you at <strong>{result.assessmentRate.toFixed(2)}%</strong> (your rate +
                  3% APRA buffer)
                </>
              }
              rightLabel={
                <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
                  RBA: {rbaRates.cashRate.toFixed(2)}%
                </span>
              }
            />

            <div>
              <label className="mb-1 block text-[13px] font-medium text-foreground">Loan term</label>
              <Segmented
                ariaLabel="Loan term"
                value={s.loanTerm}
                onChange={(v) => set("loanTerm", Number(v))}
                options={[
                  { value: 20, label: "20 yr" },
                  { value: 25, label: "25 yr" },
                  { value: 30, label: "30 yr" },
                ]}
              />
            </div>

            <NumberField
              label="Your deposit"
              value={s.deposit}
              onChange={(v) => set("deposit", v)}
              prefix="$"
              step={5000}
              tooltip="Your available deposit, excluding upfront costs like stamp duty. Used to calculate your maximum purchase price."
            />
          </section>
        </div>

        {/* Results panel */}
        <div className="order-first md:order-none md:sticky md:top-6 md:self-start">
          <div
            ref={resultsRef}
            className="result-panel-navy space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-7"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Borrowing power
              </p>
              <p className="tnum text-[34px] font-bold leading-tight text-foreground">
                {fmt0(result.borrowingPower)}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${gaugePct}%` }}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Conservative estimate ({result.conservativeRate.toFixed(2)}% buffer):{" "}
                <strong className="text-foreground tnum">{fmt0(result.conservative)}</strong>
              </p>
            </div>

            <div className="rounded-xl border border-success/30 bg-success/5 p-3">
              <p className="text-[11px] uppercase tracking-wide text-success">Maximum purchase price</p>
              <p className="tnum text-[22px] font-bold leading-tight text-success">
                {fmt0(result.maxPurchasePrice)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Borrowing power + {fmt0(s.deposit)} deposit
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Repayment at actual rate</p>
                <p className="tnum text-[18px] font-semibold text-foreground">
                  {fmt0(result.monthlyRepaymentActual)}<span className="text-[12px] font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="text-[11px] text-muted-foreground">at {s.interestRate.toFixed(2)}%</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Repayment at assessed rate</p>
                <p className="tnum text-[18px] font-semibold text-foreground">
                  {fmt0(result.monthlyRepaymentAssessed)}<span className="text-[12px] font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="text-[11px] text-muted-foreground">at {result.assessmentRate.toFixed(2)}%</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Loan-to-value ratio</p>
                <p className="tnum text-[18px] font-semibold text-foreground">{result.lvr.toFixed(1)}%</p>
                <p className="text-[11px] text-muted-foreground">loan ÷ purchase price</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Assessment rate</p>
                <p className="tnum text-[18px] font-semibold text-foreground">{result.assessmentRate.toFixed(2)}%</p>
                <p className="text-[11px] text-muted-foreground">your rate + 3%</p>
              </div>
            </div>

            <div className="hidden md:flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onShare}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-foreground hover:border-accent/40 hover:text-accent"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4" />}
                {copied ? "Copied!" : "Share this calculation"}
              </button>
            </div>

            <ResultActions calculator="borrowing_power" />
          </div>
        </div>
      </div>

      {/* APRA buffer panel */}
      <details
        open={bufferOpen}
        onToggle={(e) => setBufferOpen((e.target as HTMLDetailsElement).open)}
        className="rounded-2xl border border-border bg-surface p-5"
      >
        <summary className="flex cursor-pointer items-center justify-between gap-3 text-[15px] font-semibold text-foreground">
          <span>Why is my limit lower than expected?</span>
          <ChevronDown className="h-4 w-4 transition-transform [details[open]_&]:rotate-180" />
        </summary>
        <div className="mt-3 space-y-2 text-[14px] leading-relaxed text-muted-foreground">
          <p>
            Lenders don't assess you at today's rate ({s.interestRate.toFixed(2)}%). APRA requires
            them to test whether you could afford repayments at{" "}
            <strong className="text-foreground">{result.assessmentRate.toFixed(2)}%</strong> (your rate + 3% buffer).
          </p>
          <p>
            At a {result.assessmentRate.toFixed(2)}% assessment rate, your maximum repayment capacity
            supports a <strong className="text-foreground">{fmt0(result.borrowingPower)}</strong> loan.
          </p>
          <p>
            If the buffer were reduced to 2.5%, you could borrow up to{" "}
            <strong className="text-foreground">{fmt0(result.reducedBuffer)}</strong>{" "}
            ({reducedBufferGain > 0 ? "+" : ""}
            {fmt0(reducedBufferGain)}).
          </p>
        </div>
      </details>

      {/* How to increase */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <header className="mb-3">
          <h2 className="text-[18px] font-semibold text-foreground">↑ How to increase your borrowing power</h2>
          <p className="text-[13px] text-muted-foreground">
            Based on your inputs, here are your biggest opportunities:
          </p>
        </header>
        <ul className="space-y-3">
          {actions.map((a) => (
            <li
              key={a.key}
              className="rounded-xl border border-border bg-background p-4 text-[14px] leading-relaxed text-muted-foreground"
            >
              <p className="mb-1 text-[14px] font-semibold text-foreground">✦ {a.title}</p>
              <div>{a.body}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Lender variability */}
      <aside className="rounded-2xl border border-border bg-surface p-5 text-[14px] leading-relaxed text-muted-foreground">
        <p className="mb-2 font-semibold text-foreground">ⓘ Borrowing power varies between lenders</p>
        <p>
          The same financial profile can result in different borrowing limits depending on the lender.
          Some lenders treat overtime, rental income, and living expenses more generously than others.
          The difference between lenders can be <strong>$50,000–$150,000</strong> on the same income
          and expense profile. A mortgage broker can compare your profile across multiple lenders at
          no cost to you.
        </p>
      </aside>
    </div>
  );
};

export default BorrowingPower;
