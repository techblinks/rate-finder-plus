import { Sparkles, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "info" | "success" | "warn";

interface Props {
  message: ReactNode;
  tone?: Tone;
  className?: string;
}

const ICONS: Record<Tone, JSX.Element> = {
  info: <Sparkles className="h-4 w-4 flex-shrink-0" aria-hidden />,
  success: <TrendingDown className="h-4 w-4 flex-shrink-0" aria-hidden />,
  warn: <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden />,
};

const TONE_CLS: Record<Tone, string> = {
  info: "border-accent/30 bg-accent-light text-foreground [&_svg]:text-accent",
  success: "border-success/30 bg-success/10 text-foreground [&_svg]:text-success",
  warn: "border-warning/40 bg-warning/10 text-foreground [&_svg]:text-warning-foreground",
};

/**
 * Generic mobile-only one-line nudge / insight bar.
 * Used between the inputs and the heavy result/chart sections to surface
 * the most actionable next step.
 */
const MobileInsightBar = ({ message, tone = "info", className = "" }: Props) => (
  <div
    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] leading-snug ${TONE_CLS[tone]} ${className}`}
  >
    {ICONS[tone]}
    <span>{message}</span>
  </div>
);

export default MobileInsightBar;
export { TrendingUp };
