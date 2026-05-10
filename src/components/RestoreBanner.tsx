interface Props {
  show: boolean;
  onReset: () => void;
  /** Override the default copy when needed. */
  message?: string;
  actionLabel?: string;
}

/**
 * Unified "welcome back" restore banner shown when a calculator's
 * state has been auto-restored from localStorage.
 */
const RestoreBanner = ({
  show,
  onReset,
  message = "Welcome back — we've restored your last calculation.",
  actionLabel = "Reset",
}: Props) => {
  if (!show) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-light/40 px-4 py-3 text-[13px] text-foreground"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onReset}
        className="font-semibold text-accent hover:underline"
      >
        {actionLabel}
      </button>
    </div>
  );
};

export default RestoreBanner;
