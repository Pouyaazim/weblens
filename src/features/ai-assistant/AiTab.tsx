import { useState } from 'react';
import { useAnalysisStore } from '@/stores/analysis';
import { useSettingsStore } from '@/stores/settings';
import { runAiRequest } from '@/services/ai/client';
import { AiError, type AiTask, type AiResult } from '@/types/ai';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/States';
import { truncate } from '@/utils/text';

const TASKS: Array<{ id: AiTask; label: string; description: string }> = [
  { id: 'meta-title', label: 'تولید Meta Title', description: 'پیشنهاد چند عنوان مناسب برای صفحه' },
  { id: 'meta-description', label: 'تولید Meta Description', description: 'پیشنهاد توضیحات متا برای صفحه' },
  { id: 'headings', label: 'پیشنهاد اصلاح هدینگ‌ها', description: 'بررسی و پیشنهاد ساختار بهتر هدینگ‌ها' },
  { id: 'faq', label: 'تولید FAQ', description: 'پرسش‌های متداول بر اساس محتوای صفحه' },
  { id: 'schema', label: 'پیشنهاد Schema.org', description: 'پیشنهاد داده ساختاریافته مناسب صفحه' },
  { id: 'deep-analysis', label: 'تحلیل عمیق محتوا', description: 'تحلیل جامع نقاط قوت و ضعف صفحه' },
  { id: 'geo-analysis', label: 'تحلیل GEO', description: 'بررسی آمادگی صفحه برای جست‌وجوی AI' },
  { id: 'content-structure', label: 'پیشنهاد ساختار محتوا', description: 'ساختار پیشنهادی برای بهبود محتوا' },
  { id: 'prioritized-suggestions', label: 'پیشنهادهای اولویت‌بندی‌شده', description: 'مرتب‌سازی پیشنهادها بر اساس اهمیت' },
];

export function AiTab() {
  const { result } = useAnalysisStore();
  const { settings } = useSettingsStore();
  const [loading, setLoading] = useState<AiTask | null>(null);
  const [results, setResults] = useState<Record<string, AiResult>>({});
  const [error, setError] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'rejected'>>({});

  if (!result) return <EmptyState title="هنوز تحلیلی انجام نشده است" description="ابتدا صفحه را تحلیل کنید." />;

  const ai = settings.ai;
  const canUse = ai.enabled && ai.apiKey;

  async function runTask(task: AiTask) {
    setLoading(task);
    setError(null);
    try {
      const page = result!.page;
      const payload: Record<string, string> = {
        'عنوان صفحه': page.title,
        'URL': page.url,
        'متن صفحه': truncate(page.visibleText, settings.aiContextLimit),
        'هدینگ‌ها': page.headings.map((h) => `H${h.level}: ${h.text}`).join('\n'),
        'یافته‌های تحلیل': result!.checks.filter((c) => c.status !== 'pass').map((c) => `- ${c.title}: ${c.description}`).join('\n') || 'مشکلی یافت نشد.',
      };
      if (task === 'improve-text') payload['متن انتخاب‌شده'] = customText;
      const res = await runAiRequest(ai, { task, payload }, settings.aiContextLimit);
      setResults((r) => ({ ...r, [task]: res }));
    } catch (e) {
      setError(e instanceof AiError ? e.message : 'خطای نامشخص در ارتباط با AI');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {!canUse && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm">
            هوش مصنوعی فعال نیست. برای استفاده از دستیار هوشمند، در بخش «تنظیمات» کلید OpenRouter خود را وارد و AI را فعال کنید.
            تحلیل‌های فنی، محتوا و GEO بدون AI به‌طور کامل کار می‌کنند.
          </p>
        </Card>
      )}

      <Card>
        <h3 className="mb-2 font-bold">بهبود متن انتخاب‌شده</h3>
        <textarea
          className="w-full rounded-lg border border-slate-300 bg-transparent p-2 text-sm dark:border-slate-600"
          rows={3}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="متن موردنظر برای بهبود را اینجا وارد کنید..."
        />
        <Button className="mt-2" disabled={!canUse || loading !== null || !customText.trim()} onClick={() => runTask('improve-text')}>
          {loading === 'improve-text' ? 'در حال پردازش...' : 'بهبود متن'}
        </Button>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        {TASKS.map((t) => (
          <Card key={t.id}>
            <h4 className="font-medium">{t.label}</h4>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
            <Button variant="secondary" className="text-xs" disabled={!canUse || loading !== null} onClick={() => runTask(t.id)}>
              {loading === t.id ? 'در حال پردازش...' : 'اجرا'}
            </Button>
          </Card>
        ))}
      </div>

      {loading && <Spinner label="در حال ارتباط با مدل AI..." />}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300" role="alert">{error}</div>
      )}

      {Object.values(results).map((r) => (
        <Card key={r.task}>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-bold">{TASKS.find((t) => t.id === r.task)?.label ?? r.task}</h4>
            <span className="mono ltr text-xs text-slate-400">{r.model}</span>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-700/40" dir="auto">
            {r.structured ? JSON.stringify(r.structured, null, 2) : r.content}
          </pre>
          <div className="mt-2 flex gap-2">
            <Button variant="ghost" className="text-xs" onClick={() => navigator.clipboard.writeText(r.content)}>کپی نتیجه</Button>
            <Button variant="ghost" className="text-xs text-green-600" onClick={() => setDecisions((d) => ({ ...d, [r.task]: 'approved' }))}>
              {decisions[r.task] === 'approved' ? '✓ تأیید شد' : 'تأیید پیشنهاد'}
            </Button>
            <Button variant="ghost" className="text-xs text-red-600" onClick={() => setDecisions((d) => ({ ...d, [r.task]: 'rejected' }))}>
              {decisions[r.task] === 'rejected' ? '✗ رد شد' : 'رد پیشنهاد'}
            </Button>
          </div>
          <p className="mt-1 text-xs text-slate-400">پیشنهادهای AI بدون تأیید شما روی وب‌سایت اعمال نمی‌شوند.</p>
        </Card>
      ))}
    </div>
  );
}
