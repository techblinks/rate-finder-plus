import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calculator, BookOpen, ArrowLeftRight, Bookmark } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/mortgage-calculator", label: "Calc", icon: Calculator },
  { to: "/guides", label: "Guides", icon: BookOpen },
  { to: "/loan-comparison-calculator", label: "Compare", icon: ArrowLeftRight },
];

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setShow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const openSaved = () => {
    document.dispatchEvent(new CustomEvent("calcy:open-scenarios"));
  };

  if (!show) return null;

  return (
    <nav
      aria-label="Mobile bottom"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const Active = pathname === t.to || (t.to !== "/" && pathname.startsWith(t.to));
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                className={`flex h-16 flex-col items-center justify-center gap-1 ${
                  Active ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={Active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={openSaved}
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-muted-foreground"
          >
            <Bookmark className="h-5 w-5" />
            <span className="text-[10px] font-medium">Saved</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
