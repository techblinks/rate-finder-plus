import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isRbaDecisionDay, getNextRbaMeeting } from "@/config/rba-calendar";

export type AlertSeverity = "critical" | "warning" | "info";

export interface DataAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  action: string;
  daysSinceVerified: number;
}

const SEV_ORDER: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

export function useDataAlerts() {
  const [alerts, setAlerts] = useState<DataAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: DataAlert[] = [];

      const { data: staleData } = await supabase
        .from("rate_data")
        .select("id, category, state, key, display_label, last_verified_at")
        .eq("is_active", true)
        .lt("last_verified_at", new Date(Date.now() - 30 * 86_400_000).toISOString());

      for (const item of staleData ?? []) {
        const days = Math.floor(
          (Date.now() - new Date(item.last_verified_at as string).getTime()) / 86_400_000,
        );
        const severity: AlertSeverity = days > 90 ? "critical" : days > 60 ? "warning" : "info";
        const label =
          item.display_label || `${item.category} (${item.state ?? "national"} · ${item.key})`;
        next.push({
          id: `stale-${item.id}`,
          severity,
          message: `${label} — last verified ${days} days ago`,
          action: "Verify now",
          daysSinceVerified: days,
        });
      }

      const { data: gscToken } = await supabase
        .from("gsc_oauth_tokens")
        .select("expires_at, is_active")
        .eq("is_active", true)
        .maybeSingle();

      if (!gscToken) {
        next.push({
          id: "gsc-not-connected",
          severity: "warning",
          message: "Google Search Console not connected — keyword tracking unavailable",
          action: "Connect now",
          daysSinceVerified: 0,
        });
      }

      if (isRbaDecisionDay()) {
        next.unshift({
          id: "rba-today",
          severity: "info",
          message:
            "RBA Board Meeting today — run RBA Event Scan after the decision is announced (2:30pm AEST)",
          action: "Run RBA Event Scan",
          daysSinceVerified: 0,
        });
      } else {
        const nextMeeting = getNextRbaMeeting();
        if (nextMeeting) {
          const days = Math.ceil(
            (new Date(nextMeeting).getTime() - Date.now()) / 86_400_000,
          );
          if (days <= 3 && days > 0) {
            next.push({
              id: "rba-soon",
              severity: "info",
              message: `Next RBA meeting in ${days} day${days === 1 ? "" : "s"} (${nextMeeting})`,
              action: "Prepare",
              daysSinceVerified: 0,
            });
          }
        }
      }

      next.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
      if (!cancelled) {
        setAlerts(next);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { alerts, loading };
}
