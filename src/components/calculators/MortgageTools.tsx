import { useMemo, useState } from "react";
import { CountryConfig } from "@/data/countries";
import { calculateMortgage } from "@/lib/calculators";
import HeroResultCard from "@/components/premium/HeroResultCard";
import PremiumSlider from "@/components/premium/PremiumSlider";
import FrequencyToggle, { Frequency } from "@/components/premium/FrequencyToggle";
import SecondaryResultCard from "@/components/premium/SecondaryResultCard";
import AmortizationBarChart from "@/components/premium/AmortizationBarChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export const RepaymentCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const [amount, setAmount] = useState(country.defaultAmount);
  const [deposit, setDeposit] = useState(Math.round(country.defaultAmount * 0.2));
  const [rate, setRate] = useState(country.defaultRate);
  const [term, setTerm] = useState(country.defaultTerm);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const principal = Math.max(1000, amount - deposit);
  const result = useMemo(() => calculateMortgage(principal, rate, term), [principal, rate, term]);
  const repayment = result.monthlyPayment * freqMultiplier[frequency];

  return (
    <Shell>
      <div className="space-y-5">
        <HeroResultCard label={`${frequency.toUpperCase()} REPAYMENT`} value={money(repayment)} subLabel={`${money(principal)} loan over ${term} years`} />
        <Panel title="Mortgage Details">
          <PremiumSlider label="Property price" value={amount} min={50000} max={2000000} step={5000} onChange={setAmount} format={money} />
          <PremiumSlider label="Deposit" value={deposit} min={0} max={Math.max(0, amount * 0.6)} step={5000} onChange={setDeposit} format={money} />
          <PremiumSlider label="Interest rate" value={rate} min={0.5} max={15} step={0.05} onChange={setRate} format={(v) => `${v.toFixed(2)}%`} />
          <PremiumSlider label="Loan term" value={term} min={5} max={40} step={1} onChange={setTerm} format={(v) => `${v} years`} />
          <FrequencyToggle value={frequency} onChange={setFrequency} />
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

export const BorrowingPowerCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const [income, setIncome] = useState(country.defaultAmount * 0.22);
  const [expenses, setExpenses] = useState(country.defaultAmount * 0.045);
  const [debts, setDebts] = useState(country.defaultAmount * 0.015);
  const [rate, setRate] = useState(country.defaultRate + 3);
  const [term, setTerm] = useState(country.defaultTerm);
  const monthlySurplus = Math.max(0, income / 12 - expenses - debts);
  const serviceable = monthlySurplus * 0.82;
  const r = rate / 100 / 12;
  const n = term * 12;
  const capacity = r > 0 ? serviceable * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)) : serviceable * n;

  return (
    <Shell>
      <div className="space-y-5">
        <HeroResultCard label="BORROWING CAPACITY" value={money(capacity)} subLabel={`Stressed at ${rate.toFixed(2)}% over ${term} years`} />
        <Panel title="Income & Commitments">
          <PremiumSlider label="Gross annual income" value={income} min={30000} max={500000} step={5000} onChange={setIncome} format={money} />
          <PremiumSlider label="Monthly living expenses" value={expenses} min={500} max={15000} step={100} onChange={setExpenses} format={money} />
          <PremiumSlider label="Monthly debt repayments" value={debts} min={0} max={8000} step={100} onChange={setDebts} format={money} />
          <PremiumSlider label="Assessment rate" value={rate} min={3} max={14} step={0.05} onChange={setRate} format={(v) => `${v.toFixed(2)}%`} />
          <PremiumSlider label="Loan term" value={term} min={5} max={40} step={1} onChange={setTerm} format={(v) => `${v} years`} />
        </Panel>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24">
        <ResultsGrid>
          <SecondaryResultCard icon="" label="Monthly surplus" value={money(monthlySurplus)} />
          <SecondaryResultCard icon="" label="Serviceable payment" value={money(serviceable)} />
          <SecondaryResultCard icon="" label="Buffer rate" value={`${rate.toFixed(2)}%`} />
        </ResultsGrid>
        <Panel title="Pre-Approval Roadmap">
          {["Check borrowing range", "Prepare income documents", "Compare lender policy"].map((s, i) => <div key={s} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-sm font-extrabold text-primary">{i + 1}</span><p className="text-sm font-semibold text-foreground">{s}</p></div>)}
          <div className="rounded-xl border bg-secondary p-4 text-sm text-muted-foreground"><span className="text-primary">✓</span> Payslips, bank statements, ID, debts, and deposit evidence.</div>
        </Panel>
      </aside>
    </Shell>
  );
};

export const StampDutyCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const [price, setPrice] = useState(country.defaultAmount);
  const [state, setState] = useState(country.code === "au" ? "NSW" : country.code === "ca" ? "ON" : country.code === "us" ? "CA" : "England");
  const [fhb, setFhb] = useState(false);
  const rate = country.code === "au" ? 0.042 : country.code === "gb" ? 0.035 : country.code === "ca" ? 0.018 : 0.012;
  const concession = fhb ? Math.min(price * rate, country.code === "au" ? 18000 : country.code === "gb" ? 10000 : 5000) : 0;
  const duty = Math.max(0, price * rate - concession);
  const legal = price * 0.006;
  const upfront = duty + legal;

  return (
    <Shell>
      <div className="space-y-5">
        <HeroResultCard label="TOTAL UPFRONT COST" value={money(upfront)} subLabel={`${state} estimate including transfer costs`} variant="stamp" />
        <Panel title="Property & Buyer Details">
          <PremiumSlider label="Property price" value={price} min={50000} max={2500000} step={5000} onChange={setPrice} format={money} />
          <div className="space-y-2"><Label htmlFor="state-select">State / region</Label><select id="state-select" value={state} onChange={(e) => setState(e.target.value)} className="h-12 w-full rounded-lg border border-border bg-secondary px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"><option>NSW</option><option>VIC</option><option>QLD</option><option>ON</option><option>CA</option><option>England</option></select></div>
          <label className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4 text-sm font-semibold"><span>First home buyer</span><input type="checkbox" checked={fhb} onChange={(e) => setFhb(e.target.checked)} className="peer sr-only" /><span className="relative h-6 w-11 rounded-full border border-gray-300 bg-card transition peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-[18px] after:w-[18px] after:rounded-full after:bg-card after:shadow-sm after:transition peer-checked:after:translate-x-5" /></label>
        </Panel>
      </div>
      <aside className="lg:sticky lg:top-24"><ResultsGrid><SecondaryResultCard icon="" label="Transfer tax" value={money(duty)} /><SecondaryResultCard icon="" label="Other costs" value={money(legal)} /><SecondaryResultCard icon="" label="Concession" value={money(concession)} hint={fhb ? "Applied" : "Not applied"} /></ResultsGrid></aside>
    </Shell>
  );
};

export const ExtraRepaymentsCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const [amount, setAmount] = useState(country.defaultAmount * 0.8);
  const [rate, setRate] = useState(country.defaultRate);
  const [term, setTerm] = useState(country.defaultTerm);
  const [extra, setExtra] = useState(300);
  const base = useMemo(() => calculateMortgage(amount, rate, term), [amount, rate, term]);
  const accelerated = useMemo(() => calculateMortgage(amount, rate, term, extra), [amount, rate, term, extra]);
  const saved = Math.max(0, base.totalInterest - accelerated.totalInterest);
  const monthsSaved = Math.max(0, base.schedule.length - accelerated.schedule.length);

  return (
    <Shell>
      <div className="space-y-5"><HeroResultCard label="INTEREST YOU COULD SAVE" value={money(saved)} subLabel={`${Math.floor(monthsSaved / 12)} years ${monthsSaved % 12} months faster`} variant="extra" /><Panel title="Extra Repayment Scenario"><PremiumSlider label="Loan amount" value={amount} min={50000} max={2000000} step={5000} onChange={setAmount} format={money} /><PremiumSlider label="Interest rate" value={rate} min={0.5} max={15} step={0.05} onChange={setRate} format={(v) => `${v.toFixed(2)}%`} /><PremiumSlider label="Loan term" value={term} min={5} max={40} step={1} onChange={setTerm} format={(v) => `${v} years`} /><PremiumSlider label="Extra monthly repayment" value={extra} min={0} max={5000} step={50} onChange={setExtra} format={money} /></Panel></div>
      <aside className="lg:sticky lg:top-24"><ResultsGrid><SecondaryResultCard icon="" label="Standard interest" value={money(base.totalInterest)} /><SecondaryResultCard icon="" label="New interest" value={money(accelerated.totalInterest)} /><SecondaryResultCard icon="" label="New payoff" value={`${Math.ceil(accelerated.schedule.length / 12)} yrs`} hint="Estimated" /></ResultsGrid></aside>
    </Shell>
  );
};

export const MortgageInsuranceCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const [price, setPrice] = useState(country.defaultAmount);
  const [deposit, setDeposit] = useState(country.defaultAmount * 0.12);
  const loan = Math.max(0, price - deposit);
  const lvr = loan / Math.max(1, price);
  const premiumRate = lvr <= 0.8 ? 0 : lvr < 0.9 ? 0.018 : lvr < 0.95 ? 0.032 : 0.045;
  const premium = loan * premiumRate;
  const label = country.code === "au" ? "LMI estimate" : country.code === "ca" ? "CMHC estimate" : country.code === "us" ? "PMI estimate" : "Insurance estimate";

  return <Shell><div className="space-y-5"><HeroResultCard label="MORTGAGE INSURANCE" value={money(premium)} subLabel={`${(lvr * 100).toFixed(1)}% loan-to-value ratio`} /><Panel title="Deposit & Loan Size"><PremiumSlider label="Property price" value={price} min={50000} max={2500000} step={5000} onChange={setPrice} format={money} /><PremiumSlider label="Deposit" value={deposit} min={0} max={price * 0.5} step={5000} onChange={setDeposit} format={money} /></Panel></div><aside className="lg:sticky lg:top-24"><ResultsGrid><SecondaryResultCard icon="" label={label} value={money(premium)} /><SecondaryResultCard icon="" label="Loan amount" value={money(loan)} /><SecondaryResultCard icon="" label="LVR" value={`${(lvr * 100).toFixed(1)}%`} /></ResultsGrid><p className="mt-4 rounded-xl border bg-secondary p-4 text-xs text-muted-foreground">Insurance calculations are illustrative only and vary by lender, borrower profile, and product rules.</p></aside></Shell>;
};

export const LoanComparisonCalculator = ({ country }: Props) => {
  const money = useMoney(country);
  const [amount, setAmount] = useState(country.defaultAmount * 0.8);
  const [rateA, setRateA] = useState(country.defaultRate);
  const [rateB, setRateB] = useState(country.defaultRate - 0.35);
  const [termA, setTermA] = useState(country.defaultTerm);
  const [termB, setTermB] = useState(country.defaultTerm);
  const a = calculateMortgage(amount, rateA, termA);
  const b = calculateMortgage(amount, rateB, termB);
  const bWins = b.totalPayment < a.totalPayment;
  const saving = Math.abs(a.totalPayment - b.totalPayment);

  return <Shell><div className="space-y-5"><HeroResultCard label="BEST SCENARIO SAVING" value={money(saving)} subLabel={`${bWins ? "Scenario B" : "Scenario A"} has the lower lifetime cost`} /><Panel title="Compare Loans"><PremiumSlider label="Loan amount" value={amount} min={50000} max={2000000} step={5000} onChange={setAmount} format={money} /><div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-border p-4"><div className="mb-3 flex items-center justify-between"><b>Scenario A</b>{!bWins && <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase text-accent-foreground">Winner</span>}</div><PremiumSlider label="Rate" value={rateA} min={0.5} max={15} step={0.05} onChange={setRateA} format={(v) => `${v.toFixed(2)}%`} /><PremiumSlider label="Term" value={termA} min={5} max={40} step={1} onChange={setTermA} format={(v) => `${v} yrs`} /></div><div className="rounded-xl border border-primary p-4 ring-4 ring-primary/10"><div className="mb-3 flex items-center justify-between"><b>Scenario B</b>{bWins && <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase text-accent-foreground">Winner</span>}</div><PremiumSlider label="Rate" value={rateB} min={0.5} max={15} step={0.05} onChange={setRateB} format={(v) => `${v.toFixed(2)}%`} /><PremiumSlider label="Term" value={termB} min={5} max={40} step={1} onChange={setTermB} format={(v) => `${v} yrs`} /></div></div></Panel></div><aside className="lg:sticky lg:top-24"><ResultsGrid><SecondaryResultCard icon="" label="A monthly" value={money(a.monthlyPayment)} /><SecondaryResultCard icon="" label="B monthly" value={money(b.monthlyPayment)} /><SecondaryResultCard icon="" label="Savings" value={money(saving)} /></ResultsGrid></aside></Shell>;
};
