import { Info } from "lucide-react";

/**
 * Mandatory financial disclaimer for any page connecting users to 3rd party
 * providers or presenting product comparisons. Required by AU advertising
 * rules for financial product information.
 */
const FinancialDisclaimer = ({ className = "" }: { className?: string }) => (
  <aside
    role="note"
    aria-label="Financial disclaimer"
    className={`rounded-2xl border border-border bg-surface p-4 text-[12px] leading-relaxed text-muted-foreground ${className}`}
  >
    <div className="flex items-start gap-2">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
      <p>
        <strong className="text-foreground">Important:</strong> The information on
        this page is general in nature and does not consider your personal
        circumstances. Calcy is not a credit provider, broker or financial
        adviser. Product rates, fees, eligibility and grant amounts change
        frequently — confirm details directly with the relevant state revenue
        office or lender before making a financial decision. Where Calcy links
        to a third party, we may receive a referral fee; this does not affect
        the calculations shown.
      </p>
    </div>
  </aside>
);

export default FinancialDisclaimer;
