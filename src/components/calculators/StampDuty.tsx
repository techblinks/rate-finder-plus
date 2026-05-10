import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Share2, Check, ArrowUpDown } from "lucide-react";
import {
  calcStampDuty,
  calculateStampDutyByState,
  FHOG,
  STATE_FHB_NOTE,
  STATES,
  type BuyerType,
  type PropertyType,
  type StateCode,
} from "@/lib/calc/stampDuty";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import { usePublishMobileResult } from "@/lib/mobileResult";
import Tooltip from "@/components/Tooltip";
import ResultActions from "@/components/ResultActions";

interface StampDutyProps {
  lockedState?: StateCode;
}

const AUD0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const fmt0 = (n: number) => AUD0.format(Math.max(0, Math.round(n)));

const STORAGE_KEY = "calcy_stampduty_last";
const SHARED_KEY = "calcy_shared_state";
const TTL = 90 * 24 * 60 * 60 * 1000;

const PROPERTY_PILLS = [400000, 500000, 600000, 700000, 800000, 1000000, 1500000];

type Mode = "single" | "compare";

interface State {
  value: number;
  state: StateCode;
  fhb: boolean;
  buyer: "owner" | "investor"; // when fhb=false
  propertyType: PropertyType;
  deposit: number;
  mode: Mode;
}

const DEFAULTS: State = {
  value: 700000,
  state: "NSW",
  fhb: false,
  buyer: "owner",
  propertyType: "established",
  deposit: 0,
  mode: "single",
};

function readUrl(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  if (![...sp.keys()].length) return null;
  const out: Partial<State> = {};
  const v = parseFloat(sp.get("value") || "");
  if (Number.isFinite(v)) out.value = v;
  const st = sp.get("state")?.toUpperCase();
  if (st && STATES.some((s) => s.code === st)) out.state = st as StateCode;
  const f = sp.get("fhb");
  if (f === "yes" || f === "no") out.fhb = f === "yes";
  const t = sp.get("type");
  if (t === "established" || t === "new" || t === "vacant") out.propertyType = t;
  const b = sp.get("buyer");
  if (b === "owner" || b === "investor") out.buyer = b;
  const d = parseFloat(sp.get("deposit") || "");
  if (Number.isFinite(d)) out.deposit = d;
  const m = sp.get("mode");
  if (m === "compare" || m === "single") out.mode = m;
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
    return raw ? JSON.parse(raw) : null;
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

const StampDuty = ({ lockedState }: StampDutyProps) => {
  const [restored, setRestored] = useState<"url" | "local" | null>(null);

  const initial = useMemo<State>(() => {
    const u = readUrl();
    if (u) return { ...DEFAULTS, ...u, state: lockedState ?? u.state ?? DEFAULTS.state };
    const l = readLocal();
    if (l) return { ...DEFAULTS, ...l, state: lockedState ?? l.state ?? DEFAULTS.state };
    const shared = readShared();
    if (shared?.propertyValue) {
      return {
        ...DEFAULTS,
        value: shared.propertyValue,
        deposit: shared.deposit ?? 0,
        state: lockedState ?? DEFAULTS.state,
      };
    }
    return { ...DEFAULTS, state: lockedState ?? DEFAULTS.state };
  }, [lockedState]);

  useEffect(() => {
    if (readUrl()) setRestored("url");
    else if (readLocal()) setRestored("local");
  }, []);

  const [s, setS] = useState<State>(initial);
  const set = <K extends keyof State>(k: K, v: State[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const [copied, setCopied] = useState(false);
  const [includeLegal, setIncludeLegal] = useState(true);
  const [includeBuilding, setIncludeBuilding] = useState(true);
  const [includePest, setIncludePest] = useState(true);

  const dState = useDebouncedValue(s, 150);

  // Effective buyer code passed to calc engine.
  const buyerCode: BuyerType = dState.fhb ? "fhb" : dState.buyer;

  const result = useMemo(
    () => calcStampDuty(dState.value, dState.state, buyerCode, dState.propertyType),
    [dState.value, dState.state, buyerCode, dState.propertyType],
  );

  // Sync URL + storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams();
    sp.set("value", String(Math.round(dState.value)));
    sp.set("state", dState.state);
    sp.set("fhb", dState.fhb ? "yes" : "no");
    sp.set("type", dState.propertyType);
    sp.set("buyer", dState.buyer);
    if (dState.deposit > 0) sp.set("deposit", String(Math.round(dState.deposit)));
    sp.set("mode", dState.mode);
    if (!lockedState) {
      window.history.replaceState(null, "", `${window.location.pathname}?${sp.toString()}`);
    }
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), state: dState }),
      );
      window.sessionStorage.setItem(
        SHARED_KEY,
        JSON.stringify({
          propertyValue: dState.value,
          state: dState.state,
          isFirstHomeBuyer: dState.fhb,
          stampDuty: result.netDuty,
          totalUpfrontCosts: result.totalUpfront,
          deposit: dState.deposit,
          depositPercent:
            dState.deposit > 0 ? +((dState.deposit / dState.value) * 100).toFixed(1) : null,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [dState, result.netDuty, result.totalUpfront, lockedState]);

  useDebouncedCalculate("stamp_duty", {
    state: dState.state,
    buyer: buyerCode,
    value: dState.value,
    net_duty: result.netDuty,
  });

  usePublishMobileResult({
    label: "Stamp duty",
    value: fmt0(result.netDuty),
    sub: `${dState.state} · ${fmt0(dState.value)}`,
  });

  const stateName = STATES.find((st) => st.code === s.state)?.name ?? s.state;
  const exempt = s.fhb && result.netDuty === 0;

  // Standard duty for the same state (used in "you save")
  const standardDuty = useMemo(
    () => Math.round(calculateStampDutyByState(dState.value, dState.state, false).duty),
    [dState.value, dState.state],
  );

  // Cost lines
  const legal = includeLegal ? result.legal : 0;
  const building = includeBuilding ? result.building : 0;
  const pest = includePest ? result.pest : 0;
  const totalUpfront = result.netDuty + legal + building + pest;
  const totalCash = totalUpfront + (s.deposit > 0 ? s.deposit : 0);

  const dutyColor =
    result.netDuty === 0
      ? "text-success"
      : result.netDuty > 20000
        ? "text-destructive"
        : result.netDuty > 10000
          ? "text-amber-600 dark:text-amber-400"
          : "text-foreground";

  const onShare = async () => {
    const url = window.location.href;
    const text = `Stamp duty on a ${fmt0(s.value)} property in ${s.state}: ${fmt0(result.netDuty)}${s.fhb ? " (first home buyer rate)" : ""}. Total upfront costs: ${fmt0(totalUpfront)}. Calculated with Calcy.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My stamp duty calculation — Calcy", text, url });
        return;
      } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const clearStored = () => {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setS({ ...DEFAULTS, state: lockedState ?? DEFAULTS.state });
    setRestored(null);
  };

  // Compare mode rows
  type Row = { state: StateCode; duty: number; fhbDuty: number; saving: number; fhog: number };
  const [sortKey, setSortKey] = useState<keyof Row>("fhbDuty");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const compareRows = useMemo<Row[]>(() => {
    const rows: Row[] = STATES.map(({ code }) => {
      const r = calculateStampDutyByState(dState.value, code, true);
      const std = Math.round(r.duty);
      const fhb = Math.round(r.fhbDuty);
      return {
        state: code,
        duty: std,
        fhbDuty: fhb,
        saving: Math.max(0, std - fhb),
        fhog: FHOG[code],
      };
    });
    rows.sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [dState.value, sortKey, sortDir]);

  const cheapest = useMemo(() => {
    return [...compareRows].sort((a, b) => a.fhbDuty - b.fhbDuty)[0];
  }, [compareRows]);

  const toggleSort = (k: keyof Row) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  return (
    <div className="space-y-6 pb-32 md:pb-0">
      <RestoreBanner show={restored === "local"} onReset={clearStored} />

      {/* State pills */}
      {!lockedState && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-3 text-[13px] font-medium text-foreground">Jump to your state:</p>
          <div className="flex flex-wrap gap-2">
            {STATES.map((st) => {
              const active = s.state === st.code;
              return (
                <button
                  key={st.code}
                  type="button"
                  onClick={() => set("state", st.code)}
                  aria-pressed={active}
                  className={`inline-flex h-9 min-w-[44px] items-center justify-center rounded-full border px-4 text-[13px] font-semibold transition-colors ${
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-accent/40 bg-background text-accent hover:bg-accent-light"
                  }`}
                >
                  {st.code}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-[12px] text-muted-foreground">{STATE_FHB_NOTE[s.state]}</p>
            <Link
              to={`/stamp-duty-calculator/${s.state.toLowerCase()}`}
              className="text-[12px] font-semibold text-accent hover:underline"
            >
              View {s.state} stamp duty guide →
            </Link>
          </div>
        </section>
      )}

      {/* Mode toggle */}
      {!lockedState && (
        <Segmented<Mode>
          ariaLabel="Comparison mode"
          value={s.mode}
          onChange={(v) => set("mode", v)}
          options={[
            { value: "single", label: "Single state" },
            { value: "compare", label: "Compare all states" },
          ]}
        />
      )}

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Inputs */}
        <div className="space-y-6">
          {/* FHB toggle — most prominent */}
          <section className="space-y-3 rounded-2xl border-2 border-accent/30 bg-accent-light/40 p-5">
            <h2 className="text-[15px] font-semibold text-foreground">Are you a first home buyer?</h2>
            <Segmented
              ariaLabel="First home buyer"
              value={s.fhb ? "yes" : "no"}
              onChange={(v) => set("fhb", v === "yes")}
              options={[
                { value: "yes", label: "Yes, first home buyer" },
                { value: "no", label: "No / subsequent buyer" },
              ]}
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            {/* Property value */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-foreground">Property value</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  className="field-input tnum w-full pl-7"
                  value={Number.isFinite(s.value) ? s.value : ""}
                  step={5000}
                  min={0}
                  onChange={(e) => set("value", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROPERTY_PILLS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("value", v)}
                    className={`rounded-full border px-3 py-1 text-[12px] font-medium ${
                      s.value === v
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-foreground hover:border-accent"
                    }`}
                  >
                    {v >= 1_000_000 ? `$${v / 1_000_000}M` : `$${v / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* State select (hidden in compare mode) */}
            {s.mode === "single" && !lockedState && (
              <div>
                <label className="mb-1 block text-[13px] font-medium text-foreground">State or territory</label>
                <select
                  className="field-input w-full"
                  value={s.state}
                  onChange={(e) => set("state", e.target.value as StateCode)}
                >
                  {STATES.map((st) => (
                    <option key={st.code} value={st.code}>{st.code} — {st.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Buyer type — only when not FHB */}
            {!s.fhb && (
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
              </div>
            )}

            {/* Property type */}
            <div>
              <label className="mb-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                Property type
                <Tooltip
                  text="First Home Owner Grants are only available on new homes or owner-built properties in most states."
                  label="About: property type"
                />
              </label>
              <Segmented<PropertyType>
                ariaLabel="Property type"
                value={s.propertyType}
                onChange={(v) => set("propertyType", v)}
                options={[
                  { value: "established", label: "Established" },
                  { value: "new", label: "New home" },
                  { value: "vacant", label: "Vacant land" },
                ]}
              />
            </div>

            {/* Optional deposit */}
            <div className="space-y-1">
              <label className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                Your deposit <span className="text-muted-foreground">(optional)</span>
                <Tooltip
                  text="Add your deposit to see total cash needed at settlement — stamp duty + deposit + other costs."
                  label="About: deposit"
                />
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  className="field-input tnum w-full pl-7"
                  value={s.deposit || ""}
                  step={1000}
                  min={0}
                  onChange={(e) => set("deposit", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Results — single mode */}
        {s.mode === "single" && (
          <div className="md:sticky md:top-6 md:self-start">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Stamp duty payable
                </p>
                <p className={`tnum text-[34px] font-bold leading-tight ${dutyColor}`}>
                  {fmt0(result.netDuty)}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {s.state} · {s.fhb ? "First home buyer" : s.buyer === "investor" ? "Investor" : "Owner-occupier"} · {fmt0(s.value)}
                </p>
                {exempt && (
                  <div className="mt-2 rounded-lg bg-success/10 px-3 py-2 text-[13px] font-semibold text-success">
                    ✓ Exempt as a first home buyer in {s.state} — you save {fmt0(standardDuty)} vs a standard buyer
                  </div>
                )}
              </div>

              {/* FHOG panel */}
              {s.fhb && (
                <div
                  className={`rounded-xl border p-4 ${
                    result.fhogEligible
                      ? "border-success/30 bg-success/5"
                      : "border-border bg-background"
                  }`}
                >
                  <p className="text-[13px] font-semibold text-foreground">🏛 First Home Owner Grant</p>
                  {result.fhogEligible ? (
                    <>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        Eligible FHBs purchasing a new home in {s.state} may receive:
                      </p>
                      <p className="tnum mt-1 text-[20px] font-bold text-success">{fmt0(result.fhog)} FHOG</p>
                      <p className="text-[11px] text-muted-foreground">Applied at settlement</p>
                    </>
                  ) : FHOG[s.state] > 0 ? (
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      <span className="tnum font-semibold text-muted-foreground">{fmt0(FHOG[s.state])}</span>{" "}
                      available on <strong>new homes only</strong> in {s.state}. Switch property type to “New home” to qualify.
                    </p>
                  ) : (
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {s.state === "ACT"
                        ? "ACT does not have a FHOG — uses the Home Buyer Concession Scheme instead."
                        : "No FHOG available in this state."}
                    </p>
                  )}
                </div>
              )}

              {/* Savings card */}
              {s.fhb && result.fhbSaving > 0 && !exempt && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Your first home buyer savings
                  </p>
                  <dl className="space-y-1 text-[13px]">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Standard stamp duty</dt><dd className="tnum text-foreground">{fmt0(standardDuty)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">FHB stamp duty</dt><dd className="tnum text-foreground">{fmt0(result.netDuty)}</dd></div>
                    <div className="flex justify-between border-t border-border pt-1 font-semibold"><dt>You save</dt><dd className="tnum text-success">{fmt0(result.fhbSaving)}</dd></div>
                    {result.fhog > 0 && (
                      <div className="flex justify-between"><dt className="text-muted-foreground">FHOG (new homes)</dt><dd className="tnum text-success">+{fmt0(result.fhog)}</dd></div>
                    )}
                    {result.fhog > 0 && (
                      <div className="flex justify-between border-t border-border pt-1 font-semibold"><dt>Total benefit</dt><dd className="tnum text-success">{fmt0(result.fhbSaving + result.fhog)}</dd></div>
                    )}
                  </dl>
                </div>
              )}

              {/* Additional costs */}
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Estimated additional costs
                </p>
                <ul className="space-y-1.5 text-[13px]">
                  <li className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-foreground">
                      <input type="checkbox" checked={includeLegal} onChange={(e) => setIncludeLegal(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
                      Legal / conveyancing
                    </label>
                    <span className="tnum text-muted-foreground">~{fmt0(result.legal)}</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-foreground">
                      <input type="checkbox" checked={includeBuilding} onChange={(e) => setIncludeBuilding(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
                      Building inspection
                    </label>
                    <span className="tnum text-muted-foreground">~{fmt0(result.building)}</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-foreground">
                      <input type="checkbox" checked={includePest} onChange={(e) => setIncludePest(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
                      Pest inspection
                    </label>
                    <span className="tnum text-muted-foreground">~{fmt0(result.pest)}</span>
                  </li>
                </ul>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[14px] font-semibold">
                  <span className="text-foreground">Total upfront costs</span>
                  <span className="tnum text-foreground">{fmt0(totalUpfront)}</span>
                </div>
                {s.deposit > 0 && (
                  <>
                    <div className="mt-1 flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground">Your deposit</span>
                      <span className="tnum text-foreground">{fmt0(s.deposit)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between rounded-lg bg-accent-light px-3 py-2 text-[14px] font-semibold">
                      <span className="text-foreground">Total cash at settlement</span>
                      <span className="tnum text-accent">{fmt0(totalCash)}</span>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onShare}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-foreground hover:border-accent/40 hover:text-accent"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4" />}
                {copied ? "Copied!" : "Share this calculation"}
              </button>

              <ResultActions calculator="stamp_duty" />

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Stamp duty rates are indicative for 2026. Confirm with your state revenue office before
                settlement. First home buyer thresholds are subject to change.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Compare-all-states mode */}
      {s.mode === "compare" && !lockedState && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <header className="mb-3">
            <h2 className="text-[18px] font-semibold text-foreground">
              Stamp duty comparison — {fmt0(dState.value)} property
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Sortable table across all 8 Australian states and territories. Click a column to re-sort.
            </p>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted-foreground">
                  {([
                    ["state", "State"],
                    ["duty", "Standard duty"],
                    ["fhbDuty", "FHB duty"],
                    ["saving", "FHB saving"],
                    ["fhog", "FHOG (new)"],
                  ] as [keyof Row, string][]).map(([k, label]) => (
                    <th key={k} className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggleSort(k)}
                        className="inline-flex items-center gap-1 font-semibold hover:text-foreground"
                      >
                        {label} <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r) => {
                  const isCheapest = cheapest && r.state === cheapest.state;
                  return (
                    <tr
                      key={r.state}
                      className={`border-b border-border last:border-0 ${
                        isCheapest ? "bg-success/5 font-semibold" : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-foreground">
                        {r.state} {isCheapest && <span className="ml-1 text-[11px] text-success">cheapest</span>}
                      </td>
                      <td className="tnum px-3 py-2 text-foreground">{fmt0(r.duty)}</td>
                      <td className="tnum px-3 py-2 text-foreground">
                        {r.fhbDuty === 0 ? <span className="text-success">$0 ✓</span> : fmt0(r.fhbDuty)}
                      </td>
                      <td className="tnum px-3 py-2 text-success">{r.saving > 0 ? fmt0(r.saving) : "—"}</td>
                      <td className="tnum px-3 py-2 text-foreground">{r.fhog > 0 ? fmt0(r.fhog) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {cheapest && (
            <p className="mt-3 text-[13px] text-foreground">
              Cheapest for first home buyers at {fmt0(dState.value)}:{" "}
              <strong>{cheapest.state}</strong> — {fmt0(cheapest.fhbDuty)} stamp duty
              {cheapest.fhog > 0 ? ` + ${fmt0(cheapest.fhog)} FHOG (new home)` : ""}.
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Rates are indicative for 2026. Exact figures depend on property type, intended use, and
            state revenue office rules.
          </p>
        </section>
      )}

      {/* Smart cross-calculator links */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-[15px] font-semibold text-foreground">What's next?</h2>
        <ul className="space-y-2 text-[14px]">
          <li>
            <Link
              to={`/borrowing-power-calculator${s.deposit > 0 ? `?deposit=${Math.round(s.deposit)}` : ""}`}
              className="link-accent"
            >
              → Calculate your borrowing power
            </Link>
          </li>
          <li>
            <Link to="/mortgage-calculator" className="link-accent">
              → Calculate your mortgage repayments
            </Link>
          </li>
          {s.deposit > 0 && s.deposit / s.value < 0.2 && (
            <li>
              <Link
                to={`/lmi-calculator?value=${Math.round(s.value)}&deposit=${Math.round(s.deposit)}`}
                className="link-accent"
              >
                → Check if LMI applies to your loan
              </Link>
            </li>
          )}
          <li>
            <Link to="/extra-repayments-calculator" className="link-accent">
              → See how extra repayments save you money
            </Link>
          </li>
        </ul>
      </section>

      {/* Mobile sticky bar */}
      {s.mode === "single" && (
        <div
          className="fixed bottom-16 left-0 right-0 z-40 flex items-center justify-between border-t border-border bg-background px-4 py-3 shadow-[0_-4px_12px_-8px_rgba(0,0,0,0.2)] md:hidden"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          <span className="text-[12px] font-medium text-muted-foreground">Stamp duty</span>
          <span className={`tnum text-[18px] font-bold ${dutyColor}`}>
            {exempt ? "$0 — exempt ✓" : fmt0(result.netDuty)}
          </span>
        </div>
      )}
    </div>
  );
};

export default StampDuty;
