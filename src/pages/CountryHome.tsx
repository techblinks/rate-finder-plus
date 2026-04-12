import { useParams, Navigate, Link } from "react-router-dom";
import { countries, calculatorTypes, calculatorMeta } from "@/data/countries";
import SEOHead from "@/components/SEOHead";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import AdPlaceholder, { TrustDisclaimer } from "@/components/AdPlaceholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calculator, TrendingUp, Banknote } from "lucide-react";

const icons = { "mortgage-calculator": Calculator, "loan-calculator": Banknote, "interest-calculator": TrendingUp };

const CountryHome = () => {
  const { country } = useParams<{ country: string }>();
  if (!country || !countries[country]) return <Navigate to="/us" replace />;
  const c = countries[country];

  return (
    <>
      <SEOHead
        title={`${c.name} Financial Calculators — Free Mortgage, Loan & Interest Tools`}
        description={`Free financial calculators for ${c.name}. Calculate mortgage payments, loan costs, and compound interest in ${c.currency}. Trusted by thousands.`}
        canonical={`/${c.code}`}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: c.name, url: `/${c.code}` }]}
      />
      <div className="container py-8">
        <BreadcrumbNav items={[{ label: c.name }]} />
        <AdPlaceholder zone="top-banner" className="h-16 mb-6 hidden sm:flex" />

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {c.flag} {c.name} Financial Calculators
        </h1>
        <p className="text-base text-muted-foreground mb-8 max-w-2xl leading-relaxed">
          Free, accurate financial calculators built for {c.name}. Estimate mortgage payments, compare loan options, and project investment growth — all in {c.currency}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {calculatorTypes.map((calc) => {
            const Icon = icons[calc];
            return (
              <Link key={calc} to={`/${c.code}/${calc}`}>
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-accent mb-2" />
                    <CardTitle className="flex items-center justify-between">
                      {calculatorMeta[calc].title}
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{calculatorMeta[calc].description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <AdPlaceholder zone="in-content" className="h-20 mb-10" />

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Popular Cities in {c.name}</h2>
          <div className="flex flex-wrap gap-2">
            {c.cities.map((city) => {
              const slug = city.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={city}
                  to={`/${c.code}/mortgage-calculator-${slug}`}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {city}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">About {c.name} Financial Calculators</h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Our {c.name} financial calculators are designed with local market conditions in mind. Default values reflect current {c.name} averages for property prices, interest rates, and loan terms.
            </p>
            <p>
              All calculations use {c.currency} ({c.currencySymbol}) and follow {c.name} financial conventions. Results are for informational purposes only.
            </p>
          </div>
        </section>

        <TrustDisclaimer />
      </div>
    </>
  );
};

export default CountryHome;
