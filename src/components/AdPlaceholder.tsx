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
  <div
    className={`flex flex-col items-center justify-center border border-border bg-muted/30 rounded-lg text-muted-foreground ${className}`}
    role="complementary"
    aria-label="Advertisement"
  >
    <span className="text-[10px] uppercase tracking-widest opacity-50 mb-1">{zoneConfig[zone].label}</span>
    <span className="text-xs opacity-30">{zoneConfig[zone].size}</span>
  </div>
);

export default AdPlaceholder;

export const AffiliateCTA = ({ countryName, symbol }: { countryName: string; symbol: string }) => (
  <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-5 my-6">
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-accent/10 p-2 shrink-0">
        <ExternalLink className="h-5 w-5 text-accent" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground text-sm mb-1">
          Compare Live {countryName} Rates
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          See today's best mortgage and loan rates from top {countryName} lenders. Updated daily.
        </p>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
          See Live Rates
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
    <p className="text-[10px] text-muted-foreground mt-3 opacity-60">
      Sponsored — We may receive compensation from partners.
    </p>
  </div>
);

export const TrustDisclaimer = () => (
  <div className="rounded-lg bg-muted/50 border border-border p-4 my-8">
    <p className="text-xs text-muted-foreground leading-relaxed">
      <strong className="text-foreground">Important Disclaimer:</strong> ZuneCalculator.com provides free financial calculation tools for informational purposes only. We are not a financial institution, bank, or licensed advisor. We do not provide financial services, credit, loans, or investment advice. Results are estimates and should not replace professional financial guidance. We may receive compensation from third-party partners when you click affiliate links. Always consult a qualified financial advisor before making financial decisions.
    </p>
  </div>
);
