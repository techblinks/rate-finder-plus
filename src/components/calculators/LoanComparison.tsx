import { useState } from "react";
import { compareLoans, type LoanComparison } from "@/lib/calc/loanComparison";
import { AUD } from "@/lib/format";
import { Card, Field, NumberInput, PrimaryButton, ResultCard } from "@/components/ui-kit";
import BarCompare from "@/components/BarCompare";

interface Scenario {
  amount: number;
  rate: number;
  term: number;
  fees: number;
}

const ScenarioFields = ({
  label,
  s,
  setS,
}: {
  label: string;
  s: Scenario;
  setS: (s: Scenario) => void;
}) => (
  <div className="space-y-3">
    <h3 className="text-[14px] font-semibold text-foreground">{label}</h3>
    <Field label="Loan amount">
      <NumberInput value={s.amount} onChange={(v) => setS({ ...s, amount: v })} min={0} step={1000} prefix="$" />
    </Field>
    <Field label="Interest rate">
      <NumberInput value={s.rate} onChange={(v) => setS({ ...s, rate: v })} min={0} max={20} step={0.01} suffix="%" />
    </Field>
    <Field label="Loan term">
      <NumberInput value={s.term} onChange={(v) => setS({ ...s, term: v })} min={1} max={30} step={1} suffix="yr" />
    </Field>
    <Field label="Upfront fees">
      <NumberInput value={s.fees} onChange={(v) => setS({ ...s, fees: v })} min={0} step={50} prefix="$" />
    </Field>
  </div>
);

const LoanComparisonCalc = () => {
  const [a, setA] = useState<Scenario>({ amount: 650000, rate: 5.5, term: 30, fees: 0 });
  const [b, setB] = useState<Scenario>({ amount: 650000, rate: 5.99, term: 30, fees: 0 });
  const [result, setResult] = useState<LoanComparison | null>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(
      compareLoans(
        { amount: a.amount, ratePct: a.rate, termYears: a.term, upfrontFees: a.fees, label: "Loan A" },
        { amount: b.amount, ratePct: b.rate, termYears: b.term, upfrontFees: b.fees, label: "Loan B" },
      ),
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handle} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ScenarioFields label="Loan A" s={a} setS={setA} />
            <ScenarioFields label="Loan B" s={b} setS={setB} />
          </div>
          <PrimaryButton>Compare</PrimaryButton>
        </form>
      </Card>

      {result && (
        <ResultCard>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[14px]">
              <thead>
                <tr className="text-left text-[13px] text-muted-foreground">
                  <th className="py-2 font-semibold"></th>
                  <th className="py-2 font-semibold">Loan A</th>
                  <th className="py-2 font-semibold">Loan B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 text-muted-foreground">Monthly repayment</td>
                  <td className="py-2 tnum">{AUD(result.a.monthly)}</td>
                  <td className="py-2 tnum">{AUD(result.b.monthly)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Total repaid</td>
                  <td className="py-2 tnum">{AUD(result.a.totalRepaid)}</td>
                  <td className="py-2 tnum">{AUD(result.b.totalRepaid)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Total interest</td>
                  <td className="py-2 tnum">{AUD(result.a.totalInterest)}</td>
                  <td className="py-2 tnum">{AUD(result.b.totalInterest)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Upfront fees</td>
                  <td className="py-2 tnum">{AUD(a.fees)}</td>
                  <td className="py-2 tnum">{AUD(b.fees)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">True cost</td>
                  <td className="py-2 tnum font-semibold">{AUD(result.a.trueCost)}</td>
                  <td className="py-2 tnum font-semibold">{AUD(result.b.trueCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5 rounded-md bg-surface p-4">
            {result.winner === "tie" ? (
              <p className="text-[14px] font-semibold text-foreground">
                Both loans have the same true cost.
              </p>
            ) : (
              <p className="text-[14px] font-semibold text-success">
                Winner: Loan {result.winner.toUpperCase()} saves you{" "}
                <span className="tnum">{AUD(result.totalDiff)}</span> over the loan term.
              </p>
            )}
          </div>
          <div className="mt-5">
            <BarCompare
              caption="Total interest"
              a={{ label: "Loan A", value: result.a.totalInterest }}
              b={{ label: "Loan B", value: result.b.totalInterest }}
            />
          </div>
        </ResultCard>
      )}
    </div>
  );
};

export default LoanComparisonCalc;
