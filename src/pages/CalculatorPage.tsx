import { useParams, Navigate } from "react-router-dom";
import { countries, calculatorMeta, CalculatorType } from "@/data/countries";
import { parseCityFromCalculatorSlug, getCityBySlug } from "@/data/cities";
import { getFAQs } from "@/data/faq";
import { getEnhancedContent } from "@/lib/seo/content";
import { generateCalculatorMeta } from "@/lib/seo/metadata";
import SEOHead from "@/components/SEOHead";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import AdPlaceholder, { AffiliateCTA, TrustDisclaimer } from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import ContentBlocks from "@/components/ContentBlocks";
import InternalLinks from "@/components/InternalLinks";
import MortgageCalculator from "@/components/calculators/MortgageCalculator";
import BorrowingPowerCalculator from "@/components/calculators/BorrowingPowerCalculator";
import StampDutyCalculator from "@/components/calculators/StampDutyCalculator";
import ExtraRepaymentsCalculator from "@/components/calculators/ExtraRepaymentsCalculator";
import MortgageInsuranceCalculator from "@/components/calculators/MortgageInsuranceCalculator";
import LoanComparisonCalculator from "@/components/calculators/LoanComparisonCalculator";
import LoanCalculator from "@/components/calculators/LoanCalculator";
import InterestCalculator from "@/components/calculators/InterestCalculator";
import CityCalculatorPage from "@/pages/CityCalculatorPage";

const calculatorComponents: Partial<Record<CalculatorType, React.FC<{ country: any }>>> = {
  "mortgage-calculator": MortgageCalculator,
  "borrowing-power-calculator": BorrowingPowerCalculator,
  "stamp-duty-calculator": StampDutyCalculator,
  "extra-repayments-calculator": ExtraRepaymentsCalculator,
  "mortgage-insurance-calculator": MortgageInsuranceCalculator,
  "loan-comparison-calculator": LoanComparisonCalculator,
  "loan-calculator": LoanCalculator,
  "interest-calculator": InterestCalculator,
};

const year = new Date().getFullYear();

const CalculatorPage = () => {
  const { country, calculator } = useParams<{ country: string; calculator: string }>();
  if (!country || !countries[country]) return <Navigate to="/us" replace />;

  // Check if this is a city page (e.g., mortgage-calculator-new-york)
  const parsed = parseCityFromCalculatorSlug(calculator || "");
  if (parsed.calcType && parsed.citySlug && getCityBySlug(country, parsed.citySlug)) {
    return <CityCalculatorPage />;
  }

  const calcType = calculator as CalculatorType;
  if (!calculatorMeta[calcType]) return <Navigate to={`/${country}`} replace />;

  const c = countries[country];
  const meta = calculatorMeta[calcType];
  const faqs = getFAQs(calcType, country);
  const content = getEnhancedContent(calcType, c);
  const seoMeta = generateCalculatorMeta(calcType, c);
  const CalcComponent = calculatorComponents[calcType];
  if (!CalcComponent) return <Navigate to={`/${country}`} replace />;

  const hreflang = Object.keys(countries).map((code) => ({
    lang: code === "us" ? "en-us" : code === "au" ? "en-au" : code === "ca" ? "en-ca" : "en-gb",
    href: `/${code}/${calcType}`,
  }));

  return (
    <>
      <SEOHead
        title={seoMeta.title}
        description={seoMeta.description}
        canonical={seoMeta.canonical}
        country={country}
        calculatorType={calcType}
        faqs={faqs}
        hreflang={hreflang}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: c.name, url: `/${country}` },
          { name: meta.title, url: `/${country}/${calculator}` },
        ]}
      />
      <div className="container py-7 md:py-10">
        <BreadcrumbNav
          items={[
            { label: c.name, href: `/${country}` },
            { label: meta.title },
          ]}
        />

        <AdPlaceholder zone="top-banner" className="h-16 mb-6 hidden sm:flex" />

        <h1 className="mb-3 text-4xl text-foreground md:text-5xl">
          {c.flag} {content.h1}
        </h1>
        <p className="mb-8 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {content.intro}
        </p>

        <CalcComponent country={c} />

        <AffiliateCTA countryName={c.name} symbol={c.currencySymbol} />

        <AdPlaceholder zone="post-calculator" className="h-20 mt-2 mb-8" />

        {/* How It Works */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">How the {meta.title} Works</h2>
          <p className="text-muted-foreground leading-relaxed">{content.howItWorks}</p>
        </section>

        {/* Local Insights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {calcType === "mortgage-calculator" ? `Mortgage Rates in ${c.name} ${year}` :
             calcType === "loan-calculator" ? `Loan Rates in ${c.name} ${year}` :
             calcType === "interest-calculator" ? `Savings & Interest Rates in ${c.name} ${year}` :
             `${meta.shortTitle} Insights in ${c.name} ${year}`}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{content.localInsights}</p>
        </section>

        {/* Tips */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Expert Tips for {c.name} Borrowers
          </h2>
          <ul className="space-y-2">
            {content.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-accent font-bold mt-0.5">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Key Terms */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">Key Financial Terms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.keyTerms.map((kt, i) => (
              <div key={i} className="border rounded-lg p-4">
                <p className="font-semibold text-foreground text-sm mb-1">{kt.term}</p>
                <p className="text-sm text-muted-foreground">{kt.definition}</p>
              </div>
            ))}
          </div>
        </section>

        <AdPlaceholder zone="in-content" className="h-20 my-8" />

        <FAQSection faqs={faqs} />

        <TrustDisclaimer />

        <InternalLinks currentCountry={country} currentCalc={calcType} />
      </div>
    </>
  );
};

export default CalculatorPage;
