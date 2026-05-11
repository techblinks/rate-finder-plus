import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import RouteAnalytics from "@/components/RouteAnalytics";
import FaviconManager from "@/components/FaviconManager";
import CustomScripts from "@/components/CustomScripts";
import { LocaleProvider } from "@/contexts/LocaleContext";
import Home from "./pages/Home";

const MortgageCalculatorPage = lazy(() => import("./pages/MortgageCalculatorPage"));
const StampDutyPage = lazy(() => import("./pages/StampDutyPage"));
const StampDutyStatePage = lazy(() => import("./pages/StampDutyStatePage"));
const BorrowingPowerPage = lazy(() => import("./pages/BorrowingPowerPage"));
const ExtraRepaymentsPage = lazy(() => import("./pages/ExtraRepaymentsPage"));
const LmiPage = lazy(() => import("./pages/LmiPage"));
const LoanComparisonPage = lazy(() => import("./pages/LoanComparisonPage"));
const HecsBorrowingPowerPage = lazy(() => import("./pages/HecsBorrowingPowerPage"));
const RentVsBuyPage = lazy(() => import("./pages/RentVsBuyPage"));
const RefinancePage = lazy(() => import("./pages/RefinancePage"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const GuidesIndex = lazy(() => import("./pages/GuidesIndex"));
const GuidePage = lazy(() => import("./pages/GuidePage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ProgrammaticPage = lazy(() => import("./pages/ProgrammaticPage"));
const FhbGrantPage = lazy(() => import("./pages/FhbGrantPage"));
const BestHomeLoansAustralia = lazy(() => import("./pages/BestHomeLoansAustralia"));
const SuburbGuidePage = lazy(() => import("./pages/SuburbGuidePage"));

const STATE_SLUGS = ["nsw", "vic", "qld", "wa", "sa", "tas", "act", "nt"] as const;

const RouteFallback = () => (
  <div className="page-shell py-16" aria-busy="true" aria-live="polite">
    <div className="h-6 w-48 animate-pulse rounded bg-muted" />
    <div className="mt-4 h-4 w-72 animate-pulse rounded bg-muted" />
  </div>
);

const App = () => (
  <BrowserRouter>
    <LocaleProvider>
      <RouteAnalytics />
      <FaviconManager />
      <CustomScripts />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mortgage-calculator" element={<MortgageCalculatorPage />} />
          <Route path="/stamp-duty-calculator" element={<StampDutyPage />} />
          {STATE_SLUGS.map((slug) => (
            <Route
              key={slug}
              path={`/stamp-duty-calculator/${slug}`}
              element={<StampDutyStatePage slug={slug} />}
            />
          ))}
          <Route path="/borrowing-power-calculator" element={<BorrowingPowerPage />} />
          <Route path="/extra-repayments-calculator" element={<ExtraRepaymentsPage />} />
          <Route path="/lmi-calculator" element={<LmiPage />} />
          <Route path="/loan-comparison-calculator" element={<LoanComparisonPage />} />
          <Route path="/hecs-borrowing-power" element={<HecsBorrowingPowerPage />} />
          <Route path="/rent-vs-buy-calculator" element={<RentVsBuyPage />} />
          <Route path="/rent-vs-buy" element={<Navigate to="/rent-vs-buy-calculator" replace />} />
          <Route path="/refinance-calculator" element={<RefinancePage />} />
          <Route path="/refinance" element={<Navigate to="/refinance-calculator" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/guides" element={<GuidesIndex />} />
          <Route path="/guides/:slug" element={<GuidePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<Terms />} />
          <Route path="/terms" element={<Navigate to="/terms-of-use" replace />} />
          <Route path="/mortgage" element={<Navigate to="/mortgage-calculator" replace />} />
          <Route path="/stamp-duty" element={<Navigate to="/stamp-duty-calculator" replace />} />
          <Route path="/borrowing" element={<Navigate to="/borrowing-power-calculator" replace />} />
          <Route path="/lmi" element={<Navigate to="/lmi-calculator" replace />} />
          <Route path="/extra" element={<Navigate to="/extra-repayments-calculator" replace />} />
          <Route path="/compare" element={<Navigate to="/loan-comparison-calculator" replace />} />
          {STATE_SLUGS.map((slug) => (
            <Route
              key={`fhb-${slug}`}
              path={`/first-home-buyer-grant-${slug}`}
              element={<FhbGrantPage slug={slug} />}
            />
          ))}
          <Route path="/best-home-loans-australia" element={<BestHomeLoansAustralia />} />
          <Route path="/suburbs/:slug" element={<SuburbGuidePage />} />
          <Route path="/calculate/*" element={<ProgrammaticPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </LocaleProvider>
  </BrowserRouter>
);

export default App;
