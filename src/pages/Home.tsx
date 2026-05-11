import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MobileHomepage from "@/components/mobile/MobileHomepage";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import FAQ from "@/components/FAQ";
import { FAQS } from "@/data/faqs";
import { useRbaRates } from "@/hooks/useRbaRates";

interface CalcCardData {
  name: string;
  path: string;
  statValue: string;
  statLabel: string;
  shortDesc: string;
  catVar: string; // CSS variable name for category color, e.g. "--cat-mortgage-fg"
}

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const rba = useRbaRates();

  if (isMobile) return <MobileHomepage />;

  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Derived figures (using live RBA where applicable)
  const typicalVariable = (rba.cashRate + 2.04).toFixed(2);

  const calculators: CalcCardData[] = [
    {
      name: "Mortgage calculator",
      path: "/mortgage-calculator",
      statValue: "$3,897",
      statLabel: `Fortnightly on $650k at ${rba.ownerOccupier.toFixed(2)}%`,
      shortDesc: "Repayments, total interest, amortisation schedule",
      catVar: "--cat-mortgage-fg",
    },
    {
      name: "Stamp duty calculator",
      path: "/stamp-duty-calculator",
      statValue: "$0",
      statLabel: "For FHB on $800k in NSW",
      shortDesc: "All 8 states. First home buyer exemptions included",
      catVar: "--cat-stamp-fg",
    },
    {
      name: "Borrowing power",
      path: "/borrowing-power-calculator",
      statValue: "$680k",
      statLabel: "Estimated on $100k salary",
      shortDesc: "How much can you borrow? APRA buffer applied",
      catVar: "--cat-borrow-fg",
    },
    {
      name: "LMI calculator",
      path: "/lmi-calculator",
      statValue: "$14,560",
      statLabel: "LMI on $700k at 10% deposit",
      shortDesc: "Avoid paying $15k+ with the right deposit",
      catVar: "--cat-lmi-fg",
    },
    {
      name: "Loan comparison",
      path: "/loan-comparison-calculator",
      statValue: "$47k",
      statLabel: "Saved by comparing two loan options",
      shortDesc: "Compare any two home loans side by side",
      catVar: "--cat-compare-fg",
    },
    {
      name: "Refinance calculator",
      path: "/refinance-calculator",
      statValue: "$312/mo",
      statLabel: "Saved refinancing 7.20% → 6.39%",
      shortDesc: "Break-even months, monthly saving, total saving",
      catVar: "--cat-refi-fg",
    },
    {
      name: "Rent vs Buy",
      path: "/rent-vs-buy-calculator",
      statValue: "6 yrs",
      statLabel: "Break-even point in Sydney",
      shortDesc: "When does buying actually beat renting?",
      catVar: "--cat-rent-fg",
    },
    {
      name: "Extra repayments",
      path: "/extra-repayments-calculator",
      statValue: "$152k",
      statLabel: "Saved with $500 extra per month",
      shortDesc: "Pay off your loan years earlier",
      catVar: "--cat-extra-fg",
    },
  ];

  return (
    <>
      <SeoHead
        title="Free Australian Mortgage Calculator 2026 | Calcy"
        description="Calculate home loan repayments, stamp duty, borrowing power and LMI for free. All 8 Australian states. Updated with current RBA rates. No sign-up required."
        canonical="/"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }]} />
      <FaqJsonLd faqs={FAQS.home} />

      {/* HERO — light, two-column */}
      <section className="hero-redesign">
        <div className="mx-auto grid max-w-[1200px] items-center gap-20 px-6 py-20 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="live-indicator mb-6">
              <span className="live-dot" aria-hidden />
              <span>
                RBA cash rate: <strong className="text-foreground">{rba.cashRate.toFixed(2)}%</strong>
              </span>
              <span className="text-border-strong">·</span>
              <span>Updated {today}</span>
            </div>

            <h1 className="text-[clamp(36px,4vw,54px)] mb-5">
              Australia's most<br />
              accurate mortgage<br />
              calculators.
            </h1>

            <p className="mb-10 max-w-[480px] text-[16px] leading-relaxed text-muted-foreground">
              Updated with live RBA rates. Stamp duty for all 8 states. No sign-up.
              No ads disguised as results.
            </p>

            <div className="grid max-w-[480px] grid-cols-2 gap-2">
              <Link to="/mortgage-calculator" className="hero-calc-link primary">
                <span>Mortgage repayments</span>
                <span aria-hidden>→</span>
              </Link>
              <Link to="/stamp-duty-calculator" className="hero-calc-link">
                <span>Stamp duty</span>
                <span aria-hidden className="text-muted-foreground">→</span>
              </Link>
              <Link to="/borrowing-power-calculator" className="hero-calc-link">
                <span>Borrowing power</span>
                <span aria-hidden className="text-muted-foreground">→</span>
              </Link>
              <Link to="/lmi-calculator" className="hero-calc-link">
                <span>LMI calculator</span>
                <span aria-hidden className="text-muted-foreground">→</span>
              </Link>
            </div>
          </div>

          {/* Data panel */}
          <aside className="hero-data-panel">
            <div className="data-header">
              <span>Current Australian rates</span>
              <span className="data-fresh">● Live</span>
            </div>
            <div className="data-row">
              <span className="data-label">RBA cash rate</span>
              <span className="data-value">{rba.cashRate.toFixed(2)}%</span>
            </div>
            <div className="data-row">
              <span className="data-label">Owner-occupier avg</span>
              <span className="data-value">{rba.ownerOccupier.toFixed(2)}%</span>
            </div>
            <div className="data-row">
              <span className="data-label">Typical variable rate</span>
              <span className="data-value">~{typicalVariable}%</span>
            </div>
            <div className="data-divider" />
            <div className="data-row">
              <span className="data-label">NSW FHB stamp duty</span>
              <span className="data-value green">Exempt ≤ $800k</span>
            </div>
            <div className="data-row">
              <span className="data-label">QLD first home grant</span>
              <span className="data-value green">$30,000</span>
            </div>
            <div className="data-row">
              <span className="data-label">VIC FHB stamp duty</span>
              <span className="data-value green">Exempt ≤ $600k</span>
            </div>
            <div className="data-footer">All 8 states · Updated daily</div>
          </aside>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-4 px-6 py-4">
          <span>Updated with live RBA rates</span>
          <span className="sep">·</span>
          <span>Stamp duty for all 8 states</span>
          <span className="sep">·</span>
          <span>No sign-up required</span>
          <span className="sep">·</span>
          <span>Free forever</span>
        </div>
      </div>

      {/* CALCULATOR DATA GRID */}
      <section className="bg-surface/40">
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8">
            <h2 className="section-title-redesign text-[clamp(24px,3vw,36px)]">
              Eight calculators. Real numbers.
            </h2>
            <p className="section-sub-redesign mt-2">
              Each tool runs the same Australian formulas your bank uses — including stamp duty
              concessions, APRA serviceability buffers and LMI premium tables.
            </p>
          </div>

          <div className="calc-card-grid">
            {calculators.map((c) => (
              <Link
                key={c.path}
                to={c.path}
                className="calc-data-card"
                style={{ ["--cat-fg" as never]: `var(${c.catVar})` }}
              >
                <div className="flex items-start justify-between">
                  <span className="calc-name">{c.name}</span>
                  <span className="calc-arrow" aria-hidden>↗</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="calc-stat">{c.statValue}</span>
                  <span className="calc-stat-label">{c.statLabel}</span>
                </div>
                <p className="calc-desc m-0">{c.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RATES TABLE — Bloomberg style */}
      <section className="border-y border-[var(--c-border-redesign)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="section-title-redesign text-[24px]">Live Australian property data</h2>
            <span className="text-[12px] text-[var(--c-slate-light)]">Updated {rba.lastUpdated}</span>
          </div>

          <div className="rates-table">
            <div className="rates-table-header">
              <span>Topic</span>
              <span>Current figure</span>
              <span>State</span>
              <span>Since</span>
            </div>
            <div className="rates-table-row">
              <span>RBA cash rate</span>
              <span className="rates-value">{rba.cashRate.toFixed(2)}%</span>
              <span>National</span>
              <span>{rba.lastUpdated}</span>
            </div>
            <div className="rates-table-row">
              <span>Owner-occupier average rate</span>
              <span className="rates-value">{rba.ownerOccupier.toFixed(2)}%</span>
              <span>National</span>
              <span>{rba.lastUpdated}</span>
            </div>
            <div className="rates-table-row">
              <span>FHB stamp duty exemption</span>
              <span className="rates-value green">$0</span>
              <span>NSW ≤ $800k</span>
              <span>Jul 2023</span>
            </div>
            <div className="rates-table-row">
              <span>First Home Owner Grant</span>
              <span className="rates-value green">$30,000</span>
              <span>QLD</span>
              <span>Nov 2023</span>
            </div>
            <div className="rates-table-row">
              <span>VIC FHB stamp duty</span>
              <span className="rates-value green">Exempt ≤ $600k</span>
              <span>VIC</span>
              <span>Jul 2024</span>
            </div>
            <div className="rates-table-row">
              <span>LMI avoided at deposit</span>
              <span className="rates-value">20%</span>
              <span>National</span>
              <span>—</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "var(--c-bg-redesign)" }}>
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <h2 className="section-title-redesign mb-8 text-[clamp(24px,3vw,36px)]">
            Frequently asked
          </h2>
          <FAQ items={FAQS.home} />
        </div>
      </section>
    </>
  );
};

export default Home;
