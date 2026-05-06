import { useMemo, useState } from "react";
import { compareExtraRepayments, formatYearsMonths, type ExtraComparison } from "@/lib/calc/extraRepayments";
import { AUD, monthName } from "@/lib/format";
import { Card, ResultCard } from "@/components/ui-kit";
import RangeField from "@/components/RangeField";
import BarCompare from "@/components/BarCompare";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import ResultActions from "@/components/ResultActions";

const ExtraRepayments = () => {
  const [balance, setBalance] = useState(500000);
  const [rate, setRate] = useState(5.5);
  const [term, setTerm] = useState(25);
  const [extra, setExtra] = useState(500);

  const dBalance = useDebouncedValue(balance);
  const dRate = useDebouncedValue(rate);
  const dTerm = useDebouncedValue(term);
  const dExtra = useDebouncedValue(extra);

  const result: ExtraComparison = useMemo(
    () =>
      compareExtraRepayments(
        Math.max(0, dBalance),
        Math.max(0, dRate),
        Math.max(1, dTerm),
        Math.max(0, dExtra),
      ),
    [dBalance, dRate, dTerm, dExtra],
  );

  useDebouncedCalculate("extra_repayments", {
    balance: dBalance,
    rate: dRate,
    term: dTerm,
    extra: dExtra,
    months_saved: result.monthsSaved,
    interest_saved: Math.round(result.interestSaved),
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <RangeField label="Current loan balance" value={balance} onChange={setBalance} min={50000} max={2000000} step={5000} prefix="$" />
          <RangeField label="Interest rate" value={rate} onChange={setRate} min={1} max={15} step={0.05} suffix="%" />
          <RangeField label="Remaining term" value={term} onChange={setTerm} min={1} max={30} step={1} suffix="yr" />
          <RangeField label="Extra per month" value={extra} onChange={setExtra} min={0} max={5000} step={50} prefix="$" />
        </div>
      </Card>

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
                <td className="py-2 tnum text-success font-semibold">{AUD(result.interestSaved)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {extra > 0 && result.monthsSaved > 0 && (
          <p className="mt-4 text-[14px] leading-relaxed text-foreground">
            By paying <span className="font-semibold tnum">{AUD(extra)}</span> extra per month, you save{" "}
            <span className="font-semibold text-success tnum">{AUD(result.interestSaved)}</span> and pay off your
            loan <span className="font-semibold text-success">{formatYearsMonths(result.monthsSaved)}</span> earlier.
          </p>
        )}

        <div className="mt-5">
          <BarCompare
            caption="Total interest comparison"
            a={{ label: "Without extra", value: result.base.totalInterest }}
            b={{ label: "With extra", value: result.withExtra.totalInterest }}
          />
        </div>
              <ResultActions calculator="extra_repayments" />
      </ResultCard>
    </div>
  );
};

export default ExtraRepayments;
