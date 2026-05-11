import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Service worker — production only, never inside the Lovable preview iframe
// or on preview hosts (caching breaks the editor preview).
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const previewHost =
    /lovableproject\.com|lovable\.app|id-preview/.test(location.hostname);

  if (inIframe || previewHost) {
    // Defensive cleanup: unregister any SW that might have been registered before.
    navigator.serviceWorker
      .getRegistrations()
      .then((rs) => rs.forEach((r) => r.unregister()))
      .catch(() => {});
  } else {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}
