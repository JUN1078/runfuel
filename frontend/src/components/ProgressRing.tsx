interface ProgressRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ consumed, target, size = 200, strokeWidth = 12 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((consumed / target) * 100, 120);
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const getGradientId = () => {
    if (percentage > 100) return 'ring-red';
    if (percentage > 85) return 'ring-amber';
    return 'ring-teal';
  };

  const getColor = () => {
    if (percentage > 100) return '#F87171';
    if (percentage > 85) return '#FBBF24';
    return '#5ED4C6';
  };

  const remaining = Math.round(target - consumed);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="ring-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5ED4C6" />
            <stop offset="100%" stopColor="#7EEADD" />
          </linearGradient>
          <linearGradient id="ring-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FCD34D" />
          </linearGradient>
          <linearGradient id="ring-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#FCA5A5" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(94,212,198,0.06)" strokeWidth={strokeWidth} />
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
        <span className="text-[38px] font-light tracking-tight" style={{ color: getColor() }}>
          {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
          {remaining >= 0 ? 'kcal left' : 'over limit'}
        </span>
      </div>
    </div>
  );
}
