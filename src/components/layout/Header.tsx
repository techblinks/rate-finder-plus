import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import calcyLogo from "@/assets/calcy-logo.webp";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useRbaRates } from "@/hooks/useRbaRates";

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

const MOBILE_DRAWER_LINKS = [
  { to: "/mortgage-calculator", label: "Mortgage Calculator" },
  { to: "/stamp-duty-calculator", label: "Stamp Duty Calculator" },
  { to: "/borrowing-power-calculator", label: "Borrowing Power" },
  { to: "/lmi-calculator", label: "LMI Calculator" },
  { to: "/loan-comparison-calculator", label: "Compare Loans" },
  { to: "/rent-vs-buy-calculator", label: "Rent vs Buy" },
  { to: "/refinance-calculator", label: "Refinance Calculator" },
  { to: "/extra-repayments-calculator", label: "Extra Repayments" },
];

const Header = () => {
  const { logo_url, logo_height } = useSiteSettings();
  const { pathname } = useLocation();
  const rba = useRbaRates();
  const src = logo_url || calcyLogo;
  const h = Math.max(20, Math.min(40, logo_height || 28));
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreActive = MORE.some((m) => pathname.startsWith(m.to));

  // Close dropdown on outside click + Escape
  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-40">
      {/* Mobile (< md): clean white logo bar + hamburger */}
      <div className="md:hidden border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="page-shell flex h-[60px] items-center justify-between">
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
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground active:scale-95 transition-transform"
          >
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Mobile slide-in drawer */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[100] bg-black/50"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        >
          <nav
            aria-label="Mobile menu"
            className="absolute right-0 top-0 h-full w-[280px] max-w-[85vw] overflow-y-auto bg-background shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[60px] items-center justify-between border-b border-border px-4">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground active:scale-95 transition-transform"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="px-2 py-3">
              <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Calculators
              </p>
              <ul>
                {MOBILE_DRAWER_LINKS.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`block rounded-md px-4 py-3 text-[15px] ${
                          active
                            ? "bg-accent/10 font-semibold text-accent"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="my-2 border-t border-border" />
              <Link
                to="/guides"
                className="block rounded-md px-4 py-3 text-[15px] text-foreground hover:bg-muted"
              >
                All Guides
              </Link>
            </div>
            <div className="border-t border-border px-4 py-3 text-[12px] text-muted-foreground">
              RBA cash rate: {rba.cashRate.toFixed(2)}% · {rba.lastUpdated}
            </div>
          </nav>
        </div>
      )}

      {/* Desktop (≥ md): dark navy nav */}
      <div className="hidden md:block site-nav-redesign">
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center gap-10 px-6">
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
              ref={moreRef}
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
                  className="dropdown-panel-redesign absolute left-0 top-full pt-2"
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
