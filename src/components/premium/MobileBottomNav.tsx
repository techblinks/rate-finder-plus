import { useParams, useLocation, Link } from "react-router-dom";
import { primaryCalculatorTypes, calculatorMeta, countries } from "@/data/countries";

const MobileBottomNav = () => {
  const { country, calculator } = useParams<{ country: string; calculator: string }>();
  const location = useLocation();
  const currentCountry = country && countries[country] ? country : "us";
  const activeCalc = primaryCalculatorTypes.find((calc) => calculator?.startsWith(calc));
  const isOnCalcRoute = location.pathname.startsWith(`/${currentCountry}`) && !["/about", "/contact", "/privacy-policy", "/terms"].includes(location.pathname);

  if (!isOnCalcRoute) return null;

  return (
    <nav aria-label="Calculator navigation" className="safe-pb fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-6">
        {primaryCalculatorTypes.map((calc) => {
          const meta = calculatorMeta[calc];
          const active = calc === activeCalc;
          return (
            <li key={calc}>
              <Link to={`/${currentCountry}/${calc}`} className={`relative flex min-h-[68px] flex-col items-center justify-center gap-1 px-0.5 py-2 text-center transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} aria-current={active ? "page" : undefined}>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-b bg-primary" />}
                <span className="text-lg leading-none" aria-hidden>{meta.icon}</span>
                <span className="text-[9px] font-semibold leading-tight">{meta.tabLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
