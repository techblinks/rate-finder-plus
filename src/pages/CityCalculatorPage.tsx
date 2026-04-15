import { useParams, Navigate, Link } from "react-router-dom";
import { countries, calculatorMeta, CalculatorType } from "@/data/countries";
import { getCityBySlug, generateCityFAQs, generateCityContent, citiesByCountry, parseCityFromCalculatorSlug } from "@/data/cities";
import { generateCalculatorMeta } from "@/lib/seo/metadata";
import SEOHead from "@/components/SEOHead";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import AdPlaceholder, { AffiliateCTA, TrustDisclaimer } from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import MortgageCalculator from "@/components/calculators/MortgageCalculator";
import LoanCalculator from "@/components/calculators/LoanCalculator";
import InterestCalculator from "@/components/calculators/InterestCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin } from "lucide-react";

const calculatorComponents: Record<CalculatorType, React.FC<{ country: any }>> = {
  "mortgage-calculator": MortgageCalculator,
  "loan-calculator": LoanCalculator,
  "interest-calculator": InterestCalculator,
};

const year = new Date().getFullYear();

const CityCalculatorPage = () => {
  const { country, calculator } = useParams<{ country: string; calculator: string }>();
  if (!country || !countries[country] || !calculator) return <Navigate to="/us" replace />;

  const { calcType, citySlug } = parseCityFromCalculatorSlug(calculator);
  if (!calcType || !citySlug) return <Navigate to={`/${country}`} replace />;

  const c = countries[country];
  const city = getCityBySlug(country, citySlug);
  if (!city) return <Navigate to={`/${country}/${calcType}`} replace />;

  const meta = calculatorMeta[calcType];
  const faqs = generateCityFAQs(city, c, calcType);
  const content = generateCityContent(city, c, calcType);
  const CalcComponent = calculatorComponents[calcType];

  const pageTitle = `${city.name} ${meta.title} ${year} | ZuneCalculator`;
  const pageDesc = `Free ${city.name} ${meta.shortTitle.toLowerCase()} calculator. Median home price ${c.currencySymbol}${city.medianHomePrice.toLocaleString()}, avg rate ${city.avgMortgageRate}%. Calculate payments instantly.`;

  const otherCities = (citiesByCountry[country] || []).filter((ct) => ct.slug !== citySlug).slice(0, 6);
  const otherCalcTypes = (["mortgage-calculator", "loan-calculator", "interest-calculator"] as CalculatorType[]).filter((ct) => ct !== calcType);

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDesc}
        canonical={`/${country}/${calculator}`}
        country={country}
        calculatorType={calcType}
        faqs={faqs}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: c.name, url: `/${country}` },
          { name: meta.title, url: `/${country}/${calcType}` },
          { name: `${city.name}`, url: `/${country}/${calculator}` },
        ]}
      />
      <div className="container py-8">
        <BreadcrumbNav
          items={[
            { label: c.name, href: `/${country}` },
            { label: meta.title, href: `/${country}/${calcType}` },
            { label: city.name },
          ]}
        />

        <AdPlaceholder zone="top-banner" className="h-16 mb-6 hidden sm:flex" />

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {c.flag} {content.h1}
        </h1>
        <p className="text-base text-muted-foreground mb-8 max-w-3xl leading-relaxed">
          {content.intro}
        </p>

        {/* City stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Median Price", value: `${c.currencySymbol}${city.medianHomePrice.toLocaleString()}` },
            { label: "Avg Rate", value: `${city.avgMortgageRate}%` },
            { label: "Avg Rent", value: `${c.currencySymbol}${city.avgRent.toLocaleString()}/mo` },
            { label: "Population", value: city.population },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <CalcComponent country={c} />

        <AffiliateCTA countryName={c.name} symbol={c.currencySymbol} />

        <AdPlaceholder zone="post-calculator" className="h-20 mt-2 mb-8" />

        {/* Local Insights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {meta.shortTitle} Rates in {city.name} {year}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{content.localInsights}</p>
        </section>

        {/* City highlights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {city.name} Market Highlights
          </h2>
          <ul className="space-y-2">
            {city.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-accent font-bold mt-0.5">✓</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Tips */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Tips for {city.name} Home Buyers
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

        <AdPlaceholder zone="in-content" className="h-20 my-8" />

        <FAQSection faqs={faqs} title={`${city.name} ${meta.shortTitle} FAQ`} />

        {/* Other cities same calculator */}
        <section className="mt-12 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {meta.title} in Other {c.name} Cities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherCities.map((ct) => (
                <Link key={ct.slug} to={`/${country}/${calcType}-${ct.slug}`}>
                  <Card className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        {ct.name} {meta.shortTitle} Calculator
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Median: {c.currencySymbol}{ct.medianHomePrice.toLocaleString()} · Rate: {ct.avgMortgageRate}%
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Other calculator types for same city */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              More {city.name} Calculators
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherCalcTypes.map((ct) => (
                <Link key={ct} to={`/${country}/${ct}-${citySlug}`}>
                  <Card className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        {city.name} {calculatorMeta[ct].title}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{calculatorMeta[ct].description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Link back to country-level calculator */}
          <div className="text-center">
            <Link
              to={`/${country}/${calcType}`}
              className="text-sm text-accent hover:underline"
            >
              ← Back to {c.name} {meta.title}
            </Link>
          </div>
        </section>

        <TrustDisclaimer />
      </div>
    </>
  );
};

export default CityCalculatorPage;
