import { Printer, Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ResultActionsProps {
  /** Calculator name for analytics, e.g. "mortgage_repayment". */
  calculator: string;
  /** Optional pre-filled summary the email modal will use as the body. */
  emailSummary?: string;
  /** Called when the user clicks "Email me this" — opens the email modal. */
  onEmail?: () => void;
}

const ResultActions = ({ calculator, emailSummary, onEmail }: ResultActionsProps) => {
  const handlePrint = () => {
    trackEvent("print_result", { calculator });
    window.print();
  };

  const handleEmail = () => {
    trackEvent("email_result_open", { calculator });
    onEmail?.();
  };

  return (
    <div className="no-print mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
      <button
        type="button"
        onClick={handlePrint}
        className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
      >
        <Printer className="h-4 w-4" />
        Print result
      </button>
      {onEmail && (
        <button
          type="button"
          onClick={handleEmail}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
          data-email-summary={emailSummary ? "1" : undefined}
        >
          <Mail className="h-4 w-4" />
          Email me this
        </button>
      )}
    </div>
  );
};

export default ResultActions;
