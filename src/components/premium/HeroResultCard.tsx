import { ReactNode } from "react";

interface HeroResultCardProps {
  label: string;
  value: string;
  subLabel?: string;
  badge?: string;
  children?: ReactNode;
}

const HeroResultCard = ({ label, value, subLabel, badge = "Live", children }: HeroResultCardProps) => (
  <div className="navy-hero rounded-3xl shadow-xl p-7 md:p-8 text-white relative animate-scale-in">
    <div className="relative z-10 flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 mb-2">
          {label}
        </p>
        <p className="font-display font-bold tabular-nums leading-none text-gold text-[44px] md:text-[56px]">
          {value}
        </p>
        {subLabel && (
          <p className="text-sm text-white/70 mt-2">{subLabel}</p>
        )}
      </div>
      {badge && (
        <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 border border-white/10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-live-pulse" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">{badge}</span>
        </div>
      )}
    </div>
    {children && <div className="relative z-10 mt-6 pt-6 border-t border-white/10">{children}</div>}
  </div>
);

export default HeroResultCard;
