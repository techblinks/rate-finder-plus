import { Link, useParams } from "react-router-dom";
import { Calculator, Menu, X } from "lucide-react";
import { useState } from "react";
import { countries, calculatorMeta, calculatorTypes } from "@/data/countries";

const Header = () => {
  const { country } = useParams<{ country: string }>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentCountry = country && countries[country] ? country : "us";

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to={`/${currentCountry}`} className="flex items-center gap-2 font-bold text-xl text-primary">
          <Calculator className="h-6 w-6" />
          <span>Zune Calculator</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {calculatorTypes.map((calc) => (
            <Link
              key={calc}
              to={`/${currentCountry}/${calc}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {calculatorMeta[calc].shortTitle}
            </Link>
          ))}
          <div className="flex items-center gap-1 border-l pl-4">
            {Object.values(countries).map((c) => (
              <Link
                key={c.code}
                to={`/${c.code}`}
                className={`text-lg px-1 hover:scale-110 transition-transform ${c.code === currentCountry ? "scale-110" : "opacity-60"}`}
                title={c.name}
              >
                {c.flag}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t bg-card p-4 space-y-2" aria-label="Mobile navigation">
          {calculatorTypes.map((calc) => (
            <Link
              key={calc}
              to={`/${currentCountry}/${calc}`}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {calculatorMeta[calc].title}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t">
            {Object.values(countries).map((c) => (
              <Link
                key={c.code}
                to={`/${c.code}`}
                className="text-xl"
                onClick={() => setMobileOpen(false)}
              >
                {c.flag}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
