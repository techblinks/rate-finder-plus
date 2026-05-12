import { useMemo, useState } from "react";
import { compareLoans } from "@/lib/calc/loanComparison";
import { AUD } from "@/lib/format";
import { Card, Field, NumberInput, ResultCard } from "@/components/ui-kit";
import BarCompare from "@/components/BarCompare";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import { usePublishMobileResult } from "@/lib/mobileResult";
import { shareCurrent } from "@/lib/shareCurrent";
import { useCalcPersist } from "@/lib/calcPersist";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileRestoreChip from "@/components/mobile/MobileRestoreChip";
import MobileCollapse from "@/components/mobile/MobileCollapse";
import MobileInsightBar from "@/components/mobile/MobileInsightBar";
import ResultActions from "@/components/ResultActions";
import ShareResult from "@/components/ShareResult";

interface ScenarioInput {
  rate: number;
  term: number;
  fees: number;
}

const ScenarioCol = ({
  label,
  s,
  setS,
}: {
  label: string;
  s: ScenarioInput;
  setS: (s: ScenarioInput) => void;
}) => (
  <div className="space-y-3">
    <h3 className="text-[14px] font-semibold text-foreground">{label}</h3>
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
  const [amount, setAmount] = useState(650000);
  const [a, setA] = useState<ScenarioInput>({ rate: 5.75, term: 30, fees: 0 });
  const [b, setB] = useState<ScenarioInput>({ rate: 6.24, term: 30, fees: 800 });
  const isMobile = useIsMobile();

  const dAmount = useDebouncedValue(amount);
  const dA = useDebouncedValue(a);
  const dB = useDebouncedValue(b);

  const result = useMemo(
    () =>
      compareLoans(
        { amount: dAmount, ratePct: dA.rate, termYears: dA.term, upfrontFees: dA.fees, label: "Loan A" },
        { amount: dAmount, ratePct: dB.rate, termYears: dB.term, upfrontFees: dB.fees, label: "Loan B" },
      ),
    [dAmount, dA, dB],
  );

  useDebouncedCalculate("loan_comparison", {
    amount: dAmount,
    a_rate: dA.rate,
    a_term: dA.term,
    a_fees: dA.fees,
    b_rate: dB.rate,
    b_term: dB.term,
    b_fees: dB.fees,
    monthly_diff: Math.round(result.a.monthly - result.b.monthly),
    interest_diff: Math.round(result.a.totalInterest - result.b.totalInterest),
  });

  const monthlyDiff = Math.abs(result.a.monthly - result.b.monthly);
  const totalRepaidDiff = Math.abs(result.a.totalRepaid - result.b.totalRepaid);
  const interestDiff = Math.abs(result.a.totalInterest - result.b.totalInterest);
  const cheaperLabel = result.a.totalInterest <= result.b.totalInterest ? "Loan A" : "Loan B";

  usePublishMobileResult({
    label: `${cheaperLabel} saves`,
    value: AUD(interestDiff),
    sub: `${AUD(monthlyDiff)}/mo difference`,
    onShare: () =>
      shareCurrent({
        calculator: "loan_comparison",
        title: "Loan comparison — Calcy",
        text: `${cheaperLabel} saves ${AUD(interestDiff)} in interest (${AUD(monthlyDiff)}/mo difference) on a ${AUD(amount)} loan.`,
      }),
  });

  const persistState = useMemo(() => ({ amount, a, b }), [amount, a, b]);
  const { showRestore, restore, dismiss } = useCalcPersist(
    "loan_comparison",
    persistState,
    (s) => { setAmount(s.amount); setA(s.a); setB(s.b); },
  );

  const tableNode = (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-[14px]">
        <thead>
          <tr className="text-left text-[13px] text-muted-foreground">
            <th className="py-2 font-semibold"></th>
            <th className="py-2 font-semibold">Loan A</th>
            <th className="py-2 font-semibold">Loan B</th>
            <th className="py-2 font-semibold">Difference</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr>
            <td className="py-2 text-muted-foreground">Monthly repayment</td>
            <td className="py-2 tnum">{AUD(result.a.monthly)}</td>
            <td className="py-2 tnum">{AUD(result.b.monthly)}</td>
            <td className="py-2 text-[13px]">
              {result.a.monthly < result.b.monthly ? "Loan A" : "Loan B"} saves {AUD(monthlyDiff)}/mo
            </td>
          </tr>
          <tr>
            <td className="py-2 text-muted-foreground">Total repaid</td>
            <td className="py-2 tnum">{AUD(result.a.totalRepaid)}</td>
            <td className="py-2 tnum">{AUD(result.b.totalRepaid)}</td>
            <td className="py-2 text-[13px]">
              {result.a.totalRepaid < result.b.totalRepaid ? "Loan A" : "Loan B"} saves {AUD(totalRepaidDiff)}
            </td>
          </tr>
          <tr>
            <td className="py-2 text-muted-foreground">Total interest</td>
            <td className="py-2 tnum">{AUD(result.a.totalInterest)}</td>
            <td className="py-2 tnum">{AUD(result.b.totalInterest)}</td>
            <td className="py-2 text-[13px]">
              {result.a.totalInterest < result.b.totalInterest ? "Loan A" : "Loan B"} saves {AUD(interestDiff)}
            </td>
          </tr>
          <tr>
            <td className="py-2 text-muted-foreground">Upfront fees</td>
            <td className="py-2 tnum">{AUD(a.fees)}</td>
            <td className="py-2 tnum">{AUD(b.fees)}</td>
            <td className="py-2"></td>
          </tr>
          <tr>
            <td className="py-2 text-muted-foreground">True total cost</td>
            <td className="py-2 tnum font-semibold">{AUD(result.a.trueCost)}</td>
            <td className="py-2 tnum font-semibold">{AUD(result.b.trueCost)}</td>
            <td className="py-2 text-[13px]">
              {result.winner === "tie"
                ? "Tie"
                : `Loan ${result.winner.toUpperCase()} saves ${AUD(result.totalDiff)}`}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const chartNode = (
    <BarCompare
      caption="Total interest"
      a={{ label: "Loan A", value: result.a.totalInterest }}
      b={{ label: "Loan B", value: result.b.totalInterest }}
    />
  );

  return (
    <div className="space-y-6">
      <MobileRestoreChip show={showRestore} onRestore={restore} onDismiss={dismiss} />
      <Card>
        <div className="space-y-5">
          <Field label="Loan amount (shared)">
            <NumberInput value={amount} onChange={setAmount} min={0} step={1000} prefix="$" />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ScenarioCol label="Loan A" s={a} setS={setA} />
            <ScenarioCol label="Loan B" s={b} setS={setB} />
          </div>
        </div>
      </Card>

      {isMobile && (() => {
        const rateDiff = Math.abs(dA.rate - dB.rate);
        const feeDiff = Math.abs((dA.fees ?? 0) - (dB.fees ?? 0));
        const termDiff = Math.abs(dA.term - dB.term);
        let msg: string;
        let tone: "info" | "success" = "success";
        if (result.winner === "tie") {
          tone = "info";
          msg = "These loans cost about the same — try changing the rate, fees or term on either side.";
        } else if (rateDiff >= 0.1) {
          msg = `Loan ${result.winner.toUpperCase()} wins by ${AUD(result.totalDiff)}. The rate gap (${rateDiff.toFixed(2)}%) is the main driver — adjust “Interest rate” to test sensitivity.`;
        } else if (feeDiff >= 200) {
          msg = `Loan ${result.winner.toUpperCase()} wins by ${AUD(result.totalDiff)} — mostly from lower fees. Tweak “Fees” to compare lender offers.`;
        } else if (termDiff >= 1) {
          msg = `Loan ${result.winner.toUpperCase()} wins by ${AUD(result.totalDiff)} — the term difference matters. Match terms to compare like-for-like.`;
        } else {
          msg = `Loan ${result.winner.toUpperCase()} saves ${AUD(result.totalDiff)} over ${dA.term} years — change rate, term or fees to stress-test.`;
        }
        return <MobileInsightBar tone={tone} message={msg} />;
      })()}

      <ResultCard>
        {isMobile ? (
          <MobileCollapse title="Side-by-side breakdown" hint="Full numeric comparison">
            {tableNode}
          </MobileCollapse>
        ) : (
          tableNode
        )}

        {result.winner !== "tie" && (
          <div
            className="mt-5 rounded-md p-4 text-[14px] font-semibold"
            style={{ background: "#EAF3DE", color: "#27500A" }}
          >
            Loan {result.winner.toUpperCase()} saves you {AUD(result.totalDiff)} over {dA.term} years
          </div>
        )}

        {isMobile ? (
          <div className="mt-5">
            <MobileCollapse title="Interest comparison chart">{chartNode}</MobileCollapse>
          </div>
        ) : (
          <div className="mt-5">{chartNode}</div>
        )}

        {!isMobile && <ResultActions calculator="loan_comparison" />}
        <ShareResult
          calculator="loan_comparison"
          params={{
            amount: Math.round(amount),
            ar: a.rate.toFixed(2),
            at: a.term,
            af: Math.round(a.fees),
            br: b.rate.toFixed(2),
            bt: b.term,
            bf: Math.round(b.fees),
          }}
          shareText={
            result.winner === "tie"
              ? "I compared two home loans on Calcy"
              : `Loan ${result.winner.toUpperCase()} saves ${AUD(result.totalDiff)} vs the alternative`
          }
        />
      </ResultCard>
    </div>
  );
};

export default LoanComparisonCalc;
