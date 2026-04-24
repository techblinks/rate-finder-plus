import { ReactNode } from "react";

interface HeroResultCardProps {
  label: string;
  value: string;
  subLabel?: string;
  badge?: string;
  variant?: "default" | "stamp" | "extra";
  children?: ReactNode;
}

const variantClass = {
  default: "",
  stamp: "stamp-variant",
  extra: "extra-variant",
};

const HeroResultCard = ({ label, value, subLabel, badge = "LIVE", variant = "default", children }: HeroResultCardProps) => (
  <div className={`navy-hero ${variantClass[variant]} rounded-3xl shadow-xl p-8 md:p-9 text-white relative animate-scale-in`}>
    <div className="relative z-10 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 pr-16">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45">
          {label}
        </p>
        <p className="font-display tabular-nums leading-none text-white text-5xl md:text-[64px] break-words">
          {value}
        </p>
        {subLabel && <p className="mt-2 text-[13px] font-medium text-white/40">{subLabel}</p>}
      </div>
      {badge && (
        <div className="absolute right-0 top-0 flex items-center gap-1.5 rounded-full border border-success/30 bg-success/15 px-2.5 py-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-live-pulse" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-success">{badge}</span>
        </div>
      )}
    </div>
    {children && <div className="relative z-10 mt-6 border-t border-white/10 pt-6">{children}</div>}
  </div>
);

export default HeroResultCard;
