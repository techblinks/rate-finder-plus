import { useMemo, useState } from "react";
import { calcHecsBorrowing, HECS_BRACKETS_2025_26, buildHecsTimeline } from "@/lib/calc/hecsBorrowing";
import { AUD, pct } from "@/lib/format";
import { Card, ResultCard, ResultRow } from "@/components/ui-kit";
import RangeField from "@/components/RangeField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import ResultActions from "@/components/ResultActions";
import ShareResult from "@/components/ShareResult";

const HecsBorrowingPower = () => {
  const [income, setIncome] = useState(95000);
  const [hecs, setHecs] = useState(28000);
  const [rate, setRate] = useState(6.0);

  const dIncome = useDebouncedValue(income);
  const dHecs = useDebouncedValue(hecs);
  const dRate = useDebouncedValue(rate);

  const result = useMemo(
    () => calcHecsBorrowing({ grossIncome: dIncome, hecsBalance: dHecs, ratePct: dRate }),
    [dIncome, dHecs, dRate],
  );

  const timeline = useMemo(
    () => buildHecsTimeline(dIncome, dHecs),
    [dIncome, dHecs],
  );
  const totalRepaid = timeline.length ? timeline[timeline.length - 1].cumulativeRepaid : 0;

  useDebouncedCalculate("hecs_borrowing_power", {
    income: dIncome,
    hecs: dHecs,
    rate: dRate,
    borrowing_power: Math.round(result.borrowingPower),
    hecs_impact: Math.round(result.hecsImpact),
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <RangeField
            label="Gross annual income"
            value={income}
            onChange={setIncome}
            min={0}
            max={500000}
            step={1000}
            prefix="$"
          />
          <RangeField
            label="HECS / HELP balance"
            value={hecs}
            onChange={setHecs}
            min={0}
            max={200000}
            step={500}
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
            hint="Adds 3% APRA buffer for serviceability assessment"
          />
        </div>
      </Card>

      <ResultCard>
        <div className="border-b border-border pb-3">
          <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
            Estimated borrowing power
          </p>
          <p className="tnum text-[28px] font-semibold leading-tight text-accent">
            {AUD(result.borrowingPower)}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Assessed at {pct(result.assessmentRate, 2)} ({pct(rate, 2)} + 3% APRA buffer) over 30 years.
          </p>
        </div>

        <div className="divide-y divide-border">
          <ResultRow
            label="HECS repayment rate"
            value={result.hecsRate === 0 ? "0% (below threshold)" : pct(result.hecsRate * 100, 1)}
          />
          <ResultRow label="HECS annual repayment" value={AUD(result.hecsAnnual)} />
          <ResultRow label="HECS monthly repayment" value={AUD(result.hecsMonthly)} />
          {result.yearsToClear > 0 && (
            <ResultRow
              label="Years to clear HECS (at this income)"
              value={`~${result.yearsToClear} yr`}
            />
          )}
          <ResultRow
            label="Net monthly income (after tax & HECS)"
            value={AUD(result.netMonthlyAfterHecs)}
          />
          <ResultRow
            label="Borrowing power without HECS"
            value={AUD(result.borrowingPowerWithoutHecs)}
          />
        </div>

        {result.hecsImpact > 0 && (
          <div className="mt-4 rounded-md bg-warning/10 p-3 text-[13px] leading-relaxed text-foreground">
            HECS reduces your borrowing power by{" "}
            <span className="font-semibold tnum text-warning">{AUD(result.hecsImpact)}</span>.
            Paying off your HECS balance could unlock additional capacity with most lenders.
          </div>
        )}

        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
          Estimate only. Lenders treat HECS differently — some include the full repayment in
          serviceability, others apply discounted treatments. Confirm with a broker.
        </p>
        <ResultActions calculator="hecs_borrowing_power" />
        <ShareResult
          calculator="hecs_borrowing_power"
          params={{
            income: Math.round(income),
            hecs: Math.round(hecs),
            rate: rate.toFixed(2),
          }}
          shareText={`My borrowing power with HECS: ${AUD(result.borrowingPower)}`}
        />
      </ResultCard>

      <Card>
        <h3 className="mb-3 text-[15px] font-semibold">2025-26 HECS repayment thresholds</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 font-semibold">Income</th>
                <th className="py-2 font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {HECS_BRACKETS_2025_26.map((b) => (
                <tr key={b.min}>
                  <td className="py-2 tnum">
                    {b.min === 0
                      ? `Below ${AUD(54435)}`
                      : b.max
                        ? `${AUD(b.min)} – ${AUD(b.max)}`
                        : `${AUD(b.min)}+`}
                  </td>
                  <td className="py-2 tnum font-medium">{(b.rate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HecsBorrowingPower;
