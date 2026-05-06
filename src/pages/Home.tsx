import { Link } from "react-router-dom";
import { Calculator, Coins, TrendingUp, PiggyBank, ShieldCheck, GitCompareArrows, MapPin, Sparkles, BarChart3 } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const TOOLS = [
  {
    to: "/mortgage-calculator",
    title: "Mortgage Calculator",
    description:
      "Calculate home loan repayments, total interest paid, and view a full amortisation breakdown for any loan amount.",
    cta: "Calculate repayments →",
    icon: Calculator,
  },
  {
    to: "/stamp-duty-calculator",
    title: "Stamp Duty Calculator",
    description:
      "Estimate stamp duty costs for every Australian state and territory, including first home buyer exemptions.",
    cta: "Calculate stamp duty →",
    icon: Coins,
  },
  {
    to: "/borrowing-power-calculator",
    title: "Borrowing Power Calculator",
    description:
      "Find out how much you can borrow based on your income, expenses, and APRA's serviceability requirements.",
    cta: "Calculate borrowing power →",
    icon: TrendingUp,
  },
  {
    to: "/extra-repayments-calculator",
    title: "Extra Repayments Calculator",
    description:
      "See how making extra mortgage repayments cuts years off your loan term and reduces total interest paid.",
    cta: "Calculate savings →",
    icon: PiggyBank,
  },
  {
    to: "/lmi-calculator",
    title: "LMI Calculator",
    description:
      "Estimate Lender's Mortgage Insurance costs based on your property value, deposit size, and LVR.",
    cta: "Calculate LMI →",
    icon: ShieldCheck,
  },
  {
    to: "/loan-comparison-calculator",
    title: "Loan Comparison Calculator",
    description:
      "Compare two home loan scenarios side-by-side and identify which mortgage saves you more over the loan term.",
    cta: "Compare loans →",
    icon: GitCompareArrows,
  },
];

const Home = () => (
  <>
    <SeoHead
      title="Free Australian Mortgage Calculators 2026 | Calcy"
      description="Free mortgage repayment, stamp duty, borrowing power, LMI and loan comparison calculators for Australia. Updated May 2026. No sign-up required."
      canonical="/"
    />
    <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }]} />
    <div className="page-shell py-12 md:py-16">
      <section className="text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          CALCY.COM.AU
        </p>
        <h1 className="mb-4 text-[32px] md:text-[36px]">Free Australian Mortgage Calculators</h1>
        <p className="mx-auto max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          Bank-grade repayment, stamp duty, borrowing power and insurance calculators. Free, no
          sign-up required. Updated May 2026.
        </p>
      </section>

      <section aria-label="Calculators" className="mt-12">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent/50 hover:shadow-sm"
                >
                  <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-surface text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mb-1.5 text-[16px]">{t.title}</h2>
                  <p className="text-[14px] leading-relaxed text-muted-foreground">{t.description}</p>
                  <span className="mt-3 text-[14px] font-semibold text-accent group-hover:underline">
                    {t.cta}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="why" className="mt-16">
        <h2 id="why" className="mb-6 text-center">Why Calcy</h2>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <li>
            <MapPin className="mb-2 h-6 w-6 text-accent" />
            <h3 className="mb-1.5">Australian-Specific</h3>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Defaults, rates, and stamp duty brackets tailored for the Australian market. Updated
              monthly with current RBA rates.
            </p>
          </li>
          <li>
            <Sparkles className="mb-2 h-6 w-6 text-accent" />
            <h3 className="mb-1.5">Free, No Sign-Up</h3>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Instant results on any device. No account, no email, no ads, no pop-ups. Just the
              numbers.
            </p>
          </li>
          <li>
            <BarChart3 className="mb-2 h-6 w-6 text-accent" />
            <h3 className="mb-1.5">Detailed Breakdowns</h3>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Amortisation schedules, year-by-year tables, and side-by-side comparisons — not just a
              single number.
            </p>
          </li>
        </ul>
      </section>
    </div>
  </>
);

export default Home;
