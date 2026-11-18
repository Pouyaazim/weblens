import { describe, it, expect } from 'vitest';
import { scoreCategory, checkScore } from '@/engines/scoring/engine';
import { analyzePage } from '@/services/analysis-service';
import { makePage } from '../helpers';
import type { CheckResult } from '@/types/analysis';

function makeCheck(partial: Partial<CheckResult> & Pick<CheckResult, 'id' | 'status'>): CheckResult {
  return { category: 'technical-seo', title: partial.id, description: '', severity: 'info', evidence: [], recommendation: '', weight: 1, ...partial };
}

describe('Scoring Engine', () => {
  it('امتیاز بررسی‌ها بر اساس وضعیت محاسبه می‌شود', () => {
    expect(checkScore('pass')).toBe(1);
    expect(checkScore('warning')).toBe(0.5);
    expect(checkScore('fail')).toBe(0);
  });

  it('موارد قابل ارزیابی نیست در امتیاز لحاظ نمی‌شوند', () => {
    const checks = [
      makeCheck({ id: 'a', status: 'pass', weight: 1 }),
      makeCheck({ id: 'b', status: 'not-applicable', weight: 10 }),
    ];
    expect(scoreCategory(checks).score).toBe(100);
  });

  it('وزن معیارها در امتیاز اثر می‌گذارد', () => {
    const checks = [
      makeCheck({ id: 'a', status: 'pass', weight: 3 }),
      makeCheck({ id: 'b', status: 'fail', weight: 1 }),
    ];
    // (3*1 + 1*0) / 4 = 75
    expect(scoreCategory(checks).score).toBe(75);
  });

  it('امتیاز کلی از وزن دسته‌ها محاسبه می‌شود', () => {
    const result = analyzePage(makePage());
    expect(result.scores.overall).toBeGreaterThanOrEqual(0);
    expect(result.scores.overall).toBeLessThanOrEqual(100);
    expect(result.scores.technicalSeo).toBeGreaterThan(50);
  });

  it('صفحه خراب امتیاز پایین‌تری از صفحه سالم دارد', () => {
    const good = analyzePage(makePage());
    const bad = analyzePage(makePage({ title: '', metaDescription: '', headings: [], images: [{ src: 'x.jpg', alt: null, width: null, height: null }], viewport: null, lang: '', jsonLd: [] }));
    expect(bad.scores.overall).toBeLessThan(good.scores.overall);
  });

  it('امتیازها تصادفی نیستند (تکرارپذیر)', () => {
    const a = analyzePage(makePage());
    const b = analyzePage(makePage());
    expect(a.scores).toEqual(b.scores);
  });
});
