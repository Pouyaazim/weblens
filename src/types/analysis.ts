/**
 * تایپ‌های موتورهای تحلیل، امتیازدهی و پیشنهادها.
 */
import type { PageData } from './page';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type CheckStatus = 'pass' | 'fail' | 'warning' | 'not-applicable';

export type Category = 'technical-seo' | 'content' | 'geo' | 'metadata';

export interface CheckResult {
  /** شناسه پایدار بررسی، مثل `seo.title.length` */
  id: string;
  category: Category;
  title: string;
  description: string;
  status: CheckStatus;
  severity: Severity;
  /** شواهد واقعی از صفحه */
  evidence: string[];
  /** پیشنهاد اصلاح مشخص و عملی */
  recommendation: string;
  /** وزن این بررسی در امتیاز دسته خودش (۰ تا ۱) */
  weight: number;
}

export interface ScoreBreakdown {
  checkId: string;
  title: string;
  weight: number;
  earned: number;
  status: CheckStatus;
}

export interface CategoryScore {
  category: Category;
  score: number; // ۰ تا ۱۰۰
  breakdown: ScoreBreakdown[];
}

export interface PageScores {
  technicalSeo: number;
  contentQuality: number;
  geoReadiness: number;
  metadata: number;
  overall: number;
  categories: CategoryScore[];
}

export interface Recommendation {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  evidence: string[];
  problem: string;
  impact: string;
  action: string;
  source: 'rule' | 'ai';
  status: 'pending' | 'approved' | 'rejected';
}

export interface AnalysisResult {
  id: string;
  url: string;
  title: string;
  analyzedAt: string;
  page: PageData;
  checks: CheckResult[];
  scores: PageScores;
  recommendations: Recommendation[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    passed: number;
    failed: number;
    warnings: number;
    notApplicable: number;
  };
}
