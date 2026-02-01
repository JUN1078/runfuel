interface ProgressRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ consumed, target, size = 200, strokeWidth = 14 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((consumed / target) * 100, 120);
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const getGradientId = () => {
    if (percentage > 100) return 'ring-red';
    if (percentage > 85) return 'ring-amber';
    return 'ring-green';
  };

  const getColor = () => {
    if (percentage > 100) return '#ef4444';
    if (percentage > 85) return '#f59e0b';
    return '#22c55e';
  };

  const remaining = Math.round(target - consumed);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="ring-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="ring-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="ring-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={`url(#${getGradientId()})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tracking-tight" style={{ color: getColor() }}>
          {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          {remaining >= 0 ? 'kcal left' : 'over limit'}
        </span>
      </div>
    </div>
  );
}
