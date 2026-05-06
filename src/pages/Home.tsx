import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Home as HomeIcon,
  FileText,
  BarChart3,
  PlusCircle,
  ShieldCheck,
  ArrowLeftRight,
  MapPin,
  Zap,
  Table,
} from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { monthlyPayment } from "@/lib/calc/mortgage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const TOOLS = [
  {
    to: "/mortgage-calculator",
    title: "Mortgage Calculator",
    description:
      "Calculate home loan repayments, total interest paid, and view a full amortisation breakdown.",
    icon: HomeIcon,
  },
  {
    to: "/stamp-duty-calculator",
    title: "Stamp Duty Calculator",
    description:
      "Estimate stamp duty for every Australian state and territory, including first home buyer exemptions.",
    icon: FileText,
  },
  {
    to: "/borrowing-power-calculator",
    title: "Borrowing Power Calculator",
    description:
      "Find out how much you can borrow based on your income, expenses, and APRA's serviceability requirements.",
    icon: BarChart3,
  },
  {
    to: "/extra-repayments-calculator",
    title: "Extra Repayments Calculator",
    description:
      "See how extra repayments cut years off your loan and reduce total interest paid over the life of your mortgage.",
    icon: PlusCircle,
  },
  {
    to: "/lmi-calculator",
    title: "LMI Calculator",
    description:
      "Calculate Lender's Mortgage Insurance costs based on your deposit size and LVR.",
    icon: ShieldCheck,
  },
  {
    to: "/loan-comparison-calculator",
    title: "Loan Comparison Calculator",
    description:
      "Compare two home loan scenarios side-by-side and find which mortgage saves you more.",
    icon: ArrowLeftRight,
  },
];

const TOPIC_PILLS = [
  { label: "Buying a home", to: "/mortgage-calculator" },
  { label: "Refinancing", to: "/loan-comparison-calculator" },
  { label: "First home buyers", to: "/stamp-duty-calculator" },
  { label: "Investment property", to: "/lmi-calculator" },
  { label: "Comparing loans", to: "/loan-comparison-calculator" },
  { label: "Stamp duty", to: "/stamp-duty-calculator" },
];

const CURRENT_CARDS = [
  {
    tag: "Rate update",
    headline: "The RBA cut rates in February and March 2026.",
    body: "The cash rate is now 4.10%. See how the cuts affect your monthly repayments.",
    cta: "Calculate now →",
    to: "/mortgage-calculator",
  },
  {
    tag: "First home buyers",
    headline: "Stamp duty exemptions for first home buyers in 2026.",
    body: "NSW exempts FHBs up to $800k. VIC up to $600k. QLD up to $500k. Calculate your savings.",
    cta: "Calculate stamp duty →",
    to: "/stamp-duty-calculator",
  },
  {
    tag: "Buying costs",
    headline: "How much deposit do you really need?",
    body: "A 20% deposit avoids LMI entirely. Find out exactly how much LMI would cost you at 10% or 15% deposit.",
    cta: "Calculate LMI →",
    to: "/lmi-calculator",
  },
  {
    tag: "Refinancing",
    headline: "Even 0.50% less on your rate saves tens of thousands.",
    body: "On a $650,000 loan over 30 years, dropping from 5.99% to 5.50% saves $74,880 in total interest.",
    cta: "Compare loans →",
    to: "/loan-comparison-calculator",
  },
];

const fmt = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

const Home = () => {
  const [loan, setLoan] = useState(650000);
  const [rate, setRate] = useState(5.5);
  const dLoan = useDebouncedValue(loan, 300);
  const dRate = useDebouncedValue(rate, 300);

  const repayments = useMemo(() => {
    const monthly = monthlyPayment(dLoan || 0, dRate || 0, 30);
    return {
      monthly,
      fortnightly: monthly / 2,
      weekly: monthly / (52 / 12),
    };
  }, [dLoan, dRate]);

  return (
    <>
      <SeoHead
        title="Free Australian Mortgage Calculators 2026 | Calcy"
        description="Free mortgage repayment, stamp duty, borrowing power, LMI and loan comparison calculators for Australia. Updated May 2026. No sign-up required."
        canonical="/"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }]} />

      {/* SECTION 1 — HERO */}
      <section className="bg-background">
        <div className="mx-auto max-w-[900px] px-5 pt-12 pb-16 md:px-10 md:pt-[72px]">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[55%_45%] md:items-start md:gap-12">
            <div>
              <span className="mb-5 inline-block rounded-[20px] border border-accent-mid bg-accent-light px-3 py-1 text-[12px] font-medium text-accent">
                Free · No sign-up · Updated May 2026
              </span>
              <h1 className="mb-4 text-[32px] leading-[1.2] md:text-[42px]">
                Make confident mortgage decisions.
              </h1>
              <p className="mb-8 max-w-[480px] text-[18px] leading-[1.6] text-muted-foreground">
                Free Australian mortgage, stamp duty, borrowing power and LMI calculators.
                Bank-grade results — no account required.
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] font-medium text-muted-foreground">
                <span>6 calculators</span>
                <span className="text-border">·</span>
                <span>All 8 states</span>
                <span className="text-border">·</span>
                <span>Updated monthly</span>
              </div>
            </div>

            {/* Quick estimate card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                Quick estimate
              </p>
              <div className="mb-3 flex items-end gap-3">
                <label className="flex-1">
                  <span className="mb-1 block text-[12px] text-muted-foreground">Loan amount</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={loan}
                      onChange={(e) => setLoan(Number(e.target.value))}
                      className="field-input w-full pl-7 tnum"
                      inputMode="numeric"
                    />
                  </div>
                </label>
                <label className="w-[110px]">
                  <span className="mb-1 block text-[12px] text-muted-foreground">Rate</span>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="field-input w-full pr-7 tnum"
                      inputMode="decimal"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground">%</span>
                  </div>
                </label>
              </div>

              <div className="mb-3">
                <p className="text-[12px] text-muted-foreground">Fortnightly repayment</p>
                <p className="text-[28px] font-semibold leading-tight text-accent tnum">
                  {fmt(repayments.fortnightly)}
                </p>
                <p className="text-[12px] text-muted-foreground tnum">
                  Monthly {fmt(repayments.monthly)} · Weekly {fmt(repayments.weekly)}
                </p>
              </div>

              <Link to="/mortgage-calculator" className="text-[13px] font-medium text-accent hover:underline">
                Full mortgage calculator with amortisation →
              </Link>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Estimate only. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Topic pills */}
      <section className="bg-surface">
        <div className="page-shell py-14">
          <h2 className="mb-8 text-center text-[24px] font-medium">What can we help you with?</h2>
          <ul className="flex flex-wrap justify-center gap-3">
            {TOPIC_PILLS.map((p) => (
              <li key={p.label}>
                <Link
                  to={p.to}
                  className="inline-block rounded-[20px] border border-border bg-background px-5 py-2 text-[14px] text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 3 — Calculators grid */}
      <section className="bg-background">
        <div className="page-shell py-16">
          <div className="mb-10">
            <h2 className="mb-2 text-[28px] font-medium">Calculators</h2>
            <p className="text-[15px] text-muted-foreground">
              Calcy's calculators help you understand your numbers and take the next step with confidence.
            </p>
          </div>

          <ul className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 md:grid-cols-3">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <li key={t.to} className="flex">
                  <Link
                    to={t.to}
                    className="flex min-h-[200px] w-full flex-col rounded-xl border border-border bg-card p-6 transition-all duration-150 hover:border-accent hover:shadow-[0_2px_8px_rgba(13,148,136,0.08)]"
                  >
                    <Icon className="mb-4 h-8 w-8 text-accent" strokeWidth={1.75} />
                    <h3 className="mb-2 text-[16px] font-medium">{t.title}</h3>
                    <p className="flex-1 text-[14px] leading-[1.6] text-muted-foreground">{t.description}</p>
                    <span className="mt-auto pt-4 text-[13px] font-medium text-accent">
                      Get started →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* SECTION 4 — Current in home loans */}
      <section className="bg-surface">
        <div className="page-shell py-16">
          <h2 className="mb-2 text-[24px] font-medium">Current in home loans</h2>
          <p className="mb-8 text-[14px] text-muted-foreground">
            What's happening in the Australian property market right now.
          </p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CURRENT_CARDS.map((c) => (
              <li key={c.headline} className="flex">
                <Link
                  to={c.to}
                  className="flex w-full flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                >
                  <span className="self-start rounded-[20px] bg-accent-light px-2.5 py-[3px] text-[11px] font-medium text-accent">
                    {c.tag}
                  </span>
                  <h3 className="mb-2 mt-2.5 text-[15px] font-medium">{c.headline}</h3>
                  <p className="mb-4 flex-1 text-[13px] leading-[1.55] text-muted-foreground">{c.body}</p>
                  <span className="mt-auto text-[13px] font-medium text-accent">{c.cta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 5 — Why Calcy */}
      <section className="bg-background">
        <div className="page-shell py-16 pb-16">
          <ul className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <li>
              <MapPin className="mb-3 h-7 w-7 text-accent" strokeWidth={1.75} />
              <h3 className="mb-2 text-[16px] font-medium">Built for Australia</h3>
              <p className="max-w-[260px] text-[14px] leading-[1.6] text-muted-foreground">
                Every calculator uses Australian defaults, terminology, and stamp duty rates for all 8
                states. Updated monthly with current RBA rates.
              </p>
            </li>
            <li>
              <Zap className="mb-3 h-7 w-7 text-accent" strokeWidth={1.75} />
              <h3 className="mb-2 text-[16px] font-medium">Free, forever</h3>
              <p className="max-w-[260px] text-[14px] leading-[1.6] text-muted-foreground">
                No account, no email, no ads, no pop-ups. Instant results on any device. Just the
                numbers you need.
              </p>
            </li>
            <li>
              <Table className="mb-3 h-7 w-7 text-accent" strokeWidth={1.75} />
              <h3 className="mb-2 text-[16px] font-medium">Detailed breakdowns</h3>
              <p className="max-w-[260px] text-[14px] leading-[1.6] text-muted-foreground">
                Amortisation schedules, year-by-year tables, and side-by-side comparisons — not just a
                single repayment figure.
              </p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};

export default Home;
