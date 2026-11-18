/**
 * بررسی‌های دسته Metadata — زیرمجموعه‌ای از بررسی‌های فنی که امتیاز Metadata را می‌سازد.
 * این بررسی‌ها از همان داده‌های استخراج‌شده استفاده می‌کنند تا امتیاز مستقل Metadata محاسبه شود.
 */
import type { PageData } from '@/types/page';
import type { CheckResult } from '@/types/analysis';
import { runTechnicalSeoChecks } from './engine';

const METADATA_IDS = new Set([
  'seo.title.exists', 'seo.title.length',
  'seo.meta.description',
  'seo.canonical', 'seo.robots',
  'seo.open-graph', 'seo.twitter-card',
]);

/** استخراج بررسی‌های مربوط به Metadata از نتایج Technical SEO. */
export function extractMetadataChecks(page: PageData): CheckResult[] {
  return runTechnicalSeoChecks(page)
    .filter((c) => METADATA_IDS.has(c.id))
    .map((c) => ({ ...c, category: 'metadata' as const }));
}
