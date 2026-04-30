// Compact URL-safe encoding/decoding for calculator state.
// Outputs are deterministically derived from inputs, so encoding inputs is sufficient.

const toBase64Url = (str: string) =>
  btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (str: string) => {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(b64)));
};

export const encodeState = <T extends object>(state: T): string => {
  try {
    return toBase64Url(JSON.stringify(state));
  } catch {
    return "";
  }
};

export const decodeState = <T extends object>(encoded: string | null | undefined): Partial<T> | null => {
  if (!encoded) return null;
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null ? (parsed as Partial<T>) : null;
  } catch {
    return null;
  }
};

export const buildShareUrl = (encoded: string, pathname?: string): string => {
  if (typeof window === "undefined") return "";
  const path = pathname ?? window.location.pathname;
  return `${window.location.origin}${path}?s=${encoded}`;
};

export const readSharedState = <T extends object>(): Partial<T> | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return decodeState<T>(params.get("s"));
};

export const clamp = (n: unknown, min: number, max: number, fallback: number): number => {
  const v = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.max(min, Math.min(max, v));
};
