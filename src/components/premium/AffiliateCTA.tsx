import { ArrowRight } from "lucide-react";

interface AffiliateCTAProps {
  countryName: string;
  symbol: string;
  variant?: "default" | "compact";
}

const AffiliateCTA = ({ countryName, variant = "default" }: AffiliateCTAProps) => {
  const isCompact = variant === "compact";
  return (
    <div className={`bg-navy rounded-3xl shadow-xl text-white relative overflow-hidden my-6 ${
      isCompact ? "p-5" : "p-7 md:p-9"
    }`}>
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">
          INDEPENDENT CALCULATOR TOOL
        </p>
        <h3 className={`font-display font-bold text-white mb-2 leading-tight ${
          isCompact ? "text-xl" : "text-2xl md:text-3xl"
        }`}>
          Find Your Best Rate
        </h3>
        <p className="text-sm text-white/70 mb-5 max-w-md">
          Compare rates from 30+ lenders. Free. No credit check.
        </p>
        <button className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-glow">
          Compare Rates →
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <p className="text-[11px] text-white/40 mt-3">
          Free service · No obligation · Results in 60 seconds
        </p>
      </div>
    </div>
  );
};

export default AffiliateCTA;
