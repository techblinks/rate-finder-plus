import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";

interface TooltipProps {
  text: string;
  label?: string;
}

/**
 * Lightweight info tooltip — pure CSS/JS, no library dep.
 * Hover/focus on desktop, tap on mobile. Dismisses on outside click.
 */
const Tooltip = ({ text, label = "More info" }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-accent focus:outline-none focus-visible:text-accent"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-[260px] -translate-x-1/2 rounded-lg border border-border bg-background px-3 py-2 text-[13px] leading-snug text-foreground shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
