import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { calcStampDuty, STATES, type BuyerType, type StateCode } from "@/lib/calc/stampDuty";
import { AUD } from "@/lib/format";
import { Card, Field, SelectInput, ResultRow, ResultCard } from "@/components/ui-kit";
import RangeField from "@/components/RangeField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDebouncedCalculate } from "@/lib/useDebouncedCalculate";
import ResultActions from "@/components/ResultActions";
import ShareResult from "@/components/ShareResult";

interface StampDutyProps {
  lockedState?: StateCode;
}

const StampDuty = ({ lockedState }: StampDutyProps) => {
  const [value, setValue] = useState(700000);
  const [state, setState] = useState<StateCode>(lockedState ?? "NSW");
  const [buyer, setBuyer] = useState<BuyerType>("owner");

  useEffect(() => {
    if (lockedState) setState(lockedState);
  }, [lockedState]);

  const dValue = useDebouncedValue(value);
  const result = useMemo(() => calcStampDuty(Math.max(0, dValue), state, buyer), [dValue, state, buyer]);

  useDebouncedCalculate("stamp_duty", {
    state,
    buyer,
    value: dValue,
    net_duty: Math.round(result.netDuty),
  });

  const exempt = buyer === "fhb" && result.netDuty === 0;
  const stateName = STATES.find((s) => s.code === state)?.name ?? state;

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-5">
          <RangeField
            label="Property value"
            value={value}
            onChange={setValue}
            min={100000}
            max={3000000}
            step={5000}
            prefix="$"
          />
          {lockedState ? (
            <Field label="State or territory">
              <div className="flex items-center justify-between rounded-md border border-border bg-surface px-3.5 py-2.5">
                <span className="text-[15px] font-medium text-foreground">
                  {state} — {stateName}
                </span>
                <Link to="/stamp-duty-calculator" className="text-[13px] font-medium link-accent">
                  Change state →
                </Link>
              </div>
            </Field>
          ) : (
            <Field label="State or territory">
              <SelectInput<StateCode>
                value={state}
                onChange={setState}
                options={STATES.map((s) => ({ value: s.code, label: `${s.code} — ${s.name}` }))}
              />
            </Field>
          )}
          <Field label="Buyer type">
            <SelectInput<BuyerType>
              value={buyer}
              onChange={setBuyer}
              options={[
                { value: "owner", label: "Owner-Occupier" },
                { value: "fhb", label: "First Home Buyer" },
                { value: "investor", label: "Investor" },
              ]}
            />
          </Field>
        </div>
      </Card>

      <ResultCard>
        <div className="border-b border-border pb-3">
          <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
            Net stamp duty payable
          </p>
          <p
            className={`tnum text-[28px] font-semibold leading-tight ${
              exempt ? "text-success" : "text-foreground"
            }`}
          >
            {AUD(result.netDuty)} {exempt && <span className="text-[16px]">— Exempt!</span>}
          </p>
        </div>
        <div className="divide-y divide-border">
          <ResultRow label="Stamp duty" value={AUD(result.baseDuty)} />
          {result.fhbSaving > 0 && (
            <ResultRow
              label="First home buyer saving"
              value={`−${AUD(result.fhbSaving)}`}
              positive
            />
          )}
        </div>
        <h3 className="mt-5">Estimated additional costs</h3>
        <div className="divide-y divide-border">
          <ResultRow label="Legal / conveyancing" value={`~${AUD(result.legal)}`} />
          <ResultRow label="Building inspection" value={`~${AUD(result.building)}`} />
          <ResultRow label="Pest inspection" value={`~${AUD(result.pest)}`} />
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <ResultRow
            label="Total estimated upfront costs"
            value={AUD(result.totalUpfront)}
            emphasis
          />
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
          Stamp duty rates are indicative for 2026. Confirm with your state revenue office before
          settlement. First home buyer thresholds subject to change.
        </p>
              <ResultActions calculator="stamp_duty" />
        <ShareResult
          calculator="stamp_duty"
          params={{ value: Math.round(value), state, buyer }}
          shareText={`I calculated my stamp duty at ${AUD(result.netDuty)} (${state})`}
        />
      </ResultCard>
    </div>
  );
};

export default StampDuty;
