import { useEffect, useState } from "react";
import { AUD } from "@/lib/format";

interface BarCompareProps {
  a: { label: string; value: number };
  b: { label: string; value: number };
  caption?: string;
}

const BarCompare = ({ a, b, caption }: BarCompareProps) => {
  const max = Math.max(a.value, b.value, 1);
  const [animated, setAnimated] = useState(false);

  // One-time mount animation: bars start at 0 width, animate to final on next frame.
  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div>
      {caption && <p className="mb-3 text-[13px] font-medium text-muted-foreground">{caption}</p>}
      <div className="space-y-3">
        {[a, b].map((row, i) => {
          const pct = (row.value / max) * 100;
          return (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="tnum text-muted-foreground">{AUD(row.value)}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-surface">
                <div
                  className={`h-3 rounded-full transition-[width] duration-700 ease-out ${
                    i === 0 ? "bg-accent" : "bg-success"
                  }`}
                  style={{ width: animated ? `${pct}%` : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarCompare;
