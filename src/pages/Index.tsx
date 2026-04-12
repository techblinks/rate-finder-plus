import { Link } from "react-router-dom";
import { countries, calculatorTypes, calculatorMeta } from "@/data/countries";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calculator, Globe } from "lucide-react";

const Index = () => (
  <>
    <SEOHead
      title="Free Mortgage, Loan & Interest Calculators — US, Australia, Canada"
      description="ZuneCalculator.com offers free financial calculators for the US, Australia, and Canada. Calculate mortgage payments, loan costs, and compound interest instantly."
      canonical="/"
      breadcrumbs={[{ name: "Home", url: "/" }]}
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
          Free, accurate mortgage, loan, and interest calculators built for the United States, Australia, and Canada. Make smarter financial decisions today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
                    <li key={calc}>• {calculatorMeta[calc].title}</li>
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

      <section className="text-center mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          <Globe className="inline h-6 w-6 mr-2" />
          Why ZuneCalculator.com?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-1">Country-Specific</p>
            <p>Defaults and content tailored to local markets and currencies.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">100% Free</p>
            <p>No sign-ups, no paywalls. Instant results every time.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Detailed Breakdowns</p>
            <p>Full amortization schedules, comparisons, and exportable results.</p>
          </div>
        </div>
      </section>

      <p className="text-xs text-center text-muted-foreground">
        We do not provide financial services. We connect users with third-party providers. All calculations are for informational purposes only.
      </p>
    </div>
  </>
);

export default Index;
