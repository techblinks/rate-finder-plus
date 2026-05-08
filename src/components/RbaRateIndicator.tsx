import { useRbaRates } from "@/hooks/useRbaRates";

interface RbaRateIndicatorProps {
  loanType: "owner" | "investor";
  onApply: (rate: number) => void;
}

const RbaRateIndicator = ({ loanType, onApply }: RbaRateIndicatorProps) => {
  const rbaRates = useRbaRates();
  return (
  <div className="rounded-lg border border-border bg-surface px-4 py-3 text-[13px]">
    <p className="mb-1.5 text-[12px] uppercase tracking-wide text-muted-foreground">
      RBA average rate — {rbaRates.lastUpdated}
    </p>
    <div className="space-y-1">
      <div
        className={`flex items-center justify-between gap-2 ${
          loanType === "owner" ? "font-semibold text-foreground" : "text-foreground"
        }`}
      >
        <span>Owner-occupier (P&amp;I): {rbaRates.ownerOccupier.toFixed(2)}%</span>
        <button
          type="button"
          onClick={() => onApply(rbaRates.ownerOccupier)}
          className="text-accent hover:underline"
        >
          Use this rate →
        </button>
      </div>
      <div
        className={`flex items-center justify-between gap-2 ${
          loanType === "investor" ? "font-semibold text-foreground" : "text-foreground"
        }`}
      >
        <span>Investor: {rbaRates.investor.toFixed(2)}%</span>
        <button
          type="button"
          onClick={() => onApply(rbaRates.investor)}
          className="text-accent hover:underline"
        >
          Use this rate →
        </button>
      </div>
    </div>
  </div>
  );
};

export default RbaRateIndicator;
