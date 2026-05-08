import { Link } from "react-router-dom";

const year = new Date().getFullYear();

// Update these monthly
const RBA_RATE = "4.35%";
const RBA_UPDATED = "May 2026";

const CALC_LINKS = [
  { to: "/mortgage-calculator", label: "Mortgage Calculator" },
  { to: "/stamp-duty-calculator", label: "Stamp Duty Calculator" },
  { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
  { to: "/lmi-calculator", label: "LMI Calculator" },
  { to: "/extra-repayments-calculator", label: "Extra Repayments Calculator" },
  { to: "/loan-comparison-calculator", label: "Loan Comparison Calculator" },
  { to: "/rent-vs-buy-calculator", label: "Rent vs Buy Calculator" },
  { to: "/refinance-calculator", label: "Refinance Calculator" },
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

const headingClass =
  "mb-3 text-[13px] font-medium tracking-[0.02em] text-foreground";
const linkClass =
  "text-[13px] leading-[2] text-muted-foreground transition-colors hover:text-accent hover:underline";

const Footer = () => (
  <footer className="mt-16 border-t border-border bg-surface">
    {/* Section 1 — Main columns */}
    <div className="page-shell py-12">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-block font-display text-[22px] font-extrabold text-foreground">
            Calcy
          </Link>
          <p className="mt-3 text-[13px] leading-[1.6] text-muted-foreground">
            Australia's free mortgage and property calculator suite.
          </p>
          <p className="mt-2 text-[12px] leading-[1.5] text-muted-foreground">
            Updated monthly with current RBA rates and stamp duty rules for all 8 states.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              🇦🇺 Australian-made
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              Updated {RBA_UPDATED}
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              Free forever
            </span>
          </div>
        </div>

        {/* Calculators */}
        <div>
          <h3 className={headingClass}>Calculators</h3>
          <ul>
            {CALC_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={linkClass}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Guides */}
        <div>
          <h3 className={headingClass}>Guides</h3>
          <ul>
            {GUIDE_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={linkClass}>{l.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/guides" className="text-[13px] leading-[2] font-medium text-accent hover:underline">
                All guides →
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className={headingClass}>Company</h3>
          <ul>
            {COMPANY_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={linkClass}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Current RBA rate
            </p>
            <p className="mt-1 font-display text-[28px] font-extrabold leading-none text-accent tnum">
              {RBA_RATE}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Updated {RBA_UPDATED}</p>
            <Link
              to="/mortgage-calculator"
              className="mt-2 inline-block text-[12px] font-medium text-accent hover:underline"
            >
              Recalculate with current rate →
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Section 2 — RBA rate update bar */}
    <div className="border-t border-border bg-accent-light/40">
      <div className="page-shell flex flex-col items-center gap-2 px-6 py-3 text-[13px] text-foreground sm:flex-row sm:justify-center sm:gap-3">
        <span>
          📊 RBA cash rate: <strong className="font-semibold">{RBA_RATE}</strong> · Last updated:{" "}
          {RBA_UPDATED} · Following cuts in February and March 2026
        </span>
        <Link to="/mortgage-calculator" className="font-medium text-accent hover:underline">
          Recalculate my mortgage repayments →
        </Link>
      </div>
    </div>

    {/* Section 3 — Legal disclaimer */}
    <div className="border-t border-border bg-background">
      <p className="mx-auto max-w-[900px] px-6 py-4 text-[11px] leading-relaxed text-muted-foreground">
        Calculations are estimates for illustrative purposes only. Calcy is not a lender, broker,
        bank, or financial adviser and does not provide financial advice. All calculator results
        should be verified with a licensed Australian financial professional before making any
        financial decision. Stamp duty rates are indicative for 2026 and subject to change —
        confirm with your state revenue office. LMI estimates depend on your lender's insurer
        (Helia or QBE).
      </p>
    </div>

    {/* Section 4 — Copyright */}
    <div className="border-t border-border">
      <div className="page-shell flex flex-col items-center justify-between gap-2 px-6 py-3 text-[12px] text-muted-foreground sm:flex-row">
        <p>© {year} Calcy — calcy.com.au</p>
        <nav className="flex items-center gap-3">
          <Link to="/privacy-policy" className="hover:text-accent hover:underline">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms-of-use" className="hover:text-accent hover:underline">Terms of Use</Link>
          <span>·</span>
          <Link to="/contact" className="hover:text-accent hover:underline">Contact</Link>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;
