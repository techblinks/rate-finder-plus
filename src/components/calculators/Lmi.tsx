import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Share2, Check, ExternalLink } from "lucide-react";
import { calcLmi, lmiCapitalisedCost, payNowVsWait, type BuyerType } from "@/lib/calc/lmi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import { rbaRates } from "@/data/rbaRates";
import Tooltip from "@/components/Tooltip";
import ResultActions from "@/components/ResultActions";

const AUD0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const fmt0 = (n: number) => AUD0.format(Math.max(0, Math.round(n)));

const STORAGE_KEY = "calcy_lmi_last";
const SHARED_KEY = "calcy_shared_state";
const TTL = 90 * 24 * 60 * 60 * 1000;

type State = {
  propertyValue: number;
  deposit: number;
  loanTerm: number;
  interestRate: number;
  buyer: BuyerType;
  fhb: boolean;
  growthPct: number;
  monthsToSave: number;
};

const DEFAULTS: State = {
  propertyValue: 700000,
  deposit: 70000,
  loanTerm: 30,
  interestRate: 6.14,
  buyer: "owner",
  fhb: false,
  growthPct: 5,
  monthsToSave: 18,
};

const PROPERTY_PILLS = [400000, 500000, 600000, 700000, 800000, 1000000];

function readUrl(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  if (![...sp.keys()].length) return null;
  const num = (k: string) => {
    const v = parseFloat(sp.get(k) || "");
    return Number.isFinite(v) ? v : undefined;
  };
  const out: Partial<State> = {};
  const v = num("value"); if (v !== undefined) out.propertyValue = v;
  const d = num("deposit"); if (d !== undefined) out.deposit = d;
  const t = num("term"); if (t !== undefined) out.loanTerm = t;
  const r = num("rate"); if (r !== undefined) out.interestRate = r;
  const g = num("growth"); if (g !== undefined) out.growthPct = g;
  const w = num("wait"); if (w !== undefined) out.monthsToSave = w;
  const tp = sp.get("type"); if (tp === "owner" || tp === "investor") out.buyer = tp;
  const f = sp.get("fhb"); if (f === "yes" || f === "no") out.fhb = f === "yes";
  return Object.keys(out).length ? out : null;
}

function readLocal(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { ts?: number; state?: State };
    if (!data?.ts || Date.now() - data.ts > TTL) return null;
    return data.state ?? null;
  } catch {
    return null;
  }
}

function readShared(): { propertyValue?: number; deposit?: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SHARED_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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
}

const Lmi = () => {
  const [restored, setRestored] = useState<"url" | "local" | null>(null);
  const initial = useMemo<State>(() => {
    const u = readUrl();
    if (u) return { ...DEFAULTS, ...u };
    const l = readLocal();
    if (l) return { ...DEFAULTS, ...l };
    const shared = readShared();
    if (shared?.propertyValue) {
      return {
        ...DEFAULTS,
        propertyValue: shared.propertyValue,
        deposit: shared.deposit ?? DEFAULTS.deposit,
      };
    }
    return DEFAULTS;
  }, []);

  useEffect(() => {
    if (readUrl()) setRestored("url");
    else if (readLocal()) setRestored("local");
  }, []);

  const [s, setS] = useState<State>(initial);
  const set = <K extends keyof State>(k: K, v: State[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const [extraSavings, setExtraSavings] = useState(1000);
  const [monthlyRent, setMonthlyRent] = useState<number>(() =>
    Math.round((initial.propertyValue * 0.004) / 50) * 50,
  );
  const dRent = useDebouncedValue(monthlyRent, 150);
  const [copied, setCopied] = useState(false);
  const prevLmi = useRef(0);

  const dState = useDebouncedValue(s, 150);
  const dExtra = useDebouncedValue(extraSavings, 150);

  // Clamp deposit to property value
  const propertyValue = Math.max(0, dState.propertyValue);
  const deposit = Math.min(Math.max(0, dState.deposit), propertyValue);

  const result = useMemo(
    () => calcLmi(propertyValue, deposit, dState.loanTerm, dState.interestRate, dState.buyer),
    [propertyValue, deposit, dState.loanTerm, dState.interestRate, dState.buyer],
  );

  const lvr = result.lvr;
  const lmi = result.lmiCost;
  const loanAmount = result.loanAmount;
  const depositFor20 = result.depositFor20;
  const extraDepositNeeded = Math.max(0, depositFor20 - deposit);

  const capitalised = useMemo(
    () => lmiCapitalisedCost(lmi, dState.interestRate, dState.loanTerm),
    [lmi, dState.interestRate, dState.loanTerm],
  );

  const compare = useMemo(
    () =>
      payNowVsWait({
        propertyValue,
        deposit,
        lmiAmount: lmi,
        interestRate: dState.interestRate,
        loanTerm: dState.loanTerm,
        annualGrowthRate: dState.growthPct,
        monthsToSave: dState.monthsToSave,
        monthlyRent: dRent,
      }),
    [propertyValue, deposit, lmi, dState.interestRate, dState.loanTerm, dState.growthPct, dState.monthsToSave, dRent],
  );

  // Vibration when LMI drops to zero
  useEffect(() => {
    if (prevLmi.current > 0 && lmi === 0 && typeof navigator !== "undefined") {
      try {
        navigator.vibrate?.(30);
      } catch {
        /* ignore */
      }
    }
    prevLmi.current = lmi;
  }, [lmi]);

  // URL + storage sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams();
    sp.set("value", String(Math.round(propertyValue)));
    sp.set("deposit", String(Math.round(deposit)));
    sp.set("term", String(dState.loanTerm));
    sp.set("rate", dState.interestRate.toFixed(2));
    sp.set("type", dState.buyer);
    sp.set("fhb", dState.fhb ? "yes" : "no");
    sp.set("growth", String(dState.growthPct));
    sp.set("wait", String(dState.monthsToSave));
    window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), state: dState }),
      );
      window.sessionStorage.setItem(
        SHARED_KEY,
        JSON.stringify({
          propertyValue,
          deposit,
          depositPercent: propertyValue > 0 ? (deposit / propertyValue) * 100 : 0,
          lvr,
          lmiAmount: lmi,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [propertyValue, deposit, dState, lvr, lmi]);

  useDebouncedCalculate("lmi", {
    property_value: propertyValue,
    deposit,
    term: dState.loanTerm,
    rate: dState.interestRate,
    buyer: dState.buyer,
    lvr: Math.round(lvr * 10) / 10,
    premium: lmi,
  });

  const onShare = async () => {
    const url = window.location.href;
    const text = `On a ${fmt0(propertyValue)} property with a ${fmt0(deposit)} deposit (${lvr.toFixed(1)}% LVR), my estimated LMI is ${fmt0(lmi)}. Calculated with Calcy.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My LMI calculation — Calcy", text, url });
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

  const clearStored = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setS(DEFAULTS);
    setRestored(null);
  };

  // LVR gauge fill widths
  const lvrPct = Math.min(100, Math.max(0, lvr));
  const fill80 = Math.min(80, lvrPct);
  const fillOver = Math.max(0, lvrPct - 80);

  const lvrColor =
    lmi === 0 ? "text-success" : lvr > 90 ? "text-destructive" : "text-amber-600 dark:text-amber-400";

  // Months to 20% deposit at current saving rate
  const monthsTo20 =
    extraSavings > 0 && extraDepositNeeded > 0 ? Math.ceil(extraDepositNeeded / extraSavings) : 0;

  // Sensitivity: re-run with growth - 2
  const sensitivity = useMemo(() => {
    const lower = payNowVsWait({
      propertyValue,
      deposit,
      lmiAmount: lmi,
      interestRate: dState.interestRate,
      loanTerm: dState.loanTerm,
      annualGrowthRate: Math.max(0, dState.growthPct - 2),
      monthsToSave: dState.monthsToSave,
      monthlyRent: dRent,
    });
    return lower.recommendation;
  }, [propertyValue, deposit, lmi, dState, dRent]);

  const buyNowQs = `?value=${Math.round(propertyValue)}&deposit=${Math.round(deposit)}`;

  return (
    <div className="space-y-6">
      {restored === "local" && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent-mid bg-accent-light px-4 py-3 text-[13px] text-foreground">
          <span>Welcome back — we've restored your last calculation.</span>
          <button
            type="button"
            onClick={clearStored}
            className="font-semibold text-accent hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-foreground">Your details</h2>
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
                Based on current rates · Updated {rbaRates.lastUpdated}
              </span>
            </header>

            <div className="space-y-1">
              <label className="text-[13px] font-medium text-foreground">Are you a first home buyer?</label>
              <Segmented
                ariaLabel="First home buyer"
                value={s.fhb ? "yes" : "no"}
                onChange={(v) => set("fhb", v === "yes")}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
              {s.fhb && (
                <p className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-[13px] text-foreground">
                  ✓ You may be eligible for the <strong>First Home Guarantee</strong> — purchase
                  with as little as 5% deposit and no LMI. See eligibility below.
                </p>
              )}
            </div>

            <NumberField
              label="Property value"
              value={s.propertyValue}
              onChange={(v) => set("propertyValue", v)}
              prefix="$"
              step={5000}
              tooltip="The purchase price of the property."
            />
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_PILLS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("propertyValue", v)}
                  className={`rounded-full border px-3 py-1 text-[12px] font-medium ${
                    s.propertyValue === v
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-background text-foreground hover:border-accent"
                  }`}
                >
                  {v >= 1_000_000 ? `$${v / 1_000_000}M` : `$${v / 1000}k`}
                </button>
              ))}
            </div>

            <NumberField
              label="Your deposit"
              value={s.deposit}
              onChange={(v) => set("deposit", v)}
              prefix="$"
              step={1000}
              max={s.propertyValue}
              hint={
                s.propertyValue > 0 ? (
                  <>
                    This is{" "}
                    <strong>
                      {((Math.min(s.deposit, s.propertyValue) / s.propertyValue) * 100).toFixed(1)}%
                    </strong>{" "}
                    of the property value
                  </>
                ) : null
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
              label="Interest rate"
              value={s.interestRate}
              onChange={(v) => set("interestRate", v)}
              suffix="%"
              step={0.01}
              max={20}
              rightLabel={
                <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
                  RBA: {rbaRates.cashRate.toFixed(2)}%
                </span>
              }
            />

            <div>
              <label className="mb-1 block text-[13px] font-medium text-foreground">Buyer type</label>
              <Segmented
                ariaLabel="Buyer type"
                value={s.buyer}
                onChange={(v) => set("buyer", v)}
                options={[
                  { value: "owner", label: "Owner-occupier" },
                  { value: "investor", label: "Investor" },
                ]}
              />
              <p className="mt-1 text-[12px] text-muted-foreground">
                LMI rates may differ slightly between owner-occupiers and investors.
              </p>
            </div>
          </section>
        </div>

        {/* Results */}
        <div className="md:sticky md:top-6 md:self-start">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            {/* LVR gauge */}
            <div>
              <div className="mb-1 flex items-baseline justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Your LVR
                </p>
                <p className={`tnum text-[18px] font-bold ${lvrColor}`}>{lvr.toFixed(1)}%</p>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface">
                {lmi === 0 ? (
                  <div
                    className="h-full rounded-full bg-success transition-all duration-300 ease-out"
                    style={{ width: `${lvrPct}%` }}
                  />
                ) : (
                  <>
                    <div
                      className="h-full bg-amber-500 transition-all duration-300 ease-out"
                      style={{ width: `${fill80}%` }}
                    />
                    <div
                      className="absolute top-0 h-full bg-destructive transition-all duration-300 ease-out"
                      style={{ left: `${fill80}%`, width: `${fillOver}%` }}
                    />
                  </>
                )}
                {lmi > 0 && (
                  <div
                    aria-hidden="true"
                    className="absolute top-0 h-full w-px bg-foreground/60"
                    style={{ left: "80%" }}
                  />
                )}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span className="ml-auto pr-[20%]">80% LMI threshold</span>
                <span>100%</span>
              </div>
              {lmi > 0 ? (
                <p className="mt-2 text-[12px] text-muted-foreground">
                  You need <strong className="text-foreground tnum">{fmt0(extraDepositNeeded)}</strong>{" "}
                  more deposit to reach 80% LVR
                </p>
              ) : (
                <p className="mt-2 rounded-lg bg-success/10 px-3 py-2 text-[13px] font-semibold text-success">
                  ✓ LMI not required — your LVR is 80% or below
                </p>
              )}
            </div>

            {/* Headline */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                LMI estimate
              </p>
              <p
                className={`tnum text-[34px] font-bold leading-tight ${
                  lmi === 0 ? "text-success" : "text-foreground"
                }`}
              >
                {lmi === 0 ? "Not required" : fmt0(lmi)}
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`rounded-xl border p-3 ${
                  lmi === 0
                    ? "border-success/30 bg-success/5"
                    : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">LMI premium</p>
                <p className="tnum text-[18px] font-semibold text-foreground">{fmt0(lmi)}</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Loan amount</p>
                <p className="tnum text-[18px] font-semibold text-foreground">{fmt0(loanAmount)}</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">LVR</p>
                <p className={`tnum text-[18px] font-semibold ${lvrColor}`}>{lvr.toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">To 80% LVR</p>
                <p className="tnum text-[18px] font-semibold text-foreground">
                  {extraDepositNeeded > 0 ? `${fmt0(extraDepositNeeded)} more` : "Achieved ✓"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onShare}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-foreground hover:border-accent/40 hover:text-accent"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Copied!" : "Share this calculation"}
            </button>

            <ResultActions calculator="lmi" />
          </div>
        </div>
      </div>

      {/* Upfront vs capitalised */}
      {lmi > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-[18px] font-semibold text-foreground">
            Pay LMI upfront vs add to your loan
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[12px] uppercase tracking-wide text-muted-foreground">Pay upfront</p>
              <p className="tnum text-[22px] font-bold text-foreground">{fmt0(lmi)}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">No impact on loan balance.</p>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Total LMI cost: <strong className="text-foreground tnum">{fmt0(lmi)}</strong>
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-[12px] uppercase tracking-wide text-muted-foreground">Add to loan</p>
              <p className="tnum text-[22px] font-bold text-foreground">{fmt0(loanAmount + lmi)}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">New loan balance.</p>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Total LMI cost over {dState.loanTerm} years:{" "}
                <strong className="text-foreground tnum">{fmt0(capitalised)}</strong>
              </p>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Adding LMI to your loan costs{" "}
            <strong className="text-foreground tnum">{fmt0(Math.max(0, capitalised - lmi))}</strong>{" "}
            more than paying upfront.
          </p>
        </section>
      )}

      {/* Pay now vs wait */}
      {lmi > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <header className="mb-4">
            <h2 className="text-[18px] font-semibold text-foreground">
              Should you pay LMI now or wait to save a 20% deposit?
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Compare buying now (with LMI) vs waiting and saving more.
            </p>
          </header>

          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground">
                Assumed annual property price growth
              </label>
              <Segmented
                ariaLabel="Annual growth"
                value={s.growthPct}
                onChange={(v) => set("growthPct", Number(v))}
                options={[
                  { value: 3, label: "3%" },
                  { value: 5, label: "5%" },
                  { value: 7, label: "7%" },
                  { value: 10, label: "10%" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground">
                Time to save extra deposit
              </label>
              <Segmented
                ariaLabel="Months to save"
                value={s.monthsToSave}
                onChange={(v) => set("monthsToSave", Number(v))}
                options={[
                  { value: 6, label: "6 mo" },
                  { value: 12, label: "12 mo" },
                  { value: 18, label: "18 mo" },
                  { value: 24, label: "24 mo" },
                  { value: 36, label: "36 mo" },
                ]}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[14px] font-semibold text-foreground">🏠 Buy now</p>
              <dl className="mt-2 space-y-1 text-[13px] text-muted-foreground">
                <div className="flex justify-between"><dt>Property</dt><dd className="tnum text-foreground">{fmt0(compare.scenarioA.propertyPrice)}</dd></div>
                <div className="flex justify-between"><dt>LMI cost</dt><dd className="tnum text-foreground">{fmt0(compare.scenarioA.lmiCost)}</dd></div>
                <div className="flex justify-between"><dt>Loan</dt><dd className="tnum text-foreground">{fmt0(compare.scenarioA.loanAmount)}</dd></div>
                <div className="flex justify-between border-t border-border pt-1 font-medium"><dt>Total repayments</dt><dd className="tnum text-foreground">{fmt0(compare.scenarioA.totalRepayments)}</dd></div>
              </dl>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[14px] font-semibold text-foreground">⏳ Wait {dState.monthsToSave} months</p>
              <dl className="mt-2 space-y-1 text-[13px] text-muted-foreground">
                <div className="flex justify-between"><dt>Property ({dState.growthPct}% growth)</dt><dd className="tnum text-foreground">{fmt0(compare.scenarioB.propertyPrice)}</dd></div>
                <div className="flex justify-between"><dt>LMI cost</dt><dd className="tnum text-success">$0</dd></div>
                <div className="flex justify-between"><dt>Loan</dt><dd className="tnum text-foreground">{fmt0(compare.scenarioB.loanAmount)}</dd></div>
                <div className="flex justify-between"><dt>Extra savings needed</dt><dd className="tnum text-foreground">{fmt0(compare.scenarioB.additionalSavingsNeeded)}</dd></div>
                <div className="flex justify-between"><dt>Rent while waiting</dt><dd className="tnum text-foreground">{fmt0(compare.scenarioB.rentWhileWaiting)}</dd></div>
                <div className="flex justify-between border-t border-border pt-1 font-medium"><dt>True total cost</dt><dd className="tnum text-foreground">{fmt0(compare.scenarioB.trueCost)}</dd></div>
              </dl>
            </div>
          </div>

          <div
            className={`mt-4 rounded-xl border p-4 text-[14px] ${
              compare.recommendation === "buy_now"
                ? "border-success/30 bg-success/5 text-success"
                : "border-accent/30 bg-accent-light text-foreground"
            }`}
          >
            {compare.recommendation === "buy_now" ? (
              <>
                ✓ <strong>Buying now is cheaper by {fmt0(compare.difference)}</strong> (at{" "}
                {dState.growthPct}% annual price growth)
              </>
            ) : (
              <>
                ℹ <strong>
                  Waiting {dState.monthsToSave} months saves {fmt0(compare.difference)}
                </strong>{" "}
                in total (at {dState.growthPct}% annual price growth)
              </>
            )}
            <p className="mt-1 text-[12px] text-muted-foreground">
              At {Math.max(0, dState.growthPct - 2)}% growth, the better choice{" "}
              {sensitivity === compare.recommendation ? "stays the same" : "changes"}.
            </p>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            This comparison is illustrative only and does not account for individual tax positions,
            investment returns on savings, or lender-specific LMI rates.
          </p>
        </section>
      )}

      {/* Government schemes */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <header className="mb-4">
          <h2 className="text-[18px] font-semibold text-foreground">Could you avoid LMI entirely?</h2>
          <p className="text-[13px] text-muted-foreground">
            Government schemes and lender waivers that eliminate LMI.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
          <div
            className={`rounded-xl border p-4 ${
              s.fhb ? "border-success/30 bg-success/5" : "border-border bg-background opacity-90"
            }`}
          >
            <p className="text-[14px] font-semibold text-foreground">🏛 First Home Guarantee</p>
            <p className="text-[12px] text-muted-foreground">Administered by Housing Australia</p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Eligible first home buyers can purchase with as little as 5% deposit — with{" "}
              <strong className="text-foreground">no LMI</strong>. The government guarantees up to
              15% of the property value.
            </p>
            <ul className="mt-2 space-y-0.5 text-[12px] text-muted-foreground">
              <li>• First home buyer {s.fhb ? "✓" : "✗"}</li>
              <li>• Individual income ≤ $125,000 / couple ≤ $200,000</li>
              <li>• Property within state price caps</li>
              <li>• 35,000 places per financial year</li>
            </ul>
            <p className="mt-3 text-[13px] font-semibold">
              {s.fhb ? (
                <span className="text-success">You may be eligible</span>
              ) : (
                <span className="text-muted-foreground">Not available to previous property owners</span>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-[14px] font-semibold text-foreground">👨‍👧 Family Home Guarantee</p>
            <p className="text-[12px] text-muted-foreground">For eligible single parents</p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Single parents and legal guardians with at least one dependent child can purchase
              with as little as <strong className="text-foreground">2% deposit</strong> — with no LMI.
            </p>
            <ul className="mt-2 space-y-0.5 text-[12px] text-muted-foreground">
              <li>• Single parent or legal guardian</li>
              <li>• At least one dependent child</li>
              <li>• Income ≤ $125,000</li>
              <li>• 5,000 places per financial year</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-[14px] font-semibold text-foreground">💼 Profession waiver</p>
            <p className="text-[12px] text-muted-foreground">
              Some lenders waive LMI for certain professions
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Many lenders offer LMI waivers for high-income professionals, even above 80% LVR:
            </p>
            <ul className="mt-2 space-y-0.5 text-[12px] text-muted-foreground">
              <li>• Medical doctors and specialists</li>
              <li>• Dentists and oral health professionals</li>
              <li>• Lawyers and barristers</li>
              <li>• CPA / CA accountants</li>
              <li>• Some engineers and architects</li>
            </ul>
          </div>

          {lmi > 0 && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[14px] font-semibold text-foreground">💰 Save to a 20% deposit</p>
              <p className="text-[12px] text-muted-foreground">
                The simplest way to avoid LMI entirely
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                You currently have <strong className="text-foreground tnum">{fmt0(deposit)}</strong>{" "}
                ({propertyValue > 0 ? ((deposit / propertyValue) * 100).toFixed(1) : "0"}% deposit).
                You need <strong className="text-foreground tnum">{fmt0(extraDepositNeeded)}</strong>{" "}
                more to reach 20%.
              </p>
              <div className="mt-3 space-y-1">
                <NumberField
                  label="How much can you save per month?"
                  value={extraSavings}
                  onChange={setExtraSavings}
                  prefix="$"
                  step={100}
                />
              </div>
              {monthsTo20 > 0 && (
                <p className="mt-2 text-[13px] text-foreground">
                  → Time to 20% deposit: <strong>{monthsTo20} months</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* What's next */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-[18px] font-semibold text-foreground">What's next?</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {lmi > 0 ? (
            <>
              <li>
                <Link
                  to={`/borrowing-power-calculator${buyNowQs}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[14px] font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  See how much you can borrow
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link
                  to={`/mortgage-calculator?loan=${Math.round(loanAmount + lmi)}&rate=${dState.interestRate.toFixed(2)}&term=${dState.loanTerm}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[14px] font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  Calculate repayments including LMI
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link
                  to={`/stamp-duty-calculator${buyNowQs}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[14px] font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  See your stamp duty cost
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to={`/mortgage-calculator?loan=${Math.round(loanAmount)}&rate=${dState.interestRate.toFixed(2)}&term=${dState.loanTerm}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[14px] font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  Calculate your mortgage repayments
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link
                  to={`/stamp-duty-calculator${buyNowQs}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[14px] font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  Calculate stamp duty
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link
                  to="/extra-repayments-calculator"
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[14px] font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  See how extra repayments cut years off your loan
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
            </>
          )}
        </ul>
      </section>

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        LMI estimates are indicative. Actual premiums depend on your lender's insurer (Helia or
        QBE), state of purchase, and loan structure. Contact your lender for an exact quote.
      </p>
    </div>
  );
};

export default Lmi;
