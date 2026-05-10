import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Item {
  q: string;
  a: string;
}

const MobileFaqAccordion = ({ items }: { items: Item[] }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      {items.map((item, i) => {
        const open = openIdx === i;
        return (
          <div key={i} className={i > 0 ? "border-t border-border" : ""}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIdx(open ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-[14px] font-medium text-foreground">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open && (
              <div className="px-4 pb-4 text-[14px] leading-relaxed text-muted-foreground">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MobileFaqAccordion;
