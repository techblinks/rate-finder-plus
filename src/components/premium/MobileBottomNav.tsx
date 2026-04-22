import { useParams, useLocation, Link } from "react-router-dom";
import { primaryCalculatorTypes, calculatorMeta, countries } from "@/data/countries";

/**
 * Mobile-only fixed bottom navigation, banking-app style.
 * Exposes the 5 primary calculator tabs for the current country.
 */
const MobileBottomNav = () => {
  const { country, calculator } = useParams<{ country: string; calculator: string }>();
  const location = useLocation();
  const currentCountry = country && countries[country] ? country : "us";

  // Derive the active tab from the URL prefix so city pages still highlight properly.
  const activeCalc = primaryCalculatorTypes.find(
    (calc) => calculator?.startsWith(calc),
  );

  // Hide on routes that aren't calculator-related to avoid covering footer/legal copy.
  const isOnCalcRoute =
    location.pathname.startsWith(`/${currentCountry}`) &&
    !["/about", "/contact", "/privacy-policy", "/terms"].includes(location.pathname);

  if (!isOnCalcRoute) return null;

  return (
    <nav
      aria-label="Calculator navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-[0_-4px_24px_rgba(10,22,40,0.08)] safe-pb"
    >
      <ul className="flex items-stretch justify-around">
        {primaryCalculatorTypes.map((calc) => {
          const meta = calculatorMeta[calc];
          const active = calc === activeCalc;
          return (
            <li key={calc} className="flex-1">
              <Link
                to={`/${currentCountry}/${calc}`}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-h-[64px] relative transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b-full bg-primary" />
                )}
                <span className="text-xl leading-none" aria-hidden>
                  {meta.icon}
                </span>
                <span className="text-[10px] font-semibold leading-tight text-center">
                  {meta.tabLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
