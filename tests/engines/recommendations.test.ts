import { describe, it, expect } from 'vitest';
import { summarizeChecks } from '@/engines/recommendations/engine';
import { analyzePage } from '@/services/analysis-service';
import { makePage } from '../helpers';

describe('Recommendation Engine', () => {
  it('پیشنهادها بر اساس شواهد واقعی ساخته می‌شوند', () => {
    const result = analyzePage(makePage({ title: '' }));
    const rec = result.recommendations.find((r) => r.title.includes('عنوان'));
    expect(rec).toBeDefined();
    expect(rec?.evidence.length).toBeGreaterThan(0);
    expect(rec?.action.length).toBeGreaterThan(0);
    expect(rec?.source).toBe('rule');
  });

  it('پیشنهادها بر اساس شدت مرتب می‌شوند', () => {
    const result = analyzePage(makePage({ title: '', metaDescription: '', viewport: null, headings: [] }));
    const order = ['critical', 'high', 'medium', 'low', 'info'];
    const idx = result.recommendations.map((r) => order.indexOf(r.severity));
    const sorted = [...idx].sort((a, b) => a - b);
    expect(idx).toEqual(sorted);
  });

  it('خلاصه شمارشی درست محاسبه می‌شود', () => {
    const result = analyzePage(makePage());
    const s = summarizeChecks(result.checks);
    expect(s.passed + s.failed + s.warnings + s.notApplicable).toBe(result.checks.length);
  });
});
