import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import calcyLogo from "@/assets/calcy-logo.webp";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const PRIMARY = [
  { to: "/mortgage-calculator", label: "Mortgage" },
  { to: "/stamp-duty-calculator", label: "Stamp Duty" },
  { to: "/borrowing-power-calculator", label: "Borrowing" },
];

const MORE = [
  { to: "/lmi-calculator", label: "LMI Calculator" },
  { to: "/loan-comparison-calculator", label: "Compare loans" },
  { to: "/rent-vs-buy-calculator", label: "Rent vs Buy" },
  { to: "/refinance-calculator", label: "Refinance" },
  { to: "/extra-repayments-calculator", label: "Extra Repayments" },
];

const Header = () => {
  const { logo_url, logo_height } = useSiteSettings();
  const { pathname } = useLocation();
  const src = logo_url || calcyLogo;
  const h = Math.max(20, Math.min(40, logo_height || 28));
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE.some((m) => pathname.startsWith(m.to));

  return (
    <header className="sticky top-0 z-40">
      {/* Mobile (< md): clean white logo bar — preserves existing mobile UX */}
      <div className="md:hidden border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="page-shell flex h-[60px] items-center">
          <Link to="/" aria-label="Calcy home" className="flex items-center">
            <img
              src={src}
              alt="Calcy"
              width={h * 4}
              height={h}
              style={{ height: `${h}px`, width: "auto" }}
              decoding="async"
              fetchPriority="high"
            />
          </Link>
        </div>
      </div>

      {/* Desktop (≥ md): dark navy nav */}
      <div className="hidden md:block site-nav-redesign">
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center gap-10 px-6">
          <Link to="/" aria-label="Calcy home" className="flex items-center">
            <img
              src={src}
              alt="Calcy"
              width={h * 4}
              height={h}
              style={{ height: `${h}px`, width: "auto", filter: "brightness(0) invert(1)" }}
              decoding="async"
              fetchPriority="high"
            />
          </Link>

          <nav aria-label="Primary" className="flex flex-1 items-center gap-8">
            {PRIMARY.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link-redesign ${isActive ? "active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
                onFocus={() => setMoreOpen(true)}
                className={`nav-link-redesign inline-flex items-center gap-1 ${moreActive ? "active" : ""}`}
              >
                More calculators
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              {moreOpen && (
                <div
                  role="menu"
                  className="dropdown-panel-redesign absolute left-0 top-full mt-2"
                >
                  {MORE.map((item) => (
                    <Link key={item.to} to={item.to} role="menuitem" onClick={() => setMoreOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <NavLink
            to="/guides"
            className={({ isActive }) =>
              `nav-link-redesign ml-auto ${isActive ? "active" : ""}`
            }
          >
            Guides
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;
