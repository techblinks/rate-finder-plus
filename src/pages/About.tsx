import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { Calculator, Globe, Shield, TrendingUp, Users, Heart, Mail, MapPin } from "lucide-react";
import { countries, calculatorTypes, calculatorMeta } from "@/data/countries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const year = new Date().getFullYear();

const About = () => (
  <>
    <SEOHead
      title={`About Zune Calculator — Free Financial Tools for US, AU & CA | Zune Calculator`}
      description="Learn about ZuneCalculator.com — free mortgage, loan, and interest calculators serving the United States, Australia, and Canada. Our mission and team."
      canonical="/about"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "About", url: "/about" },
      ]}
    />
    <div className="container py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-6">About Zune Calculator</h1>

      <section className="mb-10">
        <p className="text-base text-muted-foreground leading-relaxed mb-4">
          ZuneCalculator.com is a free financial calculator platform built to help individuals across the United States, Australia, and Canada make smarter financial decisions. Whether you're buying your first home, comparing personal loan offers, or projecting investment growth, our tools give you instant, accurate results tailored to your country's market.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed mb-4">
          We believe that understanding the numbers behind major financial decisions shouldn't require expensive software, confusing spreadsheets, or sign-up walls. That's why every calculator on our platform is completely free to use, with no registration required — just enter your numbers and get results in seconds.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed">
          Founded in {year}, ZuneCalculator.com has grown to serve thousands of users monthly with our suite of mortgage calculators, loan calculators, and compound interest tools. We continuously update our default values and content to reflect current market conditions in each country we serve.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          <Heart className="inline h-6 w-6 mr-2 text-accent" />
          Our Mission
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed mb-4">
          Our mission is to democratize financial literacy by providing world-class calculation tools at zero cost. We're committed to transparency, accuracy, and user-first design. Every calculator is built with verified formulas, country-specific defaults, and clear explanations so you can understand your results — not just see a number.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed">
          We don't provide financial advice. Instead, we empower you with the tools and knowledge to have informed conversations with lenders, financial advisors, and institutions. Our content is written by finance professionals and reviewed regularly for accuracy.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          <Globe className="inline h-6 w-6 mr-2 text-accent" />
          Countries We Serve
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.values(countries).map((c) => (
            <Link key={c.code} to={`/${c.code}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{c.flag} {c.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Calculators in {c.currency} ({c.currencySymbol}) with local defaults and market insights.
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          <Calculator className="inline h-6 w-6 mr-2 text-accent" />
          Our Calculators
        </h2>
        <div className="space-y-4">
          {calculatorTypes.map((calc) => (
            <div key={calc}>
              <h3 className="font-semibold text-foreground">{calculatorMeta[calc].title}</h3>
              <p className="text-sm text-muted-foreground">{calculatorMeta[calc].description}</p>
              <div className="flex gap-2 mt-1">
                {Object.values(countries).map((c) => (
                  <Link
                    key={c.code}
                    to={`/${c.code}/${calc}`}
                    className="text-xs text-accent hover:underline"
                  >
                    {c.flag} {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          <Shield className="inline h-6 w-6 mr-2 text-accent" />
          Trust & Accuracy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-semibold text-foreground mb-1">Verified Formulas</p>
            <p className="text-sm text-muted-foreground">Standard amortization and compound interest calculations used by financial institutions worldwide.</p>
          </div>
          <div className="text-center p-4">
            <Users className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-semibold text-foreground mb-1">Trusted by Thousands</p>
            <p className="text-sm text-muted-foreground">Users across three countries rely on our tools for important financial decisions every day.</p>
          </div>
          <div className="text-center p-4">
            <Globe className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-semibold text-foreground mb-1">Localized Content</p>
            <p className="text-sm text-muted-foreground">Country-specific defaults, terminology, regulations, and market insights for accurate results.</p>
          </div>
        </div>
      </section>

      <p className="text-xs text-muted-foreground text-center border-t pt-6">
        © {year} ZuneCalculator.com. We do not provide financial services or advice. All calculations are for informational purposes only. Please consult a qualified financial professional before making financial decisions.
      </p>
    </div>
  </>
);

export default About;
