import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileCollapse from "./MobileCollapse";

interface Props {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  /** Optional badge or actions rendered next to the desktop heading. */
  headerExtra?: ReactNode;
  /** Section className applied on desktop only. */
  sectionClassName?: string;
  children: ReactNode;
}

/**
 * Renders a chart/table section as a normal <section> on desktop, but on
 * mobile collapses it inside a thumb-zone <MobileCollapse> accordion to
 * reduce vertical scrolling. Content stays in the DOM either way (SEO-safe).
 */
const MobileChartTableSection = ({
  title,
  hint,
  defaultOpen = false,
  headerExtra,
  sectionClassName = "rounded-2xl border border-border bg-card p-5",
  children,
}: Props) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileCollapse title={title} hint={hint} defaultOpen={defaultOpen}>
        {children}
      </MobileCollapse>
    );
  }
  return (
    <section className={sectionClassName}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {headerExtra}
      </div>
      {children}
    </section>
  );
};

export default MobileChartTableSection;
