/** نمودار دایره‌ای امتیاز (SVG). */
export function ScoreGauge({ score, label, size = 110 }: { score: number; label: string; size?: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9" />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
