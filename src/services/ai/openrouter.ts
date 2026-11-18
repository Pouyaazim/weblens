/**
 * ارائه‌دهنده OpenRouter — لایه مستقل اتصال به API.
 * - کلید API فقط از تنظیمات کاربر خوانده می‌شود و هرگز در کد نیست.
 * - درخواست‌ها فقط با اقدام صریح کاربر انجام می‌شوند.
 */
import { AiError } from '@/types/ai';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS = 60_000;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
}

export async function chatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<ChatCompletionResult> {
  if (!apiKey) throw new AiError('missing-key', 'کلید API تنظیم نشده است. در بخش تنظیمات، کلید OpenRouter خود را وارد کنید.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/Pouyaazim/weblens',
        'X-Title': 'WebLens',
      },
      body: JSON.stringify({ model, messages, temperature: 0.4, response_format: { type: 'json_object' } }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (res.status === 401 || res.status === 403) throw new AiError('invalid-key', 'کلید API معتبر نیست. کلید را بررسی کنید.');
      if (res.status === 429) throw new AiError('rate-limit', 'محدودیت نرخ (Rate Limit) OpenRouter فعال شده است. کمی صبر کنید و دوباره تلاش کنید.');
      if (res.status === 404) throw new AiError('model-not-found', `مدل «${model}» یافت نشد. شناسه مدل را بررسی کنید.`);
      throw new AiError('unknown', `خطای OpenRouter (${res.status}): ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; model?: string };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new AiError('invalid-response', 'پاسخ خالی از مدل دریافت شد.');
    return { content, model: json.model ?? model };
  } catch (e) {
    if (e instanceof AiError) throw e;
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new AiError('timeout', 'درخواست به دلیل Timeout یا لغو متوقف شد.');
    }
    throw new AiError('network', 'خطای شبکه در ارتباط با OpenRouter رخ داد. اتصال اینترنت را بررسی کنید.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }
}

/** آزمایش اتصال به OpenRouter با یک درخواست سبک. */
export async function testConnection(apiKey: string, model: string): Promise<{ ok: boolean; message: string }> {
  try {
    await chatCompletion(apiKey, model, [{ role: 'user', content: 'Reply with the single word: OK' }]);
    return { ok: true, message: 'اتصال موفق بود.' };
  } catch (e) {
    return { ok: false, message: e instanceof AiError ? e.message : 'خطای نامشخص' };
  }
}
