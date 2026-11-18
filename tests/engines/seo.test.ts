import { describe, it, expect } from 'vitest';
import { runTechnicalSeoChecks } from '@/engines/seo/engine';
import { makePage } from '../helpers';

describe('Technical SEO Engine', () => {
  it('صفحه سالم همه بررسی‌های اصلی را قبول می‌کند', () => {
    const checks = runTechnicalSeoChecks(makePage());
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]));
    expect(byId['seo.title.length']?.status).toBe('pass');
    expect(byId['seo.meta.description']?.status).toBe('pass');
    expect(byId['seo.heading.h1.exists']?.status).toBe('pass');
    expect(byId['seo.viewport']?.status).toBe('pass');
    expect(byId['seo.lang']?.status).toBe('pass');
    expect(byId['seo.https']?.status).toBe('pass');
  });

  it('عنوان خالی را به‌عنوان مشکل بحرانی گزارش می‌کند', () => {
    const checks = runTechnicalSeoChecks(makePage({ title: '' }));
    const title = checks.find((c) => c.id === 'seo.title.exists');
    expect(title?.status).toBe('fail');
    expect(title?.severity).toBe('critical');
    expect(title?.evidence.length).toBeGreaterThan(0);
  });

  it('عنوان بیش از حد طولانی را هشدار می‌دهد', () => {
    const checks = runTechnicalSeoChecks(makePage({ title: 'عنوان بسیار طولانی که بیش از هفتاد نویسه دارد و در نتایج جست‌وجو بریده خواهد شد قطعاً و این عنوان خیلی طولانی است' }));
    expect(checks.find((c) => c.id === 'seo.title.length')?.status).toBe('warning');
  });

  it('نبود H1 را شناسایی می‌کند', () => {
    const checks = runTechnicalSeoChecks(makePage({ headings: [{ level: 2, text: 'فقط H2' }] }));
    expect(checks.find((c) => c.id === 'seo.heading.h1.exists')?.status).toBe('fail');
  });

  it('چند H1 را هشدار می‌دهد', () => {
    const checks = runTechnicalSeoChecks(makePage({ headings: [
      { level: 1, text: 'اول' }, { level: 1, text: 'دوم' },
    ] }));
    expect(checks.find((c) => c.id === 'seo.heading.h1.count')?.status).toBe('warning');
  });

  it('پرش سطح هدینگ را شناسایی می‌کند', () => {
    const checks = runTechnicalSeoChecks(makePage({ headings: [
      { level: 1, text: 'عنوان' }, { level: 3, text: 'پرش' },
    ] }));
    expect(checks.find((c) => c.id === 'seo.heading.structure')?.status).toBe('warning');
  });

  it('تصویر بدون Alt را خطا گزارش می‌کند', () => {
    const checks = runTechnicalSeoChecks(makePage({ images: [{ src: 'x.jpg', alt: null, width: 100, height: 100 }] }));
    expect(checks.find((c) => c.id === 'seo.images.alt')?.status).toBe('fail');
  });

  it('JSON-LD نامعتبر را خطا گزارش می‌کند', () => {
    const checks = runTechnicalSeoChecks(makePage({ jsonLd: [{ raw: '{bad', parsed: null, parseError: 'Unexpected token', types: [] }] }));
    expect(checks.find((c) => c.id === 'seo.schema.valid')?.status).toBe('fail');
  });

  it('نبود Schema را هشدار می‌دهد', () => {
    const checks = runTechnicalSeoChecks(makePage({ jsonLd: [] }));
    expect(checks.find((c) => c.id === 'seo.schema.exists')?.status).toBe('warning');
  });

  it('noindex را هشدار می‌دهد', () => {
    const checks = runTechnicalSeoChecks(makePage({ robotsMeta: 'noindex' }));
    expect(checks.find((c) => c.id === 'seo.robots')?.status).toBe('warning');
  });

  it('نبود viewport را خطا گزارش می‌کند', () => {
    const checks = runTechnicalSeoChecks(makePage({ viewport: null }));
    expect(checks.find((c) => c.id === 'seo.viewport')?.status).toBe('fail');
  });

  it('صفحه بدون تصویر را قابل ارزیابی نیست اعلام می‌کند', () => {
    const checks = runTechnicalSeoChecks(makePage({ images: [] }));
    expect(checks.find((c) => c.id === 'seo.images.alt')?.status).toBe('not-applicable');
  });
});
