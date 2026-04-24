import { Link } from "react-router-dom";

const year = new Date().getFullYear();

const Footer = () => (
  <footer className="mt-16 bg-navy px-6 py-12 text-center text-white md:py-14">
    <Link to="/" className="font-display text-2xl text-white">Zune Calculator</Link>
    <p className="mt-2 text-[13px] text-white/35">Mortgage Calculator · Australia · USA · Canada · UK</p>
    <p className="mx-auto mt-6 max-w-xl text-[11px] leading-relaxed text-white/25">
      Calculations are estimates for illustrative purposes only. Zune Calculator is not a lender, broker, bank, or financial adviser and does not provide financial advice.
    </p>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-white/35">
      <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
      <Link to="/terms" className="hover:text-white">Terms of Use</Link>
      <span>zunecalculator.com</span>
    </div>
    <p className="mt-6 text-[11px] text-white/25">© {year} zunecalculator.com — For illustrative purposes only. Not financial advice.</p>
  </footer>
);

export default Footer;
