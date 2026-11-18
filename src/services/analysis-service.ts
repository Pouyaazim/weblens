/**
 * سرویس ارکستراسیون تحلیل — اجرای همه موتورها روی داده صفحه و تولید نتیجه نهایی.
 * این سرویس مستقل از UI است و قابل تست است.
 */
import type { PageData } from '@/types/page';
import type { AnalysisResult } from '@/types/analysis';
import { runTechnicalSeoChecks } from '@/engines/seo/engine';
import { extractMetadataChecks } from '@/engines/seo/metadata';
import { runContentChecks } from '@/engines/content/engine';
import { runGeoChecks } from '@/engines/geo/engine';
import { computeScores } from '@/engines/scoring/engine';
import { buildRecommendations, summarizeChecks } from '@/engines/recommendations/engine';
import { generateId } from '@/utils/id';

export function analyzePage(page: PageData): AnalysisResult {
  const checks = [
    ...runTechnicalSeoChecks(page),
    ...runContentChecks(page),
    ...runGeoChecks(page),
    ...extractMetadataChecks(page),
  ];
  const scores = computeScores(checks);
  return {
    id: generateId('analysis'),
    url: page.url,
    title: page.title || page.url,
    analyzedAt: new Date().toISOString(),
    page,
    checks,
    scores,
    recommendations: buildRecommendations(checks),
    summary: summarizeChecks(checks),
  };
}
