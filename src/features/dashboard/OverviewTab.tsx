import { useAnalysisStore } from '@/stores/analysis';
import { Card } from '@/components/ui/Card';
import { ScoreGauge } from '@/components/charts/ScoreGauge';
import { SeverityBadge } from '@/components/shared/Badges';
import { formatDateFa, formatNumberFa } from '@/utils/format';
import { SEVERITY_LABELS_FA } from '@/constants/severities';
import type { Severity } from '@/types/analysis';

export function OverviewTab() {
  const { result } = useAnalysisStore();
  if (!result) return null;
  const { scores, summary, recommendations } = result;
  const topRecs = recommendations.slice(0, 5);
  const severities: Severity[] = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-around gap-4">
          <ScoreGauge score={scores.overall} label="امتیاز کلی صفحه" size={130} />
          <ScoreGauge score={scores.technicalSeo} label="سئوی فنی" />
          <ScoreGauge score={scores.contentQuality} label="کیفیت محتوا" />
          <ScoreGauge score={scores.geoReadiness} label="آمادگی GEO" />
          <ScoreGauge score={scores.metadata} label="متادیتا" />
        </div>
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          آخرین بررسی: {formatDateFa(result.analyzedAt)} — امتیازها بر اساس معیارهای مستند WebLens محاسبه شده‌اند و رتبه رسمی گوگل نیستند.
        </p>
      </Card>

      <Card>
        <h3 className="mb-3 font-bold">خلاصه وضعیت</h3>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-900/20">
            <div className="text-2xl font-bold text-red-600">{formatNumberFa(summary.failed)}</div>
            <div className="text-xs">مشکل شناسایی‌شده</div>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-center dark:bg-amber-900/20">
            <div className="text-2xl font-bold text-amber-600">{formatNumberFa(summary.warnings)}</div>
            <div className="text-xs">نیازمند بررسی</div>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-600">{formatNumberFa(summary.passed)}</div>
            <div className="text-xs">بررسی موفق</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-700/40">
            <div className="text-2xl font-bold">{formatNumberFa(summary.notApplicable)}</div>
            <div className="text-xs">قابل ارزیابی نیست</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {severities.map((s) => (
            <span key={s} className="flex items-center gap-1 text-xs">
              <SeverityBadge severity={s} />
              <span>{formatNumberFa(summary[s])} مورد</span>
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-bold">پیشنهادهای مهم</h3>
        {topRecs.length === 0 ? (
          <p className="text-sm text-slate-500">پیشنهاد فعالی وجود ندارد؛ صفحه در وضعیت خوبی است. 🎉</p>
        ) : (
          <ul className="space-y-2">
            {topRecs.map((r) => (
              <li key={r.id} className="flex items-start gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-700/40">
                <SeverityBadge severity={r.severity} />
                <div>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{r.action}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-400">شدت‌ها: {Object.values(SEVERITY_LABELS_FA).join('، ')}</p>
      </Card>

      <Card>
        <h3 className="mb-2 font-bold">اطلاعات صفحه</h3>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">URL</dt><dd className="mono ltr max-w-[60%] truncate text-left">{result.url}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">عنوان</dt><dd className="max-w-[60%] truncate">{result.title}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">تعداد کلمات</dt><dd>{formatNumberFa(result.page.wordCount)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">تعداد هدینگ‌ها</dt><dd>{formatNumberFa(result.page.headings.length)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">تعداد لینک‌ها</dt><dd>{formatNumberFa(result.page.links.length)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">تعداد تصاویر</dt><dd>{formatNumberFa(result.page.images.length)}</dd></div>
        </dl>
      </Card>
    </div>
  );
}
