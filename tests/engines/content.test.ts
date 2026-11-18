import { describe, it, expect } from 'vitest';
import { runContentChecks } from '@/engines/content/engine';
import { makePage } from '../helpers';

describe('Content Intelligence Engine', () => {
  it('صفحه سالم بررسی‌های محتوا را قبول می‌کند', () => {
    const checks = runContentChecks(makePage());
    expect(checks.find((c) => c.id === 'content.word-count')?.status).toBe('pass');
    expect(checks.find((c) => c.id === 'content.paragraphs')?.status).toBe('pass');
  });

  it('حجم کم محتوا را بی‌کیفیت اعلام نمی‌کند (فقط هشدار ملایم)', () => {
    const checks = runContentChecks(makePage({ wordCount: 20, visibleText: 'متن کوتاه', paragraphs: [] }));
    const wc = checks.find((c) => c.id === 'content.word-count');
    expect(wc?.status).toBe('warning');
    expect(wc?.severity).toBe('low');
  });

  it('تکرار جمله را شناسایی می‌کند', () => {
    const sentence = 'این جمله سه بار تکرار شده است و باید شناسایی شود.';
    const text = [sentence, sentence, sentence].join(' ');
    const checks = runContentChecks(makePage({ visibleText: text }));
    expect(checks.find((c) => c.id === 'content.repetition')?.status).toBe('warning');
  });

  it('حروف عربی در متن فارسی را هشدار می‌دهد', () => {
    const checks = runContentChecks(makePage({ visibleText: 'اين متن با حروف عربي نوشته شده است و كلمات آن يكي يكي آمده اند', wordCount: 200 }));
    expect(checks.find((c) => c.id === 'content.persian-quality')?.status).toBe('warning');
  });

  it('متن انگلیسی را قابل ارزیابی نیست اعلام می‌کند', () => {
    const checks = runContentChecks(makePage({ visibleText: 'This is an English text about SEO optimization techniques and best practices for websites.', wordCount: 100 }));
    expect(checks.find((c) => c.id === 'content.persian-quality')?.status).toBe('not-applicable');
  });

  it('نبود H2 در صفحه طولانی را هشدار می‌دهد', () => {
    const checks = runContentChecks(makePage({ wordCount: 800, headings: [{ level: 1, text: 'عنوان' }] }));
    expect(checks.find((c) => c.id === 'content.heading-coverage')?.status).toBe('warning');
  });
});
