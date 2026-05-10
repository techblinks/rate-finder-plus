import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileStickyResultBar from "@/components/mobile/MobileStickyResultBar";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import CookieConsent from "@/components/CookieConsent";

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

  return (
    <div
      className="flex min-h-screen flex-col bg-background pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0"
    >
      <OrganizationJsonLd />
      <Header />
      <main key={isMobile ? pathname : undefined} className={`flex-1 ${isMobile ? "mobile-page-transition" : ""}`}>
        <Outlet />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileStickyResultBar />
      <MobileBottomNav />
      <PwaInstallPrompt />
      <CookieConsent />
    </div>
  );
};

export default Layout;
