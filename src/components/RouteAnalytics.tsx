import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { configureAnalytics, trackPageView } from "@/lib/analytics";
import { configureAdSense } from "@/lib/adsense";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const RouteAnalytics = () => {
  const location = useLocation();
  const settings = useSiteSettings();

  useEffect(() => {
    configureAnalytics({
      ga4Id: settings.ga4_id,
      gtmId: settings.gtm_id,
      fbPixelId: settings.fb_pixel_id,
    });
    configureAdSense({
      client: settings.adsense_client,
      enabled: settings.adsense_enabled,
      autoAds: settings.adsense_auto_ads,
    });
  }, [
    settings.ga4_id,
    settings.gtm_id,
    settings.fb_pixel_id,
    settings.adsense_client,
    settings.adsense_enabled,
    settings.adsense_auto_ads,
  ]);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
};

export default RouteAnalytics;
