import { useRbaRates } from "@/hooks/useRbaRates";

interface RbaRateIndicatorProps {
  loanType: "owner" | "investor";
  onApply: (rate: number) => void;
}

const RbaRateIndicator = ({ loanType, onApply }: RbaRateIndicatorProps) => {
  const rbaRates = useRbaRates();
  const activeRate = loanType === "owner" ? rbaRates.ownerOccupier : rbaRates.investor;
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-[13px]">
      <span className="text-muted-foreground">
        RBA avg <span className="text-[11px]">({rbaRates.lastUpdated})</span>
      </span>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-foreground tnum">{activeRate.toFixed(2)}%</span>
        <button
          type="button"
          onClick={() => onApply(activeRate)}
          className="min-h-[44px] inline-flex items-center px-2 text-[12px] font-medium text-accent hover:underline"
        >
          Use →
        </button>
      </div>
    </div>
  );
};

export default RbaRateIndicator;
