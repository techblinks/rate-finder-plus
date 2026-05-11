import { Link, useLocation } from "react-router-dom";
import { Home, Calculator, BookOpen, ArrowLeftRight } from "lucide-react";
import { haptic } from "@/lib/haptic";

const TABS = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    to: "/mortgage-calculator",
    label: "Calculate",
    icon: Calculator,
    match: (p: string) =>
      p.includes("calculator") && !p.startsWith("/loan-comparison"),
  },
  {
    to: "/guides",
    label: "Guides",
    icon: BookOpen,
    match: (p: string) => p.startsWith("/guides"),
  },
  {
    to: "/loan-comparison-calculator",
    label: "Compare",
    icon: ArrowLeftRight,
    match: (p: string) => p.startsWith("/loan-comparison"),
  },
];

const MobileBottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = t.match(pathname);
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                onClick={() => haptic.light()}
                className={`flex h-16 flex-col items-center justify-center gap-1 transition-transform active:scale-90 ${
                  active ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.75 : 2}
                  fill={active ? "currentColor" : "none"}
                  fillOpacity={active ? 0.18 : 0}
                />
                <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
