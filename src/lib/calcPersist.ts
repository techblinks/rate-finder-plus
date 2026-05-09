import { useEffect, useRef, useState } from "react";

const KEY_PREFIX = "calcy:state:";
const TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

interface Stored<T> {
  v: 1;
  t: number;
  s: T;
}

/**
 * Persists calculator state to localStorage and exposes a restore-chip API.
 * On mount, if a recent saved snapshot exists AND differs from current state,
 * `showRestore` becomes true. Calling `restore()` applies it; `dismiss()` hides.
 */
export function useCalcPersist<T>(
  key: string,
  state: T,
  applyState: (s: T) => void,
) {
  const fullKey = KEY_PREFIX + key;
  const [showRestore, setShowRestore] = useState(false);
  const savedRef = useRef<T | null>(null);
  const hydratedRef = useRef(false);

  // Read once on mount
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(fullKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Stored<T>;
      if (!parsed || parsed.v !== 1) return;
      if (Date.now() - parsed.t > TTL_MS) {
        localStorage.removeItem(fullKey);
        return;
      }
      const same = JSON.stringify(parsed.s) === JSON.stringify(state);
      if (!same) {
        savedRef.current = parsed.s;
        setShowRestore(true);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save (debounced) on every state change after mount
  useEffect(() => {
    if (!hydratedRef.current) return;
    const id = window.setTimeout(() => {
      try {
        const payload: Stored<T> = { v: 1, t: Date.now(), s: state };
        localStorage.setItem(fullKey, JSON.stringify(payload));
      } catch {
        /* quota — ignore */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [fullKey, state]);

  const restore = () => {
    if (savedRef.current != null) applyState(savedRef.current);
    setShowRestore(false);
  };
  const dismiss = () => setShowRestore(false);

  return { showRestore, restore, dismiss };
}
