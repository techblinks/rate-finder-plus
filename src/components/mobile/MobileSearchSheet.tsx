import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Home, FileText, BarChart3, Shield, ArrowLeftRight, Repeat, PlusCircle, Building2, BookOpen } from "lucide-react";
import { GUIDES } from "@/data/guides";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Group = "Calculators" | "Guides" | "Pages";
interface Item {
  group: Group;
  label: string;
  desc?: string;
  path: string;
  icon?: typeof Home;
}

const CALC_ITEMS: Item[] = [
  { group: "Calculators", label: "Mortgage calculator", desc: "Repayments + amortisation", path: "/mortgage-calculator", icon: Home },
  { group: "Calculators", label: "Stamp duty calculator", desc: "All 8 states", path: "/stamp-duty-calculator", icon: FileText },
  { group: "Calculators", label: "Borrowing power", desc: "APRA buffer", path: "/borrowing-power-calculator", icon: BarChart3 },
  { group: "Calculators", label: "HECS borrowing power", desc: "How HECS affects your loan", path: "/hecs-borrowing-power", icon: BarChart3 },
  { group: "Calculators", label: "LMI calculator", desc: "Avoid $15k+", path: "/lmi-calculator", icon: Shield },
  { group: "Calculators", label: "Compare loans", desc: "Side by side", path: "/loan-comparison-calculator", icon: ArrowLeftRight },
  { group: "Calculators", label: "Rent vs Buy", desc: "Break-even", path: "/rent-vs-buy-calculator", icon: Building2 },
  { group: "Calculators", label: "Refinance", desc: "Switch & save", path: "/refinance-calculator", icon: Repeat },
  { group: "Calculators", label: "Extra repayments", desc: "Pay off sooner", path: "/extra-repayments-calculator", icon: PlusCircle },
];

const PAGE_ITEMS: Item[] = [
  { group: "Pages", label: "Guides", desc: "All articles", path: "/guides", icon: BookOpen },
  { group: "Pages", label: "Best home loans Australia", path: "/best-home-loans-australia" },
  { group: "Pages", label: "About", path: "/about" },
  { group: "Pages", label: "Contact", path: "/contact" },
];

const MobileSearchSheet = ({ open, onClose }: Props) => {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const guideItems: Item[] = useMemo(
    () =>
      GUIDES.map((g) => ({
        group: "Guides" as const,
        label: g.title,
        path: `/guides/${g.slug}`,
        icon: BookOpen,
      })),
    [],
  );

  const all: Item[] = useMemo(() => [...CALC_ITEMS, ...guideItems, ...PAGE_ITEMS], [guideItems]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter(
      (i) =>
        i.label.toLowerCase().includes(term) ||
        (i.desc?.toLowerCase().includes(term) ?? false),
    );
  }, [q, all]);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 50);
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const grouped: Record<Group, Item[]> = { Calculators: [], Guides: [], Pages: [] };
  results.forEach((r) => grouped[r.group].push(r));

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-background md:hidden flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted px-3 h-10">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search calculators, guides…"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-2 h-10 text-[15px] font-medium text-accent active:scale-95"
        >
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {(["Calculators", "Guides", "Pages"] as Group[]).map((g) =>
          grouped[g].length ? (
            <section key={g} className="pt-4">
              <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {g}
              </p>
              <ul className="rounded-2xl bg-white border border-black/5 overflow-hidden">
                {grouped[g].map((r, idx) => {
                  const Icon = r.icon;
                  return (
                    <li key={r.path} className={idx > 0 ? "border-t border-black/5" : ""}>
                      <button
                        onClick={() => go(r.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted"
                      >
                        {Icon && <Icon className="h-4 w-4 text-accent shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium text-foreground truncate">
                            {r.label}
                          </p>
                          {r.desc && (
                            <p className="text-[12px] text-muted-foreground truncate">{r.desc}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null,
        )}
        {results.length === 0 && (
          <p className="pt-12 text-center text-[14px] text-muted-foreground">
            No results for "{q}"
          </p>
        )}
      </div>
    </div>
  );
};

export default MobileSearchSheet;
