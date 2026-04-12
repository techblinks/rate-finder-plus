import { Link, useParams } from "react-router-dom";
import { Calculator } from "lucide-react";
import { countries, calculatorTypes, calculatorMeta } from "@/data/countries";

const Footer = () => {
  const { country } = useParams<{ country: string }>();
  const currentCountry = country && countries[country] ? country : "us";

  return (
    <footer className="border-t bg-primary text-primary-foreground mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to={`/${currentCountry}`} className="flex items-center gap-2 font-bold text-lg mb-3">
              <Calculator className="h-5 w-5" />
              Zune Calculator
            </Link>
            <p className="text-sm opacity-80">
              Free financial calculators for smarter money decisions. Trusted by users across the US, Australia, and Canada.
            </p>
          </div>

          {/* Calculators by country */}
          {Object.values(countries).map((c) => (
            <div key={c.code}>
              <h3 className="font-semibold mb-3">{c.flag} {c.name}</h3>
              <ul className="space-y-2">
                {calculatorTypes.map((calc) => (
                  <li key={calc}>
                    <Link
                      to={`/${c.code}/${calc}`}
                      className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {calculatorMeta[calc].title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/20 text-center">
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} ZuneCalculator.com. All rights reserved. We do not provide financial services. We connect users with third-party providers.
          </p>
          <p className="text-xs opacity-40 mt-1">
            Calculations are for informational purposes only and should not be considered financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
