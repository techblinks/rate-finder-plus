interface DonutProps {
  principal: number;
  interest: number;
  size?: number;
}

const DonutChart = ({ principal, interest, size = 180 }: DonutProps) => {
  const total = principal + interest;
  if (total <= 0) return null;
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const principalPct = principal / total;
  const principalLen = circumference * principalPct;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Principal vs interest breakdown">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth={18}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--success))"
          strokeWidth={18}
          strokeDasharray={`${principalLen} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <ul className="space-y-2 text-[13px]">
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-success" />
          <span className="text-foreground font-medium">Principal</span>
          <span className="text-muted-foreground tnum">{(principalPct * 100).toFixed(1)}%</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-accent" />
          <span className="text-foreground font-medium">Interest</span>
          <span className="text-muted-foreground tnum">{((1 - principalPct) * 100).toFixed(1)}%</span>
        </li>
      </ul>
    </div>
  );
};

export default DonutChart;
