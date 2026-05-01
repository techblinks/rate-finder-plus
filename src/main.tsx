import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove the prerendered SEO content slot once the SPA takes over so users
// never see a flash of the static crawler HTML.
const prerenderSlot = document.getElementById("prerender-content");
if (prerenderSlot) prerenderSlot.remove();

createRoot(document.getElementById("root")!).render(<App />);
