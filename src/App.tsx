import { BrowserRouter, Route, Routes, Navigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index.tsx";
import CountryHome from "./pages/CountryHome.tsx";
import CalculatorPage from "./pages/CalculatorPage.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import Terms from "./pages/Terms.tsx";
import NotFound from "./pages/NotFound.tsx";


const UkCalculatorRedirect = () => {
  const { calculator } = useParams<{ calculator: string }>();
  return <Navigate to={`/gb/${calculator ?? "mortgage-calculator"}`} replace />;
};

const App = () => (
  <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/mortgage-calculator" element={<Navigate to="/us/mortgage-calculator" replace />} />
            <Route path="/loan-calculator" element={<Navigate to="/us/loan-calculator" replace />} />
            <Route path="/interest-calculator" element={<Navigate to="/us/interest-calculator" replace />} />
            <Route path="/uk" element={<Navigate to="/gb" replace />} />
            <Route path="/uk/:calculator" element={<UkCalculatorRedirect />} />
            <Route path="/:country" element={<CountryHome />} />
            <Route path="/:country/:calculator" element={<CalculatorPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  </TooltipProvider>
);

export default App;
