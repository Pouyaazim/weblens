import type { CheckStatus, Severity } from '@/types/analysis';
import { SEVERITY_LABELS_FA } from '@/constants/severities';

const STATUS_FA: Record<CheckStatus, string> = {
  pass: 'موفق',
  fail: 'مشکل',
  warning: 'بررسی',
  'not-applicable': 'نامرتبط',
};

const STATUS_COLORS: Record<CheckStatus, string> = {
  pass: 'bg-teal/15 text-teal-deep dark:bg-teal/20 dark:text-sea',
  fail: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  'not-applicable': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  low: 'bg-teal/15 text-teal-deep dark:bg-teal/20 dark:text-sea',
  info: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export function StatusBadge({ status }: { status: CheckStatus }) {
  return <span className={`inline-block rounded-lg px-2 py-0.5 text-[11px] font-bold ${STATUS_COLORS[status]}`}>{STATUS_FA[status]}</span>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`inline-block rounded-lg px-2 py-0.5 text-[11px] font-bold ${SEVERITY_COLORS[severity]}`}>{SEVERITY_LABELS_FA[severity]}</span>;
}
