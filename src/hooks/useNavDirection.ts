import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Returns "forward" | "back" based on history index. Defaults to "forward"
 * for the first navigation after mount.
 */
export function useNavDirection(): "forward" | "back" {
  const lastIdxRef = useRef<number>(-1);
  const dirRef = useRef<"forward" | "back">("forward");
  const { key } = useLocation();

  useEffect(() => {
    const idx =
      typeof window !== "undefined"
        ? (window.history.state?.idx ?? 0)
        : 0;
    if (lastIdxRef.current >= 0) {
      dirRef.current = idx < lastIdxRef.current ? "back" : "forward";
    }
    lastIdxRef.current = idx;
  }, [key]);

  return dirRef.current;
}
