import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";

const Layout = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <OrganizationJsonLd />
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
