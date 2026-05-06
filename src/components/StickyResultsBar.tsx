import { useEffect, useRef, useState } from "react";

interface StickyResultsBarProps {
  watchRef: React.RefObject<HTMLElement>;
  summary: string;
  primary: string;
}

const StickyResultsBar = ({ watchRef, summary, primary }: StickyResultsBarProps) => {
  const [show, setShow] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = watchRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { rootMargin: "-56px 0px 0px 0px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [watchRef]);

  if (!show) return null;

  const scrollUp = () => {
    watchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={barRef}
      className="sticky top-14 z-30 -mt-6 mb-6 border-b border-border bg-background/95 backdrop-blur"
    >
      <div className="page-shell flex h-10 items-center justify-between gap-3 text-[13px]">
        <span className="truncate text-muted-foreground">
          {summary} → <span className="font-semibold text-foreground tnum">{primary}</span>
        </span>
        <button
          type="button"
          onClick={scrollUp}
          className="shrink-0 text-accent hover:underline"
        >
          ↑ Edit
        </button>
      </div>
    </div>
  );
};

export default StickyResultsBar;
