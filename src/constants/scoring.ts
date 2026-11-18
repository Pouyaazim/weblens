/**
 * وزن دسته‌ها در امتیاز کلی صفحه.
 * مستندات کامل: SCORING_METHODOLOGY.md
 */
export const CATEGORY_WEIGHTS = {
  'technical-seo': 0.4,
  content: 0.3,
  geo: 0.2,
  metadata: 0.1,
} as const;

/** حداقل امتیاز برای وضعیت «موفق» در هر بررسی. */
export const PASS_THRESHOLD = 0.5;
