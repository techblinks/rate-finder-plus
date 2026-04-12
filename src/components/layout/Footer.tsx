import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import { countries, calculatorTypes, calculatorMeta } from "@/data/countries";

const Footer = () => (
  <footer className="border-t bg-primary text-primary-foreground mt-16">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-3">
            <Calculator className="h-5 w-5" />
            Zune Calculator
          </Link>
          <p className="text-sm opacity-80">
            Free financial calculators for smarter money decisions. Trusted by users across the US, Australia, and Canada.
          </p>
        </div>

        {Object.values(countries).map((c) => (
          <div key={c.code}>
            <h3 className="font-semibold mb-3">{c.flag} {c.name}</h3>
            <ul className="space-y-2">
              {calculatorTypes.map((calc) => (
                <li key={calc}>
                  <Link to={`/${c.code}/${calc}`} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                    {calculatorMeta[calc].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-primary-foreground/20">
        <p className="text-xs opacity-60 text-center">
          © {new Date().getFullYear()} ZuneCalculator.com. All rights reserved. We do not provide financial services. We connect users with third-party providers. Calculations are for informational purposes only.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
