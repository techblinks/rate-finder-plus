import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildExtraRepaymentSchedules,
  formatYearsMonths,
  type Frequency,
} from "@/lib/calc/extraRepayments";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import ResultActions from "@/components/ResultActions";
import ShareResult from "@/components/ShareResult";
import { useRbaRates } from "@/hooks/useRbaRates";

const AUD0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const fmt0 = (n: number) => AUD0.format(Math.max(0, Math.round(n)));
const monthLabel = (d: Date) =>
  d.toLocaleDateString("en-AU", { month: "short", year: "numeric" });

const STORAGE_KEY = "calcy_extra_last";
const SHARED_KEY = "calcy_shared_state";
const TTL = 90 * 24 * 60 * 60 * 1000;

const BALANCE_PILLS = [300_000, 400_000, 500_000, 600_000, 750_000, 1_000_000];
const EXTRA_PILLS = [100, 250, 500, 1000, 2000];
const TERM_PILLS = [10, 15, 20, 25, 30];
const SCENARIOS = [0, 250, 500, 1000, 2000];

interface State {
  balance: number;
  rate: number;
  term: number;
  frequency: Frequency;
  extra: number;
  extraFrequency: Frequency;
  lumpSum: number;
  lumpSumYear: number;
}

const DEFAULTS: State = {
  balance: 500_000,
  rate: 5.5,
  term: 25,
  frequency: "monthly",
  extra: 500,
  extraFrequency: "monthly",
  lumpSum: 0,
  lumpSumYear: 0,
};

function readUrl(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  if (![...sp.keys()].length) return null;
  const out: Partial<State> = {};
  const num = (k: string) => {
    const v = sp.get(k);
    return v != null && !Number.isNaN(parseFloat(v)) ? parseFloat(v) : undefined;
  };
  if (num("balance") != null) out.balance = num("balance")!;
  if (num("rate") != null) out.rate = num("rate")!;
  if (num("term") != null) out.term = num("term")!;
  if (num("extra") != null) out.extra = num("extra")!;
  if (num("lump") != null) out.lumpSum = num("lump")!;
  if (num("lumpyear") != null) out.lumpSumYear = num("lumpyear")!;
  const f = sp.get("freq");
  if (f === "weekly" || f === "fortnightly" || f === "monthly") out.frequency = f;
  const ef = sp.get("extfreq");
  if (ef === "weekly" || ef === "fortnightly" || ef === "monthly") out.extraFrequency = ef;
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
    const s = JSON.parse(raw) as { loanBalance?: number; annualRate?: number };
    const out: Partial<State> = {};
    if (typeof s.loanBalance === "number") out.balance = s.loanBalance;
    if (typeof s.annualRate === "number") out.rate = s.annualRate;
    return out;
  } catch {
    return null;
  }
}

const Segmented = <T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-border bg-surface p-1"
  >
    {options.map((o) => {
      const active = o.value === value;
      return (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
            active
              ? "bg-background text-accent shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const ExtraRepayments = () => {
  const rbaRates = useRbaRates();
  const [restored, setRestored] = useState<"url" | "local" | null>(null);
  const initial = useMemo<State>(() => {
    const u = readUrl();
    if (u) return { ...DEFAULTS, ...u };
    const l = readLocal();
    if (l) {
      setRestored("local");
      return { ...DEFAULTS, ...l };
    }
    const sh = readShared();
    if (sh) return { ...DEFAULTS, ...sh };
    return DEFAULTS;
  }, []);
  const [s, setS] = useState<State>(initial);
  useEffect(() => {
    if (readUrl()) setRestored("url");
  }, []);
  const set = <K extends keyof State>(k: K, v: State[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const dBalance = useDebouncedValue(s.balance);
  const dRate = useDebouncedValue(s.rate);
  const dTerm = useDebouncedValue(s.term);
  const dExtra = useDebouncedValue(s.extra);
  const dLump = useDebouncedValue(s.lumpSum);

  const inputs = useMemo(
    () => ({
      loanBalance: Math.max(0, dBalance),
      annualRate: Math.max(0, dRate),
      remainingTermYears: Math.max(1, dTerm),
      frequency: s.frequency,
      extraMonthly: Math.max(0, dExtra),
      extraFrequency: s.extraFrequency,
      lumpSum: Math.max(0, dLump),
      lumpSumYear: Math.max(0, s.lumpSumYear),
    }),
    [dBalance, dRate, dTerm, dExtra, dLump, s.frequency, s.extraFrequency, s.lumpSumYear],
  );

  const result = useMemo(() => buildExtraRepaymentSchedules(inputs), [inputs]);

  // Persist
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), data: s }),
      );
      const sp = new URLSearchParams();
      sp.set("balance", String(Math.round(s.balance)));
      sp.set("rate", String(s.rate));
      sp.set("term", String(s.term));
      sp.set("freq", s.frequency);
      sp.set("extra", String(Math.round(s.extra)));
      sp.set("extfreq", s.extraFrequency);
      sp.set("lump", String(Math.round(s.lumpSum)));
      sp.set("lumpyear", String(s.lumpSumYear));
      window.history.replaceState(null, "", `${window.location.pathname}?${sp}`);
      window.sessionStorage.setItem(
        SHARED_KEY,
        JSON.stringify({
          loanBalance: s.balance,
          annualRate: s.rate,
          remainingTermYears: s.term,
          frequency: s.frequency,
          scheduledRepayment: result.standard.scheduledRepayment,
        }),
      );
    } catch {
      // ignore
    }
  }, [s, result.standard.scheduledRepayment]);

  useDebouncedCalculate("extra_repayments", {
    balance: dBalance,
    rate: dRate,
    term: dTerm,
    extra: dExtra,
    lump: dLump,
    interest_saved: result.interestSaved,
    months_saved: result.monthsSaved,
  });

  // Chart data — merge year arrays so both lines share the X axis
  const chartData = useMemo(() => {
    const maxYears = Math.max(
      result.standard.yearlyData.length,
      result.accelerated.yearlyData.length,
    );
    const startYear = new Date().getFullYear();
    return Array.from({ length: maxYears }, (_, i) => {
      const std = result.standard.yearlyData[i];
      const acc = result.accelerated.yearlyData[i];
      return {
        year: startYear + i + 1,
        standard: std ? std.closingBalance : 0,
        accelerated: acc ? acc.closingBalance : 0,
      };
    });
  }, [result]);

  // What-if scenarios
  const scenarios = useMemo(() => {
    return SCENARIOS.map((extraAmt) => {
      const r = buildExtraRepaymentSchedules({ ...inputs, extraMonthly: extraAmt });
      return {
        extra: extraAmt,
        interestSaved: r.interestSaved,
        monthsSaved: r.monthsSaved,
        payoff: r.accelerated.payoffDate,
      };
    });
  }, [inputs]);

  const reset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setS(DEFAULTS);
    setRestored(null);
  };

  const yearlyRows = useMemo(() => {
    const showYears = new Set([1, 2, 3, 5, 10, 15, 20, result.standard.yearlyData.length]);
    return result.standard.yearlyData
      .map((std, i) => ({ std, acc: result.accelerated.yearlyData[i] }))
      .filter(({ std }) => showYears.has(std.year));
  }, [result]);

  const downloadCsv = () => {
    // CSV mirrors the year-by-year breakdown shown on screen:
    // same ordering, same rounded AUD values (whole dollars, like fmt0),
    // plus the extra contextual columns power-users expect.
    const headers = [
      "Year",
      "Opening balance (AUD)",
      "Scheduled paid (AUD)",
      "Extra paid (AUD)",
      "Interest paid - standard (AUD)",
      "Interest paid - with extra (AUD)",
      "Closing balance - standard (AUD)",
      "Closing balance - with extra (AUD)",
      "Difference (AUD)",
    ];
    const round = (n: number) => Math.round(n || 0);
    const escape = (v: string | number) => {
      const str = String(v);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const totalYears = Math.max(
      result.standard.yearlyData.length,
      result.accelerated.yearlyData.length
    );
    const rows: string[] = [];
    for (let i = 0; i < totalYears; i++) {
      const std = result.standard.yearlyData[i];
      const acc = result.accelerated.yearlyData[i];
      const stdClose = std?.closingBalance ?? 0;
      const accClose = acc?.closingBalance ?? 0;
      rows.push(
        [
          std?.year ?? acc?.year ?? i + 1,
          round(std?.openingBalance ?? acc?.openingBalance ?? 0),
          round(std?.scheduledPaid ?? acc?.scheduledPaid ?? 0),
          round(acc?.extraPaid ?? 0),
          round(std?.interestPaid ?? 0),
          round(acc?.interestPaid ?? 0),
          round(stdClose),
          round(accClose),
          round(stdClose - accClose),
        ]
          .map(escape)
          .join(",")
      );
    }
    // BOM keeps Excel from mangling currency / unicode.
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\r\n") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calcy-extra-repayments-${s.balance}-${s.extra}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Timeline %s
  const stdMonths = result.standard.payoffMonths || 1;
  const accMonths = result.accelerated.payoffMonths || 1;
  const accPct = Math.min(100, (accMonths / stdMonths) * 100);

  return (
    <div className="space-y-6 pb-32 md:pb-0">
      {restored && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-light/40 px-4 py-3 text-[13px] text-foreground">
          <span>Welcome back — we've restored your last calculation.</span>
          <button
            type="button"
            onClick={reset}
            className="font-semibold text-accent hover:underline"
          >
            Reset
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* INPUTS */}
        <div className="space-y-5">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-[15px] font-semibold text-foreground">Your loan</h2>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground">
                Current loan balance
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  className="field-input tnum w-full pl-7"
                  value={Number.isFinite(s.balance) ? s.balance : ""}
                  step={5000}
                  min={0}
                  onChange={(e) => set("balance", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BALANCE_PILLS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("balance", v)}
                    className={`rounded-full border px-3 py-1 text-[12px] font-medium ${
                      s.balance === v
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-foreground hover:border-accent"
                    }`}
                  >
                    {v >= 1_000_000 ? `$${v / 1_000_000}M` : `$${v / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-foreground">
                  Interest rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step={0.05}
                    min={0}
                    className="field-input tnum w-full pr-7"
                    value={Number.isFinite(s.rate) ? s.rate : ""}
                    onChange={(e) => set("rate", parseFloat(e.target.value) || 0)}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">RBA cash rate: {rbaRates.cashRate.toFixed(2)}%</p>
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-medium text-foreground">
                  Remaining term
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    className="field-input tnum w-full pr-9"
                    value={Number.isFinite(s.term) ? s.term : ""}
                    onChange={(e) => set("term", parseInt(e.target.value) || 0)}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                    yr
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {TERM_PILLS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => set("term", y)}
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        s.term === y
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-background text-foreground"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-foreground">
                Repayment frequency
              </label>
              <Segmented<Frequency>
                ariaLabel="Repayment frequency"
                value={s.frequency}
                onChange={(v) => set("frequency", v)}
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "fortnightly", label: "Fortnightly" },
                  { value: "monthly", label: "Monthly" },
                ]}
              />
            </div>
          </section>

          {/* HERO INPUT — extra */}
          <section className="space-y-3 rounded-2xl border-2 border-accent/30 bg-accent-light/40 p-5">
            <h2 className="text-[15px] font-semibold text-foreground">
              Extra repayments per month
            </h2>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                className="field-input tnum w-full pl-7"
                value={Number.isFinite(s.extra) ? s.extra : ""}
                step={50}
                min={0}
                onChange={(e) => set("extra", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXTRA_PILLS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("extra", v)}
                  className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${
                    s.extra === v
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-accent/40 bg-background text-accent hover:bg-accent-light"
                  }`}
                >
                  +${v.toLocaleString()}/mo
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              On TOP of your scheduled repayment.
            </p>
          </section>

          {/* Lump sum */}
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-[15px] font-semibold text-foreground">
              One-off lump sum (optional)
            </h2>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                className="field-input tnum w-full pl-7"
                value={Number.isFinite(s.lumpSum) ? s.lumpSum : ""}
                step={1000}
                min={0}
                onChange={(e) => set("lumpSum", parseFloat(e.target.value) || 0)}
              />
            </div>
            {s.lumpSum > 0 && (
              <div>
                <label className="mb-1 block text-[12px] font-medium text-muted-foreground">
                  When?
                </label>
                <Segmented
                  ariaLabel="Lump sum timing"
                  value={String(s.lumpSumYear)}
                  onChange={(v) => set("lumpSumYear", parseInt(v))}
                  options={[
                    { value: "0", label: "Now" },
                    { value: "1", label: "Year 1" },
                    { value: "2", label: "Year 2" },
                    { value: "3", label: "Year 3" },
                    { value: "5", label: "Year 5" },
                  ]}
                />
              </div>
            )}
          </section>
        </div>

        {/* RESULTS — sticky on desktop */}
        <div className="md:sticky md:top-6 md:self-start space-y-4">
          <section className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              You save
            </p>
            <p className="mt-1 text-[40px] md:text-[48px] font-bold leading-none text-success tnum transition-all">
              {fmt0(result.interestSaved)}
            </p>
            <p className="mt-1 text-[14px] text-muted-foreground">in total interest</p>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pay off your loan
              </p>
              <p className="mt-1 text-[22px] font-bold text-accent">
                {result.monthsSaved > 0
                  ? `${formatYearsMonths(result.monthsSaved)} earlier`
                  : "—"}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Loan paid off:{" "}
                <strong className="text-foreground">
                  {monthLabel(result.accelerated.payoffDate)}
                </strong>{" "}
                <span className="text-muted-foreground">(instead of </span>
                {monthLabel(result.standard.payoffDate)}
                <span className="text-muted-foreground">)</span>
              </p>
            </div>
          </section>

          {/* 2x2 metric grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Without extra</p>
              <p className="mt-1 text-[18px] font-semibold tnum">
                {fmt0(result.standard.totalInterest)}
              </p>
              <p className="text-[11px] text-muted-foreground">Total interest</p>
            </div>
            <div className="rounded-xl border-2 border-success/40 bg-success/5 p-3">
              <p className="text-[11px] uppercase text-success">With {fmt0(s.extra)} extra</p>
              <p className="mt-1 text-[18px] font-semibold tnum text-success">
                {fmt0(result.accelerated.totalInterest)}
              </p>
              <p className="text-[11px] text-muted-foreground">Total interest</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Without extra</p>
              <p className="mt-1 text-[15px] font-semibold tnum">
                {monthLabel(result.standard.payoffDate)}
              </p>
              <p className="text-[11px] text-muted-foreground">Paid off</p>
            </div>
            <div className="rounded-xl border-2 border-accent/40 bg-accent-light/30 p-3">
              <p className="text-[11px] uppercase text-accent">With extra</p>
              <p className="mt-1 text-[15px] font-semibold tnum text-accent">
                {monthLabel(result.accelerated.payoffDate)}
              </p>
              <p className="text-[11px] text-muted-foreground">Paid off</p>
            </div>
          </div>

          <ResultActions calculator="extra_repayments" />
          <ShareResult
            calculator="extra_repayments"
            params={{
              balance: Math.round(s.balance),
              rate: s.rate.toFixed(2),
              term: s.term,
              extra: Math.round(s.extra),
              freq: s.frequency,
              lump: Math.round(s.lumpSum),
              lumpyear: s.lumpSumYear,
            }}
            shareText={`I'd save ${fmt0(result.interestSaved)} on my $${s.balance.toLocaleString()} loan by paying ${fmt0(s.extra)} extra/mo`}
          />
        </div>
      </div>

      {/* Loan balance decline chart */}
      <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
        <h3 className="mb-3 text-[15px] font-semibold">Loan balance over time</h3>
        <div className="h-[280px] w-full md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="stdFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="accFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}k`
                }
              />
              <Tooltip
                formatter={(v: number) => fmt0(v)}
                labelFormatter={(l) => `Year ${l}`}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="standard"
                name="Without extra"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#stdFill)"
              />
              {s.extra > 0 && (
                <Area
                  type="monotone"
                  dataKey="accelerated"
                  name={`With ${fmt0(s.extra)} extra`}
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  fill="url(#accFill)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Payoff timeline */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-[15px] font-semibold">Payoff timeline</h3>
        <div className="relative h-12 rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-success/20 transition-all duration-500"
            style={{ width: `${accPct}%` }}
          />
          <div
            className="absolute top-0 h-full w-1 rounded-full bg-success transition-all duration-500"
            style={{ left: `calc(${accPct}% - 2px)` }}
            aria-label="Accelerated payoff"
          />
          <div
            className="absolute right-0 top-0 h-full w-1 rounded-full bg-accent"
            aria-label="Standard payoff"
          />
        </div>
        <div className="mt-2 flex justify-between text-[12px] text-muted-foreground">
          <span>
            Today —{" "}
            <strong className="text-foreground">
              {new Date().toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
            </strong>
          </span>
          <span className="text-success font-semibold">
            {result.monthsSaved > 0
              ? `${formatYearsMonths(result.monthsSaved)} saved`
              : "No savings yet"}
          </span>
          <span>
            Original payoff —{" "}
            <strong className="text-foreground">{monthLabel(result.standard.payoffDate)}</strong>
          </span>
        </div>
      </section>

      {/* What-if scenarios */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-1 text-[15px] font-semibold">What if you paid more?</h3>
        <p className="mb-4 text-[13px] text-muted-foreground">
          Click any row to apply that extra amount.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13px]">
            <thead>
              <tr className="text-left text-[12px] uppercase text-muted-foreground">
                <th className="py-2 font-semibold">Extra/month</th>
                <th className="py-2 font-semibold">Interest saved</th>
                <th className="py-2 font-semibold">Time saved</th>
                <th className="py-2 font-semibold">Paid off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scenarios.map((row) => {
                const active = row.extra === s.extra;
                return (
                  <tr
                    key={row.extra}
                    onClick={() => set("extra", row.extra)}
                    className={`cursor-pointer transition-colors ${
                      active ? "bg-accent-light/40" : "hover:bg-muted/40"
                    }`}
                  >
                    <td className="py-2 font-semibold">
                      {active && <span className="mr-1 text-accent">●</span>}$
                      {row.extra.toLocaleString()}/mo
                    </td>
                    <td className="py-2 tnum text-success font-semibold">
                      {row.extra === 0 ? "—" : fmt0(row.interestSaved)}
                    </td>
                    <td className="py-2 tnum">
                      {row.extra === 0 ? "—" : formatYearsMonths(row.monthsSaved)}
                    </td>
                    <td className="py-2 tnum">{monthLabel(row.payoff)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Year-by-year table */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">Year-by-year breakdown</h3>
          <button
            type="button"
            onClick={downloadCsv}
            className="text-[12px] font-semibold text-accent hover:underline"
          >
            ↓ Download full CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[13px]">
            <thead>
              <tr className="text-left text-[12px] uppercase text-muted-foreground">
                <th className="py-2 font-semibold">Year</th>
                <th className="py-2 font-semibold">Closing (standard)</th>
                <th className="py-2 font-semibold">Closing (with extra)</th>
                <th className="py-2 font-semibold">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {yearlyRows.map(({ std, acc }) => (
                <tr key={std.year}>
                  <td className="py-2 font-medium">{std.year}</td>
                  <td className="py-2 tnum">{fmt0(std.closingBalance)}</td>
                  <td className="py-2 tnum text-success">
                    {fmt0(acc?.closingBalance ?? 0)}
                  </td>
                  <td className="py-2 tnum font-semibold text-success">
                    {fmt0(std.closingBalance - (acc?.closingBalance ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile sticky savings bar */}
      <div className="fixed inset-x-0 bottom-16 z-40 flex items-center justify-between border-t border-border bg-background px-4 py-3 md:hidden">
        <span className="text-[12px] uppercase text-muted-foreground">Interest saved</span>
        <span className="text-[18px] font-bold text-success tnum">
          {fmt0(result.interestSaved)}
        </span>
      </div>
    </div>
  );
};

export default ExtraRepayments;
