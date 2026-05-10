import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import calcyLogo from "@/assets/calcy-logo.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const NAV = [
  { to: "/mortgage-calculator", label: "Mortgage" },
  { to: "/stamp-duty-calculator", label: "Stamp Duty" },
  { to: "/borrowing-power-calculator", label: "Borrowing" },
  { to: "/lmi-calculator", label: "LMI" },
  { to: "/loan-comparison-calculator", label: "Compare" },
  { to: "/rent-vs-buy-calculator", label: "Rent vs Buy" },
  { to: "/refinance-calculator", label: "Refinance" },
  { to: "/guides", label: "Guides" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const { logo_url, logo_height } = useSiteSettings();
  const src = logo_url || calcyLogo;
  const h = Math.max(20, Math.min(72, logo_height || 32));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="page-shell flex h-[60px] items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)} aria-label="Calcy home" className="flex items-center">
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

        <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-[13px] font-medium transition-colors ${
                  isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

      </div>
    </header>
  );
};

export default Header;
