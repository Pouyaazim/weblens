/**
 * موتور Recommendation — تبدیل یافته‌های تحلیل به پیشنهادهای عملی و اولویت‌بندی‌شده.
 * هر پیشنهاد بر اساس شواهد واقعی صفحه ایجاد می‌شود.
 */
import type { CheckResult, Recommendation, Severity } from '@/types/analysis';
import { SEVERITY_ORDER } from '@/constants/severities';
import { generateId } from '@/utils/id';

const IMPACT_FA: Record<Severity, string> = {
  critical: 'می‌تواند به‌طور جدی روی دیده‌شدن صفحه در نتایج جست‌وجو اثر بگذارد.',
  high: 'اثر قابل توجهی بر کیفیت و دیده‌شدن صفحه دارد.',
  medium: 'بهبود آن کیفیت کلی صفحه را بالا می‌برد.',
  low: 'اثر محدودی دارد اما بهبود آن توصیه می‌شود.',
  info: 'اطلاع‌رسانی است و اقدام فوری لازم ندارد.',
};

export function buildRecommendations(checks: CheckResult[]): Recommendation[] {
  const relevant = checks.filter((c) => c.status === 'fail' || c.status === 'warning');
  const recs: Recommendation[] = relevant.map((c) => ({
    id: generateId('rec'),
    title: c.title,
    category: c.category,
    severity: c.severity,
    evidence: c.evidence,
    problem: c.description,
    impact: IMPACT_FA[c.severity],
    action: c.recommendation,
    source: 'rule' as const,
    status: 'pending' as const,
  }));
  return recs.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
}

/** خلاصه شمارشی نتایج برای داشبورد. */
export function summarizeChecks(checks: CheckResult[]) {
  const count = (sev: Severity) => checks.filter((c) => c.severity === sev && (c.status === 'fail' || c.status === 'warning')).length;
  return {
    critical: count('critical'),
    high: count('high'),
    medium: count('medium'),
    low: count('low'),
    info: count('info'),
    passed: checks.filter((c) => c.status === 'pass').length,
    failed: checks.filter((c) => c.status === 'fail').length,
    warnings: checks.filter((c) => c.status === 'warning').length,
    notApplicable: checks.filter((c) => c.status === 'not-applicable').length,
  };
}
