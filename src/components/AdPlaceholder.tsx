import { ExternalLink } from "lucide-react";

interface AdPlaceholderProps {
  zone: "top-banner" | "sidebar" | "in-content" | "post-calculator" | "sticky-sidebar";
  className?: string;
}

const zoneConfig: Record<AdPlaceholderProps["zone"], { label: string; size: string }> = {
  "top-banner": { label: "Sponsored", size: "728×90" },
  sidebar: { label: "Sponsored", size: "300×250" },
  "in-content": { label: "Sponsored", size: "728×90" },
  "post-calculator": { label: "Sponsored", size: "728×90" },
  "sticky-sidebar": { label: "Sponsored", size: "300×600" },
};

const AdPlaceholder = ({ zone, className = "" }: AdPlaceholderProps) => (
  <div className={`ad-slot-card text-muted-foreground ${className}`} role="complementary" aria-label="Advertisement">
    <span className="relative z-10 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{zoneConfig[zone].label}</span>
    <span className="relative z-10 text-[10px] text-muted-foreground/50">{zoneConfig[zone].size}</span>
  </div>
);

export default AdPlaceholder;

export const AffiliateCTA = ({ countryName }: { countryName: string; symbol: string }) => (
  <div className="relative my-8 overflow-hidden rounded-3xl bg-navy p-8 text-center text-white shadow-xl md:p-10">
    <div className="absolute left-1/2 top-[30%] h-px w-3/5 -translate-x-1/2 bg-white/5" />
    <div className="relative z-10 mx-auto max-w-lg">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">INDEPENDENT CALCULATOR TOOL</p>
      <h3 className="font-display text-3xl text-white">Find Your Best Rate</h3>
      <p className="my-4 text-sm text-white/45">Compare rates from 30+ lenders. Free. No credit check.</p>
      <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary-glow sm:w-auto">
        Compare Rates →
        <ExternalLink className="h-4 w-4" />
      </button>
      <p className="mt-4 text-xs text-white/25">Sponsored marketplace for {countryName} borrowers.</p>
    </div>
  </div>
);

export const TrustDisclaimer = () => (
  <div className="my-8 rounded-xl border border-border bg-card p-4 shadow-sm">
    <p className="text-xs leading-relaxed text-muted-foreground">
      <strong className="text-foreground">Important Disclaimer:</strong> Zune Calculator provides financial calculation tools for informational purposes only. We are not a bank, lender, broker, or licensed advisor. Results are estimates and should not replace professional financial guidance.
    </p>
  </div>
);
