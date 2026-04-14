import { Link } from "react-router-dom";
import { countries, calculatorTypes, calculatorMeta } from "@/data/countries";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calculator, Globe, Shield, TrendingUp } from "lucide-react";
import { generateHomeMeta } from "@/lib/seo/metadata";

const year = new Date().getFullYear();

const Index = () => {
  const seoMeta = generateHomeMeta();

  const hreflang = [
    { lang: "en-us", href: "/us/mortgage-calculator" },
    { lang: "en-au", href: "/au/mortgage-calculator" },
    { lang: "en-ca", href: "/ca/mortgage-calculator" },
    { lang: "x-default", href: "/" },
  ];

  return (
    <>
      <SEOHead
        title={seoMeta.title}
        description={seoMeta.description}
        canonical="/"
        breadcrumbs={[{ name: "Home", url: "/" }]}
        hreflang={hreflang}
      />
      <div className="container py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Financial Calculators You Can Trust
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Free, accurate mortgage, loan, and interest calculators for the United States, Australia, and Canada. Make smarter financial decisions with instant calculations in your local currency. Updated for {year}.
          </p>
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {Object.values(countries).map((c) => (
            <Link key={c.code} to={`/${c.code}`}>
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <span className="text-4xl mb-2">{c.flag}</span>
                  <CardTitle className="flex items-center justify-between">
                    {c.name}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {calculatorTypes.map((calc) => (
                      <li key={calc}>
                        <Link
                          to={`/${c.code}/${calc}`}
                          className="hover:text-accent transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          • {calculatorMeta[calc].title} {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Defaults: {c.currencySymbol}{c.defaultAmount.toLocaleString()} · {c.defaultRate}% · {c.defaultTerm}yr
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* All calculator links — SEO-rich */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            All Free Financial Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {calculatorTypes.map((calc) => (
              <div key={calc}>
                <h3 className="font-semibold text-foreground mb-3">{calculatorMeta[calc].title}</h3>
                <ul className="space-y-2">
                  {Object.values(countries).map((c) => (
                    <li key={c.code}>
                      <Link
                        to={`/${c.code}/${calc}`}
                        className="text-sm text-muted-foreground hover:text-accent transition-colors"
                      >
                        {c.flag} {calculatorMeta[calc].title} {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            <Globe className="inline h-6 w-6 mr-2" />
            Why ZuneCalculator.com?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-sm text-muted-foreground">
            <div>
              <Shield className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="font-semibold text-foreground mb-1">Country-Specific</p>
              <p>Defaults, terminology, and content tailored to US, Australian, and Canadian markets and currencies.</p>
            </div>
            <div>
              <Calculator className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="font-semibold text-foreground mb-1">100% Free, No Sign-Up</p>
              <p>No registration, no paywalls. Instant, accurate results every time — on any device.</p>
            </div>
            <div>
              <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="font-semibold text-foreground mb-1">Detailed Breakdowns</p>
              <p>Full amortization schedules, payment comparisons, and exportable results for informed decisions.</p>
            </div>
          </div>
        </section>

        <p className="text-xs text-center text-muted-foreground">
          © {year} ZuneCalculator.com. We do not provide financial services or advice. We connect users with third-party providers. All calculations are for informational purposes only.
        </p>
      </div>
    </>
  );
};

export default Index;
