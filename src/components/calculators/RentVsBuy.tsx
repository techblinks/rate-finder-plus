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
  calculateRentVsBuy,
  sensitivityGrid,
  type RentVsBuyInputs,
} from "@/lib/calc/rentVsBuy";
import { STATES, type StateCode } from "@/lib/calc/stampDuty";
import { rbaRates } from "@/data/rbaRates";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const AUD0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const fmt0 = (n: number) => AUD0.format(Math.round(n));
const fmtAbs0 = (n: number) => AUD0.format(Math.abs(Math.round(n)));

const STORAGE_KEY = "calcy_rentvsbuy_last";
const SHARED_KEY = "calcy_shared_state";
const TTL = 90 * 24 * 60 * 60 * 1000;

interface State {
  propertyValue: number;
  deposit: number;
  interestRate: number;
  loanTermYears: number;
  annualPropertyGrowth: number;
  councilRates: number;
  insurance: number;
  strata: number;
  maintenancePct: number;
  state: StateCode;
  isFirstHomeBuyer: boolean;
  weeklyRent: number;
  annualRentIncrease: number;
  investmentReturn: number;
  analysisYears: number;
}

const DEFAULTS: State = {
  propertyValue: 700_000,
  deposit: 140_000,
  interestRate: 6.14,
  loanTermYears: 30,
  annualPropertyGrowth: 5,
  councilRates: 1500,
  insurance: 2000,
  strata: 0,
  maintenancePct: 1,
  state: "NSW",
  isFirstHomeBuyer: false,
  weeklyRent: 600,
  annualRentIncrease: 5,
  investmentReturn: 7,
  analysisYears: 10,
};

const PRICE_PILLS = [500_000, 600_000, 700_000, 800_000, 1_000_000, 1_500_000];
const GROWTH_PILLS = [3, 5, 7, 10];
const RENT_INCREASE_PILLS = [3, 5, 7];
const RETURN_PILLS = [
  { value: 4, label: "4% (conservative)" },
  { value: 7, label: "7% (moderate)" },
  { value: 10, label: "10% (growth)" },
];
const ANALYSIS_YEARS = [5, 10, 15, 20, 30];
const TERM_OPTIONS = [20, 25, 30];

function readUrl(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  if (![...sp.keys()].length) return null;
  const out: Partial<State> = {};
  const n = (k: string) => {
    const v = sp.get(k);
    return v != null && !Number.isNaN(parseFloat(v)) ? parseFloat(v) : undefined;
  };
  if (n("price") != null) out.propertyValue = n("price")!;
  if (n("deposit") != null) out.deposit = n("deposit")!;
  if (n("rate") != null) out.interestRate = n("rate")!;
  if (n("term") != null) out.loanTermYears = n("term")!;
  if (n("growth") != null) out.annualPropertyGrowth = n("growth")!;
  if (n("rent") != null) out.weeklyRent = n("rent")!;
  if (n("rentincrease") != null) out.annualRentIncrease = n("rentincrease")!;
  if (n("return") != null) out.investmentReturn = n("return")!;
  if (n("years") != null) out.analysisYears = n("years")!;
  const st = sp.get("state");
  if (st && STATES.some((s) => s.code === st)) out.state = st as StateCode;
  const fhb = sp.get("fhb");
  if (fhb != null) out.isFirstHomeBuyer = fhb === "yes" || fhb === "true";
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
      propertyValue?: number;
      deposit?: number;
      interestRate?: number;
      loanTermYears?: number;
      state?: string;
      isFirstHomeBuyer?: boolean;
    };
    const out: Partial<State> = {};
    if (typeof s.propertyValue === "number") out.propertyValue = s.propertyValue;
    if (typeof s.deposit === "number") out.deposit = s.deposit;
    if (typeof s.interestRate === "number") out.interestRate = s.interestRate;
    if (typeof s.loanTermYears === "number") out.loanTermYears = s.loanTermYears;
    if (s.state && STATES.some((x) => x.code === s.state))
      out.state = s.state as StateCode;
    if (typeof s.isFirstHomeBuyer === "boolean")
      out.isFirstHomeBuyer = s.isFirstHomeBuyer;
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
  min = 0,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
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
        min={min}
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

const RentVsBuy = () => {
  const [s, setS] = useState<State>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    const fromUrl = readUrl();
    const fromLocal = !fromUrl ? readLocal() : null;
    const fromShared = !fromUrl && !fromLocal ? readShared() : null;
    return { ...DEFAULTS, ...(fromShared || {}), ...(fromLocal || {}), ...(fromUrl || {}) };
  });
  const [restored, setRestored] = useState<"local" | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [mobileTab, setMobileTab] = useState<"buy" | "rent">("buy");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!readUrl() && readLocal()) setRestored("local");
  }, []);

  const set = <K extends keyof State>(k: K, v: State[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  // Persist + URL sync (debounced)
  const debounced = useDebouncedValue(s, 250);
  const isStale = debounced !== s;
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
          propertyValue: debounced.propertyValue,
          deposit: debounced.deposit,
          interestRate: debounced.interestRate,
          loanTermYears: debounced.loanTermYears,
          state: debounced.state,
          isFirstHomeBuyer: debounced.isFirstHomeBuyer,
        }),
      );
      const sp = new URLSearchParams();
      sp.set("price", String(debounced.propertyValue));
      sp.set("deposit", String(debounced.deposit));
      sp.set("rate", String(debounced.interestRate));
      sp.set("term", String(debounced.loanTermYears));
      sp.set("growth", String(debounced.annualPropertyGrowth));
      sp.set("rent", String(debounced.weeklyRent));
      sp.set("rentincrease", String(debounced.annualRentIncrease));
      sp.set("return", String(debounced.investmentReturn));
      sp.set("years", String(debounced.analysisYears));
      sp.set("state", debounced.state);
      sp.set("fhb", debounced.isFirstHomeBuyer ? "yes" : "no");
      const url = `${window.location.pathname}?${sp.toString()}`;
      window.history.replaceState(null, "", url);
    } catch {
      // ignore
    }
  }, [debounced]);

  const inputs: RentVsBuyInputs = useMemo(
    () => ({
      propertyValue: Math.max(50_000, debounced.propertyValue),
      deposit: Math.max(0, debounced.deposit),
      interestRate: Math.max(0.1, debounced.interestRate),
      loanTermYears: Math.max(5, debounced.loanTermYears),
      annualPropertyGrowth: Math.max(0, debounced.annualPropertyGrowth),
      councilRates: Math.max(0, debounced.councilRates),
      insurance: Math.max(0, debounced.insurance),
      strata: Math.max(0, debounced.strata),
      maintenancePct: Math.max(0, debounced.maintenancePct),
      state: debounced.state,
      isFirstHomeBuyer: debounced.isFirstHomeBuyer,
      weeklyRent: Math.max(0, debounced.weeklyRent),
      annualRentIncrease: Math.max(0, debounced.annualRentIncrease),
      investmentReturn: Math.max(0, debounced.investmentReturn),
      analysisYears: Math.max(1, debounced.analysisYears),
    }),
    [debounced],
  );

  const result = useMemo(() => calculateRentVsBuy(inputs), [inputs]);

  // Sensitivity grid
  const grid = useMemo(() => sensitivityGrid(inputs), [inputs]);
  const growthCols = [3, 5, 7, 9, 11];
  const returnRows = [4, 7, 10, 13];

  // Result-shift comparisons (for assumption callout)
  const baseBE = result.breakEvenYear;
  const altGrowthBE = useMemo(
    () =>
      calculateRentVsBuy({ ...inputs, annualPropertyGrowth: 3 })
        .breakEvenYear,
    [inputs],
  );
  const altReturnBE = useMemo(
    () =>
      calculateRentVsBuy({ ...inputs, investmentReturn: 10 }).breakEvenYear,
    [inputs],
  );
  const shiftYears = (alt: number | null) => {
    if (alt == null && baseBE == null) return "no shift";
    if (alt == null) return `renting wins throughout`;
    if (baseBE == null) return `buying wins from year ${alt}`;
    const diff = alt - baseBE;
    return `${diff > 0 ? "+" : ""}${diff} year${Math.abs(diff) === 1 ? "" : "s"}`;
  };

  // Live derived values
  const depositPct = (inputs.deposit / inputs.propertyValue) * 100;
  const lvr = ((inputs.propertyValue - inputs.deposit) / inputs.propertyValue) * 100;
  const projectedValue10 =
    inputs.propertyValue * Math.pow(1 + inputs.annualPropertyGrowth / 100, 10);

  // Chart data
  const chartData = result.buyData.map((b, i) => ({
    year: b.year,
    Buying: b.netWorth,
    Renting: result.rentData[i].netWorth,
  }));

  // Year-by-year table rows
  const yearRows = useMemo(() => {
    if (showAllYears) return result.buyData.map((_, i) => i);
    const picks = [1, 2, 3, 5, 7, 10, 15, 20, 30, inputs.analysisYears];
    const idxs = Array.from(
      new Set(picks.filter((y) => y <= inputs.analysisYears).map((y) => y - 1)),
    ).sort((a, b) => a - b);
    return idxs;
  }, [result.buyData, inputs.analysisYears, showAllYears]);

  const reset = () => {
    setS(DEFAULTS);
    setRestored(null);
  };

  const onShare = async () => {
    const url = window.location.href;
    const text =
      result.verdict === "buy"
        ? `Buying wins by ${fmtAbs0(result.difference)} over ${inputs.analysisYears} years`
        : result.verdict === "rent"
          ? `Renting + investing wins by ${fmtAbs0(result.difference)} over ${inputs.analysisYears} years`
          : `Buying and renting are very close over ${inputs.analysisYears} years`;
    const data = {
      title: "Rent vs buy comparison — Calcy",
      text: `Comparing a ${fmt0(inputs.propertyValue)} property vs ${fmt0(inputs.weeklyRent)}/week rent. ${text}.`,
      url,
    };
    try {
      if ((navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(data);
      } else {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {
      // user cancelled share
    }
  };

  const verdictBorder =
    result.verdict === "buy"
      ? "border-success/60 bg-success/15"
      : result.verdict === "rent"
        ? "border-accent/60 bg-accent-light/40"
        : "border-border bg-muted/30";

  const verdictLabel =
    result.verdict === "buy"
      ? "🏠 Buying wins"
      : result.verdict === "rent"
        ? "💰 Renting + investing wins"
        : "≈ It's very close";

  const lmiNote =
    inputs.deposit < inputs.propertyValue * 0.2
      ? `LMI applies — estimated ${fmt0(result.lmi)} added to your loan`
      : null;

  return (
    <div className="space-y-6 pb-32 md:pb-0">
      {restored && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-light/40 px-4 py-3 text-[13px] text-foreground">
          <span>Welcome back — we've restored your last comparison.</span>
          <button
            type="button"
            onClick={reset}
            className="font-semibold text-accent hover:underline"
          >
            Reset
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* LEFT — Inputs */}
        <div className="space-y-6 order-2 lg:order-none">
          {/* Mobile tab switcher — hidden on lg+ where both sections render side by side */}
          <div
            role="tablist"
            aria-label="Switch between buy and rent inputs"
            className="sticky top-2 z-20 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-background/95 p-1 shadow-sm backdrop-blur sm:top-2 lg:hidden"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "buy"}
              onClick={() => setMobileTab("buy")}
              className={`rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
                mobileTab === "buy"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent/10"
              }`}
            >
              🏠 If you buy
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "rent"}
              onClick={() => setMobileTab("rent")}
              className={`rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
                mobileTab === "rent"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent/10"
              }`}
            >
              💰 If you rent
            </button>
          </div>

          {/* If you buy */}
          <section
            className={`rounded-2xl border border-border bg-card p-5 ${mobileTab === "buy" ? "" : "hidden"} lg:block`}
          >
            <h2 className="mb-4 text-[16px] font-semibold">If you buy</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <NumberField
                  label="Property purchase price"
                  prefix="$"
                  value={s.propertyValue}
                  onChange={(v) => set("propertyValue", v)}
                  step={10_000}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRICE_PILLS.map((p) => (
                    <Pill
                      key={p}
                      active={s.propertyValue === p}
                      onClick={() => set("propertyValue", p)}
                    >
                      {p >= 1_000_000 ? `$${p / 1_000_000}M` : `$${p / 1000}k`}
                    </Pill>
                  ))}
                </div>
              </div>
              <NumberField
                label="Your deposit"
                prefix="$"
                value={s.deposit}
                onChange={(v) => set("deposit", v)}
                step={5000}
                hint={
                  <>
                    <span>That's {depositPct.toFixed(1)}% of the property value</span>
                    {lmiNote && (
                      <span className="block text-warning">{lmiNote}</span>
                    )}
                  </>
                }
              />
              <NumberField
                label="Home loan interest rate"
                suffix="%"
                value={s.interestRate}
                onChange={(v) => set("interestRate", v)}
                step={0.05}
                hint={`RBA owner-occupier average: ${rbaRates.ownerOccupier}%`}
              />
              <div>
                <span className="mb-1 block text-[13px] font-medium text-foreground">
                  Loan term
                </span>
                <Segmented
                  value={s.loanTermYears}
                  options={TERM_OPTIONS.map((y) => ({ value: y, label: `${y} yr` }))}
                  onChange={(v) => set("loanTermYears", v)}
                />
              </div>
              <div>
                <span className="mb-1 block text-[13px] font-medium text-foreground">
                  State
                </span>
                <select
                  value={s.state}
                  onChange={(e) => set("state", e.target.value as StateCode)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[15px] focus:border-accent focus:outline-none"
                >
                  {STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 self-end text-[13px] font-medium">
                <input
                  type="checkbox"
                  checked={s.isFirstHomeBuyer}
                  onChange={(e) => set("isFirstHomeBuyer", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                I'm a first home buyer
              </label>
              <div className="sm:col-span-2">
                <NumberField
                  label="Annual property price growth"
                  suffix="%"
                  value={s.annualPropertyGrowth}
                  onChange={(v) => set("annualPropertyGrowth", v)}
                  step={0.5}
                  hint={
                    <>
                      Historical Australian average is ~6–7% p.a. nationally. At {s.annualPropertyGrowth}
                      %, your {fmt0(inputs.propertyValue)} property would be worth ~
                      {fmt0(projectedValue10)} in 10 years.
                    </>
                  }
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {GROWTH_PILLS.map((p) => (
                    <Pill
                      key={p}
                      active={s.annualPropertyGrowth === p}
                      onClick={() => set("annualPropertyGrowth", p)}
                    >
                      {p}%
                    </Pill>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Upfront buying costs</span>
                <span className="tnum font-semibold">
                  {fmt0(result.totalUpfrontCosts)}
                </span>
              </div>
              <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Stamp duty ({s.state}{s.isFirstHomeBuyer ? " · FHB" : ""})</span>
                  <span className="tnum">{fmt0(result.stampDuty)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Conveyancing</span>
                  <span className="tnum">$2,000</span>
                </li>
                <li className="flex justify-between">
                  <span>Building inspection</span>
                  <span className="tnum">$600</span>
                </li>
                {result.lmi > 0 && (
                  <li className="flex justify-between">
                    <span>LMI (capitalised)</span>
                    <span className="tnum">{fmt0(result.lmi)}</span>
                  </li>
                )}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="mt-4 text-[13px] font-semibold text-accent hover:underline"
            >
              {advancedOpen ? "− Hide" : "+ Customise"} ownership costs (council, insurance, maintenance)
            </button>
            {advancedOpen && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <NumberField
                  label="Council rates (annual)"
                  prefix="$"
                  value={s.councilRates}
                  onChange={(v) => set("councilRates", v)}
                />
                <NumberField
                  label="Home insurance (annual)"
                  prefix="$"
                  value={s.insurance}
                  onChange={(v) => set("insurance", v)}
                />
                <NumberField
                  label="Strata / body corporate (annual)"
                  prefix="$"
                  value={s.strata}
                  onChange={(v) => set("strata", v)}
                  hint="Enter if applicable — e.g. for apartments"
                />
                <NumberField
                  label="Maintenance & repairs (% of property value / year)"
                  suffix="%"
                  value={s.maintenancePct}
                  onChange={(v) => set("maintenancePct", v)}
                  step={0.1}
                />
              </div>
            )}
          </section>

          {/* If you rent */}
          <section
            className={`rounded-2xl border border-border bg-card p-5 ${mobileTab === "rent" ? "" : "hidden"} lg:block`}
          >
            <h2 className="mb-4 text-[16px] font-semibold">If you rent</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Current weekly rent"
                prefix="$"
                value={s.weeklyRent}
                onChange={(v) => set("weeklyRent", v)}
                step={25}
                hint={`That's ${fmt0((s.weeklyRent * 52) / 12)}/month · ${fmt0(s.weeklyRent * 52)}/year`}
              />
              <div>
                <NumberField
                  label="Annual rent increase"
                  suffix="%"
                  value={s.annualRentIncrease}
                  onChange={(v) => set("annualRentIncrease", v)}
                  step={0.5}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {RENT_INCREASE_PILLS.map((p) => (
                    <Pill
                      key={p}
                      active={s.annualRentIncrease === p}
                      onClick={() => set("annualRentIncrease", p)}
                    >
                      {p}%
                    </Pill>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <NumberField
                  label="Return on savings/investments if not buying"
                  suffix="%"
                  value={s.investmentReturn}
                  onChange={(v) => set("investmentReturn", v)}
                  step={0.5}
                  hint="Conservative ~4% (savings/bonds), moderate ~7% (diversified index), growth ~10% (equities). Historical ASX total return ≈ 9–10% p.a."
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {RETURN_PILLS.map((p) => (
                    <Pill
                      key={p.value}
                      active={s.investmentReturn === p.value}
                      onClick={() => set("investmentReturn", p.value)}
                    >
                      {p.label}
                    </Pill>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-[13px] font-medium text-foreground">
                  How many years to compare?
                </span>
                <Segmented
                  value={s.analysisYears}
                  options={ANALYSIS_YEARS.map((y) => ({ value: y, label: `${y} yr` }))}
                  onChange={(v) => set("analysisYears", v)}
                />
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Buying typically becomes more attractive over longer periods due to capital gains and reducing mortgage debt.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT — Sticky verdict panel */}
        <aside className="order-1 lg:order-none sticky top-2 z-30 self-start lg:top-24">
          <div
            className={`rounded-2xl border-2 p-5 transition-all duration-200 ${verdictBorder} ${isStale ? "opacity-70" : "opacity-100"}`}
            aria-live="polite"
            aria-busy={isStale}
          >
            <div className="flex items-center justify-between gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span>
                {result.breakEvenYear
                  ? `Break-even at year ${result.breakEvenYear}`
                  : result.verdict === "rent"
                    ? `Renting wins over ${inputs.analysisYears} years`
                    : `${inputs.analysisYears}-year outlook`}
              </span>
              {isStale && (
                <span className="flex items-center gap-1.5 rounded-full bg-background/70 px-2 py-0.5 text-[10px] normal-case tracking-normal text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  Updating
                </span>
              )}
            </div>
            <div className="mt-1 text-[18px] font-bold text-foreground">
              {verdictLabel}
            </div>
            {result.verdict !== "close" && (
              <div className="mt-3">
                <div className="text-[12px] uppercase text-muted-foreground">
                  Over {inputs.analysisYears} years,{" "}
                  {result.verdict === "buy" ? "buying" : "renting + investing"} leaves you
                </div>
                <div className="mt-1 text-[34px] font-bold leading-none tracking-tight text-foreground tnum">
                  {fmtAbs0(result.difference)}
                </div>
                <div className="text-[13px] text-muted-foreground">
                  better off than {result.verdict === "buy" ? "renting" : "buying"}
                </div>
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Buyer net worth</div>
                <div className="font-semibold tnum">{fmt0(result.finalBuyNetWorth)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Renter net worth</div>
                <div className="font-semibold tnum">{fmt0(result.finalRentNetWorth)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Monthly mortgage</div>
                <div className="font-semibold tnum">{fmt0(result.monthlyMortgageRepayment)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Loan amount</div>
                <div className="font-semibold tnum">{fmt0(result.loanAmount)}</div>
              </div>
            </div>
            <p className="mt-4 rounded-lg bg-background/60 p-3 text-[12px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Important:</strong> this comparison is highly sensitive to the assumed property growth ({inputs.annualPropertyGrowth}%) and investment return ({inputs.investmentReturn}%). Change these above to see how the result shifts.
            </p>
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

      {/* Break-even chart */}
      <section className={`rounded-2xl border border-border bg-card p-5 transition-opacity duration-200 ${isStale ? "opacity-60" : "opacity-100"}`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold">Net worth over time</h3>
          {result.breakEvenYear ? (
            <span className="rounded-full bg-warning/15 px-3 py-1 text-[12px] font-semibold text-warning-foreground">
              Break-even: Year {result.breakEvenYear}
            </span>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-muted-foreground">
              No crossover within {inputs.analysisYears} years
            </span>
          )}
        </div>
        <div className="h-[300px] w-full md:h-[340px]">
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="buyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="rentFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tickFormatter={(v) => `Yr ${v}`}
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
                labelFormatter={(l) => `Year ${l}`}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background))",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="Buying"
                stroke="hsl(var(--accent))"
                strokeWidth={2.5}
                fill="url(#buyFill)"
              />
              <Area
                type="monotone"
                dataKey="Renting"
                stroke="hsl(var(--success))"
                strokeWidth={2.5}
                fill="url(#rentFill)"
              />
              {result.breakEvenYear && (
                <ReferenceLine
                  x={result.breakEvenYear}
                  stroke="hsl(var(--warning))"
                  strokeDasharray="5 5"
                  label={{
                    value: `Break-even`,
                    position: "top",
                    fill: "hsl(var(--warning-foreground))",
                    fontSize: 11,
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {!result.breakEvenYear && (
          <p className="mt-2 text-[12px] text-muted-foreground">
            The lines do not cross within {inputs.analysisYears} years — renting + investing remains better throughout this period.
          </p>
        )}
      </section>

      {/* Sensitivity table */}
      <section className={`rounded-2xl border border-border bg-card p-5 transition-opacity duration-200 ${isStale ? "opacity-60" : "opacity-100"}`}>
        <h3 className="text-[15px] font-semibold">How assumptions change the result</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Break-even year at different property growth and investment return rates. The cell that matches your current assumptions is highlighted.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-[13px]">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-[11px] uppercase text-muted-foreground" colSpan={2} rowSpan={2}>
                  &nbsp;
                </th>
                <th className="px-2 py-2 text-center text-[11px] uppercase text-muted-foreground" colSpan={growthCols.length}>
                  Property growth →
                </th>
              </tr>
              <tr>
                {growthCols.map((g) => (
                  <th key={g} className="px-2 py-2 text-center text-[12px] font-semibold">
                    {g}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, ri) => (
                <tr key={returnRows[ri]} className="border-t border-border">
                  {ri === 0 && (
                    <td
                      className="w-3 align-middle text-[10px] font-semibold uppercase text-muted-foreground"
                      rowSpan={returnRows.length}
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    >
                      Investment return ↓
                    </td>
                  )}
                  <td className="px-2 py-2 font-semibold">{returnRows[ri]}%</td>
                  {row.map((cell, ci) => {
                    const isCurrent =
                      Math.abs(cell.growthPct - inputs.annualPropertyGrowth) < 0.01 &&
                      Math.abs(cell.returnPct - inputs.investmentReturn) < 0.01;
                    let cls =
                      "bg-accent/5 text-foreground";
                    let label = "Rent";
                    if (cell.breakEvenYear != null) {
                      label = `Yr ${cell.breakEvenYear}`;
                      if (cell.breakEvenYear <= 5)
                        cls = "bg-success/15 text-success";
                      else if (cell.breakEvenYear <= 15)
                        cls = "bg-warning/15 text-warning-foreground";
                      else cls = "bg-muted text-foreground";
                    } else {
                      cls = "bg-accent-light/40 text-accent";
                    }
                    return (
                      <td
                        key={ci}
                        className={`px-2 py-2 text-center text-[12px] font-semibold tnum ${cls} ${
                          isCurrent ? "outline outline-2 outline-foreground" : ""
                        }`}
                        title={isCurrent ? "You are here" : undefined}
                      >
                        {label}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-success" />Yr 1–5 — buying wins quickly</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-warning" />Yr 6–15 — buying wins eventually</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-accent" />Renting wins throughout</span>
        </div>
      </section>

      {/* Year-by-year table */}
      <section className={`rounded-2xl border border-border bg-card p-5 transition-opacity duration-200 ${isStale ? "opacity-60" : "opacity-100"}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">Year-by-year comparison</h3>
          <button
            type="button"
            onClick={() => setShowAllYears((v) => !v)}
            className="text-[12px] font-semibold text-accent hover:underline"
          >
            {showAllYears ? "Show key years" : "Show all years"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase text-muted-foreground">
                <th className="py-2 font-semibold">Year</th>
                <th className="py-2 font-semibold">Property value</th>
                <th className="py-2 font-semibold">Buyer equity</th>
                <th className="py-2 font-semibold">Renter portfolio</th>
                <th className="py-2 font-semibold">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {yearRows.map((i) => {
                const buy = result.buyData[i];
                const rent = result.rentData[i];
                const buyWins = buy.netWorth >= rent.netWorth;
                return (
                  <tr key={buy.year}>
                    <td className="py-2 font-medium">Year {buy.year}</td>
                    <td className="py-2 tnum">{fmt0(buy.propertyValue)}</td>
                    <td className="py-2 tnum">{fmt0(buy.equity)}</td>
                    <td className="py-2 tnum">{fmt0(rent.investmentPortfolio)}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          buyWins
                            ? "bg-success/15 text-success"
                            : "bg-accent/15 text-accent"
                        }`}
                      >
                        {buyWins ? "Buy ✓" : "Rent ✓"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why assumptions matter */}
      <section className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
        <h3 className="text-[15px] font-semibold">⚠ Why assumptions matter so much</h3>
        <ul className="mt-2 space-y-1 text-[13px] text-foreground">
          <li>• Property grows {inputs.annualPropertyGrowth}% per year (your assumption)</li>
          <li>• Rent increases {inputs.annualRentIncrease}% per year (your assumption)</li>
          <li>• Investments return {inputs.investmentReturn}% per year (your assumption)</li>
        </ul>
        <div className="mt-3 grid gap-2 text-[13px] text-foreground sm:grid-cols-2">
          <div className="rounded-xl bg-background/60 p-3">
            <div className="text-[11px] uppercase text-muted-foreground">Property growth 5% → 3%</div>
            <div className="font-semibold">Result shifts by {shiftYears(altGrowthBE)}</div>
          </div>
          <div className="rounded-xl bg-background/60 p-3">
            <div className="text-[11px] uppercase text-muted-foreground">Investment return 7% → 10%</div>
            <div className="font-semibold">Result shifts by {shiftYears(altReturnBE)}</div>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">
          No one can predict these with certainty. Use this as a guide, not a guarantee.
        </p>
      </section>

      {/* Cross-calculator links */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-[15px] font-semibold">Continue your home buying plan</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link
            to="/stamp-duty-calculator"
            className="rounded-xl border border-border bg-background px-3 py-2 text-[13px] hover:border-accent"
          >
            → Calculate your stamp duty
          </Link>
          <Link
            to="/borrowing-power-calculator"
            className="rounded-xl border border-border bg-background px-3 py-2 text-[13px] hover:border-accent"
          >
            → Find out how much you can borrow
          </Link>
          <Link
            to="/mortgage-calculator"
            className="rounded-xl border border-border bg-background px-3 py-2 text-[13px] hover:border-accent"
          >
            → Calculate your mortgage repayments
          </Link>
          {inputs.deposit < inputs.propertyValue * 0.2 && (
            <Link
              to="/lmi-calculator"
              className="rounded-xl border border-border bg-background px-3 py-2 text-[13px] hover:border-accent"
            >
              → Check if LMI applies to your loan
            </Link>
          )}
        </div>
      </section>

      {/* Mobile sticky verdict bar */}
      <div className="fixed inset-x-0 bottom-16 z-40 flex items-center justify-between border-t border-border bg-background px-4 py-3 md:hidden">
        <span className="text-[12px] uppercase text-muted-foreground">
          {result.breakEvenYear
            ? "Break-even"
            : result.verdict === "rent"
              ? "Renter wins"
              : "Outlook"}
        </span>
        <span
          className={`text-[15px] font-bold tnum ${
            result.verdict === "buy"
              ? "text-success"
              : result.verdict === "rent"
                ? "text-accent"
                : "text-foreground"
          }`}
        >
          {result.breakEvenYear
            ? `Year ${result.breakEvenYear}`
            : result.verdict === "rent"
              ? `+${fmtAbs0(result.difference)}`
              : "≈"}
        </span>
      </div>
    </div>
  );
};

export default RentVsBuy;
