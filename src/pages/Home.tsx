import { Link } from "react-router-dom";
import { Calculator, Coins, TrendingUp, PiggyBank, ShieldCheck, GitCompareArrows, MapPin, Sparkles, BarChart3 } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const TOOLS = [
  {
    to: "/mortgage-calculator",
    title: "Mortgage Repayment Calculator",
    description: "Calculate home loan repayments, total interest, and view a full amortisation breakdown.",
    icon: Calculator,
  },
  {
    to: "/stamp-duty-calculator",
    title: "Stamp Duty Calculator",
    description: "Estimate stamp duty costs for every Australian state and territory.",
    icon: Coins,
  },
  {
    to: "/borrowing-power-calculator",
    title: "Borrowing Power Calculator",
    description: "Estimate how much you can borrow based on your income and expenses.",
    icon: TrendingUp,
  },
  {
    to: "/extra-repayments-calculator",
    title: "Extra Repayments Calculator",
    description: "See how extra repayments reduce your loan term and total interest.",
    icon: PiggyBank,
  },
  {
    to: "/lmi-calculator",
    title: "LMI Calculator",
    description: "Estimate Lender's Mortgage Insurance costs based on your deposit size.",
    icon: ShieldCheck,
  },
  {
    to: "/loan-comparison-calculator",
    title: "Loan Comparison Calculator",
    description: "Compare two mortgage scenarios side-by-side.",
    icon: GitCompareArrows,
  },
];

const Home = () => (
  <>
    <SeoHead
      title="Zune Calculator — Free Australian Mortgage Calculators 2026"
      description="Free Australian mortgage repayment, stamp duty, borrowing power, LMI and loan comparison calculators. Bank-grade, no sign-up. Updated for 2026."
      canonical="/"
    />
    <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }]} />
    <div className="page-shell py-12 md:py-16">
      <section className="text-center">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          zunecalculator.com
        </p>
        <h1 className="mb-4">Free Australian Mortgage Calculators</h1>
        <p className="mx-auto max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          Bank-grade repayment, stamp duty, borrowing power and insurance calculators. Free, no
          sign-up. Updated May 2026.
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
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent/50"
                >
                  <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-surface text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mb-1.5 text-[16px]">{t.title}</h2>
                  <p className="text-[14px] leading-relaxed text-muted-foreground">{t.description}</p>
                  <span className="mt-3 text-[13px] font-semibold text-accent group-hover:underline">
                    Open calculator →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="why" className="mt-16">
        <h2 id="why" className="mb-6 text-center">Why Zune Calculator?</h2>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <li className="rounded-lg border border-border bg-card p-4">
            <MapPin className="mb-2 h-6 w-6 text-accent" />
            <h3 className="mb-1.5">Australian-Specific</h3>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Defaults, rates, and terminology tailored for the Australian market. Updated for the
              2026 RBA cash rate.
            </p>
          </li>
          <li className="rounded-lg border border-border bg-card p-4">
            <Sparkles className="mb-2 h-6 w-6 text-accent" />
            <h3 className="mb-1.5">Free, No Sign-Up</h3>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Instant results on any device. No account needed, no ads, no pop-ups.
            </p>
          </li>
          <li className="rounded-lg border border-border bg-card p-4">
            <BarChart3 className="mb-2 h-6 w-6 text-accent" />
            <h3 className="mb-1.5">Detailed Breakdowns</h3>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              See repayments, total interest, amortisation schedules, and side-by-side comparisons
              — not just a single number.
            </p>
          </li>
        </ul>
      </section>
    </div>
  </>
);

export default Home;
