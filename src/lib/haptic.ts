// Tiny haptic helpers — no-ops on devices without `navigator.vibrate` (e.g. iOS Safari).
export const haptic = {
  light: () => navigator.vibrate?.(8),
  medium: () => navigator.vibrate?.(15),
  success: () => navigator.vibrate?.([10, 30, 10]),
  error: () => navigator.vibrate?.([20, 10, 20]),
};
