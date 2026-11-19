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
  { id: 'content', label: 'محتوا' },
  { id: 'geo', label: 'GEO' },
  { id: 'ai', label: 'هوشمند' },
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
      if (!response?.ok) {
        setError(response?.error || 'پاسخی از افزونه دریافت نشد. صفحه را رفرش کنید.');
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

  if (!loaded) return <Spinner label="در حال آماده‌سازی وب‌لنز..." />;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-line/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-950/70">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sea to-teal-deep text-white" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
                </svg>
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-base font-black tracking-tight">وب‌لنز</h1>
                <p className="truncate text-[11px] text-muted">تحلیل SEO · محتوا · GEO</p>
              </div>
            </div>
          </div>
          <Button onClick={analyze} disabled={status === 'loading'} className="shrink-0">
            {status === 'loading' ? 'در حال تحلیل...' : 'تحلیل صفحه'}
          </Button>
        </div>
        {result && (
          <p className="mono ltr mt-2 truncate text-left text-[11px] text-muted/90">{result.url}</p>
        )}
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-line/80 bg-white/60 px-2 py-1.5 dark:border-slate-700/80 dark:bg-slate-950/40" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
              tab === t.id
                ? 'bg-ink text-white dark:bg-teal'
                : 'text-ink-soft hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5'
            }`}
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
            {status === 'loading' && <Spinner label="در حال خواندن و تحلیل صفحه..." />}
            {status === 'error' && <ErrorState message={error ?? 'خطای نامشخص'} onRetry={analyze} />}
            {status === 'idle' && (
              <EmptyState
                title="صفحه را ببین، بهترش کن"
                description="روی «تحلیل صفحه» بزن. بررسی فنی، محتوا و GEO بدون نیاز به هوش مصنوعی انجام می‌شود."
                action={<Button onClick={analyze}>شروع تحلیل</Button>}
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
        {aiError && (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300" role="alert">
            {aiError}
          </div>
        )}
        {aiExplanation && (
          <Card className="mt-4">
            <h4 className="mb-2 font-extrabold">توضیح هوش مصنوعی</h4>
            <pre className="whitespace-pre-wrap text-sm leading-7" dir="auto">
              {aiExplanation.structured ? JSON.stringify(aiExplanation.structured, null, 2) : aiExplanation.content}
            </pre>
            <Button variant="ghost" className="mt-2 text-xs" onClick={() => setAiExplanation(null)}>بستن</Button>
          </Card>
        )}
      </main>
    </div>
  );
}
