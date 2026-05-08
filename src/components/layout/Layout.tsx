import { Outlet, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import MobileBottomNav from "@/components/MobileBottomNav";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import CookieConsent from "@/components/CookieConsent";

const FULLSCREEN_CALC_PATHS = [
  "/mortgage-calculator",
  "/stamp-duty-calculator",
  "/borrowing-power-calculator",
  "/lmi-calculator",
  "/extra-repayments-calculator",
  "/loan-comparison-calculator",
  "/rent-vs-buy-calculator",
  "/refinance-calculator",
];

const Layout = () => {
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const inCalc = FULLSCREEN_CALC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const fullscreen = isMobile && inCalc;

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ paddingBottom: isMobile ? 80 : 0 }}>
      <OrganizationJsonLd />
      {!fullscreen && <Header />}
      {fullscreen && (
        <div className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background/95 px-3 backdrop-blur">
          <Link
            to="/"
            aria-label="Back to home"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      {!fullscreen && <Footer />}
      <MobileBottomNav />
      <PwaInstallPrompt />
      <CookieConsent />
    </div>
  );
};

export default Layout;
