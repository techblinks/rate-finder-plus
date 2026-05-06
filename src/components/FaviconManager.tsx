import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FaviconManager = () => {
  const { favicon_url } = useSiteSettings();

  useEffect(() => {
    if (!favicon_url) return;
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => el.parentNode?.removeChild(el));
    });
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = favicon_url;
    document.head.appendChild(link);
    const apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    apple.href = favicon_url;
    document.head.appendChild(apple);
  }, [favicon_url]);

  return null;
};

export default FaviconManager;
