/**
 * مدیر درخواست‌های AI — Model Router + Response Validator.
 * - در صورت شکست مدل اصلی، از مدل جایگزین استفاده می‌شود.
 * - خروجی با Zod اعتبارسنجی می‌شود؛ خروجی نامعتبر برنامه را خراب نمی‌کند.
 */
import type { AiRequest, AiResult, AiSettings } from '@/types/ai';
import { AiError } from '@/types/ai';
import { chatCompletion } from './openrouter';
import { buildMessages } from './prompts';
import { AI_RESPONSE_SCHEMAS } from './schemas';
import { truncate } from '@/utils/text';

function extractJson(content: string): string {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return content;
  return content.slice(start, end + 1);
}

async function runWithModel(settings: AiSettings, req: AiRequest, model: string, contextLimit: number, signal?: AbortSignal): Promise<AiResult> {
  const payload: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.payload)) payload[k] = truncate(v, contextLimit);
  const messages = buildMessages(req.task, payload, settings.language);
  const { content } = await chatCompletion(settings.apiKey, model, messages, signal);
  const schema = AI_RESPONSE_SCHEMAS[req.task];
  let structured: unknown = null;
  try {
    structured = schema.parse(JSON.parse(extractJson(content)));
  } catch {
    // خروجی نامعتبر: پاسخ خام برگردانده می‌شود و برنامه خراب نمی‌شود.
    structured = null;
  }
  return { task: req.task, model, content, structured, createdAt: new Date().toISOString() };
}

/** اجرای درخواست AI با پشتیبانی از مدل جایگزین. */
export async function runAiRequest(
  settings: AiSettings,
  req: AiRequest,
  contextLimit = 6000,
  signal?: AbortSignal,
): Promise<AiResult> {
  if (!settings.enabled) throw new AiError('missing-key', 'هوش مصنوعی در تنظیمات فعال نیست.');
  if (!settings.apiKey) throw new AiError('missing-key', 'کلید API تنظیم نشده است.');
  try {
    return await runWithModel(settings, req, settings.model, contextLimit, signal);
  } catch (e) {
    const err = e instanceof AiError ? e : new AiError('unknown', 'خطای نامشخص');
    const canFallback = settings.fallbackModel && settings.fallbackModel !== settings.model
      && (err.code === 'model-not-found' || err.code === 'rate-limit' || err.code === 'unknown');
    if (canFallback) {
      return runWithModel(settings, req, settings.fallbackModel, contextLimit, signal);
    }
    throw err;
  }
}
