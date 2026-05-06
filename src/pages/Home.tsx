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
  TrendingDown,
  TrendingUp,
  Minus,
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
      "Calculate home loan repayments, total interest paid, and view a full amortisation breakdown for any loan amount.",
    icon: HomeIcon,
  },
  {
    to: "/stamp-duty-calculator",
    title: "Stamp Duty Calculator",
    description:
      "Estimate stamp duty for every Australian state and territory, including first home buyer exemptions and concessions.",
    icon: FileText,
  },
  {
    to: "/borrowing-power-calculator",
    title: "Borrowing Power Calculator",
    description:
      "Find out how much you can borrow based on your income, expenses, and APRA's 3% serviceability buffer.",
    icon: BarChart3,
  },
  {
    to: "/extra-repayments-calculator",
    title: "Extra Repayments Calculator",
    description:
      "See how extra repayments cut years off your loan and reduce total interest paid.",
    icon: PlusCircle,
  },
  {
    to: "/lmi-calculator",
    title: "LMI Calculator",
    description:
      "Estimate Lender's Mortgage Insurance costs based on your deposit size and LVR.",
    icon: ShieldCheck,
  },
  {
    to: "/loan-comparison-calculator",
    title: "Loan Comparison Calculator",
    description:
      "Compare two home loans side-by-side and find which mortgage saves you more over the loan term.",
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
    stat: "4.10%",
    statLabel: "RBA cash rate · May 2026",
    trend: "down" as const,
    headline: "The RBA cut rates in February and March 2026.",
    body: "The cash rate is now 4.10%. See how the recent cuts affect your monthly mortgage repayments on your current loan.",
    cta: "Calculate now →",
    to: "/mortgage-calculator",
  },
  {
    tag: "First home buyers",
    stat: "$800k",
    statLabel: "NSW stamp duty exemption cap",
    trend: "neutral" as const,
    headline: "Stamp duty exemptions for first home buyers in 2026.",
    body: "NSW exempts FHBs up to $800k. VIC up to $600k. QLD up to $500k. Calculate your exact saving for your state.",
    cta: "Calculate stamp duty →",
    to: "/stamp-duty-calculator",
  },
  {
    tag: "Buying costs",
    stat: "20%",
    statLabel: "Deposit to avoid LMI",
    trend: "neutral" as const,
    headline: "How much deposit do you really need to avoid LMI?",
    body: "A 20% deposit eliminates LMI entirely. At 10% deposit on a $700k property, LMI can add $9,100 to your loan.",
    cta: "Calculate LMI →",
    to: "/lmi-calculator",
  },
  {
    tag: "Refinancing",
    stat: "$74,880",
    statLabel: "Saved on a $650k loan over 30 years",
    trend: "up" as const,
    headline: "Even 0.50% less on your rate saves tens of thousands.",
    body: "On a $650,000 loan over 30 years, refinancing from 5.99% to 5.50% saves $74,880 in total interest paid.",
    cta: "Compare loans →",
    to: "/loan-comparison-calculator",
  },
];

const fmt = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

const LOAN_MIN = 10_000;
const LOAN_MAX = 10_000_000;
const RATE_MIN = 0.1;
const RATE_MAX = 20;

const validateLoan = (n: number) => {
  if (!Number.isFinite(n) || n <= 0) return "Enter a loan amount";
  if (n < LOAN_MIN) return `Minimum loan is ${fmt(LOAN_MIN)}`;
  if (n > LOAN_MAX) return `Maximum loan is ${fmt(LOAN_MAX)}`;
  return null;
};
const validateRate = (n: number) => {
  if (!Number.isFinite(n) || n <= 0) return "Enter a rate";
  if (n < RATE_MIN) return `Minimum rate is ${RATE_MIN}%`;
  if (n > RATE_MAX) return `Maximum rate is ${RATE_MAX}%`;
  return null;
};

const Home = () => {
  const [loan, setLoan] = useState(650000);
  const [rate, setRate] = useState(5.5);
  const dLoan = useDebouncedValue(loan, 150);
  const dRate = useDebouncedValue(rate, 150);

  const loanError = validateLoan(loan);
  const rateError = validateRate(rate);
  const hasError = Boolean(loanError || rateError);

  const repayments = useMemo(() => {
    if (validateLoan(dLoan) || validateRate(dRate)) {
      return { monthly: 0, fortnightly: 0, weekly: 0 };
    }
    const monthly = monthlyPayment(dLoan, dRate, 30);
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

      {/* SECTION 1 — HERO (2-tile rounded layout) */}
      <section className="bg-background">
        <div className="page-shell pt-10 pb-10 md:pt-14 md:pb-14">
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
            {/* Left tile — transparent, flush with grid edge */}
            <div className="flex flex-col justify-between py-2 md:py-8 md:pr-4 min-h-[280px] md:min-h-[420px] text-foreground">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-light px-3 py-1 text-[11px] font-semibold tracking-wide text-accent mb-5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                  Free · No sign-up · Updated May 2026
                </span>
                <h1 className="font-display text-[32px] sm:text-[40px] md:text-[44px] leading-[1.05] font-extrabold text-foreground mb-4">
                  Make confident<br />mortgage decisions.
                </h1>
                <p className="text-[14px] sm:text-[15px] text-foreground/80 max-w-[440px]">
                  Free Australian mortgage, stamp duty, borrowing power and LMI calculators.
                  Bank-grade results — no account required.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <Link
                  to="/mortgage-calculator"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground bg-foreground px-5 text-[14px] font-semibold text-background hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background w-full sm:w-auto"
                >
                  Get started <span aria-hidden>↗</span>
                </Link>
                <Link
                  to="/loan-comparison-calculator"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-foreground/30 bg-transparent px-5 text-[14px] font-semibold text-foreground hover:bg-foreground/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background w-full sm:w-auto"
                >
                  Compare loans
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-foreground/70">
                <span>6 calculators</span>
                <span className="inline-block h-1 w-1 rounded-full bg-foreground/30" aria-hidden />
                <span>All 8 states</span>
                <span className="inline-block h-1 w-1 rounded-full bg-foreground/30" aria-hidden />
                <span>Updated monthly</span>
              </div>
            </div>

            {/* Right tile — Quick estimate */}
            <section
              aria-labelledby="quick-estimate-heading"
              className="rounded-[24px] p-7 text-white sm:p-9 md:p-10 min-h-[280px] md:min-h-[420px] flex flex-col"
              style={{ background: "hsl(var(--accent))" }}
            >
              <h2 id="quick-estimate-heading" className="text-label mb-5 text-white/75 font-semibold">
                Quick estimate
              </h2>

              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1 min-w-0">
                  <label htmlFor="qe-loan" className="mb-1.5 block text-[12px] text-white/80">
                    Loan amount
                  </label>
                  <div className="relative">
                    <span aria-hidden className="absolute left-3.5 top-[22px] -translate-y-1/2 text-[15px] text-muted-foreground">
                      $
                    </span>
                    <input
                      id="qe-loan"
                      type="number"
                      value={Number.isFinite(loan) ? loan : ""}
                      onChange={(e) => setLoan(Number(e.target.value))}
                      className={`input-field pl-7 tnum focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))] ${
                        loanError ? "border-destructive focus:border-destructive" : ""
                      }`}
                      inputMode="numeric"
                      min={LOAN_MIN}
                      max={LOAN_MAX}
                      step={1000}
                      autoComplete="off"
                      aria-invalid={Boolean(loanError)}
                      aria-describedby="qe-loan-hint"
                      aria-errormessage={loanError ? "qe-loan-hint" : undefined}
                    />
                  </div>
                  <span
                    id="qe-loan-hint"
                    role={loanError ? "alert" : undefined}
                    aria-live={loanError ? "assertive" : "off"}
                    className={`mt-1.5 block text-[11px] min-h-[14px] ${
                      loanError ? "text-white font-medium" : "text-white/55"
                    }`}
                  >
                    {loanError ?? `Range: ${fmt(LOAN_MIN)} to ${fmt(LOAN_MAX)}`}
                  </span>
                </div>
                <div className="w-full sm:w-[130px]">
                  <label htmlFor="qe-rate" className="mb-1.5 block text-[12px] text-white/80">
                    Rate
                  </label>
                  <div className="relative">
                    <input
                      id="qe-rate"
                      type="number"
                      step="0.01"
                      value={Number.isFinite(rate) ? rate : ""}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className={`input-field pr-7 tnum focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))] ${
                        rateError ? "border-destructive focus:border-destructive" : ""
                      }`}
                      inputMode="decimal"
                      min={RATE_MIN}
                      max={RATE_MAX}
                      autoComplete="off"
                      aria-invalid={Boolean(rateError)}
                      aria-describedby="qe-rate-hint"
                      aria-errormessage={rateError ? "qe-rate-hint" : undefined}
                    />
                    <span aria-hidden className="absolute right-3 top-[22px] -translate-y-1/2 text-[14px] text-muted-foreground">
                      %
                    </span>
                  </div>
                  <span
                    id="qe-rate-hint"
                    role={rateError ? "alert" : undefined}
                    aria-live={rateError ? "assertive" : "off"}
                    className={`mt-1.5 block text-[11px] min-h-[14px] ${
                      rateError ? "text-white font-medium" : "text-white/55"
                    }`}
                  >
                    {rateError ?? `Range: ${RATE_MIN}% to ${RATE_MAX}%`}
                  </span>
                </div>
              </div>

              <div
                className="mt-3 min-h-[96px]"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <p className="text-[12px] text-white/75" id="qe-result-label">
                  Fortnightly repayment
                </p>
                <p
                  className="mt-1 text-[34px] sm:text-[40px] font-semibold leading-none tnum tabular-nums transition-opacity duration-150"
                  style={{ opacity: hasError ? 0.5 : 1 }}
                  aria-labelledby="qe-result-label"
                >
                  <span className="sr-only">Estimated fortnightly repayment: </span>
                  {hasError ? "—" : fmt(repayments.fortnightly)}
                </p>
                <p className="mt-1.5 text-[13px] text-white/75 tnum tabular-nums min-h-[18px]">
                  {hasError
                    ? "Enter valid values to see your estimate"
                    : `Monthly ${fmt(repayments.monthly)} · Weekly ${fmt(repayments.weekly)}`}
                </p>
              </div>

              <div className="my-5 h-px bg-white/15" aria-hidden />

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to="/mortgage-calculator"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-foreground shadow-sm hover:bg-white/95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))] w-full sm:w-auto"
                  aria-label="Open full mortgage calculator with amortisation"
                >
                  Full calculator <span aria-hidden>↗</span>
                </Link>
                <Link
                  to="/borrowing-power-calculator"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 bg-transparent px-5 text-[14px] font-semibold text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--accent))] w-full sm:w-auto"
                  aria-label="Open borrowing power calculator"
                >
                  Borrowing power
                </Link>
              </div>

              <p className="mt-3 text-[11px] text-white/55">
                Estimate only. Not financial advice.
              </p>
            </section>
          </div>
        </div>
      </section>
      <section className="bg-surface">
        <div className="page-shell py-14">
          <h2 className="text-h2 mb-8 text-center">What can we help you with?</h2>
          <ul className="flex flex-wrap justify-center gap-2.5">
            {TOPIC_PILLS.map((p) => (
              <li key={p.label}>
                <Link
                  to={p.to}
                  className="inline-flex h-10 items-center rounded-[20px] border-[1.5px] border-border bg-background px-5 text-[14px] font-medium transition-colors hover:border-accent hover:bg-accent-light hover:text-accent"
                  style={{ color: "hsl(var(--text-secondary))" }}
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
        <div className="page-shell py-[72px]">
          <h2 className="text-h2 mb-2">Calculators</h2>
          <p className="text-body mb-10">
            Calcy's calculators help you understand your numbers and make confident decisions.
          </p>

          <ul className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <li key={t.to} className="flex">
                  <Link to={t.to} className="calc-card min-h-[240px] w-full">
                    <h3 className="text-h4 mb-2.5">{t.title}</h3>
                    <p className="text-body text-small flex-1">{t.description}</p>
                    <div className="mt-5 flex items-end justify-between">
                      <Icon className="h-9 w-9 text-accent" strokeWidth={1.75} />
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-accent-foreground">
                        Get started <span aria-hidden>↗</span>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* SECTION 4 — Current in home loans */}
      <section className="bg-surface">
        <div className="page-shell py-[72px]">
          <h2 className="text-h2 mb-2">Current in home loans</h2>
          <p className="text-body mb-10">
            What's happening in the Australian property market right now.
          </p>
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {CURRENT_CARDS.map((c) => {
              const TrendIcon = c.trend === "down" ? TrendingDown : c.trend === "up" ? TrendingUp : Minus;
              const trendStyles =
                c.trend === "down"
                  ? "bg-[#DCFCE7] text-[#166534]"
                  : c.trend === "up"
                  ? "bg-accent-light text-accent"
                  : "bg-surface text-muted-foreground";
              return (
                <li key={c.headline} className="flex">
                  <Link
                    to={c.to}
                    className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_hsl(var(--accent)/0.12)]"
                  >
                    <div className="relative bg-surface p-6 border-b border-border">
                      <div className="flex items-start justify-between mb-4">
                        <span className="badge badge-brand">{c.tag}</span>
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${trendStyles}`} aria-hidden>
                          <TrendIcon className="h-4 w-4" strokeWidth={2.25} />
                        </span>
                      </div>
                      <p className="font-display text-[36px] font-extrabold leading-none tracking-tight text-foreground tnum">
                        {c.stat}
                      </p>
                      <p className="mt-2 text-[12px] font-medium text-muted-foreground">
                        {c.statLabel}
                      </p>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-h4 mb-2">{c.headline}</h3>
                      <p className="text-body text-small mb-5 flex-1">{c.body}</p>
                      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-accent-foreground">
                        {c.cta}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* SECTION 5 — Why Calcy */}
      <section className="bg-background border-t border-border">
        <div className="page-shell py-[72px]">
          <h2 className="text-h2 mb-12 text-center">Why Calcy?</h2>
          <ul className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              {
                Icon: MapPin,
                title: "Built for Australia",
                body: "Every calculator uses Australian terminology, defaults, and stamp duty rates for all 8 states and territories. Updated monthly with current RBA rates.",
              },
              {
                Icon: Zap,
                title: "Free, forever",
                body: "No account, no email, no ads, no pop-ups. Instant results on any device. Just the numbers you need.",
              },
              {
                Icon: Table,
                title: "Detailed breakdowns",
                body: "Amortisation schedules, year-by-year tables, and side-by-side comparisons — not just a single repayment figure.",
              },
            ].map(({ Icon, title, body }) => (
              <li key={title} className="mx-auto max-w-[280px] text-left md:text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light md:mx-auto">
                  <Icon className="h-6 w-6 text-accent" strokeWidth={1.75} />
                </div>
                <h3 className="text-h4 mb-2">{title}</h3>
                <p className="text-body text-small">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default Home;
