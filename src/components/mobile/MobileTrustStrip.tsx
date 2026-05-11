import { ShieldCheck, RefreshCw, Lock } from "lucide-react";

/**
 * Mobile-only trust strip. Rendered under the calculator in CalculatorPageShell's
 * mobile branch. Desktop is unaffected.
 */
const MobileTrustStrip = () => (
  <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card px-2 py-3">
    <div className="flex flex-col items-center gap-1 text-center">
      <RefreshCw className="h-4 w-4 text-accent" />
      <span className="text-[10px] font-semibold leading-tight text-foreground">
        Updated for AU 2026
      </span>
    </div>
    <div className="flex flex-col items-center gap-1 text-center">
      <Lock className="h-4 w-4 text-accent" />
      <span className="text-[10px] font-semibold leading-tight text-foreground">
        No signup needed
      </span>
    </div>
    <div className="flex flex-col items-center gap-1 text-center">
      <ShieldCheck className="h-4 w-4 text-accent" />
      <span className="text-[10px] font-semibold leading-tight text-foreground">
        Lender-grade math
      </span>
    </div>
  </div>
);

export default MobileTrustStrip;
