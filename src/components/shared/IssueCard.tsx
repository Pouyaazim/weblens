import { useState } from 'react';
import type { CheckResult } from '@/types/analysis';
import { StatusBadge, SeverityBadge } from './Badges';
import { Button } from '../ui/Button';

/** کارت نمایش یک بررسی با شواهد و پیشنهاد اصلاح. */
export function IssueCard({ check, onExplain }: { check: CheckResult; onExplain?: (check: CheckResult) => void }) {
  const [open, setOpen] = useState(check.status === 'fail');
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <button
        className="flex w-full items-center justify-between gap-2 p-3 text-right"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <StatusBadge status={check.status} />
          <span className="font-medium">{check.title}</span>
        </span>
        <span className="flex items-center gap-2">
          <SeverityBadge severity={check.severity} />
          <span className="text-slate-400">{open ? '▴' : '▾'}</span>
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-slate-100 p-3 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">{check.description}</p>
          {check.evidence.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500">شواهد:</h4>
              <ul className="list-disc pr-5 text-sm">
                {check.evidence.map((e, i) => <li key={i} className="mono ltr break-all text-left">{e}</li>)}
              </ul>
            </div>
          )}
          <div className="rounded-lg bg-sky-50 p-2 dark:bg-sky-900/30">
            <h4 className="text-xs font-bold text-sky-700 dark:text-sky-300">پیشنهاد اصلاح:</h4>
            <p className="text-sm">{check.recommendation}</p>
          </div>
          {onExplain && check.status !== 'pass' && (
            <Button variant="ghost" className="text-xs" onClick={() => onExplain(check)}>توضیح با هوش مصنوعی</Button>
          )}
        </div>
      )}
    </div>
  );
}
