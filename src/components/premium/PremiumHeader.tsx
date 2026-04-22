import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calculator, ChevronDown, Check } from "lucide-react";
import { countries, primaryCalculatorTypes, calculatorMeta } from "@/data/countries";

/**
 * Premium bank-grade header.
 *  - Mobile: 64px white sticky bar with logo + country selector that opens a bottom sheet.
 *  - Desktop: 72px bar with horizontal tab nav + dropdown country selector.
 */
const PremiumHeader = () => {
  const { country } = useParams<{ country: string }>();
  const location = useLocation();
  const currentCountry = country && countries[country] ? country : "us";
  const c = countries[currentCountry];

  const [sheetOpen, setSheetOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close menus on route change.
  useEffect(() => {
    setSheetOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when bottom sheet open.
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border safe-pt">
        <div className="container flex h-16 md:h-[72px] items-center justify-between gap-4">
          <Link
            to={`/${currentCountry}`}
            className="flex items-center gap-2 group"
            aria-label="CalcVault home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-navy text-white shadow-md group-hover:shadow-lg transition-shadow">
              <Calculator className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <span className="font-display text-2xl font-bold text-navy leading-none">
              CalcVault
            </span>
          </Link>

          {/* Desktop tab nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
            {primaryCalculatorTypes.map((calc) => {
              const meta = calculatorMeta[calc];
              const path = `/${currentCountry}/${calc}`;
              const active = location.pathname === path || location.pathname.startsWith(`${path}-`);
              return (
                <Link
                  key={calc}
                  to={path}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "text-navy" : "text-muted-foreground hover:text-navy"
                  }`}
                >
                  {meta.tabLabel}
                  {active && (
                    <span className="absolute -bottom-[14px] left-3 right-3 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Country selector */}
          <div className="relative">
            {/* Mobile: opens bottom sheet */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-navy"
              aria-label="Change country"
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">{c.currency}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>

            {/* Desktop: dropdown card */}
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-navy hover:border-primary/30 transition-colors"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span>{c.name}</span>
              <span className="text-xs text-muted-foreground">({c.currency})</span>
              <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="hidden md:block absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card shadow-xl p-2 animate-scale-in origin-top-right z-50"
              >
                {Object.values(countries).map((opt) => (
                  <Link
                    key={opt.code}
                    to={`/${opt.code}`}
                    className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      opt.code === currentCountry
                        ? "bg-secondary text-navy font-semibold"
                        : "text-gray-700 hover:bg-secondary"
                    }`}
                    role="menuitem"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg leading-none">{opt.flag}</span>
                      <span className="flex flex-col">
                        <span>{opt.name}</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {opt.currency} · {opt.currencySymbol}
                        </span>
                      </span>
                    </span>
                    {opt.code === currentCountry && <Check className="h-4 w-4 text-primary" />}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom sheet country picker */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end animate-fade-in" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
            aria-label="Close country selector"
          />
          <div className="relative w-full bg-card rounded-t-3xl shadow-xl p-5 pb-7 safe-pb animate-slide-up">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
            <h2 className="font-display text-xl font-bold text-navy mb-4">Choose your market</h2>
            <ul className="space-y-1.5">
              {Object.values(countries).map((opt) => (
                <li key={opt.code}>
                  <Link
                    to={`/${opt.code}`}
                    className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-sm transition-colors ${
                      opt.code === currentCountry
                        ? "bg-secondary text-navy font-semibold"
                        : "text-gray-700 hover:bg-secondary"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl leading-none">{opt.flag}</span>
                      <span className="flex flex-col">
                        <span className="text-base">{opt.name}</span>
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {opt.currency} · {opt.currencySymbol}
                        </span>
                      </span>
                    </span>
                    {opt.code === currentCountry && <Check className="h-5 w-5 text-primary" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default PremiumHeader;
