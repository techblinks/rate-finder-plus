import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import RouteAnalytics from "@/components/RouteAnalytics";
import Home from "./pages/Home";

// Route-level code splitting. Home stays eager (it's the LCP path) — every
// other page is a tiny chunk fetched on first navigation, then cached.
const MortgageCalculatorPage = lazy(() => import("./pages/MortgageCalculatorPage"));
const StampDutyPage = lazy(() => import("./pages/StampDutyPage"));
const StampDutyStatePage = lazy(() => import("./pages/StampDutyStatePage"));
const BorrowingPowerPage = lazy(() => import("./pages/BorrowingPowerPage"));
const ExtraRepaymentsPage = lazy(() => import("./pages/ExtraRepaymentsPage"));
const LmiPage = lazy(() => import("./pages/LmiPage"));
const LoanComparisonPage = lazy(() => import("./pages/LoanComparisonPage"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

const STATE_SLUGS = ["nsw", "vic", "qld", "wa", "sa", "tas", "act", "nt"] as const;

const RouteFallback = () => (
  <div className="page-shell py-16" aria-busy="true" aria-live="polite">
    <div className="h-6 w-48 animate-pulse rounded bg-muted" />
    <div className="mt-4 h-4 w-72 animate-pulse rounded bg-muted" />
  </div>
);

const App = () => (
  <BrowserRouter>
    <RouteAnalytics />
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
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<Terms />} />
          <Route path="/terms" element={<Navigate to="/terms-of-use" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
