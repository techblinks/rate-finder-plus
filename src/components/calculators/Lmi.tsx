import { useMemo, useState } from "react";
import { calcLmi } from "@/lib/calc/lmi";
import { AUD, pct } from "@/lib/format";
import { Card, ResultCard, ResultRow } from "@/components/ui-kit";
import RangeField from "@/components/RangeField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";

const Lmi = () => {
  const [propertyValue, setPropertyValue] = useState(700000);
  const [deposit, setDeposit] = useState(70000);
  const [term, setTerm] = useState(30);
  const [rate, setRate] = useState(5.5);

  // clamp deposit to property value
  const safeDeposit = Math.min(deposit, propertyValue);

  const dValue = useDebouncedValue(propertyValue);
  const dDep = useDebouncedValue(safeDeposit);
  const dTerm = useDebouncedValue(term);
  const dRate = useDebouncedValue(rate);

  const result = useMemo(
    () => calcLmi(Math.max(0, dValue), Math.max(0, dDep), Math.max(1, dTerm), Math.max(0, dRate)),
    [dValue, dDep, dTerm, dRate],
  );

  useDebouncedCalculate("lmi", {
    property_value: dValue,
    deposit: dDep,
    term: dTerm,
    rate: dRate,
    lvr: Math.round(result.lvr * 10) / 10,
    premium: Math.round(result.lmiCost),
  });

  const lvrColor = result.lvr > 80 ? "text-destructive" : "text-success";
  const extraDepositNeeded = Math.max(0, result.depositFor20 - safeDeposit);

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <RangeField label="Property value" value={propertyValue} onChange={setPropertyValue} min={100000} max={3000000} step={5000} prefix="$" />
          <RangeField label="Deposit amount" value={safeDeposit} onChange={setDeposit} min={0} max={propertyValue} step={5000} prefix="$" />
          <RangeField label="Loan term" value={term} onChange={setTerm} min={5} max={30} step={1} suffix="yr" />
          <RangeField label="Interest rate" value={rate} onChange={setRate} min={1} max={15} step={0.05} suffix="%" />
        </div>
      </Card>

      <ResultCard>
        <div className="border-b border-border pb-3">
          <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
            Loan to value ratio (LVR)
          </p>
          <p className={`tnum text-[28px] font-semibold leading-tight ${lvrColor}`}>
            {pct(result.lvr, 1)}
          </p>
          <div
            className={`mt-2 inline-block rounded-md px-3 py-1 text-[13px] font-semibold ${
              result.required ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
            }`}
          >
            LMI required: {result.required ? "YES" : "NO"}
          </div>
        </div>

        <div className="divide-y divide-border">
          <ResultRow label="Loan amount" value={AUD(result.loanAmount)} />
          {result.required && (
            <>
              <ResultRow label="LMI estimate" value={AUD(result.lmiCost)} />
              <ResultRow label="Total loan (incl LMI)" value={AUD(result.totalLoan)} />
              <ResultRow label="Monthly repayment" value={AUD(result.monthlyRepayment)} />
            </>
          )}
        </div>

        {result.required ? (
          <p className="mt-4 rounded-md bg-surface p-3 text-[13px] leading-relaxed text-foreground">
            Saving an extra <span className="font-semibold tnum">{AUD(extraDepositNeeded)}</span> would
            bring your deposit to 20% ({AUD(result.depositFor20)}), eliminating LMI and saving{" "}
            <span className="font-semibold tnum text-success">{AUD(result.lmiCost)}</span>.
          </p>
        ) : (
          <p className="mt-4 rounded-md bg-success/10 p-3 text-[13px] font-medium text-success">
            Your deposit is above 20%. No LMI required.
          </p>
        )}

        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
          LMI estimates are indicative. Actual costs depend on your lender and insurer (Helia or QBE).
        </p>
      </ResultCard>
    </div>
  );
};

export default Lmi;
