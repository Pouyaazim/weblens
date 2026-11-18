import type { Severity } from '@/types/analysis';

export const SEVERITY_LABELS_FA: Record<Severity, string> = {
  critical: 'بحرانی',
  high: 'بالا',
  medium: 'متوسط',
  low: 'پایین',
  info: 'اطلاع‌رسانی',
};

export const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

/** جریمه هر وضعیت در امتیازدهی (از ۱۰۰ کم می‌شود). */
export const SEVERITY_PENALTY: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 0,
};
