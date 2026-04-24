import { Link } from "react-router-dom";
import { countries, primaryCalculatorTypes, calculatorMeta } from "@/data/countries";
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
    { lang: "en-gb", href: "/gb/mortgage-calculator" },
    { lang: "x-default", href: "/" },
  ];

  return (
    <>
      <SEOHead title={seoMeta.title} description={seoMeta.description} canonical="/" breadcrumbs={[{ name: "Home", url: "/" }]} hreflang={hreflang} />
      <div className="container py-12 md:py-16">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">zunecalculator.com</p>
          <h1 className="mb-4 text-5xl text-foreground md:text-6xl">Zune Mortgage Calculator</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Bank-grade mortgage repayment, borrowing power, stamp duty, insurance, and comparison calculators for Australia, USA, Canada, and UK. Updated for {year}.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-4">
          {Object.values(countries).map((c) => (
            <Link key={c.code} to={`/${c.code}`}>
              <Card className="h-full rounded-xl border-border shadow-sm transition-colors hover:border-gray-300 hover:shadow-sm group">
                <CardHeader>
                  <span className="mb-2 text-3xl">{c.flag}</span>
                  <CardTitle className="flex items-center justify-between font-display text-2xl font-normal">
                    {c.name}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {primaryCalculatorTypes.map((calc) => (
                      <li key={calc}><Link to={`/${c.code}/${calc}`} className="transition-colors hover:text-primary" onClick={(e) => e.stopPropagation()}>{calculatorMeta[calc].shortTitle}</Link></li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground">Defaults: {c.currencySymbol}{c.defaultAmount.toLocaleString()} · {c.defaultRate}% · {c.defaultTerm}yr</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <section className="mb-12">
          <h2 className="mb-6 text-center text-3xl text-foreground">Mortgage Tools</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {primaryCalculatorTypes.map((calc) => (
              <div key={calc} className="premium-card p-5">
                <h3 className="mb-2 font-sans text-sm font-bold text-foreground">{calculatorMeta[calc].title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{calculatorMeta[calc].description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 text-center">
          <h2 className="mb-6 text-3xl text-foreground"><Globe className="mr-2 inline h-6 w-6" />Why Zune Calculator?</h2>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 text-sm text-muted-foreground sm:grid-cols-3">
            <div><Shield className="mx-auto mb-2 h-8 w-8 text-primary" /><p className="mb-1 font-semibold text-foreground">Country-Specific</p><p>Defaults and terminology tailored to each market.</p></div>
            <div><Calculator className="mx-auto mb-2 h-8 w-8 text-primary" /><p className="mb-1 font-semibold text-foreground">Free, No Sign-Up</p><p>Instant results on any device.</p></div>
            <div><TrendingUp className="mx-auto mb-2 h-8 w-8 text-primary" /><p className="mb-1 font-semibold text-foreground">Detailed Breakdowns</p><p>Repayments, upfront costs, and comparisons.</p></div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
