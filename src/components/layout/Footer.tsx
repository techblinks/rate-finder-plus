import { Link } from "react-router-dom";

const year = new Date().getFullYear();

const Footer = () => (
  <footer className="mt-16 border-t border-border bg-surface py-10">
    <div className="page-shell text-center">
      <p className="text-[13px] text-muted-foreground">
        © {year} Calcy — calcy.com.au
      </p>
      <nav className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[13px]">
        <Link to="/about" className="link-accent">About</Link>
        <span className="text-muted-foreground">·</span>
        <Link to="/guides" className="link-accent">Guides</Link>
        <span className="text-muted-foreground">·</span>
        <Link to="/contact" className="link-accent">Contact</Link>
        <span className="text-muted-foreground">·</span>
        <Link to="/privacy-policy" className="link-accent">Privacy Policy</Link>
        <span className="text-muted-foreground">·</span>
        <Link to="/terms-of-use" className="link-accent">Terms of Use</Link>
      </nav>
      <p className="mx-auto mt-6 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
        Calculations are estimates for illustrative purposes only. Calcy is not a lender, broker,
        bank, or financial adviser and does not provide financial advice. Always consult a licensed
        Australian financial professional before making financial decisions.
      </p>
    </div>
  </footer>
);

export default Footer;
