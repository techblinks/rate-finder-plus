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
      className="flex min-h-screen flex-col bg-background"
      style={{ paddingBottom: isMobile ? `calc(64px + env(safe-area-inset-bottom))` : 0 }}
    >
      <OrganizationJsonLd />
      {!isMobile && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isMobile && <Footer />}
      <MobileStickyResultBar />
      <MobileBottomNav />
      <PwaInstallPrompt />
      <CookieConsent />
    </div>
  );
};

export default Layout;
