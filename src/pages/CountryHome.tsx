import { useParams, Navigate, Link } from "react-router-dom";
import { countries, calculatorTypes, calculatorMeta } from "@/data/countries";
import { generateCountryMeta } from "@/lib/seo/metadata";
import SEOHead from "@/components/SEOHead";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import AdPlaceholder, { TrustDisclaimer } from "@/components/AdPlaceholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calculator, TrendingUp, Banknote } from "lucide-react";

const icons: Record<string, typeof Calculator> = {
  "mortgage-calculator": Calculator,
  "borrowing-power-calculator": TrendingUp,
  "stamp-duty-calculator": Banknote,
  "extra-repayments-calculator": TrendingUp,
  "loan-comparison-calculator": Calculator,
  "loan-calculator": Banknote,
  "interest-calculator": TrendingUp,
};

const year = new Date().getFullYear();

const countryContent: Record<string, { intro: string; body: string }> = {
  us: {
    intro: `Free, accurate financial calculators built for the United States. Estimate mortgage payments, compare loan options, and project investment growth — all in USD with US-specific defaults and market insights.`,
    body: `Our US financial calculators are designed with American market conditions in mind. Default values reflect current national averages: home prices around $350,000, mortgage rates in the 6–7% range, and 30-year fixed terms as the standard. Whether you're a first-time homebuyer exploring FHA loans, a homeowner considering refinancing, or an investor projecting compound interest returns, our tools provide instant, accurate calculations. We reference CFPB guidelines, Federal Reserve policy impacts, and current lending market trends to ensure our content remains relevant and helpful for American users.`,
  },
  au: {
    intro: `Free, accurate financial calculators built for Australia. Estimate home loan repayments, compare personal loan offers, and project savings growth — all in AUD with Australian market defaults and RBA rate context.`,
    body: `Our Australian calculators account for local conventions including LVR thresholds, LMI requirements, and RBA cash rate influences. Default values reflect Australian averages: property prices around A$600,000, interest rates in the 6% range, and 30-year loan terms. We cover topics specific to Australian borrowers including offset accounts, redraw facilities, the First Home Super Saver Scheme, and state-based stamp duty variations. Whether you're buying in Sydney, investing in Brisbane, or saving in Melbourne, our tools provide calculations calibrated to the Australian market.`,
  },
  ca: {
    intro: `Free, accurate financial calculators built for Canada. Estimate mortgage payments, compare loan options, and project investment growth — all in CAD with Canadian conventions including semi-annual compounding and stress test considerations.`,
    body: `Canadian mortgages use semi-annual compounding — a unique convention our calculators handle accurately. Default values reflect Canadian market conditions: home prices around C$500,000, rates in the 5.5% range, and 25-year amortization (the maximum for CMHC-insured mortgages). We cover CMHC insurance premiums, the mortgage stress test, TFSA and RRSP considerations, and the First Home Savings Account (FHSA). Whether you're a first-time buyer in Toronto, upgrading in Vancouver, or investing in Calgary, our tools are calibrated for the Canadian market.`,
  },
  uk: {
    intro: `Free, accurate financial calculators built for the United Kingdom. Estimate mortgage repayments, compare loan offers, and plan savings growth — all in GBP with UK-specific defaults including Bank of England base rate context and stamp duty land tax.`,
    body: `Our UK calculators reflect British market conditions: average property prices around £280,000, mortgage rates in the 5% range, and 25-year terms as the standard. We cover Stamp Duty Land Tax (SDLT) brackets for England, first-time buyer reliefs up to £425,000, Help to Buy ISA considerations, and the impact of Bank of England base rate changes on tracker and SVR mortgages. Whether you're buying in London, investing in Manchester, or saving in Edinburgh, our tools are calibrated for the UK market.`,
  },
};

const CountryHome = () => {
  const { country } = useParams<{ country: string }>();
  if (!country || !countries[country]) return <Navigate to="/us" replace />;
  const c = countries[country];
  const seoMeta = generateCountryMeta(c);
  const cc = countryContent[country];

  return (
    <>
      <SEOHead
        title={seoMeta.title}
        description={seoMeta.description}
        canonical={seoMeta.canonical}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: c.name, url: `/${c.code}` }]}
      />
      <div className="container py-8">
        <BreadcrumbNav items={[{ label: c.name }]} />
        <AdPlaceholder zone="top-banner" className="h-16 mb-6 hidden sm:flex" />

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {c.flag} {c.name} Financial Calculators ({year})
        </h1>
        <p className="text-base text-muted-foreground mb-8 max-w-2xl leading-relaxed">
          {cc.intro}
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

        {/* Comparison table */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">Compare Our {c.name} Calculators</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left p-3 font-semibold">Feature</th>
                  <th className="text-left p-3 font-semibold">Mortgage</th>
                  <th className="text-left p-3 font-semibold">Loan</th>
                  <th className="text-left p-3 font-semibold">Interest</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-t"><td className="p-3 font-medium text-foreground">Best For</td><td className="p-3">Home purchases</td><td className="p-3">Personal/auto loans</td><td className="p-3">Savings & investments</td></tr>
                <tr className="border-t"><td className="p-3 font-medium text-foreground">Default Amount</td><td className="p-3">{c.currencySymbol}{c.defaultAmount.toLocaleString()}</td><td className="p-3">{c.currencySymbol}20,000</td><td className="p-3">{c.currencySymbol}10,000</td></tr>
                <tr className="border-t"><td className="p-3 font-medium text-foreground">Default Rate</td><td className="p-3">{c.defaultRate}%</td><td className="p-3">8%</td><td className="p-3">5%</td></tr>
                <tr className="border-t"><td className="p-3 font-medium text-foreground">Amortization</td><td className="p-3">✓ Full schedule</td><td className="p-3">✓ Full schedule</td><td className="p-3">Year-by-year</td></tr>
                <tr className="border-t"><td className="p-3 font-medium text-foreground">Extra Payments</td><td className="p-3">✓</td><td className="p-3">—</td><td className="p-3">Monthly contributions</td></tr>
              </tbody>
            </table>
          </div>
        </section>

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
            <p>{cc.body}</p>
            <p>All calculations use {c.currency} ({c.currencySymbol}) and follow {c.name} financial conventions. Results are for informational purposes only — always consult a qualified financial professional before making major financial decisions.</p>
          </div>
        </section>

        <TrustDisclaimer />
      </div>
    </>
  );
};

export default CountryHome;
