/** نمودار دایره‌ای امتیاز (SVG). */
export function ScoreGauge({ score, label, size = 110 }: { score: number; label: string; size?: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  const color = score >= 80 ? '#0b7c7c' : score >= 50 ? '#c27a3a' : '#dc2626';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" className="text-line dark:text-slate-700" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black tracking-tight" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted">{label}</span>
    </div>
  );
}

export function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'bg-teal' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink-soft dark:text-slate-200">{label}</span>
        <span className="font-bold tabular-nums">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line/70 dark:bg-slate-700">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%`, transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </div>
    </div>
  );
}
