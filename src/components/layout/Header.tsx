import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import calcyLogo from "@/assets/calcy-logo.webp";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import MobileSearchSheet from "@/components/mobile/MobileSearchSheet";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreActive = MORE.some((m) => pathname.startsWith(m.to));

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

  return (
    <header className="sticky top-0 z-40">
      {/* Mobile (< md): clean logo bar — no hamburger.
          All calculators reachable via bottom tab + homepage card grid. */}
      <div
        className="md:hidden bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex h-[60px] items-center justify-between px-4">
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
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 active:scale-95 transition-transform"
          >
            <Search className="h-[20px] w-[20px]" strokeWidth={2} />
          </button>
        </div>
      </div>
      <MobileSearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Desktop (≥ md) */}
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
