import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Native <details> wrapper styled as a card. Used on mobile to collapse
 * non-essential sections (advanced settings, charts, schedules, long-form
 * SEO content) without removing them from the DOM — keeps SEO/AEO intact.
 */
const MobileCollapse = ({ title, hint, defaultOpen = false, children, className = "" }: Props) => (
  <details
    className={`group overflow-hidden rounded-2xl border border-border bg-card ${className}`}
    open={defaultOpen}
  >
    <summary
      className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden"
    >
      <span className="flex flex-col">
        <span className="text-[14px] font-semibold text-foreground">{title}</span>
        {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
      </span>
      <ChevronDown
        className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        aria-hidden="true"
      />
    </summary>
    <div className="border-t border-border p-4">{children}</div>
  </details>
);

export default MobileCollapse;
