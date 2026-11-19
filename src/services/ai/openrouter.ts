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

/** پاک‌سازی کلید کپی‌شده از داشبورد (فاصله، کوتیشن، کاراکترهای نامرئی). */
export function normalizeApiKey(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .replace(/\s+/g, '');
}

function buildHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://pouyaazim.github.io/weblens/',
    'X-Title': 'WebLens',
  };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: { message?: string } | string; message?: string };
    if (typeof data.error === 'string') return data.error;
    if (data.error && typeof data.error === 'object' && data.error.message) return data.error.message;
    if (typeof data.message === 'string') return data.message;
  } catch {
    /* ignore */
  }
  return '';
}

function mapHttpError(status: number, detail: string, model: string): AiError {
  const lower = detail.toLowerCase();
  if (status === 401) {
    return new AiError(
      'invalid-key',
      detail
        ? `کلید API پذیرفته نشد: ${detail.slice(0, 180)}`
        : 'کلید API معتبر نیست. کلید OpenRouter باید با sk-or- شروع شود.',
    );
  }
  if (status === 402) {
    return new AiError('unknown', 'اعتبار OpenRouter کافی نیست. در حساب OpenRouter اعتبار اضافه کنید.');
  }
  if (status === 403) {
    return new AiError(
      'unknown',
      detail
        ? `درخواست رد شد (۴۰۳): ${detail.slice(0, 180)}`
        : 'دسترسی به این مدل یا درخواست مسدود شده است.',
    );
  }
  if (status === 429) {
    return new AiError('rate-limit', 'محدودیت نرخ OpenRouter فعال است. کمی صبر کنید و دوباره تلاش کنید.');
  }
  if (status === 404 || lower.includes('not found') || lower.includes('no endpoints')) {
    return new AiError('model-not-found', `مدل «${model}» یافت نشد یا در دسترس نیست. مدل دیگری انتخاب کنید.`);
  }
  return new AiError('unknown', `خطای OpenRouter (${status})${detail ? `: ${detail.slice(0, 180)}` : ''}`);
}

export async function chatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
  options?: { jsonMode?: boolean },
): Promise<ChatCompletionResult> {
  const key = normalizeApiKey(apiKey);
  if (!key) {
    throw new AiError('missing-key', 'کلید API تنظیم نشده است. در بخش تنظیمات، کلید OpenRouter خود را وارد کنید.');
  }
  if (!key.startsWith('sk-or-')) {
    throw new AiError(
      'invalid-key',
      'این کلید مربوط به OpenRouter نیست. کلید باید با sk-or- شروع شود (نه کلید OpenAI یا Anthropic).',
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.4,
  };
  // jsonMode فقط وقتی صریحاً لازم باشد؛ خیلی از مدل‌های رایگان آن را پشتیبانی نمی‌کنند
  if (options?.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: buildHeaders(key),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await readErrorMessage(res);
      throw mapHttpError(res.status, detail, model);
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

/** آزمایش اتصال به OpenRouter با یک درخواست سبک (بدون اجبار JSON). */
export async function testConnection(apiKey: string, model: string): Promise<{ ok: boolean; message: string }> {
  try {
    const key = normalizeApiKey(apiKey);
    if (!key) return { ok: false, message: 'کلید API خالی است.' };
    if (!key.startsWith('sk-or-')) {
      return { ok: false, message: 'کلید باید OpenRouter باشد و با sk-or- شروع شود.' };
    }
    const result = await chatCompletion(
      key,
      model,
      [
        { role: 'system', content: 'Reply with exactly: OK' },
        { role: 'user', content: 'ping' },
      ],
      undefined,
      { jsonMode: false },
    );
    return { ok: true, message: `اتصال موفق بود (${result.model}).` };
  } catch (e) {
    return { ok: false, message: e instanceof AiError ? e.message : 'خطای نامشخص' };
  }
}
