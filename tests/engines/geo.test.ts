import { describe, it, expect } from 'vitest';
import { runGeoChecks } from '@/engines/geo/engine';
import { makePage } from '../helpers';

describe('GEO Intelligence Engine', () => {
  it('صفحه سالم بررسی‌های GEO را قبول می‌کند', () => {
    const checks = runGeoChecks(makePage());
    expect(checks.find((c) => c.id === 'geo.structured-data')?.status).toBe('pass');
    expect(checks.find((c) => c.id === 'geo.author')?.status).toBe('pass');
  });

  it('نبود داده ساختاریافته را هشدار می‌دهد', () => {
    const checks = runGeoChecks(makePage({ jsonLd: [] }));
    expect(checks.find((c) => c.id === 'geo.structured-data')?.status).toBe('warning');
  });

  it('نبود نویسنده را هشدار می‌دهد', () => {
    const checks = runGeoChecks(makePage({ author: null, jsonLd: [{ raw: '{}', parsed: {}, parseError: null, types: ['Article'] }] }));
    expect(checks.find((c) => c.id === 'geo.author')?.status).toBe('warning');
  });

  it('ساختار پرسش و پاسخ را شناسایی می‌کند', () => {
    const page = makePage({
      visibleText: 'سئو چیست؟ سئو بهینه‌سازی است. چرا سئو مهم است؟ چون ترافیک افزایش می‌یابد.',
      jsonLd: [{ raw: '{}', parsed: {}, parseError: null, types: ['FAQPage'] }],
    });
    const checks = runGeoChecks(page);
    expect(checks.find((c) => c.id === 'geo.qa-structure')?.status).toBe('pass');
  });

  it('پاسخ مستقیم در ابتدای صفحه را شناسایی می‌کند', () => {
    const page = makePage({
      paragraphs: [{ text: 'سئو بهینه‌سازی وب‌سایت برای موتورهای جست‌وجو است و به شما کمک می‌کند در نتایج بهتر دیده شوید و ترافیک بیشتری بگیرید.', wordCount: 20 }],
    });
    const checks = runGeoChecks(page);
    expect(checks.find((c) => c.id === 'geo.direct-answer')?.status).toBe('pass');
  });
});
