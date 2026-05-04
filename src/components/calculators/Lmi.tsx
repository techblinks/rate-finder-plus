import { useState } from "react";
import { calcLmi, type LmiResult } from "@/lib/calc/lmi";
import { AUD, pct } from "@/lib/format";
import { Card, Field, NumberInput, PrimaryButton, ResultRow, ResultCard } from "@/components/ui-kit";

const LmiCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(700000);
  const [deposit, setDeposit] = useState(70000);
  const [term, setTerm] = useState(30);
  const [rate, setRate] = useState(5.5);
  const [result, setResult] = useState<LmiResult | null>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calcLmi(propertyValue, deposit, term, rate));
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handle} className="space-y-4">
          <Field label="Property value">
            <NumberInput value={propertyValue} onChange={setPropertyValue} min={0} step={5000} prefix="$" />
          </Field>
          <Field label="Deposit amount">
            <NumberInput value={deposit} onChange={setDeposit} min={0} step={1000} prefix="$" />
          </Field>
          <Field label="Loan term">
            <NumberInput value={term} onChange={setTerm} min={1} max={30} step={1} suffix="yr" />
          </Field>
          <Field label="Interest rate (for repayment estimate)">
            <NumberInput value={rate} onChange={setRate} min={0} max={20} step={0.01} suffix="%" />
          </Field>
          <PrimaryButton>Calculate</PrimaryButton>
        </form>
      </Card>

      {result && (
        <ResultCard>
          <div className="border-b border-border pb-3">
            <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
              Loan to value ratio
            </p>
            <p className="tnum text-[28px] font-semibold leading-tight text-foreground">
              {pct(result.lvr, 2)}
            </p>
            <p
              className={`mt-1 text-[14px] font-semibold ${
                result.required ? "text-warning" : "text-success"
              }`}
            >
              LMI required: {result.required ? "YES" : "NO"}
            </p>
          </div>
          <div className="divide-y divide-border">
            <ResultRow label="Loan amount" value={AUD(result.loanAmount)} />
            {result.required && (
              <>
                <ResultRow label="LMI estimate" value={AUD(result.lmiCost)} />
                <ResultRow label="Total loan with LMI" value={AUD(result.totalLoan)} />
                <ResultRow label="Monthly repayment (incl LMI)" value={AUD(result.monthlyRepayment)} />
              </>
            )}
          </div>
          {result.required ? (
            <p className="mt-4 rounded-md bg-surface p-3 text-[13px] leading-relaxed text-foreground">
              Tip: Increasing your deposit to {AUD(result.depositFor20)} (20%) would eliminate LMI
              and save approximately <span className="font-semibold tnum">{AUD(result.savingsAt20)}</span>.
            </p>
          ) : (
            <p className="mt-4 rounded-md bg-surface p-3 text-[13px] leading-relaxed text-foreground">
              Your deposit is above 20%. No LMI required.
            </p>
          )}
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            LMI estimates are indicative. Actual costs depend on your lender and insurer (Genworth
            or QBE). Your lender will provide the exact LMI premium.
          </p>
        </ResultCard>
      )}
    </div>
  );
};

export default LmiCalculator;
