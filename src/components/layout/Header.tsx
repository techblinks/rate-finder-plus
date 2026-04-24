import { Link, useLocation, useParams } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { countries, calculatorMeta, primaryCalculatorTypes } from "@/data/countries";

const Header = () => {
  const { country } = useParams<{ country: string }>();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentCountry = country && countries[country] ? country : "us";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-[0_1px_0_hsl(var(--navy)/0.06)] backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="container flex h-16 items-center justify-between md:h-[72px]">
        <Link to={`/${currentCountry}`} className="leading-none">
          <span className="block font-display text-[26px] text-navy">Zune</span>
          <span className="hidden text-[11px] font-medium text-muted-foreground md:block">Mortgage Calculator</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {primaryCalculatorTypes.map((calc) => {
            const active = location.pathname.includes(calc);
            return (
              <Link key={calc} to={`/${currentCountry}/${calc}`} className={`border-b-2 py-6 text-[13px] font-semibold transition-colors ${active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {calculatorMeta[calc].shortTitle}
              </Link>
            );
          })}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-2 py-1.5">
            {Object.values(countries).map((c) => (
              <Link key={c.code} to={`/${c.code}`} className={`rounded-md px-2 py-1 text-[13px] font-semibold transition-all hover:bg-card ${c.code === currentCountry ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`} title={c.name}>
                {c.code.toUpperCase()}
              </Link>
            ))}
          </div>
        </nav>

        <button className="rounded-lg border border-border bg-secondary p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-card p-4 md:hidden" aria-label="Mobile navigation">
          <div className="grid gap-1">
            {primaryCalculatorTypes.map((calc) => (
              <Link key={calc} to={`/${currentCountry}/${calc}`} className="rounded-lg px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setMobileOpen(false)}>
                {calculatorMeta[calc].title}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            {Object.values(countries).map((c) => <Link key={c.code} to={`/${c.code}`} className="rounded-lg bg-secondary px-3 py-2 text-xs font-bold" onClick={() => setMobileOpen(false)}>{c.code.toUpperCase()}</Link>)}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
