import { Link } from "react-router-dom";
import { useRbaRates } from "@/hooks/useRbaRates";

const year = new Date().getFullYear();

const CALC_LINKS = [
  { to: "/mortgage-calculator", label: "Mortgage" },
  { to: "/stamp-duty-calculator", label: "Stamp Duty" },
  { to: "/borrowing-power-calculator", label: "Borrowing Power" },
  { to: "/lmi-calculator", label: "LMI" },
  { to: "/extra-repayments-calculator", label: "Extra Repayments" },
  { to: "/loan-comparison-calculator", label: "Loan Comparison" },
  { to: "/rent-vs-buy-calculator", label: "Rent vs Buy" },
  { to: "/refinance-calculator", label: "Refinance" },
];

const GUIDE_LINKS = [
  { to: "/guides/stamp-duty-australia-2026", label: "Stamp Duty in Australia" },
  { to: "/guides/what-is-lmi", label: "What is LMI?" },
  { to: "/guides/borrowing-power-australia", label: "How Much Can I Borrow?" },
  { to: "/guides/first-home-buyer-grants-2026", label: "First Home Buyer Grants" },
  { to: "/guides/fixed-vs-variable-rate", label: "Fixed vs Variable Rate" },
];

const COMPANY_LINKS = [
  { to: "/about", label: "About Calcy" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-of-use", label: "Terms of Use" },
];

const Footer = () => {
  const rba = useRbaRates();
  return (
    <footer className="footer-navy mt-20">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="footer-brand-text inline-block">
            Calcy
          </Link>
          <p className="mt-3 max-w-[280px] text-[13px] leading-relaxed text-white/40">
            Australia's free mortgage and property calculator suite. Live RBA rates, all 8 states, no sign-up.
          </p>
        </div>

        <div>
          <h3 className="footer-heading mb-4">Calculators</h3>
          <ul className="space-y-2 text-[13px]">
            {CALC_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="footer-heading mb-4">Guides</h3>
          <ul className="space-y-2 text-[13px]">
            {GUIDE_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/guides" className="!text-white/85">
                All guides →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="footer-heading mb-4">Company</h3>
          <ul className="space-y-2 text-[13px]">
            {COMPANY_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6">
        <div className="footer-rba mt-2 flex flex-col items-start justify-between gap-2 px-0 py-5 sm:flex-row sm:items-center">
          <span>
            RBA cash rate: <strong className="font-medium text-white/70">{rba.cashRate.toFixed(2)}%</strong> · Updated {rba.lastUpdated}
          </span>
          <span>© {year} Calcy — calcy.com.au</span>
        </div>
      </div>

      <div className="border-t border-white/5">
        <p className="mx-auto max-w-[900px] px-6 py-5 text-[11px] leading-relaxed text-white/30">
          Calculations are estimates for illustrative purposes only. Calcy is not a lender, broker, bank, or financial adviser
          and does not provide financial advice. All calculator results should be verified with a licensed Australian financial
          professional before making any financial decision. Stamp duty rates are indicative for {year} and subject to change —
          confirm with your state revenue office.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
