import { useState } from 'react';
import { useSettingsStore } from '@/stores/settings';
import { testConnection } from '@/services/ai/openrouter';
import { fetchModels, isValidModelId } from '@/services/ai/models';
import { clearAllLocalData } from '@/services/storage/settings';
import { clearReports } from '@/services/storage/reports';
import type { AiModelInfo } from '@/types/ai';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function SettingsTab() {
  const { settings, update, updateAi } = useSettingsStore();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [models, setModels] = useState<AiModelInfo[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const res = await testConnection(settings.ai.apiKey, settings.ai.model);
    setTestResult(res.message);
    setTesting(false);
  }

  async function handleLoadModels() {
    setLoadingModels(true);
    setModelError(null);
    try {
      const list = await fetchModels(settings.ai.apiKey || undefined);
      setModels(list.slice(0, 100));
    } catch (e) {
      setModelError(e instanceof Error ? e.message : 'دریافت مدل‌ها ناموفق بود. می‌توانید شناسه مدل را دستی وارد کنید.');
    } finally {
      setLoadingModels(false);
    }
  }

  async function handleClearData() {
    if (window.confirm('همه داده‌های محلی WebLens (تنظیمات و گزارش‌ها) حذف شوند؟')) {
      await clearAllLocalData();
      await clearReports();
      alert('همه داده‌های محلی حذف شدند.');
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-3 font-bold">ظاهر</h3>
        <label className="block text-sm">
          تم رابط
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-600"
            value={settings.theme}
            onChange={(e) => void update({ theme: e.target.value as 'light' | 'dark' | 'system' })}
          >
            <option value="system">سیستم</option>
            <option value="light">روشن</option>
            <option value="dark">تیره</option>
          </select>
        </label>
        <label className="mt-3 block text-sm">
          ذخیره خودکار گزارش‌ها
          <input
            type="checkbox"
            className="mr-2"
            checked={settings.autoSaveReports}
            onChange={(e) => void update({ autoSaveReports: e.target.checked })}
          />
        </label>
      </Card>

      <Card>
        <h3 className="mb-3 font-bold">هوش مصنوعی (OpenRouter) — اختیاری</h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          کلید API فقط در فضای ذخیره‌سازی محلی مرورگر شما نگه داشته می‌شود و هرگز به سرویس دیگری ارسال نمی‌شود.
          محدودیت‌های سرویس OpenRouter (مثل سقف مصرف مدل‌های رایگان) مربوط به خود OpenRouter است، نه WebLens.
        </p>
        <label className="block text-sm">
          فعال‌سازی AI
          <input
            type="checkbox"
            className="mr-2"
            checked={settings.ai.enabled}
            onChange={(e) => void updateAi({ enabled: e.target.checked })}
          />
        </label>
        <label className="mt-3 block text-sm">
          کلید API
          <input
            type="password"
            className="mono ltr mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 text-left dark:border-slate-600"
            value={settings.ai.apiKey}
            onChange={(e) => void updateAi({ apiKey: e.target.value })}
            placeholder="sk-or-v1-..."
            dir="ltr"
          />
        </label>
        <label className="mt-3 block text-sm">
          مدل اصلی
          <input
            className="mono ltr mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 text-left dark:border-slate-600"
            value={settings.ai.model}
            onChange={(e) => void updateAi({ model: e.target.value })}
            dir="ltr"
          />
          {!isValidModelId(settings.ai.model) && <span className="text-xs text-red-600">شناسه مدل معتبر نیست.</span>}
        </label>
        <label className="mt-3 block text-sm">
          مدل جایگزین (اختیاری)
          <input
            className="mono ltr mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 text-left dark:border-slate-600"
            value={settings.ai.fallbackModel}
            onChange={(e) => void updateAi({ fallbackModel: e.target.value })}
            placeholder="مثلاً google/gemini-2.0-flash-exp:free"
            dir="ltr"
          />
        </label>
        <label className="mt-3 block text-sm">
          زبان پاسخ AI
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-600"
            value={settings.ai.language}
            onChange={(e) => void updateAi({ language: e.target.value as 'fa' | 'en' })}
          >
            <option value="fa">فارسی</option>
            <option value="en">English</option>
          </select>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleTest} disabled={testing || !settings.ai.apiKey}>
            {testing ? 'در حال آزمایش...' : 'آزمایش اتصال'}
          </Button>
          <Button variant="secondary" onClick={handleLoadModels} disabled={loadingModels}>
            {loadingModels ? 'در حال دریافت...' : 'دریافت فهرست مدل‌ها'}
          </Button>
          {settings.ai.apiKey && (
            <Button variant="danger" onClick={() => void updateAi({ apiKey: '' })}>حذف کلید API</Button>
          )}
        </div>
        {testResult && <p className="mt-2 text-sm">{testResult}</p>}
        {modelError && <p className="mt-2 text-sm text-red-600">{modelError}</p>}
        {models.length > 0 && (
          <div className="mt-3 max-h-48 overflow-auto">
            <h4 className="mb-1 text-xs font-bold">مدل‌های موجود (رایگان‌ها اول):</h4>
            <ul className="space-y-1">
              {models.map((m) => (
                <li key={m.id}>
                  <button
                    className="mono ltr block w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => void updateAi({ model: m.id })}
                  >
                    {m.id} {m.isFree && <span className="text-green-600">(رایگان)</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-bold">حریم خصوصی و داده‌ها</h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          WebLens هیچ داده‌ای را به سرور ارسال نمی‌کند. همه گزارش‌ها و تنظیمات روی دستگاه شما باقی می‌مانند.
        </p>
        <Button variant="danger" onClick={handleClearData}>حذف کامل داده‌های محلی</Button>
      </Card>
    </div>
  );
}
