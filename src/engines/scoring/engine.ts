/**
 * موتور Scoring — سیستم امتیازدهی قابل توضیح و مستند.
 * - امتیازها از معیارهای مشخص محاسبه می‌شوند، نه تصادفی.
 * - موارد «قابل ارزیابی نیست» (not-applicable) در امتیاز لحاظ نمی‌شوند.
 * - وزن معیارها قابل تنظیم و مستند است (SCORING_METHODOLOGY.md).
 */
import type { CheckResult, CategoryScore, PageScores, Category } from '@/types/analysis';
import { CATEGORY_WEIGHTS } from '@/constants/scoring';

/** امتیاز هر بررسی بر اساس وضعیت آن. */
export function checkScore(status: CheckResult['status']): number {
  switch (status) {
    case 'pass': return 1;
    case 'warning': return 0.5;
    case 'fail': return 0;
    case 'not-applicable': return 1; // در محاسبه لحاظ نمی‌شود
  }
}

export function scoreCategory(checks: CheckResult[]): CategoryScore {
  const applicable = checks.filter((c) => c.status !== 'not-applicable');
  const totalWeight = applicable.reduce((s, c) => s + c.weight, 0);
  const earned = applicable.reduce((s, c) => s + checkScore(c.status) * c.weight, 0);
  const score = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 100;
  return {
    category: applicable[0]?.category ?? 'technical-seo',
    score,
    breakdown: applicable.map((c) => ({
      checkId: c.id,
      title: c.title,
      weight: c.weight,
      earned: Math.round(checkScore(c.status) * c.weight * 100) / 100,
      status: c.status,
    })),
  };
}

export function computeScores(checks: CheckResult[]): PageScores {
  const byCategory = (cat: Category) => scoreCategory(checks.filter((c) => c.category === cat));
  const technical = byCategory('technical-seo');
  const content = byCategory('content');
  const geo = byCategory('geo');
  const metadata = byCategory('metadata');
  const overall = Math.round(
    technical.score * CATEGORY_WEIGHTS['technical-seo'] +
    content.score * CATEGORY_WEIGHTS.content +
    geo.score * CATEGORY_WEIGHTS.geo +
    metadata.score * CATEGORY_WEIGHTS.metadata,
  );
  return {
    technicalSeo: technical.score,
    contentQuality: content.score,
    geoReadiness: geo.score,
    metadata: metadata.score,
    overall,
    categories: [technical, content, geo, metadata],
  };
}

/** توضیح متنی نحوه محاسبه امتیاز برای نمایش در UI. */
export function explainScore(category: CategoryScore): string {
  const totalWeight = category.breakdown.reduce((s, b) => s + b.weight, 0);
  const passed = category.breakdown.filter((b) => b.status === 'pass').length;
  const failed = category.breakdown.filter((b) => b.status === 'fail').length;
  const warnings = category.breakdown.filter((b) => b.status === 'warning').length;
  return `از ${category.breakdown.length} بررسی (وزن کل ${totalWeight}): ${passed} موفق، ${warnings} هشدار، ${failed} ناموفق. امتیاز = مجموع (امتیاز بررسی × وزن) ÷ وزن کل × ۱۰۰.`;
}
