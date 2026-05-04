import { useState } from "react";
import { calcStampDuty, STATES, type BuyerType, type StateCode, type StampDutyResult } from "@/lib/calc/stampDuty";
import { AUD } from "@/lib/format";
import { Card, Field, NumberInput, SelectInput, PrimaryButton, ResultRow, ResultCard } from "@/components/ui-kit";

const StampDuty = () => {
  const [value, setValue] = useState(700000);
  const [state, setState] = useState<StateCode>("NSW");
  const [buyer, setBuyer] = useState<BuyerType>("owner");
  const [result, setResult] = useState<StampDutyResult | null>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calcStampDuty(value, state, buyer));
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handle} className="space-y-4">
          <Field label="Property value">
            <NumberInput value={value} onChange={setValue} min={0} step={5000} prefix="$" />
          </Field>
          <Field label="State or territory">
            <SelectInput<StateCode>
              value={state}
              onChange={setState}
              options={STATES.map((s) => ({ value: s.code, label: `${s.code} — ${s.name}` }))}
            />
          </Field>
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
          <PrimaryButton>Calculate</PrimaryButton>
        </form>
      </Card>

      {result && (
        <ResultCard>
          <div className="border-b border-border pb-3">
            <p className="text-[13px] uppercase tracking-wide text-muted-foreground">
              Net stamp duty
            </p>
            <p className="tnum text-[28px] font-semibold leading-tight text-foreground">
              {AUD(result.netDuty)}
            </p>
          </div>
          <div className="divide-y divide-border">
            <ResultRow label="Base stamp duty" value={AUD(result.baseDuty)} />
            {result.fhbSaving > 0 && (
              <ResultRow
                label="First home buyer saving"
                value={`-${AUD(result.fhbSaving)}`}
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
            Stamp duty rates are indicative for 2026. Always confirm with your state revenue office
            before settlement.
          </p>
        </ResultCard>
      )}
    </div>
  );
};

export default StampDuty;
