import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Home,
  FileText,
  BarChart3,
  Shield,
  ArrowLeftRight,
  Repeat,
  PlusCircle,
  Building2,
  BookOpen,
} from "lucide-react";
import { useRbaRates } from "@/hooks/useRbaRates";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import AdSlot from "@/components/AdSlot";
import MobileFaqAccordion from "./MobileFaqAccordion";

interface CalcCardDef {
  icon: typeof Home;
  name: string;
  path: string;
  bg: string;
  fg: string;
  stat: string;
}

const CALCULATORS: CalcCardDef[] = [
  { icon: Home, name: "Mortgage", path: "/mortgage-calculator", bg: "#eff6ff", fg: "#2563eb", stat: "Repayments" },
  { icon: FileText, name: "Stamp Duty", path: "/stamp-duty-calculator", bg: "#f0fdf4", fg: "#16a34a", stat: "All 8 states" },
  { icon: BarChart3, name: "Borrowing Power", path: "/borrowing-power-calculator", bg: "#fdf4ff", fg: "#a855f7", stat: "APRA buffer" },
  { icon: Shield, name: "LMI", path: "/lmi-calculator", bg: "#fff7ed", fg: "#ea580c", stat: "Avoid $15k+" },
  { icon: ArrowLeftRight, name: "Compare Loans", path: "/loan-comparison-calculator", bg: "#f8fafc", fg: "#475569", stat: "Side by side" },
  { icon: Building2, name: "Rent vs Buy", path: "/rent-vs-buy-calculator", bg: "#fef2f2", fg: "#dc2626", stat: "Break-even" },
  { icon: Repeat, name: "Refinance", path: "/refinance-calculator", bg: "#f0fdf4", fg: "#0d9488", stat: "Switch & save" },
  { icon: PlusCircle, name: "Extra Repayments", path: "/extra-repayments-calculator", bg: "#fffbeb", fg: "#d97706", stat: "Pay off sooner" },
];

const POPULAR = [
  { name: "Stamp duty calculator", desc: "All 8 states including ACT", path: "/stamp-duty-calculator" },
  { name: "Mortgage calculator", desc: "With amortisation schedule", path: "/mortgage-calculator" },
  { name: "Borrowing power calculator", desc: "Includes APRA 3% buffer", path: "/borrowing-power-calculator" },
];

const GUIDE_LINKS = [
  { slug: "stamp-duty-australia-2026", label: "Stamp duty in every state 2026" },
  { slug: "what-is-lmi", label: "What is LMI and how to avoid it" },
  { slug: "borrowing-power-australia", label: "How much can I borrow in Australia?" },
  { slug: "first-home-buyer-grants-2026", label: "First home buyer grants 2026" },
];

interface LastResult {
  label: string;
  value: string;
  path: string;
}

function readLastResult(): LastResult | null {
  try {
    const raw = localStorage.getItem("calcy_mortgage_last");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.value) return null;
    return {
      label: data.label || "Mortgage",
      value: data.value,
      path: data.path || "/mortgage-calculator",
    };
  } catch {
    return null;
  }
}

const MobileHomepage = () => {
  const rba = useRbaRates();
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  useEffect(() => {
    setLastResult(readLastResult());
  }, []);

  const faqs = [
    {
      q: "What is the current RBA cash rate?",
      a: `The RBA cash rate is currently ${rba.cashRate.toFixed(2)}% (${rba.lastUpdated}). Average owner-occupier rates sit around ${rba.ownerOccupier.toFixed(2)}%. Use the mortgage calculator to see what this means for your repayments.`,
    },
    {
      q: "Do first home buyers pay stamp duty in NSW?",
      a: "First home buyers in NSW pay no stamp duty on properties valued up to $800,000. A partial concession applies up to $1,000,000. Use the stamp duty calculator to see your exact saving.",
    },
    {
      q: "How much can I borrow on my salary?",
      a: "Lenders assess borrowing capacity based on your income, expenses, and a 3% APRA serviceability buffer above the loan rate. Use the borrowing power calculator to get your estimate.",
    },
    {
      q: "What is LMI and can I avoid it?",
      a: "Lender's Mortgage Insurance (LMI) is charged when your deposit is under 20%. On a $700,000 property with a 10% deposit, LMI can cost $9,000–$15,000. Use the LMI calculator to see your exact cost.",
    },
  ];

  return (
    <div className="mobile-home min-h-screen bg-background pb-24">
      <FaqJsonLd faqs={faqs.map((f) => ({ question: f.q, answer: f.a }))} />

      {/* Hero */}
      <section className="px-4 pt-4 pb-3">
        <h1 className="text-[28px] font-bold leading-[1.1] tracking-tight text-foreground">
          Australian{" "}
          <em
            className="font-serif italic font-normal text-accent"
            style={{ fontFamily: "var(--font-display-serif)" }}
          >
            mortgage tools
          </em>
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Free. Live RBA rates. All 8 states. No sign-up.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px]">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          <span className="text-muted-foreground">
            RBA{" "}
            <strong className="font-semibold tnum text-foreground">
              {rba.cashRate.toFixed(2)}%
            </strong>{" "}
            · {rba.lastUpdated}
          </span>
        </div>
      </section>

      {/* Last result */}
      {lastResult && (
        <section className="px-4 pt-2">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Last calculation
          </p>
          <Link
            to={lastResult.path}
            className="flex items-center justify-between rounded-2xl border border-border bg-accent-light p-4 text-foreground active:scale-[0.99] transition-transform"
          >
            <div>
              <p className="text-[13px] text-muted-foreground">{lastResult.label}</p>
              <p className="text-[22px] font-bold tnum">{lastResult.value}</p>
            </div>
            <span className="text-[13px] font-medium text-accent">Resume →</span>
          </Link>
        </section>
      )}

      {/* Calculator grid */}
      <section className="px-4 pt-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          All calculators
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {CALCULATORS.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link
                key={calc.path}
                to={calc.path}
                className="calc-card flex min-h-[120px] flex-col justify-between rounded-2xl border border-black/5 bg-white p-4 active:scale-[0.97] transition-transform"
                style={{ ['--card-accent' as any]: calc.fg }}
              >
                <Icon className="h-6 w-6" style={{ color: calc.fg }} strokeWidth={2} />
                <div>
                  <span className="block text-[13px] font-semibold text-foreground">
                    {calc.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {calc.stat}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Ad placement 1 */}
      <div className="px-4 pt-6">
        <AdSlot slot="inline" />
      </div>

      {/* Live data strip */}
      <section className="px-4 pt-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Live Australian data
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {[
            { label: "RBA cash rate", value: `${rba.cashRate.toFixed(2)}%` },
            { label: "Owner-occupier avg", value: `${rba.ownerOccupier.toFixed(2)}%` },
            { label: "NSW FHB exemption", value: "≤ $800k", green: true },
            { label: "QLD First Home Grant", value: "$30,000", green: true },
            { label: "Min deposit (no LMI)", value: "20%" },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${
                i < arr.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span
                className={`tnum font-semibold ${row.green ? "text-success" : "text-foreground"}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Most used right now */}
      <section className="px-4 pt-6">
        <h2 className="mb-3 text-[16px] font-semibold text-foreground">
          Most used right now
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {POPULAR.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 active:bg-surface ${
                i < POPULAR.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-foreground">{item.name}</p>
                <p className="text-[12px] text-muted-foreground">{item.desc}</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Ad placement 2 */}
      <div className="px-4 pt-6">
        <AdSlot slot="inline" />
      </div>

      {/* FAQ */}
      <section className="px-4 pt-6">
        <h2 className="mb-3 text-[16px] font-semibold text-foreground">
          Common questions
        </h2>
        <MobileFaqAccordion items={faqs} />
      </section>

      {/* Guides */}
      <section className="px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-foreground">Free guides</h2>
          <Link to="/guides" className="text-[13px] font-medium text-accent">
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {GUIDE_LINKS.map((g, i) => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className={`flex items-center gap-3 px-4 py-3 text-[14px] text-foreground active:bg-surface ${
                i < GUIDE_LINKS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <BookOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1">{g.label}</span>
              <span className="text-muted-foreground">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust footer */}
      <p className="mt-8 px-4 text-center text-[12px] text-muted-foreground">
        🔒 No sign-up · Free forever · Australian-made
      </p>
    </div>
  );
};

export default MobileHomepage;
