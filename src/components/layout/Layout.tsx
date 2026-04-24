import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "@/components/premium/MobileBottomNav";

const Layout = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="main-content flex-1 pb-20 md:pb-0">
      <Outlet />
    </main>
    <Footer />
    <MobileBottomNav />
  </div>
);

export default Layout;
