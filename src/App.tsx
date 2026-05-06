import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "./pages/Home";
import MortgageCalculatorPage from "./pages/MortgageCalculatorPage";
import StampDutyPage from "./pages/StampDutyPage";
import BorrowingPowerPage from "./pages/BorrowingPowerPage";
import ExtraRepaymentsPage from "./pages/ExtraRepaymentsPage";
import LmiPage from "./pages/LmiPage";
import LoanComparisonPage from "./pages/LoanComparisonPage";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/mortgage-calculator" element={<MortgageCalculatorPage />} />
        <Route path="/stamp-duty-calculator" element={<StampDutyPage />} />
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
  </BrowserRouter>
);

export default App;
