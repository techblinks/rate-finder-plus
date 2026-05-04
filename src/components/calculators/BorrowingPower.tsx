import { useState } from "react";
import { calcBorrowingPower, type BorrowingResult } from "@/lib/calc/borrowingPower";
import { AUD, pct } from "@/lib/format";
import { Card, Field, NumberInput, SelectInput, PrimaryButton, ResultRow, ResultCard } from "@/components/ui-kit";

const BorrowingPower = () => {
  const [income1, setIncome1] = useState(100000);
  const [income2, setIncome2] = useState(0);
  const [expenses, setExpenses] = useState(3500);
  const [otherRepayments, setOtherRepayments] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0);
  const [dependants, setDependants] = useState<"0" | "1" | "2" | "3" | "4">("0");
  const [rate, setRate] = useState(5.5);
  const [term, setTerm] = useState(30);
  const [result, setResult] = useState<BorrowingResult | null>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(
      calcBorrowingPower({
        income1,
        income2,
        monthlyExpenses: expenses,
        otherRepayments,
        creditCardLimit: creditLimit,
        dependants: Number(dependants),
        ratePct: rate,
        termYears: term,
      }),
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handle} className="space-y-4">
          <Field label="Annual income (you)">
            <NumberInput value={income1} onChange={setIncome1} min={0} step={1000} prefix="$" />
          </Field>
          <Field label="Partner's income (optional)">
            <NumberInput value={income2} onChange={setIncome2} min={0} step={1000} prefix="$" />
          </Field>
          <Field label="Monthly living expenses">
            <NumberInput value={expenses} onChange={setExpenses} min={0} step={100} prefix="$" />
          </Field>
          <Field label="Other loan repayments (monthly)">
            <NumberInput value={otherRepayments} onChange={setOtherRepayments} min={0} step={50} prefix="$" />
          </Field>
          <Field label="Credit card limit">
            <NumberInput value={creditLimit} onChange={setCreditLimit} min={0} step={500} prefix="$" />
          </Field>
          <Field label="Dependants">
            <SelectInput
              value={dependants}
              onChange={setDependants}
              options={[
                { value: "0", label: "0" },
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4+" },
              ]}
            />
          </Field>
          <Field label="Interest rate">
            <NumberInput value={rate} onChange={setRate} min={0} max={20} step={0.01} suffix="%" />
          </Field>
          <Field label="Loan term">
            <NumberInput value={term} onChange={setTerm} min={1} max={30} step={1} suffix="yr" />
          </Field>
          <PrimaryButton>Calculate</PrimaryButton>
        </form>
      </Card>

      {result && (
        <ResultCard>
          <div className="border-b border-border pb-3">
            <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
              Estimated borrowing power
            </p>
            <p className="tnum text-[28px] font-semibold leading-tight text-success">
              {AUD(result.maximum)}
            </p>
            <p className="text-[13px] text-muted-foreground">
              Conservative estimate: <span className="tnum font-medium text-foreground">{AUD(result.conservative)}</span>
            </p>
          </div>
          <div className="divide-y divide-border">
            <ResultRow
              label={`Assessed at ${pct(result.assessmentRate, 2)} (your rate ${pct(rate, 2)} + 3% APRA buffer)`}
              value=""
            />
            <ResultRow label="Monthly repayment at maximum" value={AUD(result.monthlyAtMax)} />
            <ResultRow label="Estimated net monthly income" value={AUD(result.netMonthly)} />
            <ResultRow label="Total monthly commitments" value={AUD(result.totalCommitments)} />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
            This is an estimate only. Your actual borrowing capacity depends on your lender's
            credit policy, living expenses assessment, and full credit history. Speak to a mortgage
            broker for a precise figure.
          </p>
        </ResultCard>
      )}
    </div>
  );
};

export default BorrowingPower;
