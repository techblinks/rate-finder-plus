import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageView } from "@/lib/analytics";
import { loadAdSense } from "@/lib/adsense";

const RouteAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
    loadAdSense();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
};

export default RouteAnalytics;
