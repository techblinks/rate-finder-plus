import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { to: "/mortgage-calculator", label: "Mortgage" },
  { to: "/stamp-duty-calculator", label: "Stamp Duty" },
  { to: "/borrowing-power-calculator", label: "Borrowing" },
  { to: "/extra-repayments-calculator", label: "Extra" },
  { to: "/lmi-calculator", label: "LMI" },
  { to: "/loan-comparison-calculator", label: "Compare" },
];

const Header = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="page-shell flex h-14 items-center justify-between">
        <Link to="/" className="relative flex items-baseline pb-1" onClick={() => setOpen(false)} aria-label="Calcy home">
          <span className="text-[18px] font-semibold tracking-tight text-foreground">Calcy</span>
          <span aria-hidden="true" className="absolute bottom-0 right-0 h-[3px] w-1 rounded-[2px] bg-accent" />
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

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="md:hidden border-t border-border bg-background"
        >
          <ul className="page-shell py-3">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block py-3 text-[15px] font-medium ${
                      isActive ? "text-accent" : "text-foreground"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
