import { useParams, Navigate } from "react-router-dom";
import { countries, calculatorMeta, CalculatorType } from "@/data/countries";
import { getFAQs } from "@/data/faq";
import { getPageContent } from "@/data/content";
import SEOHead from "@/components/SEOHead";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import ContentBlocks from "@/components/ContentBlocks";
import InternalLinks from "@/components/InternalLinks";
import MortgageCalculator from "@/components/calculators/MortgageCalculator";
import LoanCalculator from "@/components/calculators/LoanCalculator";
import InterestCalculator from "@/components/calculators/InterestCalculator";

const calculatorComponents: Record<CalculatorType, React.FC<{ country: any }>> = {
  "mortgage-calculator": MortgageCalculator,
  "loan-calculator": LoanCalculator,
  "interest-calculator": InterestCalculator,
};

const CalculatorPage = () => {
  const { country, calculator } = useParams<{ country: string; calculator: string }>();
  if (!country || !countries[country]) return <Navigate to="/us" replace />;

  const calcType = calculator as CalculatorType;
  if (!calculatorMeta[calcType]) return <Navigate to={`/${country}`} replace />;

  const c = countries[country];
  const meta = calculatorMeta[calcType];
  const faqs = getFAQs(calcType, c.name);
  const content = getPageContent(calcType, c);
  const CalcComponent = calculatorComponents[calcType];

  const titleTag = `${c.name} ${meta.title} — Free ${c.currency} Calculator (${new Date().getFullYear()})`;
  const metaDesc = `Use our free ${c.name} ${meta.title.toLowerCase()} to ${meta.description.toLowerCase()} Updated for ${new Date().getFullYear()} with ${c.name} rates.`;

  return (
    <>
      <SEOHead
        title={titleTag}
        description={metaDesc}
        canonical={`/${country}/${calculator}`}
        country={country}
        calculatorType={calcType}
        faqs={faqs}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: c.name, url: `/${country}` },
          { name: meta.title, url: `/${country}/${calculator}` },
        ]}
      />
      <div className="container py-8">
        <BreadcrumbNav
          items={[
            { label: c.name, href: `/${country}` },
            { label: meta.title },
          ]}
        />

        <AdPlaceholder zone="top-banner" className="h-20 mb-8" />

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {c.flag} {content.h1}
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          {content.intro}
        </p>

        <CalcComponent country={c} />

        <AdPlaceholder zone="post-calculator" className="h-20 mt-8" />

        <ContentBlocks
          howItWorks={content.howItWorks}
          whyUse={content.whyUse}
          tips={content.tips}
          keyTerms={content.keyTerms}
        />

        <AdPlaceholder zone="in-content" className="h-20 mt-8" />

        <FAQSection faqs={faqs} />

        <InternalLinks currentCountry={country} currentCalc={calcType} />
      </div>
    </>
  );
};

export default CalculatorPage;
