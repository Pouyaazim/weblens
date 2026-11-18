import type { CheckStatus, Severity } from '@/types/analysis';
import { SEVERITY_LABELS_FA } from '@/constants/severities';

const STATUS_FA: Record<CheckStatus, string> = {
  pass: 'موفق',
  fail: 'مشکل شناسایی‌شده',
  warning: 'نیازمند بررسی',
  'not-applicable': 'قابل ارزیابی نیست',
};

const STATUS_COLORS: Record<CheckStatus, string> = {
  pass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  fail: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'not-applicable': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  low: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  info: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export function StatusBadge({ status }: { status: CheckStatus }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>{STATUS_FA[status]}</span>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[severity]}`}>{SEVERITY_LABELS_FA[severity]}</span>;
}
