import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileStickyResultBar from "@/components/mobile/MobileStickyResultBar";
import InstallPrompt from "@/components/InstallPrompt";
import CookieConsent from "@/components/CookieConsent";
import RouteTransition from "@/components/RouteTransition";
import PullToRefresh from "@/components/PullToRefresh";
import { Toaster } from "@/components/ui/sonner";

const Layout = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
      <OrganizationJsonLd />
      <Header />
      <PullToRefresh />
      <main className="flex-1">
        <RouteTransition>
          <div key={pathname}>
            <Outlet />
          </div>
        </RouteTransition>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileStickyResultBar />
      <MobileBottomNav />
      <InstallPrompt />
      <CookieConsent />
    </div>
  );
};

export default Layout;
