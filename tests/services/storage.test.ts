import { describe, it, expect, beforeEach } from 'vitest';
import { saveReport, listReports, getReport, deleteReport, clearReports, countReports } from '@/services/storage/reports';
import { analyzePage } from '@/services/analysis-service';
import { makePage } from '../helpers';

describe('Reports Storage (IndexedDB)', () => {
  beforeEach(async () => { await clearReports(); });

  it('گزارش را ذخیره و بازیابی می‌کند', async () => {
    const result = analyzePage(makePage());
    const saved = await saveReport(result);
    expect(saved.id).toBe(result.id);
    const fetched = await getReport(result.id);
    expect(fetched?.url).toBe('https://example.com/page');
    expect(fetched?.overallScore).toBe(result.scores.overall);
  });

  it('فهرست گزارش‌ها را جدیدترین اول برمی‌گرداند', async () => {
    await saveReport(analyzePage(makePage({ url: 'https://a.com/1' })));
    await saveReport(analyzePage(makePage({ url: 'https://b.com/2' })));
    const list = await listReports();
    expect(list).toHaveLength(2);
    expect(list[0]?.url).toBe('https://b.com/2');
  });

  it('جست‌وجو در گزارش‌ها کار می‌کند', async () => {
    await saveReport(analyzePage(makePage({ url: 'https://example.com/seo-guide' })));
    await saveReport(analyzePage(makePage({ url: 'https://other.com/page' })));
    const found = await listReports({ query: 'seo-guide' });
    expect(found).toHaveLength(1);
  });

  it('فیلتر حداقل امتیاز کار می‌کند', async () => {
    await saveReport(analyzePage(makePage({ title: '', metaDescription: '', headings: [], viewport: null })));
    await saveReport(analyzePage(makePage()));
    const high = await listReports({ minScore: 80 });
    expect(high.every((r) => r.overallScore >= 80)).toBe(true);
  });

  it('حذف گزارش کار می‌کند', async () => {
    const saved = await saveReport(analyzePage(makePage()));
    await deleteReport(saved.id);
    expect(await getReport(saved.id)).toBeUndefined();
  });

  it('پاک‌سازی کامل تاریخچه کار می‌کند', async () => {
    await saveReport(analyzePage(makePage()));
    await clearReports();
    expect(await countReports()).toBe(0);
  });
});
