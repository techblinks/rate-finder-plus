export const AUD = (n: number, digits = 0): string => {
  const safe = Number.isFinite(n) ? n : 0;
  const sign = safe < 0 ? "-" : "";
  return (
    sign +
    "$" +
    Math.abs(safe).toLocaleString("en-AU", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  );
};

export const pct = (n: number, digits = 1): string =>
  `${(Number.isFinite(n) ? n : 0).toLocaleString("en-AU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;

export const monthName = (date: Date): string =>
  date.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
