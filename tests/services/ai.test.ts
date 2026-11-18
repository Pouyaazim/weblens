import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AI_RESPONSE_SCHEMAS } from '@/services/ai/schemas';
import { runAiRequest } from '@/services/ai/client';
import { AiError, type AiSettings } from '@/types/ai';

const SETTINGS: AiSettings = {
  enabled: true,
  apiKey: 'test-key',
  model: 'test/model',
  fallbackModel: '',
  language: 'fa',
};

describe('AI Response Validation', () => {
  it('خروجی معتبر Meta Title را قبول می‌کند', () => {
    const schema = AI_RESPONSE_SCHEMAS['meta-title'];
    const ok = schema.safeParse({ suggestions: [{ title: 'عنوان', reason: 'دلیل' }] });
    expect(ok.success).toBe(true);
  });

  it('خروجی نامعتبر را رد می‌کند', () => {
    const schema = AI_RESPONSE_SCHEMAS['meta-title'];
    expect(schema.safeParse({ wrong: true }).success).toBe(false);
    expect(schema.safeParse({ suggestions: [] }).success).toBe(false);
  });

  it('اسکیمای FAQ را اعتبارسنجی می‌کند', () => {
    const schema = AI_RESPONSE_SCHEMAS['faq'];
    expect(schema.safeParse({ questions: [{ question: 'چرا؟', answer: 'چون.' }] }).success).toBe(true);
  });
});

describe('AI Client', () => {
  beforeEach(() => { vi.unstubAllGlobals(); });

  function mockResponse(status: number, body: unknown) {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    };
  }

  function mockFetch(handler: (url: string, init?: RequestInit) => unknown) {
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => handler(url, init)));
  }

  it('بدون کلید API خطای مشخص برمی‌گرداند', async () => {
    await expect(runAiRequest({ ...SETTINGS, apiKey: '' }, { task: 'faq', payload: {} }))
      .rejects.toMatchObject({ code: 'missing-key' });
  });

  it('در صورت غیرفعال بودن AI خطا برمی‌گرداند', async () => {
    await expect(runAiRequest({ ...SETTINGS, enabled: false }, { task: 'faq', payload: {} }))
      .rejects.toMatchObject({ code: 'missing-key' });
  });

  it('پاسخ موفق را با اسکیما اعتبارسنجی می‌کند', async () => {
    mockFetch(() => mockResponse(200, {
      choices: [{ message: { content: JSON.stringify({ questions: [{ question: 'چرا؟', answer: 'چون.' }] }) } }],
      model: 'test/model',
    }));
    const res = await runAiRequest(SETTINGS, { task: 'faq', payload: { 'متن': 'محتوا' } });
    expect(res.structured).not.toBeNull();
    expect(res.model).toBe('test/model');
  });

  it('خروجی نامعتبر برنامه را خراب نمی‌کند', async () => {
    mockFetch(() => mockResponse(200, {
      choices: [{ message: { content: 'این JSON نیست' } }],
    }));
    const res = await runAiRequest(SETTINGS, { task: 'faq', payload: {} });
    expect(res.structured).toBeNull();
    expect(res.content).toBe('این JSON نیست');
  });

  it('خطای 401 را به‌عنوان کلید نامعتبر گزارش می‌کند', async () => {
    mockFetch(() => mockResponse(401, 'unauthorized'));
    await expect(runAiRequest(SETTINGS, { task: 'faq', payload: {} }))
      .rejects.toMatchObject({ code: 'invalid-key' });
  });

  it('خطای 429 را به‌عنوان Rate Limit گزارش می‌کند', async () => {
    mockFetch(() => mockResponse(429, 'rate limited'));
    await expect(runAiRequest(SETTINGS, { task: 'faq', payload: {} }))
      .rejects.toMatchObject({ code: 'rate-limit' });
  });

  it('خطای 404 را به‌عنوان مدل ناموجود گزارش می‌کند', async () => {
    mockFetch(() => mockResponse(404, 'not found'));
    await expect(runAiRequest(SETTINGS, { task: 'faq', payload: {} }))
      .rejects.toMatchObject({ code: 'model-not-found' });
  });

  it('در صورت شکست مدل اصلی از مدل جایگزین استفاده می‌کند', async () => {
    let calls = 0;
    mockFetch((_url, init) => {
      calls++;
      const body = JSON.parse(String(init?.body ?? '{}')) as { model?: string };
      if (body.model === 'test/model') return mockResponse(404, 'not found');
      return mockResponse(200, {
        choices: [{ message: { content: JSON.stringify({ questions: [{ question: 'چرا؟', answer: 'چون.' }] }) } }],
        model: body.model,
      });
    });
    const res = await runAiRequest({ ...SETTINGS, fallbackModel: 'fallback/model' }, { task: 'faq', payload: {} });
    expect(calls).toBe(2);
    expect(res.model).toBe('fallback/model');
  });

  it('خطای شبکه را مدیریت می‌کند', async () => {
    mockFetch(() => { throw new TypeError('Failed to fetch'); });
    await expect(runAiRequest(SETTINGS, { task: 'faq', payload: {} }))
      .rejects.toMatchObject({ code: 'network' });
  });

  it('AiError پیام فارسی دارد', () => {
    const err = new AiError('rate-limit', 'محدودیت نرخ');
    expect(err.message).toBe('محدودیت نرخ');
    expect(err.code).toBe('rate-limit');
  });
});
