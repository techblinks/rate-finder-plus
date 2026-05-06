import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { calcMortgage } from "@/lib/calc/mortgage";
import { rbaRates } from "@/data/rbaRates";
import { AUD, monthName } from "@/lib/format";
import { Card, ResultCard } from "@/components/ui-kit";
import RangeField from "@/components/RangeField";
import RbaRateIndicator from "@/components/RbaRateIndicator";
import StickyResultsBar from "@/components/StickyResultsBar";
import DonutChart from "@/components/DonutChart";

const AmortisationTable = lazy(() => import("@/components/AmortisationTable"));
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";

type Frequency = "monthly" | "fortnightly" | "weekly";
type LoanType = "owner" | "investor";

const PillToggle = <T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) => (
  <div className="pill-toggle">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={value === o.value}
        onClick={() => onChange(o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const MortgageRepayment = () => {
  const [loanType, setLoanType] = useState<LoanType>("owner");
  const [amount, setAmount] = useState(650000);
  const [rate, setRate] = useState(rbaRates.ownerOccupier);
  const [term, setTerm] = useState(30);
  const [frequency, setFrequency] = useState<Frequency>("fortnightly");
  const [extraOpen, setExtraOpen] = useState(false);
  const [extra, setExtra] = useState(0);

  const dAmount = useDebouncedValue(amount);
  const dRate = useDebouncedValue(rate);
  const dTerm = useDebouncedValue(term);
  const dExtra = useDebouncedValue(extraOpen ? extra : 0);

  const result = useMemo(
    () => calcMortgage(Math.max(0, dAmount), Math.max(0, dRate), Math.max(1, dTerm), Math.max(0, dExtra)),
    [dAmount, dRate, dTerm, dExtra],
  );

  const baseResult = useMemo(
    () => (dExtra > 0
      ? calcMortgage(Math.max(0, dAmount), Math.max(0, dRate), Math.max(1, dTerm), 0)
      : null),
    [dAmount, dRate, dTerm, dExtra],
  );

  useDebouncedCalculate("mortgage_repayment", {
    loan_type: loanType,
    amount: dAmount,
    rate: dRate,
    term: dTerm,
    extra: dExtra,
    frequency,
    monthly: Math.round(result.monthly),
  });

  const display =
    frequency === "monthly" ? result.monthly : frequency === "fortnightly" ? result.fortnightly : result.weekly;

  const interestPctOfRepayments =
    result.totalRepaid > 0 ? (result.totalInterest / result.totalRepaid) * 100 : 0;

  const calcRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      <StickyResultsBar
        watchRef={calcRef}
        summary={`${AUD(amount)} @ ${rate.toFixed(2)}% · ${term}yr`}
        primary={`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} ${AUD(display)}`}
      />

      <div ref={calcRef} className="space-y-4">
        <RbaRateIndicator
          loanType={loanType}
          onApply={(r) => {
            setRate(r);
            setLoanType(r === rbaRates.investor ? "investor" : "owner");
          }}
        />

        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted-foreground">I am a:</span>
          <PillToggle<LoanType>
            value={loanType}
            onChange={setLoanType}
            options={[
              { value: "owner", label: "Owner-Occupier" },
              { value: "investor", label: "Investor" },
            ]}
          />
        </div>

        <Card>
          <div className="space-y-5">
            <RangeField
              label="Loan amount"
              value={amount}
              onChange={setAmount}
              min={50000}
              max={2000000}
              step={5000}
              prefix="$"
            />
            <RangeField
              label="Interest rate"
              value={rate}
              onChange={setRate}
              min={1}
              max={15}
              step={0.05}
              suffix="%"
            />
            <RangeField
              label="Loan term"
              value={term}
              onChange={setTerm}
              min={5}
              max={30}
              step={1}
              suffix="yr"
            />

            <div className="field">
              <label className="text-[13px] font-medium text-foreground">Repayment frequency</label>
              <PillToggle<Frequency>
                value={frequency}
                onChange={setFrequency}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "fortnightly", label: "Fortnightly" },
                  { value: "weekly", label: "Weekly" },
                ]}
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setExtraOpen((v) => !v)}
                className="text-[13px] font-medium text-accent hover:underline"
                aria-expanded={extraOpen}
              >
                {extraOpen ? "− Hide extra repayments" : "+ Add extra repayments"}
              </button>
              {extraOpen && (
                <div className="mt-3">
                  <RangeField
                    label="Extra per month"
                    value={extra}
                    onChange={setExtra}
                    min={0}
                    max={5000}
                    step={50}
                    prefix="$"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <ResultCard>
        <div className="border-b border-border pb-3 text-center">
          <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
            {frequency} repayment
          </p>
          <p className="tnum text-[32px] font-semibold leading-tight text-success">
            {AUD(display)}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[13px] text-muted-foreground">Total repaid</p>
            <p className="tnum text-[18px] font-semibold text-foreground">{AUD(result.totalRepaid)}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[13px] text-muted-foreground">Total interest</p>
            <p className="tnum text-[18px] font-semibold text-foreground">{AUD(result.totalInterest)}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[13px] text-muted-foreground">Loan paid off</p>
            <p className="tnum text-[18px] font-semibold text-foreground">{monthName(result.payoffDate)}</p>
          </div>
        </div>

        <p className="mt-3 text-[13px] font-medium text-warning">
          Interest makes up {interestPctOfRepayments.toFixed(0)}% of your total repayments
        </p>

        {baseResult && dExtra > 0 && (
          <div className="mt-4 rounded-md bg-surface p-3 text-[14px] leading-relaxed text-success">
            <p className="font-semibold">With {AUD(dExtra)} extra per month:</p>
            <p className="text-foreground">
              Pay off {monthName(result.payoffDate)} —{" "}
              {Math.max(0, monthsBetween(result.payoffDate, baseResult.payoffDate))} months earlier
            </p>
            <p className="text-foreground">
              Save {AUD(Math.max(0, baseResult.totalInterest - result.totalInterest))} in interest
            </p>
          </div>
        )}

        <div className="mt-5">
          <DonutChart principal={amount} interest={result.totalInterest} />
        </div>

        <div className="mt-5">
          <AmortisationTable rows={result.yearlySchedule} monthlyRows={result.monthlySchedule} />
        </div>
      </ResultCard>
    </div>
  );
};

function monthsBetween(earlier: Date, later: Date): number {
  return (later.getFullYear() - earlier.getFullYear()) * 12 + (later.getMonth() - earlier.getMonth());
}

export default MortgageRepayment;
