import type { AnalysisResult } from './analysis';

/** گزارش ذخیره‌شده در IndexedDB. */
export interface StoredReport {
  id: string;
  url: string;
  title: string;
  analyzedAt: string;
  overallScore: number;
  result: AnalysisResult;
}

export interface ReportFilter {
  query?: string;
  minScore?: number;
  maxScore?: number;
  from?: string;
  to?: string;
}
