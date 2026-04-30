import { useMemo, useState } from "react";
import { CountryConfig } from "@/data/countries";
import { calculateMortgage } from "@/lib/calculators";
import HeroResultCard from "@/components/premium/HeroResultCard";
import PremiumSlider from "@/components/premium/PremiumSlider";
import FrequencyToggle, { Frequency } from "@/components/premium/FrequencyToggle";
import SecondaryResultCard from "@/components/premium/SecondaryResultCard";
import AmortizationBarChart from "@/components/premium/AmortizationBarChart";
import ShareButton from "@/components/premium/ShareButton";
import { Label } from "@/components/ui/label";
import { readSharedState, clamp } from "@/lib/share";

interface Props { country: CountryConfig }

type Money = (n: number, digits?: number) => string;

const useMoney = (country: CountryConfig): Money => (n, digits = 0) =>
  `${country.currencySymbol}${Math.max(0, n).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;

const freqMultiplier: Record<Frequency, number> = { monthly: 1, fortnightly: 12 / 26, weekly: 12 / 52 };

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="page-enter grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">{children}</div>
);

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="premium-card p-5 md:p-6 space-y-5 transition-colors duration-150 hover:border-gray-300 hover:shadow-sm">
    <h2 className="font-sans text-sm font-bold text-foreground">{title}</h2>
    {children}
  </section>
);

const ResultsGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{children}</div>
);

const ShareRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-end">{children}</div>
);

// ---------------- Repayment ----------------

type RepaymentState = { amount: number; deposit: number; rate: number; term: number; frequency: Frequency };

export const RepaymentCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const shared = readSharedState<RepaymentState>() ?? {};
  const [s, setS] = useState<RepaymentState>(() => ({
    amount: clamp(shared.amount, 50000, 2000000, country.defaultAmount),
    deposit: clamp(shared.deposit, 0, 1500000, Math.round(country.defaultAmount * 0.2)),
    rate: clamp(shared.rate, 0.5, 15, country.defaultRate),
    term: clamp(shared.term, 5, 40, country.defaultTerm),
    frequency: (shared.frequency === "weekly" || shared.frequency === "fortnightly" || shared.frequency === "monthly") ? shared.frequency : "monthly",
  }));
  const set = <K extends keyof RepaymentState>(k: K, v: RepaymentState[K]) => setS(p => ({ ...p, [k]: v }));

  const principal = Math.max(1000, s.amount - s.deposit);
  const result = useMemo(() => calculateMortgage(principal, s.rate, s.term), [principal, s.rate, s.term]);
  const repayment = result.monthlyPayment * freqMultiplier[s.frequency];

  return (
    <Shell>
      <div className="space-y-5">
        <HeroResultCard label={`${s.frequency.toUpperCase()} REPAYMENT`} value={money(repayment)} subLabel={`${money(principal)} loan over ${s.term} years`} />
        <ShareRow><ShareButton state={s} title="Mortgage repayment" resultLabel={`${s.frequency} repayment`} resultValue={money(repayment)} /></ShareRow>
        <Panel title="Mortgage Details">
          <PremiumSlider label="Property price" value={s.amount} min={50000} max={2000000} step={5000} onChange={(v) => set("amount", v)} format={money} />
          <PremiumSlider label="Deposit" value={s.deposit} min={0} max={Math.max(0, s.amount * 0.6)} step={5000} onChange={(v) => set("deposit", v)} format={money} />
          <PremiumSlider label="Interest rate" value={s.rate} min={0.5} max={15} step={0.05} onChange={(v) => set("rate", v)} format={(v) => `${v.toFixed(2)}%`} />
          <PremiumSlider label="Loan term" value={s.term} min={5} max={40} step={1} onChange={(v) => set("term", v)} format={(v) => `${v} years`} />
          <FrequencyToggle value={s.frequency} onChange={(v) => set("frequency", v)} />
        </Panel>
        <AmortizationBarChart schedule={result.schedule} symbol={country.currencySymbol} height={160} />
      </div>
      <aside className="space-y-3 lg:sticky lg:top-24">
        <ResultsGrid>
          <SecondaryResultCard icon="" label="Total interest" value={money(result.totalInterest)} />
          <SecondaryResultCard icon="" label="Total cost" value={money(result.totalPayment)} />
          <SecondaryResultCard icon="" label="Loan amount" value={money(principal)} />
        </ResultsGrid>
      </aside>
    </Shell>
  );
};

// ---------------- Borrowing Power ----------------

type BorrowState = { income: number; expenses: number; debts: number; rate: number; term: number };

export const BorrowingPowerCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const shared = readSharedState<BorrowState>() ?? {};
  const [s, setS] = useState<BorrowState>(() => ({
    income: clamp(shared.income, 30000, 500000, country.defaultAmount * 0.22),
    expenses: clamp(shared.expenses, 500, 15000, country.defaultAmount * 0.045),
    debts: clamp(shared.debts, 0, 8000, country.defaultAmount * 0.015),
    rate: clamp(shared.rate, 3, 14, country.defaultRate + 3),
    term: clamp(shared.term, 5, 40, country.defaultTerm),
  }));
  const set = <K extends keyof BorrowState>(k: K, v: BorrowState[K]) => setS(p => ({ ...p, [k]: v }));

  const monthlySurplus = Math.max(0, s.income / 12 - s.expenses - s.debts);
  const serviceable = monthlySurplus * 0.82;
  const r = s.rate / 100 / 12;
  const n = s.term * 12;
  const capacity = r > 0 ? serviceable * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)) : serviceable * n;

  return (
    <Shell>
      <div className="space-y-5">
        <HeroResultCard label="BORROWING CAPACITY" value={money(capacity)} subLabel={`Stressed at ${s.rate.toFixed(2)}% over ${s.term} years`} />
        <ShareRow><ShareButton state={s} title="Borrowing capacity" resultLabel="Borrowing capacity" resultValue={money(capacity)} /></ShareRow>
        <Panel title="Income & Commitments">
          <PremiumSlider label="Gross annual income" value={s.income} min={30000} max={500000} step={5000} onChange={(v) => set("income", v)} format={money} />
          <PremiumSlider label="Monthly living expenses" value={s.expenses} min={500} max={15000} step={100} onChange={(v) => set("expenses", v)} format={money} />
          <PremiumSlider label="Monthly debt repayments" value={s.debts} min={0} max={8000} step={100} onChange={(v) => set("debts", v)} format={money} />
          <PremiumSlider label="Assessment rate" value={s.rate} min={3} max={14} step={0.05} onChange={(v) => set("rate", v)} format={(v) => `${v.toFixed(2)}%`} />
          <PremiumSlider label="Loan term" value={s.term} min={5} max={40} step={1} onChange={(v) => set("term", v)} format={(v) => `${v} years`} />
        </Panel>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24">
        <ResultsGrid>
          <SecondaryResultCard icon="" label="Monthly surplus" value={money(monthlySurplus)} />
          <SecondaryResultCard icon="" label="Serviceable payment" value={money(serviceable)} />
          <SecondaryResultCard icon="" label="Buffer rate" value={`${s.rate.toFixed(2)}%`} />
        </ResultsGrid>
        <Panel title="Pre-Approval Roadmap">
          {["Check borrowing range", "Prepare income documents", "Compare lender policy"].map((step, i) => <div key={step} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-sm font-extrabold text-primary">{i + 1}</span><p className="text-sm font-semibold text-foreground">{step}</p></div>)}
          <div className="rounded-xl border bg-secondary p-4 text-sm text-muted-foreground"><span className="text-primary">✓</span> Payslips, bank statements, ID, debts, and deposit evidence.</div>
        </Panel>
      </aside>
    </Shell>
  );
};

// ---------------- Stamp Duty ----------------

type StampState = { price: number; state: string; fhb: boolean };

export const StampDutyCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const defaultRegion = country.code === "au" ? "NSW" : country.code === "ca" ? "ON" : country.code === "us" ? "CA" : "England";
  const shared = readSharedState<StampState>() ?? {};
  const [s, setS] = useState<StampState>(() => ({
    price: clamp(shared.price, 50000, 2500000, country.defaultAmount),
    state: typeof shared.state === "string" ? shared.state : defaultRegion,
    fhb: typeof shared.fhb === "boolean" ? shared.fhb : false,
  }));
  const set = <K extends keyof StampState>(k: K, v: StampState[K]) => setS(p => ({ ...p, [k]: v }));

  const rate = country.code === "au" ? 0.042 : country.code === "gb" ? 0.035 : country.code === "ca" ? 0.018 : 0.012;
  const concession = s.fhb ? Math.min(s.price * rate, country.code === "au" ? 18000 : country.code === "gb" ? 10000 : 5000) : 0;
  const duty = Math.max(0, s.price * rate - concession);
  const legal = s.price * 0.006;
  const upfront = duty + legal;

  return (
    <Shell>
      <div className="space-y-5">
        <HeroResultCard label="TOTAL UPFRONT COST" value={money(upfront)} subLabel={`${s.state} estimate including transfer costs`} variant="stamp" />
        <ShareRow><ShareButton state={s} title="Stamp duty estimate" resultLabel="Total upfront cost" resultValue={money(upfront)} /></ShareRow>
        <Panel title="Property & Buyer Details">
          <PremiumSlider label="Property price" value={s.price} min={50000} max={2500000} step={5000} onChange={(v) => set("price", v)} format={money} />
          <div className="space-y-2"><Label htmlFor="state-select">State / region</Label><select id="state-select" value={s.state} onChange={(e) => set("state", e.target.value)} className="h-12 w-full rounded-lg border border-border bg-secondary px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"><option>NSW</option><option>VIC</option><option>QLD</option><option>ON</option><option>CA</option><option>England</option></select></div>
          <label className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4 text-sm font-semibold"><span>First home buyer</span><input type="checkbox" checked={s.fhb} onChange={(e) => set("fhb", e.target.checked)} className="peer sr-only" /><span className="relative h-6 w-11 rounded-full border border-gray-300 bg-card transition peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-[18px] after:w-[18px] after:rounded-full after:bg-card after:shadow-sm after:transition peer-checked:after:translate-x-5" /></label>
        </Panel>
      </div>
      <aside className="lg:sticky lg:top-24"><ResultsGrid><SecondaryResultCard icon="" label="Transfer tax" value={money(duty)} /><SecondaryResultCard icon="" label="Other costs" value={money(legal)} /><SecondaryResultCard icon="" label="Concession" value={money(concession)} hint={s.fhb ? "Applied" : "Not applied"} /></ResultsGrid></aside>
    </Shell>
  );
};

// ---------------- Extra Repayments ----------------

type ExtraState = { amount: number; rate: number; term: number; extra: number };

export const ExtraRepaymentsCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const shared = readSharedState<ExtraState>() ?? {};
  const [s, setS] = useState<ExtraState>(() => ({
    amount: clamp(shared.amount, 50000, 2000000, country.defaultAmount * 0.8),
    rate: clamp(shared.rate, 0.5, 15, country.defaultRate),
    term: clamp(shared.term, 5, 40, country.defaultTerm),
    extra: clamp(shared.extra, 0, 5000, 300),
  }));
  const set = <K extends keyof ExtraState>(k: K, v: ExtraState[K]) => setS(p => ({ ...p, [k]: v }));

  const base = useMemo(() => calculateMortgage(s.amount, s.rate, s.term), [s.amount, s.rate, s.term]);
  const accelerated = useMemo(() => calculateMortgage(s.amount, s.rate, s.term, s.extra), [s.amount, s.rate, s.term, s.extra]);
  const saved = Math.max(0, base.totalInterest - accelerated.totalInterest);
  const monthsSaved = Math.max(0, base.schedule.length - accelerated.schedule.length);

  return (
    <Shell>
      <div className="space-y-5">
        <HeroResultCard label="INTEREST YOU COULD SAVE" value={money(saved)} subLabel={`${Math.floor(monthsSaved / 12)} years ${monthsSaved % 12} months faster`} variant="extra" />
        <ShareRow><ShareButton state={s} title="Extra repayments" resultLabel="Interest saved" resultValue={money(saved)} /></ShareRow>
        <Panel title="Extra Repayment Scenario">
          <PremiumSlider label="Loan amount" value={s.amount} min={50000} max={2000000} step={5000} onChange={(v) => set("amount", v)} format={money} />
          <PremiumSlider label="Interest rate" value={s.rate} min={0.5} max={15} step={0.05} onChange={(v) => set("rate", v)} format={(v) => `${v.toFixed(2)}%`} />
          <PremiumSlider label="Loan term" value={s.term} min={5} max={40} step={1} onChange={(v) => set("term", v)} format={(v) => `${v} years`} />
          <PremiumSlider label="Extra monthly repayment" value={s.extra} min={0} max={5000} step={50} onChange={(v) => set("extra", v)} format={money} />
        </Panel>
      </div>
      <aside className="lg:sticky lg:top-24"><ResultsGrid><SecondaryResultCard icon="" label="Standard interest" value={money(base.totalInterest)} /><SecondaryResultCard icon="" label="New interest" value={money(accelerated.totalInterest)} /><SecondaryResultCard icon="" label="New payoff" value={`${Math.ceil(accelerated.schedule.length / 12)} yrs`} hint="Estimated" /></ResultsGrid></aside>
    </Shell>
  );
};

// ---------------- Mortgage Insurance ----------------

type InsuranceState = { price: number; deposit: number };

export const MortgageInsuranceCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const shared = readSharedState<InsuranceState>() ?? {};
  const [s, setS] = useState<InsuranceState>(() => ({
    price: clamp(shared.price, 50000, 2500000, country.defaultAmount),
    deposit: clamp(shared.deposit, 0, 2000000, country.defaultAmount * 0.12),
  }));
  const set = <K extends keyof InsuranceState>(k: K, v: InsuranceState[K]) => setS(p => ({ ...p, [k]: v }));

  const loan = Math.max(0, s.price - s.deposit);
  const lvr = loan / Math.max(1, s.price);
  const premiumRate = lvr <= 0.8 ? 0 : lvr < 0.9 ? 0.018 : lvr < 0.95 ? 0.032 : 0.045;
  const premium = loan * premiumRate;
  const label = country.code === "au" ? "LMI estimate" : country.code === "ca" ? "CMHC estimate" : country.code === "us" ? "PMI estimate" : "Insurance estimate";

  return (
    <Shell>
      <div className="space-y-5">
        <HeroResultCard label="MORTGAGE INSURANCE" value={money(premium)} subLabel={`${(lvr * 100).toFixed(1)}% loan-to-value ratio`} />
        <ShareRow><ShareButton state={s} title="Mortgage insurance" resultLabel={label} resultValue={money(premium)} /></ShareRow>
        <Panel title="Deposit & Loan Size">
          <PremiumSlider label="Property price" value={s.price} min={50000} max={2500000} step={5000} onChange={(v) => set("price", v)} format={money} />
          <PremiumSlider label="Deposit" value={s.deposit} min={0} max={s.price * 0.5} step={5000} onChange={(v) => set("deposit", v)} format={money} />
        </Panel>
      </div>
      <aside className="lg:sticky lg:top-24"><ResultsGrid><SecondaryResultCard icon="" label={label} value={money(premium)} /><SecondaryResultCard icon="" label="Loan amount" value={money(loan)} /><SecondaryResultCard icon="" label="LVR" value={`${(lvr * 100).toFixed(1)}%`} /></ResultsGrid><p className="mt-4 rounded-xl border bg-secondary p-4 text-xs text-muted-foreground">Insurance calculations are illustrative only and vary by lender, borrower profile, and product rules.</p></aside>
    </Shell>
  );
};

// ---------------- Loan Comparison ----------------

type CompareState = { amount: number; rateA: number; rateB: number; termA: number; termB: number };

export const LoanComparisonCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const shared = readSharedState<CompareState>() ?? {};
  const [s, setS] = useState<CompareState>(() => ({
    amount: clamp(shared.amount, 50000, 2000000, country.defaultAmount * 0.8),
    rateA: clamp(shared.rateA, 0.5, 15, country.defaultRate),
    rateB: clamp(shared.rateB, 0.5, 15, country.defaultRate - 0.35),
    termA: clamp(shared.termA, 5, 40, country.defaultTerm),
    termB: clamp(shared.termB, 5, 40, country.defaultTerm),
  }));
  const set = <K extends keyof CompareState>(k: K, v: CompareState[K]) => setS(p => ({ ...p, [k]: v }));

  const a = calculateMortgage(s.amount, s.rateA, s.termA);
  const b = calculateMortgage(s.amount, s.rateB, s.termB);
  const bWins = b.totalPayment < a.totalPayment;
  const saving = Math.abs(a.totalPayment - b.totalPayment);

  return (
    <Shell>
      <div className="space-y-5">
        <HeroResultCard label="BEST SCENARIO SAVING" value={money(saving)} subLabel={`${bWins ? "Scenario B" : "Scenario A"} has the lower lifetime cost`} />
        <ShareRow><ShareButton state={s} title="Loan comparison" resultLabel="Best scenario saving" resultValue={money(saving)} /></ShareRow>
        <Panel title="Compare Loans">
          <PremiumSlider label="Loan amount" value={s.amount} min={50000} max={2000000} step={5000} onChange={(v) => set("amount", v)} format={money} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between"><b>Scenario A</b>{!bWins && <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase text-accent-foreground">Winner</span>}</div>
              <PremiumSlider label="Rate" value={s.rateA} min={0.5} max={15} step={0.05} onChange={(v) => set("rateA", v)} format={(v) => `${v.toFixed(2)}%`} />
              <PremiumSlider label="Term" value={s.termA} min={5} max={40} step={1} onChange={(v) => set("termA", v)} format={(v) => `${v} yrs`} />
            </div>
            <div className="rounded-xl border border-primary p-4 ring-4 ring-primary/10">
              <div className="mb-3 flex items-center justify-between"><b>Scenario B</b>{bWins && <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase text-accent-foreground">Winner</span>}</div>
              <PremiumSlider label="Rate" value={s.rateB} min={0.5} max={15} step={0.05} onChange={(v) => set("rateB", v)} format={(v) => `${v.toFixed(2)}%`} />
              <PremiumSlider label="Term" value={s.termB} min={5} max={40} step={1} onChange={(v) => set("termB", v)} format={(v) => `${v} yrs`} />
            </div>
          </div>
        </Panel>
      </div>
      <aside className="lg:sticky lg:top-24"><ResultsGrid><SecondaryResultCard icon="" label="A monthly" value={money(a.monthlyPayment)} /><SecondaryResultCard icon="" label="B monthly" value={money(b.monthlyPayment)} /><SecondaryResultCard icon="" label="Savings" value={money(saving)} /></ResultsGrid></aside>
    </Shell>
  );
};
