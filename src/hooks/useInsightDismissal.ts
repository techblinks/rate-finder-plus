import { useCallback, useEffect, useState } from "react";

const KEY = "calcy_insight_dismissed";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

type DismissMap = Record<string, number>;

function read(): DismissMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DismissMap;
    const now = Date.now();
    const cleaned: DismissMap = {};
    for (const [k, t] of Object.entries(parsed)) {
      if (typeof t === "number" && now - t < TTL_MS) cleaned[k] = t;
    }
    return cleaned;
  } catch {
    return {};
  }
}

function write(map: DismissMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/**
 * Tracks dismissed insight IDs with a 7-day TTL in localStorage.
 * Returns `isDismissed(id)` and `dismiss(id)`.
 */
export function useInsightDismissal() {
  const [map, setMap] = useState<DismissMap>({});

  useEffect(() => {
    setMap(read());
  }, []);

  const isDismissed = useCallback(
    (id: string) => {
      const t = map[id];
      return typeof t === "number" && Date.now() - t < TTL_MS;
    },
    [map],
  );

  const dismiss = useCallback((id: string) => {
    setMap((prev) => {
      const next = { ...prev, [id]: Date.now() };
      write(next);
      return next;
    });
  }, []);

  return { isDismissed, dismiss };
}
