import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useSupabaseHealth() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const check = async () => {
      const t0 = performance.now();
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/health-check`,
          { method: "GET", headers: { "Content-Type": "application/json" } },
        );
        const latency = Math.round(performance.now() - t0);
        const payload = await res.json().catch(() => ({}));

        if (res.ok && payload.status === "healthy") {
          console.log(
            `[Backend Health] ${payload.status} — ${latency}ms (${payload.timestamp ?? "unknown"})`,
          );
          return;
        }

        const msg =
          payload.error ??
          `Backend responded with status ${payload.status ?? res.status}`;
        console.warn(`[Backend Health] ${msg} — ${latency}ms`);
        toast.error("Backend connection issue", {
          description: "Some features may not work correctly. Please refresh the page.",
          duration: 6000,
        });
      } catch (err) {
        const latency = Math.round(performance.now() - t0);
        console.error(`[Backend Health] unreachable — ${latency}ms`, err);
        toast.error("Cannot reach backend", {
          description: "Check your internet connection and try again.",
          duration: 6000,
        });
      }
    };

    check();
  }, []);
}
