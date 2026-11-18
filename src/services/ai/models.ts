/**
 * رجیستری مدل‌های OpenRouter.
 * هیچ مدلی به‌صورت دائمی در کد قفل نشده است؛ کاربر می‌تواند مدل را انتخاب یا دستی وارد کند.
 */
import type { AiModelInfo } from '@/types/ai';

const MODELS_URL = 'https://openrouter.ai/api/v1/models';

/** دریافت فهرست مدل‌ها از OpenRouter (در صورت در دسترس بودن API). */
export async function fetchModels(apiKey?: string): Promise<AiModelInfo[]> {
  const headers: Record<string, string> = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const res = await fetch(MODELS_URL, { headers });
  if (!res.ok) throw new Error(`دریافت مدل‌ها ناموفق بود: ${res.status}`);
  const json = (await res.json()) as { data?: Array<{ id: string; name?: string; pricing?: { prompt?: string }; context_length?: number }> };
  const models: AiModelInfo[] = (json.data ?? []).map((m) => ({
    id: m.id,
    name: m.name ?? m.id,
    isFree: m.pricing?.prompt === '0' || m.id.endsWith(':free'),
    contextLength: m.context_length ?? null,
  }));
  // مدل‌های رایگان اول
  return models.sort((a, b) => Number(b.isFree) - Number(a.isFree));
}

/** اعتبارسنجی فرمت Model ID. */
export function isValidModelId(id: string): boolean {
  return /^[a-zA-Z0-9._\-/:]+$/.test(id.trim()) && id.trim().length > 2;
}
