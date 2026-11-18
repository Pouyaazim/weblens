import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { useAnalysisStore } from '@/stores/analysis';
import { useSettingsStore } from '@/stores/settings';
import { analyzePage } from '@/services/analysis-service';
import { saveReport } from '@/services/storage/reports';
import { runAiRequest } from '@/services/ai/client';
import { AiError, type AiResult } from '@/types/ai';
import type { CheckResult } from '@/types/analysis';
import { OverviewTab } from '@/features/dashboard/OverviewTab';
import { TechnicalTab } from '@/features/technical-seo/TechnicalTab';
import { ContentTab } from '@/features/content-intelligence/ContentTab';
import { GeoTab } from '@/features/geo-intelligence/GeoTab';
import { AiTab } from '@/features/ai-assistant/AiTab';
import { ReportsTab } from '@/features/reports/ReportsTab';
import { SettingsTab } from '@/features/settings/SettingsTab';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/States';
import { Card } from '@/components/ui/Card';

type TabId = 'overview' | 'technical' | 'content' | 'geo' | 'ai' | 'reports' | 'settings';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'technical', label: 'سئوی فنی' },
  { id: 'content', label: 'تحلیل محتوا' },
  { id: 'geo', label: 'تحلیل GEO' },
  { id: 'ai', label: 'دستیار هوشمند' },
  { id: 'reports', label: 'گزارش‌ها' },
  { id: 'settings', label: 'تنظیمات' },
];

export default function App() {
  const [tab, setTab] = useState<TabId>('overview');
  const { status, result, error, setLoading, setResult, setError } = useAnalysisStore();
  const { settings, loaded, load } = useSettingsStore();
  const [aiExplanation, setAiExplanation] = useState<AiResult | null>(null);
  const [aiExplaining, setAiExplaining] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => { void load(); }, [load]);

  // تم روشن/تیره
  useEffect(() => {
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.theme]);

  const analyze = useCallback(async () => {
    setLoading();
    setAiExplanation(null);
    setAiError(null);
    try {
      const response = (await browser.runtime.sendMessage({ type: 'weblens:extract-page' })) as
        | { ok: true; data: import('@/types/page').PageData }
        | { ok: false; error: string };
      if (!response.ok) {
        setError(response.error);
        return;
      }
      const analysis = analyzePage(response.data);
      setResult(analysis);
      if (settings.autoSaveReports) {
        await saveReport(analysis).catch(() => undefined);
      }
      setTab('overview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطای نامشخص در تحلیل صفحه');
    }
  }, [setLoading, setResult, setError, settings.autoSaveReports]);

  const explainIssue = useCallback(async (check: CheckResult) => {
    setAiExplaining(true);
    setAiError(null);
    try {
      const res = await runAiRequest(settings.ai, {
        task: 'explain-issue',
        payload: {
          'مشکل': check.title,
          'توضیح': check.description,
          'شواهد': check.evidence.join('\n'),
          'پیشنهاد': check.recommendation,
        },
      }, settings.aiContextLimit);
      setAiExplanation(res);
    } catch (e) {
      setAiError(e instanceof AiError ? e.message : 'خطا در ارتباط با AI');
    } finally {
      setAiExplaining(false);
    }
  }, [settings.ai, settings.aiContextLimit]);

  if (!loaded) return <Spinner label="در حال بارگذاری..." />;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">WebLens <span className="text-sm font-normal text-slate-500">وب‌لنز</span></h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">وب‌سایتت را بهتر ببین، هوشمندانه‌تر بهینه کن.</p>
          </div>
          <Button onClick={analyze} disabled={status === 'loading'}>
            {status === 'loading' ? 'در حال تحلیل...' : 'تحلیل صفحه'}
          </Button>
        </div>
        {result && (
          <p className="mono ltr mt-1 truncate text-left text-xs text-slate-400">{result.url}</p>
        )}
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'bg-sky-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4">
        {tab === 'settings' && <SettingsTab />}
        {tab === 'reports' && <ReportsTab />}
        {tab === 'ai' && <AiTab />}
        {tab !== 'settings' && tab !== 'reports' && tab !== 'ai' && (
          <>
            {status === 'loading' && <Spinner label="در حال استخراج و تحلیل صفحه..." />}
            {status === 'error' && <ErrorState message={error ?? 'خطای نامشخص'} onRetry={analyze} />}
            {status === 'idle' && (
              <EmptyState
                title="هنوز تحلیلی انجام نشده است"
                description="برای شروع، روی «تحلیل صفحه» کلیک کنید. تحلیل فنی، محتوا و GEO بدون نیاز به هوش مصنوعی انجام می‌شود."
                action={<Button onClick={analyze}>تحلیل صفحه جاری</Button>}
              />
            )}
            {status === 'success' && result && (
              <>
                {tab === 'overview' && <OverviewTab />}
                {tab === 'technical' && <TechnicalTab onExplain={explainIssue} />}
                {tab === 'content' && <ContentTab />}
                {tab === 'geo' && <GeoTab />}
              </>
            )}
          </>
        )}

        {aiExplaining && <Spinner label="در حال دریافت توضیح از AI..." />}
        {aiError && <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300" role="alert">{aiError}</div>}
        {aiExplanation && (
          <Card className="mt-4">
            <h4 className="mb-2 font-bold">توضیح هوش مصنوعی</h4>
            <pre className="whitespace-pre-wrap text-sm" dir="auto">{aiExplanation.structured ? JSON.stringify(aiExplanation.structured, null, 2) : aiExplanation.content}</pre>
            <Button variant="ghost" className="mt-2 text-xs" onClick={() => setAiExplanation(null)}>بستن</Button>
          </Card>
        )}
      </main>
    </div>
  );
}
