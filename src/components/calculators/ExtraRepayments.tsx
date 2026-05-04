import { useState } from "react";
import { compareExtraRepayments, formatYearsMonths, type ExtraComparison } from "@/lib/calc/extraRepayments";
import { AUD, monthName } from "@/lib/format";
import { Card, Field, NumberInput, PrimaryButton, ResultCard } from "@/components/ui-kit";
import BarCompare from "@/components/BarCompare";

const ExtraRepayments = () => {
  const [balance, setBalance] = useState(500000);
  const [rate, setRate] = useState(5.5);
  const [term, setTerm] = useState(25);
  const [extra, setExtra] = useState(500);
  const [result, setResult] = useState<ExtraComparison | null>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(compareExtraRepayments(balance, rate, term, extra));
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handle} className="space-y-4">
          <Field label="Current loan balance">
            <NumberInput value={balance} onChange={setBalance} min={0} step={1000} prefix="$" />
          </Field>
          <Field label="Interest rate">
            <NumberInput value={rate} onChange={setRate} min={0} max={20} step={0.01} suffix="%" />
          </Field>
          <Field label="Remaining term">
            <NumberInput value={term} onChange={setTerm} min={1} max={30} step={1} suffix="yr" />
          </Field>
          <Field label="Extra per month">
            <NumberInput value={extra} onChange={setExtra} min={0} step={50} prefix="$" />
          </Field>
          <PrimaryButton>Calculate</PrimaryButton>
        </form>
      </Card>

      {result && (
        <ResultCard>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-[14px]">
              <thead>
                <tr className="text-left text-[13px] text-muted-foreground">
                  <th className="py-2 font-semibold"></th>
                  <th className="py-2 font-semibold">Without extra</th>
                  <th className="py-2 font-semibold">With {AUD(extra)} extra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 text-muted-foreground">Loan paid off</td>
                  <td className="py-2 tnum">{monthName(result.base.payoffDate)}</td>
                  <td className="py-2 tnum">{monthName(result.withExtra.payoffDate)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Time saved</td>
                  <td className="py-2 text-muted-foreground">—</td>
                  <td className="py-2 tnum text-success font-semibold">
                    {result.monthsSaved > 0 ? formatYearsMonths(result.monthsSaved) : "—"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Total interest</td>
                  <td className="py-2 tnum">{AUD(result.base.totalInterest)}</td>
                  <td className="py-2 tnum">{AUD(result.withExtra.totalInterest)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Interest saved</td>
                  <td className="py-2 text-muted-foreground">—</td>
                  <td className="py-2 tnum text-success font-semibold">
                    {AUD(result.interestSaved)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5">
            <BarCompare
              caption="Total interest comparison"
              a={{ label: "Without extra", value: result.base.totalInterest }}
              b={{ label: "With extra", value: result.withExtra.totalInterest }}
            />
          </div>
        </ResultCard>
      )}
    </div>
  );
};

export default ExtraRepayments;
