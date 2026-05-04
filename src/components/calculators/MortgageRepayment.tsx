import { useState } from "react";
import { calcMortgage } from "@/lib/calc/mortgage";
import { AUD, monthName, pct } from "@/lib/format";
import { Card, Field, NumberInput, SelectInput, PrimaryButton, ResultRow, ResultCard } from "@/components/ui-kit";
import DonutChart from "@/components/DonutChart";
import AmortisationTable from "@/components/AmortisationTable";

type Frequency = "monthly" | "fortnightly" | "weekly";

const MortgageRepayment = () => {
  const [amount, setAmount] = useState(650000);
  const [rate, setRate] = useState(5.5);
  const [term, setTerm] = useState(30);
  const [frequency, setFrequency] = useState<Frequency>("fortnightly");
  const [extra, setExtra] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof calcMortgage> | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calcMortgage(amount, rate, term, extra));
  };

  const display =
    result &&
    (frequency === "monthly"
      ? result.monthly
      : frequency === "fortnightly"
      ? result.fortnightly
      : result.weekly);

  return (
    <div className="space-y-6">
      <Card as="form">
        <form onSubmit={handleCalculate} className="space-y-4">
          <Field label="Loan amount">
            <NumberInput value={amount} onChange={setAmount} min={0} step={1000} prefix="$" />
          </Field>
          <Field label="Interest rate">
            <NumberInput value={rate} onChange={setRate} min={0} max={20} step={0.01} suffix="%" />
          </Field>
          <Field label="Loan term">
            <NumberInput value={term} onChange={setTerm} min={1} max={30} step={1} suffix="yr" />
          </Field>
          <Field label="Repayment frequency">
            <SelectInput<Frequency>
              value={frequency}
              onChange={setFrequency}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "fortnightly", label: "Fortnightly" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          </Field>
          <Field label="Extra per month (optional)">
            <NumberInput value={extra} onChange={setExtra} min={0} step={50} prefix="$" />
          </Field>
          <PrimaryButton>Calculate</PrimaryButton>
        </form>
      </Card>

      {result && (
        <ResultCard>
          <div className="border-b border-border pb-3">
            <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
              {frequency} repayment
            </p>
            <p className="tnum text-[28px] font-semibold leading-tight text-success">
              {AUD(display ?? 0)}
            </p>
          </div>
          <div className="divide-y divide-border">
            <ResultRow label="Monthly repayment" value={AUD(result.monthly)} />
            <ResultRow label="Fortnightly repayment" value={AUD(result.fortnightly)} />
            <ResultRow label="Weekly repayment" value={AUD(result.weekly)} />
            <ResultRow label="Total repaid" value={AUD(result.totalRepaid)} />
            <ResultRow label="Total interest" value={AUD(result.totalInterest)} />
            <ResultRow
              label="Interest as % of loan"
              value={pct((result.totalInterest / Math.max(1, amount)) * 100)}
            />
            <ResultRow label="Loan paid off" value={monthName(result.payoffDate)} />
          </div>
          <div className="mt-5">
            <DonutChart principal={amount} interest={result.totalInterest} />
          </div>
          <div className="mt-5">
            <AmortisationTable rows={result.yearlySchedule} />
          </div>
        </ResultCard>
      )}
    </div>
  );
};

export default MortgageRepayment;
