// Tiny haptic helpers — no-ops on devices without `navigator.vibrate`
// (desktop, iOS Safari). All calls are best-effort and never throw.
const v = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* no-op */
  }
};

export const haptic = {
  light: () => v(8),
  medium: () => v(15),
  success: () => v([10, 30, 10]),
  error: () => v([50, 50, 50]),
};
