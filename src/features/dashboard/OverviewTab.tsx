import { useAnalysisStore } from '@/stores/analysis';
import { Card } from '@/components/ui/Card';
import { ScoreGauge, ScoreBar } from '@/components/charts/ScoreGauge';
import { SeverityBadge } from '@/components/shared/Badges';
import { formatDateFa, formatNumberFa } from '@/utils/format';
import type { Severity } from '@/types/analysis';

export function OverviewTab() {
  const { result } = useAnalysisStore();
  if (!result) return null;
  const { scores, summary, recommendations } = result;
  const topRecs = recommendations.slice(0, 5);
  const severities: Severity[] = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="wl-rise space-y-4">
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between">
          <ScoreGauge score={scores.overall} label="امتیاز کلی" size={148} />
          <div className="w-full flex-1 space-y-3 pt-1">
            <ScoreBar score={scores.technicalSeo} label="سئوی فنی" />
            <ScoreBar score={scores.contentQuality} label="کیفیت محتوا" />
            <ScoreBar score={scores.geoReadiness} label="آمادگی GEO" />
            <ScoreBar score={scores.metadata} label="متادیتا" />
          </div>
        </div>
        <p className="mt-4 text-center text-xs leading-6 text-muted">
          {formatDateFa(result.analyzedAt)} · امتیازها معیار داخلی وب‌لنز هستند، نه رتبه رسمی گوگل
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Stat tone="bad" value={summary.failed} label="مشکل" />
        <Stat tone="warn" value={summary.warnings} label="نیازمند بررسی" />
        <Stat tone="good" value={summary.passed} label="موفق" />
        <Stat tone="neutral" value={summary.notApplicable} label="غیرقابل ارزیابی" />
      </div>

      <div className="flex flex-wrap gap-2 px-0.5">
        {severities.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 text-xs text-muted">
            <SeverityBadge severity={s} />
            {formatNumberFa(summary[s])}
          </span>
        ))}
      </div>

      <Card>
        <h3 className="mb-3 text-base font-extrabold tracking-tight">اولویت‌های اصلاح</h3>
        {topRecs.length === 0 ? (
          <p className="text-sm leading-7 text-muted">پیشنهاد فعالی نیست؛ وضعیت صفحه خوب به نظر می‌رسد.</p>
        ) : (
          <ul className="space-y-2">
            {topRecs.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-xl bg-paper/80 p-3 dark:bg-slate-800/60">
                <SeverityBadge severity={r.severity} />
                <div className="min-w-0">
                  <div className="text-sm font-bold">{r.title}</div>
                  <div className="mt-0.5 text-xs leading-6 text-muted">{r.action}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 text-base font-extrabold tracking-tight">شناسنامه صفحه</h3>
        <dl className="space-y-2.5 text-sm">
          <Row label="آدرس" value={result.url} mono />
          <Row label="عنوان" value={result.title || '—'} />
          <Row label="کلمات" value={formatNumberFa(result.page.wordCount)} />
          <Row label="هدینگ" value={formatNumberFa(result.page.headings.length)} />
          <Row label="لینک" value={formatNumberFa(result.page.links.length)} />
          <Row label="تصویر" value={formatNumberFa(result.page.images.length)} />
        </dl>
      </Card>
    </div>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone: 'bad' | 'warn' | 'good' | 'neutral' }) {
  const tones = {
    bad: 'border-red-200/80 text-red-700 dark:border-red-900/50 dark:text-red-300',
    warn: 'border-amber-200/80 text-amber-700 dark:border-amber-900/50 dark:text-amber-300',
    good: 'border-teal/30 text-teal-deep dark:text-sea',
    neutral: 'border-line text-muted',
  };
  return (
    <div className={`rounded-2xl border bg-white/70 px-3 py-3 text-center dark:bg-slate-900/50 ${tones[tone]}`}>
      <div className="text-2xl font-black tabular-nums">{formatNumberFa(value)}</div>
      <div className="mt-0.5 text-[11px] font-medium opacity-80">{label}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-2 last:border-0 last:pb-0 dark:border-slate-700/60">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className={`min-w-0 max-w-[68%] truncate font-medium ${mono ? 'mono ltr text-left' : ''}`}>{value}</dd>
    </div>
  );
}
